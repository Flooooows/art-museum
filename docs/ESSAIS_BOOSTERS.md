# Sept visuels de pochettes — MUSE Lab

La proposition validée regroupe le catalogue en **une pochette universelle et six spécialisées**. Chaque pochette possède une illustration générée distincte, avec une forme scellée et une typographie MUSE communes. Aucune multiplication des visuels selon la rareté ou les thèmes.

## Les sept pochettes

| Pochette | Contenu | Œuvres | Identité |
| --- | --- | ---: | --- |
| Collection universelle | Tout le catalogue | 1 011 | Bordeaux, laiton, assemblage de plusieurs arts |
| Peintures | Peintures | 235 | Cobalt et empâtements colorés |
| Traits & pages | Dessins, estampes, manuscrits | 250 | Ivoire, cuivre, feuillets et hachures |
| Sculptures | Sculptures | 139 | Olive et volumes de pierre |
| Photographies | Photographies | 90 | Bleu nuit, argent et lumière photographique |
| Matières & objets | Céramiques, métaux, verre, objets archéologiques | 202 | Pétrole, cuivre et assemblage de matières |
| Textiles & intérieur | Textiles, tapisseries, mobilier et luminaires | 95 | Prune, tissage et assemblages de bois |

Les six ensembles spécialisés couvrent **exactement les 1 011 œuvres, sans doublon**. Les douze types précis et les quatre thèmes restent inchangés. Les thèmes sont présentés comme des sélections transversales, pas comme quatre nouveaux emballages permanents.

La couleur est une identité de pochette, **pas une promesse de rareté**. Ces regroupements sont un prototype : le jeu conserve ses catalogues et ses règles de tirage actuels.

## Comparer

- [Les sept pochettes côte à côte](prototypes/pochettes-sept-univers/sept-pochettes.png).
- [La planche sur ordinateur](prototypes/pochettes-sept-univers/boutique-ordinateur.png).
- [Sur mobile](prototypes/pochettes-sept-univers/boutique-mobile.png).
- [Aperçu d’une sélection réelle](prototypes/pochettes-sept-univers/apercu-selection.png).
- [Le site MUSE Lab](https://muse-lab-6f2d.web.app/booster-lab.html), séparé du jeu.

Le bouton « Explorer » consulte des exemples fixes et représentatifs, avec leurs sources et crédits. Il ne tire ni n’attribue de carte. Le thème clair/sombre est limité à la session du composant, sans stockage.

## Sources et préparation

- `src/booster-lab/groups.ts` : regroupements, textes, palettes et identifiants exacts des générations.
- `src/booster-lab/assets/generated-sources/` : sept masters intacts, générés avec `openai/gpt-image-2` à partir de la pochette existante comme référence de construction.
- `scripts/booster-lab/processing.ts` : extraction du fond extérieur, sans ouverture dans le sachet.
- `scripts/booster-lab/prepare.ts` : mise à l’échelle proportionnelle commune et WebP transparents 768×1152, sans perte après nettoyage des franges.
- `src/booster-lab/assets/packs.json` et `catalog/booster-lab/provenance.json` : sources, empreintes, jobs, transformations et provenance.
- `BoosterVisual.tsx` : marque, libellés et nombre de cartes ajoutés en HTML, pour ne pas dépendre d’un texte dessiné par génération.

Les compositions sont des illustrations de matières et de techniques, pas des reproductions identifiées d’œuvres muséales. Aucune licence de musée ne leur est attribuée. Les œuvres réelles, leurs images et leurs crédits ne sont pas modifiés.

```sh
npm run booster-lab:prepare  # manuel, uniquement si nécessaire
npm run dev:booster-lab     # http://127.0.0.1:4177/booster-lab.html
```

Le build indépendant reste disponible avec `npm run build:booster-lab`. Pour les trois essais réunis et leur publication, voir [MUSE Lab sur Firebase](MUSE_LAB.md).

## Vérifications

Les sept sources et leurs sorties sont traçables et distinctes. Le détourage conserve un sachet opaque au centre et transparent à l’extérieur, sans magenta restant. Les effectifs, l’exclusivité des six ensembles, les aperçus réels et l’isolation du jeu sont couverts par les tests.

Le lab publié a été parcouru dans **huit configurations** (320/390/768/1440 px, clair/sombre) : sept visuels chargés, textes de pochette dans leur zone, sept sélections consultables, navigation clavier et retour du focus, aucune modification du stockage du jeu. Le build commun et les **161 tests** du projet passent. [Rapport exporté](prototypes/pochettes-sept-univers/verification.json).

## Propositions vectorielles et génération GPT Image — 15 novembre 2026

Le Booster Lab a maintenant un sélecteur **Style des pochettes**, qui bascule toutes les pochettes de la page entre les illustrations actuelles et quatre propositions vectorielles :

| Style | Principe |
| --- | --- |
| Art déco | Rayons et cadre à redans dorés, médaillon central avec l’emblème du regroupement. |
| Cartel de musée | Papier ivoire, filets fins, pastille de couleur et étiquette de cartel numérotée. |
| Sceau de cire | Velours damassé et sceau de cire en relief portant l’emblème, avec rubans. |
| Vitrail | Arc brisé en verre coloré aux teintes du regroupement, plombs sombres. |

Les 28 visuels (4 styles × 7 pochettes, 768 × 1152, WebP) sont produits par `npm run booster-lab:vector` (`scripts/booster-lab/vector-packs.ts`) : SVG déterministe, rasterisé avec sharp, sources SVG conservées à côté. Les zones de texte HTML (haut et bas) restent libres. Ces propositions sont limitées au Lab ; les pochettes du jeu ne changent pas. Le Lab des pochettes s’ouvre désormais sur fond sombre.

### Générer de nouvelles illustrations avec GPT Image

1. Copier `.env.example` en `.env` (ignoré par Git) et y coller la clé API OpenAI. `OPENAI_IMAGE_MODEL` vaut `gpt-image-2` par défaut, comme les pochettes actuelles.
2. Essai à blanc, sans rien envoyer : `npm run image:booster -- --booster peintures --style "Art nouveau, laiton" --dry-run`.
3. Génération : retirer `--dry-run`. `--booster all` produit les sept pochettes ; `--ref public/assets/booster.png` guide la forme avec l’image de référence ; `--prompt "…" --name essai` permet un texte libre.

Les images arrivent dans `output/imagegen/` (ignoré par Git) avec un fichier JSON : modèle, date, consigne, empreintes SHA-256. La consigne et l’image de référence éventuelle sont envoyées à OpenAI. Une image retenue se prépare ensuite pour le Lab comme les illustrations actuelles.
