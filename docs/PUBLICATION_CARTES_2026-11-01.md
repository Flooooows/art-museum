# Extension du millier — 1er novembre 2026

Autorisation utilisateur : **« Tu peux tout publier sauf les 3 blocked »**.

## Périmètre

La livraison ajoute les **658 cartes manquantes du millier** et conserve intégralement les 353 cartes précédentes : **997 cartes du millier + 14 cartes supplémentaires déjà publiées = 1 011 cartes**. Les 25 candidates initiales et les 64 autres candidates illustrées hors millier ne sont pas ajoutées dans cette extension.

Les trois exclusions du millier restent :

- `cma-111594` — Intermission ;
- `cma-173965` — Lighthouse Village (also known as Cape Elizabeth) ;
- `cma-127227` — Church Bells Ringing, Rainy Winter Night.

Les deux autres dossiers bloqués sont des notices de recherche non illustrées, absentes du jeu. Aucun dossier `BLOCKED` n'est publié.

## Autorisation distincte de la qualification juridique

Les 658 ajouts restent **`REVIEW_REQUIRED`**, avec leurs données et décisions juridiques originales. L'autorisation de publication n'est ni une validation automatique UE, ni une nouvelle licence, ni la résolution des incertitudes. Le rapport juridique et ses preuves ne sont pas réécrits.

La livraison porte une autorisation explicite datée, la demande originale, la version et l'empreinte du catalogue du millier et la liste exacte des 658 identifiants concernés. La garde recalcule les décisions réelles, refuse toujours `BLOCKED`, exige une autorisation correspondante pour chaque dossier à revérifier et rejette toute autorisation excédentaire ou détournée vers un autre catalogue. L'audit contrôle cette portée contre les catalogues et preuves réels.

Chaque nouveau fichier reste issu de la notice CC0 Cleveland sélectionnée : concordance de la notice et de l'URL exacte, absence de revendication de copyright dans les données du musée, téléchargement local, orientation EXIF et réduction proportionnelle dans 1600×1600, sans agrandissement ni recadrage, WebP qualité 88. Le libellé distingue la déclaration CC0 du musée des droits de l'œuvre à revérifier. Les crédits, liens institutionnels, source du fichier, lien de réutilisation et obligations sont conservés.

## Préservation

- Les raretés finales proviennent de l'export utilisateur `mille.json` déjà reçu et vérifié par empreinte ; aucune proposition algorithmique ne les remplace.
- Les 100 fiches du socle, les catalogues de revue et la livraison figée du 30 octobre restent inchangés.
- Les 253 cartes de la première livraison et leurs fichiers sont conservés intégralement, avec mêmes identifiants, métadonnées, raretés et octets d'image.
- Pas de migration du stockage `muse-collection-v1` : inventaires, quantités, favoris, expositions et anciens derniers tirages restent compatibles. Aucune nouvelle carte n'est accordée automatiquement.
- Taux généralistes inchangés : **56,1 / 25,5 / 15 / 3 / 0,4 %**, cinq cartes par nouvelle pochette ; six univers inchangés.

`scripts/game-release/expand-2026-11-01.ts` prépare cette extension datée, conserve la livraison précédente et refuse une activation si la livraison active est inattendue. Les snapshots et leurs manifestes sont figés dans `catalog/game-release/`. L'ancien script de préparation du 30 octobre et son empreinte ne sont pas modifiés.

## Validation et publication

- Livraison préparée : **`game-2026-11-01-72aa26ee91f6`**.
- `npm run check` : **133 tests réussis**, typages et audits du socle, des images, du rapport juridique et de la livraison active ; les 911 images d'ajouts sont décodées et comparées aux empreintes.
- `npm run build` et `npm run build:atelier` réussis. L'atelier est compilé pour vérification, pas déployé.
- Répartition active des raretés humaines : **598 / 275 / 91 / 39 / 8**.
- Les 911 images locales des ajouts pèsent environ **112,27 Mio**. Le paquet Hosting compte **1 104 fichiers**, environ **168,87 Mio** au total ; les images sont chargées à la demande, pas toutes à chaque visite. Les 253 images précédentes restent identiques aux empreintes de la première publication.
- Ouverture de cinq cartes, sauvegarde, export/import, refus de JSON invalide et thème vérifiés à 390 et 1440 px sur le build.
- Sauvegarde historique complète de 100 cartes, favoris, musée et reprise d'un dernier tirage de cinq cartes vérifiés dans un navigateur mobile isolé.
- Parcours général compilé : **28 captures**, quatre pages et dialogues à 390/1440 px, clair/sombre, sans débordement horizontal ni erreur JavaScript.
- Parcours détaillé compilé : **911 fiches** ouvertes sur ordinateur et **34 cas représentatifs** pour chacune des trois autres combinaisons taille/thème (390/1440 px, clair/sombre). Contrôles des raretés, images entières décodées, crédits et liens de notice/fichier/réutilisation, sans débordement ni erreur JavaScript.
- Sauvegarde complète des **353 cartes précédentes** conservée, reprise d'une ancienne pochette de trois cartes, tirage forcé d'une nouvelle carte dans une pochette de cinq, export/import, rechargement, favoris et musée vérifiés dans ces quatre parcours. Les nouvelles cartes ne sont pas accordées gratuitement.

### Déploiement

**Publié le 1er novembre 2026 à 14:03:17 UTC**, version Firebase Hosting **`565faf703be09d52`**, sur https://muse-collection-6f2d.web.app/#pochettes.

Commande ciblée : `firebase deploy --only hosting --config firebase.muse.json --project muse-collection-6f2d --non-interactive`. Aucun déploiement de l'atelier, aucun commit/push Git. L'ancienne livraison reste figée et disponible dans le dépôt de travail.

Contrôle en ligne : **1 104 fichiers identiques au build**, dont les **911 images d'ajouts**. Les chemins testés des exports privés, de `state.zip`, des catalogues de revue et des originaux de cadres restent inaccessibles sur le jeu (404). L'HTML reste servi sans cache.

Le parcours navigateur en ligne a également réussi : 911 fiches et 34 cas représentatifs pour chacune des trois autres combinaisons mobile/bureau et clair/sombre, sauvegarde des 353 anciennes cartes, ancien tirage, nouveaux tirages, favoris, musée et export/import.

Preuves locales : `/tmp/opencode/muse-game-expansion/` et résultats navigateur préfixés `expansion-` dans `/tmp/opencode/muse-game-publication/`.
