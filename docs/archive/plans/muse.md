# Construire MUSE à partir des maquettes

## Purpose / Big Picture

Transformer les quatre maquettes statiques en site utilisable : choisir une pochette gratuite, l’ouvrir, découvrir trois cartes, lire leur histoire, retrouver ses acquisitions et les exposer. Les données invitées persistent dans ce navigateur. Le rendu reprend les compositions, les couleurs et les images des maquettes ; les textes de blockchain et de spéculation sont remplacés par le fonctionnement culturel de `concept.md`.

## Progress

- [x] (2026-10-29, UTC+8) Lecture du concept et des quatre références ; validation React + TypeScript et sauvegarde locale.
- [x] (2026-10-29 08:40 UTC+8) Création de l’application, vingt reproductions sourcées et polices locales avec licences.
- [x] (2026-10-29 08:48 UTC+8) Parcours pochettes, atelier, révélation, collection, fiche et musée ; import/export local.
- [x] (2026-10-29 08:58 UTC+8) Huit tests de logique, compilation, parcours navigateur, seize captures desktop/mobile et contrôles de contraste réussis.
- [x] (2026-10-29 09:04 UTC+8) Relecture indépendante finale : deux corrections demandées, appliquées et jugées résolues (lisibilité mobile et erreurs d’import dans le dialogue).
- [x] (2026-10-29 09:03 UTC+8) Documentation du système visuel dans `DESIGN.md` et `.impeccable/design.json`, contrôlée après écriture ; référence utilisateur préservée.

## Surprises & Discoveries

Le dossier ne contient pas d’application, uniquement des maquettes. Les promesses cryptographiques, taux privilégiés et prix des maquettes contredisent le concept. Les compositions restent la référence, mais ces promesses ne seront pas reprises.

Certains visuels sources contiennent de la navigation incrustée ; les trois décors principaux sont recadrés par `scripts/crop-assets.mjs`. Les ressources de musées et de polices sont locales, donc aucun appel externe n’est nécessaire pour les afficher. Les prises de vue automatisées doivent charger explicitement les images différées avant d’attendre leur décodage ; attendre une image hors écran sans demander son chargement peut bloquer une capture, sans incidence sur le site.

## Decision Log

Décision : React, TypeScript et Vite, avec sauvegarde locale explicitement annoncée. Raison : choix confirmé par l’utilisateur, sans infrastructure fournie. Date : 2026-10-29.

Décision : paramètres de démonstration de trois cartes, dix pochettes maximum, une recharge toutes les dix minutes ; taux par carte 55/25/13/6/1 %. Raison : rendre l’esquisse testable sans prétendre trancher les paramètres encore ouverts dans le concept. Ces paramètres seront affichés comme provisoires. Date : 2026-10-29.

Décision : ne pas forcer la présence de tous les niveaux de rareté dans les petits catalogues. Les poids de tirage sont renormalisés entre les niveaux effectivement disponibles, et l’atelier affiche les taux correspondants. Seule La Joconde est classée Pièce maîtresse dans ce contenu de démonstration. Raison : respecter l’interdiction de promouvoir artificiellement une œuvre pour remplir un quota. Date : 2026-10-29.

## Outcomes & Retrospective

Les quatre écrans sont opérationnels, avec fiches culturelles, vue d’ensemble des catalogues, favoris, musée personnel et sauvegarde transférable. Les comptes distants, paiements et échanges multijoueurs sont hors de cette version locale et explicitement présentés comme non activés. Le choix d’une version locale permet de vérifier le parcours sans promettre une infrastructure inexistante.

Livraison terminée : les deux corrections de relecture sont résolues, les tests et la compilation passent, la version compilée fonctionne dans une session neuve sans message en console. Le système visuel exécuté est documenté à la racine avec ses tokens et son fichier compagnon ; les documents fournis par l’utilisateur restent intacts.

## Context and Orientation

Les références restent intactes dans `stitch_booster_pack_opening_platform/`. `src/data.ts` contiendra les catalogues et les œuvres, `src/collection.ts` la sauvegarde et les tirages, `src/App.tsx` les écrans, `src/styles.css` le système visuel. Les images servies seront locales dans `public/assets/`, avec leur origine dans un manifeste. `index.html` sera l’entrée Vite. Une pochette est une sélection de trois cartes ; un catalogue est un ensemble d’œuvres à compléter ; la possession est le nombre d’exemplaires conservés pour chaque œuvre.

## Plan of Work

Créer d’abord la configuration Vite et les données sourcées. Implémenter les tirages pondérés et la recharge avec des fonctions testables. Construire l’accueil proche de la boutique fournie, puis le rituel sombre et la révélation de trois cartes. Ajouter collection, filtres, catalogues, fiche détaillée et exposition. Terminer par les états vide, stock épuisé, sauvegarde indisponible, clavier et petit écran.

