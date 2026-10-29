# MUSE — Documentation de l’atelier des raretés

Date : 30 octobre 2026. Surface : `/review.html`. Mode : **Operate**, extension ordinaire du monde MUSE existant, guidée par le code ; ni refonte ni changement de système approuvé.

Ce relevé est **descriptif et local**. Il ne remplace ni `DESIGN.md` ni `.impeccable/design.json`, tous deux laissés intacts. Le contrat `.impeccable/review-workspace.md` et les engagements de `PRODUCT.md` fournissent la direction ; aucune nouvelle métaphore, identité ou approbation n’est déduite des captures. Dans cette délégation documentaire, le contrat fourni tient lieu de nouvel entretien qualitatif.

## Overview

L’atelier présente exactement **1 000 œuvres**, dont 100 historiques et 900 nouvelles notices Cleveland, dans **12 familles de revue**. Les scores et propositions sont sous les reproductions ; une décision humaine exclusive reste distincte de la proposition. Les mille propositions sont provisoires. Les décisions initiales sont vides : la Joconde cochée « Esquisse » et le compteur **1 / 1 000** visibles dans les captures proviennent d’une session de vérification restaurée, pas d’une décision livrée avec le catalogue.

L’entrée charge seulement `src/review/review.css` par `src/review/main.tsx` ; elle ne monte pas le jeu et n’importe pas sa cascade CSS. Les comparaisons reposent sur `src/styles.css`, `src/appearance.css`, les valeurs normatives de `DESIGN.md`, le sidecar et les captures réellement ouvertes ci-dessous. Le classicisme éditorial tactile reste la référence héritée, pas une nouvelle direction proposée.

### Captures finales examinées

Tous ces fichiers préexistants sont dans `.impeccable/review/`. Dimensions lues dans les PNG, sans conversion ni nouvelle capture.

| Fichier | Dimensions | Constat concret |
| --- | --- | --- |
| `review-desktop-viewport.png` | 1440 × 1100 | **Vue par défaut des filtres**, 1 000 résultats, trois colonnes : Joconde, Vague, Socrate. Marque, actions, progression et avertissement précèdent les œuvres. Scores 98,7 / 95,1 / 80,2 sous les images ; début des choix visible en bas du viewport. |
| `review-desktop.png` | 1440 × 1509 | **Filtre « Pièce maîtresse »**, seulement deux résultats : ce n’est pas la grille initiale. La troisième colonne reste libre ; les cartes ne s’étirent pas. Les cinq radios, l’annulation, la pagination et le CSV sont visibles. |
| `review-mobile.png` | 390 × 2953 | Même sélection de deux œuvres, en une colonne. Joconde portrait et Vague paysage entières ; propositions puis décisions, pagination empilée et rappel de sauvegarde locale. |
| `review-mobile-viewport.png` | 390 × 844 | En-tête sur deux rangées, progression sous l’introduction, recherche puis filtres. Les états de revue reviennent à la ligne ; la première œuvre est sous le pli. Ne pas prétendre qu’une décision est immédiatement visible sur téléphone. |
| `review-mobile-dark.png` | 390 × 2953 | Même contenu et même choix que la capture claire ; canevas bordeaux, titres ivoire, sélection brune, sans altération des reproductions. |
| `review-mobile-card.png` | 350 × 787 | **Capture d’une carte**, pas un viewport de 350 px : largeur utile de 390 px moins deux gouttières de 20 px. Score lapis « Pièce maîtresse » distinct de la décision humaine « Esquisse », radio coché, mention « enregistrée », marqueur « Décidé » et annulation. |
| `review-import.png` | 1440 × 1100 | Dialogue natif centré : un conflit annoncé, conservation des choix absents du fichier, aucune modification du jeu. Focus bleu visible sur « Annuler », confirmation bordeaux séparée. |
| `review-empty.png` | 1440 × 1118 | Recherche sans résultat, zéro résultat annoncé, explication et action « Afficher les 1 000 œuvres ». Recherche toujours focalisée ; aucun faux contenu de remplacement. |

### Comparaison avec l’existant

