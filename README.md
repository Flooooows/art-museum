# MUSE — Un musée à collectionner

Ouvrir des pochettes de cinq cartes, découvrir des œuvres et constituer son musée personnel. Application React 19 + TypeScript + Vite, avec sauvegardes locales exportables.

## Les deux applications

| Application | Adresse | Contenu |
| --- | --- | --- |
| Jeu | https://muse-collection-6f2d.web.app | 1 011 cartes : 997 du millier et 14 extras conservés, raretés humaines, 12 types + 4 thèmes, collection et musée. |
| Atelier | https://art-museum-8fdd8-atelier.web.app | 1 000 propositions de rareté à examiner. |
| Candidates · 78 œuvres | https://art-museum-8fdd8-atelier.web.app/masterpieces.html | Enrichissement issu des 351 entrées. |
| Candidates · premier lot de 25 | https://art-museum-8fdd8-atelier.web.app/masterpieces.html?lot=initial | Premier lot, exports et décisions préservés. |

Firebase sert uniquement les fichiers des sites. **Pas encore de comptes synchronisés, de paiements ni d'échanges multijoueurs.** Les décisions de l'atelier ne modifient jamais automatiquement le jeu.

## Démarrer sur ce PC

Prérequis : **Node.js 24**, npm, Git et **Git LFS**. Avec nvm : `nvm use` lit `.nvmrc`.

```sh
git lfs install
git lfs pull
npm ci
npm run dev -- --host 127.0.0.1
```

Ouvrir http://localhost:5173 pour le jeu, `/review.html` pour l'atelier et `/masterpieces.html` pour les candidates. Si Vite choisit un autre port, utiliser celui affiché. Les 900 nouvelles images du millier sont servies par Cleveland et nécessitent Internet ; les reproductions du jeu et des deux lots de candidates sont locales.

**[Autre PC et données privées](docs/CHANGER_DE_PC.md)** · **[Utiliser l'atelier](docs/UTILISER_ATELIER.md)** · **[Index documentaire](docs/README.md)**

## Vérifier et compiler

```sh
npm run check
npm run build
npm run build:atelier
```

`check` regroupe le typage de l'application, des scripts et des configurations Vite, les tests et les audits du catalogue et des images. Les commandes de build ne déploient rien. `npm run preview` sert `dist/` ; `npm run preview:atelier` sert le paquet complet de l'atelier.

Les tests conservent la lecture des anciennes pochettes de trois cartes, les identifiants historiques, les droits structurés et les versions des catalogues publics. Le mode éditorial strict `npm run catalog:check -- --require-ready` reste volontairement en échec tant que les raretés ne sont pas validées.

## Organisation

```text
src/                       Jeu, interfaces de revue et moteur de rareté
scripts/                   Audits, préparation et recherche maintenus
catalog/                   Données éditoriales, preuves et exécutions figées
  masterpieces/reports/    Résultats du premier lot
  enrichment-351/input/    Documents d'entrée utilisateur, inchangés
  enrichment-351/reports/  Résultats de l'enrichissement
  history/                 Chemins historiques et sources avant rangement
public/                    Ressources des sites
references/                Maquettes, exemples et illustrations anciennes
docs/                      Documentation actuelle et index
  archive/                 Plans terminés, revues et ancien bootstrap
private/                   Exports et contexte personnels, ignorés par Git
output/imagegen/           Cinq sources de génération des cadres à conserver
```

Voir **[l'état actuel](docs/ETAT_ACTUEL.md)**, **[l'architecture](docs/ARCHITECTURE.md)** et **[le bilan du tri](docs/TRI_PROJET.md)**. Les plans archivés décrivent leurs anciennes livraisons, pas le fonctionnement actuel.

## Catalogue, rareté et images

- **Validation juridique UE** : badges, filtres et dossiers sourcés dans les trois revues ; décisions indépendantes de la rareté et de la publication. [Règles et outils](docs/DROITS_UE.md).

- Sources du jeu : socle historique `src/catalog/seed.json` (100 œuvres, 102 appartenances) et livraison explicite `src/catalog/game-release.json` (911 ajouts et raretés humaines des 100 existantes), sans réécrire les catalogues de revue. **[Extension autorisée et garde-fous](docs/PUBLICATION_CARTES_2026-11-01.md)** · **[Première livraison](docs/PUBLICATION_CARTES_2026-10-30.md)** · **[Guide éditorial](catalog/README.md)**.
- Classement courant du code : `src/catalog/taxonomy.json`, **12 types exclusifs et 4 thèmes secondaires** ; `npm run taxonomy:check` vérifie les 1 011 affectations et leurs sources. **[Effectifs, règles et état de publication](docs/RECLASSEMENT_CATALOGUES_2026-11-01.md)**.
- **Cartes et cadres détaillés, sept pochettes et ouverture animée** : présentation validée dans le lab puis figée pour le jeu, avec acquisitions réelles et sauvegardes conservées. **[Intégration et vérifications](docs/INTEGRATION_LAB_2026-11-02.md)**. [Retrait antérieur et archives](docs/RETRAIT_CADRES_2026-11-01.md).
- **[MUSE Lab](docs/MUSE_LAB.md)** : cartes, sept boosters et ouverture réunis dans un projet Firebase séparé du jeu. [Cadres détaillés et homogènes](docs/ESSAIS_CADRES_HOMOGENES.md) · [Sept pochettes](docs/ESSAIS_BOOSTERS.md).
- Taux généralistes par carte : **fer 56,1 %, cuivre 25,5 %, argent 15 %, or 3 %, lapis-lazuli 0,4 %**. Les pochettes thématiques renormalisent entre les niveaux présents, sans garantie ni promotion artificielle.
- Le moteur **V2** est une simulation indépendante : P/A/H/M/C pondérés 25/20/25/20/10, seuils 40/60/75/90. La grille historique active reste distincte. **[Méthode et limites](catalog/rarity-v2/README.md)**.
- Les 100 reproductions du jeu ont des preuves individuelles ; il ne s'agit pas d'un avis juridique mondial. Les cadres et illustrations utilisateur ont une provenance distincte, sans licence inventée.
- Les 90 variantes affectables sont figées dans `src/game-presentation/cards/` ; les cinq Paléolithique restent non affectées dans le lab. Les anciens originaux et dérivés sont conservés, sans préparation automatique au build. **[Cadres actifs et archives](docs/CADRES.md)**.

## Sauvegardes et publication

Chaque navigateur et chaque adresse ont leur propre progression. **Exporter le JSON avant de changer de PC, d'adresse ou d'importer les choix d'une autre personne.** Git ne sauvegarde pas le `localStorage`.

Après vérification et seulement pour une publication voulue : `npm run deploy:atelier` cible l'atelier ; `npm run deploy:muse` cible le jeu. Les deux configurations Hosting sont explicites et indépendantes. Un push Git n'est pas un déploiement Firebase.
