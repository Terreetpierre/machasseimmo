// Résumés affichés dans le tableau des clients.
import { answers, type ClientRow } from './db';
import { echeanceRappel } from './delai';

const euros = (v: string) => (v ? Number(String(v).replace(/\D/g, '')).toLocaleString('fr-FR') + ' €' : '');

export function summarize(c: ClientRow) {
  const f = answers(c);
  const nom = [f.prenom, f.nom].filter(Boolean).join(' ') || 'Client sans nom';
  if (c.type === 'vente') {
    return { nom, projet: ['Vente', f.vtype].filter(Boolean).join(' · '), budget: euros(f.vprix), secteur: f.vadresse || '' };
  }
  const projet = c.type === 'rdv' && !c.decouverte
    ? 'Rendez-vous · ' + (c.rdv?.type ?? '')
    : [f.projet || 'Achat', f.types.join(', ')].filter(Boolean).join(' · ');
  return { nom, projet, budget: euros(f.budget), secteur: [...f.communes, f.communesAutres].filter(Boolean).join(', ') };
}

export const dateFr = (d: Date | string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Paris' });

/** Échéance de rappel des nouvelles demandes du site ; null une fois le client pris en charge. */
export function rappel(c: ClientRow, now = new Date()) {
  if (c.statut !== 'nouveau' || c.source !== 'site') return null;
  const d = echeanceRappel(new Date(c.created_at));
  const label = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(d);
  return { label, enRetard: d.getTime() < now.getTime() };
}
