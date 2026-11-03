# Cartes du lab — masques stricts, détails et bandeau commun

**Essai 04**, sur [MUSE Lab](https://muse-lab-6f2d.web.app/card-lab.html), séparé du jeu. Les 21 œuvres d’essai, leurs images, titres, artistes, crédits et raretés humaines restent inchangés.

## Corrections

### Le fond ne découpe plus les anciens cadres

L’ancien masque intérieur était utilisé pour **effacer des pixels du cadre**, puis afficher le velours rouge au même endroit. Il empiétait sur du métal dans les 30 variantes historiques contrôlées. Sur la Joconde, le masque recouvrait notamment 3 249 pixels opaques du cadre préparé en 768×1152.

Le nouveau préparateur repart des PNG natifs, pas des copies déjà découpées. Il suit uniquement la transparence réelle reliée au centre, avec une marge intérieure de sécurité. Les pixels de métal ne sont jamais effacés pour agrandir la fenêtre. Le masque du velours reste séparé et ne passe pas sur les pixels non vides du cadre.

Les 95 variantes sont contrôlées à partir de leurs pixels : **aucune superposition du fond sur le métal**, et aucune modification des couleurs ou de l’alpha des pixels non vides des anciens décors. Les sources et anciennes copies sont conservées.

### Douze décors enrichis, pas seulement agrandis

Douze nouveaux masters enrichissent les bases neutres : gravures plus denses, moulures superposées, angles ciselés, perlage, fibres, assemblages et reliefs adaptés au type. Les intentions restent neutres : pas de bisons pour l’archéologie, de fausse écriture pour les manuscrits ou de symboles culturels imposés.

Chaque master argent est décliné avec les cinq recettes de finition déclarées ; il ne s’agit pas de 60 générations indépendantes. La série Japon récente est conservée, avec le nouveau traitement strict du masque. Les cinq anciens décors historiques encore utilisés et la série Paléolithique archivée gardent leur matériau et leurs détails originaux.

Les sorties sont désormais en **1024×1536, WebP sans perte**, au lieu d’une réduction 768×1152 avec compression destructive. Les premiers masters restent dans les archives, sans écrasement.

### Une même place pour la rareté

Un **gabarit commun**, inclus dans toutes les fenêtres sûres, sert aux 95 variantes. Le bandeau de rareté et le numéro sont ancrés au bas de cette zone, juste avant le type et le favori.

L’image conserve la place restante selon la longueur réelle du titre et de l’artiste. Ce choix évite de réduire toutes les œuvres à une petite vignette pour réserver le pire cas de texte. Les titres restent complets, sans ellipse ni découpe ; les œuvres sont entières en `contain`. Le bandeau ne se déplace pas selon le décor ou la longueur des informations. La cible du favori reste de 44 px.

## Aperçus

- [La Joconde, masque corrigé](prototypes/cadres-homogenes/joconde-mobile.png).
- [Ganesha et la nouvelle sculpture](prototypes/cadres-homogenes/sculpture-mobile.png).
- [Titre photographique long](prototypes/cadres-homogenes/titre-long-mobile.png).
- [Les douze bases détaillées](prototypes/cadres-homogenes/douze-details.png).
- [Comparer des cartes et les bandeaux alignés](prototypes/cadres-homogenes/planche-21-cartes.png).
- [Vérifications](prototypes/cadres-homogenes/verification.json).

## Préparation et traces

- `src/card-lab/detailedSpecs.ts` : sources, intentions et jobs des douze nouvelles générations.
- `scripts/card-lab/refined-processing.ts` : séparation stricte du métal et de la fenêtre.
- `scripts/card-lab/prepare-refined-frames.ts` : préparation des 95 variantes et calcul du gabarit commun.
- `src/card-lab/assets/refined-frames.json` : **registre actif** du rendu.
- `src/card-lab/assets/refined-frames/` : images et masques actifs.
- `catalog/card-lab/refined-frames/provenance.json` et [audit des anciens masques](../catalog/card-lab/refined-frames/mask-audit.json) : empreintes et contrôles.

Les anciens registres `frames.json`, `generated-frames.json`, leurs fichiers préparés et les PNG sources restent conservés. `frameRules.ts` garde les mêmes affectations ; les cadres raffinés ne changent ni les catégories ni les raretés.

```sh
npm run card-lab:prepare-refined  # manuel, sans génération d’images ni publication
npm run build:lab
npm run preview:lab
```

Les tests vérifient aussi les empreintes des premiers masters et de leurs anciennes variantes. Les parcours navigateur contrôlent les textes, les images, les masques rendus, les 95 variantes du nuancier, l’alignement du bandeau, les favoris, le clavier et l’absence de modification du stockage du jeu.

[Essai 03 conservé](ESSAIS_CADRES_NEUTRES.md) · [Publication du laboratoire](MUSE_LAB.md).
