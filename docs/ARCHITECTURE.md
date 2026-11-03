# Architecture et state

## Jeu

`index.html` → `src/main.tsx` → `App.tsx` → Pochettes / Marché / Collection / Profil. L'ouverture et les fiches sont des dialogues, pas des pages supplémentaires.

`src/catalog/seed.json` reste le socle historique de 100 fiches. `catalog/model.ts` le valide et `catalog/repository.ts` l'expose sans migration implicite. `src/catalog/game-release.json` ajoute une livraison explicite de 911 cartes et les raretés humaines des 100 existantes ; `catalog/gameRelease.ts` exige les preuves humaines et juridiques originales, refuse `BLOCKED` et accepte `REVIEW_REQUIRED` uniquement avec autorisation explicite limitée aux identifiants et au catalogue concernés. `data.ts` projette ce jeu actif de 1 011 cartes sans modifier le socle. Les qualifications juridiques ne sont pas transformées par l'autorisation de publication. `collection.ts` contient les fonctions pures de tirage, recharge et import ; `packRules.ts` sépare les probabilités de la rareté éditoriale.

`App.tsx` conserve le state React et le persiste sous `muse-collection-v1` : exemplaires, favoris, musée, stock, recharge, compteur et dernier tirage. Les résultats anciens de trois cartes restent compatibles. L'import remplace après confirmation ; l'export ne modifie rien. Le jeu est sombre dès `index.html`, sans sélecteur ni lecture de l’ancienne préférence `muse-theme`. `useTheme.ts` et cette clé restent disponibles pour les revues de l’atelier, sans effet sur le jeu.

`src/catalog/taxonomy.json` est une projection de classement indépendante : douze types principaux exclusifs, quatre thèmes secondaires, et preuves de chaque appartenance. `catalog/taxonomy.ts` en contrôle la couverture totale et `scripts/catalog-taxonomy/audit.ts` vérifie les sources et effectifs. Les catalogues visibles sont distincts des deux anciens fourre-tout cachés mais conservés pour lire les anciens derniers tirages. Les couvertures proviennent de cartes réellement membres ; les anciens pointeurs de cadres restent des métadonnées historiques sans effet visuel depuis leur retrait. Les filtres type et thème sont combinables.

La cascade du jeu ajoute à `styles.css` → `appearance.css` → `navigation.css` → `frames.css` les styles de la copie validée `src/game-presentation/`. Celle-ci contient les cartes à cadre, les sept visuels de pochettes et la scène GSAP ; elle n’importe aucun composant expérimental du lab. `FramedArtwork.tsx` garde la reproduction nue pour la fiche détaillée. L’ancien registre de cadres reste une archive locale ; aucune préparation d’image n’est un prérequis du build.

`packSelection.ts` traduit les sept nouvelles pochettes en sélections et probabilités, tout en conservant les anciens catalogues de tirage. `collection.ts` continue à effectuer les acquisitions avant toute animation ; la scène reçoit seulement les œuvres du dernier vrai résultat et un callback de révélation. Les scénarios fixes et le sélecteur de rareté du lab ne participent pas au jeu. [Intégration et indépendance du lab](INTEGRATION_LAB_2026-11-02.md).

## Atelier

`review.html` monte `src/review/ReviewApp.tsx` et charge `/review-data/catalog.json`. Le state est un dictionnaire de décisions sous `muse:rarity-review:v1`. Les imports fusionnent après confirmation. Un changement de stockage depuis un autre onglet bloque les écritures pour éviter l'écrasement silencieux.

`masterpieces.html` monte `src/masterpieces/CandidateApp.tsx`. `batches.ts` choisit le lot de 78 par défaut, ou le lot de 25 avec `?lot=initial`. Les clés restent `muse:enrichment-351-review:v1` et `muse:masterpieces-review:v1`. Le state est un historique d'événements horodatés : sélection et rareté sont indépendantes. Le format d'export des candidates n'est pas celui du millier.

L'ancienne entrée locale `review-351.html` est retirée : utiliser `/masterpieces.html` aussi en développement. Les versions de catalogue, identifiants et sauvegardes ne changent pas.

## Recherche et archives

`src/rarity-engine/` est un domaine pur sans React ; les scripts des lots le réutilisent. `catalog/` conserve captures, preuves juridiques, sources, configurations et exécutions figées. Les résultats des deux lots sont rangés dans leurs sous-dossiers `reports/` ; les données à servir restent dans `public/`.

Le fichier `catalog/history/layout-2026-10-30.json` résout les anciens chemins de manifestes. Les scripts maintenus utilisent `scripts/project-files.ts` ; les tests vérifient les empreintes originales, y compris celles des sources adaptées archivées, sans modifier les rapports historiques. Les preuves ne sont jamais remplacées par un nouveau hash simplement pour accepter une modification.

## Builds et publication

- `npm run build` : audits du socle, contrôle juridique, audits de la livraison et du classement actifs, typage, Vite principal et préparation autorisée des ressources ; `dist/` contient seulement le jeu. Les copies des cadres et pochettes validés sont compilées ; les pages du lab et de revue, les masters et **tous** les anciens fichiers `assets/collections/**` restent hors publication. `catalog/game-presentation/hosting-manifest.json` conserve les empreintes du build. `npm run game:check` vérifie la livraison sans la régénérer ; `game:prepare` reste une opération éditoriale explicite.
- `npm run build:atelier` : `vite.atelier.config.ts` compile revue et candidates ; `prepare-atelier-hosting.ts` ajoute uniquement les données, images et polices nécessaires dans `dist-atelier/`.
- `npm run preview` et `npm run preview:atelier` servent respectivement ces deux paquets. Le preview principal n'est pas celui des candidates.
- `firebase.muse.json` cible le jeu `muse-collection-6f2d` ; `firebase.json` cible `art-museum-8fdd8-atelier` du projet `art-museum-8fdd8`.

Les sorties de build sont régénérables et ignorées. Les références visuelles sont hors de `public/`, dans `references/`. Les données privées sont dans `private/`, jamais dans les paquets déployés.
