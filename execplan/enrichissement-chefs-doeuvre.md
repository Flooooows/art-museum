# Enrichir MUSE et publier une revue séparée des nouvelles candidates

## Purpose / Big Picture

Rechercher au moins 50 candidates sérieuses absentes du catalogue, vérifier leurs identités et droits, puis préparer 20 à 30 ajouts prioritaires avec le moteur V2. Une candidate n’est pas automatiquement une Pièce maîtresse ; un score inférieur à 90 doit rester tel quel et être expliqué. Aucun changement du catalogue actif, des choix humains, des pochettes ou du marché. L’utilisateur autorise désormais la publication sur le site Firebase de l’atelier : publier seulement une page séparée `/masterpieces.html`, avec stockage de sélection distinct et images juridiquement admissibles.

## Progress

- [x] (2026-10-30 UTC+8) Auditer le lot de 1000 et distinguer les propositions des 100 raretés actives.
- [x] (2026-10-30 UTC+8) Rechercher le JSON de décisions, y compris dans les fichiers ignorés ; identifier l’export de test existant sans le modifier.
- [x] (2026-10-30 UTC+8) Figer les empreintes des données et décisions ; audit réutilisable dans `catalog/masterpieces/audit.json`, prise en compte de l’export humain fourni séparément.
- [x] (2026-10-30 UTC+8) Vérifier 64 objets exacts : 51 notices complètes Chicago, 11 Met et 2 tableaux rapprochés des sources MoMA/Nasjonalmuseet. Wikidata non résolu reste null ; les pistes générales ne sont pas comptées.
- [x] (2026-10-30 UTC+8) Séparer droits de l’objet et de l’image : 42 admissibles documentés, dont 25 retenus et 17 différés ; 22 cas bloqués sans image. Télécharger seulement les 25 retenus après approbation, avec manifeste d’empreintes.
- [x] (2026-10-30 UTC+8) Calculer V2 sur les 64 objets et sélectionner 25 propositions diversifiées : Europe 12, Amériques 4, Asie 4, Afrique 4, Océanie 1. Aucune promotion artificielle.
- [x] (2026-10-30 UTC+8) Générer les quatre rapports racine, l’aperçu ReviewArtwork et la page indépendante avec rareté, sélection, historique et export/import.
- [x] (2026-10-30 UTC+8) 84 tests, builds jeu/atelier, typage strict des scripts et vérification historique V2 réussis. Parcours navigateur, intégrité et accessibilité vérifiés.
- [x] (2026-10-30 UTC+8) Publier `/masterpieces.html` sur `art-museum-8fdd8-atelier` ; vérifier HTTP 200, 25 images publiques par empreinte, navigation et persistance. Les 1000 notices ont toujours la même empreinte ; site principal non déployé.

## Surprises & Discoveries

Le jeu actif contient 100 œuvres, pas 1000 : le lot de 1000 appartient à l’atelier de revue. Ses propositions sont 161 Esquisse, 741 Étude, 94 Composition, 2 Œuvre et 2 Pièce maîtresse, toutes provisoires. Les raretés des 100 fiches actives restent 43/39/14/3/1. Le lot est dominé par Cleveland (980 notices), puis Met (19) et Louvre (1), ce qui explique une sélection incomplète des icônes mondiales.

La Joconde et La Grande Vague sont les deux propositions Pièce maîtresse. Le Fuji rouge est déjà présent sous `cma-111654`, titre institutionnel « South Wind, Clear Sky, from Thirty-Six Views of Mount Fuji » : ne pas l’ajouter une seconde fois. Des titres comme « The Kiss of Peace and Justice » ou « Design for a Gothic Fountain » ne sont ni Le Baiser de Klimt ni American Gothic.

Une recherche récursive trouve `.playwright-cli/muse-decisions-review-1000-b069bbaeeecc561d.json`, ignoré par les outils glob standards. Il contient UNE décision, La Joconde niveau 4, exportée le 30 octobre à 00:06 UTC. C’est l’artefact du test navigateur Firebase réalisé lors de la précédente livraison, pas la preuve de mille validations humaines. Le préserver, ne pas l’attribuer à l’utilisateur ; aucun autre export humain n’a encore été identifié. Demander l’export réel si nécessaire, sans bloquer les recherches de nouvelles candidates.

