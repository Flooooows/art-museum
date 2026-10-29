# MUSE Rarity Engine 2.0.0

Moteur **indépendant, hors production**, conforme à la demande d’implémentation V2. Il propose un classement, y compris avec des données incomplètes, sans prétendre transformer une estimation en observation. Les cent objets déjà identifiés peuvent être traités ; une identité ambiguë ou des métadonnées minimales absentes entraînent un refus explicite.

**Aucune migration** : `seed.json`, raretés actives, tirages, acquisitions et marché restent inchangés. Le manifeste [protected-inputs.json](protected-inputs.json) conserve leurs empreintes ainsi que celles de V1, du précédent essai et du document fourni. Les commandes V2 s’arrêtent si ces entrées ont changé ; elles ne les restaurent ni ne les réécrivent.

## Trois générations à ne pas confondre

1. **V1 active** : `src/catalog/model.ts`, niveaux de démonstration, seuils historiques 30/50/70/90. Toujours utilisée par l’application.
2. **Ancien essai Internet** : `src/catalog/notoriety.ts`, poids 30/25/20/15/10, quatre scores complets et 96 incomplets. Scripts et résultats dans `catalog/notoriety` conservés intégralement.
3. **Rarity Engine 2.0.0** : nouvelle formule **25/20/25/20/10**, estimations explicites, confiance, calibration et rapports versionnés dans ce dossier. Cette demande utilisateur supersède pour le nouveau moteur la formule de `MUSE_systeme_rarete.md`, sans modifier ce document historique.

Les noms restent **Esquisse / Étude / Composition / Œuvre / Pièce maîtresse**. Les frontières sont `[0,40[`, `[40,60[`, `[60,75[`, `[75,90[`, `[90,100]`, calculées sans arrondi d’affichage.

## Architecture et réutilisation

| Module logique | Fichiers | Responsabilité |
|---|---|---|
| A — collecte | `scripts/rarity-v2/http.ts`, `connectors.ts`, `collect.ts`, `inputs.ts` ; `src/rarity-engine/collection.ts` | Cache et erreurs, connecteurs, identité, lecture des preuves existantes et déduplication. |
| B — scoring | `src/rarity-engine/scoring.ts`, `normalization.ts`, `estimation.ts` | Indicateurs, normalisation, comparables et distributions contextuelles. |
| C — calibration | `src/rarity-engine/calibration.ts` | Variantes de courbe/poids et stabilité, sans ajustement à un quota. |
| D — validation | `src/rarity-engine/validation.ts` ; `scripts/rarity-v2/report.ts`, `run.ts`, `verify.ts`, `integrity.ts` | Confiance, statuts, comparaison V1/V2, rapports figés et intégrité. |

`types.ts` définit le contrat et `configuration.ts` valide la configuration. Le domaine pur n’importe ni React, ni API, ni stockage utilisateur. Le collecteur adapte `WorkRecord`/`CatalogDataset` existants et réutilise les réponses de `catalog/evidence` et `catalog/notoriety/evidence`. Aucun serveur, base de données ou paquet supplémentaire.

Pour une nouvelle œuvre hors de ce catalogue, le domaine reçoit un `ArtworkInput` : titre, créateur **ou contexte**, médium, période, institution, identifiants, état d’identité et observations sourcées. `simulateRarities` propose un résultat si l’identité et les métadonnées sont suffisantes ; `resolveIdentity` peut préparer le rapprochement de notices. Le chargeur CLI est adapté au catalogue existant : un nouveau fournisseur exige de transformer sa notice en ce contrat, pas de confondre un résultat de recherche avec une observation vérifiée.

## Configuration versionnée

[config-2.0.0.json](config-2.0.0.json) contient version d’algorithme, version de politique, poids, seuils, courbes, distributions initiales, paramètres de comparables, confiance et scénarios. Sommes de poids incohérentes, seuils non croissants, plages invalides et références insuffisantes sont refusés. Aucun poids n’est renormalisé silencieusement.

**S = 0,25P + 0,20A + 0,25H + 0,20M + 0,10C**.

Une nouvelle calibration doit être une copie avec une nouvelle `configurationVersion`, passée par `--config`. Ne pas réécrire une politique déjà retenue pour une validation. Les variantes d’essai antérieures restent identifiées par leurs empreintes exactes, même pendant ce développement initial.

## Identité et hiérarchie des sources

Le titre seul ne suffit pas. Les identifiants muséaux exacts sont vérifiés contre la réponse de l’institution. Sans identifiant, le rapprochement exige titre, auteur, institution et dates concordants, et refuse plusieurs candidats. Une série ou reproduction est rejetée. Les liens Wikipédia de l’œuvre sont contrôlés par Wikidata ; la collecte supplémentaire a vérifié leurs `wikibase_item`.