| Dimension | Héritage constaté | Expression propre à l’atelier |
| --- | --- | --- |
| Identité | Même temple, mot-symbole MUSE en Playfair, ivoire/bordeaux et accent doré ; fichiers de polices locaux identiques à `src/styles.css`. | En-tête limité au retour MUSE, thème, import et export, sans inventaire ni stock de pochettes. |
| Œuvres | Conservation de l’œuvre entière et métadonnées hors reproduction, comme le prescrivent `PRODUCT.md` et le registre. | Passe-partout rectangulaire neutre ; **aucun cadre de rareté**, badge d’acquisition ou traitement d’œuvre manquante. La proposition ne simule pas une rareté déjà acquise. |
| Hiérarchie | Titres serif, annotations sans-serif, filets et surfaces chaudes. | Score, conseil, confiance, critères estimés, puis groupe « Ma rareté finale » ; pas de fusion entre score et décision. |
| États | Bordeaux pour l’action et focus distinct, contrôles natifs. | Radio, fond sélectionné, filet et texte « Décidé » fournissent plusieurs indices, sans recolorer ni déplacer l’œuvre. |
| Densité | Grille lisible et empilement plutôt que miniaturisation des cartes. | Trois / deux / une colonnes aux seuils propres à l’entrée ; 24 œuvres par page, pas mille cartes montées à la fois. |

Les anciennes captures `collection-desktop.png`, `collection-mobile.png`, `appearance-collection-light.png` et `appearance-collection-mobile-dark.png` ont également été regardées : elles corroborent marque, tonalité et relation titre/image, mais montrent d’anciennes navigations et couleurs de rareté. Ce sont des comparaisons historiques, **pas des références fraîches pour la navigation, les cadres ou les matières actuelles** ; le code et le registre priment sur ces points.

## Colors

Valeurs exécutées de `src/review/review.css:19–51`. Ces alias locaux ne créent pas de nouveaux tokens globaux.

| Alias local | Clair | Sombre | Usage et correspondance avec le registre |
| --- | --- | --- | --- |
| `--paper` | `#fbf9f4` | `#210a12` | Canevas et en-tête opaque ; `paper` / `dark-paper`. |
| `--inset` | `#f0eee9` | `#2d101b` | Fond neutre des reproductions et survol secondaire ; correspond à `paper-mid` en clair, **`dark-paper-low`** en sombre. Ce n’est pas le token global `mat`. |
| `--card` | `#fffefb` | `#33131f` | Champs, contrôles et dialogue ; mêmes surfaces que `card` / `dark-card`. |
| `--ink` | `#29201d` | `#f8e9df` | Texte courant ; équivalent local de `text`, pas du pigment historique `ink`. |
| `--soft` | `#625249` | `#d8bdc0` | Métadonnées, limites, états de sauvegarde ; `text-soft`. |
| `--wine` | `#4a0011` | `#f5dfbd` | **Alias local de titre/lien**, équivalent de `heading`. Son nom diverge du pigment global `wine`, qui doit rester bordeaux. |
| `--action` / `--on-action` | `#4a0011` / `#fff8ee` | `#8f304c` / `#fff8ee` | Export, état de filtre actif, marqueur de décision et accent natif des radios. L’action reste bordeaux en sombre. |
| `--line` | `#d7cdc1` | `#855363` | Filets et bordures ; reprend `border`, pas le filet global translucide `line`. |
| `--focus` | `#0038ff` | `#c9d3ff` | Focus clavier ; outremer distinct des états de sélection. |
| `--selected` | `#eee7d8` | `#483021` | Décision sélectionnée et avertissement de stockage ; reprend `gold-surface`. |
| `--selection` | `#e3cfb0` | `#75344a` | Sélection de texte uniquement. |

L’icône de marque utilise la valeur héritée **`#78601f`**, en dur dans les deux thèmes ; ne pas lui attribuer fictivement le remappage sombre de `gold-ink`. Le survol primaire emploie **`#6b1123` dans les deux thèmes**, et non le token sombre global `action-hover`. Les messages d’import/stockage restent textuels dans la notice de sauvegarde ; aucun nouveau couple de tokens d’erreur n’a été créé ici.

