# Implémenter Rarity Engine V2 sans migration

## Purpose / Big Picture

L’utilisateur demande un moteur indépendant proposant une rareté crédible même avec des données manquantes, et non cent notes présentées comme mesurées. La commande de simulation produira cent propositions, avec sources, critères observés/dérivés/estimés, bornes d’incertitude, confiance, statut et comparaison aux niveaux actifs. Les poids de cette demande (P/A/H/M/C = 25/20/25/20/10) remplacent ceux du précédent essai pour ce nouveau moteur seulement. Seuils 40/60/75/90 et noms MUSE conservés. Aucune activation, modification de prix, tirage, carte acquise ou donnée de production.

## Progress

- [x] (2026-10-30 UTC+8) Auditer le modèle actif, l’essai exploratoire, les collecteurs, les cent notices et les preuves ; présenter les quatre modules à l’utilisateur.
- [x] (2026-10-30 UTC+8) Figer les empreintes protégées et définir configuration/types/provenance.
- [x] (2026-10-30 UTC+8) Implémenter les sept connecteurs avec cache, authentification, limites et identité stricte ; réutiliser 99 captures institutionnelles et vérifier 17/17 correspondances Wikipédia.
- [x] (2026-10-30 UTC+8) Implémenter normalisation, indices, comparables non imputés, estimations, intervalles et confiance ; séparer les références d’œuvres et d’auteurs.
- [x] (2026-10-30 UTC+8) Implémenter calibration, validation, rapports versionnés, archive des sources et commandes.
- [x] (2026-10-30 UTC+8) Exécuter sur les cent œuvres : 100 propositions provisoires, 47 changements, 87 niveaux stables ; 67 tests passent, contrôles TypeScript stricts et build réussissent.
- [x] (2026-10-30 UTC+8) Vérifier deux calculs identiques (02b68c195210ea3536d84c1a), les empreintes des preuves/sorties et les entrées protégées ; terminer guide et inventaire `catalog/rarity-v2/FILES.md`.
- [x] (2026-10-30 UTC+8) Publier les 1099 fichiers du projet complet sur `https://github.com/Flooooows/art-museum.git`, branche `main`, premier commit `34e40e0`, sans forcer ni écraser d’historique.
- [x] (2026-10-30 UTC+8) Vérifier une copie propre du commit : `npm ci`, 67 tests, build, contrôles TypeScript stricts et même exécution V2 reproductible ; 27 liens locaux de documentation valides.

## Surprises & Discoveries

`src/catalog/model.ts` valide les anciennes évaluations actives, sans scores. `src/catalog/notoriety.ts` et `scripts/report-notoriety.ts` sont le précédent essai distinct, à conserver sans modification. `catalog/notoriety/observations.json` lie les cent œuvres à 97 identités Wikidata, neuf audiences complètes d’objet, deux partielles et des audiences de créateurs. Les notices Cleveland contiennent 75 bibliographies, des expositions, des mises en avant et descriptions ; les notices Met exposent moins de bibliographie structurée. Il faut traiter cette différence de couverture comme une inconnue, pas une infériorité des objets du Met. Une seule notice Cleveland expose artlens_description ; une notice curatoriale ordinaire ne prouve pas une diffusion culturelle indépendante.

Découverte complémentaire : « fabrication » au milieu d’un crédit peut accompagner un créateur identifié (Carlo Bugatti) ; les règles ne doivent pas le transformer en anonyme. Les tests couvrent cette régression, l’absence d’imputation en chaîne et une icône anonyme pouvant atteindre Pièce maîtresse sans recevoir A=100. Faute de preuves comparatives, les modes initiaux ont été rendus neutres entre genres. Le build signale cinq anciens cadres japonais non conformes et les laisse inactifs ; ce comportement préexistant n’empêche pas les 30 cadres valides ni la compilation.

## Decision Log

Décision : ajouter `src/rarity-engine` pour le domaine pur et `scripts/rarity-v2` pour les entrées/sorties, sans importer le moteur dans React. Réutiliser les types WorkRecord/CatalogDataset et les captures existantes ; conserver les scripts et rapports antérieurs. Auteur/date : assistant, 2026-10-30.

Décision : faute de référentiel externe représentatif, la configuration porte une courbe logarithmique à points de contrôle provisoires et la possibilité de percentiles globaux/par catégorie sur un futur référentiel validé, figé et sans chevauchement avec les cibles. Les cent cibles ne deviennent pas un catalogue de normalisation. Des comparables locaux sont admissibles pour estimer des critères, explicitement marqués, avec exclusion de soi, taille minimale et sans réutiliser des valeurs déjà imputées. Auteur/date : assistant, 2026-10-30.

Décision : séparer mesures brutes et proxies. H ne mesure pas automatiquement l’influence par un compteur de citations ; un indice documentaire dérivé reçoit une large incertitude et une méthode explicite. M combine collection, mise en avant, publications et événements dédupliqués. C ne découle pas d’un nombre de liens. Les jugements éditoriaux antérieurs restent estimés et non validés. Auteur/date : assistant, 2026-10-30.