L’exception existante de La Grande Vague conserve la correspondance explicitement revue entre l’impression du Met Q28912605 et sa composition identique Q252485. Ce n’est pas une traversée automatique vers une série. Les Nymphéas de Cleveland n’héritent pas des consultations de toute la série de Monet. Une civilisation, un sujet ou un pharaon représenté ne devient pas l’auteur de l’objet.

Chaque preuve indique URL publique, date de capture ou de revue, fournisseur, groupe indépendant, fichier, SHA-256, périmètre et niveau : **1 objet**, **2 auteur/contexte indirect**, **3 comparables ou politique d’estimation**. Les références éditoriales déjà consignées ne deviennent pas des pages intégralement récupérées : elles restent des revues antérieures estimées et non validées.

## Sources et connecteurs

| Source | Utilisation réelle dans ce lot | Authentification / limite |
|---|---|---|
| Met API | 19 notices exactes archivées, réutilisées. | Aucune clé ; pas de faux rafraîchissement de date. |
| Cleveland Open Access API | 80 notices, bibliographies, expositions et indicateurs officiels archivés. | Aucune clé ; les richesses documentaires ne sont pas homogènes avec le Met. |
| Wikidata | Identités exactes et créateurs depuis les captures ; 97 objets liés. | JSON des entités, pas recherche homonyme adoptée automatiquement. |
| Wikimedia Pageviews | Compteurs humains fr/en de douze mois, 2025-10-01–2026-09-30. | Mois incomplets explicitement distingués. |
| Wikipédia | Vérification supplémentaire des pages d’objets via l’API. | État réel dans [collection.json](collection.json), avec preuves. |
| Louvre / Commons | Métadonnées et correspondance de La Joconde déjà documentées, plus appréciations sourcées. | Aucun nouveau connecteur Louvre inventé ; preuve Commons de droits distincte de la notoriété. |
| Smithsonian Open Access | Connecteur `record/search` disponible et testé avec fixtures ; aucune donnée utilisée pour ces cibles. | `SMITHSONIAN_API_KEY` nécessaire ; pas de requête sans clé. |
| Europeana | Connecteur `record/search` disponible et testé avec fixtures ; aucune donnée utilisée pour ces cibles. | `EUROPEANA_API_KEY` nécessaire ; une recherche seule ne vérifie pas l’identité. |
| Google Trends | **Non intégré**, aucune mesure supposée. | Pas d’intégration fiable et comparable établie. |

Les deux connecteurs authentifiés ne sont **pas validés de bout en bout avec des identifiants réels** dans ce lot. Leurs résultats ne contribuent pas aux scores. Les conditions, schémas et accès du compte devront être contrôlés lors de leur activation. Les captures de fournisseurs authentifiés expurgent les clés ; ces secrets ne sont pas enregistrés dans les URL publiques, chemins ou réponses conservées.

Le client respecte un délai par fournisseur, les délais d’attente et `Retry-After` en secondes ou date HTTP. Une attente supérieure au budget diffère la requête plutôt que de réessayer trop tôt. Erreur réseau, JSON invalide, mauvais identifiant, limitation et absence de clé ne deviennent jamais des observations à zéro. Les échecs n’écrasent pas une capture réussie. Les snapshots réussis sont réutilisés ; une nouvelle campagne de collecte doit disposer d’un espace/version de capture distinct plutôt que d’effacer les preuves retenues.

## Les cinq critères

### P — Popularité de l’œuvre

Les audiences directes sont normalisées depuis les consultations humaines des pages identifiées, pas depuis le nombre de résultats de recherche. Une page absente ne donne pas zéro. Les autres statistiques publiques institutionnelles pourront alimenter le même contrat lorsqu’un fournisseur fournit réellement une mesure documentée ; aucun nombre de vues muséales n’a été inventé ici.

Une page avec des mois manquants est annualisée par la médiane des mois observés, mais le critère devient **estimated**. La contribution des mois absents varie entre zéro et le plus grand de quatre fois la médiane et du maximum observé ; une marge de normalisation supplémentaire élargit encore la plage. Les mois et compteurs réels restent dans les preuves. Cette méthode ne retrouve pas magiquement le trafic d’un ancien titre de page.

Sans audience directe, une estimation combine le groupe comparable admissible et la distribution déclarée de catégorie. Une audience **non imputée** de créateur peut relever modestement le mode, au maximum de 10 points ; une mise en avant officielle effectivement observée au maximum de 6 points. Aucun score M imputé, aucun rang V1 et aucune popularité de série ne servent à fabriquer P.

