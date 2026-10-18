// Envoi des alertes par SMTP, directement depuis votre boîte mail (OVH, IONOS, Gmail, Microsoft 365…),
// sans prestataire intermédiaire.
//
// Variables d'environnement Vercel :
//   SMTP_HOST    serveur d'envoi (ex. ssl0.ovh.net, smtp.ionos.fr, smtp.gmail.com, smtp.office365.com)
//   SMTP_PORT    587 (STARTTLS, par défaut) ou 465 (SSL)
//   SMTP_USER    adresse de la boîte qui ENVOIE (ex. site@chasseurimmoroanne.com)
//   SMTP_PASS    mot de passe de cette boîte (ou « mot de passe d'application »)
//   MAIL_TO      boîte qui REÇOIT les alertes, plusieurs possibles séparées par des virgules
//                (défaut : contact@libertinvest.fr, qui ne sert qu'à la réception)
//   MAIL_FROM    facultatif ; par défaut « Ton Chasseur Immo <SMTP_USER> »
import nodemailer from 'nodemailer';

const env = (k: string) => (import.meta.env[k] as string | undefined) ?? process.env[k];

export const smtpConfigured = () => !!(env('SMTP_HOST') && env('SMTP_USER') && env('SMTP_PASS'));

export type Alerte = { subject: string; text: string; replyTo?: string; attachment?: { filename: string; content: string } };

function transport() {
  const port = Number(env('SMTP_PORT') || 587);
  return nodemailer.createTransport({
    host: env('SMTP_HOST'),
    port,
    secure: port === 465,
    requireTLS: port !== 465 && !/^(localhost|127\.0\.0\.1)$/.test(env('SMTP_HOST')!),
    auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

export const destinataires = () => (env('MAIL_TO') || 'contact@libertinvest.fr').split(',').map((s) => s.trim()).filter(Boolean);

/** Traduit une erreur SMTP en explication compréhensible, avec la piste de correction. */
export function expliquer(e: unknown): string {
  const err = e as { code?: string; responseCode?: number; message?: string };
  const brut = `(${[err.code, err.responseCode].filter(Boolean).join(' ')} ${err.message ?? e})`.replace(/\s+/g, ' ');
  if (err.code === 'EAUTH' || err.responseCode === 535) return `Identifiant ou mot de passe refusé par le serveur : vérifiez SMTP_USER (l'adresse complète) et SMTP_PASS. ${brut}`;
  if (err.code === 'EDNS' || /ENOTFOUND|EAI_AGAIN/.test(err.message ?? '')) return `Serveur d'envoi introuvable : SMTP_HOST est sans doute mal écrit. ${brut}`;
  if (err.code === 'ETIMEDOUT' || /timeout/i.test(err.message ?? '')) return `Le serveur ne répond pas : vérifiez SMTP_HOST et SMTP_PORT (essayez 465 puis 587). ${brut}`;
  if (err.code === 'ECONNECTION' || err.code === 'ESOCKET' || /ECONNREFUSED|wrong version number|SSL/i.test(err.message ?? '')) return `Connexion refusée ou chiffrement incompatible : essayez l'autre port (465 ou 587). ${brut}`;
  if (err.code === 'EENVELOPE' || (err.responseCode && err.responseCode >= 550)) return `Le serveur refuse l'expéditeur ou le destinataire : l'adresse d'envoi doit être celle de SMTP_USER, vérifiez MAIL_TO. ${brut}`;
  return `Erreur d'envoi ${brut}`;
}

/** Vérifie la connexion et l'identification auprès du serveur SMTP, sans envoyer d'email. */
export async function verifierSmtp(): Promise<{ ok: boolean; message: string }> {
  if (!smtpConfigured()) return { ok: false, message: 'Réglages SMTP incomplets : il faut SMTP_HOST, SMTP_USER et SMTP_PASS.' };
  const t = transport();
  try {
    await t.verify();
    return { ok: true, message: `Connexion et identification réussies sur ${env('SMTP_HOST')}:${env('SMTP_PORT') || 587}.` };
  } catch (e) {
    return { ok: false, message: expliquer(e) };
  } finally {
    t.close();
  }
}

/** Envoie une alerte ; renvoie true si le serveur SMTP l'a acceptée. */
export async function envoyerAlerte(a: Alerte): Promise<boolean> {
  return (await envoyer(a)).ok;
}

/** Envoie un email et renvoie le résultat détaillé (utilisé aussi par la page Diagnostic). */
export async function envoyer(a: Alerte): Promise<{ ok: boolean; message: string }> {
  if (!smtpConfigured()) return { ok: false, message: 'Réglages SMTP incomplets : il faut SMTP_HOST, SMTP_USER et SMTP_PASS.' };
  const user = env('SMTP_USER')!;
  const t = transport();
  try {
    await t.sendMail({
      from: env('MAIL_FROM') || `"Ton Chasseur Immo" <${user}>`,
      to: destinataires(),
      replyTo: a.replyTo,
      subject: a.subject,
      text: a.text,
      attachments: a.attachment ? [{ filename: a.attachment.filename, content: a.attachment.content, contentType: 'application/json' }] : [],
    });
    return { ok: true, message: `Email accepté par le serveur, envoyé à ${destinataires().join(', ')}.` };
  } catch (e) {
    const message = expliquer(e);
    console.error('Envoi SMTP impossible :', message);
    return { ok: false, message };
  } finally {
    t.close();
  }
}
