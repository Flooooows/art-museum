# Auditer les 351 entrées et préparer une revue locale sans publication

Suivi : ce plan décrit la préparation initiale sans déploiement. L’utilisateur a ensuite demandé explicitement la publication dans l’atelier Firebase ; elle a été effectuée et vérifiée selon `execplan/publication-enrichissement-atelier.md`, sans activation dans le jeu. Preuve : `catalog/enrichment-351/deployment.json`.

## Purpose / Big Picture

Transformer les deux fichiers fournis en un dossier traçable : comparaison au jeu, au millier et aux 64 candidates déjà examinées, versions exactes, trois groupes juridiques, images commercialement réutilisables et propositions V2. Le nouveau lot doit pouvoir être examiné avec l’interface existante sans changer ses catalogues ni ses sauvegardes. Aucun déploiement n’est autorisé dans cette nouvelle demande.

## Progress

- [x] (2026-10-30 UTC+8) Localiser les deux fichiers et constater 351 entrées, dont des séries et titres ambigus.
- [x] (2026-10-30 UTC+8) Figer les empreintes ; comparer les 351 lignes concordantes, documenter 22 correspondances à l’existant et deux doublons de sujet internes. Protéger l’export original de 722 décisions.
- [x] (2026-10-30 UTC+8) Collecter 357 entités principales, 163 liées et 401 métadonnées de fichiers, puis 123 titres anglais (85 entités) ; consulter notices Met, institutions, 23 notices Louvre et 19 manifestes Orsay. Les erreurs sont conservées.
- [x] (2026-10-30 UTC+8) Préparer 78 objets approuvés documentairement dans la portée annoncée et télécharger leurs 78 rasters ; aucun échec technique. Vérifier visuellement les quatre planches de contact, sans retoucher les couleurs.
- [x] (2026-10-30 UTC+8) Paramétrer la review réutilisée avec /review-351.html, données/images et stockage distincts, sans modifier les versions historiques. Typages application et scripts réussis à ce stade.
- [x] (2026-10-30 UTC+8) Collecte d’audiences terminée après notification : 221/221 disponibles pour les objets/artistes retenus, langues EN/FR et scopes exacts ou compositions explicitement revues.
- [x] (2026-10-30 UTC+8) Exécuter V2 inchangé : 78 cartes, version `masterpieces-9c6020dde274cede`, répartition proposée 0/17/57/4/0, toutes provisoires. Trois groupes totalisant 351 : 94 prêtes (78 nouvelles, 16 déjà représentées), 182 juridiques, 75 non exploitables actuellement.
- [x] (2026-10-30 UTC+8) Générer les trois livrables racine et le catalogue local ; vérifier une seconde génération aux quatre empreintes strictement identiques. Les versions historiques et l’export humain restent protégés.
- [x] (2026-10-30 UTC+8) Vérifier 92 tests, typages et builds ; tester en navigateur 78 images chargées, absence de choix initial, rareté/sélection indépendantes, persistance, export/import sans doublons, refus d’autre lot, sauvegarde corrompue conservée et anciennes clés inchangées. Mobile 390 px sans débordement ; aucun déploiement.

## Context and Orientation

Racine `/home/ubuntu/art-booster`. Les fichiers d’entrée `MUSE_catalogue_oeuvres_domaine_public_a_verifier.md` et `muse_oeuvres_candidates.json` sont des documents utilisateur en lecture seule. Le JSON comporte `artworks` : identifiant, catégorie, artiste, titre et statuts explicitement non vérifiés. Le catalogue de review figé est `public/review-data/catalog.json`, 1000 œuvres, version `review-1000-b069bbaeeecc561d`, SHA-256 `c39fe57cb4353b4d624a204f6ed78329859e9d1df76275098597196bd13b9451`. Le jeu possède 100 fiches et reste indépendant. Les 64 recherches précédentes sont dans `masterpieces-candidates.json`, dont 25 cartes illustrées et 39 métadonnées. Leur catalogue public `public/masterpieces-data/catalog.json`, version `masterpieces-818ec04f3f8db6b3`, doit rester intact pour conserver ses exports.

L’export humain original est localisé dans `catalog/masterpieces/manual-reference.local.json` (ignoré par Git). Ne pas le copier dans les assets. Sa référence SHA-256 est `223cef98656d0cbe94a9bfff575475d4b175efe8b37eb41cb73e84166a8cba28` : 722 choix, 278 non revues. Toutes les décisions, même différentes du moteur, restent prioritaires. Les décisions ultérieures conservées dans les navigateurs ne sont pas accessibles à l’agent : ne jamais présumer qu’il possède tous les exports.

