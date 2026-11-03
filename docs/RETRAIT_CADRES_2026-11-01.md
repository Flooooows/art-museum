# Retrait des cadres du site — 1er novembre 2026

Demande utilisateur : **« Supprime tous les cadres actuellement sur le site, on va retravailler la façon dont les cadres marchent »**.

## Périmètre

- Aucun cadre, passe-partout ni masque superposé sur les cartes, les fiches, les révélations de pochettes et le musée personnel.
- Aucune bordure de remplacement métallique en CSS : le retrait ne bascule pas vers l'ancien cadre de repli.
- Les reproductions originales restent entières et proportionnelles, en `object-fit: contain` ; les fonds et bordures ordinaires de l'interface ne sont pas des cadres d'œuvre.
- Les 1 011 identifiants, raretés humaines, images, crédits, sources, preuves juridiques, 12 types et 4 thèmes sont conservés. Inventaires, favoris, expositions et anciens tirages restent lisibles.
- Aucun nouveau système de cadres n'est décidé ou implémenté dans ce retrait.

## Archives et publication

`src/FramedArtwork.tsx` conserve son interface commune mais n'importe plus le registre des cadres et ne rend qu'une image d'œuvre. `src/frames.css` retire les fenêtres à marge, les masques, les superpositions et le cadre de repli.

Le dossier `public/assets/collections/` reste intact localement, avec ses originaux, dérivés, masques et preuves. **Tout le dossier est exclu de Firebase Hosting** via `assets/collections/**` ; les 60 dérivés et masques qui étaient servis par le jeu ne sont plus publiés. Les anciennes URLs deviennent donc inaccessibles dans la nouvelle version du site, plutôt que simplement cachées par du CSS.

La préparation des cadres ne s'exécute plus automatiquement avant le démarrage, les tests ou le build. `npm run prepare:frames` reste une commande historique manuelle pour les travaux futurs, sans activation ni publication automatique.

Les tests du registre historique vérifient la conservation des fichiers, pas leur activation dans l'interface. Les nouveaux tests vérifient le rendu sans cadres pour chacune des 1 011 cartes et l'exclusion des fichiers de la publication.

## Validation et déploiement

- `npm run check` : **142 tests réussis**, dont le rendu sans cadres des 1 011 œuvres et les contrôles des archives locales.
- `npm run build` réussi, sans exécuter la préparation des cadres.
- Paquet Hosting : **1 044 fichiers**, aucun fichier de `assets/collections/` ; le JavaScript compilé ne contient plus les URLs du registre des cadres.
- Les images d'œuvres et les autres illustrations publiées restent identiques à la version précédente. Le catalogue, les raretés, le classement, les probabilités et les sauvegardes ne sont pas migrés.
- Parcours navigateur compilés réussis à **390/1440 px, clair/sombre** : cartes, fiches, résultats de tirage et musée sans superposition, masque, bordure de repli ni requête vers les fichiers de cadres. Les fiches suivent la hauteur naturelle de l'image et ne conservent plus l'ancienne fenêtre verticale.
- Les 16 pochettes, 48 intersections type/thème par parcours, les anciens derniers tirages et l'export/import restent fonctionnels ; aucun débordement horizontal ni erreur JavaScript.

**Publié le 1er novembre 2026 à 15:00:10 UTC**, version Firebase Hosting **`d2169e93bdbfd2bf`**, sur https://muse-collection-6f2d.web.app/#pochettes.

Déploiement du jeu uniquement : `firebase deploy --only hosting --config firebase.muse.json --project muse-collection-6f2d --non-interactive`. Aucun déploiement de l'atelier, aucun commit/push Git.

Contrôle des fichiers en ligne réussi : **1 044 fichiers identiques au build**, dont les 911 images d'ajouts. Les **95 URLs** de fichiers PNG conservés localement (originaux, dérivés et masques) répondent toutes **404** sur le site. Les chemins privés et de revue testés restent inaccessibles et l'HTML est servi sans cache.

Les quatre parcours navigateur ont également réussi sur le site publié : absence de cadres dans les cartes, fiches, tirages et musée, aucune requête vers les anciens fichiers, hauteur naturelle des reproductions dans les fiches, 12 types et 4 thèmes conservés, anciens tirages et sauvegardes valides, export/import fonctionnel. Aucun débordement horizontal ni erreur JavaScript.

Preuves locales : `/tmp/opencode/muse-frameless/`.
