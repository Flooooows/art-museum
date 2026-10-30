# Tester Muse à deux

Le jeu principal est publié sur https://muse-collection-6f2d.web.app.

Le nouveau projet Firebase porte le nom **Muse**, avec l’identifiant technique unique `muse-collection-6f2d`. Il est distinct du projet `art-museum-8fdd8`, qui héberge l’atelier de validation. Aucun compte, base de données ou service payant n’a été activé pour ce déploiement : seul Firebase Hosting est utilisé.

## Deux testeurs, deux collections

Partager le lien et ouvrir le jeu chacun dans son navigateur ou sur son téléphone. Pour simuler deux joueurs sur un seul ordinateur, utiliser deux profils de navigateur distincts. Chaque profil conserve ses propres pochettes, cartes, favoris et préférences. Il n’existe pas de compte ni de synchronisation en temps réel ; les échanges du marché ne sont pas actifs.

À tester : ouvrir une pochette de cinq cartes, révéler les cartes, fermer et reprendre une ouverture, retrouver les cartes dans Collection, modifier les favoris et le musée, consulter les doublons dans Marché, puis recharger la page. Dans Profil, exporter une sauvegarde avant tout changement d’appareil ou effacement des données du navigateur.

Les sauvegardes de localhost ou d’un autre domaine ne sont pas transférées automatiquement. Pour reprendre une collection existante : l’exporter depuis Profil sur l’ancienne adresse, puis l’importer dans Profil sur la nouvelle. L’import remplace la collection après confirmation : exporter d’abord la collection déjà présente sur la nouvelle adresse.

Les œuvres candidates et les choix de rareté restent dans l’atelier séparé : https://art-museum-8fdd8-atelier.web.app. Ils ne sont pas activés dans le jeu principal. Les 100 fiches actives et leurs probabilités ne sont pas modifiées par ce déploiement.

## Redéployer uniquement le jeu

Depuis la racine du dépôt :

    npm run deploy:muse

Cette commande teste le catalogue et les images, compile le jeu et utilise explicitement `firebase.muse.json`, le projet `muse-collection-6f2d` et son site Hosting. Elle ne déploie pas l’atelier. La configuration historique `firebase.json` et la commande `deploy:atelier` restent réservées à l’atelier.

Le build général contient aussi des fichiers de revue ; la configuration du jeu exclut `review.html`, `review-data/`, `masterpieces-data/` et `masterpieces-images/` de son déploiement.

## Vérification de la publication

Le 30 octobre 2026 : build et **84 tests réussis**, puis déploiement de 232 fichiers sur le seul site `muse-collection-6f2d`. La page publique répond HTTP 200 ; les chemins de revue exclus répondent HTTP 404. L’empreinte publique du catalogue de l’atelier est inchangée.

Un test Chromium avec deux contextes isolés (ordinateur et téléphone) a ouvert une pochette pour chaque joueur : chacun obtient cinq cartes et conserve neuf pochettes. L’ouverture du premier ne modifie pas le second. Les collections persistent au rechargement ; aucune erreur JavaScript observée dans le parcours principal. Les 23 images de la collection de test, cadres compris, se chargent sans échec. Captures dans `output/playwright/muse-live-*` ; ces collections appartiennent uniquement au navigateur automatisé, jamais aux données initiales du site.