### A — Auteur ou contexte

Un auteur identifié utilise ses audiences, moyennées en cas de plusieurs créateurs résolus, avec risque commercial signalé pour les maisons et firmes. **Les audiences d’artistes ne sont jamais comparées aux percentiles des œuvres** : sans référentiel distinct d’auteurs, une courbe provisoire dédiée reste utilisée.

Pour un anonyme, atelier ou attribution incertaine, A est **estimé** depuis le contexte précis et les comparables appropriés. La culture explicite et une date renseignée apportent chacune 3 points de spécificité au mode initial, un atelier identifié 2 ; une mise en avant officielle, une bibliographie spécifique suffisante et des expositions documentées peuvent ajouter des soutiens bornés, configurés. Le contexte ne dépasse pas 65 sur cette politique. Cela évite d’attribuer à une amulette toute la renommée de l’Égypte, sans interdire mathématiquement à une icône anonyme d’atteindre le niveau supérieur avec des preuves fortes sur les autres critères.

### H — Importance historique

Une bibliographie spécifique permet un **indice documentaire dérivé**, selon les points de contrôle configurés. Les références sont dédupliquées. **Ce compteur ne mesure pas directement l’innovation ou l’influence historique** : la plage est large (marge de base de 22 points) et la proximité aux données observées est limitée dans la confiance. L’âge de l’objet ou la célébrité du peintre ne donne pas H automatiquement.

Les appréciations historiques antérieures sourcées priment sur ce proxy mais restent **estimated**, sans validation fictive. Leur désaccord avec le proxy abaisse la cohérence et élargit les bornes.

### M — Reconnaissance institutionnelle

Les composantes documentées sont : collection 20, notice publique 10, mise en avant officielle 20, événements dédupliqués jusqu’à 22 et références institutionnelles jusqu’à 23. Les deux dernières contributions croissent logarithmiquement et l’indice automatique est plafonné à 95. Une notice seule ne justifie pas un score maximal.

Quand les listes d’expositions ou publications ne sont pas disponibles, leurs contributions sont **imputées explicitement** depuis la configuration (8 et 10 points), pas présentées comme des zéros prouvés. Un indicateur de mise en avant absent a aussi une contribution provisoire explicite. Le critère entier est alors estimé et son intervalle élargi. Les différences de couverture entre institutions restent une limite substantielle.

### C — Présence culturelle

Les références indépendantes, usages publics et pédagogiques doivent concerner l’objet précis. Aucune abondance de liens ou de bibliographie muséale n’est transformée automatiquement en influence populaire. Une ressource pédagogique explicite peut fournir un indice limité ; les cinq appréciations culturelles antérieures restent estimées. Pour les autres cas, le manque de preuve produit une estimation contextualisée large, pas une déclaration d’absence de culture.

## Normalisation et comparables

La courbe provisoire interpole en `log(1 + vues/jour)` entre les points 0→0, 1→15, 10→35, 100→60, 1000→85, 10000→100. Ce sont **des choix de politique non étalonnés**, pas des percentiles mesurés. Le résultat n’est plus exclusivement dépendant d’une ancre qui saturait à 1000 vues/jour. Les échelles par catégorie sont neutres faute de données indépendantes.

Le mode `reference-percentiles` exige un catalogue déclaré représentatif, documenté, figé, à période/langues compatibles, au moins 500 objets par défaut et des identifiants canoniques ne recouvrant pas les cibles. Un sous-groupe d’au moins 50 observations permet la perspective catégorielle ; sinon elle est signalée indisponible. Le mélange global/catégorie est configurable. Les auteurs ont un ensemble `creatorRecords` distinct d’au moins 100 entrées, sinon A reste provisoirement normalisé. Les contrôles de taille, doublons et chevauchement ne certifient pas à eux seuls la représentativité : elle exige un audit du fournisseur et des catégories.

Les comparables d’imputation ne sont pas ce référentiel : ils peuvent venir du lot local, sont signalés comme tels, partagent catégorie puis époque lorsque possible, excluent l’objet cible, les identités non vérifiées et les notes déjà estimées. Minimum 5 voisins (8 pour P). La médiane est rétractée vers la distribution de politique avec un poids `n / (n + priorStrength)`. La dispersion robuste et la largeur de la distribution maintiennent des bornes larges. Aucun calcul en chaîne sur les imputations.

