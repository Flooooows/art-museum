# MUSE — Un musée à collectionner

Application React + TypeScript construite à partir des quatre maquettes de `stitch_booster_pack_opening_platform/`. Le fonctionnement est adapté à `concept.md`.

## Démarrer

```sh
npm install
npm run dev -- --host 0.0.0.0
```

Ouvrir http://localhost:5173. Pour une version compilée : `npm run build`, puis `npm run preview`.

## Fonctionnalités

- Pochette généraliste et six pochettes thématiques gratuites.
- Accueil Pochettes allégé : pochette tous styles en vedette et accès direct aux univers.
- Navigation Pochettes / Marché / Collection / Profil, inspirée de la séparation des usages de Kyara, dans l’identité MUSE.
- Ouverture et découverte carte par carte ou rapide dans une même fenêtre, sans page Ouvrir ou Révéler. Reprise du dernier tirage non entièrement dévoilé, même après rechargement.
- Cinq cartes par nouvelle pochette, tirages pondérés, nouveautés et exemplaires supplémentaires ; anciens résultats de trois conservés sans ajout rétroactif.
- Inventaire, vue des catalogues, recherche sans accents, filtres combinés, tri et pagination.
- Cent œuvres consultables, dont les vingt historiques conservées : reproductions entières, fiches françaises, anecdotes et notices sources.
- Catalogue structuré : œuvres, musées, preuves de droits par image, appartenances multiples et évaluations versionnées ; [guide éditorial](catalog/README.md) et [bilan des cent œuvres](catalog/IMPORT-100.md).
- Cadres par famille et rareté dans la découverte, la collection, le musée et les fiches ; repli sobre si un visuel manque.
- Cinq cadres Art nouveau Arts décoratifs ; passe-partout neutre pour les trente cadres, ivoire en clair et brun-bordeaux en sombre, sans recadrage ni déformation des œuvres.
- Noms de rareté conservés, avec matières cohérentes : Esquisse/fer, Étude/cuivre, Composition/argent, Œuvre/or, Pièce maîtresse/lapis-lazuli.
- Coups de cœur et salle d’exposition personnelle.
- Sauvegarde locale, recharge hors ligne, export et import JSON avec confirmation de remplacement.
- Profil dédié à la progression, au musée, aux sauvegardes et au thème ; Marché préparatoire avec recherche dans les vrais doublons, sans transactions simulées.
- Adaptation aux téléphones, navigation clavier, fenêtres accessibles et réduction des animations.
- Textes courants de 16 px, contrôles agrandis et grilles moins denses sur téléphone.
- Navigation supérieure persistante pendant le défilement.
- Thèmes clair et sombre : bouton Lune/Soleil dans l’en-tête, préférence conservée séparément de la collection. Sans choix explicite, le site suit le système.

Les adaptations de lisibilité et les couleurs sémantiques sont dans `src/appearance.css`, chargé après les styles des maquettes. `src/navigation.css`, chargé ensuite, définit les nouveaux écrans et le parcours intégré ; `src/frames.css` définit en dernier les cadres et les encres de rareté. Les reproductions des œuvres ne sont pas inversées en mode sombre. Si le stockage du navigateur est bloqué, le changement de thème reste utilisable pour la session.

## Atelier de validation de 1 000 œuvres

Ouvrir **`/review.html`** après `npm run dev` pour examiner les 100 œuvres actuelles et 900 nouvelles notices CC0. Chaque carte présente le score V2, la proposition, la confiance et un choix exclusif de rareté finale. Recherche, 12 familles, filtres, pagination et import/export JSON/CSV ; sauvegarde locale indépendante du jeu. **Toutes les propositions restent provisoires et aucun choix n’active une rareté.** [Guide, provenance et reproduction](catalog/review-1000/README.md).

## Limites de cette version

La progression est enregistrée **uniquement dans ce navigateur**. L’export est nécessaire pour la transférer ou la protéger contre l’effacement des données locales. Les comptes synchronisés, paiements, abonnements et échanges multijoueurs ne sont pas implémentés ni simulés.

