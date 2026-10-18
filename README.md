# Ton Chasseur Immo Roannais — site

Site vitrine de Pierre Colas (Terre & Pierre Immobilier), construit avec [Astro](https://astro.build) à partir de la maquette Claude Design « Organic ».

- Pages statiques (accueil, acheter, investir, vendre, honoraires, qui suis-je, blog, FAQ, rendez-vous, mentions légales).
- Composants interactifs en Preact : formulaire « Décrire mon projet », prise de rendez-vous, simulateurs de rentabilité et de capacité d'emprunt.
- Une fonction serveur `POST /api/projet` : chaque formulaire est enregistré dans le back-office et envoyé par email avec la fiche de recherche JSON en pièce jointe.
- Un back-office privé sur `/admin` (voir plus bas) et un accès en lecture pour Claude (`/api/claude/clients`).

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

1. Importer le dépôt GitHub dans Vercel (Add New → Project).
2. Vercel détecte Astro automatiquement : aucun réglage de build n'est nécessaire.
3. Dans Vercel → Settings → Environment Variables, ajouter :

| Variable | Rôle |
| --- | --- |
| `RESEND_API_KEY` | Clé API [Resend](https://resend.com) (envoi des emails, offre gratuite suffisante). |
| `MAIL_FROM` | Expéditeur, ex. `Ton Chasseur Immo <noreply@chasseurimmoroanne.com>`. Le domaine doit être vérifié dans Resend. |
| `MAIL_TO` | Destinataire (par défaut `contact@libertinvest.fr`). |
| `DATABASE_URL` | Base Postgres du back-office. Dans Vercel : Storage → Create Database → **Neon** (offre gratuite), reliée au projet : la variable est ajoutée automatiquement. La table se crée toute seule. |
| `ADMIN_PASSWORD` | Mot de passe du back-office : au moins 12 caractères, unique (sinon le back-office reste fermé). |
| `SESSION_SECRET` | Recommandé : une longue chaîne aléatoire qui signe la connexion. La changer déconnecte toutes les sessions ouvertes. |
| `CLAUDE_API_TOKEN` | Clé d'accès de Claude aux fiches (au moins 24 caractères aléatoires). |
| `FICHES_WEBHOOK_URL` | Facultatif : URL qui reçoit aussi chaque fiche JSON (Google Sheets via Apps Script, Make, Zapier…) pour l'archiver et permettre une recherche automatique. |

Après avoir ajouté ou modifié une variable, redéployer (onglet Deployments → Redeploy).

Si aucun canal ne fonctionne (ni base, ni email, ni webhook), le formulaire affiche un message d'erreur invitant à appeler.

## Back-office (`/admin`)

- **Mes clients** : toutes les demandes du site (achat, estimation, rendez-vous) dans un tableau, avec recherche, filtre par statut et boutons « + Nouvel acheteur / vendeur » pour les clients venus par téléphone.
- **Fiche client** : coordonnées (appel, WhatsApp, email en un clic), statut, notes, réponses données sur le site, et le **rendez-vous de découverte** : le questionnaire complet, pré-rempli avec les réponses du client, à compléter pendant l'appel. Tout s'enregistre automatiquement (ou Ctrl+S).
- Les questions de la découverte viennent de `src/islands/form-schema.ts` (étapes `profil`, `secteur`, `bien`, `invest`, `financement`, `contact`, `vbien`) : ajouter une question = ajouter une ligne.

## Sécurité

- Back-office : connexion par mot de passe (cookie signé, `HttpOnly`, `Secure`, `SameSite=Lax`, 30 jours), contrôlée dans le middleware **et** dans chaque route. 10 essais max par IP sur 15 minutes.
- Formulaires publics : champ piège anti-robots, 5 envois max par IP sur 10 minutes, réponses filtrées et limitées en taille.
- Base de données : requêtes paramétrées uniquement (pas d'injection SQL possible).
- En-têtes sur tout le site : `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`, CSP `frame-ancestors 'none'` (ajoutés à la configuration Vercel par `src/lib/security-headers.mjs`). Back-office et API : `Cache-Control: private, no-store` et `noindex`.
- Claude : lecture seule, clé de 24 caractères minimum comparée en temps constant.
- `npm audit` signale `path-to-regexp` dans l'adaptateur Vercel : utilisé seulement au moment du build pour générer les routes, jamais sur des données de visiteurs. À mettre à jour quand l'adaptateur publiera un correctif.

## Accès de Claude

Voir `CLAUDE-RECHERCHE.md`.
