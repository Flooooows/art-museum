# Structurer le catalogue et ouvrir cinq cartes par pochette

Plan vivant : maintenir Progress, Surprises & Discoveries, Decision Log et Outcomes & Retrospective jusqu’à livraison.

## Purpose / Big Picture

L’utilisateur valide le démarrage par le modèle du catalogue et la sélection des premiers ensembles, avant le choix définitif de l’hébergement. Il demande cinq cartes par nouvelle pochette au lieu de trois. Le résultat doit réellement alimenter l’application depuis des données structurées et vérifiables, conserver les vingt identifiants acquis, permettre plusieurs catalogues pour une œuvre et ne jamais falsifier une validation culturelle ou de rareté.

## Progress

- [x] (2026-10-29 UTC+8) Examiner données, sauvegardes, tirages et interfaces ; repérer les constantes trois cartes et tailles de catalogues figées.
- [x] (2026-10-29) Modèle et source locale validés ; vingt fiches migrées, six ensembles / cent œuvres cibles proposés et audit éditorial exécutable.
- [x] (2026-10-29) Projection branchée, appartenances et totaux dynamiques ; cinq cartes par nouvelle pochette et lecture intacte des anciennes de trois.
- [x] (2026-10-29) 27 tests et build réussis ; fidélité champ par champ, parcours navigateur en dev et production locale, 40 géométries et 21 contrôles axe réussis. Guide catalogue, README, PRODUCT, DESIGN et sidecar mis à jour ; revue finale consignée.

## Surprises & Discoveries

Le stockage invité est version 1, sous muse-collection-v1 ; le parseur exige exactement trois cartes. Changer seulement le tirage casserait donc les sauvegardes suivantes. Les indices de révélation, textes, reprise, aperçu et ouverture rapide sont également figés à trois. La progression des catalogues suppose cinq œuvres par ensemble ; ce nombre n’a aucun rapport avec les cinq cartes demandées par pochette et doit devenir dynamique.

Les raretés actuelles sont des propositions de démonstration, pas des évaluations sourcées de notoriété. Les vingt fiches culturelles et notices existent ; leurs textes, images et identifiants peuvent être préservés. La fonction museumName déduit actuellement tout musée autre que le Louvre comme le Met : une vraie fiche doit référencer son musée explicitement.

Cinq originaux Japon ajoutés par l’utilisateur n’étaient pas exploitables par la préparation des cadres : quatre sans alpha, un sans ouverture suffisante. Ils restent intacts et sont explicitement signalés dans src/frame-assets.report.json ; les 25 cadres valides ne sont plus bloqués par ces ajouts. Les tests couvrent chaque original, actif ou signalé.

Le contrôle WCAG 2.1 a révélé des noms accessibles omettant le texte visible des contrôles de stock, choix thématiques et cartes. Le contenu visible sert désormais de nom, avec image de pochette répétée décorative ; nouveau passage axe réussi sans changer le graphisme.

## Decision Log

Décision : une source structurée JSON typée et validée, utilisée par le site, avant toute base hébergée ou compte. Raison : c’est l’étape explicitement approuvée ; ne pas provisionner un service ou prétendre qu’un backend existe. Auteur/date : assistant, 2026-10-29.

Décision : séparer œuvres, familles, musées, images/droits, catalogues, appartenances et évaluations de rareté versionnées. Les noms et métaux restent identiques, tout comme les taux provisoires par carte. Raison : identité d’une œuvre, composition d’un ensemble et fréquence d’un tirage sont trois décisions distinctes. Auteur/date : assistant, 2026-10-29.

Décision : conserver les fiches existantes au statut démonstration et les raretés au statut provisoire ; critères, confiance et dates de validation non renseignés restent explicitement inconnus. Raison : ne pas inventer une revue éditoriale ou des preuves de notoriété. Auteur/date : assistant, 2026-10-29.

