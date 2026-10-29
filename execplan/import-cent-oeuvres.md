# Sélectionner cent œuvres, vérifier leurs images et ajuster les tirages

## Purpose / Big Picture

L’utilisateur autorise maintenant la sélection, la vérification des droits de chaque reproduction et la rédaction des fiches. Le site doit proposer cent œuvres au total, sans perdre les vingt identifiants existants, avec des images locales et des preuves consultables. Les nouvelles pochettes restent de cinq cartes. Les taux demandés sont argent 15 %, or 3 %, lapis-lazuli 0,4 % ; les 81,6 % restants sont répartis entre fer et cuivre en conservant leur rapport précédent 55:25, soit 56,1 % et 25,5 %. Les seuils de score éditorial restent 30/50/70/90 et ne doivent pas être confondus avec les probabilités.

Ce plan vivant conserve Progress, Surprises & Discoveries, Decision Log et Outcomes & Retrospective. Aucune base hébergée, compte ou publication éditoriale automatique n’est autorisée par ce travail.

## Progress

- [x] (2026-10-29 UTC+8) Examiner le modèle existant, les tests figés à vingt et les sources institutionnelles accessibles.
- [x] (2026-10-29 UTC+8) Quatre-vingts œuvres de Cleveland sélectionnées ; cent notices de droits collectées et cent téléchargements contrôlés (80 CMA, 19 Met, une Commons).
- [x] (2026-10-29 UTC+8) Quatre-vingts fiches françaises rédigées, cent œuvres activées, cent images/provenances/preuves et deux nouveaux catalogues ; vingt fiches historiques comparées identiques.
- [x] (2026-10-29 UTC+8) Poids 56,1/25,5/15/3/0,4 appliqués ; audits catalogue et cent images réussis ; 31 tests réussis, dont frontières fractionnaires et sauvegardes anciennes.
- [x] (2026-10-29 UTC+8) Build réussi sans avis de taille après séparation du runtime React ; 80 nouvelles fiches parcourues, accueils et fiches longues clair/sombre 390/1440 vérifiés, dix audits axe sans violation. Parcours production, ancien import trois puis cinq et export/import exact réussis. Guides, contexte et revue finale mis à jour.

## Surprises & Discoveries

Les API du Met et de Cleveland sont accessibles sans clé. Le Met déclare isPublicDomain par objet et fournit primaryImageSmall ; Cleveland déclare share_license_status et fournit des descriptions institutionnelles. Une recherche plein texte « prehistoric » retourne aussi du mobilier moderne : la sélection doit examiner les datations, pas importer aveuglément les résultats d’une recherche. La page de politique du Met a initialement renvoyé HTTP 429 ; conserver les preuves API et chercher une page institutionnelle accessible plutôt que supposer le contenu.

Les vingt JPEG historiques diffèrent en octets des téléchargements actuels, mais leurs pixels décodés aux dimensions complètes sont strictement identiques : les métadonnées de provenance locales expliquent cette différence. La préparation conserve donc les originaux et enregistre les empreintes locale, téléchargée et des pixels. Les quatre-vingts nouvelles images pèsent environ 21 Mio et sont identiques aux fichiers CC0 fournis.

La recherche Renaissance présente aussi des attributions « suiveur de » ou « atelier de » ; une recherche Égypte peut faire remonter un pastiche moderne malgré un filtre chronologique. Les titres et noms d’artistes seuls ne suffisent pas. Ces nuances ont été lues dans les descriptions avant rédaction. Les fiches pauvres en contexte ne reçoivent pas d’anecdote historique inventée.

Le build initial de cent œuvres produisait un fichier de 547 ko. Le runtime React/react-dom/client est maintenant séparé en un chunk de 221 ko ; application 325 ko. Les preuves ne sont pas supprimées et le seuil d’avertissement n’est pas relevé.

## Decision Log

Décision : cent œuvres au total, donc quatre-vingts ajouts, sans supprimer les vingt existantes. Raison : proposition précédente explicitement acceptée par la demande d’import. Auteur/date : assistant, 2026-10-29.

Décision : fer 56,1 et cuivre 25,5 avec argent 15, or 3, lapis 0,4. Raison : total exact de cent et maintien de la proportion fer/cuivre précédente. Auteur/date : assistant, 2026-10-29.

Décision : n’admettre une nouvelle image que si une notice institutionnelle identifie expressément sa réutilisation (CC0 ou domaine public), avec URL de preuve, date, URL téléchargée et empreinte du fichier local. Raison : ancienneté de l’œuvre et droits de sa photographie ne sont pas équivalents. En cas de doute, remplacer le candidat, ne pas inventer une licence. Auteur/date : assistant, 2026-10-29.

