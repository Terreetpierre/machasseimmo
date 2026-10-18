// Contenu du site, centralisé ici pour pouvoir le modifier sans toucher aux pages.
// Les éléments marqués TODO sont à remplacer avant la mise en ligne (voir TODO.md).

export const SITE = {
  name: 'Ton Chasseur Immo Roannais',
  by: 'Par Terre & Pierre Immobilier',
  url: 'https://chasseurimmoroanne.com',
  person: 'Pierre Colas',
  phone: '07 63 00 94 60',
  phoneHref: 'tel:+33763009460',
  phoneIntl: '+33763009460',
  whatsapp: 'https://wa.me/33763009460',
  email: 'contact@libertinvest.fr',
  hours: 'Lun – ven, 9 h – 18 h',
  address: { street: '20 rue Pierre Dépierre', postalCode: '42300', city: 'Roanne', region: 'Loire' },
};

// Offre — mêmes réglages que dans la maquette (feeRate, consultPrice).
export const OFFER = {
  feeRate: '3 % TTC',
  feeMin: '5 000 € TTC',
  studyPrice: 250,
};

// Délai de rappel affiché partout sur le site (règle de calcul : src/lib/delai.ts).
export const RAPPEL = 'sous 24 h, hors week-end';
export const HORAIRES = 'du lundi au vendredi, de 9 h à 18 h';

export const NOT_AGENCY =
  "Je ne suis pas une agence : je travaille uniquement pour vous, l'acheteur. Pas de vitrine, pas d'annonces à écouler, pas de vendeur à satisfaire.";

export type Photo = { src: string; credit: string; creditHref: string };

const PEXELS_AUTHORS: Record<string, string> = {
  '7078045': 'Laura Tancredi', '7578875': 'Kindel Media', '7578987': 'Kindel Media', '7641858': 'Alena Darmel',
  '7641903': 'Alena Darmel', '7641906': 'Alena Darmel', '7647398': 'Anastasia Shuraeva', '7937330': 'Pavel Danilyuk',
  '18908045': 'Bianca Jelezniac', '23224997': 'Vitaly Gariev', '8293737': 'RDNE Stock project', '4947281': 'Maria Orlova',
};

// TODO avant mise en ligne : télécharger ces photos et les héberger sur le site (public/images).
export const pexels = (id: number | string, w = 1400): Photo => ({
  src: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`,
  credit: `${PEXELS_AUTHORS[String(id)]} / Pexels`,
  creditHref: `https://www.pexels.com/photo/${id}/`,
});

export const PHOTOS = {
  hero: pexels(8293737, 2400),
  roanne: {
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Th%C3%A9%C3%A2tre_municipal_Roanne_8.jpg?width=1600',
    credit: 'Wikimedia Commons',
    creditHref: 'https://commons.wikimedia.org/wiki/File:Th%C3%A9%C3%A2tre_municipal_Roanne_8.jpg',
  } as Photo,
  portrait: { src: '/images/pierre-colas.webp', credit: '', creditHref: '' } as Photo,
  investir: pexels(4947281),
  vente: pexels(7578875),
};

export const OG_IMAGE =
  'https://images.pexels.com/photos/8293737/pexels-photo-8293737.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop';

export const NAV_LINKS = [
  { href: '/acheter', label: 'Acheter' },
  { href: '/investir', label: 'Investir' },
  { href: '/vendre', label: 'Vendre' },
  { href: '/honoraires', label: 'Honoraires' },
  { href: '/qui-suis-je', label: 'Qui suis-je' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
];

// Liens « Décrire mon projet » : le formulaire lit ces paramètres pour pré-cocher les choix.
export const projetHref = (params: Record<string, string | string[]> = {}) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) q.set(k, Array.isArray(v) ? v.join('|') : v);
  const s = q.toString();
  return '/projet' + (s ? '?' + s : '');
};
export const PROJET_ACHAT = '/projet';
export const PROJET_VENTE = projetHref({ mode: 'vente' });
export const PROJET_INVEST = projetHref({ projet: 'Investissement locatif' });

