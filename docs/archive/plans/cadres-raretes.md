# Intégrer les cadres de collection et les cinq matières de rareté

Plan vivant à maintenir dans Progress, Surprises & Discoveries, Decision Log et Outcomes & Retrospective.

## Purpose / Big Picture

Les œuvres révélées et collectionnées doivent porter les cadres fournis dans public/assets/collections, choisis selon la famille et le niveau de rareté. L’ordre visuel est fer, cuivre, argent, or, lapis-lazuli, du niveau courant au plus rare. Les reproductions restent entières et non recolorées, les textes lisibles, les tirages et sauvegardes inchangés. Les prochaines familles doivent pouvoir ajouter leurs images sans modifier les composants.

## Progress

- [x] (2026-10-29 10:26 UTC+8) Repérer les 25 PNG utilisateur : cinq familles et cinq variantes, tous 1024×1536 avec transparence centrale.
- [x] (2026-10-29 10:27 UTC+8) Confirmation utilisateur : garder les noms des raretés, changer seulement matières et couleurs.
- [x] (2026-10-29 10:38 UTC+8) Registre extensible et 25 PNG réduits, originaux intacts ; préparation répétable vérifiée, taille réduite de 66 %.
- [x] (2026-10-29 10:38 UTC+8) Rendu partagé révélation/collection/musée/fiche ; badges, filtres et probabilités cohérents.
- [x] (2026-10-29 10:38 UTC+8) Dix-sept tests et compilation réussis ; 23 audits navigateur sans violation, deux thèmes/quatre largeurs, repli sur erreur, absence de fuite de rareté et comptabilité des tirages vérifiés.
- [x] (2026-10-29 10:40 UTC+8) Relecture indépendante des 21 captures : ship, aucun correctif matériel.
- [x] (2026-10-29 10:45 UTC+8) DESIGN.md et sidecar reçus et vérifiés : cinq matières, vingt couleurs, cadres, repli, ajout de familles et sept spécimens conservés. Aucun jalon restant.

## Surprises & Discoveries

Les aperçus des images semblent montrer un fond sombre, mais leurs pixels centraux ont un alpha nul : ce sont bien des cadres transparents. Chaque original pèse environ 1,5 à 2,4 Mo ; les conserver intacts tout en générant des PNG réduits évite de charger plusieurs originaux pour chaque grille. Les ouvertures centrales ne sont pas identiques selon la famille, d’où une mesure d’ouverture par image plutôt qu’un placement approximatif unique.

Des mesures limitées à quelques axes laissaient certains ornements de coin empiéter légèrement sur la fenêtre. Le générateur calcule maintenant le plus grand rectangle entièrement transparent contenant le centre, avec un retrait de sécurité. Un test parcourt tous les pixels des 25 fenêtres d’affichage et confirme qu’aucun ornement opaque ne recouvre la reproduction.

## Decision Log

Décision : conserver les noms Esquisse, Étude, Composition, Œuvre, Pièce maîtresse et leurs probabilités, changer leurs matières/couleurs dans l’ordre demandé. Raison : la demande concerne les couleurs, pas le classement éditorial ni les tirages. Auteur/date : assistant, 2026-10-29.

Décision : beaux-arts pour le catalogue beaux-arts, egypte pour l’Égypte, art-mysterieux pour Mythes ; cadre sobre de repli pour Arts décoratifs, sans emprunter à tort une autre famille. Art moderne et Préhistoire sont préparés mais ne créent pas de collections ni d’œuvres fictives. Ajouter une famille signifie déclarer son identifiant et déposer les PNG nommés famille-matière.png. Auteur/date : assistant, 2026-10-29.

Décision : utiliser Sharp, déjà installé, pour mesurer la transparence et réduire les PNG à 640×960 ; aucun original modifié, aucune nouvelle dépendance, aucune conversion en JPEG opaque. Auteur/date : assistant, 2026-10-29.

## Outcomes & Retrospective

Les cadres utilisateur sont intégrés aux trois familles correspondantes existantes, avec repli pour Arts décoratifs et séries Art moderne/Préhistoire indexées pour l’avenir. Les cinq matières, encres et badges sont cohérents, noms et taux inchangés. Les originaux restent intacts ; les 25 dérivés pèsent 17,15 Mio contre 50,55 Mio d’originaux et portent leur provenance. Registre et dérivés inchangés lors d’une seconde préparation. Dix-sept tests et compilation passent ; le navigateur confirme le ratio, les reproductions entières, les filtres de rareté, le musée, les fiches, les cartes cachées sans indication de rareté, l’erreur réseau avec repli et deux ouvertures comptabilisées exactement. Relecture indépendante : ship sur 21 captures, aucun correctif demandé. DESIGN.md et son sidecar sont actualisés et vérifiés, documentation d’extension dans README. Aucun jalon restant.

