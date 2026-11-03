# Essai 05 — cadres prestige et commentaire global

État : **publié sur [MUSE Lab](https://muse-lab-6f2d.web.app/card-lab.html)**. Le jeu principal n’est pas modifié.

## Consigne appliquée

« Trop simpliste de manière générale et cadre lapis pas assez exceptionnel pour la rareté la plus rare. »

Les six familles validées restent strictement identiques : Exposition classique, Égypte ancienne, Arts décoratifs, Fantastique occidental, Abstraction géométrique et Paléolithique (cette dernière reste archivée, sans affectation au jeu).

Les **30 cadres et leurs masques** sont copiés sans recompression : leurs empreintes SHA-256 restent identiques à celles de l’état d’avant refonte, archivé dans `catalog/card-lab/prestige-frames/baseline.json`.

## Treize familles refaites, 65 variantes

Treize nouveaux masters ont été générés en prenant les décors validés comme références de relief et de richesse, sans les remplacer. Ils couvrent les douze types neutres et le Japon : acanthes et rosettes pour la peinture, architecture sculptée, gravure, entrelacs, géométrie optique Art déco, tressage, émail, orfèvrerie, prismes, marqueterie, reliure, minéral et motifs japonais.

Le **lapis-lazuli conserve la composition polychrome native** : pierre bleue profonde, inclusions dorées, reliefs d’or et cabochons sertis. Il n’est plus produit par une palette bleue uniforme. Les quatre autres finitions métalliques sont dérivées du relief de ce master. Il ne s’agit donc pas de 65 générations indépendantes, mais de treize nouveaux masters et de leurs dérivés déclarés.

Le master de reliure comporte des fermoirs latéraux. Ses bandes de côté sont redimensionnées pour élargir la fenêtre sans couper les fermoirs ; le PNG brut reste conservé séparément, et le PNG adapté ainsi que les deux empreintes sont enregistrés.

Tous les cadres restent en WebP sans perte, 1024×1536, avec masque strict et fenêtre commune. Les anciennes sources et anciennes variantes ne sont ni écrasées ni supprimées. Les 1 011 œuvres, leurs raretés et les règles d’affectation restent identiques.

## Avis simplifiés

[Aperçu des treize familles : argent et lapis](prototypes/cadres-prestige/treize-familles.png).

Un seul commentaire global par catégorie, avec les votes style/finition conservés. Les anciens commentaires par rareté sont automatiquement réunis dans le champ global, sans perte ou duplication. [Guide des avis](AVIS_CADRES.md).

Les anciens votes ne sont pas automatiquement une validation du nouveau rendu : les avis dont l’empreinte ne correspond plus au cadre sont signalés comme anciens et peuvent être reconfirmés.

## Préparation et vérification

- `src/card-lab/prestigeSpecs.ts` : consigne utilisateur, familles préservées, jobs et intentions des treize masters.
- `scripts/card-lab/prepare-prestige-frames.ts` : préparation sans nouvelle génération d’images.
- `src/card-lab/assets/prestige-frames/` : sorties actives ; `refined-frames.json` reste le registre chargé par le lab.
- `catalog/card-lab/prestige-frames/provenance.json` : empreintes et dérivations.

```sh
npm run card-lab:prepare-prestige
npm run typecheck
npm test
```

Typage et **189 tests réussis**, dont la conservation des 30 cadres approuvés, les 65 changements effectifs, le lapis bicolore, la transparence, les fenêtres, l’absence d’effacement du métal et la migration des avis.

Parcours navigateur : 21 cartes dans 12 configurations (1 440, 390 et 320 px, clair/sombre, confort/compact), titres et artistes complets, images entières, bandeaux alignés, clavier, favoris et sauvegardes intacts. Avis testés dans six configurations, export/import et rechargement compris ; aucune violation détectée par les règles axe examinées. Les treize familles ont également été comparées visuellement en argent et lapis.

Après publication, les parcours d’avis, export/import et rechargement passent aussi sur Firebase dans six configurations. Les cinq pages et les treize nouveaux cadres lapis téléchargés depuis le site correspondent octet pour octet aux empreintes du build.