export const ENVIES = [
  { k: 'M', t: 'Maison avec jardin', tone: 'accent', href: projetHref({ types: ['Maison'], exterieur: ['Jardin'], projet: 'Résidence principale' }) },
  { k: 'A', t: 'Appartement centre-ville', tone: 'sage', href: projetHref({ types: ['Appartement'], environnement: 'Centre-ville', communes: ['Roanne'] }) },
  { k: '1er', t: 'Premier achat', tone: 'neutral', href: projetHref({ primo: 'Oui, premier achat', projet: 'Résidence principale' }) },
  { k: '€', t: 'Investissement locatif', tone: 'accent', href: PROJET_INVEST },
  { k: 'IR', t: 'Immeuble de rapport', tone: 'sage', href: projetHref({ projet: 'Investissement locatif', types: ['Immeuble de rapport'], strategie: ['Immeuble de rapport'] }) },
  { k: 'PP', t: 'Plain-pied', tone: 'neutral', href: projetHref({ types: ['Maison'], equipements: ['Plain-pied'] }) },
  { k: '%', t: 'Faire estimer mon bien', tone: 'accent', href: PROJET_VENTE },
] as const;

export const OFFMARKET = [
  { n: '01', bg: 'var(--color-accent)', t: 'Un réseau de partenaires', d: "Des contacts locaux me signalent les biens qui vont se vendre : successions, mutations, propriétaires qui ne veulent pas d'annonce publique." },
  { n: '02', bg: 'var(--color-accent-2-500)', t: 'Des agents immobiliers partenaires', d: "Je travaille avec des agences du Roannais : j'accède à leurs mandats, y compris ceux qui ne sont pas encore publiés, et je vous présente les meilleurs." },
  { n: '03', bg: 'var(--color-neutral-700)', t: 'Vous passez en premier', d: 'Moins de concurrence, plus de marge de négociation : un bien vu avant les autres se négocie mieux.' },
];

export const BENEFITS = [
  { n: '01', t: 'Économisez sur le prix', d: 'Avec mon expérience de la négociation, je fais baisser le prix pour vous : 10 % ou plus en moyenne sur le prix affiché.' },
  { n: '02', t: 'Les gros travaux repérés', d: "Toiture, structure, électricité, chauffage, humidité : mon œil d'investisseur repère les gros postes de travaux et vous aiguille avant l'offre." },
  { n: '03', t: 'Un compte rendu de visite', d: 'Après chaque visite, un compte rendu écrit : points forts, travaux à prévoir et prix conseillé pour votre offre.' },
];

export const SERVICES = [
  { photo: pexels(7578987), alt: 'Couple qui visite une maison', tag: 'Résidence principale · Investissement', t: 'Chasse de bien', d: 'Je cherche, qualifie, visite et négocie votre résidence principale ou votre investissement locatif.', cta: 'Découvrir', href: '/acheter' },
  { photo: pexels(7937330), alt: "Visite d'un bien avec le chasseur", tag: 'Sur devis', t: 'Visite & compte rendu', d: 'Vous avez repéré un bien ? Je le visite et vous remets un compte rendu écrit : gros postes de travaux, prix conseillé.', cta: 'Prendre rendez-vous', href: '/rendez-vous' },
  { photo: pexels(18908045), alt: 'Estimation, plan ou façade', tag: 'Offerte', t: 'Estimation', d: 'Un avis de valeur argumenté, au prix réel du marché roannais.', cta: 'Estimer mon bien', href: PROJET_VENTE },
  { photo: pexels(7641858), alt: 'Poignée de main, remise de clés', tag: 'Vendeurs', t: 'Mise en relation acheteurs', d: "Je présente votre bien à ma base d'acheteurs en recherche active pour vous trouver un acquéreur.", cta: 'Présenter mon bien', href: '/vendre' },
];

