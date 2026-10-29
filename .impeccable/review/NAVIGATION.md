# Pochettes / Marché / Collection / Profil

## Résultat

Accueil recentré sur le choix : pochette tous styles en vedette, puis quatre univers directement sélectionnables. Suppression des blocs promotionnels, statistiques imbriquées, explications de rituel et filtres inutiles pour quatre choix. Ouverture et révélation dans un même dialogue, jamais des onglets. Les dernières cartes non entièrement dévoilées peuvent être reprises sans nouveau tirage, y compris après rechargement.

Marché montre les vrais exemplaires supplémentaires, recherche et accès aux fiches. Le statut d’échanges à venir est explicite ; ce périmètre sans transactions a été confirmé par l’utilisateur. Profil regroupe progression, musée, export/import et thème. Collection garde ses vues et fonctionnalités. La séparation des usages s’inspire de Kyara consulté en lecture seule ; le graphisme reste MUSE.

## Vérifications

- Treize tests unitaires réussis et compilation TypeScript/Vite réussie.
- 48 combinaisons : quatre pages, deux thèmes, largeurs 320/390/768/1024/1280/1440 px. Aucun débordement horizontal, exactement les quatre liens demandés, une page active, en-tête sticky.
- Seize audits Axe WCAG 2 A/AA des pages principales, plus confirmation, probabilités ouvertes, résultats et fiche imbriquée. Une encre dorée héritée trop claire sur ivoire a été remplacée par `gold-ink` ; les quatre contrôles de probabilités clair/sombre sur bureau/téléphone sont sans violation. Ce contrôle n’est pas une certification.
- Choix et annulation sans consommer de stock ; confirmation et double-clic consommant exactement une pochette et ajoutant trois cartes ; ouverture générale, thématique, rapide et clavier ; fermeture/reprise conservant exactement les cartes ; reprise après rechargement.
- Export téléchargé, import invalide sans mutation, annulation de remplacement sans mutation, import confirmé. Stock vide testé par une sauvegarde de test dans une session isolée, puis sauvegarde restaurée : ouverture bloquée pour la généraliste et les thématiques.
- Doublons issus de vrais tirages dans la session de test, quantités cohérentes, recherche sans résultat explicite. Aucune annonce fictive.
- Musée interne à Collection, retour navigateur, anciennes routes ramenées à l’accueil sans tirage, thème conservé. Les identifiants uniques et le verrou partagé des dialogues empêchent les conflits lors d’une fiche ouverte au-dessus du tirage ; navigation fermant les deux sans bloquer le défilement.
- Recherche depuis l’en-tête : focus transmis au champ plutôt qu’au conteneur principal, saisie immédiate de « Socrate » et filtrage validés. L’action de remise à zéro des filtres utilise désormais l’encre de lien du thème, plutôt qu’un brun historique trop peu contrasté sur bordeaux.
- Détecteur exécuté une fois : avis de tailles de titres locales et rayons 8/12 px à consigner dans le registre, aucun défaut mécanique bloquant.

## Relecture visuelle

Relecture indépendante de 27 captures dans `output/playwright/tabs-*.png` : **ship**, aucun correctif matériel demandé. L’accueil donne la priorité à la généraliste ; les lignes thématiques mobiles et les rôles des quatre destinations sont conservés. Les captures des dialogues sur téléphone sont volontairement limitées au viewport, avec défilement interne.

Le contrôle fonctionnel supplémentaire de recherche a ensuite entraîné deux corrections ciblées : conservation du focus du champ et contraste de « Réinitialiser ». Nouvelle capture `tabs-search-focused-desktop.png`, audit sans violation vérifié par assertion, puis verdict indépendant sur ces corrections : **ship**, résolues. Aucun autre changement de disposition visuelle.

Le fichier `booster.png`, les reproductions et les polices ne sont pas modifiés. La provenance existante reste applicable.
