# Examiner le lot des 351 candidates

Ce lot est **publié dans la revue de l’atelier**, à la demande explicite de l’utilisateur après sa préparation locale. Il ne change ni les 100 cartes du jeu, ni le millier de l’atelier, ni les 25 nouvelles candidates de la revue précédente. Les fichiers d’entrée restent des pistes de recherche, jamais des autorisations d’exploitation.

Version préparée : `masterpieces-9c6020dde274cede`. **78 nouvelles cartes** illustrées ; 94 lignes prêtes en comptant 16 références déjà présentes, 182 à vérifier juridiquement et 75 non exploitables avec les fichiers actuels. Les propositions V2 sont provisoires : 17 Études, 57 Compositions et 4 Œuvres, sans rareté humaine précochée.

## Ouvrir la revue

En ligne : **https://art-museum-8fdd8-atelier.web.app/masterpieces.html** ouvre les 78 nouvelles œuvres. Le lien **Premier lot · 25 œuvres** mène à `masterpieces.html?lot=initial` et retrouve les choix de la première revue. Les versions et clés historiques sont conservées, sans fusion ni migration silencieuse. La preuve de publication et des contrôles en ligne est `catalog/enrichment-351/deployment.json`.

Depuis la racine du projet :

```sh
npm run dev -- --host 127.0.0.1
```

Ouvrir `http://localhost:5173/review-351.html` (ou le port affiché par Vite). Choisir séparément une rareté finale et un statut **Retenir / Écarter / Reporter / Réexaminer**. Rien n’est précoché. Retenir une œuvre n’active aucune carte et ne publie aucune image.

Les sources, crédits photographiques et portée territoriale sont dans **Droits & historique**. La proposition V2 expose ses critères, données manquantes et niveau de confiance dans **Données & sources**. Une priorité de recherche « Pièce maîtresse » ne constitue ni un bonus chiffré ni un choix humain déjà enregistré.

Les choix sont conservés dans ce navigateur sous `muse:enrichment-351-review:v1`. Les clés `muse:rarity-review:v1` et `muse:masterpieces-review:v1` restent indépendantes. Exporter les choix avant de changer de navigateur ou d’appareil. Importer un export du même lot propose une fusion de l’historique ; un autre catalogue/version est refusé. Une sauvegarde locale corrompue n’est jamais remplacée silencieusement : les nouveaux choix restent alors en mémoire et doivent être exportés.

## Lire le dossier

- `enrichment-351-report.md` : synthèse et tableau des 351 lignes, nouvelles œuvres, raretés, licences, images haute définition et notices.
- `enrichment-351-results.json` : résultat par identifiant d’entrée, sources, réserves, droits séparés et calculs détaillés.
- `enrichment-351-review.json` : prévisualisation de revue, **pas** un import dans le catalogue actif du jeu.
- `catalog/enrichment-351/image-manifest.json` : dimensions, empreintes, crédits et transformations des reproductions locales.
- `catalog/enrichment-351/approvals.json` : sélections documentaires explicites, corrections et cas exclus.

Les trois groupes sont exclusifs et couvrent les 351 lignes. Le groupe prêt inclut aussi des œuvres **déjà représentées**, référencées sans réimportation ni modification de leurs décisions. « Non exploitable avec les fichiers actuels » ne signifie pas qu’une œuvre ne pourra jamais être admise : fichier insuffisant, série non résolue ou notice manquante peuvent être complétés.

La profondeur des recherches n’est pas uniforme : toutes les lignes sont examinées, mais seules les nouvelles cartes préparées ont un dossier abouti comprenant objet précis, reproduction commerciale, raster contrôlé et proposition V2. Les pistes non approuvées restent telles quelles.

## Droits et limites

La portée documentaire annoncée est **France/Belgique–UE et États-Unis**, faute de liste des territoires commerciaux. Elle n’est pas une autorisation mondiale ni un avis juridique. Confirmer les marchés effectivement visés avant publication. Séparer les droits de l’œuvre, ceux de sa photographie et les autres restrictions éventuelles. Le domaine public UE ne tranche pas la publication américaine, les œuvres inédites ou les droits d’un photographe contemporain.

Les crédits CC BY doivent accompagner l’image avec la source, la version de licence et la mention du redimensionnement. Le peintre n’est pas nécessairement le photographe : les reproductions retenues de Dalbéra et GRANDMONT ont leurs propres crédits. Les deux photographies antiques de Shonagon sont en CC0. Le fichier Kōrin montre un paravent d’une paire, pas la totalité de l’ensemble.

Les séries et objets voisins ne servent pas de substitutions : _Les Tournesols_ de Londres ne sont pas validés par un fichier de Tokyo, la _Classe de danse_ d’Orsay n’est pas celle du Met, et _La Nuit étoilée sur le Rhône_ n’est pas celle du MoMA. Les doublons d’entrée sont conservés dans le rapport et exclus des ajouts.

## Reproduire sans publier

Avec les captures existantes, `prepare` et `build` travaillent hors réseau :

```sh
npx tsx scripts/enrichment-351/audit.ts
npm run enrichment:prepare
npm run enrichment:images
npm run enrichment:build
npm test
npx tsc -b
npm run build:enrichment
```

La commande d’images réutilise les fichiers contrôlés ; elle télécharge uniquement les fichiers approuvés manquants. Le build de validation ne copie pas les données publiques : utiliser Vite en développement pour la revue locale complète. Aucun Hosting ne cible `dist-enrichment-351`. Le build de l’atelier copie explicitement les deux catalogues de candidates et leurs images ; la configuration du site de jeu continue à exclure ce lot. Pour republier uniquement l’atelier après validation : `npm run build:atelier`, puis `npx --yes --package firebase-tools firebase deploy --only hosting --config firebase.json --project art-museum-8fdd8 --non-interactive`. **Ne pas utiliser `deploy:muse` pour cette revue.**

Les collecteurs de recherche séparés acceptent `--live` pour les appels API ; `collect-policy.ts` et `collect-official.ts` peuvent récupérer les captures textuelles manquantes. Ils ne constituent pas une validation automatique. Une actualisation de preuves impose de régénérer et de tester le lot ; ne jamais contourner le refus d’un export devenu incompatible.

## Contrôles réalisés

93 tests passent ; le typage de l’application et celui des scripts réussissent. La génération est déterministe. En navigateur : 78 images chargées, choix indépendants, persistance après rechargement, export/import fusionné sans doublons, refus d’export d’un autre lot, sauvegarde corrompue non écrasée et export des choix restés en mémoire. En ligne, les lots de 78 et 25 sont accessibles, le passage de l’un à l’autre conserve les décisions et les trois catalogues publiés ont les empreintes locales attendues. La vue mobile à 390 px n’a pas de débordement horizontal. Ces essais utilisent des choix de test isolés, pas des décisions humaines à importer.
