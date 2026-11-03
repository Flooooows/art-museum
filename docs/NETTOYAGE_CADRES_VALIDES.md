# Nettoyage des assets de cadres

À la demande de l’utilisateur, toutes les éditions non validées sont supprimées des fichiers de travail du projet. Seules les six familles suivantes sont conservées avec leurs sources, cinq finitions et masques inchangés :

- Exposition classique (`beaux-arts`)
- Égypte ancienne (`egypte`)
- Arts décoratifs (`decoratifs`)
- Fantastique occidental (`art-mysterieux`)
- Abstraction géométrique (`art-moderne`)
- Paléolithique (`prehistoire`)

Les suppressions couvrent les sources générées, masters et adaptations, sorties WebP et masques, anciens originaux Japon, copie autonome des cadres dans la présentation du jeu et planches/captures des essais de cadres. Les copies de cadres non validés présentes dans les sorties locales de build ont aussi été supprimées.

L’inventaire exact est dans `catalog/card-lab/asset-cleanup.json` : **1 009 images, 689,7 Mio**, dont des sorties de build ignorées par Git. Les empreintes des **565 assets approuvés protégés** sont inchangées (ce total inclut les copies dans les différentes éditions). Aucun historique Git n’est réécrit : les anciens commits restent récupérables.

Les images des œuvres, références originales fournies par l’utilisateur, textures de fond, pochettes, sauvegardes et avis restent conservés. Les anciens registres JSON et briefs sont des archives textuelles, pas des assets encore disponibles.

## Affichage

L’utilisateur a choisi **afficher sans cadre** pour les familles supprimées : aucune substitution par un décor validé d’un autre thème. Les cartes conservent leurs œuvres, titres, artistes, raretés et actions. Les anciens avis restent consultables, exportables et importables, même pour une catégorie désormais sans cadre.

- Registre du lab : `src/card-lab/assets/refined-frames.json`, 30 variantes approuvées.
- Images actives du lab : `src/card-lab/assets/refined-frames/`.
- Copie autonome du jeu : `src/game-presentation/cards/assets/refined-frames/`, 25 variantes affectables approuvées.
- Paléolithique reste conservé dans le lab et non affecté automatiquement.

`npm run card-lab:prepare-frames` vérifie et réindexe uniquement les cadres approuvés. Il ne relance plus les préparateurs des éditions supprimées.

## Validation et publication

Typage, 195 tests, 12 configurations navigateur et tous les thèmes du nuancier vérifiés. Les tests de conservation portent sur les octets réels des cadres approuvés ; les tests d’anciennes éditions portent désormais sur leurs métadonnées historiques, pas sur les images supprimées. Les votes et le commentaire global unique, rechargement et export/import ont été vérifiés séparément.

**Publication demandée : MUSE Lab uniquement.** Le jeu principal et l’atelier en ligne ne sont pas redéployés. Le dépôt contient néanmoins le nettoyage de leur copie locale des assets, conformément à la demande sur tout le projet.