Décision : les estimations utilisent des comparables de même catégorie/période ou des distributions éditoriales initiales configurées et justifiées, jamais un 50 silencieux. Pour les anonymes, le contexte exact (culture, atelier, médium, période) soutient une estimation limitée, sans recopier la célébrité d’une civilisation. Les résultats peuvent tous rester provisoires si l’évidence le justifie ; aucun quota de confirmations. Auteur/date : assistant, 2026-10-30.

Décision : publier le projet complet vers `https://github.com/Flooooows/art-museum.git`, à la demande ultérieure de l’utilisateur. Vérifier les références distantes et ne jamais forcer ; conserver les cinq sources PNG de cadres, exclure dépendances, compilation, captures et secrets. Contrôle avant commit : 1099 fichiers, environ 217 Mo bruts, aucun fichier supérieur à 10 Mo et aucune correspondance aux motifs de secrets contrôlés. Le distant est public et vide ; le compte authentifié correspond au propriétaire. Auteur/date : assistant, 2026-10-30.

## Outcomes & Retrospective

Le moteur 2.0.0 et la politique 2.0.0-draft.1 produisent 100 propositions identifiables, sans refus sur ce lot déjà documenté. Exécution retenue : `02b68c195210ea3536d84c1a`. Distribution proposée : 16 Esquisse, 62 Étude, 18 Composition, 2 Œuvre, 2 Pièce maîtresse, contre 43/39/14/3/1 actifs. Il y a 47 changements proposés et 87 classements stables dans les variantes. Aucun changement n’est activé.

Les 100 statuts restent provisional, sans confirmations artificielles. Confiance moyenne 61,2 %, dont 14 faibles (<50 %), 82 intermédiaires et 4 élevées (≥75 %). Couverture dérivée/estimée : P 9/91, A 43/57, H 75/25, M 80/20, C 1/99. Les notes normalisées ne sont pas étiquetées observées ; les compteurs sources restent dans les preuves. La Joconde (98,73) et La Grande Vague (95,06) sont candidates Pièce maîtresse à relire. Les bornes sont des plages de plausibilité conditionnelles et la confiance un indice heuristique, non des garanties statistiques.

Les sept connecteurs existent ; Met/Cleveland/Wikidata/Pageviews et la vérification Wikipédia ont réellement contribué. Smithsonian et Europeana sont testés avec fixtures mais sans données réelles exploitées faute de clés/identifiants liés ; Google Trends n’est pas intégré. Normalisation et distributions initiales restent provisoires, H souvent documentaire et C principalement estimé. Le résultat utile est une proposition auditable, pas une preuve de justesse artistique : un référentiel indépendant représentatif, davantage de preuves culturelles et une revue humaine restent nécessaires avant toute migration.

Les 27 nouveaux tests V2 portent le total à 67 tests réussis. Les contrôles TypeScript stricts des scripts et du domaine ainsi que `npm run build` passent ; les 100 images passent le contrôle de droits existant. `npm run rarity:v2:verify` confirme le même identifiant et les mêmes octets sur deux calculs hors réseau, puis vérifie les preuves et les entrées protégées. Guide et inventaire précis : `catalog/rarity-v2/README.md` et `catalog/rarity-v2/FILES.md`.

Publication effectuée sur `main` avec le commit initial `34e40e08104886d25ceb26110fb470c3e32dfc3a`, sans push forcé. Une copie propre de ce commit, avec installation depuis `package-lock.json`, reproduit les 67 tests, le build, les contrôles stricts et exactement l’exécution `02b68c195210ea3536d84c1a`. Les dépendances et sorties temporaires sont exclues ; les cinq sources de cadres sont incluses. Aucun déploiement, aucune migration et aucune activation de rareté n’ont été effectués.

## Context and Orientation

Projet React/Vite/TypeScript dans `/home/ubuntu/art-booster`, sans dépôt git. Le catalogue actif est `src/catalog/seed.json`, les distributions sont `src/packRules.ts`, les acquisitions et sauvegardes sont gérées par `src/collection.ts`. La marketplace est préparatoire dans `src/Market.tsx`. Les anciennes raretés ne doivent pas être activées par le nouveau moteur. Les anciennes observations sont dans `catalog/notoriety`, les notices muséales intégrales dans `catalog/evidence`. Les connecteurs HTTP seront exécutés avec Node/tsx existants, sans serveur ni dépendance supplémentaire. Les secrets Smithsonian/Europeana restent des variables d’environnement ; leur absence est un état déclaré, pas un faux succès.

## Plan of Work

Premier jalon : écrire une configuration JSON versionnée dans `catalog/rarity-v2`, les types de critères et résultats et un manifeste d’empreintes protégées capturé avant les modifications. Écrire un client HTTP injectable pour tests, cache de JSON avec empreinte, délai par fournisseur, Retry-After, gestion des réponses invalides et aucune clé enregistrée dans les URL publiques. Ajouter connecteurs Met/Cleveland/Wikidata/Pageviews/Wikipédia et connecteurs authentifiés Smithsonian/Europeana. Les résultats de recherche ne valent jamais identité vérifiée ; seuls les identifiants explicites ou un rapprochement titre+auteur+période+institution non ambigu peuvent être retenus.

