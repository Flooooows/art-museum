# Intégration des palettes examinées — laboratoire uniquement

L’utilisateur a autorisé l’intégration au lab des **19 catégories × 5 raretés**, après examen des fichiers dans `src/card-lab/experiments/`. Cette demande autorise la publication du lab et le push Git, **pas une modification du jeu principal en ligne**.

## Cadres intégrés

- Les treize palettes expérimentales sont utilisées pour peinture, sculpture, estampes, dessins, photographie, textiles, céramique, métaux, verre, mobilier, manuscrits, archéologie et Japon.
- Les trente variantes des six familles historiques et leurs masques sont strictement inchangés, avec leurs empreintes originales.
- Les règles d’affectation aux 1 011 œuvres, les raretés et les favoris ne changent pas. Paléolithique reste conservé au nuancier et non affecté automatiquement.
- La copie de la présentation du jeu reste `approved-only`, avec ses 25 variantes affectables. Elle n’est ni enrichie, ni redéployée par cette livraison.

## Traitement des images

`scripts/card-lab/prepare-experiment-frames.ts` lit les PNG déjà examinés, vérifie leurs empreintes et produit des WebP sans perte dans **`src/card-lab/assets/experiment-frames/`**. Les cadres historiques continuent d’être chargés depuis `refined-frames/`.

Aucune nouvelle génération, recoloration, mise à l’échelle ou modification de composition n’est effectuée à l’intégration. Seuls les pixels déjà presque transparents (alpha <16) sont effacés, sans chroma key et sans supprimer de pixel opaque. Les couleurs de tous les pixels conservés restent identiques aux palettes examinées. Les sources expérimentales restent intactes.

Chaque famille expérimentale partage un masque mesuré entre ses cinq finitions. L’ouverture commune est calculée à l’intersection des 95 fenêtres sûres ; elle couvre 64,258 % de la largeur et 62,565 % de la hauteur. Œuvres et textes restent entièrement à l’intérieur du cadre.

## Registres et reproduction

- `src/card-lab/assets/refined-frames.json` : registre actif `experiments-v1`, 95 variantes.
- `catalog/card-lab/experiment-frames/provenance.json` : sources, empreintes, jobs, palettes et transformations exactes.
- `catalog/card-lab/experiment-frames/previous-edition.json` : registre antérieur à six familles, conservé comme archive textuelle.
- `src/card-lab/experiments/` : masters et palettes examinés, galerie locale et métadonnées initiales de création locale. Leur mention initiale « non intégré » décrit l’étape de création, pas l’état courant du lab.

```sh
npm run card-lab:prepare-frames
npm run typecheck
node --import tsx --test --test-concurrency=2 src/*.test.ts
npm run deploy:lab
```

La préparation ne touche pas le registre ni les images de `src/game-presentation/`. Les anciennes éditions supprimées ne sont pas restaurées.

## Contrôles

**202 tests réussis**, typage valide. Ils vérifient notamment les couleurs et pixels conservés des 65 variantes nouvelles, l’alpha partagé, les masques, les fenêtres sûres, les empreintes des six familles historiques et l’isolation du jeu.

Parcours navigateur local : 21 cartes dans 12 configurations (1440/390/320 px, confort/compact, clair/sombre), nuancier des 19 familles, textes complets, images entières, alignement des raretés, clavier et isolation des sauvegardes. Votes, commentaire global unique, persistance, export/import et accessibilité également vérifiés.

## Publication vérifiée

Publié sur [MUSE Lab](https://muse-lab-6f2d.web.app/card-lab.html) uniquement. Les mêmes 12 configurations navigateur et le parcours des avis ont été rejoués en ligne sans erreur. Les **68 fichiers de la nouvelle livraison** (65 palettes, page, JS et CSS) ont été téléchargés et comparés aux empreintes du build : identiques.
