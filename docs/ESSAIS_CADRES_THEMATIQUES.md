# Essai 06 — l’identité du thème avant l’ornement

**Publié sur [MUSE Lab](https://muse-lab-6f2d.web.app/card-lab.html).** Le jeu principal reste inchangé.

La refonte prestige précédente est conservée dans les archives : elle apportait du détail, mais partageait trop de fleurs, dorures et cabochons entre des catégories différentes. Cette nouvelle série repart de treize générations sans ces anciennes images comme références de génération.

[Planche des treize nouvelles familles](prototypes/cadres-thematiques/treize-themes.png).

## Langage propre à chaque famille

| Famille | Construction et indices visuels |
| --- | --- |
| Peinture | Empâtements, palettes, brosses, poils et viroles |
| Sculpture | Marbre brut/poli, traces de taille, socles, ciseau et maillet |
| Estampes | Plaques gravées, tailles, hachures, rouleau encreur et burins |
| Dessins | Papier ivoire, crayons, graphite et traits de construction |
| Photographie | Pellicule perforée, optiques, diaphragmes et métal usiné |
| Textiles | Chaîne/trame, navette, tresses, ourlets et fils |
| Céramique | Terre cuite, stries de tournage, colombins et glaçure |
| Métaux | Tôles martelées, chaînes, rivets, assemblages et repoussé |
| Verre | Prismes, biseaux, bulles et réfractions |
| Mobilier | Bois tourné, queues d’aronde, marqueterie et ferrures |
| Manuscrits | Cuir, dos cousu sur nerfs, parchemin et fermoirs |
| Archéologie | Strates, tessons, fragments et outils de conservation, sans glyphes inventés |
| Japon | Laque, vagues seigaiha, réseaux asanoha/shippo et sakura, sans feuillage baroque européen |

Le lapis enrichit ces objets distincts, au lieu de les remplacer par le même cadre bleu et or. Les autres raretés modifient principalement les accents bleus ou métalliques ; le papier, le cuir, le bois, la pierre et les fibres gardent majoritairement leur couleur et leur texture. Les cinq variantes partagent le relief et la transparence d’un master : il ne s’agit pas de 65 générations indépendantes.

## Préservation et adaptation

- **Les six familles validées et leurs 30 cadres/masques restent identiques octet pour octet** : Exposition classique, Égypte ancienne, Arts décoratifs, Fantastique occidental, Abstraction géométrique, Paléolithique archivé.
- Les catégories, affectations, œuvres et raretés humaines ne changent pas. Le commentaire reste unique et global par catégorie.
- Les PNG bruts et les anciennes éditions restent conservés. Le registre de la précédente édition est archivé dans `catalog/card-lab/themed-frames/previous-edition.json`.
- Le master sculpture comportait un voile de studio semi-transparent. Il est supprimé dans une copie préparée, sans toucher les pixels opaques de pierre ; le brut et son empreinte restent conservés.
- Les bordures trop épaisses sont adaptées par découpage en neuf zones : les coins gardent une échelle uniforme dans les deux axes, pour ne pas ovaliser les optiques. Les motifs ne sont pas supprimés pour agrandir la fenêtre. Les paramètres et les empreintes des copies adaptées sont enregistrés.
- Les sorties sont en WebP sans perte, 1024×1536. Le masque strict et le gabarit commun sont conservés.

## Sources et contrôles

- `src/card-lab/themedSpecs.ts` : jobs, matières et indices attendus par thème.
- `scripts/card-lab/themed-processing.ts` : nettoyage explicite du voile sculpture et finitions des accents.
- `scripts/card-lab/prepare-themed-frames.ts` : préparation reproductible, sans nouvelle génération.
- `src/card-lab/assets/themed-frames/` : 95 cadres actifs et leurs masques.
- `catalog/card-lab/themed-frames/provenance.json` : empreintes, transformations, sources brutes et préparées.

```sh
npm run card-lab:prepare-themed
npm run typecheck
node --import tsx --test --test-concurrency=2 src/*.test.ts
```

Typage et **192 tests réussis**, dont les empreintes des 30 variantes préservées, les 65 changements, les masques, les zones de texte et la conservation des matières dans les finitions. La concurrence des tests est limitée pour éviter de saturer la mémoire de la machine.

Contrôle visuel des treize silhouettes et matières, puis 21 cartes dans 12 configurations navigateur (1 440/390/320 px, confort/compact, clair/sombre) : images entières, textes complets, bandeaux alignés, clavier et favoris fonctionnels. Les avis passent six configurations supplémentaires, avec export/import et sauvegarde locale ; aucune violation détectée par les règles axe examinées. Ces contrôles techniques ne remplacent pas la validation esthétique de l’utilisateur.

Après publication sur le projet Firebase du lab uniquement, les cinq pages et les treize nouveaux cadres lapis ont été téléchargés depuis le site et comparés aux empreintes SHA-256 du build : aucune différence.
