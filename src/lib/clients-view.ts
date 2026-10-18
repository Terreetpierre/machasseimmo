// Résumés affichés dans le tableau des clients.
import { answers, type ClientRow } from './db';

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
