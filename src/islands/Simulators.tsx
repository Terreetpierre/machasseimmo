import { useState } from 'preact/hooks';
import { projetHref } from '../data/site';
import './islands.css';

type Field = [key: string, label: string, unit: string];

const RENTA: Field[] = [
  ['prix', "Prix d'achat", '€'], ['travaux', 'Travaux', '€'], ['notaire', 'Frais de notaire', '%'],
  ['loyer', 'Loyer mensuel total', '€'], ['charges', 'Charges non récupérables / an', '€'], ['tf', 'Taxe foncière / an', '€'],
  ['vacance', 'Vacance locative', '%'], ['apportS', 'Apport', '€'], ['taux', 'Taux du crédit', '%'], ['duree', 'Durée', 'ans'],
];
const CAPA: Field[] = [
  ['revenus', 'Revenus nets mensuels du foyer', '€'], ['credits', 'Crédits en cours / mois', '€'],
  ['loyersActuels', 'Loyers actuels perçus / mois', '€'], ['apportC', 'Apport disponible', '€'],
  ['tauxC', 'Taux du crédit', '%'], ['dureeC', 'Durée', 'ans'],
];
const DEFAULTS: Record<string, string> = {
  prix: '180000', travaux: '30000', notaire: '7.5', loyer: '1650', charges: '1200', tf: '1800', vacance: '5', apportS: '20000',
  taux: '3.6', duree: '20', revenus: '4200', credits: '0', loyersActuels: '0', apportC: '20000', tauxC: '3.6', dureeC: '20',
};

const eur = (x: number) => (isFinite(x) ? Math.round(x).toLocaleString('fr-FR') + ' €' : '—');
const pct = (x: number) => (isFinite(x) ? x.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %' : '—');
const mensualite = (capital: number, taux: number, ans: number) => {
  const r = taux / 1200, n = ans * 12;
  if (capital <= 0 || n <= 0) return 0;
  return r ? (capital * r) / (1 - Math.pow(1 + r, -n)) : capital / n;
};

export default function Simulators() {
  const [tab, setTab] = useState<'r' | 'c'>('r');
  const [v, setV] = useState(DEFAULTS);
  const N = (k: string) => {
    const x = parseFloat(String(v[k]).replace(',', '.').replace(/[^\d.]/g, ''));
    return isFinite(x) ? x : 0;
  };

  const coutTotal = N('prix') * (1 + N('notaire') / 100) + N('travaux');
  const loyerAnnuel = N('loyer') * 12;
  const chargesAnnuelles = N('charges') + N('tf');
  const mensR = mensualite(coutTotal - N('apportS'), N('taux'), N('duree'));
  const cashflow = N('loyer') * (1 - N('vacance') / 100) - chargesAnnuelles / 12 - mensR;

  const mensMax = Math.max(0, (N('revenus') + 0.7 * N('loyersActuels')) * 0.35 - N('credits'));
  const rC = N('tauxC') / 1200, nC = N('dureeC') * 12;
  const capital = nC ? (rC ? (mensMax * (1 - Math.pow(1 + rC, -nC))) / rC : mensMax * nC) : 0;
  const prixMax = (capital + N('apportC')) / 1.075;

  const fields = tab === 'r' ? RENTA : CAPA;
  const findHref = () => {
    const budget = tab === 'r' ? N('prix') : Math.round(prixMax);
    const apport = N(tab === 'r' ? 'apportS' : 'apportC');
    return projetHref({ projet: 'Investissement locatif', ...(budget ? { budget: String(budget) } : {}), ...(apport ? { apport: String(apport) } : {}) });
  };

  return (
    <div class="sim">
      <div class="sim-head">
        <h2 class="sim-title">Faites vos calculs avant d'appeler.</h2>
        <div role="tablist" aria-label="Simulateurs" class="sim-tabs">
          <button type="button" role="tab" aria-selected={tab === 'r'} class={tab === 'r' ? 'on' : ''} onClick={() => setTab('r')}>Rentabilité locative</button>
          <button type="button" role="tab" aria-selected={tab === 'c'} class={tab === 'c' ? 'on' : ''} onClick={() => setTab('c')}>Capacité d'emprunt</button>
        </div>
      </div>
      <div class="sim-body">
        <div class="sim-inputs" role="tabpanel">
          {fields.map(([k, label, unit]) => (
            <label key={k} class="sim-field">
              <span>{label}</span>
              <span class="sim-input">
                <input inputMode="decimal" value={v[k]} aria-label={label} onInput={(e) => setV({ ...v, [k]: (e.target as HTMLInputElement).value })} />
                <span>{unit}</span>
              </span>
            </label>
          ))}
        </div>
        <div class="sim-results" aria-live="polite">
          {tab === 'r' ? (
            <>
              <div class="sim-grid">
                <Result label="Rendement brut" value={coutTotal ? pct((loyerAnnuel / coutTotal) * 100) : '—'} big />
                <Result label="Rendement net de charges" value={coutTotal ? pct(((loyerAnnuel * (1 - N('vacance') / 100) - chargesAnnuelles) / coutTotal) * 100) : '—'} big />
                <Result label="Coût total du projet" value={eur(coutTotal)} />
                <Result label="Mensualité de crédit" value={eur(mensR)} />
              </div>
              <div class="sim-cf">
                <span>Cash-flow mensuel estimé</span>
                <span class="sim-cf-v" style={{ color: cashflow >= 0 ? 'var(--color-accent-2-700)' : 'var(--color-accent-700)' }}>{(cashflow >= 0 ? '+' : '') + eur(cashflow)}</span>
              </div>
            </>
          ) : (
            <div class="sim-grid">
              <Result label="Mensualité maximale (35 %)" value={eur(mensMax)} big />
              <Result label="Capital empruntable" value={eur(capital)} big />
              <Result label="Budget total avec apport" value={eur(capital + N('apportC'))} />
              <Result label="Prix de bien accessible" value={eur(prixMax)} />
            </div>
          )}
          <p class="sim-note">
            {tab === 'r'
              ? 'Estimation indicative, hors fiscalité, assurance emprunteur et frais de garantie. Je refais ces calculs sur chaque bien réel avec les vrais chiffres : loyers du marché, charges, travaux.'
              : "Estimation indicative basée sur un taux d'endettement de 35 %, loyers existants retenus à 70 %. Hors assurance emprunteur. Votre courtier ou votre banque confirmera votre enveloppe."}
          </p>
          <a href={findHref()} class="pill pill-light sim-find">Trouver un bien avec ces chiffres</a>
        </div>
      </div>
    </div>
  );
}

function Result({ label, value, big = false }: { label: string; value: string; big?: boolean }) {
  return (
    <div class="sim-res">
      <span>{label}</span>
      <span class={big ? 'sim-big' : 'sim-small'}>{value}</span>
    </div>
  );
}