Les conseils de rareté reprennent exactement les encres sans fond du système actuel, sans importer les remplissages métalliques des badges :

| Conseil | Clair | Sombre |
| --- | --- | --- |
| Esquisse | `#4c525a` | `#c0c5ca` |
| Étude | `#854622` | `#e9af88` |
| Composition | `#505f70` | `#dbe2ed` |
| Œuvre | `#765b11` | `#ecd184` |
| Pièce maîtresse | `#23449f` | `#a6bdff` |

Le nom lisible accompagne toujours l’encre. Le bleu du conseil « Pièce maîtresse » dans la carte mobile ne sélectionne pas le radio correspondant : la capture montre justement une décision différente.

## Typography

Polices locales, chargées avec `font-display: swap` : **Playfair 400** (`playfair-0.woff2`) et **Inter 400/600** (`inter-0.woff2`, `inter-2.woff2`), replis Georgia/serif et Arial/sans-serif. L’entrée ne charge pas Space : contrairement aux contrôles du jeu documentés dans `DESIGN.md`, ses contrôles héritent d’Inter. C’est un constat d’implémentation, pas une autorisation de supprimer Space ailleurs.

| Rôle observé | Bureau | Téléphone, ≤640 px |
| --- | --- | --- |
| Mot-symbole | Playfair 30 px, approche `0.02em` | 25 px |
| Titre principal | Playfair 38 px / 1.2, approche `-0.025em` | 34 px |
| Titre d’œuvre | Playfair 22 px / 1.3 ; réserve verticale 57 px | 24 px ; réserve supprimée |
| Corps hérité / actions ordinaires | Inter 15 px / 1.55 | Corps 15 px ; actions d’en-tête 13 px |
| Introduction | Inter 16 px / 1.7 | 15 px |
| Score / conseil | Inter 600, 22 px / 1.2 ; conseil 16 px | Identiques |
| Progression | Inter 600, 28 px, chiffres tabulaires | 24 px |
| Métadonnées et limites | Artiste 14 px ; date, confiance, critères et annotations 13 px | Même échelle ; labels des choix à 14 px |
| Champs | Recherche héritée à 15 px ; sélecteurs 14 px, légendes 13 px | Sélecteurs 13 px |
| Dialogue / état vide | Playfair 28 px / 1.25 ou 1.3 | Même déclaration, avec retour à la ligne |

Les titres longs peuvent se couper et les notes/URL revenir à la ligne. Les tailles 13/14/15/16 px réemploient l’échelle lisible héritée ; les compositions ne sont néanmoins **pas identiques** aux titres d’espace 44/36 px, aux cartes 25/26 px, au corps global 16 px / 1.8 ou aux saisies globales 16 px. Ces différences restent locales et ne sont pas promues en système approuvé.

## Layout

- **Bureau :** contenant centré de 1360 px maximum, padding horizontal 40 px ; à 1440 px, contenu de **1280 px** et bords à 80 px. En-tête avec padding `16px 40px`. Introduction en deux zones séparées de 32 px, progression d’au moins 235 px. Barre de filtres : recherche `minmax(250px, 1.6fr)` puis trois colonnes égales, gap 14 px.
- **Grille :** trois colonnes `minmax(0, 1fr)`, espacement vertical/horizontal **36/28 px**. Les cartes s’alignent en haut, pas à hauteur forcée. Champ image haut de **240 px**, padding `26px 24px`, œuvre entière en `object-fit: contain`. Identité puis proposition sur deux colonnes `0.9fr 1.1fr`, gap 16 px.
- **À ≤1050 px :** gouttières de 24 px, recherche sur toute la rangée au-dessus des trois sélecteurs ; deux colonnes de cartes, gap **28/24 px**.
- **À ≤640 px :** en-tête sur deux rangées, padding `12px 18px` ; gouttières de contenu 20 px. Introduction et progression empilées. Recherche pleine largeur, famille/proposition côte à côte, tri pleine largeur. Filtres d’état souples sur plusieurs lignes. Une colonne de cartes, gap 32 px ; images hautes de **310 px** ; pagination et pied de page empilés.
- **320 px :** largeur réellement testée selon le bilan transmis, mais pas un breakpoint supplémentaire ni une capture parmi les huit fichiers listés. Les preuves visuelles directement inspectées ici portent sur 1440 et 390 px.

