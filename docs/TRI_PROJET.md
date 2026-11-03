# Bilan du tri — 30 octobre 2026

Rangement effectué à la demande de l'utilisateur à partir de [l'audit](AUDIT_PROJET.md), sur la base du commit `0b9ba0f`. Pas de commit, push, collecte de recherche ni déploiement dans cette opération. Les sites Firebase publiés restent inchangés jusqu'à une publication ultérieure explicitement demandée.

**Suite demandée ensuite :** le jeu a été publié après une nouvelle vérification ; l'atelier était déjà identique à sa version en ligne. Voir le [compte rendu de vérification et publication](VERIFICATION_FIREBASE_2026-10-30.md).

## Retiré du fonctionnement courant

- Entrée locale redondante `review-351.html`, son montage `src/enrichment-351/main.tsx`, sa configuration Vite et la commande `build:enrichment`. Utiliser `/masterpieces.html` et le build/preview complet de l'atelier.
- Ancien build généré `dist-enrichment-351/` et les deux fichiers Windows `:Zone.Identifier`.
- Ancien bootstrap `scripts/fetch-assets.py` et son recadrage `scripts/crop-assets.mjs`, conservés comme texte non exécutable dans `docs/archive/bootstrap/` plutôt que proposés comme outils de mise à jour.
- Quatre illustrations sans usage courant retirées de `public/assets/`, conservées dans `references/illustrations/` avec leur provenance historique.
- **217 règles CSS retirées**, soit **1 003 lignes** : 178 règles de `styles.css` et 39 de `appearance.css`. Les clauses obsolètes des sélecteurs partagés ont été retirées individuellement ; les déclarations encore utiles et leur ordre sont conservés. Les composants `Pack` et `Opening`, les règles de probabilités, de collection et de dialogues ne sont pas supprimés.

Ce nettoyage est volontairement conservateur : il ne s'agit pas d'une suppression aveugle de toute classe absente d'une capture. Les autres styles partagés restent en place, sans refonte ni réorganisation de la cascade.

## Rangé et conservé

| Ancien emplacement | Emplacement actuel |
| --- | --- |
| Quatre livrables `masterpieces-*` à la racine | `catalog/masterpieces/reports/` : `candidates.json`, `candidates.md`, `import-preview.json`, `rights-review.md` |
| Trois livrables `enrichment-351-*` à la racine | `catalog/enrichment-351/reports/` : `results.json`, `review.json`, `REPORT.md` |
| Deux documents utilisateur des 351 entrées | `catalog/enrichment-351/input/` : `candidates.json`, `README.md` |
| `execplan/` | `docs/archive/plans/`, douze plans terminés |
| Comptes rendus `.impeccable/review/*.md` | `docs/archive/reviews/`, historiques non réécrits |
| Ancien contrat de surface cumulatif | `docs/archive/reviews/surface-contract.md`, nouveau résumé courant dans `.impeccable/surface.md` |
| `stitch_booster_pack_opening_platform/` | `references/mockups/`, fichiers originaux inchangés |
| Deux images `exemplecarte*.png` | `references/cards/`, originaux inchangés |
| `session` et export humain à la racine | `private/context/session` et `private/backups/`, ignorés par Git |

Le pointeur privé `catalog/masterpieces/manual-reference.local.json` a été adapté au nouvel emplacement de l'export, sans changer son empreinte. Les autres données privées éventuelles n'ont pas été recherchées, fusionnées ou remplacées.

Les originaux des cadres, les cinq sources `output/imagegen/`, les captures institutionnelles, preuves juridiques, anciennes méthodes et exécutions figées restent conservés. Le document utilisateur `MUSE_systeme_rarete.md` reste intact à sa position protégée ; l'index signale qu'il ne décrit pas le V2 actuel.

## Intégrité des calculs historiques

Les neuf rapports et documents d'entrée déplacés sont **identiques octet pour octet** à leur état initial. Aucun catalogue public, score, identifiant, probabilité, clé de stockage ou format d'export n'a changé.

Le rangement oblige à adapter sept scripts maintenus. Leurs sources originales et les trois anciennes entrées de validation sont conservées dans `catalog/history/pre-cleanup/`. Le manifeste `catalog/history/layout-2026-10-30.json` documente ces dix archives et les neuf déplacements.

