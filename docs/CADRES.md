# Cadres actifs et archives

**État actuel : 95 progressions intégrées au lab**, avec cinq dessins distincts pour chacun des 19 thèmes. L’utilisateur a aussi demandé une nouvelle série pour les six familles historiques : leurs originaux et tous les premiers essais restent conservés à l’identique. La présentation du jeu conserve ses 25 variantes approuvées et n’est pas redéployée. [Progression des raretés](INTEGRATION_PROGRESSION_RARETES.md) · [Ancienne intégration des palettes](INTEGRATION_PALETTES_LAB.md).

Les sources, variantes et masques non validés ont été supprimés dans toutes les éditions, ainsi que leurs planches d’essai. Les sources, cinq finitions et masques des six familles approuvées sont inchangés. Les images des œuvres, leurs métadonnées et les avis ne sont pas supprimés. La publication de ce nettoyage vise uniquement le lab ; le jeu en ligne n’est pas redéployé.

## Direction des prochaines générations

L’utilisateur a accepté le style des expériences **Japon et Photographie**, dans leurs cinq raretés. Elles deviennent les références visuelles des prochaines générations : relief sculpté, moulures travaillées, matières cohérentes et composition propre à chaque thème. [Descriptif et méthode courants](GENERATION_CADRES.md) · [Brief réutilisable](../src/card-lab/generationStyle.ts).

Les anciens fichiers `*Specs.ts` restent des archives de provenance, **pas des consignes pour les nouvelles images**. L’utilisateur a ensuite autorisé l’intégration des palettes au lab, sans modifier les six familles historiques ni la copie du jeu. Toute future génération reste locale en l’absence d’une nouvelle demande d’intégration.

## Historique : retrait avant refonte

Les paragraphes ci-dessous décrivent les anciens systèmes, pas le registre actif ci-dessus. Leurs mentions de fichiers « conservés » ne concernent plus les assets non validés supprimés lors du nettoyage.

Les anciens cadres sont **retirés de l'affichage du jeu** à la demande de l'utilisateur : pas de superposition PNG, pas de passe-partout, pas de bordure de repli. Les reproductions restent entières, sans recadrage ni étirement, dans les cartes, les fiches, les tirages et le musée.

Tous les fichiers de `public/assets/collections/`, y compris `display/` et ses masques, sont exclus de Firebase Hosting par `assets/collections/**`. Les fichiers et leur provenance restent conservés localement pour la refonte. Aucune image d'œuvre, rareté ou donnée de collection n'est supprimée.

`FramedArtwork.tsx` conserve son interface et ses classes de mise en page pour éviter une migration des écrans, mais ne consulte plus le registre de cadres. `frames.css` gère uniquement les reproductions sans cadre et les badges. `src/frames.ts` et ses registres ne constituent plus un système actif : ils sont conservés comme références historiques. La refonte du fonctionnement reste à définir ; aucun nouveau système n'est activé.

## Préparation historique, manuelle uniquement

Déposer les PNG transparents 1024×1536 dans `public/assets/collections/`, avec une ouverture centrale fermée, nommés `<famille>-fer.png`, `-cuivre.png`, `-argent.png`, `-dore.png` et `-lapis-lazuli.png`. Puis lancer :

```sh
npm run prepare:frames
```

Cette commande reste disponible pour travailler sur les archives mais **ne s'exécute plus avant dev, tests ou build**. Elle conserve les originaux, génère les réductions 640×960 et les masques dans `collections/display/`, puis actualise `src/frame-assets.json` et son rapport. Ne pas modifier ces registres à la main. Préparer un fichier ne le réactive pas dans l'interface et ne le republie pas.

L'ancien script mesurait une fenêtre transparente sûre et la région intérieure réelle de chaque cadre. L'ancienne marge intérieure de 3 %, les papiers et les fenêtres de cadrage ne sont plus appliqués par l'interface.

Les anciennes correspondances `frameFamily` restent des métadonnées historiques, sans effet visuel dans le jeu actuel.

Les cinq originaux Japon non validés ont également été supprimés, et leur ancien signalement a été retiré du rapport actif.

Les originaux, les dérivés et les masques restent **tous hors publication**. Les cinq sources des Arts décoratifs restent dans `output/imagegen/`, avec prompts et provenance dans `catalog/decorative-frame-generation.json`. Leur reconstruction historique (`node scripts/prepare-decorative-frames.mjs`) refuse d'écraser un original modifié inconnu, mais n'est pas requise pour utiliser ou publier le site sans cadres.