Le rythme reprend notamment 8/12/16/20/24/32 px, sans prétendre que tout suit une grille de 8 px : gaps de radios 6 px, contrôles 10/15 px, filets/propositions 14 px, identité 16/14 px, titre de liste avec marges 24/22 px et pagination à 38 px sont également exécutés. Ce sont des mesures locales, pas des tokens ajoutés au registre.

## Elevation & Depth

Interface **plate**, sans ombre de carte, halo, dégradé ou translation de carte au survol. Le papier, les aplats, les filets de 1 px et le passe-partout suffisent. Contrairement aux cartes de collection décrites dans `DESIGN.md`, les œuvres de revue ne sont pas des objets acquis mis en relief.

Le dialogue utilise un fond `rgba(28, 9, 17, 0.65)` sans flou ajouté. Transitions des fonds/bordures : **160 ms ease-out**. Seul le marqueur « Décidé » entre sur **180 ms**, de 0,6 à 1 d’opacité avec translation verticale de 3 px ; l’œuvre ne bouge pas. `prefers-reduced-motion: reduce` supprime animations, transitions et défilement animé.

## Shapes

Les contrôles, champs, radios en rangées et sélecteur de page ont un rayon de **3 px**, déjà présent pour les champs du système. Le dialogue conserve **7 px**, largeur maximale 500 px, largeur disponible `calc(100% - 40px)` et padding 28 px. Reproductions, filets, marqueurs et barre de progression restent rectangulaires ; aucun nouveau cadre décoratif ou raster d’interface.

Les actions ordinaires ont une hauteur minimale de **42 px**, padding `10px 15px` ; recherche/sélecteurs, **48 px**. Les rangées de décision passent de **40 px** à **44 px** sur téléphone ; radios natifs de 16 px, légende puis grille deux colonnes et cinquième choix pleine largeur. Boutons d’icône et de pagination : largeur 42 px. Ces mesures ne remplacent pas le bouton global arrondi à 15 px et haut d’au moins 48 px.

## Components

### Décision et consultation

- Article nommé par le titre de l’œuvre ; image avec titre en alternative. Groupe natif `fieldset`/`legend`, cinq `input[type=radio]` de même nom par œuvre et noms différents entre œuvres. Aucun choix initial dérivé du score ; Esquisse, niveau zéro, reste une vraie décision. « Annuler mon choix » remet uniquement cette œuvre à examiner.
- Décision matérialisée par radio, fond sélectionné, bordure, filet supérieur et marqueur avec coche/« Décidé ». Progression et sauvegarde se mettent à jour sans faire disparaître la carte : l’appartenance à un filtre de revue est figée jusqu’au changement de filtre ou à « Actualiser la liste ».
- « Données & sources » et la méthode utilisent des `details`/`summary` natifs. Les cinq critères, leur nature observée/dérivée/estimée, la confiance heuristique et la plage de plausibilité restent consultables ; la plage n’est pas présentée comme un intervalle statistique. Les liens institutionnels ne prétendent pas valider le classement.

### Accessibilité et pagination corrigée

Lien d’évitement « Aller aux œuvres », recherche nommée, sélecteurs étiquetés, filtres d’état en groupe avec `aria-pressed`, progression nommée et annonces de résultats/sauvegarde en `role=status`. Focus général : contour de **3 px** décalé de **3 px** ; recherche : contour de 2 px décalé de 2 px. Les boutons indisponibles utilisent `disabled`, opacité 0,48 et curseur dédié. Les informations ne dépendent ni du survol ni de la couleur seule.