La recherche documentaire a corrigé deux pièges : Q471379 désigne le sujet général du Cri, tandis que l’objet de 1893 est Q18891156 / NG.M.00939 ; le panneau maya 1965.407 est un relief calcaire, pas un vase. Sa datation courte API 650–700 et son commentaire évoquant le VIIIe siècle restent contradictoires et signalés. Fang, Maya, Mexica et « Ancient Egyptian » sont des contextes anonymes, pas des artistes individuels.

94 collectes d’audience réussies et 10 limitées par le fournisseur ; aucune erreur ne devient zéro. Les accès directs MoMA répondent 403 : l’identité de La Nuit étoilée est confirmée par la ligne exacte ObjectID 79802 / 472.1941 du CSV officiel MoMA sur son dépôt GitHub (fichier Git LFS servi par media.githubusercontent.com). Les reproductions Chicago IIIF ont nécessité un en-tête Referer de la notice et une taille proportionnelle supportée ; aucun recadrage ni image protégée de remplacement.

Le premier `deploy:atelier` a expiré avant l’initialisation du CLI global situé sur le disque Windows monté. Reprise avec le même build et `npx --yes --package firebase-tools firebase deploy --only hosting --project art-museum-8fdd8 --non-interactive`, exécuté sous Linux : déploiement réussi, 141 fichiers, seul site atelier nommé dans la sortie.

## Decision Log

Décision (2026-10-30, assistant, instruction utilisateur) : l’autorisation « ajoute les au site sur firebase quand c’est trouvé » remplace la restriction initiale de non-publication, seulement pour la revue des candidates. Direction visuelle : continuité ivoire/bordeaux et reproductions entières de l’atelier ; contenu : introduction brève, grille réutilisée, sources et historique dépliables ; interactions : contrôles natifs, sans animation ajoutée. Les statuts accepted/rejected/deferred/reexamine sont distincts de la rareté et de l’activation du jeu.

Décision : utiliser l’export explicitement fourni par l’utilisateur dans son dossier Downloads comme référence humaine, et non l’export Playwright. Il contient 722 décisions uniques valides pour le bon catalogue, et 278 œuvres non revues. Distribution humaine 393/213/78/34/4, avec 491 différences vis-à-vis des propositions V2. Empreinte SHA-256 : `223cef98656d0cbe94a9bfff575475d4b175efe8b37eb41cb73e84166a8cba28`. Le chemin privé est conservé seulement dans `catalog/masterpieces/manual-reference.local.json`, exclu de Git ; le JSON original n’est pas copié dans les assets publics ni modifié. Auteur/date : assistant, 2026-10-30.

Décision : travail en dehors de `public/review-data`, du catalogue actif et des scripts V2 figés. Les sorties demandées seront `masterpieces-candidates.md`, `masterpieces-candidates.json`, `masterpieces-import-preview.json`, `masterpieces-rights-review.md` à la racine ; les preuves et scripts spécifiques dans `catalog/masterpieces/` et `scripts/masterpieces/`. Auteur/date : assistant, 2026-10-30.

Décision : réutiliser `ArtworkInput` et les fonctions pures V2, sans relever les scores éditoriaux pour obtenir 90. Une importance qualitative sourcée ne devient pas une mesure ; toute appréciation H/M/C reste explicitement estimée et à relire. Les scores mal étayés doivent rester faibles/provisoires plutôt que fabriquer une saturation. Auteur/date : assistant, 2026-10-30.

Décision : séparer statut de droits, état d’acceptation et rareté. Une œuvre encore protégée ou une reproduction non licenciée reste `rights_review_required`, sans téléchargement ni carte affichable. Le seul fait qu’une image soit sur le site d’un musée ou sur Commons ne prouve pas les droits de l’œuvre. Auteur/date : assistant, 2026-10-30.

Décision : les 64 objets peuvent recevoir un état de sélection avec historique ; seules les 25 cartes illustrées peuvent recevoir une rareté. Retenir une notice bloquée signifie intérêt éditorial, jamais autorisation d’image. Le format `muse-masterpieces-review` conserve des événements datés et fusionne explicitement les historiques après confirmation ; les plus récents l’emportent. Une sauvegarde incompatible reste intacte et les nouvelles décisions fonctionnent en mémoire exportable. Auteur/date : assistant, 2026-10-30.

## Outcomes & Retrospective