export const OBJECTIONS = [
  {
    k: '« Je peux chercher seul »', t: 'Oui, mais pas avec les mêmes armes.', bg: 'var(--color-surface)',
    items: [
      "Les biens off-market que me signalent mon réseau et mes agents immobiliers partenaires n'apparaissent pas sur les sites d'annonces.",
      'Je négocie en moyenne 10 % ou plus sous le prix affiché : souvent plus que mes honoraires.',
      "Mon œil d'investisseur repère les gros travaux que l'on découvre trop tard.",
      'Vous ne visitez que les biens qui valent le déplacement.',
    ],
  },
  {
    k: "« Je ne veux pas m'engager »", t: "Vous n'avez rien à signer pour commencer.", bg: 'var(--color-accent-100)',
    items: [
      'Le premier appel est gratuit et sans engagement.',
      'Votre fiche de recherche ne vous engage à rien.',
      "Le mandat de recherche n'est signé que lorsque vous décidez de lancer la chasse.",
      `Seulement ${OFFER.studyPrice} € pour démarrer : l'étude de votre projet, qui valide votre recherche. Mes honoraires de recherche ne sont dus qu'à la signature chez le notaire.`,
    ],
  },
];

// TODO avant mise en ligne : remplacer ces 6 exemples inventés par de vraies recherches anonymisées.
export const RECHERCHES = [
  { tag: 'Résidence principale', t: 'Maison 4 chambres', lieu: 'Riorges · Mably', crit: ['Jardin', 'Garage', 'Proche écoles'], budget: '280 000 €', when: 'Cette semaine' },
  { tag: 'Investissement', t: 'Immeuble 3 à 5 lots', lieu: 'Roanne centre', crit: ['Rendement ≥ 8 %', 'Gare à pied'], budget: '400 000 €', when: 'Il y a 3 jours' },
  { tag: 'Premier achat', t: 'Appartement T3', lieu: 'Roanne · Le Coteau', crit: ['Balcon', 'Ascenseur', 'Sans travaux'], budget: '140 000 €', when: 'Il y a 5 jours' },
  { tag: 'Résidence principale', t: 'Plain-pied 3 chambres', lieu: 'Villerest · Commelle-Vernay', crit: ['Terrain 800 m²', 'Calme'], budget: '250 000 €', when: 'Ce mois-ci' },
  { tag: 'Investissement', t: 'T2 meublé', lieu: 'Roanne', crit: ['Proche gare', 'Rentabilité'], budget: '90 000 €', when: 'Ce mois-ci' },
  { tag: 'Résidence secondaire', t: 'Maison de caractère', lieu: 'Côte roannaise · Renaison', crit: ['Vue dégagée', "Charme de l'ancien"], budget: '320 000 €', when: 'Ce mois-ci' },
];

export const STEPS = [
  { n: '1', t: 'Le brief', d: 'Nous définissons ensemble votre projet : budget, secteur, critères essentiels et financement.' },
  { n: '2', t: 'La chasse & la négociation', d: "Biens off-market grâce à mon réseau et à mes agences partenaires, et veille quotidienne. Je visite, j'évalue les travaux, je vous envoie un compte rendu, puis je négocie le prix et les conditions : c'est là que vous économisez." },
  { n: '3', t: 'Les clés', d: "Compromis, financement, acte : je vous accompagne jusqu'au notaire." },
];

export const COMMUNES_AFFICHEES = ['Roanne', 'Riorges', 'Mably', 'Le Coteau', 'Villerest', 'Commelle-Vernay', 'Perreux', 'Renaison', 'Saint-Romain-la-Motte', 'Ouches', 'Lentigny', 'Saint-Léger-sur-Roanne', 'Charlieu', 'Saint-Haon-le-Châtel'];

export const PROFILS = [
  { bg: 'var(--color-accent-2-700)', fg: 'var(--color-bg)', t: 'Résidence principale ou secondaire', d: "Vous cherchez le lieu où vous allez vivre. Je m'occupe de tout ce qui vous prend du temps.", items: ['Cahier des charges précis et réaliste', 'Accès aux biens avant leur mise en ligne', 'Visites filtrées, comptes rendus photo et vidéo', "Négociation et suivi jusqu'à l'acte"] },
  { bg: 'var(--color-surface)', fg: 'var(--color-text)', t: 'Investissement locatif', d: 'Vous cherchez un rendement. Je cherche les biens qui tiennent leurs promesses.', items: ['Immeubles de rapport et petits collectifs', 'Étude de rentabilité nette par bien', 'Estimation des travaux avec artisans locaux', 'Recherche possible à distance', 'Mise en relation gestion locative'] },
];