La revue de finition complète avait trouvé **un problème matériel : le parcours clavier après pagination**. Le code final le corrige (`ReviewApp.tsx:360–391,429–432,684–710,728–763`) : la liste est une région nommée « Œuvres de la page … sur … », focalisable par programme avec `tabIndex={-1}` ; les changements Précédent/Suivant/sélecteur passent par `changePage`, puis focalisent la nouvelle région et remontent au début de l’espace de travail. La marge de défilement est de 100 px, puis 145 px sur téléphone. L’état vide possède aussi une région nommée.

**Résultat transmis du navigateur :** les trois commandes de pagination ont été testées ; le focus rejoint la région puis Tab entre dans un radio de la nouvelle carte. **Le même relecteur a effectué la passe de verdict du correctif : `ship`.** Ce document consigne cette clôture ; il ne prétend pas être un nouvel audit indépendant. Les captures statiques ne prouvent pas à elles seules le déplacement du focus.

### Import, sauvegarde et défaillances

- Décisions dans **`muse:rarity-review:v1`**, distinctes du jeu ; apparence via le hook existant et la clé partagée `muse-theme`. L’isolation porte sur les décisions, pas sur la préférence de thème. Export JSON versionné réimportable ; CSV des mille fiches avec colonnes proposition et décision séparées, décision vide si non examinée.
- Import JSON validé avant fusion : format/versions, identifiants, doublons, niveaux, dates et limite de 2 Mo. Dialogue natif `showModal()`, titre lié par `aria-labelledby`, Annuler/Échap, conflits annoncés et confirmation explicite. Les décisions absentes du fichier sont conservées ; une annulation ou un fichier refusé ne les modifie pas.
- Stockage corrompu/incompatible, refus d’écriture ou modification dans un autre onglet : écritures bloquées, choix de session conservés, avertissement et export disponibles. Une sauvegarde initiale illisible peut être récupérée brute ; reprise locale après confirmation, sans écraser silencieusement le jeu.
- Catalogue : chargement annoncé, délai de 60 secondes, erreur avec `role=alert`, bouton « Réessayer » et retour MUSE. Image en échec : texte « Image indisponible » et lien vers la notice, sans supprimer les scores ou les choix. La reprise testée concerne le **chargement du catalogue** ; la carte n’expose pas de bouton de réessai de son image.

### Provenance des reproductions

**Aucune génération raster nouvelle**, aucun changement de source ou de capture pour ce relevé. Lecture du JSON public : **100 URL locales préexistantes et 900 URL externes** `openaccess-cdn.clevelandart.org`. Les preuves des cent reproductions locales restent dans le dispositif existant, notamment `public/assets/provenance.json` et les dossiers de droits du catalogue ; ne pas leur attribuer indistinctement la licence du nouveau lot.

Pour les 900 ajouts, `catalog/review-1000/selection.json` relie chaque identifiant, famille, notice et date à une des **12 réponses institutionnelles complètes** conservées dans `catalog/review-1000/cache/`. `manifest.json` fournit leurs SHA-256. Contrôle documentaire en lecture seule : les 12 empreintes de fichiers correspondent au manifeste ; les 19 empreintes de code de calcul listées dans `implementationHashes` correspondent aussi. Ce manifeste trace le calcul et ses preuves, pas l’intégralité des fichiers de l’interface.

Exemple concret : `cma-94979`, *Nathaniel Hurd*, notice `https://clevelandart.org/art/1915.534`, capture datée du `2026-10-29T23:16:26.416Z`, `share_license_status: CC0`, image web `https://openaccess-cdn.clevelandart.org/1915.534/1915.534_web.jpg`. La réponse complète conserve ces champs et son empreinte de charge utile. Il s’agit de preuves des réponses sources et des URL ; **pas d’une affirmation de téléchargement ni de vérification binaire de 900 nouveaux rasters locaux**.

Les huit nouvelles familles — Peinture 180, Sculpture 120, Estampes 150, Dessins 100, Photographie 90, Textiles 90, Céramique 90, Arts du métal 80 — s’ajoutent aux quatre familles historiques, sans créer de pochettes actives. Titres institutionnels conservés, biais d’une seule institution et estimations explicites ; CC0 institutionnel ne vaut pas garantie juridique universelle.

### Vérifications et avertissements acceptés