Décision : conserver les raretés au statut provisoire tant que leur notoriété n’a pas de revue suffisamment documentée. Raison : l’utilisateur autorise la rédaction et les droits, pas une validation fictive de célébrité. Les nouveaux niveaux sont des propositions explicites, indépendantes des taux. Auteur/date : assistant, 2026-10-29.

Décision : garder les quatre identifiants de catalogues historiques et ajouter Renaissance italienne et Premiers arts, sans reclasser les anciennes cartes. La sélection éditoriale moderne comprend 24 et non 25 œuvres, plus Hokusai hors des six ensembles : 99 affectations uniques + Hokusai = 100. Raison : le plan antérieur prévoyait cent œuvres en excluant déjà Hokusai ; le conserver impose d’éviter une 101e carte. Les appartenances secondaires Taouret/Égypte et Joconde/Renaissance portent le total à 102 sans doubler l’inventaire. Auteur/date : assistant, 2026-10-29.

Décision : qualifier les dix-neuf images Met de domaine public d’après leurs réponses et la documentation metmuseum.github.io ; ne pas prétendre avoir lu les pages de politique restées en HTTP 429. Commons fournit une déclaration PD-Art avec réserve de juridiction. Raison : distinguer une preuve effectivement obtenue d’une supposition et les droits d’image de la seule licence des métadonnées. Auteur/date : assistant, 2026-10-29.

## Outcomes & Retrospective

Livré et vérifié : cent fiches réellement consultables et tirables, cent images locales avec décision de droits traçable, six pochettes thématiques et taux demandés. Vingt fiches historiques et leurs images sont préservées ; quatre-vingts nouvelles fiches françaises nuancées proviennent des notices CC0 de Cleveland. Les scripts de collecte, préparation et import sont réexécutables ; toute incohérence de fichier ou de preuve bloque l’audit.

Validation finale : 31 tests, audit des cent images et build réussis. Dans Chromium, quatre-vingts nouvelles fiches ouvertes avec texte/source/crédit/reproduction exacts ; accueil et fiche longue vérifiés en clair/sombre à 390 et 1440, dix audits axe sans violation. Le build servi localement conserve un ancien résultat de trois puis ouvre cinq cartes et exporte/réimporte exactement l’inventaire. Revue de l’agent principal dans .impeccable/review/import-cent-oeuvres.md, sans prétention de relecture indépendante.

Les droits des cent reproductions sont contrôlés selon les déclarations obtenues, avec réserve Commons explicitée. Les raretés restent provisoires, aucune fiche n’est publiée éditorialement : l’audit strict échoue honnêtement sur ce seul motif. Aucun compte, hébergement, marché transactionnel, commit ou déploiement ajouté.

## Context and Orientation

Projet React/TypeScript/Vite dans /home/ubuntu/art-booster. src/catalog/model.ts définit les œuvres, images/droits, musées, catalogues, appartenances et évaluations de rareté. src/catalog/seed.json contient vingt fiches demo et quatre catalogues ; repository.ts valide le JSON, src/data.ts le projette dans l’interface. Les images sont locales dans public/assets ; provenance.json contient leurs anciennes sources. src/packRules.ts contient cinq cartes par pochette et les poids. src/collection.ts accepte les anciens résultats de trois et nouveaux de cinq. Les tests catalog.test.ts, collection.test.ts et frames.test.ts contiennent des attentes figées à actualiser sans affaiblir la compatibilité des vingt anciens identifiants. catalog/initial-collections.json propose six sélections totalisant cent œuvres, mais dix-neuf seulement des vingt fiches y sont affectées : Hokusai doit rester inclus dans le total réel sans le classer artificiellement en art européen.

## Plan of Work

Premier jalon : collecter des notices institutionnelles en lecture seule avec un petit script reproductible, garder les réponses comme preuves dans catalog/evidence, lire leurs descriptions et sélectionner des œuvres diverses plutôt que des variantes répétées d’un même service. Privilégier Renaissance, peinture des XVIIIe–XXe siècles, Égypte, arts décoratifs autour de 1900, mythes et premiers arts. Toute proposition préhistorique doit être réellement antérieure à l’Antiquité ou clairement néolithique, pas simplement une œuvre évoquant des fossiles.