export const INCLUS = [
  { n: '01', t: 'Étude de votre projet', d: 'Faisabilité, budget et financement validés ensemble.' },
  { n: '02', t: 'Accès off-market', d: 'Biens pas encore en ligne grâce à mon réseau et aux agents immobiliers partenaires, en plus de la veille des annonces.' },
  { n: '03', t: 'Qualification des biens', d: "Tout ce que l'annonce ne dit pas, vérifié." },
  { n: '04', t: 'Visites et comptes rendus', d: 'Photos, points forts, gros postes de travaux et prix conseillé.' },
  { n: '05', t: 'Estimation de chaque bien', d: 'Valeur réelle et travaux éventuels.' },
  { n: '06', t: 'Négociation', d: 'Au meilleur prix, dans votre intérêt.' },
  { n: '07', t: "Sécurisation de l'achat", d: "Diagnostics, PV d'AG, urbanisme, délais." },
  { n: '08', t: 'Partenaires de confiance', d: 'Courtier, notaire, artisans, gestionnaire.' },
];

export const DISTANCE = [
  { n: '1', t: 'Brief en visio', d: '30 minutes pour fixer budget, stratégie (meublé, colocation, immeuble), rendement visé et secteurs.' },
  { n: '2', t: 'Visites pour vous', d: 'Je visite seul, en vidéo si vous le souhaitez, et vous envoie un compte rendu écrit : état, travaux chiffrés, loyers du marché.' },
  { n: '3', t: 'Offre et négociation', d: 'Je négocie le prix sur la base des travaux et du rendement réel. Offre et compromis peuvent se signer électroniquement.' },
  { n: '4', t: 'Signature et mise en location', d: 'Procuration possible chez le notaire. Je vous mets en relation avec des artisans et des gestionnaires locaux.' },
];

export const CHECKLIST = [
  { t: 'Loyer réel du marché', d: "Pas le loyer espéré : celui qui se pratique vraiment dans la rue, selon la surface et l'état." },
  { t: 'Gros postes de travaux', d: "Toiture, structure, électricité, plomberie, humidité, chauffage : chiffrés avant l'offre." },
  { t: 'DPE et obligations', d: 'Logements classés G interdits à la location depuis 2025, F en 2028 : le coût de la rénovation est intégré au calcul.' },
  { t: 'Copropriété ou monopropriété', d: 'Charges, travaux votés, état des parties communes, compteurs séparés pour un immeuble.' },
  { t: 'Demande locative', d: 'Proximité de la gare, du centre, des écoles et des employeurs : ce qui garde un logement loué.' },
  { t: 'Prix de revente', d: 'Un bon investissement se revend aussi : je vérifie la liquidité du secteur.' },
];

export const VENTE_STEPS = [
  { n: '01', t: 'Estimation offerte', d: 'Visite de votre bien et avis de valeur argumenté, au prix réel du marché roannais.' },
  { n: '02', t: 'Fiche de votre bien', d: 'Photos et informations clés, préparées pour mes acheteurs.' },
  { n: '03', t: 'Mise en relation', d: 'Je présente votre bien aux acheteurs de ma base dont la recherche correspond, financement vérifié.' },
  { n: '04', t: 'Vous restez maître', d: 'Vous vendez en direct, avec votre notaire. Je ne suis pas une agence et ne prends pas de mandat de vente.' },
];

export const VALEURS = [
  { t: 'Un investisseur avant tout', d: "Plus de 40 logements achetés en 5 ans : je regarde chaque bien avec l'œil de quelqu'un qui achète." },
  { t: 'Un ancrage local', d: 'Roanne et ses alentours, ses quartiers, ses notaires et ses artisans.' },
  { t: 'Transparence totale', d: 'Comptes rendus honnêtes, même quand un bien ne vaut pas le déplacement.' },
];

