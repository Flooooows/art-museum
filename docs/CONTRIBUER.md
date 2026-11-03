# Travailler sur MUSE

1. Suivre [l'installation multi-PC](CHANGER_DE_PC.md) ; choisir Node 24 avec `nvm use`, récupérer Git LFS, puis `npm ci`.
2. Préserver les changements présents avec `git status`. Pour travailler à plusieurs, utiliser une branche par tâche ; pas de reset destructeur ni de push forcé.
3. Lire [l'état actuel](ETAT_ACTUEL.md) et [l'architecture](ARCHITECTURE.md), pas les anciens plans comme s'ils étaient actuels.
4. Avant livraison : `npm run check`, `npm run build`, `npm run build:atelier`. Pour un changement d'interface, vérifier aussi ordinateur/téléphone et les deux thèmes dans un navigateur.
5. Ne pas lancer de collecte, génération éditoriale ou déploiement pour une simple modification d'interface. Les deux commandes de déploiement visent des sites distincts.

## Données et archives

Conserver identifiants des œuvres, versions de catalogues publics et clés de stockage. Ne jamais changer la version d'un export humain pour contourner un refus d'import. Les fichiers de `private/` ne doivent pas être ajoutés à Git.

Les scripts de lots utilisent les chemins logiques historiques résolus par `scripts/project-files.ts`. Les fichiers physiques sont indexés dans `catalog/history/layout-2026-10-30.json` et les rapports dans `catalog/*/reports/`. Les documents archivés peuvent citer leurs anciens chemins : ce sont des traces datées.

Une erreur d'empreinte exige de comprendre ce qui a changé. Ne pas remplacer globalement les valeurs attendues. Pour une évolution autorisée, conserver les anciens résultats et leur code, définir une nouvelle version et tester le nouveau comportement ; [explication des archives](../catalog/history/README.md).

Les originaux de cadres et les sources imagegen ne sont pas des fichiers temporaires. Les cinq cadres Japon invalides restent explicitement signalés. Les droits d'une œuvre, de sa reproduction et des cadres sont distincts.

## Contrôles disponibles

- `npm run typecheck` : application, scripts maintenus et deux configurations Vite.
- `npm test` : règles, données, droits, import/export, cadres et intégrité historique.
- `npm run catalog:check` / `npm run catalog:images` : données et reproductions du jeu.
- `npm run check` : regroupe ces contrôles sans déployer ni modifier les données éditoriales.

Les parcours cartes/pochettes/ouverture du jeu sont versionnés dans `scripts/game-presentation/browser*.mjs`, avec un banc de rendu des 1 011 cartes hors build public. [Exécution](INTEGRATION_LAB_2026-11-02.md). La CI et la protection multi-onglets des candidates restent dans la feuille de route ; ne pas les déclarer implémentées.