Les paramètres sont **provisoires** : cinq cartes par nouvelle pochette, stock de dix, recharge toutes les dix minutes. Les taux par carte de la généraliste sont **fer 56,1 %, cuivre 25,5 %, argent 15 %, or 3 %, lapis-lazuli 0,4 %**. Une pochette thématique redistribue ces poids uniquement entre les niveaux présents dans son catalogue ; les taux exacts sont consultables avant ouverture. Tous les visiteurs ont les mêmes chances pour une pochette donnée, sans garantie de rareté. Les seuils de score éditorial restent 30/50/70/90, distincts des probabilités. Aucune œuvre n’est promue pour remplir un quota.

La source `src/catalog/seed.json` reste locale, sans base hébergée. Les **100 œuvres sont importées**, leurs 100 reproductions ont des droits revus avec preuves ; les raretés restent provisoires, aucune publication éditoriale n’est prétendue. Taouret appartient à l’Égypte et aux mythes, La Joconde à deux catalogues : 102 appartenances pour 100 œuvres uniques. L’Égypte contient 21 œuvres. Les quatre catalogues historiques restent compatibles avec les sauvegardes et deux nouveaux univers rejoignent les pochettes.

### Rarity Engine V2 — simulation indépendante

Le moteur **2.0.0** applique la nouvelle demande : **P/A/H/M/C pondérés 25/20/25/20/10**, seuils **40/60/75/90**, avec les noms MUSE conservés. Il propose des scores même lorsque les observations sont partielles, avec estimation contextualisée explicite, plages d’incertitude, confiance, stabilité et statuts `confirmed`/`provisional`. **Aucun résultat n’est activé dans l’application.**

Voir le [rapport V1/V2 des cent œuvres](catalog/rarity-v2/REPORT.md), les [résultats JSON](catalog/rarity-v2/results.json), le [CSV](catalog/rarity-v2/results.csv) et le [guide complet](catalog/rarity-v2/README.md). Commandes : `npm run rarity:v2:collect` (cache, hors réseau), `npm run rarity:v2:collect -- --live` (complément autorisé), `npm run rarity:v2` (calcul), `npm run rarity:v2:verify` (reproductibilité et entrées protégées).

Les percentiles nécessitent un futur référentiel externe représentatif : aucune normalisation naïve sur les seules cent cibles. La politique initiale reste provisoire et ses distributions non apprises sont déclarées. Smithsonian/Europeana ont des connecteurs avec clé, sans données exploitées ici ; Google Trends n’est pas intégré. Les estimations ne sont pas des mesures, un grand musée ne donne pas automatiquement M maximal et un anonyme ne reçoit pas zéro ni toute la célébrité de sa civilisation.

L’[ancien essai Internet](catalog/notoriety/REPORT.md), poids 30/25/20/15/10 et quatre scores complets, reste intact avec ses scripts (`npm run catalog:notoriety`, `python3 scripts/collect-notoriety.py`). Le document fourni `MUSE_systeme_rarete.md` reste historique ; la nouvelle demande gouverne Rarity Engine 2.0.0, sans modifier les cartes acquises, les probabilités ni le marché.

## Vérifier

```sh
npm test
npm run catalog:check
npm run catalog:images
npm run build
```

Les tests couvrent les cent œuvres, les droits structurés, les attributions nuancées, les gardes de publication, l’ancienne grille active et la simulation v2, les données de notoriété manquantes, les preuves d’audience, les appartenances multiples, les taux fractionnaires dont 0,4 %, les pochettes de cinq et anciennes sauvegardes de trois, la recharge, les doublons, les thèmes, la navigation, les cadres et leurs masques intérieurs. `catalog:images` contrôle les 100 fichiers décodés, leurs empreintes et leurs preuves. L’audit accepte `--json` et `--require-ready` ; le mode strict échoue encore pour les raretés provisoires, pas pour des droits non revus. Les anciens liens `#atelier` et `#revelation` reviennent aux pochettes sans tirage ; `#musee` rejoint la collection et son musée interne.

