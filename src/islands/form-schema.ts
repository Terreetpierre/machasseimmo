// Description des étapes du formulaire « Décrire mon projet » (reprise fidèle de la maquette).
// Le formulaire court est celui des clients ; le formulaire complet (?complet=1) sert pendant les appels.

export type Opt = string | [value: string, label: string];
export type FieldDef =
  | { kind: 'chips'; key: string; label: string; opts: string[]; multi?: boolean; hint?: string }
  | { kind: 'input'; key: string; label: string; placeholder?: string; inputMode?: 'numeric' | 'decimal'; type?: 'text' | 'tel' | 'email'; autoComplete?: string }
  | { kind: 'select'; key: string; label: string; opts: Opt[] }
  | { kind: 'textarea'; key: string; label: string; placeholder?: string }
  | { kind: 'row'; min: number; fields: FieldDef[] }
  | { kind: 'consent'; key: string; text: string }
  | { kind: 'info'; text: string }
  | { kind: 'achatOnly'; field: FieldDef };

export const ARR = ['types', 'communes', 'proximites', 'etat', 'exterieur', 'stationnement', 'equipements', 'chauffage', 'ambiance', 'strategie', 'contactPref'];
export const NUMK = ['budget', 'budgetMin', 'budgetTravaux', 'apport', 'pret', 'mensualite', 'revenus', 'autresRevenus', 'credits', 'vprix'];
export const INTK = ['surfaceMin', 'surfaceMax', 'terrainMin', 'nbLots', 'vsurface', 'vterrain', 'vpieces'];
const STR = 'projet primo adultes enfants aVendre delai motivation communesAutres rayon lieuTravail trajetMax environnement budget budgetMin surfaceMin surfaceMax terrainMin piecesMin chambresMin sdbMin budgetTravaux dpe etage redhibitoire ideal rendementMin nbLots objectif occupation gestion dejaInvest financement situationPro anciennete situationCo ancienneteCo revenus autresRevenus credits creditsDetail apport pret mensualite courtier vtype vadresse vsurface vterrain vpieces vetat vprix vdpe vdelai vmessage prenom nom email tel villeActuelle dispo alertes rdvDate rdvSlot'.split(' ');

export type FormState = Record<string, any>;
export const EMPTY: FormState = {};
STR.forEach((k) => (EMPTY[k] = ''));
ARR.forEach((k) => (EMPTY[k] = []));
Object.assign(EMPTY, { rgpd: false, payChoice: 'Réserver un appel gratuit' });

export const COMMUNES = ['Roanne', 'Riorges', 'Mably', 'Le Coteau', 'Villerest', 'Commelle-Vernay', 'Perreux', 'Renaison', 'Saint-Romain-la-Motte', 'Ouches', 'Lentigny', 'Saint-Léger-sur-Roanne', 'Pouilly-les-Nonains', 'Saint-Alban-les-Eaux', 'Charlieu', 'Saint-Haon-le-Châtel'];

const PLUSIEURS = '(plusieurs choix possibles)';
const MULTI = '(plusieurs choix)';
const PROJET = ['Résidence principale', 'Résidence secondaire', 'Investissement locatif'];
const DELAI = ['Dès que possible', 'Sous 3 mois', 'Sous 6 mois', 'Je me renseigne'];
const FINANCEMENT = ['Accord bancaire obtenu', 'Simulation en cours', 'Achat comptant', 'Pas encore étudié'];
const TYPES = ['Maison', 'Appartement', 'Immeuble de rapport', 'Terrain à bâtir', 'Local / mixte'];
const VTYPE = ['Maison', 'Appartement', 'Immeuble', 'Terrain'];
const ANCIENNETE = ["Période d'essai", "Moins d'1 an", '1 à 3 ans', 'Plus de 3 ans'];
const SITUATION_PRO = ['CDI', 'CDD / intérim', 'Fonctionnaire', 'Indépendant / chef d\'entreprise', 'Profession libérale', 'Retraité', 'Autre'];
const indiff = (vals: string[], first = 'Indifférent'): Opt[] => [['', first], ...vals.map((v) => [v, v] as [string, string])];

