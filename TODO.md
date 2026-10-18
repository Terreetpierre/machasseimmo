# Avant la mise en ligne

## À fournir ou compléter
- [ ] Mentions légales (`src/pages/mentions-legales.astro`) : assureur RC Pro et n° de contrat, hébergeur (Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis), médiateur de la consommation.
- [ ] Remplacer les 6 « recherches en cours » inventées (`RECHERCHES` dans `src/data/site.ts`) par de vraies recherches anonymisées.
- [ ] Logo (le favicon est un « T » provisoire : `public/favicon.svg`).
- [ ] Vérifier le portrait utilisé sur l'accueil et « Qui suis-je » (`public/images/pierre-colas.webp`, repris de la maquette).

## Juridique
- [ ] Faire valider par un avocat ou la CCI l'« étude de projet à 250 € » facturée au démarrage, à côté du mandat de recherche (loi Hoguet, art. 6). Le site la présente partout comme une prestation de conseil distincte, jamais comme un acompte.
- [ ] Carte T : le site indique qu'elle est en cours ; mettre à jour le texte (honoraires, mentions, pied de page) à sa délivrance.

## Technique
- [ ] Back-office : créer la base Neon dans Vercel (Storage), ajouter `ADMIN_PASSWORD` et `CLAUDE_API_TOKEN`, redéployer, puis se connecter sur `/admin`.
- [ ] Ajouter au rendez-vous de découverte les questions de Pierre (captures d'écran à venir) dans `src/islands/form-schema.ts`.
- [ ] Créer le compte Resend, vérifier le domaine, renseigner les variables d'environnement Vercel (voir README).
- [ ] Faire un envoi test du formulaire et du rendez-vous une fois en ligne.
- [ ] Télécharger les photos Pexels / Wikimedia et les héberger dans `public/images` (elles sont actuellement chargées depuis leurs sites d'origine), en gardant les crédits.
- [ ] Brancher le nom de domaine `tonchasseurimmo-roannais.fr` dans Vercel.
- [ ] Prise de rendez-vous : c'est une demande envoyée par email, pas un agenda synchronisé. Brancher Calendly / Google Agenda si besoin.
