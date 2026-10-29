# Concept — Un musée à collectionner

> Document de travail évolutif. Les pistes signalées comme propositions restent à valider.

Collectionner des cartes numériques représentant des œuvres d’art, des objets historiques et des découvertes archéologiques, tout en apprenant leur histoire et en constituant son musée personnel.

## Cadrage de la première esquisse — choix validés

### Public et expérience principale

Le site s’adresse aux personnes qui aiment collectionner des cartes, notamment celles attirées par une expérience de boosters comme Kyara, sans prérequis en histoire de l’art.

Le parcours central est **ouvrir → découvrir → collectionner → exposer**. La découverte est au premier plan, portée par le plaisir d’ouverture, la recherche de cartes rares et la progression des collections.

### Direction artistique



### Contenu culturel

Deux niveaux de lecture : une anecdote courte dès la découverte, puis une fiche détaillée et sourcée. L’accès à cette lecture doit rester simple sur téléphone, sans dépendre d’un survol.

### Périmètre de la première esquisse

Quatre écrans prioritaires, pensés également pour mobile :

1. **Accueil du collectionneur / pochettes** : choix d’une pochette, stock disponible, prochaine recharge et progression.
2. **Ouverture** : révélation des cartes, identification des nouveautés et doublons, accès à leur histoire.
3. **Collection / catalogue** : cartes possédées et manquantes, vue d’ensemble des catalogues, recherche et filtres.
4. **Fiche d’une carte** : reproduction entière, histoire, rareté

## Référence fonctionnelle : Kyara

