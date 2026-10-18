# Brancher Claude sur le back-office

Claude lit les fiches de recherche (réponses du client + rendez-vous de découverte + statut + notes) par un lien protégé par une clé. Il ne peut rien modifier.

## Les deux adresses

```
GET https://www.tonchasseurimmo-roannais.fr/api/claude/clients
GET https://www.tonchasseurimmo-roannais.fr/api/claude/clients?statut=recherche
GET https://www.tonchasseurimmo-roannais.fr/api/claude/clients/12
En-tête : Authorization: Bearer <CLAUDE_API_TOKEN>
```

Filtres possibles : `statut` (`nouveau`, `a_rappeler`, `decouverte`, `recherche`, `offre`, `achete`, `perdu`) et `type` (`achat`, `vente`, `rdv`).

Chaque fiche contient notamment `brief_recherche` (une phrase prête à servir de consigne), `localisation`, `criteres`, `investissement`, `financement`, `notes_pierre` et `decouverte_faite`.

## Consigne type pour une recherche automatique

À utiliser dans une tâche planifiée Claude (par exemple chaque matin), avec la clé enregistrée dans les secrets de l'environnement sous le nom `CLAUDE_API_TOKEN` :

> Récupère les fiches en recherche active :
> `curl -s -H "Authorization: Bearer $CLAUDE_API_TOKEN" "https://www.tonchasseurimmo-roannais.fr/api/claude/clients?statut=recherche"`.
> Pour chaque client, cherche les annonces publiées depuis hier qui respectent ses critères (communes et rayon, type de bien, budget maximum FAI, surface, DPE, état, critères indispensables et rédhibitoires, rendement pour les investisseurs) sur les sites d'annonces immobilières. Tiens compte de ses notes. Écarte ce qui dépasse le budget de plus de 10 %.
> Rends un récapitulatif par client : 3 à 5 annonces au maximum, avec le lien, le prix, la surface, et en une phrase pourquoi elle correspond et ce qui serait à vérifier.

Garder la clé secrète : quiconque la possède peut lire les fiches clients. Pour la changer, modifier `CLAUDE_API_TOKEN` dans Vercel et redéployer.
