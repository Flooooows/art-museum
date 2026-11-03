# Laboratoire — cadres par catégorie et rareté

> **Historique de l’essai 02.** Les affectations trop larges décrites ici sont remplacées par l’[essai 03 : bases neutres et affectations corrigées](ESSAIS_CADRES_NEUTRES.md). Les captures ci-dessous restent conservées ; elles ne décrivent plus les règles du lab actuel.

**Essai 02, uniquement dans le laboratoire.** Le principe de carte-cadre validé est conservé : image, rareté, titre, artiste, numéro, type et favori restent dans le même contour. Le site publié n'est pas modifié.

## Aperçus

- [Comparer sept familles et cinq finitions sur huit œuvres](prototypes/carton-musee-variantes/comparaison-familles.png).
- [Planche des quinze cartes réelles](prototypes/carton-musee-variantes/planche-15-cartes.png).
- [Nuancier complet des 35 cadres](prototypes/carton-musee-variantes/nuancier-35-cadres.png).
- [Hokusai sur mobile](prototypes/carton-musee-variantes/hokusai-mobile.png).
- [Titre long sur mobile](prototypes/carton-musee-variantes/titre-long-mobile.png).
- [Premier essai à décor doré commun](ESSAIS_CARTON_MUSEE.md).

## Choix du décor

Les règles sont dans `src/card-lab/frameRules.ts`. Elles utilisent les **types et thèmes actuels**, plus l'origine documentée, et ignorent l'ancien `frameFamily` du catalogue fourre-tout.

L'ordre explicite évite les ambiguïtés entre thèmes :

1. **Égypte ancienne** : thème `egypte` ; prioritaire sur Mythes pour une statuette égyptienne.
2. **Premières traces** : thème `premiers-arts`, sans déduire la Préhistoire de la seule ancienneté.
3. **Japon** : origine japonaise explicitement renseignée, notamment pour Hokusai.
4. **Mythes et créatures** : thème `mythes` pour les autres œuvres concernées.
5. **Photographie et art moderne** : type `photographie`.
6. **Arts décoratifs** : textiles, céramiques, métaux, verre, mobilier et objets archéologiques sans thème plus précis.
7. **Beaux-Arts** : peintures, sculptures, estampes, dessins et manuscrits restants.

Ces sept séries sont les exemples disponibles ; elles ne remplacent pas les douze types d'œuvres du catalogue. Le type réel reste affiché dans la carte, et le nom de la famille choisie est indiqué à côté de chaque cas d'essai.

## Choix de la finition

| Rareté humaine | Finition de l'exemple |
| --- | --- |
| Esquisse | Fer |
| Étude | Cuivre |
| Composition | Argent |
| Œuvre | Or (`dore`) |
| Pièce maîtresse | Lapis-lazuli |

Le cadre est le fichier de la bonne combinaison, **pas une recoloration générique du même décor**. Le badge et les encres reprennent aussi les couleurs existantes de la rareté. Les données, choix humains et probabilités ne sont jamais modifiés.

Le filtre « Décor » sélectionne les œuvres qui utilisent cette famille ; il ne leur attribue pas une autre rareté. Le nuancier montre les cinq finitions de chaque famille **sans les associer artificiellement à une œuvre**.

## Adaptation des exemples existants

`scripts/card-lab/prepare-frames.ts` lit les 35 originaux conservés dans `public/assets/collections/` et prépare des copies propres au laboratoire dans `src/card-lab/assets/frames/` :

- sept séries de cinq cadres, en 768×1152 ;
- un fond de velours limité à l'ouverture réelle, pour ne pas colorer l'extérieur des ornements ;
- les fenêtres mesurées des trente cadres déjà exploitables sont conservées ;
- les cinq exemples Japon, auparavant sans ouverture transparente exploitable, reçoivent une ouverture vérifiée dans leurs copies du lab ;
- les originaux et les registres historiques restent inchangés.

L'image et **tous les textes** sont placés dans la zone sûre propre à chaque cadre, pas dans une marge fixe supposée commune à tous. Les reproductions restent entières et les titres/artistes ne sont pas tronqués. Aucune nouvelle image d'œuvre ni aucun ornement n'est généré.

`src/card-lab/assets/frames.json` conserve les empreintes des sources, des masques et des copies, la transformation et les coordonnées utiles. Les droits et provenances d'origine ne sont pas remplacés par une nouvelle licence.

## Comparer dans le lab

```sh
npm run card-lab:prepare-frames
npm run dev:card-lab
```

Ouvrir http://127.0.0.1:4175/card-lab.html. Les commandes restent manuelles et ne s'ajoutent pas au build du jeu.

Pour la version compilée indépendante :

```sh
npm run build:card-lab
npm run preview:card-lab -- --port 4176
```

Ouvrir http://127.0.0.1:4176/card-lab.html. La planche conserve les douze cas précédents et ajoute deux œuvres égyptiennes et un objet néolithique, pour couvrir les sept familles.

## Contrôles

- **148 tests réussis**, typage et builds du laboratoire et du jeu réussis.
- Routage des **1 011 cartes** : chaque combinaison est disponible et conserve la rareté humaine.
- Vérification des **35 cadres et 35 fenêtres** : sources inchangées, bonnes finitions, zone d'information entièrement transparente devant un fond entièrement présent.
- Navigateur : **15 cartes × 12 configurations** (320/390/1440 px, confort/compact, clair/sombre), texte dans la fenêtre sûre, reproductions en `contain`, favoris et navigation clavier.
- Vérification des sept filtres et des 35 variantes du nuancier, sans changement des cadres des œuvres ni de leurs raretés.
- Les collections et préférences du jeu ne sont pas utilisées ou modifiées par le laboratoire.

Le build du jeu conserve **exactement les 1 044 fichiers et empreintes** de la version publiée sans cadres. Les nouveaux cadres, fonds et règles sont exclusivement compilés dans `dist-card-lab/`.

La version de développement **et la version compilée** ont passé les douze configurations navigateur : aucun texte hors cadre, aucune troncature ni erreur JavaScript ; image utile d'au moins 79 px de haut dans les cas testés, même en format compact. Les sept filtres et les 35 variantes du nuancier ont été parcourus à chaque configuration. Favoris, clavier et absence de modification du stockage du jeu sont vérifiés.

Rapports et captures de travail : `/tmp/opencode/muse-card-lab-frames/`. Le [rapport exporté](prototypes/carton-musee-variantes/verification.json) accompagne les aperçus. Aucun déploiement ni commit/push demandé ou effectué pour cet essai.
