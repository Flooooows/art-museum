# Essai 07 — profils sobres inspirés d’encadrements réels

**Publié sur [MUSE Lab](https://muse-lab-6f2d.web.app/card-lab.html)**, sans modification du jeu principal.

Consigne : réduire fortement les détails, conserver les thèmes et s’inspirer de vrais cadres. Les treize familles non validées sont refaites ; les six familles déjà validées et leurs **30 cadres et masques restent identiques octet pour octet**.

## Choix visuels

Plus de palettes, pinceaux, objectifs, pellicules, outils, chaînes, colonnes, tessons ou formes de livre intégrés au contour. Le thème est évoqué par la matière, le profil et le montage :

- peinture : cassetta en noyer, frise plate et filet fin ;
- sculpture : profil en bois cendré avec présentation en retrait ;
- estampes : baguette sombre à petite doucine et bord ivoire ;
- dessins : bois clair et carton musée ;
- photographie : profil galerie noir satiné et passe-partout blanc cassé ;
- textiles : chêne et bord intérieur gainé de lin fin ;
- céramique : chêne adouci et grège ;
- métaux : bronze brossé et double ressaut discret ;
- verre : nickel satiné et gris perle ;
- mobilier : noyer poli à plate-bande ;
- manuscrits : bois sombre et montage de feuillet sur ivoire chaud ;
- archéologie : caisse de conservation mate aux tons de terre ;
- Japon : bois laqué noir, sous-filet rouge brun et bord soyeux.

Les cinq raretés gardent **exactement le même contour**. Seuls les filets de finition changent. Le lapis associe une ligne bleue à une très fine ligne dorée, sans bijoux ni surcharge.

[Planche des treize profils](prototypes/cadres-museaux/treize-profils.png).

## Inspiration, pas reproduction d’un objet historique

Les profils sont des **illustrations paramétriques rendues depuis des SVG**, pas des photographies de cadres ni des copies certifiées d’objets de musée. Aucune nouvelle génération IA n’a été utilisée pour cette série. Les références documentaires guident les typologies et les choix de présentation :

- [National Gallery — Frames](https://www.nationalgallery.org.uk/paintings/glossary/frames).
- [National Portrait Gallery — Framing Italian Renaissance Paintings](https://www.npg.org.uk/collections/research/programmes/the-art-of-the-picture-frame/guides-italian-renaissance).
- [NEDCC — Matting and Framing for Works on Paper and Photographs](https://www.nedcc.org/free-resources/preservation-leaflets/4.-storage-and-handling/4.10-matting-and-framing-for-works-on-paper-and-photographs).
- [CCI — Conservation Framing of Embroideries and Other Flat Textiles](https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/conservation-framing-embroideries-flat-textiles.html).

Les profils pour objets tridimensionnels évoquent une présentation muséale : ils ne prétendent pas qu’une sculpture ou un vase seraient matériellement encadrés ainsi. Les œuvres, leurs raretés et leurs affectations restent intactes. Les avis gardent un seul commentaire global par catégorie.

## Préparation et traces

- `src/card-lab/museumSpecs.ts` : profils, matières, proportions et références.
- `scripts/card-lab/museum-rendering.ts` : onglets, profils, grains discrets et filets des cinq finitions.
- `scripts/card-lab/prepare-museum-frames.ts` : rendu reproductible en WebP sans perte, 1024×1536.
- `src/card-lab/assets/museum-sources/` : SVG et PNG de référence argent.
- `src/card-lab/assets/museum-frames/` : sorties actives ; le registre chargé reste `refined-frames.json`.
- `catalog/card-lab/museum-frames/provenance.json` : empreintes des SVG, PNG, rendus et scripts, sans fausse attribution à une génération IA.
- `catalog/card-lab/museum-frames/previous-edition.json` : état thématique précédent archivé. Les anciennes images sont conservées.

```sh
npm run card-lab:prepare-museum
npm run typecheck
node --import tsx --test --test-concurrency=2 src/*.test.ts
npm run deploy:lab
```

## Contrôles

Typage et **194 tests réussis**. Ils vérifient notamment les 30 variantes préservées, les 65 changements, la géométrie constante entre raretés, les fenêtres et la transparence, ainsi que l’absence de texte ou d’images d’objets ajoutés dans les SVG.

Les 21 cartes passent 12 configurations en développement puis 12 sur Firebase : 1 440, 390 et 320 px, clair/sombre, confort/compact. Images entières, textes complets, bandeaux alignés, clavier, favoris et sauvegardes restent fonctionnels. Les **47 fichiers nouveaux de la livraison** sont téléchargés depuis Firebase et comparés aux empreintes du build. Les variantes les plus petites, intégrées au bundle par Vite, sont vérifiées avec ce bundle.