Décision : nouvelles ouvertures de cinq cartes ; lecture des anciens tirages de trois sans compléter artificiellement les inventaires. Résultat enregistré et indices de révélation pilotent leur propre affichage. Raison : préserver intégralement les acquisitions existantes. Auteur/date : assistant, 2026-10-29.

Décision : une référence rarityAssessmentId sélectionne explicitement l’évaluation active ; latestAssessment ne publie pas un nouveau brouillon. Raison : préserver le niveau d’une carte jusqu’à décision éditoriale explicite. Auteur/date : assistant, 2026-10-29.

Décision : Taouret rejoint aussi l’Égypte tout en gardant son catalogue principal Mythes et son cadre ; Hokusai reste en réserve hors des six nouveaux ensembles proposés, sans reclassement artificiel. Raison : démontrer l’appartenance multiple sans doublon et respecter la nature des œuvres. Auteur/date : assistant, 2026-10-29.

## Outcomes & Retrospective

Livré et vérifié localement. Le site lit réellement src/catalog/seed.json ; vingt œuvres, quatre catalogues de démonstration et vingt et une appartenances. Les anciennes données culturelles sont identiques champ par champ à la capture pré-migration. Le modèle bloque les publications incomplètes et les changements implicites de rareté. Les nouvelles pochettes donnent cinq cartes, et les anciens tirages restent trois dans le navigateur comme à l’import.

Validation : 27 tests réussis, build réussi, audit normal valide, audit strict volontairement en échec pour les vingt revues incomplètes. Sur le build servi localement : ouvertures, révélations, reprise, rechargement, export/import et compatibilité ancienne confirmés ; quarante géométries sans débordement, vingt et un audits axe sans violation. Revue de l’agent principal dans .impeccable/review/catalogue-cinq-cartes.md ; pas de relecture indépendante prétendue.

La préparation des nouveaux cadres a nécessité une adaptation bornée au signalement des originaux non exploitables. Aucun original supprimé ou écrasé. Le périmètre ne comprend ni hébergement PostgreSQL/Supabase, ni connexion, ni importation non contrôlée de cent œuvres, ni marché opérationnel. Les six ensembles restent à sélectionner et à valider ; aucune publication ou livraison distante effectuée.

## Context and Orientation

Projet React/TypeScript/Vite, /home/ubuntu/art-booster. src/catalog/seed.json contient les vingt fiches et leurs tables liées ; src/catalog/model.ts valide le modèle et la publication, repository.ts expose la source, src/data.ts en fait la projection pour l’interface et conserve la palette des raretés. src/collection.ts tire et valide les sauvegardes ; src/App.tsx orchestre ouverture/révélation. Home, Opening, Profile et components affichent le nombre de cartes ; Collection calcule les progrès et filtres. Les cadres proviennent de src/frames.ts et FramedArtwork, et utilisent le catalogue principal. Tous les identifiants restent stables pour la sauvegarde version 1.

## Plan of Work

Premier jalon : créer src/catalog/model.ts, seed.json et un module de lecture/validation. Migrer les vingt fiches depuis l’existant, avec liens et droits hérités explicitement à revoir, musées explicites et aucune note de notoriété inventée. Une œuvre porte un identifiant stable ; les appartenances sont des paires œuvre/catalogue. Les évaluations portent niveau, version, critères proposés 40/25/20/15, sources, justification, confiance et statut. Un audit liste les blocages de publication. Créer catalog/initial-collections.json et catalog/README.md : six propositions totalisant cent œuvres cibles, distinctes des ensembles effectivement publiés.

Deuxième jalon : src/data.ts devient une projection de compatibilité pour l’interface, en gardant tous les identifiants et valeurs héritées. Ajouter les identifiants de catalogues d’une œuvre et les helpers d’appartenance, taille et musée. Les tirages, filtres et progrès exploitent les appartenances au lieu d’une égalité sur le seul catalogue principal. Définir CARDS_PER_PACK dans un module de règles, avec les poids provisoires séparés des évaluations.

