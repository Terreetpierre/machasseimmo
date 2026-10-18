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

/** Envoie une alerte ; renvoie true si le serveur SMTP l'a acceptée. */
export async function envoyerAlerte(a: Alerte) {
  if (!smtpConfigured()) return false;
  const port = Number(env('SMTP_PORT') || 587);
  const user = env('SMTP_USER')!;
  const transport = nodemailer.createTransport({
    host: env('SMTP_HOST'),
    port,
    secure: port === 465,
    requireTLS: port !== 465 && !/^(localhost|127\.0\.0\.1)$/.test(env('SMTP_HOST')!),
    auth: { user, pass: env('SMTP_PASS') },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  try {
    await transport.sendMail({
      from: env('MAIL_FROM') || `"Ton Chasseur Immo" <${user}>`,
      to: (env('MAIL_TO') || 'contact@libertinvest.fr').split(',').map((s) => s.trim()).filter(Boolean),
      replyTo: a.replyTo,
      subject: a.subject,
      text: a.text,
      attachments: a.attachment ? [{ filename: a.attachment.filename, content: a.attachment.content, contentType: 'application/json' }] : [],
    });
    return true;
  } catch (e) {
    console.error('Envoi SMTP impossible :', e instanceof Error ? e.message : e);
    return false;
  } finally {
    transport.close();
  }
}
