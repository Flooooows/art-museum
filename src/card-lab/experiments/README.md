# Expériences de cadres — références artistiques acceptées

Les expériences `japon/essai-01` et `photographie/essai-01`, dans leurs cinq finitions, définissent la direction artistique acceptée pour les prochaines générations. L’utilisateur a ensuite autorisé l’intégration des 95 variantes au **lab uniquement**. Les sources de ce dossier restent intactes ; les dérivés actifs sont séparés dans `assets/experiment-frames/`.

## Toutes les catégories — revue locale

Ouvrir **[`index.html`](index.html)** directement dans un navigateur : 19 familles × 5 raretés, soit **95 fichiers individuels**, avec une planche par famille et des liens vers chaque image. L’[aperçu lapis de toutes les catégories](toutes-les-categories-lapis.png) permet de comparer les motifs.

- **13 expériences** : Japon, Photographie et onze nouvelles familles à examiner. Masters et cinq finitions PNG dans chaque dossier.
- **6 familles historiques** : copies WebP strictement identiques des finitions approuvées ; aucune nouvelle génération ni recoloration de ces familles.
- Chaque dossier contient `essai-01-cinq-finitions.png` et `essai-01-finitions.json`. `catalogue.json` répertorie tous les fichiers.
- Les onze nouvelles expériences ont reçu l’autorisation d’intégration au lab. Les références artistiques restent Japon et Photographie. Toute nouvelle génération ultérieure reste locale jusqu’à nouvelle autorisation.

Pour préparer les cinq finitions de toutes les expériences, puis reconstruire la galerie et les copies historiques :

```sh
node --import tsx src/card-lab/experiments/prepare-finishes.ts --all
node --import tsx src/card-lab/experiments/prepare-catalog.ts
```

Il est aussi possible de traiter seulement certaines familles : `node --import tsx src/card-lab/experiments/prepare-finishes.ts sculpture textiles`. Les préparateurs exigent des masters déjà présents ; ils ne lancent aucune génération.

**Guide courant :** [`docs/GENERATION_CADRES.md`](../../../docs/GENERATION_CADRES.md). **Brief réutilisable :** [`generationStyle.ts`](../generationStyle.ts), fonction `frameGenerationRequest(theme)`.

Chaque dossier d’expérience contient le master `essai-01.png`, les cinq PNG `essai-01-<finition>.png`, la planche `essai-01-cinq-finitions.png` et les empreintes/références dans `essai-01-finitions.json`. Les six familles historiques utilisent des copies `essai-01-<finition>.webp`, pas de nouveau master.

Pour reproduire uniquement les adaptations de couleur existantes :

```sh
node --import tsx src/card-lab/experiments/prepare-finishes.ts
```

Cette commande réécrit les dérivés locaux, pas les masters. Elle ne génère pas une nouvelle image, n’intègre aucun cadre et ne publie rien. Les nouvelles explorations doivent avoir leur propre dossier ou numéro d’essai ; ne pas écraser les références acceptées.