// Version « étude de projet » retenue pour les 250 € : plus de mention d'acompte.
export const FAQ: [string, string][] = [
  ["Qu'est-ce qu'un chasseur immobilier ?", "Un professionnel mandaté par l'acheteur, et uniquement par lui. Il recherche, qualifie, visite et négocie les biens à votre place, puis vous accompagne jusqu'à la signature chez le notaire."],
  ['Quand dois-je payer ?', `Mes honoraires de recherche (${OFFER.feeRate} du prix d'achat, minimum ${OFFER.feeMin}) sont dus uniquement le jour de la signature de l'acte authentique chez le notaire. Seule l'étude de votre projet (${OFFER.studyPrice} €), une prestation de conseil distincte, est facturée au démarrage.`],
  ['Et si vous ne trouvez pas de bien ?', `Vous ne payez pas d'honoraires : ils ne sont dus qu'en cas d'achat. L'étude de projet (${OFFER.studyPrice} €) vous reste acquise : budget, stratégie et cahier des charges écrit sont à vous, que la chasse aboutisse ou non.`],
  [`Pourquoi une étude de projet à ${OFFER.studyPrice} € ?`, `Parce que je consacre beaucoup de temps à chaque recherche, je travaille avec des clients engagés. L'étude de projet (${OFFER.studyPrice} €) est une prestation de conseil à part entière : budget et financement vérifiés, secteurs et stratégie définis, cahier des charges écrit remis. Mes honoraires de recherche, eux, ne sont dus qu'à la signature de l'acte.`],
  ["Pouvez-vous visiter un bien que j'ai repéré ?", 'Oui. Je le visite et vous remets un compte rendu écrit : gros postes de travaux, points de vigilance et prix conseillé pour votre offre. Tarif sur devis selon le bien.'],
  ['Combien de temps dure une recherche ?', 'En moyenne quelques semaines dans le Roannais, selon la rareté des biens recherchés et votre budget. Je vous fais un point à chaque étape.'],
  ['Sur quel secteur intervenez-vous ?', 'Roanne et environ 30 km autour : Riorges, Mably, Le Coteau, Villerest, Commelle-Vernay, Perreux, Renaison, Charlieu et alentours.'],
  ["Qu'est-ce qu'un bien off-market ?", "Un bien à vendre qui n'est pas (encore) publié en ligne. Grâce à mon réseau de partenaires et aux agents immobiliers avec qui je travaille, j'en suis informé avant les autres acheteurs : vous visitez en premier, avec moins de concurrence."],
  ['Dois-je visiter tous les biens ?', 'Non. Je visite d\'abord pour vous et ne vous présente que les biens qui correspondent réellement à votre cahier des charges, avec photos, vidéo et compte rendu.'],
  ['Puis-je investir sans habiter la région ?', 'Oui. Pour un investissement locatif, je peux gérer la recherche à distance : visites en visio, rentabilité estimée, mise en relation avec un gestionnaire et des artisans.'],
  ['Êtes-vous une agence immobilière ?', "Non. Je ne suis pas une agence : je n'ai ni vitrine ni annonces, et je travaille uniquement pour vous, l'acheteur. Je collabore en revanche avec des agents immobiliers partenaires pour accéder à leurs meilleurs biens."],
  ["Pouvez-vous m'aider à vendre ?", "Oui, gratuitement : je vous propose une estimation offerte et une mise en relation avec ma base d'acheteurs en recherche active. Vous vendez ensuite en direct, avec votre notaire."],
];

export type Article = { slug: string; cat: string; t: string; ex: string; meta: string; photo: Photo; body: { h: string; p: string }[] };

