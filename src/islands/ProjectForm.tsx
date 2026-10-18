import { useEffect, useMemo, useState } from 'preact/hooks';
import { HORAIRES, OFFER, RAPPEL, SITE } from '../data/site';
import { Chips, Field } from './fields';
import {
  ARR, EMPTY, NUMK, STEPS, SLOTS, brief, fiche, formatInput, nextDays, stepKeys, submit, validate, type FormState,
} from './form-schema';
import './islands.css';

type Mode = 'achat' | 'vente';

/** Pré-remplissage depuis l'URL : /projet?mode=vente, ?projet=…&types=Maison|Appartement, ?complet=1 */
function fromUrl() {
  const q = new URLSearchParams(location.search);
  const f: FormState = { ...EMPTY };
  for (const k of Object.keys(EMPTY)) {
    const v = q.get(k);
    if (v == null || v === '') continue;
    if (ARR.includes(k)) f[k] = v.split('|').filter(Boolean);
    else if (typeof EMPTY[k] === 'string') f[k] = NUMK.includes(k) ? formatInput(k, v) : v;
  }
  return { f, mode: (q.get('mode') === 'vente' ? 'vente' : 'achat') as Mode, complet: q.get('complet') === '1' };
}

const fmt = (n: string) => (n ? Number(String(n).replace(/\D/g, '')).toLocaleString('fr-FR') + ' €' : '—');