## Context and Orientation

Projet React/TypeScript/Vite dans /home/ubuntu/art-booster. `src/data.ts` déclare œuvres, catalogues et raretés ; `src/components.tsx` rend badges, probabilités, cartes et fiches. `src/Opening.tsx` rend la révélation dans le dialogue intégré de Pochettes. `src/Collection.tsx` gère l’inventaire et son musée. Les styles se chargent dans main.tsx : styles.css, appearance.css, navigation.css. Ajouter un composant partagé FramedArtwork et un module frames.ts pour choisir une image décorative et sa fenêtre intérieure, sans recadrer l’œuvre.

## Plan of Work

Premier jalon : script `scripts/prepare-frames.mjs` scannant les PNG racine de public/assets/collections, produisant des versions réduites dans un sous-dossier réservé et un registre JSON dans src. Il mesure la fenêtre centrale via alpha et conserve les originaux et leurs noms. Le script est répétable et réutilise les sorties inchangées. Les commandes dev/build le préparent ; une commande dédiée permet d’intégrer de nouveaux fichiers.

Deuxième jalon : un choix de cadre associe le catalogue à une famille de cadre et la rareté à un suffixe fer/cuivre/argent/dore/lapis-lazuli. Le rendu superpose le cadre transparent à un passe-partout contenant la reproduction entière en object-fit:contain, avec des dimensions intérieures provenant du registre. En l’absence de variante ou en cas d’image indisponible, afficher un cadre simple de la matière correcte, sans icône cassée. Utiliser ce rendu dans la révélation, les cartes de collection et la fiche. Les œuvres manquantes restent identifiées et atténuées, sans désaturer le cadre.

Troisième jalon : changer la palette dans data.ts et utiliser des encres adaptées aux thèmes pour les badges et textes. Les barres de probabilités et points des filtres suivent les mêmes matières ; les noms et taux restent identiques. Tester chaque combinaison disponible et le repli, puis la grille, les révélations, la fiche, les deux thèmes et les téléphones. Documenter les originaux et dérivés sans inventer une licence.

## Concrete Steps

Depuis /home/ubuntu/art-booster : `npm run prepare:frames`, `npm test`, `npm run build`. Développement `npm run dev -- --host 0.0.0.0` et prévisualisation compilée sur 4173. Attendre un registre de 25 cadres au démarrage, tous les tests réussis et compilation sans erreur. Les captures de contrôle vont dans output/playwright.

## Validation and Acceptance

Les cadres de Beaux-Arts, Égypte et Mythes changent avec les cinq raretés ; Arts décoratifs a un repli convenable et ne charge pas de cadre historique incorrect. Tous les originaux restent intacts. Une future famille ajoutée avec ses fichiers peut rejoindre le registre sans réécriture du rendu. Une image de cadre manquante passe au repli sans masquer l’œuvre. Les œuvres paysage ne sont ni étirées ni coupées. Au dévoilement, pas de cadre visible annonçant la rareté avant de révéler ; après, cadre et badge concordent. Les noms, taux, collections possédées et format de sauvegarde restent inchangés. Vérifier clair/sombre, clavier et largeurs 320/390/768/1440, sans débordement, puis les contrastes des cinq badges.

## Idempotence and Recovery

Ne jamais modifier les originaux ni les sauvegardes. Les sorties dérivées et le registre peuvent être régénérés ; les PNG inconnus ou mal nommés ne deviennent pas une fausse famille. Les erreurs de génération doivent être explicites, sans destruction de fichiers. Les erreurs d’affichage retombent sur le cadre simple.

## Artifacts and Notes

Les 25 originaux sont fournis par l’utilisateur, sans licence précisée. Leur provenance et celle des réductions doivent être documentées ; aucune reproduction historique n’est créée ou modifiée.

## Interfaces and Dependencies

Ajouter `FramedArtwork({ art, missing?, eager? })`, `getFrame(art)` et un registre de familles optionnel sur Catalog. Réutiliser React, CSS, Sharp et les tests node/tsx déjà présents. Aucun service, compte, échange ou nouvelle monnaie ajouté.

Révision initiale : les PNG transparents réels déterminent la composition ; pas de substitution par une approximation CSS quand le cadre fourni existe.

Révision de validation : calcul de la fenêtre renforcé contre les ornements de coin, tests complets de transparence et de contraste, scans de provenance à zéro élément manquant, contrôle des sorties en cache et captures finales réalisés.

Révision finale : relecture ship, documentation vérifiée et dix-sept tests repassés après intégration des métadonnées. Contrôle supplémentaire des œuvres manquantes clair/sombre sans violation ; sauvegarde de la session de test restaurée. Livraison complète.
