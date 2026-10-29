# Calculer la notoriété des cent œuvres selon le document MUSE

## Purpose / Big Picture

L’utilisateur demande de lire `MUSE_systeme_rarete.md`, actualiser la documentation et repasser les cent œuvres pour voir les calculs. Livrer une analyse reproductible et un tableau comparatif, sans transformer des données manquantes en notes nulles ou changer silencieusement les cartes acquises. La nouvelle proposition utilise P/A/H/M/C pondérés 30/25/20/15/10, chaque entrée sur 100, et les seuils 40/60/75/90. Les noms restent Esquisse, Étude, Composition, Œuvre et Pièce maîtresse. La production garde ses évaluations historiques tant qu’une activation n’est pas demandée.

## Progress

- [x] (2026-10-30 UTC+8) Lire la référence, le modèle, les cent identités et les anciennes évaluations sans scores ; vérifier que les API Wikipédia, Wikidata et Pageviews sont accessibles.
- [x] (2026-10-30 UTC+8) Collecter les cent objets : 97 identités Wikidata liées aux notices, 11 avec lien Wikipédia fr/en, 9 audiences d’œuvre comparables et 43 critères A calculables. Deux pages n’ont pas les douze mois complets ; elles restent inconnues.
- [x] (2026-10-30 UTC+8) Implémenter formule, bornes et seuils de simulation ; sept nouveaux tests passent, quarante tests au total sur le premier instantané.
- [x] (2026-10-30 UTC+8) Produire les rapports des cent lignes JSON/CSV/Markdown et actualiser la documentation : 4 scores exploratoires complets, 96 incomplets ; sensibilité visible, aucune répartition globale inventée.
- [x] (2026-10-30 UTC+8) Vérifier 40 tests, compilation, contrôle TypeScript du script, reproductibilité SHA-256 de deux calculs et absence de modification du catalogue actif.

## Surprises & Discoveries

Les cent raretés actives sont des propositions sans score ni source de notoriété. Leur répartition est 43/39/14/3/1. Le nouveau document est lui-même une proposition et ses exemples sont fictifs. Il ne définit ni normalisation des audiences ni protocole de notation H/M/C. Les notices Cleveland conservées fournissent des liens Wikidata spécifiques à l’objet ; ces identifiants évitent de confondre une œuvre précise et une série connue.

La collecte rapide a reçu des HTTP 429. Les réponses réussies sont conservées et réutilisées ; la cadence a été portée à une requête toutes les six secondes, avec respect de Retry-After et arrêt des requêtes au fournisseur limité pour cette exécution. Une limite HTTP ne devient pas une absence de page ou une note zéro. Des liens spécifiques existent dans les notices pour 97 objets ; avoir une entrée Wikidata n’implique pas avoir un article Wikipédia. La Grande Vague du Met Q28912605 est un exemplaire de la composition Q252485, exception explicitement documentée au transfert d’audience interdit depuis une série.

## Decision Log

Décision : ajouter un moteur et un rapport de simulation séparés, sans modifier `src/catalog/seed.json`, `src/packRules.ts` ou le validateur historique. Motif : la demande vise à voir les résultats, la référence n’ordonne pas de migrer les acquisitions ni d’adopter d’autres noms. Date/auteur : 2026-10-30, assistant.

Décision : collecter les consultations humaines fr/en sur douze mois complets identiques, du 2025-10-01 au 2026-09-30. Une page de série ou de civilisation ne remplace jamais celle d’un objet ou d’un artiste inconnu. Google Trends sans export homogène est absent, pas zéro. Les critères sans preuve gardent une valeur null, avec intervalle possible du total, sans renormalisation. Motif : précautions explicites du document utilisateur et absence de fausse précision. Date/auteur : 2026-10-30, assistant.

Décision : normaliser les audiences par min(100,100×ln(1+vues/jour)/ln(1001)) et montrer la sensibilité aux ancres 100 et 10000. Ce choix est une convention de simulation, pas une définition fournie par l’utilisateur ni un percentile recalibré pour obtenir une répartition souhaitée. P est explicitement un proxy Wikimedia seul tant que Trends manque ; A est la moyenne des notes des auteurs identifiés, inconnue si l’identité ou une audience manque. Date/auteur : 2026-10-30, assistant.

Décision : M=50 constate uniquement collection majeure et notice spécifique pour les cent objets ; les notes supérieures, H et C exigent des raisons et sources par critère dans editorial-review.json. Cinq objets ont une revue ciblée ; les autres H/C restent inconnus et ne sont pas inventés pour produire cent totaux. Les publications et médiations publiques entrent dans C au sens large du nouveau document, distinct de l’ancienne culture populaire. Date/auteur : 2026-10-30, assistant.

## Outcomes & Retrospective

Le rapport `catalog/notoriety/REPORT.md` examine les cent identifiants et distingue explicitement les quatre scores complets de simulation des 96 incomplets. Couverture P/A/H/M/C : 9/43/5/100/5. Avec l’ancre exploratoire 1000 vues/jour, Parade de cirque donne 75,13 (Œuvre), La Mort de Socrate 86,93 (Œuvre), La Grande Vague et La Joconde 100 (Pièce maîtresse). Ces notes ne sont pas validées et 100 signifie saturation, pas reconnaissance universelle mesurée.