Bilan de la session d’implémentation, du relecteur et de `catalog/review-1000/verification.json`, **non réexécuté par le documenter** : **76 tests**, build double entrée et typage strict réussis ; ancienne simulation V2 `02b68c195210ea3536d84c1a` et entrées protégées inchangées. Vérifications navigateur à **1440/390/320 px**, thèmes clair/sombre, choix exclusif, annulation, export/import/fusion/refus, rechargement, stockage corrompu et récupération, concurrence entre onglets, image indisponible et reprise du catalogue. Le contrôle axe de base ne trouve aucune violation automatique WCAG 2 A/AA et 2.1 AA ; ni certification exhaustive ni test de lecteur d’écran complet n’est revendiqué.

Le détecteur a été exécuté **une seule fois** dans le lot d’implémentation. Ses avertissements sur **Inter sont hérités et acceptés**, parce que cette police fait partie de l’identité MUSE épinglée ; ils n’autorisent pas une substitution typographique. Les écarts de textes **12/17 px**, de rayons **4 px** et de couleur d’icône ont été corrigés vers **13/16 px**, **3 px** et **`#78601f`**. Ce relevé n’exécute pas de seconde passe et ne transforme pas les anciens écarts corrigés en exceptions.

## Do's and Don'ts

- **Conserver** la séparation visible entre score provisoire, conseil et décision ; un choix sauvegardé n’est ni une validation algorithmique ni une migration dans le jeu.
- **Conserver** les images entières, les radios natifs, les libellés d’état, la restitution du parcours clavier après pagination et les voies d’export/récupération.
- **Ne pas généraliser** les alias, rayons, hauteurs ou tailles propres à cette entrée au système global. La présence d’une valeur dans ce relevé n’équivaut pas à une approbation de changement de système.
- **Ne pas ajouter** cadre de rareté, badge d’acquisition, quota éditorial, traduction inventée, compte, synchronisation ou activation automatique.

### Décalages documentaires signalés, non réparés

1. `DESIGN.md`, section « Artwork Cards & Packs », décrit encore **quatre pochettes thématiques**, alors que `PRODUCT.md`, le même registre ailleurs et `extensions.layout.home.thematicChoices` du sidecar en décrivent six. `extensions.typographyMeta.pack-option` du sidecar conserve également « quatre boutons ». Ce reliquat préexiste à cette documentation.
2. Les vieilles captures de collection citées plus haut montrent des pages Ouverture/Révélation et d’anciennes encres de rareté ; elles ne doivent pas supplanter la navigation et les matières actuelles. Les nombres de l’ancien lot `catalogueFiveCards` dans le sidecar sont, eux, **explicitement supplantés** par `catalogueHundredWorks`, pas une preuve que le jeu serait revenu à vingt œuvres.
3. Le registre global décrit la cascade et le pré-thème de `index.html`. `/review.html` est autonome et ne possède pas ce script pré-peinture : son thème est appliqué par `useTheme`. Le relevé ne lui attribue pas la garantie anti-flash du jeu. Les différences locales de noms sémantiques (`--wine`, `--line`, `--inset`), de type et de contrôles sont exposées ci-dessus, sans approbation globale implicite.
4. Le contrat de surface finit par demander « DESIGN.md », tandis que le mandat documentaire borne explicitement l’écriture au présent rapport. Le système global n’a donc pas été régénéré. Au moment de la lecture, `execplan/atelier-mille-oeuvres.md` mentionne encore une revue à clore ; le verdict `ship` après correction de pagination est fourni par la session délégante, et cette autre fiche n’est pas éditée ici.
5. Le format hérité contient aussi des `minHeight` dans le frontmatter de `DESIGN.md` et des chaînes mêlées aux objets dans `narrative.rules` du sidecar ; ces formes ne correspondent pas entièrement au schéma actuel décrit par `reference/document.md`. Aucun changement de schéma, renommage ou réparation de sidecar n’est entrepris dans cette mission.

**Livrable unique :** `.impeccable/review/review-workspace-documentation.md`. Aucun fichier applicatif, donnée, raster, capture, `DESIGN.md` ou `.impeccable/design.json` modifié par cette passe documentaire.