Référence demandée : [kyara.games](https://kyara.games/), pour le principe des boosters, la première visite et l’organisation des collections. Observation du parcours public le 28 octobre 2026 ; les valeurs observées ne constituent pas automatiquement des paramètres validés pour ce projet.

### Mécaniques observées

- L’accueil donne directement accès aux boosters, avec un profil invité sans inscription préalable.
- La session invitée observée démarre avec un stock affiché de 10/10 boosters gratuits et 300 unités de monnaie virtuelle.
- Le site annonce une recharge gratuite toutes les 10 minutes.
- Plusieurs boosters thématiques sont proposés ; le booster sélectionné affiche 5 cartes, les probabilités et des garanties de tirage.
- Le stock est visible dans l’en-tête. L’accueil explique la boucle : ouvrir, compléter des séries, débloquer les fiches du wiki.
- La collection propose deux vues, cartes et albums, avec compteurs de cartes uniques, pourcentage de complétion et doublons.
- Les albums sont regroupés par univers ; la collection propose une recherche et des filtres par rareté et univers.
- Le site présente les échanges et le recyclage des doublons en monnaie virtuelle.

L’observation couvre l’accueil et la collection en mode invité. Les conditions exactes de conservation de la progression invitée et le fonctionnement après inscription restent à vérifier.

### Transposition retenue pour l’esquisse

- **Entrer directement dans l’expérience** : accueil centré sur les pochettes plutôt qu’un long parcours de présentation.
- **Essayer en invité** : prévoir une première ouverture sans inscription préalable, puis une invitation claire à créer un compte pour conserver sa collection. Les modalités de sauvegarde et les limites du mode invité restent à définir.
- **Disposer d’un stock gratuit renouvelable** : afficher le nombre de pochettes disponibles et le délai de recharge. Quantité initiale, plafond et fréquence restent à calibrer.
- **Choisir sa découverte** : proposer une pochette généraliste et des pochettes thématiques artistiques, avec leur contenu possible et leurs probabilités visibles.
- **Collectionner par ensembles** : adapter les univers de Kyara en catalogues artistiques, par exemple « Trésors de l’Égypte » ou « Impressionnisme », regroupés dans les grandes familles.
- **Parcourir cartes et catalogues** : prévoir les deux vues, une progression par catalogue et des filtres par famille, catalogue, rareté et possession. La représentation précise des cartes manquantes reste à dessiner.
- **Donner une suite à chaque tirage** : identifier les nouvelles acquisitions et les exemplaires supplémentaires, consulter la fiche et progresser vers les échanges ou l’exposition.

### Mécaniques à arbitrer avant leur implémentation

- Nombre de cartes par pochette et éventuelle rareté minimale garantie.
- Garantie après plusieurs ouvertures sans carte exceptionnelle, et articulation avec les probabilités identiques entre abonnements.
- Recyclage des doublons en monnaie virtuelle, en complément de la vente et de l’échange.
- Fiche culturelle intégralement accessible avant acquisition ou enrichie à la découverte : Kyara annonce un déblocage du wiki, mais cette restriction n’est pas encore retenue ici.
- Récompenses de connexion, missions et événements : leur présence chez Kyara ne les rend pas obligatoires pour la première version.

## Identité et vocabulaire

L’expérience possède une forte identité artistique : les noms, les interactions et la direction visuelle évoquent l’atelier, la collection et le musée.

### Vocabulaire proposé — à valider

| Élément | Nom dans l’expérience |
| --- | --- |
| Booster | Pochette de découvertes |
| Collection thématique à compléter | Catalogue |
| Album personnel | Inventaire |
| Favoris | Coups de cœur |
| Doublons | Exemplaires supplémentaires |
| Marché entre joueurs | Bourse des collectionneurs |
| Échanges | Cabinet d’échanges |
| Monnaie virtuelle | Éclats |
| Profil public | Portrait de collectionneur |
| Espace de présentation personnel | Musée personnel |
| Événement temporaire | Exposition temporaire |

Les noms doivent rester compréhensibles : les boutons peuvent conserver des actions explicites comme « Ouvrir », « Échanger » et « Exposer ». Le vocabulaire du musée doit convenir aussi aux objets archéologiques et aux arts décoratifs.

## Les familles de cartes

- **Beaux-Arts** : Renaissance, Baroque, Romantisme, Impressionnisme, Symbolisme…
- **Archéologie** : Égypte ancienne, Grèce, Rome, Mésopotamie, Préhistoire…
- **Arts décoratifs** : Art nouveau, Art déco, mobilier, bijoux, céramiques…
- **Art fantastique et mystérieux** : mythes, créatures, œuvres macabres et imaginaires.

Chaque famille possède une identité visuelle propre. Le dos des cartes présente le titre, l’artiste ou la civilisation, l’époque, les matériaux, le contexte historique et le lieu de conservation actuel, ainsi que le lieu de création ou de découverte lorsqu’il est connu.

## Le système de rareté

| Rareté | Niveau | Traitement visuel proposé |
| --- | --- | --- |
| Esquisse | Carte commune | Cadre sobre, détails évoquant le crayon et le papier. |
| Étude | Carte peu commune | Encadrement fin, détails d’atelier et légers reflets. |
| Composition | Carte rare | Cadre travaillé, accents colorés inspirés de l’œuvre. |
| Œuvre | Carte très rare | Encadrement prestigieux, dorures discrètes et lumière subtile. |
| Pièce maîtresse | Carte exceptionnelle | Cadre distinctif et mise en lumière exceptionnelle. |

Ces noms désignent les niveaux de collection : une carte « Esquisse » peut représenter une peinture achevée, un bijou ou un objet archéologique. Ils ne décrivent ni l’état d’achèvement ni la qualité de l’objet représenté.

### Principe retenu : la notoriété publique

La rareté dépend de la notoriété de l’œuvre ou de l’objet auprès du grand public. Les œuvres les plus connues sont les plus rares. **La Joconde est une Pièce maîtresse.**

La notoriété n’est pas une mesure de la valeur artistique, de l’importance historique ou du prix de l’œuvre. Une œuvre peu connue peut être essentielle à l’histoire de l’art tout en figurant au niveau Esquisse.

### Rarity Engine V2 — calcul et simulation indépendante

Définir d’abord le public de référence. Proposition de départ : le grand public francophone, en tenant compte du rayonnement international. Ce choix évite de traiter la célébrité comme une mesure universelle.

La demande d’implémentation Rarity Engine V2 définit désormais le moteur **2.0.0**, indépendant de l’application. Elle remplace pour les nouveaux calculs la formule du document antérieur `MUSE_systeme_rarete.md`, **pas les raretés actives**. Le moteur combine visibilité, auteur/contexte, importance historique, reconnaissance institutionnelle et diffusion culturelle ; ni valeur artistique ni prix ne sont mesurés. Configuration, méthodes et limites : [`catalog/rarity-v2/README.md`](catalog/rarity-v2/README.md).

| Critère | Poids | Question à examiner |
| --- | --- | --- |
| Popularité de l’œuvre `P` | 25 % | Audiences spécifiques ; sinon estimation indirecte ou contextuelle explicite. |
| Artiste ou contexte `A` | 20 % | Auteur identifié ou atelier/mouvement/contexte patrimonial précis, sans transfert de civilisation entière. |
| Importance historique `H` | 25 % | Influence, références et documentation historique ; un proxy documentaire reste signalé comme tel. |
| Reconnaissance institutionnelle `M` | 20 % | Collections, mises en avant, expositions et publications dédupliquées. |
| Présence culturelle `C` | 10 % | Références, reprises et mentions publiques de l’œuvre. |

Chaque critère est proposé sur **100**, puis pondéré : **S = 0,25P + 0,20A + 0,25H + 0,20M + 0,10C**. Poids, seuils, distributions et confiance sont configurables/versionnés. Une note à 80 ne représente pas 80 % de personnes reconnaissant l’œuvre. Les exemples fictifs de documents et de structures ne sont pas des données d’entrée.

| Score proposé | Rareté |
| --- | --- |
| De 0 à moins de 40 | Esquisse |
| De 40 à moins de 60 | Étude |
| De 60 à moins de 75 | Composition |
| De 75 à moins de 90 | Œuvre |
| De 90 à 100 | Pièce maîtresse |

Ces nouveaux seuils sont ceux de la **proposition v2**, adaptée aux noms MUSE existants, sans adopter les noms génériques Commune/Légendaire du document. L’application conserve pour l’instant la grille historique 30/50/70/90 et ses niveaux provisoires ; aucun recalcul ne les active automatiquement.

#### Procédure pour chaque carte

1. Identifier précisément l’objet avec les notices muséales et Wikidata. Une page de série ou de civilisation ne remplace pas celle de l’objet. Pour une estampe à plusieurs tirages, la composition identique peut être évaluée si cette correspondance est documentée.
2. Collecter des données comparables et conserver URL, période, date, langue, erreurs et réponses brutes. Google Trends est relatif et exige une période et une zone communes.
3. Privilégier les données directes, puis les indices indirects, puis les comparables et distributions contextuelles déclarées. Ne pas remplacer une inconnue par zéro ou un 50 silencieux ; conserver les poids. Toute imputation porte le type `estimated`, une méthode, les sources, une plage et une faible confiance appropriée. Un auteur anonyme n’est pas exclu mais ne reçoit pas toute la renommée du maître ou de la civilisation.
4. Faire relire les cas proches d’un seuil et les candidatures au niveau Pièce maîtresse. Si possible, confronter la reconnaissance supposée à un petit panel du public visé.
5. Distinguer confiance, stabilité et rareté : `confirmed` pour une simulation suffisamment fiable, `provisional` sinon. Même une confirmation ne publie pas la carte ; toute activation nécessite une décision et une migration explicitement approuvées.

Le [rapport V2 des cent œuvres](catalog/rarity-v2/REPORT.md) compare les propositions aux raretés actives et conserve les résultats historiques. Le premier essai à quatre scores complets reste intact dans `catalog/notoriety`. La collecte actuelle utilise les notices institutionnelles, Wikidata, Wikipédia et des audiences humaines fr/en de douze mois. Smithsonian/Europeana sont des connecteurs optionnels non exploités sans identifiants/clés ; Google Trends n’est pas intégré.

La normalisation provisoire utilise une courbe graduelle en logarithme, pas exclusivement l’ancienne ancre à 1000 vues/jour. Des percentiles globaux et par catégorie sont prévus seulement sur un catalogue externe représentatif, figé et contrôlé ; les seules cent cibles ne servent pas de référentiel. Les auteurs ont un référentiel distinct des œuvres. En l’absence de ces données, le caractère provisoire est explicite.

H documentaire ne prétend pas mesurer directement l’innovation ; une notice muséale ne donne pas M maximal, et des listes absentes sont imputées explicitement avec incertitude plutôt que comptées comme zéro. C ne découle pas d’une quantité de pages. Les cinq critères, estimations, comparables, plages de plausibilité et composantes heuristiques de confiance sont traçables. Les plages ne sont pas des intervalles statistiques certifiés. Les variantes de poids et de normalisation détectent les classements fragiles ; aucun quota de rareté n’est imposé.

#### Fiche éditoriale de rareté

- **Œuvre / objet :**
- **Public de référence :**
- **P / A / H / M / C :** chacun … / 100, type observé / dérivé / estimé
- **Nature des entrées :** mesure, proxy ou appréciation éditoriale
- **Période, langues, normalisation et sources par critère :**
- **Total :** … / 100
- **Rareté attribuée :**
- **Justification et sources :**
- **Confiance :** indice 0–1 distinct du score, composantes et limites
- **Statut de simulation :** confirmed / provisional
- **Date et version de la grille :**
- **En cas de données absentes :** méthode d’estimation, comparables ou distribution initiale, plage et raisons de revue ; refus si identité insuffisante

### Rareté et distribution

Le classement éditorial et les probabilités de tirage sont deux décisions distinctes. Les taux par carte de la généraliste sont désormais fer 56,1 %, cuivre 25,5 %, argent 15 %, or 3 % et lapis-lazuli 0,4 %. Les trois derniers taux ont été demandés par l’utilisateur ; le reste préserve la proportion fer/cuivre antérieure. Les pochettes thématiques renormalisent les poids entre les niveaux effectivement présents, sans promouvoir une œuvre pour remplir un quota. Les taux exacts sont affichés avant chaque ouverture de cinq cartes.

Ne pas modifier artificiellement la notoriété attribuée à une œuvre pour remplir un quota. Composer plutôt les catalogues avec un mélange d’icônes connues et de découvertes. Éviter les changements de rareté après diffusion ; toute correction devra être expliquée aux collectionneurs.

## Les pochettes de découvertes et abonnements

« Pochette de découvertes » est le nom proposé pour les boosters.

Le site propose une version gratuite et deux abonnements facultatifs. Tous les joueurs ont accès aux mêmes cartes, collections et fonctionnalités. Les abonnements permettent uniquement d’accélérer la collection grâce à des boosters supplémentaires.

- **Gratuit — 0 €** : boosters réguliers et accès à toutes les collections.
- **Argent — 3,99 €/mois** : boosters supplémentaires chaque semaine et bonus lors de certains événements.
- **Or — 7,99 €/mois** : davantage de boosters supplémentaires et bonus de fidélité.

Noms artistiques proposés pour ces trois formules : **Visiteur**, **Amateur d’art** et **Mécène**. Ces intitulés sont à valider ; ils ne changent pas les avantages décrits.

Les probabilités d’obtenir les différentes raretés restent identiques pour tous les joueurs.

## Le marché et les échanges

- **Marché entre joueurs** : mettre des cartes en vente contre une monnaie virtuelle ou acheter celles qui manquent à sa collection.
- **Système d’échange** : proposer des échanges de cartes en double avec d’autres joueurs.
- **Gestion des doublons** : conserver, vendre ou échanger ses cartes supplémentaires.
- **Économie équilibrée** : obtenir de la monnaie virtuelle grâce aux activités du site et encadrer les prix pour limiter les abus.

Le marché et les échanges permettent de compléter les collections sans devoir compter uniquement sur les boosters. Toutes les cartes restent accessibles à tous, quel que soit leur abonnement.

## Les récompenses de collection

Compléter une famille débloque des récompenses cosmétiques :
- Cadre de profil exclusif.
- Bannière personnalisée.
- Emblème thématique.
- Salle d’exposition virtuelle pour présenter ses œuvres.

Propositions pour renforcer la thématique : cimaises, fonds de salle, encadrements et cartels personnalisables. Les effets visuels doivent mettre les œuvres en valeur et préserver leur lisibilité.

Des récompenses intermédiaires peuvent être débloquées à 25 %, 50 % et 75 % de progression.

## Les récompenses secrètes

Des récompenses cachées se débloquent en réunissant toutes les œuvres d’un artiste, en complétant une collection rare ou en découvrant une série secrète.

Récompense ultime : compléter toutes les familles pour obtenir un cadre animé exclusif, une bannière prestigieuse et un musée personnel entièrement débloqué.