Mise à jour après réception du véritable export : quatre Pièces maîtresses humaines existent sur les 722 revues : La Grande Vague, La Joconde, `cma-136667` (*Nome Gods Bearing Offerings*) et `cma-148758` (*The Crucifixion of Saint Andrew*). Ces choix sont protégés même s’ils diffèrent du moteur. Les 278 absences ne deviennent pas des décisions humaines implicites. L’audit distingue distribution algorithmique, distribution des seules œuvres revues et simulation mixte clairement étiquetée. Les recherches et la sélection supplémentaire restent à mener.

Livraison terminée : 64 objets exacts, 25 propositions illustrées, 22 cas bloqués et 17 admissibles différés. Version `masterpieces-818ec04f3f8db6b3`, moteur 2.0.0 / configuration 2.0.0-draft.1. Les 25 propositions sont provisoires : distribution 0/12/11/2/0. Simulation de 1025 propositions 161/753/105/4/2 ; aucun changement appliqué aux raretés humaines ni au jeu. Les quatre livrables racine existent et documentent les scores étonnamment bas, droits, versions et limites. 430 empreintes de preuves/entrées et 29 empreintes d’implémentation rendent le calcul vérifiable.

Page publiée et testée : https://art-museum-8fdd8-atelier.web.app/masterpieces.html. Les 25 images publiques correspondent exactement aux rasters approuvés. Catalogue initial public SHA-256 toujours `c39fe57cb4353b4d624a204f6ed78329859e9d1df76275098597196bd13b9451`. Audit relu contre les 722 décisions originales, sans modification. Tests navigateur : aucune présélection, rechargement, quatre états, rareté exclusive, annulation historisée, export/import confirmé, filtres, notice de recherche, sauvegarde corrompue non écrasée et stockage initial préservé. Les choix créés pendant ces tests appartiennent seulement au navigateur automatisé, jamais aux assets déployés.

Limites assumées : pas de synchronisation entre appareils, pas d’import automatique dans le jeu, pas d’affirmation juridique mondiale, pas de confusion entre objets de référence et popularité universelle. Les pistes Fan Kuan, A’a, Cleopatra et les autres icônes restent dans le dossier documentaire quand les rapprochements exacts ou droits ne sont pas achevés. Aucun nouveau score 90 n’est fabriqué pour satisfaire le nom de la recherche.

## Context and Orientation

Projet `/home/ubuntu/art-booster`. Données de revue : `public/review-data/catalog.json`, contrats `src/review/types.ts`. Jeu : `src/catalog/seed.json`, modèle `src/catalog/model.ts`. Moteur V2 : `src/rarity-engine/`, configuration `catalog/rarity-v2/config-2.0.0.json`, collecte/cache dans `scripts/rarity-v2/http.ts` et `connectors.ts`. Les comparables historiques non imputés peuvent être réutilisés comme dans `scripts/review/build.ts` ; les nouvelles cibles ne deviennent pas une référence de normalisation. Les décisions humaines sont des exports séparés et partiels, jamais présumés exhaustifs.

## Plan of Work

Premier jalon : produire un audit avec décompte des artistes individuels (ne pas confondre graveur, éditeur, atelier et auteur principal), termes de mouvements observés ou limites de leur absence dans le modèle. Photographier les empreintes des données et de l’export de test. Chercher les véritables exports hors répertoires de tests s’ils apparaissent ; les respecter sans les réécrire.

Deuxième jalon : démarrer avec les œuvres nommées, puis élargir aux objets patrimoniaux d’Asie, d’Afrique, des Amériques et d’Océanie. Consigner titre original et alias, auteur/attribution, période, institution, QID, identifiant muséal et relation de version. Pour chaque rapprochement, garder une preuve institutionnelle exacte ; une recherche textuelle ou un titre traduit ne suffisent pas. Vérifier les doublons contre le millier entier, notamment Fuji rouge, les versions de Tournesols et les multiples Cri.

Troisième jalon : récupérer les notices et les déclarations de droits, pas les images protégées. Prioriser les organismes publiant explicitement leurs reproductions en CC0 ou domaine public applicable ; conserver les restrictions par pays et les cas d’images séparément protégées (sculptures photographiées notamment). Les sources consultées initialement incluent la politique Open Access du Met et celle de la National Gallery of Art ; les mentions anciennes sur les droits de peintures américaines ne doivent pas être prises pour l’état juridique actuel sans nouvelle vérification.