export const ARTICLES: Article[] = [
  {
    slug: 'cout-chasseur-immobilier-roanne', cat: 'Honoraires', t: 'Chasseur immobilier à Roanne : combien ça coûte vraiment ?', ex: 'Honoraires au succès, négociation, compte rendu de visite : ce que vous payez, et ce que vous économisez.', meta: '5 min de lecture', photo: pexels(7641858),
    body: [
      { h: "Pas d'honoraires de recherche avant l'achat", p: "La loi Hoguet interdit à un chasseur immobilier de percevoir des honoraires de recherche avant la signature de l'acte définitif. Méfiez-vous de toute demande d'acompte sur honoraires pour « lancer la recherche ». Une prestation de conseil distincte, comme une étude de projet, est autre chose : elle vous remet un travail concret et vous reste acquise." },
      { h: 'Des honoraires uniquement au succès', p: `Mes honoraires, ${OFFER.feeRate} du prix d'achat avec un minimum de ${OFFER.feeMin}, sont dus le jour de la signature chez le notaire. Pas d'achat, pas d'honoraires.` },
      { h: 'Ce que vous économisez', p: "Une négociation bien menée, les gros postes de travaux repérés avant l'offre et des biens écartés avant que vous ne vous déplaciez : le coût d'un chasseur se rentabilise souvent dès la négociation." },
    ],
  },
  {
    slug: 'acheter-roanne-quartiers-communes', cat: 'Acheter', t: 'Acheter à Roanne : les quartiers et communes à connaître', ex: 'Centre-ville, bords de Loire, Riorges, Mably, Le Coteau : quel secteur pour quel projet ?', meta: '6 min de lecture', photo: PHOTOS.roanne,
    body: [
      { h: 'Le centre de Roanne', p: 'Appartements anciens, commerces et gare à pied : idéal pour un premier achat ou un investissement locatif proche des services.' },
      { h: 'Riorges et Mably', p: 'Des maisons avec jardin, des écoles et un cadre résidentiel recherché par les familles, à quelques minutes du centre.' },
      { h: 'Les communes autour', p: "Villerest, Commelle-Vernay ou la Côte roannaise offrent plus d'espace et de calme, avec un temps de trajet à anticiper." },
    ],
  },
  {
    slug: 'investissement-locatif-roannais-rendement', cat: 'Investir', t: 'Investissement locatif dans le Roannais : mes conseils pour un bon rendement', ex: 'Après plus de 40 logements achetés, voici les critères que je vérifie avant chaque offre.', meta: '7 min de lecture', photo: pexels(7078045),
    body: [
      { h: 'Raisonner en rendement net', p: 'Taxe foncière, charges, travaux, vacance locative et gestion : le rendement qui compte est celui qui reste une fois tout payé.' },
      { h: "Chiffrer les travaux avant l'offre", p: "Faire visiter un artisan avant de s'engager évite les mauvaises surprises et donne des arguments solides pour négocier." },
      { h: 'Penser au locataire', p: 'Proximité des transports, des commerces et des écoles : un bien facile à louer est un bien qui se loue vite.' },
    ],
  },
  {
    slug: 'premier-achat-etapes', cat: 'Acheter', t: 'Premier achat : les étapes pour acheter sereinement', ex: 'Financement, visites, offre, compromis, acte : le parcours complet, sans jargon.', meta: '6 min de lecture', photo: pexels(7641906),
    body: [
      { h: 'Valider son budget', p: 'Avant la première visite, une simulation avec un courtier ou votre banque fixe un budget réaliste, frais de notaire compris.' },
      { h: 'Visiter avec méthode', p: 'Une grille de critères, des questions préparées et une contre-visite pour les biens qui vous plaisent vraiment.' },
      { h: "De l'offre à l'acte", p: "Offre écrite, compromis, délai de rétractation, obtention du prêt puis signature chez le notaire : comptez en général trois mois." },
    ],
  },
  {
    slug: 'mandat-de-recherche', cat: 'Mandat', t: "Mandat de recherche : ce qu'il faut savoir avant de signer", ex: 'Durée, honoraires, engagement : les points à vérifier dans votre mandat.', meta: '4 min de lecture', photo: pexels(23224997),
    body: [
      { h: 'Un document obligatoire', p: 'Le mandat de recherche est le contrat qui autorise un chasseur immobilier à rechercher un bien pour votre compte.' },
      { h: "Ce qu'il doit préciser", p: 'Le bien recherché, le budget, la durée, les honoraires et les conditions de résiliation doivent y figurer clairement.' },
      { h: 'Vous restez décisionnaire', p: "C'est vous qui signez l'offre, le compromis et l'acte. Le chasseur vous conseille et vous accompagne." },
    ],
  },
  {
    slug: 'vendre-maison-roanne-estimer-prix', cat: 'Vendre', t: 'Vendre sa maison à Roanne : bien estimer son prix', ex: "Le bon prix dès le départ, c'est une vente plus rapide et une négociation maîtrisée.", meta: '5 min de lecture', photo: pexels(18908045),
    body: [
      { h: 'Partir des ventes réelles', p: "Les prix affichés ne sont pas les prix de vente. Une estimation sérieuse s'appuie sur les transactions récentes du secteur." },
      { h: 'Les points qui font varier le prix', p: 'DPE, travaux à prévoir, extérieur, stationnement et exposition pèsent lourd dans la décision des acheteurs.' },
      { h: 'Éviter le prix trop haut', p: 'Un bien surévalué reste en ligne, perd en attractivité et finit souvent vendu en dessous de sa vraie valeur.' },
    ],
  },
];