Troisième jalon : générer cinq cartes, accepter au parseur les résultats historiques de trois et nouveaux de cinq, valider les indices selon la taille enregistrée et centraliser la révélation dans une fonction pure. Adapter tous les textes et comptes, dont les miniatures récentes. Garder trois colonnes de cartes lisibles sur bureau (donc deux rangées pour cinq) et une sur téléphone, sans miniaturisation en cinq colonnes.

Quatrième jalon : tests négatifs de données, publications non validées, doublons d’appartenance, multi-catalogues et identifiants ; tests cinq cartes et sauvegardes anciennes, révélation sans nouveau tirage et probabilités inchangées. Vérifier les vraies interactions dans le navigateur et documenter exactement la distinction entre source locale structurée et base hébergée future.

## Concrete Steps

Depuis /home/ubuntu/art-booster : npm test, npm run catalog:check, npm run build. L’audit doit confirmer vingt œuvres et quatre catalogues de démonstration, cent œuvres cibles seulement planifiées, et afficher honnêtement les évaluations non validées. Utiliser npm run dev -- --host 0.0.0.0 et npm run preview -- --port 4173 si les serveurs ont été arrêtés par le redémarrage. Captures dans output/playwright, rapport dans .impeccable/review.

## Validation and Acceptance

Choisir une pochette puis ouvrir ajoute exactement cinq cartes, consomme un seul stock et affiche cinq dos/cadres. Révéler tout ou en mode rapide montre les cinq sans nouveau tirage. Fermer/reprendre et exporter/importer conservent exactement ces cartes. Une ancienne sauvegarde de trois cartes garde son résultat de trois, peut le révéler et ouvrir ensuite une nouvelle pochette de cinq. Toute longueur autre que trois/cinq et tout indice hors limites est rejeté. Les vingt identifiants initiaux restent connus.

Le modèle empêche les références inexistantes et œuvres dupliquées, accepte une œuvre dans plusieurs catalogues et maintient un inventaire global unique. Une fiche publiée sans rareté validée ni droits vérifiés échoue à la validation. Les six futurs ensembles restent des propositions hors des tirages ; les compteurs proviennent des appartenances effectives. La grille reste lisible en clair et sombre à 320, 390, 768 et 1440 px.

## Idempotence and Recovery

Aucune suppression de stockage ni service externe provisionné. Migration du contenu copiée depuis la source existante, originaux d’images et cadres intacts. Les données éditoriales futures sont modifiables indépendamment du JSX ; l’audit est en lecture seule. La compatibilité des anciens identifiants et des tirages évite une migration destructive.

## Artifacts and Notes

La publication culturelle réelle nécessite encore vérification des sources, des droits et des évaluations. Le plan de cent œuvres n’équivaut pas à cent fiches importées ou validées. L’installation et les tirages serveur seront une étape ultérieure explicitement choisie.

## Interfaces and Dependencies

Pas de dépendance ajoutée. Modèle TypeScript et validateurs purs ; projection data.ts conservée pour React. CARDS_PER_PACK=5 ; parseState conserve version 1 et accepte trois/cinq résultats. revealCards(state,index?) ne change ni stock ni inventaire. L’audit tsx utilise la même validation que les tests et le site.

Révision initiale : modèle d’abord et cinq cartes sont autorisés ; l’hébergement reste hors du périmètre actuel.

Révision de clôture (2026-10-29) : étapes terminées, références actives explicites, cadres Japon signalés, preuves navigateur et documentation ajoutées. Le script ponctuel de migration a été retiré pour éviter d’écraser ultérieurement les données éditoriales ; la capture avant migration est conservée comme preuve.

Suite demandée le 2026-10-29 : seuils de rareté remplacés par [0,30[, [30,50[, [50,70[, [70,90[, [90,100]. Conversion centralisée dans rarityLevelForScore et utilisée par la validation ; tests des limites et valeurs invalides ajoutés. 28 tests et build réussis. Concept et guide mis à jour, sans modifier les niveaux provisoires existants, les poids de tirage ou les sauvegardes. La question sur l’import de cent œuvres porte sur sa faisabilité : aucun import supplémentaire lancé à ce stade.
