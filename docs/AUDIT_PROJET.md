# Audit du projet MUSE — 30 octobre 2026

> État **avant rangement**, conservé comme référence de diagnostic. Plusieurs chemins et nombres ci-dessous sont historiques depuis le tri demandé ensuite ; voir [le bilan du tri](TRI_PROJET.md) et [l'état actuel](ETAT_ACTUEL.md).

## Conclusion

MUSE est un prototype fonctionnel cohérent, pas encore un service multijoueur. Son principal problème n’est pas une application cassée, mais l’accumulation de couches historiques : écrans abandonnés dans le CSS, documents décrivant plusieurs étapes successives, résultats de recherche à la racine et fichiers de travail mêlés aux ressources déployables.

Le ménage doit préserver les décisions humaines, les identifiants de cartes et les preuves de droits. Supprimer tout ce qui n’est pas importé par le jeu serait une erreur : une grande partie du dépôt sert à la recherche, à la validation ou à la reproductibilité.

Audit du commit `0b9ba0f`, sans changement applicatif, suppression, collecte de recherche, activation de cartes ni déploiement. Le présent rapport est le seul fichier versionnable ajouté pendant cet audit.

## Périmètre et preuves

- Inventaire initial : **2 014 fichiers suivis**, environ **684,46 Mio** sur disque, après récupération du contenu Git LFS. Ce n’est ni la taille compressée de Git ni un téléchargement navigateur.
- **48 documents Markdown suivis**, dont **12 plans terminés** ; lecture des guides et contrats, comparaison des états, inspection des rapports et synthèses historiques. Les conclusions juridiques historiques ne sont pas réexpertisées ici.
- Analyse des imports TypeScript, des entrées HTML/Vite, des configurations Hosting, des états React, du stockage et des références par empreinte.
- `npm test` relancé : **93 réussites, aucun échec**.
- Contrôle strict explicite des **38 scripts TypeScript** : réussi. Le `tsconfig.json` courant ne les inclut pas dans le build habituel.
- Syntaxe des cinq scripts Python : valide, sans lancer leurs collectes/imports.
- `npm audit` avec dépendances de développement : **aucune vulnérabilité connue signalée**, pas une garantie générale de sécurité.
- Les builds jeu, atelier et validation enrichissement ont réussi dans cette session sur les mêmes sources ; catalogue et 100 reproductions ont passé leurs audits.
- Aucun lien relatif Markdown explicite cassé détecté. Les liens externes et toutes les références en texte libre n’ont pas été vérifiés exhaustivement.
- Pas de nouvelle campagne navigateur, d’accessibilité ou de performance pendant cet audit. Les anciens comptes rendus de tests visuels restent des preuves historiques, pas des tests réexécutés.

Les fichiers techniques d’analyse et journaux sont dans `/tmp/opencode/muse-audit/` ; ils sont temporaires et ne constituent pas une dépendance du projet.

## 1. État réel du produit

| Ensemble | État |
| --- | --- |
| Jeu | 100 œuvres, 6 catalogues thématiques et une pochette généraliste ; 5 cartes par nouvelle pochette. |
| Collection | Favoris, exposition, doublons, export/import et recharge locale fonctionnels ; anciens tirages de 3 cartes acceptés. |
| Atelier principal | 1 000 œuvres, 12 familles de revue, décisions manuelles distinctes des propositions V2. |
| Candidates | Premier lot de 25 à `/masterpieces.html?lot=initial`, enrichissement de 78 à `/masterpieces.html`. |
| Référence humaine disponible | Export original de 722 décisions, 278 œuvres non revues ; ne représente pas les éventuels choix plus récents restés dans les navigateurs. |
| Raretés du jeu | Distribution 43/39/14/3/1 ; toutes les évaluations actives restent provisoires. |
| Rarity Engine V2 | Simulation séparée ; aucune activation automatique de ses propositions ni des décisions humaines. |
| Infrastructure | Deux sites Firebase Hosting ; pas de base de comptes, de synchronisation, de paiements ou de marché transactionnel implémentés. |

Jeu : https://muse-collection-6f2d.web.app

Atelier : https://art-museum-8fdd8-atelier.web.app

Les stockages sont indépendants par origine de navigateur et par fonction. Le mode local, les formats de décisions différents et l’absence de migration automatique sont des choix explicites, pas des bugs à supprimer.

## 2. Architecture actuelle

### Jeu

`index.html` → `src/main.tsx` → `src/App.tsx` → `Home`, `Opening`, `Collection`, `Market`, `Profile`.

`src/App.tsx` orchestre la navigation par hash, les dialogues, les imports et la persistance. `src/collection.ts` porte les fonctions de tirage, recharge et validation des sauvegardes. `src/data.ts` adapte `src/catalog/seed.json`, validé dans `src/catalog/model.ts` et lu via `repository.ts`.

Les cadres sont sélectionnés par `src/frames.ts` et rendus par `src/FramedArtwork.tsx`. `scripts/prepare-frames.mjs` produit le registre, les réductions et les masques à partir des originaux.

### Outils éditoriaux

`review.html` monte `src/review/ReviewApp.tsx`. `masterpieces.html` monte `src/masterpieces/CandidateApp.tsx` via un sélecteur de lot. `review-351.html` monte la même interface de candidates avec une configuration dédiée : ce n’est pas un troisième système de décision indépendant.

Les trois familles de données publiques sont `public/review-data/`, `public/masterpieces-data/` et `public/enrichment-351-data/`. Les recherches et leurs preuves sont dans `catalog/`, leurs collecteurs/générateurs dans `scripts/`.

### Moteur et publications

Le domaine de calcul est dans `src/rarity-engine/`, sans dépendance React. Les scripts `scripts/rarity-v2/`, `scripts/review/`, `scripts/masterpieces/` et `scripts/enrichment-351/` l’adaptent aux lots. La grille historique active, l’ancien essai Internet et V2 sont trois générations différentes ; ils ne sont pas interchangeables.

`vite.config.ts` produit le jeu et la page de revue dans `dist/`. `vite.atelier.config.ts` produit les pages de l’atelier ; `scripts/prepare-atelier-hosting.ts` ajoute une liste explicite de données et ressources dans `dist-atelier/`. `vite.enrichment.config.ts` produit uniquement un paquet de validation de code, sans ressources publiques complètes.

La séparation conceptuelle est saine. Les frontières physiques restent incomplètes : code de domaine dans `src/`, scripts dépendant des modèles d’interface, composant partagé importé depuis une application entière, et catalogues identifiés par taille/version figées.

## 3. Problèmes prioritaires

### A. Priorité haute — écrasement possible des choix entre onglets des candidates

Dans `src/masterpieces/CandidateApp.tsx:64–126`, chaque onglet charge une copie de l’historique puis `save` réécrit intégralement la clé locale. Aucun écouteur de l’événement `storage` n’est installé dans cet espace de travail.

Scénario déduit du code : A et B ouvrent le même lot ; A décide une œuvre ; B décide une autre œuvre depuis sa copie antérieure. La sauvegarde de B ne contient pas le choix de A. Les deux lots ont des clés différentes, mais deux onglets du **même lot** peuvent entrer en conflit.

L’atelier principal possède déjà une protection explicite dans `src/review/ReviewApp.tsx:364–375`, qui bloque les écritures et avertit. Étendre une protection équivalente aux candidates, avec tests navigateur à deux contextes/onglets. D’ici là : un seul onglet par lot et exports réguliers. Aucune perte dans des données utilisateur n’a été provoquée pour cet audit.

### B. Priorité haute pour la maintenance — les empreintes figent aussi le code vivant

`catalog/rarity-v2/protected-inputs.json` protège notamment `src/collection.ts`, `src/data.ts`, `src/catalog/model.ts` et `src/Market.tsx`. Les rapports des lots enregistrent aussi les empreintes de modules candidats et du moteur.

Conséquence : une correction légitime ou un simple déplacement peut casser les tests de reproductibilité, même si les cartes et les résultats ne changent pas. Il faut distinguer **archives immuables** et **sources maintenues**, puis définir un nouveau manifeste/version pour une évolution. Ne pas retirer les assertions ou remplacer en masse leurs empreintes pour obtenir des tests verts ; conserver la possibilité de reproduire les anciennes exécutions depuis leurs sources archivées.

### C. Priorité moyenne — paquet de déploiement du jeu inutilement volumineux

Le build local `dist/` contient environ **192,23 Mio**, car Vite y copie `public/` en entier. Après les exclusions actuelles de `firebase.muse.json`, la liste de fichiers éligibles au déploiement du jeu représente environ **122,15 Mio**, dont **72,67 Mio pour 35 originaux de cadres**.

`src/FramedArtwork.tsx` affiche les champs `src` et `matte` des versions réduites, pas le champ `original`. Les originaux restent nécessaires à la préparation et aux tests, mais pas au rendu du site. Les cinq Japon invalides et les familles prévues pour l’avenir sont aussi dans les ressources copiées.

Recommandation initiale : garder les originaux dans le dépôt et exclure leur niveau de dossier du paquet Hosting, sans exclure `collections/display/`. Une liste explicite d’assets du jeu, analogue à celle de l’atelier, sera plus robuste. Ces tailles concernent le contenu des paquets, pas les ressources téléchargées à chaque visite.

### D. Priorité moyenne — CSS historique et cascade de corrections

`src/styles.css` compte **5 519 lignes**, `src/appearance.css` **1 612**, `src/navigation.css` **964** et `src/frames.css` **144**, soit **8 239 lignes** pour le jeu.

Une recherche ciblée repère **224 règles candidates** dans les deux premières feuilles contenant des classes historiques absentes du code frontend actuel : `atelier-*`, `sealed-*`, `revelation-*`, `ritual-*`, `shop-intro`, anciennes compositions `featured-*`, etc. Exemples : `src/styles.css:399`, `:1071`, `:1221` et `src/appearance.css:494`.

Ce chiffre n’est pas une couverture CSS navigateur ni une autorisation de supprimer 224 règles entières : certains blocs regroupent plusieurs sélecteurs. Nettoyer sélecteur par sélecteur, puis consolider les styles et vérifier les pages, dialogues, états et largeurs. Ne pas supprimer `Opening.tsx` ou `Pack` : ils sont réellement utilisés par le parcours courant.

### E. Priorité moyenne — contrôles non réunis dans un parcours reproductible

Il n’y a pas de workflow CI versionné, de configuration E2E versionnée, de script lint ni de version Node fixée dans `.nvmrc`/`engines`. `tsconfig.json:15` couvre `src` et la configuration Vite principale, pas tous les scripts et les deux autres configurations.

`build:atelier` ne lance ni tests ni contrôle TypeScript. `deploy:muse` lance le build mais pas `npm test`. Les comptes rendus citent beaucoup de parcours Playwright, mais leurs scripts/captures sous `output/playwright/` sont ignorés : un nouveau contributeur ne peut pas les réexécuter depuis Git seul. `axe-core` est installé, sans commande d’audit reproductible dans `package.json`.

Créer une commande de validation regroupant types, tests et builds ; ajouter une CI et quelques parcours navigateur versionnés dans un dossier dédié. Les captures et exports personnels restent ignorés.

### F. Priorité moyenne — chargement et volume des candidates

Contrairement à `ReviewApp`, `CandidateApp.tsx:563–575` n’impose pas de délai de chargement et n’offre pas de bouton de réessai dans son état d’erreur. Les 78 cartes sont montées sans pagination ; filtres, état dérivé et parcours d’historique sont recalculés au rendu.

C’est supportable pour le lot actuel, mais moins adapté à des lots plus gros ou à un long historique. Harmoniser les états de chargement/récupération, puis envisager pagination et mémorisation des calculs plutôt qu’une réécriture générale.

## 4. Documentation : ce qui est fiable et ce qui doit être clarifié

Les guides les plus à jour sont `docs/CHANGER_DE_PC.md`, `docs/UTILISER_ATELIER.md`, `docs/REVIEW_351.md` et `docs/TESTER_MUSE_A_DEUX.md`. Les guides du catalogue et de V2 expliquent correctement les modèles et la distinction entre simulation, décision humaine et activation.

Décalages concrets :

| Fichier | Constat | Action proposée |
| --- | --- | --- |
| `PRODUCT.md:35–37` | Ne décrit pas les deux lots de candidates et conserve « aucun déploiement supplémentaire » dans le paragraphe atelier. | Décrire le périmètre effectivement livré et ses deux sites. |
| `concept.md:59–64` | Le nombre de cartes apparaît encore à arbitrer alors que cinq est décidé et implémenté. | Séparer décisions prises et questions réellement ouvertes. |
| `concept.md:177–216` | Abonnements, marché et récompenses décrits au présent sans séparation nette de la feuille de route. | Les marquer comme vision future/non implémentée. |
| `DESIGN.md:368,401` | Parle encore de quatre univers/pochettes là où il y en a six. | Harmoniser le registre et son compagnon `.impeccable/design.json`. |
| `.impeccable/surface.md` | Contrat initial puis adaptations successives, avec nombres anciens encore lisibles en premier. | Présenter d’abord le contrat actuel ; conserver les étapes en archive clairement nommée. |
| `catalog/review-1000/README.md:62` | Dit que le build atelier compile uniquement `review.html`. | Inclure `masterpieces.html`, les deux lots et leurs ressources. |
| `docs/VERIFICATION_CANDIDATES.md:3` | Lien sans `?lot=initial` alors que le document décrit les 25 premières candidates. | Corriger la destination ; garder les résultats historiques datés. |
| `docs/UTILISER_ATELIER.md:21–30` | Installation sans mention de Git LFS ; le guide multi-PC, lui, le prévoit. | Renvoyer à une procédure d’installation canonique avec Node 24, LFS et `npm ci`. |
| `README.md` | Bon point d’entrée technique mais pas de synthèse claire des deux apps, des trois lots de revue et du statut produit. | Ajouter ces liens et une carte courte du dépôt ; limiter la répétition de la méthode V2. |
| `execplan/*.md` | Douze plans terminés, tous avec l’ancien chemin absolu ; plusieurs reflètent 20 œuvres, 3 cartes ou une étape sans déploiement. | Les classer comme historiques ; ne pas actualiser rétroactivement les preuves et résultats de chaque livraison. |
| `MUSE_systeme_rarete.md` | Méthode utilisateur historique, pas V2 actuel. | Conserver l’original protégé ; signaler son statut depuis l’index documentaire. |

Il manque surtout une source synthétique de l’**état actuel**, une carte d’architecture, une feuille de route et une procédure de contribution. Le volume de documentation ne remplace pas cette hiérarchie.

## 5. Fichiers à trier : suppression, retrait du déploiement ou archive

### Auxiliaires supprimables après accord, sans toucher aux données métier

- `session:Zone.Identifier` et `muse-decisions-review-1000-b069bbaeeecc561d.json:Zone.Identifier` : métadonnées de téléchargement Windows, ignorées par Git, inutiles à Linux et à l’application.
- `dist/`, `dist-atelier/`, `dist-enrichment-351/` et `tsconfig.tsbuildinfo` : sorties régénérables, pas des sources obsolètes. Les effacer n’allège pas le dépôt Git, puisqu’elles sont ignorées.
- `node_modules/` : réinstallable avec `npm ci`, mais utile au poste de travail ; aucune raison de le supprimer pour « nettoyer » le code.

### Candidats à retirer des chemins actifs, avec adaptation préalable

- `scripts/fetch-assets.py` : ancien bootstrap des vingt œuvres et des maquettes ; non utilisé par le démarrage ou le build. Il écrit directement des images et le manifeste. Le garder comme archive explicitement non exécutable par défaut plutôt que le proposer comme outil de mise à jour.
- `scripts/crop-assets.mjs` : appelé par ce bootstrap ; recadre directement les JPEG existants et n’est pas adapté à des réexécutions successives. À retirer du parcours ordinaire ou à protéger, pas à lancer pour cet audit.
- `review-351.html`, `src/enrichment-351/main.tsx` et `vite.enrichment.config.ts` : point d’entrée local de validation doublonnant désormais la vue publique des 78 candidates. Retrait envisageable après mise à jour des guides, tests et empreintes ; pas une suppression immédiate sans conséquence.
- `public/assets/hero-bust.jpg`, `teaser-blue.jpg`, `teaser-portrait.jpg`, `atelier-pack.jpg` : candidats historiques sans référence dans le frontend courant identifié ; confirmer leurs références de provenance et outils avant retrait. `atelier-bg.jpg` reste cité par le CSS ancien ; `hero-art.jpg` et `hero-texture.jpg` sont encore des replis du composant `Pack` et ne sont pas classés comme supprimables.
- Les 35 originaux de cadres : **à exclure du déploiement**, pas à détruire.
- `exemplecarte1.png`, `exemplecarte2.png` et les maquettes `stitch_booster_pack_opening_platform/` : références utilisateur, hors exécution ; rangement possible, conservation recommandée.
- `session` : contexte de reprise, non suivi ; conserver hors des assets et éviter un ajout Git accidentel. Un stockage privé accompagné d’une synthèse maintenue est préférable à l’usage permanent de cet historique de plus de 7 Mo comme documentation courante.

### À conserver même si cela paraît redondant

- `catalog/evidence/`, `catalog/*/cache/`, sources collectées et manifestes : preuves de droits, d’identité et de calcul ; ne pas confondre ces captures avec un cache npm jetable. Des centaines de fichiers sont reliés par empreinte.
- `catalog/notoriety/`, `src/catalog/notoriety.ts` et les anciens collecteurs/rapports correspondants : réutilisés et protégés ; une éventuelle externalisation demande une migration explicite du dispositif d’archives.
- `catalog/rarity-v2/runs/` et `catalog/review-1000/runs/` : exécutions figées. Les copies de consultation courantes et les archives ont des rôles différents.
- `masterpieces-*.json`, `masterpieces-*.md`, `enrichment-351-*.json` et le rapport à la racine : résultats générés effectivement lus par des tests ou utilisés pour la revue. Ils encombrent la racine, mais ne sont pas des déchets.
- Les cinq sources `output/imagegen/decoratifs-*-source.png` : nécessaires à la reconstruction des cadres générés et à leur provenance.
- L’export humain original et `catalog/masterpieces/manual-reference.local.json` : privés et ignorés, mais nécessaires pour relancer certains audits/générateurs. Les sauvegardes du navigateur ne doivent jamais être remplacées par des exports de test.
- Les cinq cadres Japon invalides : non actifs, signalés volontairement et conservés pour correction ; les tests vérifient cette distinction.

L’analyse trouve seulement **six groupes de doublons exacts**, représentant **8,30 Mio** de copies supplémentaires. Ils correspondent aux rapports/configurations courants et à leurs archives figées. La duplication binaire n’est donc pas le principal problème à traiter.

## 6. Gestion du state

Le state du jeu est un objet versionné et validé : inventaire, favoris, musée, stock, date de recharge, nombre d’ouvertures et dernier tirage. Les fonctions métier sont pures ; les anciens identifiants et formats sont préservés. Le thème est isolé dans `muse-theme`.

Le state des 1 000 œuvres est un dictionnaire de décisions, exporté dans un format spécifique. Les candidates utilisent un historique d’événements horodatés qui distingue sélection et rareté ; les deux lots ont chacun leur clé de stockage. L’import du jeu remplace la collection après confirmation, celui du millier fusionne des décisions, celui des candidates fusionne des événements. Ces différences sont voulues.

Pour le périmètre actuel, `useState` et les fonctions pures suffisent ; ajouter Redux ou un autre gestionnaire global n’est pas une priorité. L’amélioration utile consiste à extraire la persistance du JSX, harmoniser les conflits entre onglets, conserver une validation stricte des imports et versionner les migrations.

Les tirages, le temps de recharge et les sauvegardes restent contrôlés par le navigateur et donc modifiables par son utilisateur. C’est acceptable pour une démonstration gratuite locale, mais insuffisant pour une économie réelle, des échanges ou des achats : ces fonctions devront devenir autoritaires côté serveur avant leur activation.

## 7. Ordre de remise en ordre recommandé

1. Protéger les décisions des candidates contre les écritures concurrentes et ajouter un test à deux onglets, en préservant formats et choix existants.
2. Définir comment versionner une correction sans casser les preuves historiques : archives de code figées d’un côté, sources maintenues et nouveaux manifestes de l’autre.
3. Créer un index documentaire et une synthèse actuelle ; corriger les quelques contradictions des guides vivants. Étiqueter les plans et revues anciens comme archives, sans réécrire leurs résultats.
4. Réduire le paquet du jeu, d’abord en excluant les originaux de cadres du déploiement. Conserver toutes les sources et preuves sur le poste et dans les emplacements versionnés appropriés.
5. Retirer les sélecteurs CSS des écrans abandonnés, avec une validation visuelle et fonctionnelle avant/après. Ne pas engager une refonte graphique.
6. Ajouter une validation unifiée, une version Node fixée, une CI et des tests navigateur minimaux versionnés.
7. Ensuite seulement, réorganiser progressivement les dossiers en jeu, atelier, composants partagés, domaine et recherche ; ranger les rapports racine en mettant à jour leurs consommateurs. Pas besoin d’une réécriture ni d’un monorepo complexe pour ce volume de code.
8. Reprendre enfin les prochaines fonctionnalités produit : consolidation des décisions éditoriales, publication contrôlée du catalogue, puis choix d’un backend si des comptes et une vraie synchronisation sont demandés.

Un contrôle supplémentaire avec `--noUnusedLocals --noUnusedParameters` relève uniquement un import de type `Criterion` inutilisé dans `src/rarity-engine/estimation.ts:7`. C’est mineur ; ce module étant lié aux empreintes historiques, ne pas le modifier isolément pour un simple nettoyage esthétique.
