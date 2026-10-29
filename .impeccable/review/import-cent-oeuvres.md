# Revue de livraison — cent œuvres

2026-10-29. Revue de l’agent principal, pas une validation indépendante de notoriété ni un avis juridique universel.

## Résultat

Cent fiches réellement consultables et tirables : vingt anciennes intactes et quatre-vingts nouvelles en français. Cent reproductions contrôlées individuellement : 80 CC0 Cleveland, 19 Open Access/domaine public Met, une déclaration PD-Art Commons pour La Joconde avec sa réserve de juridiction. Six pochettes thématiques ; 102 appartenances pour cent identifiants uniques. Les raretés restent provisoires, sans score de notoriété inventé. Aucun hébergement ou déploiement ajouté.

Les taux généralistes par carte sont fer 56,1 %, cuivre 25,5 %, argent 15 %, or 3 %, lapis-lazuli 0,4 %. Les thèmes renormalisent les niveaux présents. Les seuils de score 30/50/70/90, les cinq cartes par pochette et les anciens résultats de trois sont préservés.

## Contrôles effectués

- 31 tests réussis, dont limites du 0,4 %, appartenance aux six catalogues, droits structurés, attributions nuancées et compatibilité des sauvegardes.
- Audit `catalog:images` : 100 fichiers JPEG décodés, empreintes et preuves cohérentes. Les vingt originaux ont les mêmes pixels décodés que les téléchargements contrôlés malgré leurs métadonnées différentes ; aucun n’a été remplacé.
- Comparaison pré/post import : vingt objets `works` strictement identiques, mêmes identifiants et URLs pour leurs images ; seuls droits et preuves enrichis.
- Import relancé sans duplication ni changement de texte ; scripts Python compilés sans erreur.
- Build TypeScript/Vite réussi et audit des images intégré. L’augmentation de catalogue a initialement dépassé l’avis de 500 ko par fichier ; séparation explicite de React/react-dom/client : chunk React 221,27 ko, application 325,43 ko, sans cet avertissement. Pas de limite arbitrairement relevée.
- Audit strict de publication : échec attendu pour 100 raretés provisoires, aucun blocage de droits restant. Les 100 blocages complets restent accessibles avec `--json`, l’affichage courant en résume dix.
- Playwright sur le serveur de développement : recherche et ouverture des 80 nouvelles fiches ; titre, anecdote et histoire exacts, source exacte, crédit CC0 et bonne reproduction décodée, sans débordement du dialogue.
- Accueil avec les six thèmes à 390/1440 px dans les deux thèmes : pas de débordement ; quatre audits axe WCAG 2/2.1 A/AA sans violation.
- Nouvelles ouvertures de Premières traces et Renaissance italienne : cinq cartes, stock réel et membres corrects ; cadres Préhistoire actifs sur les vrais objets néolithiques.
- Playwright sur le build servi à `http://localhost:4173` : taux exacts dont 0,4 %, six thèmes, ouverture immédiate de cinq cartes importées, fiche longue avec crédit et image dans les quatre combinaisons clair/sombre × 390/1440. Six audits axe supplémentaires sans violation.
- Sur ce même build : import d’une sauvegarde historique de trois cartes avec catalogue `beaux-arts`, reprise/révélation de trois sans ajout, nouvelle pochette de cinq, export réel puis réimport exact et rechargement sans perte.
- Détecteur Impeccable exécuté une fois sur les cibles de données modifiées : `[]`. Pas de nouveau CSS ni de nouvelle palette.

## Inspection visuelle

Captures examinées : accueil clair bureau et sombre téléphone, probabilités sombres, résultats néolithiques et fiche longue en clair/bureau et sombre/téléphone. Les deux nouvelles pochettes utilisent leurs vraies reproductions ; les rangées reprennent la composition existante et les métadonnées ne sont pas réduites. Les œuvres entières gardent leur rapport dans les fenêtres des cadres. Les contrôles et le bas des longues fiches restent accessibles par défilement du dialogue.

## Artefacts et limites

`output/playwright/verify-import-100.js` et `verify-cent-production.js` décrivent les parcours ; captures `cent-*` et export `cent-production-export.json`. Ces fichiers et les inventaires de test ne sont pas publics et ne changent pas l’état initial du site. `catalog/IMPORT-100.md` explique la sélection et les licences ; `catalog/evidence/` conserve les réponses sources ; `catalog/image-rights-review.json` relie chaque fichier à sa preuve.

L’accès aux images documentées a orienté la sélection, sans prétention de représenter toute l’histoire mondiale de l’art. Quelques fiches ont une documentation institutionnelle limitée : leurs incertitudes restent explicites. Les cadres, booster et illustrations fournis par l’utilisateur ne sont pas couverts par la revue des cent reproductions et leur licence n’est pas inventée. Les cinq cadres Japon restent non activés, comme avant. Pas de relecture indépendante prétendue, pas de commit ni livraison distante.
