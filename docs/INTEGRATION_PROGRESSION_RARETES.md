# Essai 02 — progression de détails sur les 19 thèmes

Demande utilisateur : généraliser les essais Japon et Verre à **tous les thèmes**, publier uniquement sur Firebase Lab puis pousser sur Git. L’utilisateur a explicitement choisi **refaire les 19 thèmes**, donc aussi les six familles historiques, **sans supprimer les premiers essais ni les originaux**.

## Série et direction

95 images générées indépendamment : fer brut et gravé, cuivre patiné modelé, argent aux ciselures précises, or aux reliefs et coins développés, lapis bleu et or aux incrustations fines. Le progrès porte sur le travail et le détail, pas seulement sur les couleurs ou le nombre de motifs. Les essais Japon et Verre existants sont repris tels quels ; les 85 autres dessins sont de nouvelles générations.

Les thèmes restent identifiables et les affectations aux œuvres, raretés, favoris et avis ne changent pas. Paléolithique reste disponible au nuancier, non affecté automatiquement. Le jeu principal et l’atelier ne sont pas modifiés ou redéployés.

## Conservation et provenance

- **695 fichiers préexistants protégés** et vérifiés par SHA-256 : premiers essais, cadres antérieurs, deux tests de progression initiaux, sorties et copie du jeu.
- Sources : `src/card-lab/experiments/<famille>/essai-02-<finition>.png`.
- Comparaison locale : `src/card-lab/experiments/index-essai-02.html`, avec les 95 liens et 19 planches.
- `progression-series.ts` : les 95 jobs réels. Aucun cadre n’est présenté comme une génération indépendante s’il ne l’est pas.
- Références exactes archivées sous `catalog/card-lab/progression-frames/references/`, avec leurs empreintes dans les manifestes de famille.
- L’ancienne édition `experiments-v1` est archivée dans `catalog/card-lab/progression-frames/previous-edition.json` et ses images restent en place.

## Intégration

`npm run card-lab:prepare-frames` prépare le registre `progression-v2` et les WebP sans perte dans `src/card-lab/assets/progression-frames/`. Chaque dessin a son masque propre ; il n’y a plus de masque commun imposé aux cinq raretés.

Les ouvertures brutes, variables avec le dessin, ne donnaient qu’une intersection commune de 57,75 % en hauteur. Une adaptation dérivée par neuf zones réduit proportionnellement les coins et étend les rails lorsque nécessaire. Les coupes, l’échelle et la source normalisée sont enregistrées. La nouvelle fenêtre commune mesure **64,746 % × 67,253 %**. Les PNG originaux ne sont jamais écrasés ; aucun pixel opaque n’est effacé, aucune nouvelle recoloration n’est appliquée.

Les fichiers actifs, sources brutes/adaptées, masques, jobs, transformations et empreintes sont dans `catalog/card-lab/progression-frames/provenance.json` et `src/card-lab/assets/refined-frames.json`.

## Contrôles avant publication

Typage et **206 tests réussis** : 95 jobs, dessins et masques variant par rareté, fenêtres sûres, coins proportionnels, absence d’effacement opaque ou de fond sur les ornements, couleurs des sources adaptées conservées, 695 fichiers préexistants intacts et isolation du jeu. Les anciennes éditions restent testées sur leurs fichiers et registres archivés, pas confondues avec la série active.

Parcours navigateur local : 21 cartes dans 12 configurations, 1440/390/320 px, clair/sombre et confort/compact, nuancier de 19 thèmes ; textes complets, images entières, alignement des raretés, clavier et isolation des sauvegardes. Avis, commentaire global unique, rechargement, export/import et accessibilité également vérifiés.

## Publication vérifiée

Publié uniquement sur [Firebase Lab](https://muse-lab-6f2d.web.app/card-lab.html). Le parcours des 12 configurations et les avis ont été revérifiés en ligne sans erreur. Les **98 fichiers de la livraison** (95 cadres, page, JS et CSS contenant les masques intégrés) ont été téléchargés et comparés au build : empreintes identiques. Le jeu principal n’a pas été déployé.
