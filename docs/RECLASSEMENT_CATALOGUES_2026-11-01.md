# Reclassement des 1 011 cartes — types et thèmes

Choix utilisateur : **types d'œuvres + thèmes secondaires**.

## Diagnostic

L'ancien catalogue `beaux-arts`, nommé « Renaissance Éternelle », était devenu un fourre-tout de **857 cartes principales**, sans rapport avec une période Renaissance. Les ajouts photographiques, textiles et céramiques y avaient été placés faute de catalogues spécialisés. Le problème était celui des appartenances, pas des raretés ni des inventaires.

Les 911 ajouts portent huit types institutionnels exploitables. Les 100 cartes historiques ont été examinées à partir de leurs notices et techniques ; elles contiennent aussi du verre, du mobilier, des manuscrits et d'autres objets archéologiques. Les noms d'objets du Met, parfois très spécifiques, ne sont pas comptés comme autant de catégories différentes.

## Douze types principaux

| Type | Cartes |
| --- | ---: |
| Peintures | 235 |
| Sculptures | 139 |
| Estampes | 150 |
| Dessins | 98 |
| Photographies | 90 |
| Textiles et tapisseries | 91 |
| Céramiques | 98 |
| Orfèvrerie et arts du métal | 89 |
| Arts du verre | 3 |
| Mobilier et luminaires | 4 |
| Manuscrits et enluminures | 2 |
| Autres objets archéologiques | 12 |
| **Total unique** | **1 011** |

Chaque carte a **exactement un type principal**. Ce sont des regroupements éditoriaux documentés pour cette banque, pas l'affirmation qu'il n'existe que douze catégories dans l'histoire de l'art. Les petits ensembles ne sont ni supprimés ni gonflés artificiellement pour équilibrer les pochettes.

Les types institutionnels priment sur une simple recherche de matériaux : une sculpture en bronze reste une sculpture, une estampe japonaise n'est pas une peinture et une photographie d'une sculpture reste une photographie. Les cas historiques spécifiques ont une décision individuelle, notamment les figurines égyptiennes, le mobilier Tiffany et le Livre des morts sur papyrus. Les objets archéologiques résiduels regroupent les amulettes, outils, jades et objets funéraires qui ne relèvent pas déjà d'un autre type identifié.

## Quatre thèmes secondaires

| Thème | Cartes |
| --- | ---: |
| Égypte ancienne | 28 |
| Renaissance italienne | 68 |
| Mythes et créatures | 65 |
| Premières traces | 10 |

Ces effectifs **se recoupent** : ils ne s'ajoutent pas au total de 1 011 cartes. On peut filtrer, par exemple, les **estampes de la Renaissance italienne**, ou les **sculptures de l'Égypte ancienne**.

- Égypte ancienne : sélection historique et cultures antiques égyptiennes explicitement documentées, pas tout objet plus récent provenant d'Égypte.
- Renaissance italienne : sélection historique, deux œuvres de Léonard au Louvre et œuvres dont les bornes de création sont dans 1400–1600 avec une culture italienne concordante. Une notice contradictoire ou une fourchette traversant largement les limites ne reçoit pas ce thème par supposition.
- Mythes et créatures : sélection historique et figures/créatures nommées dans les titres institutionnels. Une attribution iconographique seulement interrogative n'est pas promue en certitude.
- Premières traces : dix objets néolithiques documentés, sans classer toute œuvre ancienne comme préhistorique.

Ces quatre ensembles ne prétendent pas épuiser tous les thèmes possibles. Les nouvelles appartenances restent traçables dans les données de classement.

## Implémentation et préservation

- `src/catalog/taxonomy.json` : définitions, appartenance principale et thèmes de chaque carte, raisons et références de preuves.
- `catalog/taxonomy/report.json` : effectifs exacts calculés.
- `catalog/taxonomy/taxonomy-2026-11-01/` : snapshot du classement et des effectifs, empreintes et autorisation utilisateur de publication après validation.
- `scripts/catalog-taxonomy/build.ts` : reconstruction déterministe depuis les notices conservées, sans téléchargement ni réécriture des œuvres.
- `src/catalog/taxonomy.ts` : validation de la couverture totale, de l'exclusivité des types, des thèmes et de leurs preuves.
- `npm run taxonomy:check` : contrôle des empreintes des sources, des effectifs, des couvertures et de la préservation des données des cartes.

Le socle de 100 cartes, la livraison figée de 911 ajouts, les raretés humaines, preuves juridiques, licences, crédits, sources et images ne sont **pas modifiés**. Le reclassement est une projection indépendante dans `src/data.ts`. Les cadres existants sont conservés avec un pointeur visuel distinct du nouveau catalogue principal ; aucune illustration n'est générée ou écrasée.

Les anciens identifiants de catalogues restent reconnus dans les sauvegardes et les derniers tirages. Les deux anciens fourre-tout sont cachés des choix courants, pas effacés des règles de compatibilité. Les quatre identifiants thématiques existants sont conservés.

Le stockage `muse-collection-v1`, les identifiants de cartes, exemplaires, favoris, musée, stock et derniers tirages ne changent pas. Les probabilités généralistes restent **56,1 / 25,5 / 15 / 3 / 0,4 %** ; chaque pochette spécialisée renormalise ces mêmes poids entre les raretés réellement présentes.

## Validation et publication

`npm run check` : **139 tests réussis**, builds du jeu et de l'atelier réussis. La pagination est bornée pour rester lisible avec 169 pages, avec accès aux premières et dernières pages et conservation des pages voisines.

Parcours compilés réussis à **390 et 1440 px, clair et sombre** : 16 couvertures décodées avec effectifs vérifiés, 48 combinaisons type/thème par parcours, type affiché sur les cartes et les fiches, accès à la dernière page puis retour, ancien tirage de trois cartes avec identifiant de catalogue historique, nouveaux tirages de cinq cartes avec membres vérifiés, favoris/musée et export/import conservés. Aucun débordement horizontal ni erreur JavaScript. Toutes les images et tous les cadres du paquet Hosting restent identiques à la publication précédente.

L'utilisateur a autorisé **« Publier après validation »**, pour le jeu uniquement, sans déploiement de l'atelier ni commit/push.

**Publié le 1er novembre 2026 à 14:38:57 UTC**, version Firebase Hosting **`0e9f301be0d6a6e9`**, sur https://muse-collection-6f2d.web.app/#pochettes. Commande ciblée : `firebase deploy --only hosting --config firebase.muse.json --project muse-collection-6f2d --non-interactive`.

Vérifications en ligne terminées : **1 104 fichiers identiques au build**, dont les 911 images d'ajouts ; HTML sans cache et chemins privés/de revue testés en 404. Les mêmes quatre parcours navigateur réussissent sur le site publié : **12 types, 4 thèmes, 48 intersections par parcours, 16 couvertures décodées**, anciens tirages et sauvegardes préservés, nouveaux tirages et export/import valides. Aucun débordement horizontal ni erreur JavaScript.

Preuves locales : `/tmp/opencode/muse-taxonomy/`.

Évolution ultérieure demandée le même jour : les cadres ont ensuite été [retirés de l'affichage et de la publication](RETRAIT_CADRES_2026-11-01.md), sans modifier ce classement ni les données des cartes. Les pointeurs et fichiers historiques restent conservés pour la refonte.
