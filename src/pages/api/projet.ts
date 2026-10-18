// Réception des formulaires « Décrire mon projet » et « Prendre rendez-vous » (fonction serveur Vercel).
// Chaque envoi part par email (via Resend) avec la fiche JSON en pièce jointe : c'est ce fichier
// que Claude pourra lire pour lancer les recherches. Optionnellement, la fiche est aussi postée
// vers FICHES_WEBHOOK_URL (Google Sheets, Make, Zapier, Notion…) pour être archivée.
//
// Variables d'environnement Vercel :
//   RESEND_API_KEY      clé API Resend (obligatoire pour l'email)
//   MAIL_TO             destinataire (défaut : contact@libertinvest.fr)
//   MAIL_FROM           expéditeur vérifié dans Resend (ex. « Ton Chasseur Immo <noreply@chasseurimmoroanne.com> »)
//   FICHES_WEBHOOK_URL  facultatif
//   DATABASE_URL        base Postgres du back-office (créée par l'intégration Neon de Vercel)
import type { APIRoute } from 'astro';
import { hasDb, insertClient, rateLimited } from '../../lib/db';
import { clientIp } from '../../lib/auth';
import { cleanAnswers } from '../../lib/sanitize';

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

/** Texte lisible de l'email, à partir de la fiche. */
function summary(ref: string, f: any): string {
  const c = f.client ?? {};
  const lines = [
    `${LABELS[f.type] ?? 'Nouveau formulaire'} (${ref})`, '',
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

  const record = { ...fiche, reference: ref, recu_le: new Date().toISOString() };
  const body = JSON.stringify(record, null, 2);

  const apiKey = env('RESEND_API_KEY');
  if (apiKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env('MAIL_FROM') || 'Ton Chasseur Immo <onboarding@resend.dev>',
        to: [env('MAIL_TO') || 'contact@libertinvest.fr'],
        reply_to: c.email,
        subject: `${LABELS[record.type] ?? 'Nouveau formulaire'} — ${oneLine(`${c.prenom} ${c.nom ?? ''}`)} — ${ref}`,
        text: summary(ref, record) + (adminUrl ? `\nFiche dans le back-office : ${adminUrl}` : ''),
        attachments: [{ filename: `${ref}.json`, content: Buffer.from(body).toString('base64') }],
      }),
    }).catch(() => null);
    delivered ||= !!res?.ok;
    if (!res?.ok) console.error('Resend error', res?.status, await res?.text().catch(() => ''));
  }

  const hook = env('FICHES_WEBHOOK_URL');
  if (hook) {
    const res = await fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }).catch(() => null);
    delivered ||= !!res?.ok;
  }

  if (!delivered) {
    console.error('Fiche non transmise', ref, apiKey ? '' : '(RESEND_API_KEY manquante)');
    return json(502, { ok: false, error: 'Envoi impossible' });
  }
  return json(200, { ok: true, reference: ref });
};
