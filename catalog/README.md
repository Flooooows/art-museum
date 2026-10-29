# Catalogue MUSE

## Source actuelle

`src/catalog/seed.json` est la source éditoriale locale effectivement lue par le site. Ce n’est pas une base hébergée : aucune infrastructure, connexion, synchronisation ou administration n’est provisionnée. `src/catalog/repository.ts` valide cette source ; `src/data.ts` la projette pour l’interface.

Le catalogue contient **100 œuvres** : les 20 fiches historiques conservées et 80 ajouts rédigés en français à partir des notices de Cleveland. Les six catalogues et leurs fiches restent de démonstration : aucune œuvre publiée, aucune rareté validée. Les **100 reproductions ont maintenant une revue de droits et une preuve par fichier**. Une donnée inconnue vaut `null`, pas un faux zéro. Voir [le bilan d’import](IMPORT-100.md).

## Entités et appartenances

| Table | Rôle |
| --- | --- |
| `works` | Identité stable, attribution, datation affichée et bornes éventuelles, matériau, origine, anecdote et histoire. |
| `families` | Beaux-arts, archéologie, arts décoratifs et imaginaire. |
| `museums` | Institution explicite, ville, pays et site. |
| `images` | Reproduction, alternative, source, image principale et revue des droits. |
| `catalogs` | Ensembles, familles associées, présentation et éventuel `frameFamily`. |
| `memberships` | Paires uniques œuvre/catalogue ; plusieurs appartenances sans dupliquer l’œuvre. |
| `rarityAssessments` | Évaluations versionnées : niveau, public, critères, preuves, justification, confiance et statut. |

Une œuvre référence `familyId`, `museumId`, `primaryCatalogId` et `rarityAssessmentId`. Le catalogue principal détermine le cadre ; les appartenances déterminent tirages, filtres et compteurs. La famille principale d’une œuvre doit être compatible avec les `familyIds` de son catalogue principal.

Exemple : `544864`, La Déesse hippopotame (Taouret), appartient à `mythes` **et** `egypte`, mais garde son catalogue principal `mythes` et ses cadres mystérieux. L’Égypte comprend 21 œuvres, les mythes 15. La Joconde appartient aussi à la Renaissance italienne sans changer son catalogue principal historique. Ces deux appartenances secondaires donnent 102 appartenances pour 100 œuvres uniques. Une acquisition fait progresser plusieurs ensembles sans compter deux cartes dans l’inventaire.

## Rareté éditoriale ≠ probabilité

Les niveaux restent : 0 Esquisse / fer, 1 Étude / cuivre, 2 Composition / argent, 3 Œuvre / or, 4 Pièce maîtresse / lapis-lazuli.

La grille **historique active** `notoriete-v1-proposal` n’est pas une expertise déjà menée : reconnaissance visuelle /40, culture populaire /25, diffusion éducative /20 et rayonnement géographique /15, seuils 30/50/70/90. Son validateur reste dans `src/catalog/model.ts` pour conserver la compatibilité des évaluations enregistrées ; quatre notes connues, source HTTPS, justification, public, confiance et date sont requis pour sa validation. Les cent évaluations actives restent provisoires et sans notes.

L’**ancien essai Internet**, fondé sur [`MUSE_systeme_rarete.md`](../MUSE_systeme_rarete.md), utilise P/A/H/M/C sur 100, poids **30/25/20/15/10**, seuils **40/60/75/90**. Cette analyse séparée reste conservée dans `src/catalog/notoriety.ts` et `catalog/notoriety`, sans modifier `rarityAssessmentId` ni publier les œuvres.

