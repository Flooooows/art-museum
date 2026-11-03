# Lisibilité, navigation persistante et thèmes

## Résultat

Adaptation demandée par l’utilisateur : textes nettement agrandis, en-tête restant visible et thème sombre cohérent. Identité, reproductions et fonctionnement de la collection préservés. Relecture indépendante : **ship**, aucun point matériel restant sur les dix-sept captures examinées. Les anciens microtextes ne sont plus la référence pour les informations utiles.

## Implémentation

`src/appearance.css` s’applique après le style historique : prose 16 px, contrôles 15 px, libellés 14 px, indications utiles 13 px. Saisies et sélecteurs 16 px ; boutons et champs de 48 px minimum. Les pochettes et œuvres passent sur une colonne sur les petits téléphones au lieu de réduire leurs textes. Seules les inscriptions décoratives des emballages restent miniatures.

L’en-tête opaque reste en haut de page, avec compensation de son encombrement pour les cibles de navigation. Les noms « Ouvrir » et « Révéler » permettent de garder les quatre liens lisibles jusqu’à 320 px.

Le thème sombre utilise un charbon chaud, du texte ivoire, des actions bordeaux, des liens outremer éclaircis et une encre dorée. Les rôles de texte et de remplissage d’action sont séparés : il ne s’agit pas d’une inversion mécanique. Les images ne sont pas modifiées. La préférence suit le système jusqu’à un choix explicite, puis utilise la clé `muse-theme`, indépendante de l’inventaire. Initialisation avant affichage dans `index.html`.

## Vérifications

- Onze tests réussis, dont trois pour la résolution et la validation du thème ; compilation TypeScript et Vite réussie.
- Trente-six combinaisons de largeur, thème et écran vérifiées : 320, 390, 768, 1024, 1280 et 1440 px ; clair et sombre ; pochettes, collection et atelier. Aucun débordement horizontal.
- Mesures navigateur : corps 16 px, actions 15 px, navigation 14 px à 390 px. L’en-tête reste à `y = 0` après 1600 px de défilement ; un clic physique sur le thème ne fait pas remonter la page.
- Préférence sombre conservée au rechargement, compteurs et œuvres inchangés. Suivi des changements de préférence du système vérifié avant choix explicite.
- Axe WCAG 2 A/AA : aucune violation sur les variantes finales contrôlées, notamment accueil et collection en clair/sombre sur téléphone et accueil sur bureau. Les fiches, l’atelier, la révélation et le profil ont également été contrôlés pendant l’implémentation. Ce contrôle ne constitue pas une certification d’accessibilité.
- La version compilée sur 4173 a été testée dans une session neuve : thème, typographie, en-tête persistant, ouverture, révélation et inventaire conservé après rechargement.

Le détecteur mécanique a signalé des écarts par rapport à l’ancienne échelle et à l’ancienne palette documentaire : ces changements sont ceux demandés par l’utilisateur. `DESIGN.md` et son fichier compagnon ont été actualisés pour les consigner.
