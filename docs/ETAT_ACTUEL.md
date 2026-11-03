# État actuel — 2 novembre 2026

> **Laboratoire indépendant :** [MUSE Lab](MUSE_LAB.md) garde les cartes, les sept boosters et l’ouverture sur `muse-lab-6f2d`, avec 21 cas et 95 variantes dont cinq Paléolithique archivées. La présentation validée a été copiée dans le jeu : les futurs essais du lab ne changent pas automatiquement le site principal et n’utilisent pas ses sauvegardes. [Intégration](INTEGRATION_LAB_2026-11-02.md).

## Disponible

- Jeu : https://muse-collection-6f2d.web.app ; **1 011 cartes** (997 du millier et 14 extras conservés), **12 types principaux + 4 thèmes**, cartes à cadres détaillés, sept pochettes et ouverture animée. Toujours cinq cartes par nouvelle pochette, stock de dix et recharge toutes les dix minutes. [Intégration de la présentation du lab](INTEGRATION_LAB_2026-11-02.md) · [Reclassement et effectifs](RECLASSEMENT_CATALOGUES_2026-11-01.md) · [Extension autorisée du millier](PUBLICATION_CARTES_2026-11-01.md) · [Première livraison](PUBLICATION_CARTES_2026-10-30.md).
- Pochettes, révélation, collection filtrable, favoris, musée personnel, doublons et profil avec export/import.
- Interface sombre bordeaux uniquement, reproductions entières, textes complets et bandeau de rareté aligné. Les 90 variantes affectables sont figées dans `src/game-presentation/` ; les anciens PNG et dérivés restent archivés localement, hors publication comme tels.
- Présentation du lab intégrée au jeu le **2 novembre 2026 à 00:31:00 UTC**, version Hosting `545b73e7f226d778` ; les 176 tests passent. Le lab conserve sa release `3b5f3172d4865a5a` pour les futurs essais.
- Ouverture simplifiée publiée le **2 novembre 2026 à 20:34:46 UTC**, `b256155a8d780c8e` : rapide une par une, sans réglages, avec **Tout révéler** juste sous les cartes ; 177 tests réussis. Le lab reste inchangé.
- Format compact publié le **2 novembre 2026 à 20:54:28 UTC**, `adae71ece203ed57` : cartes plus petites dans la collection et les cinq cartes du booster sur une seule ligne, défilante sur écran étroit. 178 tests et 4 044 compositions de cartes réussis ; lab et sauvegardes inchangés.
- Version courante du jeu : **`2b882c1d138f52bb`**, publiée le **2 novembre 2026 à 21:23:31 UTC**. Thème sombre uniquement, dès le HTML, sans bascule dans la navigation ou le profil ; anciennes préférences claires ignorées. Les 186 tests passent. Cette livraison ne modifie ni les sauvegardes, ni le lab, ni l’atelier.
- Atelier : https://art-museum-8fdd8-atelier.web.app ; 1 000 propositions provisoires, sans rareté humaine précochée.
- Deux lots supplémentaires : 78 œuvres à `/masterpieces.html`, 25 au premier lot `?lot=initial`. Les décisions et formats restent séparés.
- Réponses humaines complètes reçues dans `state.zip` : trois exports validés, avec raretés pour les 1 000 œuvres, les 25 cartes initiales et les 78 nouvelles candidates. Les réponses et leur plan préparatoire restent privés dans `private/imports/state-2026-10-30-9b4b2a1552a4/`. L'export original de 722 décisions et son pointeur historique restent conservés intacts. Aucun import dans le jeu ni changement juridique n'est déduit de cette réception.
- Moteur de droits UE et badges automatiques dans les trois revues, avec dossiers vérifiables, sans changement des scores ni activation dans le jeu. Publié sur l'atelier Firebase le 30 octobre 2026 à 14:05 UTC, version Hosting `f47feab88990b55c`. Le lot initial conserve sélection, rareté, persistance et export/import. Voir [la validation juridique UE](DROITS_UE.md).
- **Mes raretés finales** : cinq compteurs personnels cliquables et filtres avec/sans rareté dans les trois revues, calculés sur toutes les cartes de chaque lot, indépendamment des propositions de l'algo et de la sélection artistique. Publication atelier suivante à 15:18 UTC, version Hosting `9b8b312ffa3a3b71`. Voir [le guide de l'atelier](UTILISER_ATELIER.md).

## Limites assumées

Firebase Hosting héberge les fichiers seulement. Il n'y a pas de comptes, de synchronisation entre appareils, de paiement ou d'échanges multijoueurs. Les sauvegardes restent dans chaque navigateur ; exporter régulièrement les JSON.

Le jeu applique les raretés humaines explicitement activées : **598/275/91/39/8** sur 1 011 cartes, sans réécrire les anciennes propositions V2 ou le socle de 100 fiches. Les 658 ajouts du millier conservent `REVIEW_REQUIRED` avec une autorisation explicite de publication distincte. Les cinq dossiers bloqués ne sont pas ajoutés. Les 89 autres candidates illustrées non publiées restent hors périmètre. Les droits documentés ne constituent pas une autorisation commerciale mondiale. Les 911 images des ajouts du jeu sont locales ; les 900 nouvelles images de l'atelier du millier restent servies par le CDN Cleveland.

**Risque connu non corrigé par le tri :** les lots de candidates ne protègent pas encore leurs écritures concurrentes entre deux onglets du même lot. Utiliser un seul onglet par lot et exporter les choix ; l'atelier du millier détecte déjà ces conflits.

## Prochaines étapes

1. Protéger le stockage des candidates et versionner un test à deux onglets.
2. Ajouter une CI et étendre les parcours navigateur désormais versionnés pour les cartes, pochettes et ouvertures du jeu.
3. Consolider les décisions éditoriales et confirmer la portée juridique des futures publications.
4. Étendre la livraison après résolution des dossiers juridiques restants, avec conservation des identifiants, réponses et anciennes livraisons.
5. Choisir un backend si des comptes et une vraie synchronisation sont demandés ; rendre les tirages et transactions autoritaires côté serveur avant toute économie réelle.

Le rangement ne constitue ni une activation de contenu, ni une refonte graphique, ni une publication. Voir [le bilan](TRI_PROJET.md) pour les changements de fichiers.
