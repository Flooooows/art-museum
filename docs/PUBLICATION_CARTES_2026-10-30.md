# Livraison des cartes et raretés humaines — 30 octobre 2026

Livraison explicitement demandée pour le jeu https://muse-collection-6f2d.web.app/#pochettes, à partir des trois réponses utilisateur conservées dans `private/imports/`.

## Périmètre

- **353 cartes disponibles** : 100 existantes conservées et **253 nouvelles** admissibles dans le contrôle UE actuel (239 de Cleveland, 14 du Louvre).
- Les **100 cartes existantes** utilisent maintenant la rareté finale choisie par l'utilisateur, sans modifier leurs identifiants, images originales, appartenances ou exemplaires acquis.
- Les 253 nouvelles cartes utilisent également leur rareté humaine, jamais la proposition de l'algorithme. Répartition active : **170 Esquisse, 91 Étude, 61 Composition, 25 Œuvre, 6 Pièce maîtresse**.
- Les **747 autres nouvelles cartes illustrées** retenues mais encore `REVIEW_REQUIRED` ne sont pas ajoutées par cette livraison. Trois cartes `BLOCKED` restent exclues, même si l'export comporte une rareté ; les deux autres blocages concernent des notices non illustrées. Aucune rareté n'est inventée pour les 39 notices de recherche.
- Les 100 cartes historiques ne reçoivent pas une nouvelle approbation juridique implicite : cette livraison en conserve la disponibilité antérieure et met à jour leur classement humain. Les nouveaux ajouts, eux, exigent tous `AUTO_APPROVED_EU`.

Les ajouts rejoignent l'univers général Beaux-Arts (peintures, dessins, estampes, photographies et sculptures) ou Arts décoratifs pour l'objet d'arts du métal. Les six identifiants d'univers et les familles de cadres restent inchangés ; aucune œuvre n'est artificiellement classée dans Égypte, Mythes ou Premières traces pour remplir une pochette.

## Séparation de l'histoire et du catalogue actif

`src/catalog/seed.json`, les trois catalogues de revue et les anciennes propositions restent **inchangés**. La source active ajoute une livraison indépendante :

- `src/catalog/game-release.json` : livraison **`game-2026-10-30-d985529a3c5c`** activée pour le jeu.
- `catalog/game-release/<id>/release.json` : copie figée de cette livraison.
- `catalog/game-release/<id>/manifest.json` : empreintes, exports humains de référence, sources et décompte des dossiers non publiés.
- `src/catalog/gameRelease.ts` : garde de publication propre aux choix humains, sans fabriquer de notes pour satisfaire l'ancienne grille algorithmique.
- `scripts/game-release/prepare.ts` : préparation explicitement autorisée, à partir des exports privés et des preuves actuelles. Télécharge uniquement les fichiers CC0 approuvés ; réutilise les 14 images de candidates déjà contrôlées.
- `scripts/game-release/audit.ts` : contrôle en lecture seule de la livraison active, des sources, choix humains, dossiers juridiques et 253 rasters.

Les sources historiques de `src/data.ts` et du contrôle d'intégrité V2 sont conservées dans `catalog/history/pre-game-publication/`, avec une correspondance explicite. Les anciennes empreintes restent vérifiées sur ces sources originales ; aucune valeur attendue n'est remplacée pour accepter la migration. Les tests métier et de publication portent sur le code actif. Les modifications de données protégées non archivées restent refusées.

Les exports humains complets, leur ZIP et les historiques de décisions restent privés. Seuls les niveaux effectivement activés et leurs références d'audit sont inclus dans le catalogue du jeu. Le déploiement ne copie ni les exports, ni les notices de revue en attente, ni les sources de recherche.

## Reproductions et informations des fiches

Les nouvelles images sont locales dans `public/assets/game-release/` : environ **40,55 Mio**, 253 WebP. Les fichiers Cleveland sont redimensionnés proportionnellement dans 1600×1600 sans agrandissement ni recadrage ; les images du Louvre sont copiées octet pour octet depuis les fichiers contrôlés des candidates. Les originaux téléchargés de Cleveland restent en cache local dans `/tmp/opencode/muse-game-publication/downloads/`, avec URL, date et SHA-256 ; les sources originales des cadres restent intactes.

