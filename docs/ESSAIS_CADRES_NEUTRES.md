# Laboratoire — cadres neutres et affectations corrigées

> **Historique de l’essai 03.** Le rendu actuel est décrit dans l’[essai 04 : masques stricts, détails et bandeau commun](ESSAIS_CADRES_HOMOGENES.md). Les aperçus et les dimensions de préparation ci-dessous restent ceux de l’essai initial.

> Les trois essais sont désormais réunis dans le [projet Firebase MUSE Lab](MUSE_LAB.md), séparé du jeu. Les mentions « local et non déployé » ci-dessous décrivent l’état initial de cet essai ; le jeu publié reste inchangé.

**Essai 03, local et non déployé.** La carte entière reste le cadre : œuvre, titre, artiste, rareté, numéro, type et favori sont dans son ouverture. Aucun changement des œuvres, images, identifiants, crédits, raretés humaines, tirages ou sauvegardes du jeu.

> **Correction Japon :** les cinq cadres Japon sont désormais remplacés dans le lab par une nouvelle série à contour isolé, sans l’ancien fond rectangulaire opaque. [Aperçu des cinq finitions](prototypes/japon-v2/cinq-finitions.png) · [Hokusai sur mobile](prototypes/japon-v2/hokusai-mobile.png). Les captures initiales de l’essai 03 ci-dessous sont conservées comme comparaison avant correction.

## Aperçus

- [Les douze nouvelles bases, finition argent](prototypes/carton-musee-neutres/nouvelles-bases.png).
- [Les 21 cartes et leurs affectations réelles](prototypes/carton-musee-neutres/planche-21-cartes.png).
- [Les 95 variantes, dont la famille Paléolithique archivée](prototypes/carton-musee-neutres/nuancier-95-cadres.png).
- Sur mobile : [jade archéologique](prototypes/carton-musee-neutres/archeologie-mobile.png), [Ganesha](prototypes/carton-musee-neutres/sculpture-mobile.png), [manuscrit](prototypes/carton-musee-neutres/manuscrit-mobile.png), [photographie et titre long](prototypes/carton-musee-neutres/titre-long-mobile.png).
- [Essai 02 conservé comme historique](ESSAIS_CADRES_CATEGORIE_RARETE.md).

## Une base par type, sans culture supposée

Douze **masters argent distincts** ont été générés avec `openai/gpt-image-2`, puis préparés en cinq finitions déclarées. Il ne s’agit pas de soixante générations indépendantes. Les variantes conservent le relief du master et appliquent des palettes fer, cuivre, argent, or et lapis-lazuli. Aucune recoloration n’est appliquée aux reproductions des œuvres.

Un **treizième master**, `japon-v2-master.png`, remplace maintenant la série Japon : vagues seigaiha, feuilles de bambou et joints sobres, sans médaillon impérial ni plaque de titre. Ses cinq finitions sont elles aussi dérivées du master argent. Cela ne crée pas de nouvelle catégorie : les 26 œuvres japonaises gardent leurs clés et raretés. Le registre final compte toujours 95 variantes.

| Type | Base neutre | Vocabulaire visuel |
| --- | --- | --- |
| Peintures | `peinture-neutre` | Moulures et stries d’atelier |
| Sculptures | `sculpture` | Volumes et facettes |
| Estampes | `estampes` | Hachures et bord de plaque |
| Dessins | `dessins` | Traits et rainures fines |
| Photographies | `photographie` | Présentation de conservation |
| Textiles | `textiles` | Chaîne, trame, bord tressé |
| Céramiques | `ceramique` | Profils tournés et émail |
| Métaux | `arts-metal` | Ciselure, martelage et perlage |
| Verre | `verre` | Arêtes polies et reflets |
| Mobilier | `mobilier` | Assemblages et panneaux |
| Manuscrits | `manuscrits` | Reliure et profils de feuillets |
| Objets archéologiques | `archeologie` | Strates minérales et conservation |

Ces créations sont des choix graphiques, **pas des reconstitutions historiques**. Elles évitent d’ajouter une religion, une civilisation ou une période à partir du seul matériau ou du sujet. Leur pertinence reste soumise à appréciation visuelle ; une réussite technique ne prouve pas une exactitude historique.

## Affectations corrigées

Les règles de `src/card-lab/frameRules.ts` ignorent l’ancien `frameFamily` et suivent cet ordre :

1. **Égypte ancienne** : thème documenté `egypte` (28 œuvres).
2. **Japon** : origine japonaise explicitement renseignée (26 œuvres).
3. **Arts décoratifs vers 1900** : uniquement les 15 identifiants de la sélection « Matières autour de 1900 ».
4. **Fantastique occidental** : uniquement les quatre *Scenes of Witchcraft* de Salvator Rosa. Ganesha, La Licorne captive et La Reine Méduse ne reçoivent plus automatiquement un décor occulte.
5. **Abstraction géométrique** : uniquement la composition de Mondrian `cma-143278`. Les photographies utilisent leur nouvelle base.
6. **Exposition classique** : peintures de la sélection Renaissance italienne et cinq peintures sélectionnées explicitement, soit 27 œuvres. Ce décor n’est plus le cadre de tous les dessins, sculptures, estampes ou peintures asiatiques.
7. **Base neutre du type actuel** pour les autres œuvres.