Les distributions initiales `priors` sont **éditoriales et non apprises** : modes distincts entre critères, mais délibérément neutres entre les catégories connues tant qu’aucune preuve comparative ne justifie un écart. Les comparables et indices spécifiques peuvent ensuite les moduler. Les plages restent larges. Ce sont des hypothèses de démarrage à valider, pas des résultats de recherche. Leur présence permet une proposition lorsque les sources ne permettent pas une estimation empirique précise. Si même l’identité est insuffisante, le moteur refuse plutôt que d’utiliser ces distributions sur une entrée arbitraire.

## Incertitude, confiance et statut

L’intervalle final additionne les bornes des cinq critères avec **les mêmes poids**, sans renormalisation ni hypothèse d’indépendance. C’est une plage de plausibilité conditionnelle aux méthodes et distributions choisies, **pas un intervalle de confiance statistique validé**.

La confiance est un indice heuristique distinct, somme de six composantes pondérées : couverture des indices 20 %, qualité 15 %, identification 20 %, proximité aux observations 20 %, précision des plages 15 %, cohérence 10 %. Les crédits de couverture/qualité sont des choix méthodologiques, pas des proportions mesurées de toute la connaissance disponible. Une audience normalisée reste dérivée ; un jugement éditorial non validé reçoit zéro de couverture numérique observée. Un proxy documentaire ne reçoit qu’un crédit partiel.

La majorité estimée plafonne la confiance à 0,55 ; des distributions seules à 0,35 ; une normalisation encore provisoire à 0,80. La confirmation demande par défaut 0,82, couverture d’indices ≥0,65, poids estimé ≤0,25, deux groupes indépendants, stabilité dans les variantes, marge de 2,5 points aux seuils et intervalle contenu dans un niveau. **Ainsi, la politique initiale ne confirme pas automatiquement des résultats tant que la normalisation n’est pas étalonnée.** Les candidats Pièce maîtresse gardent un drapeau de validation humaine.

Les copies et miroirs d’une source ne créent pas de groupes indépendants supplémentaires. Les statuts sont `confirmed` et `provisional` ; même `confirmed` ne permet jamais une migration implicite.

## Calibration et lecture du rapport

Le moteur recalcule avec des audiences normalisées à échelle ×0,5, ×1 et ×2, ainsi qu’avec les profils de poids Internet et patrimoine. Les imputations dépendant des signaux directs sont recalculées dans les variantes de normalisation. Les bascules de niveau, plages traversant les seuils, fortes incertitudes et écarts entre sources sont signalés.

[REPORT.md](REPORT.md), [results.json](results.json), [results.csv](results.csv) et [verification.json](verification.json) contiennent les résultats réels, pas une répartition cible. Le rapport étudie les six œuvres nommées par l’utilisateur, plusieurs anonymes égyptiens et des objets décoratifs/archéologiques. La liste détaillée des fichiers figure dans [FILES.md](FILES.md).

La validation artistique finale reste ouverte : P et surtout C manquent souvent de données directes, H est fréquemment un proxy bibliographique et les distributions ne sont pas encore étalonnées. Les familles présentes et les langues fr/en créent des biais. Une moyenne de confiance ou cent scores disponibles ne prouvent pas cent classements justes.

## Commandes

```sh
# Réutiliser les captures disponibles, sans Internet
npm run rarity:v2:collect

# Vérification supplémentaire via APIs, avec cache et limites
npm run rarity:v2:collect -- --live

# Calcul hors réseau, aucune activation
npm run rarity:v2

# Nouvelle politique de simulation, dans un fichier versionné distinct
npm run rarity:v2 -- --config catalog/rarity-v2/ma-configuration.json

# Deux calculs identiques, contrôle des preuves et des entrées protégées
npm run rarity:v2:verify

npm test
npm run build
```

Les secrets facultatifs portent uniquement les noms `SMITHSONIAN_API_KEY` et `EUROPEANA_API_KEY` ; ne pas les inscrire dans une configuration ou un export. Aucune recherche sur ces fournisseurs n’est automatiquement utilisée pour classer les cent objets sans identifiant lié.

Chaque exécution est adressée par l’empreinte des données, preuves, configuration et code, sous `runs/<runId>/`. Elle conserve `inputs.json`, `config.json`, une archive des sources du moteur/outillage `implementation.json`, les rapports et `manifest.json`, plus le référentiel éventuel. Une sortie figée différente n’est jamais écrasée. `latest.json` pointe vers l’exécution courante ; les trois rapports à la racine sont des copies de consultation, jamais des données d’application. La reproductibilité est vérifiée sur les mêmes captures figées ; une nouvelle collecte ou configuration constitue de nouvelles entrées. Pour une autre politique, `rarity:v2:verify` accepte également `-- --config chemin.json`.
