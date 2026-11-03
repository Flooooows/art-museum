# Vérification et publication après le tri — 30 octobre 2026

Publication Firebase demandée après le [rangement](TRI_PROJET.md). Aucun commit ni push Git effectué.

## Résultat

- **Jeu publié** : https://muse-collection-6f2d.web.app, version Hosting `fe5c18a8e90ad3f0`, le 30 octobre 2026 à 13:23:35 UTC. Commande ciblée : `firebase deploy --only hosting --config firebase.muse.json --project muse-collection-6f2d --non-interactive`.
- **Atelier déjà à jour** : https://art-museum-8fdd8-atelier.web.app. Les 220 fichiers du build local ont été comparés aux fichiers en ligne : tous identiques. Aucun redéploiement inutile ; version Hosting conservée `845f5a185b282b89`.

## Contrôles réussis

- `npm run check` : typage application/scripts, **97 tests**, audit des 100 œuvres et de leurs reproductions.
- Builds du jeu et de l'atelier réussis. Les avertissements connus sur les cinq cadres Japon restent attendus ; les polices du paquet atelier sont présentes.
- Versions compilées **puis sites en ligne** : jeu à 390/1440 px, navigation et 28 vues en clair/sombre, ouverture de cinq cartes, persistance après rechargement, export/import, refus d'un JSON invalide, thème et accès au musée. Aucun débordement horizontal ni erreur JavaScript dans ces parcours.
- Versions compilées puis atelier en ligne : revue du millier, 78 candidates et premier lot de 25 ; choix initialement vides, sauvegarde, rechargement, export/import et images locales des candidates, à 390/1440 px.
- Les **193 fichiers du jeu publié** sont identiques au build local : environ **49,34 Mio**, avec les **60 dérivés/masques** de cadres. Les 35 URL des PNG originaux et les quatre URL de revue testées sur le site du jeu renvoient bien 404. Les originaux restent conservés localement.
- HTML du jeu servi avec `Cache-Control: no-cache`. Les trois catalogues de l'atelier sont identiques aux références locales.
- Empreintes des données, règles de tirage, preuves, rapports déplacés, archives de sources et export humain original intactes ; fichiers privés toujours ignorés par Git.

Les tests navigateur utilisent des contextes isolés et des exports de test, jamais les collections ou décisions personnelles. Aucun calcul éditorial, changement de score, activation de carte ou migration de sauvegarde n'a été effectué.

## Limite connue inchangée

Les lots de candidates ne protègent pas encore les écritures concurrentes entre onglets : garder un seul onglet ouvert par lot et exporter régulièrement. Cette correction fonctionnelle reste hors du nettoyage et de cette publication.

Journaux et résultats temporaires : `/tmp/opencode/muse-release/` ; captures du jeu compilé et en ligne : `/tmp/opencode/muse-cleanup/compiled/` et `/tmp/opencode/muse-cleanup/live/`. Ces fichiers ne sont ni versionnés ni déployés.

## Publication ultérieure de l'atelier avec les droits UE

À la demande de l'utilisateur, l'atelier a ensuite été publié le **30 octobre 2026 à 14:05:10 UTC**, version Hosting **`f47feab88990b55c`**, pour reprendre les choix et raretés du [lot initial](https://art-museum-8fdd8-atelier.web.app/masterpieces.html?lot=initial).

- `npm run check` : **119 tests**, typage, audits et reproduction des dossiers juridiques réussis ; `npm run build:atelier` réussi.
- Déploiement ciblé : `firebase deploy --only hosting --config firebase.json --project art-museum-8fdd8 --non-interactive`. Le jeu n'a pas été redéployé et aucune carte n'y a été activée.
- **221 fichiers en ligne identiques au build**, dont le rapport UE ; HTML du lot initial et rapport servis avec `Cache-Control: no-cache`.
- Lot initial testé sur la version compilée puis en ligne à 390/1440 px : 25 cartes, sélection et rareté indépendantes, persistance après rechargement, export/import sans doublon, isolation des autres lots, filtre « Ma sélection → Sans choix de sélection ».
- Versions de catalogues et clés de sauvegarde inchangées ; tests dans des navigateurs isolés, sans toucher aux choix personnels. Aucun commit/push Git.

Journaux et exports de test : `/tmp/opencode/muse-atelier-deploy/`, hors du dépôt et du site.

## Compteurs et filtres des raretés personnelles

Publication le **30 octobre 2026 à 15:18:39 UTC**, version Hosting **`9b8b312ffa3a3b71`**, uniquement sur l'atelier.

- Nouveau panneau **« Mes raretés finales »** dans les trois revues : un compteur par niveau et filtres cliquables, cartes examinées et cartes sans rareté finale.
- Comptage du dernier choix personnel de chaque carte, incluant Esquisse (niveau zéro), sur le lot entier et toutes les pages ; aucun mélange avec l'algo, les choix Retenir/Écarter ou les autres lots.
- Compteurs recalculés immédiatement après modification, annulation ou import ; formats d'exports, versions et clés de sauvegarde inchangés. Avec un filtre de rareté dans la revue du millier, les cartes restent en place jusqu'à « Actualiser la liste », comme pour les filtres de revue existants.
- `npm run check` : **125 tests**, dont six nouveaux tests ciblés ; builds du jeu et de l'atelier réussis. Catalogues, scores, dossiers juridiques et sauvegarde humaine originale inchangés.
- Douze scénarios navigateur sur le build, puis rejoués en ligne : trois revues × 390/1440 px × clair/sombre. Compteurs globaux malgré pagination et autres filtres, niveau zéro, modification/annulation, rechargement et export/import vérifiés avec des choix synthétiques isolés.
- **221 fichiers en ligne identiques au build**. Aucun déploiement du jeu, aucune activation éditoriale ni commit/push Git.

Résultats temporaires : `/tmp/opencode/muse-personal-rarity/`, hors du dépôt et du site. [Mode d'emploi des compteurs](UTILISER_ATELIER.md#voir-combien-de-cartes-vous-avez-classées-dans-chaque-rareté).

## Nouvelle livraison du jeu — 353 cartes et raretés humaines

Le jeu a ensuite été publié à **16:13:13 UTC**, version Hosting **`0f54dfd34fd60ef4`** : 253 nouvelles cartes admissibles UE et les raretés humaines des 100 existantes. **446 fichiers en ligne identiques au build**, 131 tests réussis et contrôle navigateur des 253 nouvelles fiches, des anciens états, des nouveaux tirages, des crédits/liens et de l'export/import. L'atelier n'a pas été redéployé. Voir [le périmètre, les exclusions juridiques et les preuves de cette livraison](PUBLICATION_CARTES_2026-10-30.md).