Le [rapport des cent calculs](notoriety/REPORT.md) accompagne les données [JSON](notoriety/results.json) et [CSV](notoriety/results.csv). `python3 scripts/collect-notoriety.py` collecte les identités et audiences publiques avec preuves datées/cache ; `npm run catalog:notoriety` recalcule hors réseau. Les audiences humaines fr/en portent sur les douze mois complets 2025-10-01–2026-09-30. Une normalisation logarithmique exploratoire plafonne à 1000 vues/jour, sans percentile du lot ; ses variantes de sensibilité sont enregistrées. Google Trends est absent, donc P reste un **proxy Wikimedia seul**, pas le critère Internet complet.

Les appréciations H/M/C et leurs sources sont dans `notoriety/editorial-review.json`. M=50 constate la présence dans une grande collection et la notice exacte, pas une influence ou célébrité maximale. Les autres critères non documentés restent `null`. Une page Wikipédia manquante, une erreur HTTP ou un créateur inconnu ne vaut pas zéro ; aucun poids n’est renormalisé. Le moteur donne un total uniquement si les cinq entrées sont connues, sinon les bornes et niveaux possibles. Aucune borne n’est un score à activer. Les réévaluations doivent être relues et explicitement activées dans une version compatible avant de changer les cartes.

### Rarity Engine 2.0.0 — nouvelle simulation

La demande suivante remplace cette méthode exploratoire pour les nouveaux calculs : **25 % P, 20 % A, 25 % H, 20 % M, 10 % C**. Le moteur dans `src/rarity-engine` et les connecteurs/outils dans `scripts/rarity-v2` réutilisent le catalogue et les preuves, mais ne modifient ni V1 ni l’ancien essai. Configuration versionnée, seuils 40/60/75/90, noms inchangés. [Guide](rarity-v2/README.md), [rapport](rarity-v2/REPORT.md), [JSON](rarity-v2/results.json), [CSV](rarity-v2/results.csv).

Les données manquantes sont proposées comme **estimations**, depuis des comparables non imputés ou des distributions contextuelles déclarées et larges. Pas de 50 silencieux, pas de zéro pour absence d’article/auteur, pas de transfert de série ou civilisation. H documentaire reste un proxy, M n’est plus le palier commun 50 de l’essai, C ne vient pas d’un compte de pages. Chaque critère expose méthode, provenance, type, bornes et comparables éventuels.

La confiance et les statuts sont indépendants du score. La politique initiale ne confirme pas automatiquement des niveaux tant que normalisation et couverture sont insuffisantes. Les percentiles demandent un catalogue externe figé/compatible/contrôlé, pas les cent cibles. Références d’auteurs et d’œuvres restent séparées. Les incertitudes ne sont pas des intervalles statistiques et les distributions initiales ne sont pas présentées comme apprises.

Commandes : `npm run rarity:v2:collect` (archives, hors réseau), `npm run rarity:v2:collect -- --live`, `npm run rarity:v2`, `npm run rarity:v2:verify`. Les sorties figées `rarity-v2/runs/<runId>` sont liées aux empreintes des entrées, configuration et code. Les commandes contrôlent les fichiers actifs et archives protégés. Aucun outil de migration ou d’activation n’est fourni ; même `confirmed` n’autorise pas une publication.

`rarityAssessmentId` choisit **explicitement** l’évaluation active. `latestAssessment` consulte la dernière version, sans l’activer. Ajouter une version 2 provisoire ne change donc pas la carte. Pour activer une réévaluation, la vérifier puis changer la référence. Conserver les versions antérieures ; les types ne constituent pas un archivage immuable.

Les poids de distribution sont séparés dans `src/packRules.ts` : **56,1 / 25,5 / 15 / 3 / 0,4 %** par carte dans la généraliste, dans l’ordre fer/cuivre/argent/or/lapis-lazuli. Après les taux demandés pour argent, or et lapis, les 81,6 % restants gardent la proportion fer/cuivre 55:25. Une pochette thématique renormalise entre les niveaux présents, sans promouvoir d’œuvre ni garantir un niveau ; Premières traces n’a pour le moment que des Esquisses. Cinq tirages indépendants peuvent produire des doublons.

