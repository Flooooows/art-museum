# Revue finale — catalogue structuré et cinq cartes

Date : 2026-10-29. Revue effectuée par l’agent principal, pas une validation indépendante ni une revue éditoriale des œuvres. Périmètre : évolution demandée, identité MUSE conservée.

## Résultat

Lot prêt pour la démonstration locale : modèle branché au site, cinq cartes par nouvelle pochette, anciens résultats de trois préservés. Aucune publication culturelle ou infrastructure hébergée n’est prétendue.

## Preuves

- `npm test` : 27 tests réussis ; modèles, gardes, références actives, multi-appartenances, tirages, anciennes sauvegardes et cadres.
- `npm run build` : TypeScript et Vite réussis ; audit intégré valide.
- Audit normal : 20 œuvres, 4 catalogues de démonstration, 21 appartenances, 0 œuvre publiée, 0 rareté validée.
- `npx tsx scripts/audit-catalog.ts --json --require-ready` : code 1 attendu, 20 fiches bloquées par droits et rareté à revoir.
- Comparaison champ par champ avec `output/playwright/pre-catalog-snapshot.json` : tous les anciens champs des 20 œuvres et 4 catalogues identiques, dont titres, textes, niveaux, images et notices.
- Playwright : parcours exécutés en développement puis sur le build servi à `http://localhost:4173`. Ouverture généraliste, révélation de la cinquième carte, fermeture, rechargement, reprise sans nouveau tirage, révélation complète, ouverture Égypte immédiate, export puis import du vrai fichier téléchargé, import d’une sauvegarde de trois cartes, révélation de ses trois cartes puis nouvelle ouverture de cinq. Stock et totaux vérifiés à chaque étape.
- Taouret retrouvée une seule fois dans les filtres Égypte et Mythes, crédit issu des droits affiché et total Égypte à six ; pas de second identifiant d’inventaire.
- 40 géométries : quatre pages principales et résultats, deux thèmes, 320/390/768/1440 px ; aucun débordement horizontal. Résultats : cinq cartes, une colonne à 320/390 et trois colonnes à 768/1440, prose de 16 px ; images décodées sans échec.
- 21 audits axe WCAG 2 A/AA et 2.1 A/AA sur la version compilée : zéro violation (quatre pages × deux thèmes × 320/1440, résultats × deux thèmes × 320/1440, aperçu avec probabilités développé).
- Détecteur Impeccable, exécuté une fois : `[]`. Les ajustements ultérieurs ne changent que les noms accessibles des boutons, sans nouvelle valeur visuelle.
- Inspection visuelle des captures de résultats haut/bas sur bureau et téléphone : cinq cadres entiers, métadonnées lisibles, cinquième carte et actions accessibles par défilement intérieur, identité claire/sombre préservée.

## Corrections issues de la vérification

L’audit WCAG 2.1 a trouvé des noms accessibles ne contenant pas tout le texte visible sur le stock, les choix thématiques et les cartes d’inventaire. Le stock reprend désormais son texte chiffré ; les deux autres contrôles utilisent leur contenu visible pour le nom accessible. L’illustration répétée des pochettes est décorative pour les technologies d’assistance. Aucun graphisme modifié.

Les cinq nouveaux cadres Japon ont été examinés : quatre sans canal alpha et un sans ouverture suffisamment grande. Préparation non bloquante et rapport explicite ; originaux intacts, 25 cadres valides actifs. Ne pas les déclarer disponibles avant correction des fichiers source.

## Artefacts

`output/playwright/verify-five-cards.js` et `review-five-layout.js` contiennent les parcours. Les captures `five-reviewed-{light,dark}-{320,390,768,1440}-{top,bottom}.png`, `five-credit-detail.png`, `five-rates-dark-1440.png` et `five-export.json` appartiennent à la vérification, pas aux ressources publiques. La collection de test n’est pas un état initial du site. Les captures des anciens lots restent historiques et ne sont pas réécrites.

## Limites assumées

Source locale structurée, aucune base hébergée, aucun compte, aucun tirage serveur ni marché transactionnel. Six ensembles pour 100 œuvres uniquement planifiés, avec 19 candidats existants et Hokusai en réserve. Les notes de notoriété, droits et sources demandent une vraie revue humaine ; le validateur ne fait que vérifier la cohérence et la complétude des déclarations. Pas de déploiement ni de commit effectué.