Deuxième jalon : transformer les captures existantes en observations typées, avec catégorie/médium/période et sources liées aux bons objets. Calculer d’abord les signaux directs, puis estimer les absences sans cycle. Toute estimation expose méthode, référence de configuration ou comparables et bornes. Les poids restent identiques, aucune renormalisation sur la couverture. L’intervalle final combine les bornes pondérées sans hypothèse d’indépendance. La confiance explique couverture, qualité, identité, fraction observée, dispersion et cohérence, avec plafonds pour les faibles données.

Troisième jalon : comparer variantes de pondérations et normalisation, détecter les bascules et seuils traversés ; statut confirmed seulement si les critères configurés de confiance, stabilité et couverture sont satisfaits. Signaler toutes les candidatures Pièce maîtresse pour revue humaine. Écrire les résultats dans un sous-dossier nommé par empreinte d’entrée/configuration/implémentation, plus des copies latest non productives. Les anciens rapports et le catalogue actif sont protégés par empreinte avant et après chaque commande.

Quatrième jalon : produire JSON, CSV, rapport complet avec cent lignes, résultats des cas demandés, comparaisons V1/ancien essai/V2, connecteurs réellement utilisés ou indisponibles et liste des fichiers. Tester formules, erreurs API, secrets, homonymes, séries, manque d’auteurs, petits groupes de comparables, stabilité, configuration et reproductibilité. Exécuter tests et compilation, puis actualiser les documents opérants sans réécrire la référence fournie ni les rapports historiques.

## Concrete Steps

Depuis `/home/ubuntu/art-booster`, les commandes prévues sont `npm run rarity:v2:collect` (cache et collecte autorisée), `npm run rarity:v2` (simulation hors réseau), `npm run rarity:v2:verify` (vérification de reproductibilité et d’intégrité), `npm test`, `npm run build`. Le compte rendu doit indiquer cent objets identifiables proposés, les résultats refusés si identité insuffisante et les confirmations réelles sans les inventer.

## Validation and Acceptance

Les cent identifiants restent uniques et identiques au catalogue. Chaque proposition a cinq critères traçables, une note 0–100, une confiance 0–1, un statut, des bornes et raisons de revue. Les données estimées ne sont pas étiquetées observées. Une œuvre sans page ou auteur n’a pas automatiquement zéro. Les emprunts de série sont refusés hors correspondance d’estampe explicitement revue. Aucune nouvelle rareté n’est activée. Deux simulations des mêmes captures/configuration/code produisent les mêmes octets et identifiant d’exécution. Les empreintes du catalogue, de la collection, des règles de pochettes, du marché et de l’ancien essai restent identiques. Les connecteurs non authentifiés sont signalés non utilisés ; aucune requête ne dépend d’un service privé prétendu actif.

## Idempotence and Recovery

Toutes les sorties se limitent à `catalog/rarity-v2`. Aucun script de migration n’est fourni. Les caches réussis sont réutilisés ; les erreurs sont différenciées de données nulles. Les fichiers d’exécution figés ne sont jamais écrasés si leur contenu diffère. Le rapport latest peut être reconstruit à partir d’une exécution figée. La collecte réseau est optionnelle ; calcul et vérification fonctionnent entièrement hors réseau avec les captures retenues.

## Artifacts and Notes

L’ancien essai produit 4 scores complets et 96 inconnus avec poids 30/25/20/15/10 ; ce résultat reste une référence historique, distincte de l’algorithme 2.0.0 demandé ici. Aucun changement d’UI ou de dessin des cadres n’est requis. Les droits des cent images ne sont pas réévalués ni modifiés.

## Interfaces and Dependencies

Types et domaine purs TypeScript ; Node fs/crypto/fetch et tsx pour les outils. Entrée minimale : id, titre, date/période, institution, identifiants et auteur ou contexte ; sortie `RarityResult` avec algorithmVersion/configurationVersion, score, critères, confiance et statut. La configuration définit poids, seuils, courbes, références optionnelles, paramètres de comparables, distributions initiales et validation. La validation runtime refuse paramètres incohérents et percentiles sur un lot non représentatif.

Révision initiale : plan fondé sur l’audit, reprise des captures et protection explicite des trois générations de résultats.

Révision de livraison (2026-10-30 UTC+8) : jalons clos avec résultats et preuves effectifs ; ajout de l’inventaire et des limites résiduelles. Publication Git ajoutée à la demande ultérieure de l’utilisateur vers `https://github.com/Flooooows/art-museum.git` : vérifier les références, conserver les sources PNG nécessaires et exclure les sorties temporaires/secrets, sans jamais forcer le push. Le projet était initialement sans dépôt Git ; le distant ne présentait aucune référence lors des inspections et le compte authentifié correspond au propriétaire.

Révision finale de publication (2026-10-30 UTC+8) : push initial réussi ; ajout du commit publié et de la validation indépendante depuis une copie propre, pour clore le plan avec des preuves de livraison plutôt qu’une intention de publication.