Deuxième jalon : créer une sélection éditoriale explicite séparée des notices brutes, avec titres, descriptions et anecdotes originales en français. Distinguer attributions certaines, hypothèses, dates approximatives et lieux de fabrication/provenance. Un importeur vérifie licences, URLs, unicité et présence des images avant de produire le jeu enrichi ; il ne doit pas écraser les images originales ni réimporter les textes culturels existants. Les nouvelles images sont téléchargées dans des fichiers dédiés. Les preuves doivent identifier le fichier exact et sa source, pas seulement la politique générale du musée.

Troisième jalon : brancher les œuvres dans des catalogues thématiquement corrects sans invalider les anciens identifiants de catalogues utilisés par les sauvegardes. Les ensembles à venir ne doivent plus être décrits comme cent fiches inexistantes. Une appartenance secondaire ne crée jamais un second inventaire. Appliquer les poids dans packRules.ts, conserver la renormalisation par thème et vérifier que 0,4 % reste visible, pas arrondi à zéro. Adapter les tests des taux et des tailles ; conserver un vrai test d’ancienne sauvegarde.

Quatrième jalon : npm test, npm run catalog:check, npm run build. Ajouter un audit des preuves qui échoue pour toute image non reliée à une source et une licence explicites ; vérifier les cent fichiers locaux, puis parcourir catalogue, recherche, fiche et ouvertures dans le navigateur à 390 et 1440 px dans les deux thèmes. Documenter nombre de fiches, musées, licences, raretés provisoires et toute exception. Aucune publication ou connexion externe au-delà de la lecture/téléchargement d’images publiques.

## Concrete Steps

Depuis /home/ubuntu/art-booster, utiliser les scripts de collecte/import dédiés créés pour ce lot ; ne pas relancer scripts/fetch-assets.py car il retélécharge aussi les maquettes et polices hors périmètre. Les requêtes de collecte sont limitées en parallélisme, conservées en cache et échouent explicitement si une source est indisponible. L’import est d’abord préparé puis validé avant activation. Les commandes de clôture sont npm test, npm run catalog:check et npm run build ; les preuves navigateur vont dans output/playwright et la revue dans .impeccable/review.

## Validation and Acceptance

Le catalogue compte exactement cent identifiants uniques, dont les vingt anciens. Chaque nouvelle œuvre a un titre français, une attribution nuancée, une date, un matériau, une origine, une anecdote, un récit, une notice source et une image téléchargeable dont la licence est prouvée. Les images existantes sont également revues ; ne pas marquer vérifié un cas sans preuve. Chaque nouvelle image possède source, date de contrôle et empreinte. Les cinq poids totalisent cent et le tirage généraliste affiche 56,1 / 25,5 / 15 / 3 / 0,4 %. Les thèmes ne proposent que leurs membres et leurs taux réels normalisés. Une ancienne sauvegarde garde ses cartes et son dernier tirage historique, puis peut ouvrir cinq cartes. Le build et les tests passent ; les blocages de publication restants correspondent honnêtement aux raretés provisoires, pas à des vérifications de droits inventées.

## Idempotence and Recovery

Conserver un instantané pré-import dans output pour comparer les anciens champs. Les notices brutes sont des preuves versionnables ; les téléchargements existants ne sont jamais écrasés silencieusement. L’importeur doit refuser un même identifiant avec des contenus incompatibles et être relançable sans dupliquer les œuvres. Aucun nettoyage de stockage ni commande destructive ; aucun original de cadre ou maquette modifié. Si un fournisseur échoue, reprendre depuis le cache et remplacer seulement les candidats non validés.

## Artifacts and Notes

Le journal d’import et la sélection explicite doivent rendre possible une révision humaine ultérieure. Vérifier des droits est un examen des déclarations institutionnelles, pas un avis juridique universel. La publication éditoriale et l’hébergement restent distincts de ce lot.

## Interfaces and Dependencies

Réutiliser Python standard pour les requêtes et l’import si nécessaire, TypeScript/tsx pour les audits et tests existants, Sharp déjà installé pour vérifier les images. Aucune nouvelle dépendance nécessaire. Les noms et couleurs de rareté, les cadres, les quatre destinations et la clé de stockage ne changent pas.

Révision initiale (2026-10-29) : import autorisé, vérification de chaque image et nouvelles probabilités explicitement demandés.

Révision de clôture (2026-10-29) : cent œuvres activées, vérifications et documents achevés. L’examen réel des sources a ajouté les réserves d’attribution et de juridiction ; la comparaison des pixels a permis de préserver tous les originaux ; le compte d’Hokusai et le fractionnement React ont évité respectivement un total de 101 et un gros fichier JavaScript. Les droits contrôlés ne sont pas présentés comme une validation éditoriale de notoriété.