Le décor à bisons `prehistoire` est **archivé et non affecté**, y compris aux jades et poteries néolithiques. Les douze objets archéologiques utilisent huit cadres Égypte et quatre cadres Archéologie. Les poteries néolithiques restent des céramiques, avec une base neutre de céramique.

Le registre conserve **19 familles × 5 finitions = 95 variantes**, dont cinq Paléolithique archivées ; 18 familles sont utilisables. Les bases neutres verre et mobilier existent dans le nuancier, même si les sept objets actuels de ces deux types appartiennent tous à la sélection vers 1900. Aucun cadre n’est imposé artificiellement à une œuvre pour illustrer une base.

Le filtre « Décor » montre uniquement les cas de la planche correspondant à la famille choisie ; un message explique les familles sans cas d’essai. Le nuancier montre aussi l’archive, avec un avertissement explicite. La finition suit toujours la rareté humaine existante.

## Sources et préparation

- Masters intacts : `src/card-lab/assets/generated-sources/`.
- Intentions et identifiants de génération : `src/card-lab/generatedSpecs.ts`.
- Traitement : `scripts/card-lab/generated-processing.ts` et `prepare-generated-frames.ts`.
- Registre et provenance : `src/card-lab/assets/generated-frames.json` et `catalog/card-lab/generated-frames/provenance.json` : empreintes, modèle, job, source, méthode, fenêtres et sorties.
- Anciennes copies préparées et leurs sources conservées : `src/card-lab/assets/frames.json`.
- [Affectations des 1 011 œuvres et justifications](../catalog/card-lab/frame-assignments.json).

Le traitement accepte les centres déjà transparents et les fonds magenta, vérifie que l’ouverture est fermée, retire le fond, calcule un rectangle sûr, puis exporte des WebP 768×1152 et un masque par nouvelle famille. Les cadres générés n’héritent d’aucune licence muséale. Les crédits et droits des œuvres restent indépendants et inchangés.

Les nouvelles sorties Japon utilisent des noms versionnés `japon-v2-*.webp` et `japon-v2-generated-window.webp`. Elles remplacent les cinq clés `japon-*` uniquement lors de la fusion du registre du lab. Les 35 copies historiques, leurs sources et leur registre sont intacts ; les 60 variantes neutres restent strictement identiques. La préparation peut être relancée sans écraser les anciens cadres Japon.

```sh
npm run card-lab:prepare-frames  # historique + généré, manuel uniquement
npm run card-lab:audit
npm run dev:card-lab
```

Lab : http://127.0.0.1:4175/card-lab.html. Pour compiler séparément :

```sh
npm run build:card-lab
npm run preview:card-lab -- --port 4176
```

Version compilée : http://127.0.0.1:4176/card-lab.html. Aucun préparateur n’est un hook du build du jeu ; `dist-card-lab/` n’est pas la cible Firebase du jeu.

## Vérifications

- Typage, **151 tests** après correction Japon, build du lab et build du jeu réussis.
- Routage des 1 011 œuvres et conservation des raretés humaines ; aucune affectation à la famille archivée.
- Empreintes des sources et sorties ; 95 ouvertures transparentes dans la zone utile et masques opaques derrière toutes les informations ; absence de magenta visible dans les 65 cadres générés. La marge extérieure de 12 px des cinq cadres Japon est entièrement transparente.
- Navigateur compilé : **21 cartes × 12 configurations** (320/390/1440 px, confort/compact, clair/sombre). Aucun texte hors cadre, titre/artiste complet, image entière en `contain`, zone image d’au moins 109 px dans les cas testés, cible favori de 44 px, ouverture/fermeture clavier et retour du focus.
- 18 filtres et 95 variantes parcourus dans chaque configuration ; aucune erreur JavaScript ni modification des clés de stockage du jeu.
- Isolation confirmée : les **1 044 fichiers publiables du jeu et leurs empreintes sont strictement identiques** à la référence de la version publiée sans cadres. [Rapport exporté](prototypes/carton-musee-neutres/verification.json).

Rapports et captures de travail : `/tmp/opencode/muse-card-lab-neutral/`. Aucun déploiement, commit ou push effectué.

Après correction Japon, les 12 configurations navigateur ont de nouveau été vérifiées, ainsi que les cinq finitions, la conservation des 35 copies historiques et l’absence de changement des 60 variantes neutres. Rapports : `/tmp/opencode/muse-japan-v2/` et [vérification exportée](prototypes/japon-v2/verification.json). Les fichiers publiables du jeu restent identiques à la référence.
