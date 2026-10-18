// Réception des formulaires « Décrire mon projet » et « Prendre rendez-vous » (fonction serveur Vercel).
// Chaque demande est enregistrée dans le back-office, puis une alerte part par email en SMTP depuis
// votre propre boîte (voir src/lib/mailer.ts), avec la fiche JSON en pièce jointe : c'est ce fichier
// que Claude pourra lire pour lancer les recherches. Optionnellement, la fiche est aussi postée
// vers FICHES_WEBHOOK_URL (Google Sheets, Make, Zapier, Notion…) pour être archivée.
//
// Variables d'environnement Vercel :
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO, MAIL_FROM   envoi de l'alerte (voir src/lib/mailer.ts)
//   FICHES_WEBHOOK_URL  facultatif
//   DATABASE_URL        base Postgres du back-office (créée par l'intégration Neon de Vercel)
import type { APIRoute } from 'astro';
import { hasDb, insertClient, rateLimited } from '../../lib/db';
import { clientIp } from '../../lib/auth';
import { cleanAnswers } from '../../lib/sanitize';
import { echeanceRappel, formatEcheance } from '../../lib/delai';
import { envoyerAlerte, smtpConfigured } from '../../lib/mailer';

export const prerender = false;


const MAX_BYTES = 65536;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const LABELS: Record<string, string> = {
  mandat_recherche: 'Nouvelle recherche',
  estimation_vente: "Demande d'estimation",
  rendez_vous: 'Demande de rendez-vous',
};

const json = (status: number, body: object) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

const env = (k: string) => (import.meta.env[k] as string | undefined) ?? process.env[k];
const oneLine = (s: unknown) => String(s ?? '').replace(/[\r\n]+/g, ' ').trim();

/** Texte de l'alerte email : l'échéance de rappel et le lien vers la fiche d'abord, puis le détail. */
function summary(ref: string, f: any, echeance: string, adminUrl: string): string {
  const c = f.client ?? {};
  const lines = [
    `${LABELS[f.type] ?? 'Nouveau formulaire'} (${ref})`, '',
    `À RAPPELER AVANT : ${echeance}`,
    '(24 h hors week-end, du lundi au vendredi de 9 h à 18 h)',
    ...(adminUrl ? ['', `Ouvrir la fiche dans le back-office : ${adminUrl}`] : []),
    '',
    `Client : ${oneLine(`${c.prenom ?? ''} ${c.nom ?? ''}`)}`,
    `Téléphone : ${oneLine(c.telephone)}`,
    `Email : ${oneLine(c.email)}`,
  ];
  if (f.brief_recherche) lines.push('', `Recherche : ${oneLine(f.brief_recherche)}`);
  if (f.bien) {
    lines.push('');
    for (const [k, v] of Object.entries(f.bien)) if (v !== null && v !== '') lines.push(`${k.replace(/_/g, ' ')} : ${oneLine(Array.isArray(v) ? v.join(', ') : v)}`);
  }
  if (f.rendez_vous) lines.push('', `Rendez-vous : ${oneLine(`${f.rendez_vous.type} — ${f.rendez_vous.jour} à ${f.rendez_vous.heure}`)}`);
  if (f.validation?.appel) lines.push('', `Appel de cadrage réservé : ${oneLine(`${f.validation.appel.jour} à ${f.validation.appel.heure}`)}`);
  lines.push('', 'La fiche complète est jointe au format JSON.');
  return lines.join('\n');
}

export const POST: APIRoute = async ({ request }) => {
  const raw = await request.text();
  if (raw.length > MAX_BYTES) return json(413, { ok: false, error: 'Envoi trop volumineux' });
  let data: any;
  try { data = JSON.parse(raw); } catch { return json(400, { ok: false, error: 'Données invalides' }); }

  // Champ piège : rempli par un robot, invisible pour un humain. On répond « ok » sans rien faire.
  if (data?.website) return json(200, { ok: true });

  // Anti-spam : 5 envois max par adresse IP et par tranche de 10 minutes.
  if (hasDb()) {
    try {
      if (await rateLimited('form:' + clientIp(request), 5, 600)) return json(429, { ok: false, error: "Trop d'envois, réessayez dans quelques minutes" });
    } catch (e) { console.error('Limite de fréquence indisponible', e); }
  }

  const { kind, fiche } = data ?? {};
  if (!['projet', 'rdv'].includes(kind) || !fiche || typeof fiche !== 'object') return json(400, { ok: false, error: 'Données invalides' });

  const c = fiche.client ?? {};
  if (!EMAIL_RE.test(String(c.email ?? '')) || String(c.telephone ?? '').replace(/\D/g, '').length < 10 || !String(c.prenom ?? '').trim()) {
    return json(422, { ok: false, error: 'Coordonnées incomplètes' });
  }

  let ref = /^(TCI|RDV)-\d{6}$/.test(String(fiche.reference)) ? String(fiche.reference) : (kind === 'rdv' ? 'RDV-' : 'TCI-') + String(Date.now()).slice(-6);
  let delivered = false;

  // 1) Enregistrement dans le back-office (si la base est configurée).
  let adminUrl = '';
  if (hasDb()) {
    try {
      const type = kind === 'rdv' ? 'rdv' : fiche.type === 'estimation_vente' ? 'vente' : 'achat';
      const reponses = kind === 'rdv' ? { prenom: c.prenom, tel: c.telephone, email: c.email } : cleanAnswers(data.reponses);
      const row = await insertClient({ ref, type, reponses, rdv: kind === 'rdv' ? fiche.rendez_vous ?? null : null });
      ref = row.ref;
      adminUrl = new URL(`/admin/client/${row.id}`, request.url).href;
      delivered = true;
    } catch (e) {
      console.error('Base de données indisponible', e);
    }
  }

  const recu = new Date();
  const echeance = formatEcheance(echeanceRappel(recu));
  const record = { ...fiche, reference: ref, recu_le: recu.toISOString(), a_rappeler_avant: echeanceRappel(recu).toISOString() };
  const body = JSON.stringify(record, null, 2);

  delivered = (await envoyerAlerte({
    subject: `${LABELS[record.type] ?? 'Nouvelle demande'} — ${oneLine(`${c.prenom} ${c.nom ?? ''}`)} — à rappeler avant ${echeance}`,
    text: summary(ref, record, echeance, adminUrl),
    replyTo: c.email,
    attachment: { filename: `${ref}.json`, content: body },
  })) || delivered;

  const hook = env('FICHES_WEBHOOK_URL');
  if (hook) {
    const res = await fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }).catch(() => null);
    delivered ||= !!res?.ok;
  }

  if (!delivered) {
    console.error('Fiche non transmise', ref, smtpConfigured() ? '' : '(réglages SMTP manquants)');
    return json(502, { ok: false, error: 'Envoi impossible' });
  }
  return json(200, { ok: true, reference: ref });
};