export const SEO_LINKS = ['Investir à distance Roannais', 'Simulateur rentabilité locative Roanne', 'Chasseur immobilier Roanne', 'Chasseur immobilier Riorges', 'Chasseur immobilier Mably', 'Chasseur immobilier Le Coteau', 'Achat maison Roanne', 'Investissement locatif Roanne', 'Achat immeuble Roanne', 'Immeuble de rapport Roanne', 'Estimation immobilière Roanne', 'Vendre sa maison dans le Roannais'];

export const KEYWORDS = "chasseur immobilier Roanne, chasseur immo Roanne, Pierre Colas chasseur immobilier, blog immobilier Roanne, conseils achat immobilier Roanne, chasseur appartement Roanne, chasseur maison Roanne, achat immobilier Roanne, investissement locatif Roanne, estimation immobilière gratuite Roanne, vendre maison Roanne, immobilier Riorges, immobilier Mably, immobilier Le Coteau, immobilier Villerest, Roannais, Loire 42, Par Terre et Pierre Immobilier, immeuble Roanne, achat immeuble Roanne, immeuble de rapport Roanne, investir dans un immeuble Roanne, chasseur immeuble Roanne, immeuble à vendre Roanne, immeuble Roannais, bien off-market Roanne, off market immobilier Roanne, biens hors marché Roannais";

export const META: Record<string, [string, string]> = {
  accueil: ['Chasseur immobilier à Roanne | Ton Chasseur Immo Roannais — Par Terre & Pierre Immobilier', "Chasseur immobilier à Roanne et alentours : accès aux biens off-market, recherche, visites, négociation et accompagnement jusqu'à la remise des clés. Achat de maison, appartement ou immeuble, investissement locatif, vente et estimation gratuite. Par Terre & Pierre Immobilier."],
  investir: ['Investissement locatif à Roanne : chasseur pour investisseurs', "Immeubles de rapport et investissement locatif dans le Roannais, même à distance : recherche, chiffrage des travaux, négociation. Simulateurs de rentabilité et de capacité d'emprunt."],
  acheter: ['Acheter une maison, un appartement ou un immeuble à Roanne', 'Résidence principale, investissement locatif ou immeuble de rapport à Roanne : je cherche, visite, chiffre les travaux et négocie pour vous.'],
  vendre: ['Vendre son bien à Roanne : estimation gratuite', 'Estimation offerte et mise en relation avec des acheteurs en recherche active à Roanne et alentours.'],
  honoraires: ['Honoraires chasseur immobilier Roanne : 3 % TTC au succès', `${OFFER.feeRate} du prix d'achat, minimum ${OFFER.feeMin}, dus uniquement à la signature de l'acte. Étude de projet à ${OFFER.studyPrice} € pour démarrer.`],
  apropos: ['Pierre Colas, chasseur immobilier à Roanne', 'Investisseur depuis 5 ans, plus de 40 logements achetés : Pierre Colas met son expérience au service de votre achat.'],
  faq: ['Questions fréquentes | Chasseur immobilier Roanne', 'Honoraires, délais, secteur, compte rendu de visite : toutes les réponses sur la chasse immobilière à Roanne.'],
  projet: ['Décrire mon projet immobilier | Ton Chasseur Immo Roannais', "Décrivez votre projet d'achat ou de vente en 2 minutes : je vous recontacte sous 24 h, hors week-end."],
  blog: ['Conseils immobiliers dans le Roannais | Blog', "Acheter, investir et vendre à Roanne : conseils d'un investisseur, plus de 40 logements achetés."],
  rdv: ['Prendre rendez-vous | Chasseur immobilier Roanne', 'Réservez un appel gratuit de 20 minutes avec Pierre Colas.'],
  mentions: ['Mentions légales & confidentialité | Ton Chasseur Immo Roannais', 'Mentions légales, données personnelles et cookies.'],
};
