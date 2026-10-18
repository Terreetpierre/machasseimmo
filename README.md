# Ton Chasseur Immo Roannais — site

Site vitrine de Pierre Colas (Terre & Pierre Immobilier), construit avec [Astro](https://astro.build) à partir de la maquette Claude Design « Organic ».

- Pages statiques (accueil, acheter, investir, vendre, honoraires, qui suis-je, blog, FAQ, rendez-vous, mentions légales).
- Composants interactifs en Preact : formulaire « Décrire mon projet », prise de rendez-vous, simulateurs de rentabilité et de capacité d'emprunt.
- Une seule fonction serveur : `POST /api/projet`, qui envoie chaque formulaire par email avec la fiche de recherche JSON en pièce jointe.

## Développement

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # build de production (sortie Vercel dans .vercel/output)
npm run check    # vérification TypeScript
```

## Modifier le contenu

Presque tous les textes, chiffres et coordonnées sont dans `src/data/site.ts` (offre, FAQ, articles du blog, recherches en cours, communes…). Les questions du formulaire sont dans `src/islands/form-schema.ts`.

Couleurs, polices et arrondis : `src/styles/organic.css` (design system Organic, à ne pas dupliquer ailleurs).

## Formulaire

- `/projet` : formulaire court pour les clients (2 minutes).
- `/projet?complet=1` : formulaire détaillé pour les appels avec les clients (7 étapes, avec affichage et téléchargement de la fiche JSON).
- Pré-remplissage par l'URL, par exemple `/projet?mode=vente` ou `/projet?projet=Investissement%20locatif&types=Maison|Appartement&budget=250000`.

## Déploiement sur Vercel

1. Placer le contenu de ce dossier à la racine du dépôt GitHub relié à Vercel (ou régler « Root Directory » sur `site` dans Vercel).
2. Vercel détecte Astro automatiquement : aucun réglage de build n'est nécessaire.
3. Dans Vercel → Settings → Environment Variables, ajouter :

| Variable | Rôle |
| --- | --- |
| `RESEND_API_KEY` | Clé API [Resend](https://resend.com) (envoi des emails, offre gratuite suffisante). |
| `MAIL_FROM` | Expéditeur, ex. `Ton Chasseur Immo <noreply@tonchasseurimmo-roannais.fr>`. Le domaine doit être vérifié dans Resend. |
| `MAIL_TO` | Destinataire (par défaut `contact@libertinvest.fr`). |
| `FICHES_WEBHOOK_URL` | Facultatif : URL qui reçoit aussi chaque fiche JSON (Google Sheets via Apps Script, Make, Zapier…) pour l'archiver et permettre une recherche automatique. |

Sans `RESEND_API_KEY` ni `FICHES_WEBHOOK_URL`, le formulaire affiche un message d'erreur invitant à appeler.