V2 se trouve dans `src/rarity-engine/`, configuration `catalog/rarity-v2/config-2.0.0.json`. `scripts/masterpieces/score.ts` réutilise le moteur et les 100 pairs historiques directs, poids 25/20/25/20/10, seuils 40/60/75/90. Ne pas modifier les scripts historiques : leurs empreintes sont testées. Réutiliser leurs fonctions exportées. `ReviewArtwork` est le modèle de carte ; `src/masterpieces/CandidateApp.tsx` et `model.ts` fournissent revue, événements de sélection et import/export. Nouveau dossier de travail : `catalog/enrichment-351/`, scripts `scripts/enrichment-351/`, rapports `enrichment-351-report.md`, `enrichment-351-results.json`, `enrichment-351-review.json`.

## Plan of Work

Premier jalon : audit déterministe des 351 lignes. Garder un résultat par ligne même si celle-ci est un doublon, une série ou inexploitable. Distinguer une même composition d’un même objet physique. Les titres traduits et correspondances textuelles sont des pistes, pas des identités certaines. Détecter en particulier la double Petite Danseuse et les deux Qingming ; ne pas supprimer les entrées originales.

Deuxième jalon : rechercher les œuvres célèbres en priorité et conserver les réponses datées avec empreintes. Les notices institutionnelles et numéros d’inventaire confirment la version ; Wikidata et Commons facilitent les rapprochements mais leurs homonymes et séries demandent une validation. Les droits sont séparés par œuvre et reproduction. À défaut de territoires commerciaux explicitement indiqués, documenter une portée de travail France/Belgique-UE et États-Unis, sans autorisation mondiale implicite. Durée ordinaire, prolongations pertinentes, publication aux États-Unis, droits voisins, patrimoine italien, photographies 3D et contributions contemporaines restent des points de contrôle.

Troisième jalon : produire les groupes `ready_for_review`, `legal_review_required`, `not_usable_with_current_files`. « Prête » désigne une proposition documentaire pour les territoires explicités, pas une autorisation globale ni une publication automatique. Les doublons exacts renvoient à l’existant sans nouvelle carte ; les séries ne deviennent pas une image arbitraire. Une licence NC/ND ou un fichier sans auteur/autorisation précis ne suffit pas. Aucun raster ne peut être téléchargé avant son approbation documentaire.

Quatrième jalon : calculer avec V2 inchangé les objets admissibles, avec indicateurs observés/dérivés/estimés et confiance. Collecter des audiences précisément identifiées quand possible ; ne pas attribuer la notoriété d’une série ou d’une civilisation à un objet. Prioriser artistiquement les icônes sans leur attribuer un bonus chiffré pour obtenir 90. Préparer un lot séparé compatible avec la revue, stockage et export distincts, sans changer les versions ni choix des deux lots précédents.

## Concrete Steps

Depuis la racine : `npx tsx scripts/enrichment-351/audit.ts`, `npm run enrichment:prepare`, `npm run enrichment:images`, puis `npm run enrichment:build`. Les collectes sont déjà capturées ; ne les actualiser avec `--live` qu’en cas de recherche supplémentaire. `prepare` et `build` sont hors réseau ; `images` réutilise les rasters dont les approbations et empreintes concordent. Lancer `npm test` (92 succès), `npx tsc -b`, le typage strict des scripts, `npm run build`, `npm run build:atelier` et `npm run build:enrichment`. Ce dernier est uniquement un contrôle du paquet de code et ne copie pas les données. Pour voir la revue complète : `npm run dev -- --host 127.0.0.1`, puis `/review-351.html` sur le port annoncé ; le serveur de validation de cette session utilise 5183. Ne lancer aucune commande Firebase ni publication.

## Validation and Acceptance

Les 351 identifiants d’entrée apparaissent exactement une fois dans le résultat. Les trois groupes sont exclusifs et totalisent 351 ; présence/doublon est un axe distinct et empêche toute réimportation. Chaque nouvelle carte a une identité précise, une licence commerciale pour le fichier exact, une analyse territoriale, des sources et une proposition V2 reproductible. Les cas non résolus restent explicitement en attente, pas prétendument validés. Les empreintes des documents utilisateur, du millier, de l’ancien lot de candidates, du jeu et de l’export humain sont identiques avant/après. La nouvelle revue n’écrit dans aucune ancienne clé de stockage ; les exports incompatibles ne sont jamais remplacés silencieusement.

## Idempotence and Recovery