## Images et polices

Toutes les ressources nécessaires sont locales dans `public/assets/`. `public/assets/provenance.json` documente les sources : illustrations des maquettes, 80 reproductions CC0 de Cleveland, 19 images Open Access du Met identifiées comme domaine public et La Joconde déclarée PD-Art sur Commons. Les preuves datées par image sont dans `catalog/image-rights-review.json` et `catalog/evidence/`. La déclaration Commons comporte une réserve de juridiction ; ce contrôle ne constitue pas un avis juridique universel. Les polices Playfair Display, Inter et Space Grotesk sont auto-hébergées sous SIL Open Font License.

Les originaux `booster.png` et les cadres fournis par l’utilisateur restent intacts, sans licence précisée. Cinq cadres Arts décoratifs ont été générés à sa demande : Art nouveau, iris et ginkgo, dans les cinq matières. Sources, prompts réels et références sont conservés dans `output/imagegen/` et `catalog/decorative-frame-generation.json` ; provenance et XMP les distinguent des reproductions historiques, sans leur attribuer CC0. Les trente cadres valides ont des réductions transparentes 640×960 et des masques intérieurs séparés dans `public/assets/collections/display/`. Les cinq originaux Japon restent non activés : quatre sans alpha et un sans ouverture suffisante ; voir `src/frame-assets.report.json`.

### Ajouter un cadre ou une famille

Déposer les PNG transparents 1024×1536 dans `public/assets/collections/`, nommés `<famille>-fer.png`, `-cuivre.png`, `-argent.png`, `-dore.png` et `-lapis-lazuli.png`. Une variante absente garde un cadre simple de la matière correcte. Puis lancer :

```sh
npm run prepare:frames
```

Cette préparation s’exécute aussi avant dev, tests et compilation. Elle produit `src/frame-assets.json`, le rapport `src/frame-assets.report.json`, les copies d’affichage et les masques `*-matte.png`. Elle mesure une fenêtre rectangulaire sûre pour l’œuvre et suit séparément la région alpha <250 connectée au centre pour remplir les creux intérieurs, sans peindre les découpes extérieures. Le fond utilise `--mat` et une marge de 3 % dans la fenêtre ; l’œuvre reste en `object-fit: contain`. Une ouverture reliée au bord extérieur est refusée. Les sorties inchangées sont réutilisées. Un original inexploitable est signalé sans bloquer les cadres valides ni être modifié. Ne pas modifier le registre à la main.

Le catalogue utilise son identifiant comme famille de cadre, sauf s’il déclare `frameFamily` dans `src/catalog/seed.json`. `mythes` emploie `art-mysterieux`, `renaissance-italienne` emploie `beaux-arts`, `premiers-arts` emploie `prehistoire` et Arts décoratifs emploie `decoratifs`. `art-moderne` reste disponible pour l’avenir. Le rendu partagé est `src/FramedArtwork.tsx`, et `src/frames.ts` choisit la bonne variante. Une erreur de chargement revient au cadre simple avec fond neutre, sans masquer l’œuvre. Pour reconstruire les cinq nouveaux originaux depuis les sorties générées conservées : `node scripts/prepare-decorative-frames.mjs` (refuse un original existant inconnu ou modifié).

Pour le catalogue de cent œuvres, suivre les scripts de collecte/préparation/import du [guide](catalog/README.md). `scripts/fetch-assets.py` est l’ancien bootstrap des maquettes, polices et vingt reproductions : ne pas le relancer pour actualiser ce catalogue, il ne gère ni les quatre-vingts ajouts ni les preuves actuelles. Ne pas exécuter `crop-assets.mjs` à répétition sur les images déjà recadrées.

Les fichiers originaux des maquettes restent inchangés. `concept.md` consigne les règles du produit, dont les seuils de rareté choisis par l’utilisateur.