La sensibilité révèle que La Grande Vague passe à 89,90 avec l’ancre 10000 vues/jour, et que David/Seurat changent aussi de niveau : la calibration doit être relue avant toute activation. La Joconde reste dans le niveau supérieur dans les trois variantes. Aucun quota n’est forcé et l’ancienne distribution 43/39/14/3/1 demeure active. Les auteurs anonymes, les deux historiques d’audience incomplets, les objets sans page et les H/C non évalués empêchent un classement final des cent œuvres : ce sont des travaux éditoriaux restant explicitement ouverts, pas des données imputées.

Documentation alignée sur la nouvelle proposition, référence fournie intacte. Les 40 tests et le build réussissent, les cent images conservent leur audit et les scripts produisent des résultats identiques sans réseau. `catalog/notoriety/validation.json` conserve la preuve de reproductibilité. La portée livrée est une simulation documentée et honnête, pas cent évaluations éditoriales validées.

## Context and Orientation

Application React/TypeScript dans `/home/ubuntu/art-booster`. `src/catalog/seed.json` contient cent œuvres et leurs évaluations actives v1 ; `src/catalog/model.ts` valide l’ancienne grille à quatre critères, seuils 30/50/70/90. `catalog/evidence/` contient les notices institutionnelles des cent images, distinctes des preuves de notoriété. Les scripts sont exécutés avec Python standard ou `tsx`, sans nouvelle dépendance. Un intervalle est la borne du score quand chaque critère absent peut valoir entre 0 et 100 ; ce n’est pas un intervalle statistique de confiance.

## Plan of Work

Premier jalon : créer une collecte en Python utilisant urllib, avec cache de réponses datées, identifiants Wikidata spécifiques, liens Wikipédia fr/en et audiences mensuelles humaines. Vérifier les liaisons depuis les sources muséales et refuser d’inférer une identité depuis un titre générique. Conserver les erreurs et absences séparément des vrais compteurs à zéro. Les données capturées sont réutilisées hors réseau pour les calculs.

Deuxième jalon : ajouter `src/catalog/notoriety.ts` pour les poids, seuils et calculs partiels/complets. La normalisation d’audience est explicitement une convention exploratoire à saturation logarithmique, pas une mesure scientifique de célébrité. H/M/C ne sont pas déduits de la seule célébrité d’un auteur. Des appréciations éditoriales peuvent être ajoutées avec une justification critère par critère et les sources ; elles doivent être distinguées des mesures d’audience.

Troisième jalon : produire `catalog/notoriety/REPORT.md`, `results.json` et `results.csv` avec cent identifiants uniques, niveau actif, cinq entrées, couverture, total ou bornes, niveaux possibles et limites. Actualiser la méthode dans `concept.md`, `PRODUCT.md`, `README.md` et `catalog/README.md`, en distinguant cette proposition de l’ancienne exécution. Ne pas réécrire les revues historiques ni la référence fournie. Donner les résultats effectifs et les travaux restant nécessaires, plutôt que fabriquer une nouvelle répartition.

## Concrete Steps

Depuis `/home/ubuntu/art-booster`, lancer `python3 scripts/collect-notoriety.py` pour les données, puis `npm run catalog:notoriety` pour le rapport sans réseau. Exécuter `npm test` et `npm run build`. Deux exécutions du calcul doivent écrire des résultats identiques ; la collecte utilise un cache et ne détruit jamais les droits d’image existants.

## Validation and Acceptance

Le rapport porte sur les cent œuvres exactes et ne confond ni Monet Agapanthes avec toute la série des Nymphéas, ni une statuette anonyme avec sa civilisation, ni un atelier avec le maître. La formule appliquée à cinq valeurs 100 retourne 100 et Pièce maîtresse ; 40/60/75/90 activent les bons niveaux, sans arrondir avant classement. Toute entrée absente empêche un total définitif et ne devient jamais un zéro implicite. Tests de valeurs invalides, bornes et reproductibilité. Les cent images et les tests de sauvegardes continuent à passer ; le hash de `seed.json` reste inchangé.

## Idempotence and Recovery

Conserver les réponses brutes hors de `public`, avec URL et date. Les erreurs réseau sont signalées et retentables sans écraser une réponse réussie ; le calcul sur les captures n’a besoin d’aucun secret ou accès Internet. Aucune suppression de stockage navigateur ni migration active n’est prévue.

## Artifacts and Notes

Référence fournie : `MUSE_systeme_rarete.md`, non modifiée. Les scores 99/97/87 de ses exemples ne sont pas des données d’entrée. Les droits de reproduction sont un dossier distinct et ne valident pas la notoriété.

## Interfaces and Dependencies

Module pur TypeScript exportant les critères et `calculateNotoriety`, avec entrées numériques 0–100 ou null, sortie total nullable, bornes et niveaux possibles. Python standard pour le réseau, Node/tsx existants pour le calcul. Pas de bibliothèque Google Trends non officielle ni scraping de résultats Google.

Révision initiale : la nouvelle référence gouverne la simulation ; les évaluations actives et les probabilités restent inchangées jusqu’à une décision explicite d’activation.

Révision de collecte : HTTP 429 observés, cache et cadence lente ajoutés ; les limites de couverture et les choix de normalisation sont désormais explicités plutôt que de fabriquer une répartition complète.

Clôture du passage : collecte lente terminée, neuf audiences d’œuvre et 43 notes A exploitables. Quatre calculs complets, 96 avec bornes ; les inconnues et la sensibilité ne permettent pas d’activer une répartition globale. Tests/build et reproductibilité réussis ; contenu, source utilisateur, tirages et sauvegardes non modifiés.
