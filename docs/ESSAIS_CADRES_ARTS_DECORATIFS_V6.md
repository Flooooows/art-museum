# Essai 08 — Arts décoratifs comme référence de travail et de couleur

**Publié sur [MUSE Lab](https://muse-lab-6f2d.web.app/card-lab.html)**. Le jeu principal reste inchangé.

La consigne corrige l’édition trop basique : reprendre le **niveau de relief, de détail et de couleur des Arts décoratifs**, sans donner le même thème floral à toutes les catégories et sans revenir aux outils rapportés.

## Référence conservée et effectivement utilisée

Les images Arts décoratifs **argent et lapis-lazuli** ont été fournies comme références aux treize nouvelles générations. Leur transparence a été composée sur un fond neutre uniquement pour la présentation au générateur. Les fichiers d’entrée exacts, leurs empreintes et celles des originaux sont conservés sous `catalog/card-lab/decorative-frames/references/` et dans le registre de provenance.

Les six familles validées, dont Arts décoratifs, gardent **exactement leurs 30 cadres et masques** : aucune recompression, nouvelle couleur ou nouvelle génération sur ces familles.

## Un langage commun, un motif par thème

| Famille | Motif intégré à la moulure |
| --- | --- |
| Peinture | Rubans de gestes de pinceau, veinures de pigment |
| Sculpture | Plans modelés, rubans de relief et petites surfaces cannelées |
| Estampes | Guillochés, tailles et hachures |
| Dessins | Lignes libres entrelacées et gravure fine |
| Photographie | Ondes lumineuses, ellipses et petits diaphragmes gravés à plat |
| Textiles | Rubans dessus-dessous et chaîne/trame incisée |
| Céramique | Bandes moulées, stries de tournage et émaux |
| Métaux | Rubans forgés, repoussé et ciselures |
| Verre | Réseaux de vitrail et compartiments opalescents |
| Mobilier | Marqueterie courbe et frise travaillée |
| Manuscrits | Entrelacs d’enluminure et nœuds géométriques |
| Archéologie | Strates minérales, bandes incisées et patine, sans glyphes inventés |
| Japon | Vagues seigaiha, nuages et panneaux asanoha, sans feuillage occidental |

[Référence et treize nouvelles familles](prototypes/cadres-arts-decoratifs-v6/reference-et-treize-familles.png) · [Cinq finitions sur le thème textile](prototypes/cadres-arts-decoratifs-v6/cinq-finitions-textiles.png).

Les motifs sont sculptés ou gravés dans la structure du cadre : pas de pinceaux, appareils photo, outils, morceaux de vase ou meubles constituant le contour. La validation esthétique finale reste celle de l’utilisateur.

## Cinq finitions déclarées

Les treize masters lapis/or sont de nouvelles images générées, pas les précédents profils SVG. Le lapis conserve les couleurs natives. Les quatre autres finitions distinguent le métal en relief et les fonds colorés : charbon pour le fer, rouge brun pour le cuivre, gris bleuté/opalescent pour l’argent et tons chauds pour le doré. Ces recettes sont inspirées visuellement de la référence, pas présentées comme des mesures colorimétriques ou cinq générations indépendantes.

Le contour et le masque sont identiques dans les cinq variantes. Les sources brutes restent intactes. Une copie du master dessin supprime un voile semi-transparent dans la fenêtre (alpha 3 à 47 dans la zone vide contrôlée). Les éventuelles adaptations d’ouverture par découpage en neuf zones gardent une échelle uniforme dans les coins et sont déclarées dans la provenance.

## Préparation et contrôles

- `src/card-lab/decorativeSpecs.ts` : jobs et motifs par famille.
- `scripts/card-lab/decorative-processing.ts` : recettes des fonds et métaux, adaptation de fenêtre.
- `scripts/card-lab/prepare-decorative-frames.ts` : sources, références exactes et préparation des 95 variantes en 1024×1536 WebP sans perte.
- `src/card-lab/assets/decorative-frames/` : sorties actives, chargées par `refined-frames.json`.
- `catalog/card-lab/decorative-frames/provenance.json` : empreintes et transformations.
- `catalog/card-lab/decorative-frames/previous-edition.json` : registre de l’édition sobre archivée ; ses sources et images sont conservées.

Typage et **196 tests réussis**. Ils vérifient notamment les références utilisées, les 65 nouvelles variantes, les 30 variantes préservées, les cinq finitions, les masques, les zones de texte et la conservation des avis.

Parcours navigateur sur 21 cartes dans 12 configurations en développement et 12 sur Firebase : 1 440/390/320 px, confort/compact, clair/sombre ; textes complets, images entières, bandeaux alignés, clavier, favoris et sauvegardes intacts. Les **67 fichiers nouveaux publiés** (65 cadres, page et bundle) ont été téléchargés et comparés aux empreintes du build : aucune différence.
