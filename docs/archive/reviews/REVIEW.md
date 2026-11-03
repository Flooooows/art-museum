# Vérification finale — MUSE

Le site implémente les quatre compositions fournies, avec adaptations fonctionnelles et textuelles à `concept.md`. Le rendu n’est pas présenté comme une copie pixel à pixel : les prix spéculatifs et promesses de blockchain ont notamment été remplacés par les découvertes culturelles et la progression locale.

## Relecture indépendante

La relecture des seize captures initiales a retenu deux corrections matérielles : agrandir les informations de rareté/possession sur téléphone, et afficher les erreurs d’import dans le dialogue actif plutôt que derrière sa toile de fond.

Les informations centrales des cartes sont désormais à 10 px sur mobile. Les erreurs de fichier invalide et de fichier trop volumineux apparaissent dans un élément `role="alert"` à l’intérieur du dialogue. Les nouvelles captures ont été relues par le même agent ; les deux corrections ont été jugées **résolues**, sans reste ouvert pour ces deux points. Disposition du passage de validation : **ship**.

## Vérifications techniques

`npm test` : huit tests réussis. `npm run build` : TypeScript et compilation de production réussis. `npm audit --omit=dev` : aucune vulnérabilité signalée. Les 35 images ont une provenance embarquée et un manifeste de sources ; les trois familles de polices ont leur licence locale.

La version compilée a aussi été servie par `vite preview` sur le port 4173 et testée dans une session navigateur neuve : ouverture, révélation, collection, rechargement, trois exemplaires conservés et stock passé de dix à neuf. Console de production : zéro erreur, zéro avertissement.

Les parcours ont été exercés dans un vrai navigateur : ouverture normale et rapide, révélation individuelle et complète, inventaire persistant, recherche sans accents, filtres, tri, pagination, état vide, favoris, exposition, export téléchargé, import invalide/annulé/confirmé et import trop volumineux. Le dialogue culturel se parcourt sur téléphone et toutes les ressources de l’interface sont locales.

Absence de débordement horizontal vérifiée à 320, 390, 768, 1280 et 1440 px. Captures principales à 1440 × 1000 et 390 × 844. Les captures de dialogue sont limitées au viewport ; les pages sont capturées en entier depuis le haut. Animations terminées avant les captures ; mode de réduction des animations vérifié.

Les contrôles automatisés Axe WCAG 2 A/AA des variantes contrôlées n’ont plus signalé de violation après correction des contrastes. Cela ne constitue pas une certification d’accessibilité. Le détecteur de style a uniquement signalé Inter, volontairement préservée car elle appartient aux références imposées.

## Limites explicites

Version invitée locale : pas de comptes synchronisés, de transactions réelles ou d’échanges multijoueurs. Les paramètres de stock, les taux et le classement éditorial de notoriété restent provisoires. Les œuvres absentes d’un niveau ne sont pas promues pour remplir les catalogues ; les taux thématiques reflètent les niveaux réellement disponibles.