## Concrete Steps

Depuis `/home/ubuntu/art-booster`, exécuter `npm install`, puis `npm run dev -- --host 0.0.0.0`. Le site s’ouvre sur le port 5173. `npm run build` vérifie TypeScript et produit `dist/`. `npm test` vérifie les tirages, la recharge, la validation de sauvegarde et les doublons. Utiliser le navigateur pour ouvrir une pochette et vérifier que les cartes restent après rechargement.

## Validation and Acceptance

L’accueil montre le stock et les cinq pochettes accessibles. Une ouverture enlève exactement une pochette et ajoute trois exemplaires une seule fois, même après rechargement. La révélation distingue nouvelles cartes et exemplaires supplémentaires. Les filtres combinent recherche, famille, catalogue, rareté et possession. Une fiche montre l’œuvre entière, une anecdote, ses métadonnées et une source externe. Les favoris et œuvres exposées persistent. Les vues à 320, 390, 768, 1280 et 1440 pixels ne débordent pas horizontalement. Le site respecte la réduction des animations.

Résultats observés : `npm test` retourne 8 réussites, 0 échec. `npm run build` compile TypeScript puis produit `dist/`. Les parcours navigateur ont vérifié ouverture générale et thématique, révélations simple/complète/rapide, recherche, filtres, pagination, états vides, favoris, exposition, export téléchargé, rejet d’un import invalide, annulation et confirmation d’un import valide, persistance et animations réduites. Axe ne signale aucune violation WCAG 2 A/AA sur les six écrans/variantes contrôlés lors du dernier passage ; il s’agit d’une vérification automatisée, pas d’une certification d’accessibilité.

## Idempotence and Recovery

Ne pas modifier les références. Les dépendances peuvent être réinstallées sans perte de données. Le stockage utilise une clé versionnée et valide ses entrées. Une sauvegarde corrompue est ignorée avec avertissement. Exporter et importer sa collection permet de la transférer ; une importation exige une confirmation avant remplacement. Aucun effacement automatique de progression valide.

## Artifacts and Notes

Captures de vérification dans `.impeccable/review/`. Les commandes et résultats finaux seront ajoutés à ce plan.

    npm test : tests 8, pass 8, fail 0
    npm run build : 1585 modules transformed, build réussi
    npm audit --omit=dev : found 0 vulnerabilities
    impeccable embed-prompt --scan public/assets : 35 rasters, 0 missing

Le détecteur visuel n’a signalé que l’emploi d’Inter ; cette police est explicitement imposée par le système des maquettes et a été conservée. Les captures de détail et de profil montrent le viewport, car les dialogues se parcourent avec leur propre défilement.

## Interfaces and Dependencies

React et React DOM pour les écrans, Vite pour le développement et la compilation, TypeScript pour les types, lucide-react pour les icônes. Tests Node avec tsx. `drawPack(catalogId, random)` retourne trois identifiants, `refreshStock(state, now)` applique la recharge hors ligne, `openPack(state, catalogId, now, random)` retourne une nouvelle sauvegarde ou une erreur de stock vide. Aucun service distant nécessaire au fonctionnement une fois les fichiers chargés.

Note initiale : plan créé après validation de la base technique ; les valeurs de démonstration ne sont pas des décisions produit définitives.

Mise à jour finale technique : parcours et validations terminés, règles de distribution précisées pour les catalogues sans tous les niveaux. La documentation et la relecture finale restent le dernier jalon.

Mise à jour de relecture : les deux corrections matérielles ont été validées avec la disposition `ship` pour ce passage de corrections. `REVIEW.md` dans `.impeccable/review/` conserve le périmètre exact des vérifications. La compilation de production a été relancée après ces corrections.

Mise à jour de livraison : documentation reçue et vérifiée, aucun jalon restant. Le serveur de développement est disponible sur le port 5173 ; la prévisualisation compilée a été vérifiée sur 4173.

Mise à jour après retour utilisateur sur la lisibilité : `src/appearance.css` établit une échelle lisible, un en-tête persistant et des couleurs sémantiques clair/sombre. `src/theme.ts` et `src/useTheme.ts` gèrent la préférence indépendante de la collection ; trois tests ajoutés portent le total à onze réussites. Les trente-six combinaisons de largeur/thème/écran et la version compilée ont été vérifiées. La relecture indépendante conclut `ship` ; détails dans `.impeccable/review/APPEARANCE.md`. Le système visuel et son fichier compagnon reflètent ces changements autorisés. Aucun jalon restant.
