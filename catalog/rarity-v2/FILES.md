# Inventaire de livraison — Rarity Engine V2

Exécution retenue : **02b68c195210ea3536d84c1a** ; algorithme **2.0.0**, politique **2.0.0-draft.1**. Cet inventaire distingue les ajouts V2 du projet antérieur inclus dans la publication Git initiale.

## Code créé

| Chemin | Rôle |
|---|---|
| `src/rarity-engine/types.ts` | Contrats d’entrées, preuves, critères et résultats. |
| `src/rarity-engine/configuration.ts` | Validation des poids, seuils et paramètres versionnés. |
| `src/rarity-engine/collection.ts` | Résolution stricte des identités et déduplication. |
| `src/rarity-engine/scoring.ts` | Indicateurs directs, proxies et appréciations sourcées. |
| `src/rarity-engine/normalization.ts` | Courbes provisoires et références séparées œuvres/auteurs. |
| `src/rarity-engine/estimation.ts` | Comparables non imputés et distributions contextuelles déclarées. |
| `src/rarity-engine/calibration.ts` | Simulation, contrôles de période et sensibilité. |
| `src/rarity-engine/validation.ts` | Confiance, intervalles pondérés, statuts et revue humaine. |
| `scripts/rarity-v2/http.ts` | Client HTTP, cache, limites, délais et expurgation des clés. |
| `scripts/rarity-v2/connectors.ts` | Met, Cleveland, Wikidata, Pageviews, Wikipédia, Smithsonian, Europeana. |
| `scripts/rarity-v2/inputs.ts` | Adaptation du catalogue et des preuves existantes. |
| `scripts/rarity-v2/collect.ts` | Collecte avec cache et vérification des pages d’objets. |
| `scripts/rarity-v2/report.ts` | Synthèse, comparaison complète, cas détaillés et CSV. |
| `scripts/rarity-v2/integrity.ts` | Protection des entrées et écriture des sorties figées. |
| `scripts/rarity-v2/run.ts` | Commande de simulation et archivage adressé par empreinte. |
| `scripts/rarity-v2/verify.ts` | Double calcul hors réseau et vérification des preuves/rapports. |
| `src/rarity-engine.test.ts` | 27 tests V2 ; 67 tests dans le projet entier. |

## Configuration, rapports et documentation créés

- `catalog/rarity-v2/config-2.0.0.json` — politique complète et justifications.
- `catalog/rarity-v2/protected-inputs.json` — empreintes actives et historiques prises avant implémentation.
- `catalog/rarity-v2/collection.json` — sources réellement utilisées, notices et 17 correspondances Wikipédia vérifiées.
- `catalog/rarity-v2/results.json` — détails des 100 œuvres, preuves, estimations, confiance et sensibilité.
- `catalog/rarity-v2/results.csv` — comparaison exploitable des 100 œuvres.
- `catalog/rarity-v2/REPORT.md` — bilan, couverture, comparaison V1/V2 et cas particuliers.
- `catalog/rarity-v2/latest.json` — pointeur vers l’exécution retenue.
- `catalog/rarity-v2/verification.json` — preuve de reproductibilité et d’intégrité.
- `catalog/rarity-v2/README.md` — architecture, méthodes, limites et commandes.
- `catalog/rarity-v2/FILES.md` — présent inventaire.
- `execplan/rarity-engine-v2.md` — plan d’exécution et bilan de réalisation.

### Exécution finale figée

Le dossier `catalog/rarity-v2/runs/02b68c195210ea3536d84c1a/` contient exactement :

- `config.json`
- `inputs.json`
- `implementation.json` — archive du texte des 16 fichiers moteur/outillage.
- `manifest.json`
- `results.json`
- `results.csv`
- `REPORT.md`

Les chemins complets et SHA-256 de chaque preuve lue sont énumérés dans `manifest.json` → `evidenceHashes` ; les fichiers de code dans `implementationHashes`, et les sorties dans `artifacts`. Cette liste lisible par machine constitue l’inventaire exact des entrées du calcul, y compris les archives antérieures réutilisées.

### Cache et prototype conservés

`catalog/rarity-v2/cache/` contient **347 fichiers JSON**, nommés `<SHA-256 de l’URL publique>.json`. Ce sont des captures réussies importées et des réponses supplémentaires de vérification, pas 347 nouvelles sources indépendantes. Chaque fichier conserve URL, date et empreinte de réponse ; `collection.json` et le manifeste lient les captures réellement utilisées. Les clés des fournisseurs ne sont pas publiées.

Le passage de développement `catalog/rarity-v2/runs/755e4d41cb00c073200ab593/` reste conservé, sans être le résultat à retenir. Il contient `config.json`, `inputs.json`, `manifest.json`, `results.json`, `results.csv`, `REPORT.md`. Il précède les corrections finales et l’archive des sources ; ses chiffres ne remplacent pas l’exécution finale.

## Sept fichiers existants modifiés pour V2

- `package.json` — trois commandes V2 ; aucune dépendance ajoutée.
- `README.md` — accès au moteur, rapports et commandes.
- `PRODUCT.md` — simulation et absence de migration.
- `concept.md` — nouvelle formule et distinction des trois générations.
- `catalog/README.md` — séparation V1 / ancien essai / moteur 2.0.0.
- `DESIGN.md` — contrat de non-activation et absence d’effet visuel.
- `.impeccable/design.json` — référence structurée à V2, sans changement d’interface.

## Publication du projet complet

Le dépôt Git initial inclut aussi le projet antérieur : application, catalogue de 100 œuvres, preuves historiques, images et cadres, scripts, documents et verrouillage des dépendances. Ces fichiers ne sont pas pour autant modifiés par V2.

`.gitignore` est ajusté pour exclure dépendances, compilation, état de navigateur, fichiers d’environnement/secrets et métadonnées de téléchargement, tout en autorisant précisément ces cinq sources nécessaires au script existant `scripts/prepare-decorative-frames.mjs` :

- `output/imagegen/decoratifs-argent-source.png`
- `output/imagegen/decoratifs-cuivre-source.png`
- `output/imagegen/decoratifs-dore-source.png`
- `output/imagegen/decoratifs-fer-source.png`
- `output/imagegen/decoratifs-lapis-lazuli-source.png`

Les autres sorties temporaires et captures de navigateur restent locales. Aucun fichier utilisateur n’est supprimé pour préparer la publication.

## Fichiers explicitement inchangés

Les chemins et empreintes faisant foi sont dans `catalog/rarity-v2/protected-inputs.json` : catalogue actif, modèle V1, tirages, acquisitions, marché, données applicatives, moteur/scripts/observations/rapports de l’ancien essai et document utilisateur `MUSE_systeme_rarete.md`. Les preuves antérieures sont réutilisées sans réécriture. Aucun code React n’importe V2 ; aucun outil de migration n’est fourni.