Les observations réussies sont mises en cache et réutilisées ; les erreurs réseau sont distinctes des absences. Ne pas écraser une décision utilisateur ni les rapports historiques. Seuls les fichiers propres au nouveau lot sont régénérables. En cas d’incertitude juridique, conserver la notice sans image et documenter la prochaine vérification requise. Reprendre depuis les captures réussies après une interruption.

## Surprises & Discoveries

Le fichier couvre des œuvres publiées après 1930, des artistes morts après 1955, des bâtiments à contributions multiples, des types d’objets et des séries. La qualification présumée UE ne tranche aucun de ces cas. Une analyse complète ne peut pas se limiter à appliquer « mort depuis 70 ans » à toutes les lignes.

Le JSON-LD de la notice de Munch écrit `application/ld&#x2B;json` dans l’attribut HTML. Le premier extracteur ne le reconnaissait pas et retombait sur la date secondaire erronée 2000. Le test de datation a échoué (`2000 !== 1899`) ; l’extracteur reconnaît maintenant cet encodage et retient 1899–1900 du musée. Le test reste en place. Dans le navigateur, attendre le chargement effectif des images paresseuses avant de les décoder évite un faux échec transitoire ; les 78 sont chargées sans erreur réseau.

## Decision Log

Décision (assistant, 2026-10-30) : nouveau lot isolé ; aucune régénération des rapports `masterpieces-*` ni publication Firebase. Raison : préserver les propositions et exports déjà livrés tout en respectant la nouvelle interdiction de publication automatique.

Décision (assistant, 2026-10-30) : les 16 entrées déjà représentées restent dans le groupe prêt comme références préservées, sans nouvelle carte ni nouvelle déclaration mondiale de droits ; les six représentations partielles ne sont pas assimilées à des doublons exacts. Les 27 priorités artistiques de recherche ne reçoivent aucun bonus V2 : zéro nouvelle proposition atteint 90, et toutes restent provisoires. Le build local séparé ne possède aucun Hosting cible.

## Outcomes & Retrospective

Les 351 lignes sont examinées ; 78 nouveaux objets disposent d’un dossier, d’un raster et d’un calcul V2 reproductible, accessibles dans la revue locale séparée. Les trois groupes, droits, crédits et sources sont livrés dans `enrichment-351-report.md`, `enrichment-351-results.json` et `enrichment-351-review.json`. Le guide est `docs/REVIEW_351.md`. Aucun changement du jeu, aucune migration de décision et aucun déploiement n’ont eu lieu. Les tests et le navigateur confirment la séparation des sauvegardes. Les captures de contrôle sont sous `output/playwright/` (ignorées par Git), dont les quatre planches de contact et les exports de test, qui ne sont pas des décisions humaines réelles.

La vérification exhaustive signifie un résultat par ligne, pas une validation primaire complète de toutes les œuvres. Les 182 dossiers juridiques et 75 lignes non exploitables restent ouverts ; 6 séries/groupes sont seulement partiellement représentés. Les marchés commerciaux réels doivent encore être confirmés. La priorité Pièce maîtresse de certaines icônes reste un sujet éditorial ; aucune note n’a été forcée et aucune carte n’a reçu de choix humain initial.

## Artifacts and Notes

Sources juridiques initiales fournies : SPF Économie belge, politique Open Access Cleveland, documentation API Chicago, Met et Commons. Les deux fichiers utilisateur avertissent eux-mêmes qu’aucune licence de reproduction n’y est validée.

## Interfaces and Dependencies

Node/TypeScript, cache `JsonCaptureClient`, `Evidence`, `ArtworkInput`, `ReviewArtwork`, `createScorer` existant, React et modèle d’événements existant. Pas de nouvelle infrastructure, base de données, économie ni dépendance de paiement. Les sources externes servent à la recherche, jamais à modifier automatiquement le catalogue actif.

Révision initiale : plan fondé sur les 351 lignes réellement présentes et sur les deux catalogues de review déjà livrés, tous deux protégés.

Révision de validation : collecte et 78 images terminées ; dates primaires de Psyché (1787–1793), Munch (1899–1900) et Renoir (1880–1881) corrigées face aux pistes secondaires. Les licences photographiques de Dalbéra, GRANDMONT et Shonagon sont conservées distinctement. La reproduction Kōrin montre un paravent d’une paire, pas l’ensemble ; l’indiquer explicitement dans la revue. Les Tournesols de Londres restent exclus faute de fichier exact satisfaisant.

Révision finale : notification des 221 audiences consommée, génération déterministe vérifiée, tests et parcours navigateur aboutis. Le périmètre reste local malgré la question sur l’atelier : l’atelier en ligne n’a pas été publié à nouveau. Les cas ouverts et limites de profondeur sont explicités plutôt que déclarés validés.