Chaque nouvelle fiche affiche titre, auteur, datation, technique, contexte, musée, inventaire, rareté humaine, crédit de reproduction, lien de notice, lien du fichier source et licence ou justification de réutilisation UE. Les obligations et l'absence de soutien suggéré du musée sont explicites. Les notices Cleveland CC0 peuvent fournir un extrait en langue originale, clairement étiqueté ; les textes factuels français ne prétendent pas être des anecdotes historiques inventées.

## Compatibilité des collections et tirages

La clé `muse-collection-v1`, le format version 1, les identifiants existants, les quantités, favoris et expositions sont conservés. Les dernières pochettes de trois ou cinq cartes restent lisibles. Le déploiement **n'offre pas automatiquement** les nouvelles cartes : elles peuvent être découvertes dans de nouveaux tirages ou dans le catalogue.

Les probabilités généralistes restent **56,1 / 25,5 / 15 / 3 / 0,4 %** par carte. Les pochettes thématiques continuent leur renormalisation entre niveaux présents. Cinq cartes par nouvelle ouverture ; aucun quota de cartes rares n'a été imposé à la banque pour ajuster ces taux.

## Vérifications

- `npm run check` : **131 tests**, typages, audits historiques et juridiques, contrôle de la livraison active et décodage des 253 nouvelles images réussis.
- `npm run build` et `npm run build:atelier` réussis ; l'atelier et ses décisions ne sont pas modifiés par cette intégration au jeu.
- Les 353 notices institutionnelles restent distinctes ; les catalogues et rares états historiques sont préservés. Le bundle contient davantage de métadonnées et de preuves : avertissement Vite de taille attendu (environ 2,6 Mo minifiés, 209 ko gzip), pas une erreur de compilation.
- Versions compilée puis en ligne : les **253 nouvelles fiches** ont été ouvertes et vérifiées sur ordinateur, et 21 cas représentatifs par autre combinaison de taille/thème ont été testés (390/1440 px, clair/sombre). Rareté humaine, image entière, crédit et liens musée/fichier/réutilisation concordants ; aucun débordement horizontal ni erreur JavaScript dans ces parcours.
- Ancienne collection complète conservée, reprise d'une ancienne pochette de trois cartes, tirage forcé d'une nouvelle carte dans une pochette de cinq, sauvegarde, rechargement, export/import, favoris et musée personnel vérifiés dans des navigateurs isolés. Aucun état personnel réel du navigateur n'a été importé ou remplacé pour les tests.
- Parcours général supplémentaire : 28 captures compilées des quatre pages, aperçu d'ouverture, cinq résultats et fiche, à 390/1440 px et en clair/sombre ; aucun débordement horizontal ni erreur JavaScript.

`npm run game:check` est en lecture seule. `game:prepare` est une préparation éditoriale datée, pas une commande de démarrage : elle requiert les exports privés, garde ses sorties figées et refuse d'écraser une autre livraison. Une livraison suivante doit être préparée et activée explicitement avec conservation de celle-ci.

## Déploiement

**Publié le 30 octobre 2026 à 16:13:13 UTC**, version Firebase Hosting **`0f54dfd34fd60ef4`**.

Publication ciblée du jeu uniquement : `firebase deploy --only hosting --config firebase.muse.json --project muse-collection-6f2d --non-interactive`. L'atelier n'a pas été redéployé et ses catalogues et réponses restent inchangés. Aucun commit/push Git.

Les **446 fichiers en ligne** correspondent au build vérifié, dont 253 nouvelles images et 60 dérivés/masques de cadres ; paquet total d'environ **92,10 Mio**, pas un téléchargement complet à chaque visite. L'HTML est servi sans cache. Les chemins testés des exports privés, de `state.zip`, des données de revue et des originaux de cadres restent inaccessibles sur le jeu (404).

Journaux, preuves de déploiement, exports synthétiques et captures : `/tmp/opencode/muse-game-publication/`. Recharger la page du jeu pour recevoir la nouvelle version ; conserver un export de sa collection et éviter de travailler simultanément dans une ancienne version encore ouverte dans un autre onglet.
