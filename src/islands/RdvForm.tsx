import { useMemo, useState } from 'preact/hooks';
import { OFFER, SITE } from '../data/site';
import { Chips, TextField } from './fields';
import { SLOTS, nextDays, submit } from './form-schema';
import './islands.css';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const TYPES = ['Appel téléphonique', 'Visio', 'Visite & compte rendu (sur devis)', `Étude de projet (${OFFER.studyPrice} €)`];

export default function RdvForm() {
  const days = useMemo(nextDays, []);
  const [f, setF] = useState({ rdvType: 'Appel téléphonique', rdvDate: '', rdvSlot: '', prenom: '', tel: '', email: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [hp, setHp] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f, v: string) => { setF((s) => ({ ...s, [k]: v })); setErr((e) => ({ ...e, [k]: '' })); };

  const send = async () => {
    const e: Record<string, string> = {};
    (['rdvType', 'rdvDate', 'rdvSlot', 'prenom'] as const).forEach((k) => { if (!f[k].trim()) e[k] = 'Champ requis'; });
    if (f.tel.replace(/\D/g, '').length < 10) e.tel = 'Numéro invalide';
    if (!EMAIL_RE.test(f.email)) e.email = 'Adresse email invalide';
    setErr(e);
    if (Object.keys(e).length || sending) return;
    setSending(true); setSendError('');
    try {
      const ref = 'RDV-' + String(Date.now()).slice(-6);
      await submit({ kind: 'rdv', fiche: { reference: ref, type: 'rendez_vous', date_creation: new Date().toISOString(), source: 'tonchasseurimmo-roannais.fr', rendez_vous: { type: f.rdvType, jour: f.rdvDate, heure: f.rdvSlot }, client: { prenom: f.prenom, telephone: f.tel, email: f.email } } }, hp);
      setDone(true);
      window.scrollTo(0, 0);
    } catch {
      setSendError(`L'envoi n'a pas abouti. Réessayez, ou appelez-moi directement au ${SITE.phone}.`);
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div class="rdv-card">
        <div class="pf-done">
          <span class="pf-check sage" aria-hidden="true">✓</span>
          <h2>C'est noté, {f.prenom} !</h2>
          <p>Demande de rendez-vous ({f.rdvType.toLowerCase()}) le {f.rdvDate} à {f.rdvSlot}. Je vous confirme le créneau par SMS au {f.tel}.</p>
          <a href="/" class="pill pf-home">Retour à l'accueil</a>
        </div>
      </div>
    );
  }

  return (
    <div class="rdv-card">
      <div class="pf-fields rdv-fields">
        <Chips label="Type de rendez-vous" opts={TYPES} value={f.rdvType} onPick={(o) => set('rdvType', o)} error={err.rdvType} large />
        <Chips label="Choisissez un jour" opts={days} value={f.rdvDate} onPick={(o) => set('rdvDate', o)} error={err.rdvDate} large />
        <Chips label="Choisissez un horaire" opts={SLOTS} value={f.rdvSlot} onPick={(o) => set('rdvSlot', o)} error={err.rdvSlot} large />
        <div class="f-row" style={{ '--min': '200px' }}>
          <TextField label="Prénom" error={err.prenom}>
            <input class="f-input" value={f.prenom} autoComplete="given-name" onInput={(e) => set('prenom', (e.target as HTMLInputElement).value)} />
          </TextField>
          <TextField label="Téléphone" error={err.tel}>
            <input class="f-input" type="tel" value={f.tel} autoComplete="tel" placeholder="06 12 34 56 78" onInput={(e) => set('tel', (e.target as HTMLInputElement).value)} />
          </TextField>
        </div>
        <TextField label="Email" error={err.email}>
          <input class="f-input" type="email" value={f.email} autoComplete="email" placeholder="vous@exemple.fr" onInput={(e) => set('email', (e.target as HTMLInputElement).value)} />
        </TextField>
        <input class="pf-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={hp} onInput={(e) => setHp((e.target as HTMLInputElement).value)} />
        {sendError && <div class="pf-senderr" role="alert">{sendError}</div>}
        <button type="button" class="pill pill-accent rdv-submit" disabled={sending} onClick={send}>
          {sending && <span class="pf-spin" aria-hidden="true" />}
          {sending ? 'Envoi en cours…' : 'Confirmer le rendez-vous'}
        </button>
      </div>
    </div>
  );
}