export default function ProjectForm() {
  const init = useMemo(fromUrl, []);
  const [complet] = useState(init.complet);
  const [mode, setMode] = useState<Mode>(init.mode);
  const [step, setStep] = useState(1);
  const [f, setF] = useState<FormState>(init.f);
  const [err, setErr] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [result, setResult] = useState<{ ref: string; json: string } | null>(null);
  const [hp, setHp] = useState('');
  const days = useMemo(nextDays, []);

  const keys = stepKeys(complet, mode, f);
  const cur = result ? 'done' : keys[step - 1] || 'done';
  const total = keys.length;
  const done = cur === 'done';

  useEffect(() => { window.scrollTo(0, 0); }, [step, mode, !!result]);

  const set = (k: string, v: any) => { setF((s) => ({ ...s, [k]: v })); setErr((e) => ({ ...e, [k]: '' })); };
  const switchMode = (m: Mode) => { setMode(m); setStep(1); setErr({}); setSendError(''); };

  const finish = async () => {
    const ref = 'TCI-' + String(Date.now()).slice(-6);
    const data = fiche(ref, mode, complet, f);
    setSending(true); setSendError('');
    try {
      await submit({ kind: 'projet', fiche: data, reponses: f }, hp);
      setResult({ ref, json: JSON.stringify(data, null, 2) });
    } catch {
      setSendError(`L'envoi n'a pas abouti. Réessayez, ou appelez-moi directement au ${SITE.phone}.`);
    } finally {
      setSending(false);
    }
  };

  const next = () => {
    if (sending) return;
    const e = validate(cur, f);
    setErr(e);
    if (Object.keys(e).length) return;
    const last = keys[step] === 'done';
    if (last) finish();
    else setStep(step + 1);
  };

  const reserve = f.payChoice.startsWith('Réserver');
  const nextLabel = sending ? 'Envoi en cours…' : (cur === 'validation' || cur === 'qcontact') ? 'Envoyer ma recherche' : (mode === 'vente' && cur === 'contact') ? 'Envoyer ma demande' : 'Continuer';
  const labels = keys.map((k) => STEPS[k].title);
  const intro = !complet
    ? (mode === 'achat' ? `2 minutes, sans engagement. Je vous rappelle ${RAPPEL} (${HORAIRES}) pour affiner ensemble.` : `1 minute, sans engagement. Je vous rappelle ${RAPPEL} (${HORAIRES}).`)
    : (mode === 'achat' ? 'Environ 5 minutes. Chaque réponse alimente votre fiche de recherche : plus elle est précise, plus je trouve vite.' : "Décrivez votre bien : je vous recontacte sous 24 h pour organiser une visite d'estimation gratuite.");

  const doneTitle = mode === 'vente' ? "Demande d'estimation envoyée." : complet && reserve ? 'Votre appel est réservé.' : 'Votre fiche de recherche est enregistrée.';
  const doneText = mode === 'vente'
    ? `Merci ${f.prenom} ! Je vous recontacte ${RAPPEL} (${HORAIRES}) pour convenir d'une visite d'estimation gratuite.`
    : complet && reserve
      ? `Merci ${f.prenom} ! Je vous appelle le ${f.rdvDate} à ${f.rdvSlot} pour valider votre fiche. Vous recevrez ensuite votre mandat de recherche par email. Aucun paiement aujourd'hui.`
      : `Merci ${f.prenom} ! Je vous rappelle ${RAPPEL} (${HORAIRES}) pour valider votre fiche. Aucun paiement aujourd'hui.`;

  const download = () => {
    if (!result) return;
    const u = URL.createObjectURL(new Blob([result.json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = u; a.download = result.ref + '.json'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  };

  return (
    <div class="pf">
      <aside class="pf-aside">
        <div class="pf-mode" role="group" aria-label="Type de projet">
          <button type="button" class={mode === 'achat' ? 'on' : ''} aria-pressed={mode === 'achat'} onClick={() => switchMode('achat')}>J'achète</button>
          <button type="button" class={mode === 'vente' ? 'on' : ''} aria-pressed={mode === 'vente'} onClick={() => switchMode('vente')}>Je vends</button>
        </div>
        <h1 class="pf-title">{mode === 'achat' ? "Décrivez votre projet d'achat" : 'Faites estimer votre bien'}</h1>
        <p class="pf-intro">{intro}</p>
        <ol class="pf-progress">
          {labels.map((l, i) => {
            const at = result ? total : step, n = i + 1, isCur = n === at, past = n < at;
            return (
              <li key={l + i} class={(isCur ? 'cur' : '') + (past ? ' past' : '')} aria-current={isCur ? 'step' : undefined}>
                <span class="dot">{past ? '✓' : n}</span><span>{l}</span>
              </li>
            );
          })}
        </ol>
      </aside>

      <div class="pf-card">
        <div class="pf-bar"><div style={{ width: Math.round(((result ? total : step) / total) * 100) + '%' }} /></div>

        {!done && (
          <div class="pf-head">
            <span class="pf-step">Étape {Math.min(step, total - 1)} sur {total - 1}</span>
            <h2>{STEPS[cur].title}</h2>
            <p>{STEPS[cur].desc}</p>
          </div>
        )}

        {!done && cur !== 'validation' && (
          <div class="pf-fields">
            {STEPS[cur].fields.map((d, i) => <Field key={cur + i} def={d} ctx={{ f, err, set, mode }} />)}
          </div>
        )}

        {cur === 'validation' && (
          <div class="pf-fields pf-valid">
            <Chips label="Comment souhaitez-vous que l'on échange ?" opts={['Réserver un appel gratuit', 'Être rappelé(e) sous 24 h (hors week-end)']} value={f.payChoice} onPick={(o) => set('payChoice', o)} large />
            <div class="pf-recap">
              <span class="pf-recap-k">Récapitulatif de votre recherche</span>
              <p>{brief(f)}</p>
              {[
                ['Projet', f.projet || '—'], ['Délai', f.delai || '—'], ['Type de bien', f.types.join(', ') || '—'],
                ['Communes', [...f.communes, f.communesAutres].filter(Boolean).join(', ') || '—'],
                ['Budget', (f.budgetMin ? fmt(f.budgetMin) + ' – ' : '') + fmt(f.budget)],
                ['Surface min.', f.surfaceMin ? f.surfaceMin + ' m²' : '—'], ['Chambres min.', f.chambresMin || '—'], ['Financement', f.financement || '—'],
              ].map(([k, v]) => <div class="pf-recap-row" key={k}><span>{k}</span><span>{v}</span></div>)}
            </div>
            {reserve && (
              <>
                <p class="pf-call">Échangeons 20 minutes au téléphone, gratuitement, pour valider votre fiche de recherche. Le mandat de recherche vous est ensuite envoyé par email.</p>
                <Chips label="Choisissez un jour" opts={days} value={f.rdvDate} onPick={(o) => set('rdvDate', o)} error={err.rdvDate} large />
                <Chips label="Choisissez un horaire" opts={SLOTS} value={f.rdvSlot} onPick={(o) => set('rdvSlot', o)} error={err.rdvSlot} large />
              </>
            )}
            <div class="pf-note">Aucun paiement aujourd'hui. Mes honoraires ({OFFER.feeRate} du prix d'achat, minimum {OFFER.feeMin}) ne sont dus qu'à la signature de l'acte authentique.</div>
          </div>
        )}

        {done && result && (
          <div class="pf-done">
            <span class="pf-check" aria-hidden="true">✓</span>
            <h2>{doneTitle}</h2>
            <p>{doneText}</p>
            <span class="pf-ref">Référence : {result.ref}</span>
            {complet && (
              <details class="pf-json">
                <summary>Fiche de recherche structurée (JSON)</summary>
                <p>C'est ce fichier qui est enregistré pour lancer les recherches.</p>
                <pre>{result.json}</pre>
                <button type="button" class="pill pf-dl" onClick={download}>Télécharger la fiche (.json)</button>
              </details>
            )}
            <a href="/" class="pill pf-home">Retour à l'accueil</a>
          </div>
        )}

        {!done && (
          <>
            {/* Champ piège anti-robots : invisible pour les humains. */}
            <input class="pf-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={hp} onInput={(e) => setHp((e.target as HTMLInputElement).value)} />
            {sendError && <div class="pf-senderr" role="alert">{sendError}</div>}
            <div class="pf-actions">
              <button type="button" class="pf-back" style={{ visibility: step > 1 ? 'visible' : 'hidden' }} onClick={() => { setStep(Math.max(1, step - 1)); setErr({}); }}>Retour</button>
              <button type="button" class="pill pill-accent pf-next" disabled={sending} onClick={next}>
                {sending && <span class="pf-spin" aria-hidden="true" />}
                {nextLabel}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
