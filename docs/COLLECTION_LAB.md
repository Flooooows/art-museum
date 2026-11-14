# La Collection — expérience Lab

Refonte indépendante du **10 novembre 2026**, sans remplacement de la Collection du jeu. Initialement vérifiée localement, elle est désormais **publiée sur Firebase Lab uniquement**, à la demande de l’utilisateur.

## Consulter

[Ouvrir la Collection sur le Lab](https://muse-lab-6f2d.web.app/collection-lab.html).

```sh
npm run dev:lab
# http://127.0.0.1:4180/collection-lab.html

# Ou depuis le build isolé :
npm run build:lab
npm run preview:lab
# http://127.0.0.1:4181/collection-lab.html
```

Le portail et la navigation du Lab proposent désormais **Collection**, à côté des trois essais existants. Le serveur de vérification de cette intervention utilise le port **4184**.

## Parti pris UX/UI

Une galerie ouverte, plutôt qu’un tableau de bord : papier ivoire, accents bordeaux, titres éditoriaux Playfair, commandes Inter, images entières sans cadre ajouté. L’identité du Lab est conservée, pas les styles de production.

| Ancienne interface                                                                           | Nouvelle expérience                                                                                           |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Colonne permanente avec catalogues illustrés et progression                                  | Colonne supprimée ; les 12 types réels deviennent une navigation horizontale défilante, utilisable au clavier |
| Thèmes et nombreuses options visibles simultanément                                          | Quatre thèmes et cinq niveaux de rareté dans un panneau temporaire « Filtres »                                |
| Familles en parallèle des types                                                              | Pas de deuxième classification concurrente dans l’exploration ; types et thèmes suffisent ici                 |
| Statistiques de complétion, doubles, dernière pochette, inventaire, favoris, musée personnel | Retirés de cette galerie de découverte en lecture seule ; aucune imitation de compte ou d’acquisition         |
| Recherche et tri entourés de nombreux outils                                                 | Une recherche unique, quatre tris explicites et des filtres actifs retirables individuellement                |
| Six cartes par page                                                                          | Galerie de 24 œuvres, chargement de 24 supplémentaires à la demande, sans défilement infini imposé            |
| Métadonnées et rareté sur les cartes                                                         | Type, titre et artiste seulement ; toutes les informations utiles à l’ouverture                               |

La recherche ignore les accents et la casse, accepte plusieurs mots et explore titre, artiste, date, technique, origine, récits, identifiant et catalogues. Les appartenances et raretés sont celles de `src/data.ts`. Le tri « Parcours MUSE » conserve l’ordre réel des données ; les autres tris portent sur titre, artiste et rareté décroissante.

### Simplification du 15 novembre 2026

Après revue de lisibilité, la fenêtre « Filtres » (brouillon, Appliquer, Annuler) et les étiquettes de filtres actifs sont retirées. Tout est visible et s’applique immédiatement :

- **Recherche** pleine largeur, avec bouton d’effacement.
- **Types** en pastilles avec leur nombre d’œuvres : elles passent à la ligne sur ordinateur (plus aucun type caché) et forment une rangée défilante sur téléphone. Un type sans résultat pour les autres filtres est désactivé.
- **Thème**, **Rareté** et **Trier par** : trois menus étiquetés côte à côte, chaque option indiquant son nombre d’œuvres compte tenu des autres filtres (`facetCounts` dans `exploration.ts`).
- **Effacer les filtres** à côté du nombre de résultats dès qu’un filtre est actif.
- Cartes : la rareté (pastille de couleur et nom) précède le type ; textes agrandis (12–13 px au lieu de 9–11 px) et marge des images réduite.

La logique de recherche, de filtres et de tris est inchangée ; le jeu principal n’est pas modifié.

## Consultation et accessibilité

- Fenêtre immersive : image entière sur fond sombre, titre et informations de conservation, puis histoire et crédits dépliables.
- Navigation précédente/suivante dans **tous les résultats filtrés**, y compris les œuvres non encore affichées dans la grille ; limites explicites, pas de boucle inattendue.
- Échap et retour à la galerie ; flèches gauche/droite pour changer d’œuvre ; focus contenu dans les fenêtres et restitué à leur déclencheur.
- Desktop : quatre colonnes ; tablette : trois ; mobile : deux, commandes adaptées et fiche plein écran avec défilement vertical.
- Recherche étiquetée, commandes natives, état des catégories annoncé, résultats dynamiques annoncés, raccourci d’accès à la galerie, focus visible et mouvements réduits.
- Images : emplacement réservé pendant le chargement, message d’erreur sans bloquer la fiche, réessai dans la vue immersive. État vide avec réinitialisation et écran de repli si le rendu de la galerie échoue.

## Fichiers

Créés :

- `collection-lab.html` : entrée séparée et non indexable.
- `src/collection-lab/CollectionLab.tsx` : exploration et galerie.
- `src/collection-lab/exploration.ts` : recherche, filtres et tris sans mutation.
- ~~`src/collection-lab/FilterPanel.tsx`~~ : retiré le 15 novembre 2026, filtres désormais dans `CollectionLab.tsx`.
- `src/collection-lab/ArtworkViewer.tsx` : consultation et navigation.
- `src/collection-lab/ArtworkImage.tsx` : images, chargement et erreurs.
- `src/collection-lab/Modal.tsx` : fenêtres accessibles indépendantes du jeu.
- `src/collection-lab/main.tsx`, `styles.css` : montage, repli et styles propres.
- `src/collection-lab.test.ts`, `scripts/collection-lab/smoke.mjs` : tests ciblés.

Adaptés, dans le Lab uniquement :

- `src/muse-lab/LabNavigation.tsx`, `navigation.css`, `main.tsx`, `styles.css` : accès à la galerie, quatrième essai et navigation mobile sans débordement.
- `vite.muse-lab.config.ts` : cinquième entrée MPA vers `dist-muse-lab/`.
- `scripts/muse-lab/prepare-hosting.ts` : description du périmètre ; liste autorisée des ressources inchangée.
- `src/muse-lab.test.ts` : entrée supplémentaire et isolation.
- `catalog/muse-lab/hosting-manifest.json` : régénéré par le build **local**, ne constitue pas une publication Firebase.

`src/Collection.tsx`, les composants/styles/routes du jeu, ses données, ses configurations de build et d’hébergement ne sont pas modifiés par cette refonte. Aucun accès au stockage du jeu, même en lecture. Aucune dépendance ajoutée, image générée ou sauvegarde migrée.

## Vérifications reproductibles

```sh
npm run typecheck
npx tsx --test src/collection-lab.test.ts src/muse-lab.test.ts
npm run build:lab

# Playwright fourni par l’environnement de test ; navigateur préinstallé.
# Facultatif : PLAYWRIGHT_MODULE et CHROMIUM_EXECUTABLE pour leurs chemins.
MUSE_LAB_ORIGIN=http://127.0.0.1:4184 npx tsx scripts/collection-lab/smoke.mjs
```

Le parcours navigateur couvre ordinateur (1440 px), tablette (834 px) et mobile tactile (390 px) : recherche, résultat vide, types, application/annulation/retrait des filtres, trois tris supplémentaires, fiche, navigation, clavier, focus, pagination progressive et absence d’accès au stockage. Les chargements, échecs d’image et réessais sont simulés séparément. Des contrôles axe ciblent la galerie, la fiche et le panneau mobile ; ils ne constituent pas une certification.

Les empreintes SHA-256 des **365 fichiers préexistants du jeu et des données** ont été capturées avant la refonte pour comparaison à la fin. Les changements Git antérieurs à cette tâche sont conservés.

### Résultats

- Typage et build Lab réussis ; **9 tests ciblés sur 9** passent.
- Les trois parcours responsive passent, ainsi que chargement/erreur/réessai et le titre réel le plus long à 320 px.
- Aucune erreur JavaScript ni violation axe dans les trois états contrôlés (galerie desktop, fiche desktop, filtres mobile).
- **365 empreintes identiques avant/après** ; la page d’entrée du jeu en ligne répond en 200 et correspond toujours au manifest publié `e84e6c22e06f0a3b`.
- Aucun accès aux stockages pendant les parcours ; la valeur témoin de sauvegarde est intacte. Aucun déploiement lors de l’implémentation initiale ; publication Lab séparée ci-dessous.
- Le build signale le poids du chunk de données partagé (> 500 kB), sans erreur ; cette intervention ne restructure pas les données communes.

[Rapport et preuve d’isolation](prototypes/collection-lab/verification.json) · [Galerie desktop](prototypes/collection-lab/desktop.png) · [Tablette](prototypes/collection-lab/tablet.png) · [Mobile](prototypes/collection-lab/mobile.png) · [Fiche immersive](prototypes/collection-lab/desktop-viewer.png) · [Filtres mobile](prototypes/collection-lab/mobile-filters.png).

## Publication Firebase Lab

Publié le **10 novembre 2026 à 15:10:06 UTC**, version **`79ec6097f6f3fbaa`**, sur le projet **`muse-lab-6f2d`** avec `firebase.lab.json` uniquement.

Build et neuf tests ciblés réussis. En ligne : recherche, filtres, tri, consultation et images vérifiés à 1440 et 390 px, sans erreur JavaScript ni débordement horizontal. Douze fichiers (page, dépendances directes et entrées du portail) correspondent au build par SHA-256 ; les quatre essais répondent en 200 avec les en-têtes anti-indexation et `no-cache`.

Le jeu principal conserve **la même release `e84e6c22e06f0a3b` avant/après**, et les 365 fichiers protégés sont inchangés. Aucun déploiement du jeu ni de l’atelier.

[Publication et contrôles en ligne](prototypes/collection-lab/publication.json).