Quatrième jalon : adapter les observations au contrat V2. Rechercher des mesures directes d’audience sur douze mois complets lorsque disponibles. Ne pas substituer une audience d’artiste ou de série à celle de l’objet. Employer les distributions/proxies déclarés si les preuves manquent, garder confiance et intervalles. Analyser les résultats étonnamment bas et proposer des corrections de collecte/identité ou de politique, jamais de bonus nominal. Le nombre d’ajouts recommandés n’impose pas leur rareté.

Cinquième jalon : produire les rapports, les candidats bloqués et une prévisualisation compatible avec `ReviewArtwork`, sans inventer un nouveau format de carte. Exporter le composant `ArtworkCard` existant ; l’entourer de contrôles de sélection dans `src/masterpieces/`, avec historique et stockage indépendant. Ajouter `masterpieces.html` aux entrées Vite de l’atelier et copier seulement les données/images approuvées. La page d’origine garde son catalogue et sa clé de stockage.

## Concrete Steps

Depuis la racine, commencer par les scripts d’audit propres à `scripts/masterpieces/`, puis la collecte avec cache et le calcul hors réseau à ajouter. Vérifier les identités et licences dans les rapports avant génération de cartes. Exécuter `npm test`, `npm run build`, `npm run rarity:v2:verify` et les tests spécifiques. Après vérification navigateur, lancer `npm run deploy:atelier`, dont `firebase.json` limite la cible à `art-museum-8fdd8-atelier`. Vérifier ensuite les deux pages publiques et l’empreinte du catalogue original.

## Validation and Acceptance

Les quatre livrables existent et différencient identifiées, juridiquement admissibles, recommandées et simplement candidates à Pièce maîtresse. Au moins cinquante candidates supplémentaires sérieuses ont des preuves vérifiées ; les absences de droit empêchent la création de cartes. Les 20–30 priorités publiées restent des propositions, jamais des confirmations artificielles. Chaque score utilise les poids et seuils V2 et explique ses estimations. La simulation après ajout n’est calculée que sur le sous-ensemble admissible distinct, sans compter deux fois les versions déjà présentes. Les empreintes des mille cartes, des cent actives et des décisions restent inchangées. La page publique permet de choisir rareté et sélection, recharger, exporter et importer sans toucher au stockage initial. Aucune modification économique.

## Idempotence and Recovery

Cache des observations réussies avec dates et SHA-256 ; erreurs différenciées des données absentes. Aucun fichier historique ou utilisateur écrasé. Les sorties de prévisualisation sont régénérables depuis les preuves figées ; les décisions de sélection ont un fichier distinct conservé entre régénérations. Si les droits ou l’identité sont incertains, reporter et documenter, pas importer.

## Artifacts and Notes

Faits d’audit à reprendre : 1000 propositions, 980/19/1 institutions, deux niveaux 4 proposés, un seul niveau 4 actif. Recherches initiales : Nuit étoilée, Tournesols, Chambre, Vermeer, Picasso, Kahlo et Klimt ne sont pas présents sous ces crédits/titres ; une vérification complète par identifiants reste nécessaire. Le Rouge Fuji est présent et sera un doublon détecté, pas une nouvelle candidate.

## Interfaces and Dependencies

Réutiliser Node/tsx, `Evidence`, `ArtworkInput`, `ReviewArtwork`, `CatalogDataset`, `scoreDirect`, `completeCriteria`, `weightedInterval` et `confidenceFor`. Les sources web sont privilégiées officielles, puis Wikidata/Wikipédia. Ne pas ajouter d’infrastructure lourde ni changer le catalogue de revue versionné : cela casserait la compatibilité des JSON humains existants.

Révision initiale : plan fondé sur l’audit réel, avec le biais institutionnel, le doublon Fuji rouge et l’origine de l’export de test explicités avant sélection.

Révision de référence humaine : utilisateur ayant fourni son véritable export, validation complète de ses 722 entrées, protection de l’original par empreinte et séparation des 278 œuvres non revues. Aucun choix appliqué au jeu ou au site hébergé.

Révision de publication : autorisation Firebase reçue ; limiter explicitement le déploiement à une page de candidates indépendante, préserver les deux catalogues historiques et les décisions, tester les exports et l’intégrité avant publication.

Révision de livraison : recherche, rapports, revue et publication terminés ; consigner le lot réel de 64/25, les 22 blocages, les 17 différés, les vérifications et la reprise sûre du CLI. Les pistes non abouties restent explicitement ouvertes, pas maquillées en ajouts.