Les tests vérifient toujours les **empreintes originales**. `scripts/project-files.ts` résout les anciens chemins logiques et vérifie les sources explicitement archivées lorsque le code maintenu a évolué. Les assertions n'ont pas été retirées et aucune valeur de hash attendue n'a été remplacée pour accepter le tri. Les tests métier restent exercés sur le code maintenu, pas sur les copies archivées.

Les anciennes sources archivées ne constituent pas un deuxième jeu de scripts à lancer. Pour retrouver un environnement antérieur complet, utiliser le commit de référence dans un espace distinct ; ne pas écraser les sources maintenues ou les données personnelles.

## Documentation et outillage

- README recentré sur les deux apps, les liens et le démarrage avec Git LFS.
- Index `docs/README.md`, état actuel, architecture/state, contribution et procédure des cadres ajoutés.
- Guides de l'atelier, du multi-PC et de l'enrichissement actualisés ; ancien lien des 25 candidates corrigé.
- Produit et concept distinguent ce qui est livré des abonnements, transactions et récompenses futurs. Les mentions de quatre univers sont corrigées vers six dans le registre visuel.
- Les anciens plans et rapports ne sont pas réécrits pour prétendre qu'ils décrivaient déjà l'état actuel. Leurs chemins historiques sont interprétables depuis les index d'archives et le manifeste de rangement.
- `.nvmrc` fixe Node 24 ; `tsconfig.tools.json` inclut les scripts maintenus et les configurations Vite dans le typage. `npm run check` rassemble les contrôles existants. `preview:atelier` sert le bon paquet de revue.
- Quatre tests de rangement ajoutés : résolution des chemins, archives exactes, rejet d'une mauvaise empreinte et séparation des cadres originaux/dérivés.

## Publication allégée

`firebase.muse.json` exclut désormais les PNG originaux directement dans `assets/collections/`, **pas** les réductions/masques de `collections/display/`.

La liste locale éligible à un futur déploiement du jeu passe d'environ **122,15 Mio à 49,34 Mio** : 193 fichiers, avec les 60 dérivés/masques conservés. Les 35 originaux restent disponibles localement pour la préparation et les tests. Ce chiffre décrit le paquet de publication, pas un téléchargement à chaque visite. Le build Vite principal copie encore les originaux dans `dist/` avant leur exclusion par Hosting ; ils ne sont pas détruits.

## Vérifications

- `npm run check` : typages réussis, **97 tests réussis**, catalogue et 100 reproductions valides.
- `npm run build` et `npm run build:atelier` : réussis. Avertissements Japon préexistants attendus ; polices effectivement copiées après le build atelier.
- Les trois catalogues du build atelier sont identiques aux fichiers publics de référence ; polices et ressources nécessaires présentes.
- Comparaison SHA-256 des entrées, données et images : aucun changement métier. Export humain original conservé avec son SHA-256 attendu.
- Chromium : **28 vues de jeu avant/après**, clair/sombre, 390/1440 px : quatre pages, aperçu d'ouverture, cinq résultats et fiche ; aucun débordement horizontal ni erreur JavaScript. Vingt-sept captures sont identiques pixel pour pixel ; la dernière présente neuf composantes RGB différentes sur 4,32 millions, sans changement de disposition constaté. Captures représentatives inspectées visuellement.
- Revue du millier et lots de candidates : contrôles navigateur de choix, rechargement, export/import et images locales, avec sauvegardes de test isolées, jamais les choix personnels.
- Liens relatifs de la documentation contrôlés ; `git diff --check` sans erreur.

Les captures, exports de test et journaux de cette opération restent dans `/tmp/opencode/muse-cleanup/`, hors du dépôt et des sites.

## Reste à faire, hors tri

La protection contre les conflits d'onglets des candidates n'est pas ajoutée ici. Aucun compte, backend, migration éditoriale ou automatisation CI n'est créé. Les preuves historiques restent conservées ; une future modification métier ou un nouveau calcul doit être versionné explicitement plutôt que maquillé en simple rangement.