## Statuts et publication

- `draft` : hors des œuvres/catalogues proposés. Une œuvre brouillon peut manquer d’image, notice ou évaluation active ; ses références et son appartenance principale doivent exister.
- `demo` : visible sans prétendre à une validation éditoriale. Image principale, notice et évaluation active obligatoires.
- `published` : mêmes prérequis, avec droits de l’image principale vérifiés, licence connue, date de revue, preuve de droits structurée et évaluation active `validated`.

`parseCatalog` refuse doublons d’identifiants, notices externes, appartenances ou versions, références inconnues, scores invalides et publications incomplètes. Un catalogue visible doit contenir une œuvre disponible ; une œuvre visible ne peut avoir un catalogue principal brouillon. Un catalogue publié exige tous ses membres publiés.

`publicationIssues(data, workId)` liste les blocages éditoriaux. `publishWork(data, workId)` retourne un jeu validé avec la fiche publiée, sans écrire le fichier ni modifier l’entrée. Ce contrôle vérifie la complétude des déclarations : il ne remplace pas l’examen humain des sources ou des droits. Le build autorise la démonstration valide et ne publie rien automatiquement.

```sh
npm run catalog:check
npm run catalog:check -- --json
npm run catalog:check -- --require-ready
npm run catalog:images
```

Le mode normal réussit : 100 œuvres, 6 catalogues de démonstration, 102 appartenances. `catalog:images` décode les 100 fichiers locaux et vérifie empreintes, notices brutes et déclarations de droits. Le mode strict de publication sort avec le code **1** : les 100 raretés restent provisoires ; les droits ne sont plus le blocage. `--json --require-ready` donne le rapport complet.

## Sélection des cent œuvres

`catalog/initial-collections.json` est maintenant au statut `selected`. Il affecte 99 œuvres uniques aux six ensembles éditoriaux et conserve Hokusai hors de ces ensembles : le total réellement importé reste 100, pas 101. Pour cela, la sélection du néoclassicisme aux modernes comprend 24 œuvres au lieu de la cible initiale de 25. Les appartenances secondaires ne gonflent pas le total.

| Ensemble éditorial | Œuvres sélectionnées | Dont fiches historiques |
| --- | ---: | ---: |
| Renaissance italienne | 15 | 1 |
| Du néoclassicisme aux modernes | 24 | 3 |
| Regards sur l’Égypte ancienne | 20 | 5 |
| Matières autour de 1900 | 15 | 5 |
| Mythes et créatures | 15 | 5 |
| Premiers arts, premières traces | 10 | 0 |
| Sous-total des six ensembles | 99 | 19 |
| Hokusai conservé hors de ces ensembles | 1 | 1 |
| **Total importé** | **100** | **20** |

Les pochettes visibles conservent les quatre identifiants historiques et ajoutent `renaissance-italienne` (Visages de la Renaissance) et `premiers-arts` (Premières traces). Le catalogue historique Beaux-Arts reste plus large que la sélection européenne : 26 œuvres, dont La Joconde et La Grande Vague, auxquelles s’ajoutent les 24 œuvres du néoclassicisme aux modernes. Les autres tailles sont Égypte 21, Arts décoratifs 15, Mythes 15, Renaissance italienne 15 et Premiers arts 10. Ne pas additionner ces tailles pour compter les œuvres uniques.

La Grande Vague (`45434`) reste disponible sans classement artificiel dans les six ensembles. Un ensemble d’estampes japonaises pourra l’accueillir ultérieurement. Les fiches importées sont déjà consultables et tirables, mais cela ne signifie pas que leurs raretés soient validées.

## Preuves et reproduction de l’import