export const STEPS: Record<string, { title: string; desc: string; fields: FieldDef[] }> = {
  qprojet: {
    title: 'Votre projet', desc: 'Trois questions rapides pour cibler la recherche.',
    fields: [
      { kind: 'chips', key: 'projet', label: 'Votre projet', opts: PROJET },
      { kind: 'chips', key: 'types', label: 'Type de bien', opts: TYPES, multi: true, hint: PLUSIEURS },
      { kind: 'chips', key: 'communes', label: 'Où cherchez-vous ?', opts: ['Roanne', 'Riorges', 'Mably', 'Le Coteau', 'Villerest', 'Commelle-Vernay', 'Côte roannaise', 'Peu importe, dans le Roannais'], multi: true, hint: PLUSIEURS },
      { kind: 'input', key: 'communesAutres', label: 'Autre secteur (facultatif)', placeholder: 'Ex. Côte roannaise, Charlieu…' },
    ],
  },
  qbien: {
    title: 'Budget & délai', desc: 'Pour vous proposer des biens réalistes.',
    fields: [
      { kind: 'row', min: 200, fields: [{ kind: 'input', key: 'budget', label: 'Budget maximum (€)', placeholder: '250 000', inputMode: 'numeric' }] },
      { kind: 'chips', key: 'delai', label: 'Quand souhaitez-vous acheter ?', opts: DELAI },
      { kind: 'chips', key: 'financement', label: 'Votre financement', opts: FINANCEMENT },
      { kind: 'textarea', key: 'ideal', label: 'Un mot sur ce que vous cherchez (facultatif)', placeholder: 'Ex. maison 3 chambres avec jardin, ou immeuble de 3 à 5 lots proche gare…' },
    ],
  },
  vrapide: {
    title: 'Votre bien', desc: "L'essentiel pour préparer l'estimation.",
    fields: [
      { kind: 'chips', key: 'vtype', label: 'Type de bien', opts: VTYPE },
      { kind: 'row', min: 200, fields: [
        { kind: 'input', key: 'vadresse', label: 'Commune du bien', placeholder: 'Ex. Riorges' },
        { kind: 'input', key: 'vsurface', label: 'Surface habitable (m²)', placeholder: '110', inputMode: 'numeric' },
      ] },
      { kind: 'chips', key: 'vdelai', label: 'Quand souhaitez-vous vendre ?', opts: DELAI },
    ],
  },
  qcontact: {
    title: 'Vos coordonnées', desc: 'Pour vous rappeler, rien de plus.',
    fields: [
      { kind: 'row', min: 200, fields: [
        { kind: 'input', key: 'prenom', label: 'Prénom', autoComplete: 'given-name' },
        { kind: 'input', key: 'tel', label: 'Téléphone', type: 'tel', autoComplete: 'tel', placeholder: '06 12 34 56 78' },
      ] },
      { kind: 'input', key: 'email', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'vous@exemple.fr' },
      { kind: 'consent', key: 'rgpd', text: "J'accepte d'être recontacté(e) au sujet de mon projet. Mes données ne sont jamais revendues." },
      { kind: 'info', text: "Je vous rappelle sous 24 h pour en parler. Sans engagement : rien n'est signé à cette étape." },
    ],
  },
  profil: {
    title: 'Votre projet', desc: 'Pour bien cibler la recherche, parlez-moi de vous et de votre projet.',
    fields: [
      { kind: 'chips', key: 'projet', label: 'Quel est votre projet ?', opts: PROJET },
      { kind: 'chips', key: 'primo', label: 'Est-ce votre premier achat ?', opts: ['Oui, premier achat', 'Non, déjà propriétaire'] },
      { kind: 'row', min: 200, fields: [
        { kind: 'select', key: 'adultes', label: 'Adultes dans le foyer', opts: indiff(['1', '2', '3', '4+']) },
        { kind: 'select', key: 'enfants', label: 'Enfants', opts: [['', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4+', '4 et +']] },
      ] },
      { kind: 'chips', key: 'aVendre', label: "Avez-vous un bien à vendre avant d'acheter ?", opts: ['Non', 'Oui, déjà en vente', 'Oui, à mettre en vente'] },
      { kind: 'chips', key: 'delai', label: 'Quand souhaitez-vous acheter ?', opts: DELAI },
      { kind: 'textarea', key: 'motivation', label: 'Pourquoi ce projet ? (facultatif)', placeholder: "Arrivée d'un enfant, mutation, retraite, premier investissement…" },
    ],
  },
  secteur: {
    title: 'Le secteur', desc: 'Où souhaitez-vous vivre ou investir ? Soyez aussi précis que possible.',
    fields: [
      { kind: 'chips', key: 'communes', label: 'Communes recherchées', opts: COMMUNES, multi: true, hint: MULTI },
      { kind: 'input', key: 'communesAutres', label: 'Autres communes ou quartiers', placeholder: 'Ex. quartier Clermont, Côte roannaise…' },
      { kind: 'chips', key: 'rayon', label: 'Rayon de recherche autour de ces communes', opts: ['Uniquement ces communes', '+ 5 km', '+ 10 km', '+ 20 km'] },
      { kind: 'row', min: 220, fields: [
        { kind: 'input', key: 'lieuTravail', label: 'Lieu de travail (vous / conjoint)', placeholder: 'Ex. Roanne centre, Lyon…' },
        { kind: 'select', key: 'trajetMax', label: 'Temps de trajet maximum', opts: indiff(['10 min', '20 min', '30 min', '45 min']) },
      ] },
      { kind: 'chips', key: 'environnement', label: 'Quel environnement ?', opts: ['Centre-ville', 'Quartier résidentiel', 'Campagne', 'Indifférent'] },
      { kind: 'chips', key: 'proximites', label: 'À proximité de', opts: ['Écoles', 'Collège / lycée', 'Commerces', 'Gare', 'Bus', 'Accès N7 / A89', 'Hôpital', 'Centre-ville à pied', 'Espaces verts'], multi: true, hint: MULTI },
    ],
  },
  bien: {
    title: 'Le bien recherché', desc: 'Vos critères deviennent ma grille de recherche : plus ils sont précis, plus la chasse est efficace.',
    fields: [
      { kind: 'chips', key: 'types', label: 'Type de bien', opts: TYPES, multi: true, hint: MULTI },
      { kind: 'row', min: 200, fields: [
        { kind: 'input', key: 'budgetMin', label: 'Budget minimum (€)', placeholder: '150 000', inputMode: 'numeric' },
        { kind: 'input', key: 'budget', label: 'Budget maximum, hors frais de notaire (€)', placeholder: '250 000', inputMode: 'numeric' },
      ] },
      { kind: 'row', min: 160, fields: [
        { kind: 'input', key: 'surfaceMin', label: 'Surface min. (m²)', placeholder: '90', inputMode: 'numeric' },
        { kind: 'input', key: 'surfaceMax', label: 'Surface max. (m²)', placeholder: '150', inputMode: 'numeric' },
        { kind: 'input', key: 'terrainMin', label: 'Terrain min. (m²)', placeholder: '500', inputMode: 'numeric' },
      ] },
      { kind: 'row', min: 160, fields: [
        { kind: 'select', key: 'piecesMin', label: 'Pièces min.', opts: indiff(['1', '2', '3', '4', '5', '6+']) },
        { kind: 'select', key: 'chambresMin', label: 'Chambres min.', opts: indiff(['1', '2', '3', '4', '5+']) },
        { kind: 'select', key: 'sdbMin', label: 'Salles de bain min.', opts: indiff(['1', '2', '3+']) },
      ] },
      { kind: 'chips', key: 'etat', label: 'État accepté', opts: ['Neuf / récent', 'Rénové, prêt à vivre', 'Rafraîchissement', 'Gros travaux acceptés'], multi: true, hint: MULTI },
      { kind: 'input', key: 'budgetTravaux', label: 'Budget travaux possible (€)', placeholder: '20 000', inputMode: 'numeric' },
      { kind: 'chips', key: 'dpe', label: 'Classe énergie (DPE) minimum', opts: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Indifférent'] },
      { kind: 'chips', key: 'exterieur', label: 'Extérieur souhaité', opts: ['Jardin', 'Terrasse', 'Balcon', 'Cour', 'Piscine', 'Pas nécessaire'], multi: true, hint: MULTI },
      { kind: 'chips', key: 'stationnement', label: 'Stationnement', opts: ['Garage', 'Place de parking', 'Stationnement facile', 'Pas nécessaire'], multi: true, hint: MULTI },
      { kind: 'chips', key: 'equipements', label: 'Indispensables', opts: ['Plain-pied', 'Chambre au RDC', 'Ascenseur', 'Cave', 'Grenier', 'Dépendance / atelier', 'Cheminée / poêle', 'Bureau', 'Buanderie', 'Accessible PMR'], multi: true, hint: MULTI },
      { kind: 'chips', key: 'etage', label: 'Si appartement : étage', opts: ['RDC accepté', 'Pas de RDC', 'Dernier étage', 'Indifférent'] },
      { kind: 'chips', key: 'chauffage', label: 'Chauffage préféré', opts: ['Gaz', 'Électrique', 'Pompe à chaleur', 'Bois / granulés', 'Indifférent'], multi: true, hint: MULTI },
      { kind: 'chips', key: 'ambiance', label: 'Ambiance', opts: ['Lumineux', 'Calme', 'Sans vis-à-vis', 'Vue dégagée', "Charme de l'ancien", 'Moderne'], multi: true, hint: MULTI },
      { kind: 'textarea', key: 'redhibitoire', label: 'Ce que vous ne voulez surtout pas', placeholder: 'Route passante, mitoyenneté, copropriété, fosse septique…' },
      { kind: 'textarea', key: 'ideal', label: 'Votre bien idéal en quelques mots', placeholder: 'Une maison de ville lumineuse avec un petit jardin, à pied des écoles…' },
    ],
  },
  invest: {
    title: 'Votre investissement', desc: 'Vos objectifs de rentabilité et de gestion.',
    fields: [
      { kind: 'chips', key: 'strategie', label: 'Stratégie de location', opts: ['Location nue', 'Meublé (LMNP)', 'Colocation', 'Courte durée', 'Immeuble de rapport', 'Achat-revente'], multi: true, hint: MULTI },
      { kind: 'row', min: 200, fields: [
        { kind: 'input', key: 'rendementMin', label: 'Rendement brut minimum (%)', placeholder: '8', inputMode: 'decimal' },
        { kind: 'input', key: 'nbLots', label: 'Nombre de lots souhaité', placeholder: '1 à 4', inputMode: 'numeric' },
      ] },
      { kind: 'chips', key: 'objectif', label: 'Objectif principal', opts: ['Cash-flow positif', 'Autofinancement', 'Patrimoine long terme'] },
      { kind: 'chips', key: 'occupation', label: 'Occupation du bien', opts: ['Libre', 'Déjà loué', 'Indifférent'] },
      { kind: 'chips', key: 'gestion', label: 'Gestion locative', opts: ['Je gère moi-même', 'Gestion déléguée', 'À définir'] },
      { kind: 'chips', key: 'dejaInvest', label: 'Avez-vous déjà investi ?', opts: ['Premier investissement', '1 à 3 biens', 'Plus de 3 biens'] },
    ],
  },
  financement: {
    title: 'Votre financement', desc: 'Un financement clair rend vos offres crédibles auprès des vendeurs.',
    fields: [
      { kind: 'chips', key: 'financement', label: 'Où en est votre financement ?', opts: FINANCEMENT },
      { kind: 'chips', key: 'situationPro', label: 'Votre situation professionnelle', opts: SITUATION_PRO },
      { kind: 'chips', key: 'anciennete', label: 'Votre ancienneté dans cet emploi', opts: ANCIENNETE },
      { kind: 'chips', key: 'situationCo', label: 'Situation du co-emprunteur', opts: [...SITUATION_PRO, 'Pas de co-emprunteur'] },
      { kind: 'chips', key: 'ancienneteCo', label: 'Ancienneté du co-emprunteur', opts: ANCIENNETE },
      { kind: 'row', min: 200, fields: [
        { kind: 'input', key: 'revenus', label: 'Revenus nets mensuels du foyer (€)', placeholder: '4 200', inputMode: 'numeric' },
        { kind: 'input', key: 'autresRevenus', label: 'Autres revenus mensuels (loyers, pensions…) (€)', placeholder: '600', inputMode: 'numeric' },
      ] },
      { kind: 'row', min: 200, fields: [
        { kind: 'input', key: 'credits', label: 'Crédits en cours : total des mensualités (€ / mois)', placeholder: '350', inputMode: 'numeric' },
        { kind: 'input', key: 'creditsDetail', label: 'Détail des crédits en cours', placeholder: 'Ex. prêt immo RP 650 € jusqu\'en 2041, auto 180 €' },
      ] },
      { kind: 'row', min: 200, fields: [
        { kind: 'input', key: 'apport', label: 'Apport personnel (€)', placeholder: '30 000', inputMode: 'numeric' },
        { kind: 'input', key: 'pret', label: 'Montant de prêt accordé ou estimé (€)', placeholder: '220 000', inputMode: 'numeric' },
        { kind: 'input', key: 'mensualite', label: 'Mensualité max. (€ / mois)', placeholder: '1 100', inputMode: 'numeric' },
      ] },
      { kind: 'chips', key: 'courtier', label: "Besoin d'un courtier ?", opts: ["J'ai déjà un courtier", 'Mise en relation souhaitée', 'Non merci'] },
    ],
  },
  vbien: {
    title: 'Votre bien', desc: 'Décrivez le bien à estimer.',
    fields: [
      { kind: 'chips', key: 'vtype', label: 'Type de bien', opts: VTYPE },
      { kind: 'input', key: 'vadresse', label: 'Adresse du bien', placeholder: '12 rue …, 42300 Roanne' },
      { kind: 'row', min: 160, fields: [
        { kind: 'input', key: 'vsurface', label: 'Surface habitable (m²)', placeholder: '110', inputMode: 'numeric' },
        { kind: 'input', key: 'vterrain', label: 'Terrain (m²)', placeholder: '600', inputMode: 'numeric' },
        { kind: 'input', key: 'vpieces', label: 'Nombre de pièces', placeholder: '5', inputMode: 'numeric' },
      ] },
      { kind: 'chips', key: 'vetat', label: 'État général', opts: ['Neuf / récent', 'Bon état', 'À rafraîchir', 'Travaux importants'] },
      { kind: 'row', min: 200, fields: [
        { kind: 'input', key: 'vprix', label: 'Prix espéré (€)', placeholder: '230 000', inputMode: 'numeric' },
        { kind: 'select', key: 'vdpe', label: 'DPE', opts: indiff(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Non réalisé']) },
      ] },
      { kind: 'chips', key: 'vdelai', label: 'Quand souhaitez-vous vendre ?', opts: DELAI },
      { kind: 'textarea', key: 'vmessage', label: 'Points forts / informations utiles', placeholder: 'Rénovation récente, vue, quartier calme…' },
    ],
  },
  contact: {
    title: 'Vos coordonnées', desc: 'Pour vous envoyer les biens et vous joindre au bon moment.',
    fields: [
      { kind: 'row', min: 220, fields: [
        { kind: 'input', key: 'prenom', label: 'Prénom', autoComplete: 'given-name' },
        { kind: 'input', key: 'nom', label: 'Nom', autoComplete: 'family-name' },
        { kind: 'input', key: 'email', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'vous@exemple.fr' },
        { kind: 'input', key: 'tel', label: 'Téléphone', type: 'tel', autoComplete: 'tel', placeholder: '06 12 34 56 78' },
      ] },
      { kind: 'input', key: 'villeActuelle', label: "Ville où vous habitez aujourd'hui", placeholder: 'Ex. Lyon' },
      { kind: 'chips', key: 'contactPref', label: 'Comment préférez-vous être contacté(e) ?', opts: ['Téléphone', 'WhatsApp', 'Email', 'SMS'], multi: true, hint: MULTI },
      { kind: 'chips', key: 'dispo', label: 'Meilleur moment pour vous joindre', opts: ['Matin', 'Midi', 'Après-midi', 'Soir'] },
      { kind: 'achatOnly', field: { kind: 'chips', key: 'alertes', label: 'Fréquence de réception des biens', opts: ["Dès qu'un bien sort", 'Récap quotidien', 'Récap hebdomadaire'] } },
      { kind: 'consent', key: 'rgpd', text: "J'accepte que mes données soient utilisées pour traiter ma recherche et être recontacté(e). Aucune revente à des tiers." },
    ],
  },
  validation: { title: 'Validation', desc: 'Vérifiez votre recherche et choisissez comment la lancer.', fields: [] },
  done: { title: 'Confirmation', desc: '', fields: [] },
};

export const stepKeys = (complet: boolean, mode: 'achat' | 'vente', f: FormState) => {
  if (!complet) return mode === 'vente' ? ['vrapide', 'qcontact', 'done'] : ['qprojet', 'qbien', 'qcontact', 'done'];
  return mode === 'vente'
    ? ['vbien', 'contact', 'done']
    : ['profil', 'secteur', 'bien', ...(f.projet === 'Investissement locatif' ? ['invest'] : []), 'financement', 'contact', 'validation', 'done'];
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function validate(cur: string, f: FormState): Record<string, string> {
  const e: Record<string, string> = {};
  const req = (k: string, m = 'Champ requis') => { if (!String(f[k] || '').trim()) e[k] = m; };
  const contact = (withNom: boolean) => {
    req('prenom');
    if (withNom) req('nom');
    if (!EMAIL_RE.test(f.email)) e.email = 'Adresse email invalide';
    if (f.tel.replace(/\D/g, '').length < 10) e.tel = 'Numéro invalide';
    if (!f.rgpd) e.rgpd = "Merci d'accepter pour continuer";
  };
  if (cur === 'qprojet') {
    req('projet', 'Choisissez votre projet');
    if (!f.types.length) e.types = 'Choisissez au moins un type de bien';
    if (!f.communes.length && !f.communesAutres.trim()) e.communes = 'Choisissez au moins un secteur';
  }
  if (cur === 'qbien') { req('budget', 'Indiquez un budget approximatif'); req('delai', 'Indiquez votre délai'); }
  if (cur === 'vrapide') { req('vtype', 'Choisissez un type de bien'); req('vadresse', 'Indiquez la commune'); }
  if (cur === 'qcontact') contact(false);
  if (cur === 'profil') { req('projet', 'Choisissez votre projet'); req('delai', 'Indiquez votre délai'); }
  if (cur === 'secteur' && !f.communes.length && !f.communesAutres.trim()) e.communes = 'Choisissez au moins une commune';
  if (cur === 'bien') { if (!f.types.length) e.types = 'Choisissez au moins un type de bien'; req('budget', 'Indiquez votre budget maximum'); }
  if (cur === 'invest' && !f.strategie.length) e.strategie = 'Choisissez au moins une stratégie';
  if (cur === 'financement') req('financement', 'Indiquez où en est votre financement');
  if (cur === 'vbien') { req('vtype', 'Choisissez un type de bien'); req('vadresse'); req('vsurface'); }
  if (cur === 'contact') contact(true);
  if (cur === 'validation' && f.payChoice.startsWith('Réserver')) { req('rdvDate', 'Choisissez un jour'); req('rdvSlot', 'Choisissez un horaire'); }
  return e;
}

const fmtMoney = (v: string) => (v ? String(v).replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €' : '');

/** Phrase de résumé, prête à servir de consigne de recherche. */
export function brief(f: FormState): string {
  const p: string[] = [], j = (a: string[]) => a.join(', ');
  p.push((f.types.length ? j(f.types) : 'Bien') + (f.projet ? ' — ' + f.projet.toLowerCase() : ''));
  const sect = [...f.communes, ...(f.communesAutres ? [f.communesAutres] : [])];
  if (sect.length) p.push('Secteur : ' + j(sect) + (f.rayon && f.rayon !== 'Uniquement ces communes' ? ' (' + f.rayon + ')' : ''));
  if (f.budget) p.push('Budget : ' + (f.budgetMin ? fmtMoney(f.budgetMin) + ' à ' : "jusqu'à ") + fmtMoney(f.budget) + ' FAI');
  const dims = [f.surfaceMin && '≥ ' + f.surfaceMin + ' m²', f.terrainMin && 'terrain ≥ ' + f.terrainMin + ' m²', f.chambresMin && '≥ ' + f.chambresMin + ' chambres', f.piecesMin && '≥ ' + f.piecesMin + ' pièces'].filter(Boolean);
  if (dims.length) p.push(j(dims));
  if (f.etat.length) p.push('État : ' + j(f.etat).toLowerCase() + (f.budgetTravaux ? ' (travaux ≤ ' + fmtMoney(f.budgetTravaux) + ')' : ''));
  if (f.dpe && f.dpe !== 'Indifférent') p.push('DPE ' + f.dpe + ' minimum');
  const must = [...f.exterieur, ...f.stationnement, ...f.equipements].filter((x: string) => x !== 'Pas nécessaire');
  if (must.length) p.push('Indispensable : ' + j(must).toLowerCase());
  if (f.proximites.length) p.push('Proche : ' + j(f.proximites).toLowerCase());
  if (f.projet === 'Investissement locatif' && f.strategie.length) p.push('Investissement : ' + j(f.strategie).toLowerCase() + (f.rendementMin ? ', rendement brut ≥ ' + f.rendementMin + ' %' : ''));
  if (f.ideal) p.push('En quelques mots : ' + f.ideal);
  if (f.redhibitoire) p.push('À éviter : ' + f.redhibitoire);
  if (f.delai) p.push('Délai : ' + f.delai.toLowerCase());
  return p.join('. ') + '.';
}

/** Fiche de recherche structurée (JSON) envoyée par email et enregistrée côté serveur. */
export function fiche(ref: string, mode: 'achat' | 'vente', complet: boolean, f: FormState) {
  const money = (v: string) => { const d = String(v || '').replace(/\D/g, ''); return d ? Number(d) : null; };
  const pct = (v: string) => { const d = String(v || '').replace(',', '.').replace(/[^\d.]/g, ''); return d ? Number(d) : null; };
  const o = (v: string) => v || null;
  const a = (v: string[]) => (v.length ? v : null);
  const base = { reference: ref, date_creation: new Date().toISOString(), source: 'tonchasseurimmo-roannais.fr', formulaire: complet ? 'complet' : 'court' };
  const client = { prenom: f.prenom, nom: o(f.nom), email: f.email, telephone: f.tel, ville_actuelle: o(f.villeActuelle), preferences_contact: a(f.contactPref), disponibilite: o(f.dispo), frequence_alertes: o(f.alertes) };
  if (mode === 'vente') {
    return { ...base, type: 'estimation_vente', client,
      bien: { type: o(f.vtype), adresse: o(f.vadresse), surface_m2: money(f.vsurface), terrain_m2: money(f.vterrain), pieces: money(f.vpieces), etat: o(f.vetat), dpe: o(f.vdpe), prix_espere_eur: money(f.vprix), delai: o(f.vdelai), informations: o(f.vmessage) } };
  }
  const reserve = complet && f.payChoice.startsWith('Réserver');
  return { ...base, type: 'mandat_recherche', statut: 'nouvelle_recherche', client,
    projet: { type: o(f.projet), primo_accedant: f.primo ? f.primo.startsWith('Oui') : null, foyer: { adultes: o(f.adultes), enfants: o(f.enfants) }, bien_a_vendre_avant: o(f.aVendre), delai: o(f.delai), motivation: o(f.motivation) },
    localisation: { communes: f.communes, autres_secteurs: o(f.communesAutres), rayon: o(f.rayon), lieu_travail: o(f.lieuTravail), trajet_max: o(f.trajetMax), environnement: o(f.environnement), proximites: a(f.proximites) },
    criteres: { types_bien: f.types, budget_min_eur: money(f.budgetMin), budget_max_eur_fai: money(f.budget), surface_min_m2: money(f.surfaceMin), surface_max_m2: money(f.surfaceMax), terrain_min_m2: money(f.terrainMin), pieces_min: o(f.piecesMin), chambres_min: o(f.chambresMin), salles_de_bain_min: o(f.sdbMin), etats_acceptes: a(f.etat), budget_travaux_eur: money(f.budgetTravaux), dpe_minimum: o(f.dpe), exterieur: a(f.exterieur), stationnement: a(f.stationnement), indispensables: a(f.equipements), etage_appartement: o(f.etage), chauffage: a(f.chauffage), ambiance: a(f.ambiance), redhibitoires: o(f.redhibitoire), bien_ideal: o(f.ideal) },
    investissement: f.projet === 'Investissement locatif' ? { strategies: f.strategie, rendement_brut_min_pct: pct(f.rendementMin), nombre_lots: o(f.nbLots), objectif: o(f.objectif), occupation: o(f.occupation), gestion: o(f.gestion), experience: o(f.dejaInvest) } : null,
    financement: { statut: o(f.financement), situation_professionnelle: o(f.situationPro), anciennete: o(f.anciennete), situation_co_emprunteur: o(f.situationCo), anciennete_co_emprunteur: o(f.ancienneteCo), revenus_nets_mensuels_foyer_eur: money(f.revenus), autres_revenus_mensuels_eur: money(f.autresRevenus), credits_en_cours_mensualites_eur: money(f.credits), credits_en_cours_detail: o(f.creditsDetail), apport_eur: money(f.apport), pret_eur: money(f.pret), mensualite_max_eur: money(f.mensualite), courtier: o(f.courtier) },
    validation: { mode: reserve ? 'appel_cadrage' : 'rappel_24h', appel: reserve ? { jour: f.rdvDate, heure: f.rdvSlot } : null, statut_mandat: 'a_envoyer_apres_appel' },
    brief_recherche: brief(f) };
}

/** Les 8 prochains jours ouvrés (hors dimanche) et les créneaux proposés. */
export const nextDays = () => {
  const out: string[] = [], d = new Date();
  d.setDate(d.getDate() + 1);
  while (out.length < 8) {
    if (d.getDay() !== 0) out.push(d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }));
    d.setDate(d.getDate() + 1);
  }
  return out;
};
export const SLOTS = ['9:00', '10:00', '11:30', '14:00', '15:30', '17:00', '18:30'];

export const formatInput = (k: string, v: string) => {
  if (NUMK.includes(k)) { const d = v.replace(/\D/g, '').slice(0, 9); return d ? Number(d).toLocaleString('fr-FR') : ''; }
  if (INTK.includes(k)) return v.replace(/\D/g, '').slice(0, 6);
  return v;
};

export const ENDPOINT: string = import.meta.env.PUBLIC_FORM_ENDPOINT || '/api/projet';

/** Envoie une fiche au serveur ; lève une erreur si l'envoi échoue. */
export async function submit(payload: object, honeypot: string) {
  const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, website: honeypot }) });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json().catch(() => ({}));
  if (!data.ok) throw new Error(data.error || 'Envoi refusé');
  return data;
}
