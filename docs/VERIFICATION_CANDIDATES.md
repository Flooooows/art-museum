# Vérification du lot des nouvelles candidates

Livraison du 30 octobre 2026 : [page Firebase](https://art-museum-8fdd8-atelier.web.app/masterpieces.html), version `masterpieces-818ec04f3f8db6b3`.

## Données et séparation

64 objets exacts, 25 recommandations illustrées, 17 admissibles différés et 22 cas sans licence d’image établie. Les pistes générales restent distinctes des objets vérifiés. Les images n’ont été téléchargées qu’après approbation, puis réduites sans recadrage. Les 25 rasters publics ont été téléchargés à nouveau et leurs empreintes comparées aux fichiers locaux : toutes identiques.

Le catalogue initial public garde son SHA-256 `c39fe57cb4353b4d624a204f6ed78329859e9d1df76275098597196bd13b9451`, sa version et ses 1 000 œuvres. Les 100 fiches du jeu sont protégées par les tests historiques. L’audit du véritable export utilisateur retrouve 722 décisions et 278 œuvres non revues ; l’original et son empreinte sont inchangés. Aucun export utilisateur n’est dans les assets publics.

Le moteur V2 2.0.0 / configuration 2.0.0-draft.1 reste inchangé. Les tests recalculent les 64 propositions et vérifient les empreintes d’entrée et d’implémentation. Distribution des ajouts : 0/12/11/2/0 ; aucune nouvelle Pièce maîtresse imposée. Les 25 propositions sont provisoires.

## Vérifications exécutées

- `npm test` : **84 tests réussis**, dont 8 spécifiques aux candidates.
- `npm run build` et `npm run build:atelier` : réussis. Les avertissements préexistants concernant cinq cadres Japon non activés restent inchangés. Les polices de l’atelier, copiées après Vite, sont présentes dans le résultat.
- `npx tsc -b` et typage strict explicite des scripts `scripts/masterpieces/*.ts` : réussis.
- `npm run rarity:v2:verify` : exécution historique `02b68c195210ea3536d84c1a` identique sur deux calculs hors réseau.
- Navigateur Chromium : 25 images chargées, aucun choix par défaut, rareté exclusive, quatre états de sélection, rechargement, export/import après confirmation, filtres et recherche vide. Choix d’une notice sans image restauré après rechargement.
- Stockage : la sauvegarde de l’ancien atelier reste identique après les actions des candidates ; une sauvegarde corrompue n’est pas écrasée et les nouveaux choix en mémoire restent exportables.
- Accessibilité automatisée axe WCAG 2/2.1 A/AA : aucun signalement sur les candidates aux largeurs 320/390/768/1440, en clair et sombre. Contrôle supplémentaire du carnet déplié à 320/1440, sans signalement. Atelier d’origine également contrôlé aux quatre largeurs après ajout du lien.
- Aucun débordement horizontal aux largeurs vérifiées. Six captures clair/sombre examinées pour la hiérarchie, les reproductions entières et les contrôles.
- Détecteur Impeccable : seul avis sur une taille 17 px, corrigée à 16 px. Ce détecteur regex et axe ne remplacent pas une évaluation humaine complète ; aucune revue indépendante n’est prétendue.
- Après publication : HTTP 200, 25 cartes, 64 notices, aucune présélection, persistance et navigation aller-retour avec l’atelier vérifiées dans un navigateur réel.

Captures et export de test sous `output/playwright/masterpieces-*`. Ce sont des artefacts du navigateur automatisé, pas des choix de l’utilisateur ni des données publiques initiales.

## Publication

Le CLI global pointait vers le disque Windows monté et a expiré avant le déploiement. Reprise réussie avec le CLI npm sous Linux :

    npx --yes --package firebase-tools firebase deploy --only hosting --project art-museum-8fdd8 --non-interactive

La sortie désigne uniquement `hosting[art-museum-8fdd8-atelier]`, 141 fichiers. `firebase.json` conserve ce site explicite. Aucun déploiement du site principal ni activation de cartes, choix humains, économie ou probabilités.
