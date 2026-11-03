# Cadres de collection et matières de rareté

## Livraison

Les cadres fournis par l’utilisateur sont sélectionnés par famille et niveau dans la révélation, les cartes de collection, le musée et les fiches. Les noms Esquisse, Étude, Composition, Œuvre et Pièce maîtresse sont conservés, conformément à la confirmation explicite ; les matières suivent fer, cuivre, argent, or et lapis-lazuli. Taux, catalogue d’œuvres et format de sauvegarde inchangés.

Beaux-Arts, Égypte et Mythes utilisent respectivement `beaux-arts`, `egypte` et `art-mysterieux`. Arts décoratifs reçoit un cadre sobre de la bonne matière, sans emprunt historique incorrect. Art moderne et Préhistoire sont déjà indexés pour les prochaines familles ; aucune œuvre ni collection fictive n’est créée.

## Assets et fidélité

25 originaux transparents 1024×1536 conservés intacts dans `public/assets/collections`. Les 25 PNG d’affichage 640×960 conservent la transparence et les détails, sans recadrage ni recoloration : 17,15 Mio au total contre 50,55 Mio d’originaux, soit 66 % de moins. Chargement paresseux hors révélation et fiche. Origine intégrée aux dérivés ; scan : 25 rasters, zéro provenance manquante. Licence originale non précisée, aucune licence inventée.

`scripts/prepare-frames.mjs` découvre les fichiers par nom et produit `src/frame-assets.json`. La fenêtre est le plus grand rectangle entièrement transparent contenant le centre, avec retrait de sécurité : un échantillonnage initial de quelques axes ne suffisait pas à éviter tous les ornements de coin. `FramedArtwork` place l’œuvre entière en `object-fit: contain` dans cette fenêtre, puis le PNG décoratif au-dessus. Les marges des œuvres paysage sont intentionnelles. En erreur réseau ou absence de variante, le cadre simple conserve l’œuvre visible.

## Vérifications

- Dix-sept tests et compilation TypeScript/Vite réussis. Les tests couvrent chaque cadre et tous les pixels de sa fenêtre d’affichage (alpha inférieur à 24), les associations, le repli, les noms/taux inchangés et les contrastes de toutes les encres/badges dans les deux thèmes.
- Préparation répétée : empreintes des 25 originaux, des dérivés et du registre inchangées, métadonnées conservées.
- Huit combinaisons géométriques de collection : clair/sombre et 320/390/768/1440 px. Aucun débordement ; cadres au ratio 2:3, œuvres en `contain`, PNG 640×960 effectivement chargés.
- 23 audits Axe WCAG 2 A/AA sans violation détectée : collection, familles, cinq filtres de rareté, fiches et résultats. Pas une certification d’accessibilité.
- Les cinq filtres affichent des variantes dont les noms correspondent au matériau. Les cadres restent cachés avant le dévoilement : zéro cadre, puis un et trois selon les actions. Deux ouvertures réelles dans la session de test passent de 20 à 22 pochettes et ajoutent exactement six cartes.
- Erreur réseau volontaire sur le cadre lapis de La Joconde : repli correct, reproduction toujours visible ; après retrait du blocage et rechargement, PNG restauré. Le message réseau de cette simulation est attendu.
- Contrôle supplémentaire des œuvres non acquises : deux audits clair/sombre sans violation, cadre coloré préservé et seule la reproduction atténuée. Sauvegarde de la session de test restaurée après ce contrôle ; capture native `frames-missing-catalog-mobile-light.png`.
- Détecteur exécuté une fois : sept avis de nouvelles couleurs du système approuvé, aucun défaut non consultatif. Registre visuel mis à jour séparément.

## Relecture

Relecture indépendante des 21 captures demandées dans `output/playwright/frames-*.png` : **ship**, aucun correctif matériel. Typographie mobile, thèmes, fidélité aux cadres, repli et absence de fuite de rareté confirmés visuellement. Les dialogues sont volontairement défilants ; la capture de résultat sur téléphone ne montre que le haut du dialogue.

Les captures de familles emploient une sauvegarde de test isolée contenant les vingt œuvres afin de vérifier tous les niveaux. Cette fixture reste dans `output/playwright`, jamais dans le répertoire public ni dans l’état initial livré.

Documentation finale : `DESIGN.md` et `.impeccable/design.json` actualisés et vérifiés, cinq matières et vingt couleurs consignées, registre de cadres et procédure d’extension documentés. Les sept spécimens et les thèmes sont conservés.
