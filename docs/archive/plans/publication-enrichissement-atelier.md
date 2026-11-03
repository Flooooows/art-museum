# Publier la revue des 78 nouvelles candidates dans l’atelier Firebase

## Purpose / Big Picture

L’utilisateur demande explicitement d’ajouter l’enrichissement à `https://art-museum-8fdd8-atelier.web.app/masterpieces.html`. Cette autorisation remplace l’interdiction de déploiement de la préparation initiale, uniquement pour la revue de l’atelier. Les cartes du jeu, l’économie et les décisions existantes restent intactes.

## Progress

- [x] (2026-10-30 UTC+8) Vérifier la cible Hosting et les versions : millier `review-1000-b069bbaeeecc561d`, premier lot `masterpieces-818ec04f3f8db6b3`, nouveau lot `masterpieces-9c6020dde274cede`.
- [x] (2026-10-30 UTC+8) Ajouter un choix entre lots à `/masterpieces.html`, nouveau lot de 78 par défaut, ancien lot de 25 à `?lot=initial`, stockages indépendants inchangés.
- [x] (2026-10-30 UTC+8) Étendre la liste explicite des ressources de l’atelier aux 78 images et à leur catalogue ; maintenir l’exclusion du site de jeu.
- [x] (2026-10-30 UTC+8) Régénérer les empreintes documentaires ; 93 tests, TypeScript et build atelier réussis. Contrôler 220 fichiers sans jeu, caches ni décisions, avec les trois catalogues identiques aux originaux.
- [x] (2026-10-30 UTC+8) Revue visuelle indépendante de l’extension : ship, sans correction matérielle. Détecteur ciblé vide. Les fichiers de système de design restent inchangés, car cette navigation reprend l’identité existante.
- [x] (2026-10-30 UTC+8) Déployer uniquement Hosting du projet `art-museum-8fdd8` ; Firebase confirme release complete / Deploy complete. En ligne : 78/25 cartes, 78 images décodées, export/import et sauvegardes distinctes vérifiés. Choix de test retirés après restauration de l’état initial.
- [x] (2026-10-30 UTC+8) Consigner `catalog/enrichment-351/deployment.json` et actualiser les deux guides ; aucune commande ne cible le jeu.

## Context and Orientation

Le dossier de recherche est décrit dans `execplan/enrichissement-351.md`. `src/masterpieces/main.tsx` sélectionne le lot depuis l’URL, `batches.ts` fixe les liens et la clé du nouveau lot, et `CandidateApp.tsx` réutilise la même interface. Les deux catalogues ne sont pas fusionnés : modifier la version ou les identifiants du premier rendrait les exports historiques incompatibles. Les 78 cartes ont leur propre version, sans rareté humaine initiale.

`firebase.json` cible le site `art-museum-8fdd8-atelier` et le dossier `dist-atelier`. `vite.atelier.config.ts` compile les deux entrées existantes ; `scripts/prepare-atelier-hosting.ts` copie seulement les catalogues/images explicitement validés, polices et favicon. Ne pas copier tout `public/`, les caches de recherche ou les références humaines. `firebase.muse.json` doit continuer à exclure ce lot du site de jeu.

## Plan of Work

Préserver les fichiers publics historiques octet pour octet. Montrer une navigation par liens ordinaires dans la revue, accessible au clavier, indiquant le lot actif. Le nouveau lot est ouvert à l’adresse demandée ; le premier reste disponible par un lien explicite et conserve sa clé `muse:masterpieces-review:v1`. Le nouveau lot garde `muse:enrichment-351-review:v1` ; le millier garde `muse:rarity-review:v1`. Les imports d’un autre lot restent refusés, et aucun événement n’est migré silencieusement.

Générer à nouveau le dossier pour actualiser ses empreintes de code, sans recalculer les catalogues historiques ni les droits. Vérifier les tests, TypeScript, le build et le contenu de `dist-atelier`. Déployer avec Firebase CLI npm, en précisant projet, config et `--only hosting`. Consommer les erreurs comme erreurs, pas comme succès. Vérifier ensuite le site réel, ses catalogues et ses images avant d’annoncer la publication.

## Concrete Steps

Depuis `/home/ubuntu/art-booster`, utiliser `npx tsx scripts/enrichment-351/build.ts`, `npm test`, `npx tsc -b` et `npm run build:atelier`. Déploiement autorisé : `npx --yes --package firebase-tools firebase deploy --only hosting --config firebase.json --project art-museum-8fdd8 --non-interactive`. Aucune commande ne cible `muse-collection-6f2d`.

## Validation and Acceptance

L’URL demandée affiche 78 cartes avec images et scores ; le lien Premier lot affiche ses 25 cartes et ses anciens choix. Les deux JSON historiques et celui du nouveau lot gardent leurs empreintes/version. Un choix de chaque lot reste après navigation et rechargement sans toucher la troisième clé. Export/import du nouveau lot fonctionne en ligne. `dist-atelier` ne contient ni jeu, ni référence humaine, ni caches de recherche. Le jeu conserve ses 100 fiches et probabilités.

## Idempotence and Recovery

Les données de review restent versionnées et les catalogues historiques sont protégés par empreintes. Un nouvel essai de compilation/déploiement n’efface pas `localStorage`. Si une vérification en ligne échoue, ne pas annoncer la réussite ; corriger le paquet et publier uniquement la cible autorisée. Ne pas réécrire un export pour contourner un conflit de version.

## Surprises & Discoveries

La configuration d’atelier excluait volontairement les nouveaux fichiers et son préparateur ne copiait que le premier lot. Les deux verrous doivent être ajustés ; publier le seul JavaScript produirait une revue sans catalogue ni images. La limite de 100 cartes du parseur n’impose aucune modification : garder deux lots indépendants plutôt qu’un nouveau catalogue fusionné de 103 cartes.

## Decision Log

Décision (assistant, 2026-10-30) : publier deux lots à la même adresse avec paramètre de navigation, plutôt que remplacer le catalogue historique. Motif : satisfaire le lien demandé tout en préservant les exports et décisions. La préparation historique reste documentée comme telle ; le déploiement demandé ensuite possède sa preuve séparée.

## Outcomes & Retrospective

Publication achevée et vérifiée sur le site Firebase réel : l’adresse demandée affiche les 78 nouvelles œuvres, le lien Premier lot conserve les 25 précédentes et leur version. Les trois JSON répondent 200 avec `no-cache` et leurs empreintes exactes. Les essais du build local ont été répétés en ligne : images, mobile, navigation entre lots, persistance et export/import réussissent. Les décisions de test n’ont pas été laissées comme choix humains. Aucun déploiement du jeu ni changement de ses données.

Révision initiale : portée fondée sur la nouvelle autorisation explicite de l’utilisateur, sans activation du catalogue du jeu.

Révision finale : résultat de déploiement et contrôles en ligne consignés ; le dossier initial sans déploiement reste historique, et la preuve séparée clarifie le changement d’autorisation.
