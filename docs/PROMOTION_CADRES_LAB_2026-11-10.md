# Cadres du lab vers le jeu — 10 novembre 2026

À la demande de l’utilisateur, les cadres **effectivement publiés sur MUSE Lab** (`23a05bbe0435fdda`, 3 novembre) sont intégrés au jeu principal. La page du lab correspond à son manifest local et les 95 empreintes de cadres de la série `progression-v2` y figurent.

## Promotion

- **90 variantes affectables** copiées à l’identique, avec leurs 90 masques individuels et la même fenêtre commune. Les cinq Paléolithique restent non affectées et disponibles dans le lab seulement.
- Aucune génération, recoloration ou modification des dessins. Les premières éditions et les 25 variantes approuvées de la copie précédente sont conservées ; son registre est archivé dans `catalog/game-presentation/frame-editions/before-progression-v2.json`.
- Même affectation aux œuvres, même rareté humaine, mêmes images et informations. Les sept visuels de boosters, l’ouverture rapide, Tout révéler, le format compact et le sombre restent conservés.
- Le jeu garde une **copie indépendante** : modifier ou publier les prochains essais du lab ne modifie pas automatiquement le jeu.

Préparation manuelle utilisée, jamais appelée depuis un build :

```sh
npx tsx scripts/game-presentation/promote-lab-frames.ts --lab-version=23a05bbe0435fdda
```

## Vérifications ciblées

Typage, **12 tests ciblés du jeu et du sombre**, puis build normal. Les tests contrôlent les 90 cadres/masques par SHA-256, la fenêtre commune, les affectations des 1 011 œuvres et la conservation des tirages, favoris et sauvegardes. Les tests historiques lisent l’ancien registre archivé sans remplacer ses empreintes originales.

Les parcours ciblés sur ordinateur et mobile vérifient collection, titres longs, reproduction entière, favoris et ouverture avec cinq cartes sur une ligne. Pas de suite exhaustive du lab, de matrice complète ou de téléchargement de toutes les ressources historiques du site.

## Publication

Jeu : **`e84e6c22e06f0a3b`**, publié le **10 novembre 2026 à 14:41:49 UTC** sur https://muse-collection-6f2d.web.app.

La vérification en ligne porte sur les fichiers nouveaux ou modifiés, dont tous les nouveaux cadres, par comparaison SHA-256 au build. Les ressources inchangées restent référencées par le manifest de la livraison précédente. Le lab conserve sa release et ses ressources ; les données et les sauvegardes du jeu ne sont pas migrées.

[Publication courante](../catalog/game-presentation/publication.json) · [Provenance de la promotion](../catalog/game-presentation/lab-frame-promotion.json) · [Contrôles et aperçus](prototypes/promotion-cadres/verification.json).