`catalog/selection-100.json` contient les 80 textes français explicites. `catalog/evidence/*.json` conserve les 100 réponses sources datées. `catalog/image-rights-review.json` et `images[].rights.verification` relient chaque image à sa notice, sa politique de droits, son URL de téléchargement et son SHA-256. Les 80 ajouts sont CC0 ; les 19 images du Met sont identifiées comme domaine public par l’API Open Access ; La Joconde est déclarée PD/PD-Art sur Commons, avec réserve sur les différences entre juridictions.

Les 20 JPEG historiques contiennent des métadonnées différentes des téléchargements actuels mais des pixels décodés strictement identiques : ils ne sont pas écrasés. Les fichiers fournis par l’utilisateur (cadres, booster, maquettes) sont hors de cette revue des 100 reproductions ; leur licence n’est pas inventée.

```sh
python3 scripts/catalog_sources.py --selected
python3 scripts/prepare_catalog_images.py
python3 scripts/import_catalog.py
python3 scripts/import_catalog.py --apply
```

La collecte lit les API et réutilise les preuves en cache. La préparation refuse un changement de pixels d’un original existant. L’import sans `--apply` valide seulement un candidat dans `output/catalog-import` ; avec `--apply`, il active le candidat et les provenances. Une fiche déjà importée dont le texte diffère est refusée plutôt qu’écrasée. Ne pas déclarer de nouveaux droits vérifiés en recopiant simplement ces exemples : refaire leur contrôle.

## Ajouter une fiche

1. Trouver une notice institutionnelle et une reproduction réutilisable ; vérifier l’absence de doublon par fournisseur/identifiant externe.
2. Choisir un identifiant stable : les acquisitions y sont liées, pas au titre. Ne pas renuméroter ni supprimer les œuvres acquises.
3. Réutiliser ou ajouter famille, musée et catalogue. Ajouter l’œuvre `draft`, ses sources, datation nuancée et textes ; garder les valeurs inconnues à `null`.
4. Ajouter l’image et une déclaration honnête des droits ; `primary: true` est unique par œuvre. URL locale `/assets/...` ou HTTPS, sources institutionnelles HTTPS.
5. Ajouter l’appartenance principale puis les appartenances secondaires pertinentes, sans seconde fiche de l’œuvre.
6. Créer une évaluation versionnée et sélectionner sa référence ; documenter critères et sources avant validation, sans rareté inventée pour remplir un quota.
7. Exécuter audit et tests. Une fiche complète peut passer à `demo`. Pour publier, revoir réellement droits et évaluation, utiliser les gardes puis enregistrer les données validées dans la source.

Les cadres se préparent séparément avec `npm run prepare:frames`. Les fichiers inexploités sont signalés dans `src/frame-assets.report.json`, sans modifier leurs originaux ni bloquer les cadres valides. Les cinq fichiers Japon actuels sont conservés mais non activés.

Arts décoratifs dispose désormais de cinq cadres Art nouveau générés à la demande ; prompts et références dans `decorative-frame-generation.json`, provenance distincte des droits des œuvres. Les trente cadres actifs reçoivent un passe-partout neutre adapté à leur ouverture, sans modifier les niveaux éditoriaux ou les reproductions. Les variantes or et lapis restent disponibles pour l’avenir : aucune œuvre n’est promue pour les remplir.

## Pochettes et sauvegardes

`CARDS_PER_PACK = 5` ne concerne que les nouvelles ouvertures. Le stockage reste version 1 sous `muse-collection-v1` ; le parseur accepte un dernier résultat de trois ou cinq cartes. L’interface utilise sa taille enregistrée, sans compléter rétroactivement une ancienne pochette. `revealCards` ne touche ni inventaire ni stock. Export/import, favoris et exposition conservent les identifiants.

## Étape suivante : hébergement

Choisir ensuite explicitement une base et ses accès. Le modèle pourra guider des tables relationnelles et leurs clés étrangères. Préserver identifiants, appartenances et références actives ; droits d’écriture, historique éditorial, comptes et tirages serveur seront de nouveaux travaux. Aucun hébergeur n’est choisi ici.
