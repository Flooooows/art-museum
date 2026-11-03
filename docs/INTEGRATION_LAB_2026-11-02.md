# Du laboratoire au jeu — cartes, pochettes et ouverture

L’intégration demandée reprend la présentation validée sur MUSE Lab `3b5f3172d4865a5a` dans le [jeu principal](https://muse-collection-6f2d.web.app), sans relier le jeu aux futurs essais.

**Ouverture simplifiée depuis l’intégration initiale :** le jeu utilise uniquement le rythme rapide et la découverte une par une. Les sélecteurs de présentation, d’ambiance et de rythme ainsi que l’option d’ouverture immédiate sont retirés. Un bouton **Tout révéler** se trouve juste sous les cartes ; il dévoile le lot déjà acquis sans consommer une nouvelle pochette. Les mouvements réduits suivent automatiquement la préférence du navigateur. Le lab garde ses réglages d’essai.

**Format compact :** la collection et l’ouverture utilisent maintenant la même carte réduite, avec un gabarit intérieur conservé pour ne pas couper les textes. Le récapitulatif d’un booster garde les cinq cartes sur **une seule ligne** : elles tiennent ensemble sur grand écran et défilent horizontalement sur les écrans étroits. Le favori de la collection conserve une cible de 44 px. Les cartes, leur contenu et la pagination ne changent pas.

**Thème du jeu :** seule l’interface sombre bordeaux est proposée. Elle est fixée dès le HTML, avant React et même sans JavaScript ; les préférences claires locales ou système sont ignorées. Les boutons de thème de l’en-tête et du profil sont retirés. Le lab et les revues de l’atelier conservent leurs propres réglages.

## Ce qui est intégré

- **Cartes** : cadres détaillés natifs 1024×1536, masques stricts conservant le métal, œuvres entières, titres et artistes complets, gabarit commun et bandeau de rareté aligné. Les 90 variantes affectables sont copiées ; les cinq Paléolithique non affectées restent uniquement dans les archives et le lab.
- **Pochettes** : les sept visuels validés, avec une universelle et six sélections complémentaires couvrant les 1 011 œuvres. Les douze types et les quatre thèmes restent les filtres du catalogue ; les anciens identifiants de pochettes restent lisibles dans les sauvegardes.
- **Ouverture initialement intégrée** : ouverture du sceau, particules, retournement et passage d’une carte à la suivante, modes Une par une et Planche, rythmes, deux ambiances, passage de l’animation, ouverture immédiate et mouvements réduits. Les réglages ont ensuite été simplifiés comme indiqué ci-dessus. Le lapis et les effets exceptionnels dépendent toujours du maximum **réel** du tirage.

Le sélecteur de rareté du lot et les lots fixes du lab **ne sont pas intégrés au jeu**. Les tirages gardent cinq cartes aléatoires, les probabilités de base et leur renormalisation sur les raretés réellement présentes dans la sélection ; aucun niveau minimum n’est garanti. Les rares œuvres longues peuvent réserver plus de place au texte, sans découper la reproduction.

## Sauvegardes et acquisitions

La clé `muse-collection-v1` et la version 1 ne changent pas. Aucun reset ni migration de l’inventaire : identifiants, exemplaires, favoris, musée, stock et recharge restent conservés. Les anciennes ouvertures de trois cartes peuvent être reprises.

Le clic d’ouverture effectue **un seul tirage**, consomme une pochette et inscrit les acquisitions avant l’animation. Passer l’animation, changer la présentation, révéler une carte, fermer ou recharger la page ne redonne pas de cartes et ne consomme pas de pochette supplémentaire. Le dernier tirage peut être repris depuis l’accueil. Les doublons sont affichés séparément même lorsqu’une œuvre revient plusieurs fois dans le même lot.

## Des prochains essais vraiment indépendants

`src/game-presentation/` est une **copie figée** des éléments validés, adaptée aux acquisitions réelles. Elle n’importe rien depuis `card-lab`, `booster-lab`, `opening-lab` ou `muse-lab`. Les sources du lab et leurs premiers masters restent inchangés et disponibles pour les prochains essais.

- Modifier et publier le lab : `npm run dev:lab`, `npm run build:lab`, `npm run deploy:lab`.
- Modifier le jeu : `npm run dev`, `npm run build`, `npm run deploy:muse`.
- Une nouvelle promotion du lab vers le jeu reste une opération explicite, avec vérification des différences et des sauvegardes ; aucun hook ne recopie automatiquement le lab au build.

Le build principal compile seulement `index.html`. `scripts/game-presentation/prepare-hosting.ts` ajoute une liste autorisée d’images et de polices. Les pages de revue, les masters, les dossiers privés et les pages du lab ne sont pas livrés avec le jeu. Les anciens `assets/collections/**` restent exclus : le jeu utilise la copie des dérivés validés, pas les archives.

## Vérifier

```sh
npm run check
npm run build
```

La suite `src/game-presentation.test.ts` couvre les sélections, probabilités, acquisitions, sauvegardes, cadres et l’indépendance du lab. Les anciens octets protégés de `collection.ts` sont conservés dans `catalog/history/pre-lab-integration/`, sans remplacer les empreintes originales.

Les parcours navigateur maintenus sont dans `scripts/game-presentation/browser.mjs` et `browser-cards.mjs`. Installer Playwright localement ou définir `PLAYWRIGHT_MODULE` et `MUSE_CHROMIUM` vers une installation existante, démarrer Vite sur 4182, puis :

```sh
npx tsx scripts/game-presentation/fixtures.ts
node scripts/game-presentation/browser.mjs
node scripts/game-presentation/browser-cards.mjs
```

`MUSE_ORIGIN` et `MUSE_LABEL` permettent de rejouer les parcours sur le preview compilé ou le site. Le banc des 1 011 cartes (`tests/browser/game-presentation.html`) n’est servi qu’en développement, jamais publié. Les tests utilisent des contextes navigateur isolés et ne touchent pas aux sauvegardes personnelles.

Les versions, empreintes et résultats de livraison sont conservés dans `catalog/game-presentation/` et les aperçus dans `docs/prototypes/integration-jeu/`.

## Publication

Déployé le **2 novembre 2026 à 00:31:00 UTC**, version Firebase Hosting **`545b73e7f226d778`**, en remplacement de `d2169e93bdbfd2bf`. Le lab garde exactement sa release `3b5f3172d4865a5a` ; aucun déploiement du lab ou de l’atelier n’a été effectué pour cette intégration.

Typage, **176 tests**, audits du catalogue, des images, des droits, de la livraison et du classement réussis. Les 1 011 cartes restent dans leur cadre dans cinq largeurs de carte, soit **5 055 compositions** vérifiées. Les parcours passent dix configurations en développement et onze sur le build compilé, incluant les deux thèmes, quatre largeurs d’écran, les sept pochettes, les animations GSAP, la reprise après rechargement et les anciennes révélations dans le désordre.

Les **sept configurations en ligne** passent également, sans erreur JavaScript. Les **1 136 fichiers publiés** ont tous été téléchargés et comparés au build par SHA-256 : aucune différence. Les pages du lab et de l’atelier, les anciens PNG et le banc de test renvoient bien 404 sur le jeu. L’audit automatique d’accessibilité ne détecte aucune violation dans les **80 états examinés** au total (développement, build et site) ; ce n’est pas une certification.

[Sept pochettes sur ordinateur](prototypes/integration-jeu/pochettes-ordinateur.png) · [Collection sur mobile](prototypes/integration-jeu/collection-mobile.png) · [Ouverture sur mobile sombre](prototypes/integration-jeu/ouverture-mobile-sombre.png).

[Publication et empreintes](../catalog/game-presentation/publication.json) · [Snapshot indépendant du lab](../catalog/game-presentation/snapshot.json) · [Vérification et captures](prototypes/integration-jeu/verification.json).

## Mise à jour : ouverture rapide et épurée

Publiée le **2 novembre 2026 à 20:34:46 UTC**, version **`b256155a8d780c8e`** : rythme rapide fixé à 1,6×, découverte une par une et bouton **Tout révéler** dans la barre immédiatement sous les cartes. Les sélecteurs et les cases de réglage sont retirés ; les mouvements réduits suivent le système. Tout révéler affiche ensemble les cartes du tirage existant, sans acquisition supplémentaire.

Les 177 tests passent. Le lab, les œuvres, les raretés et les sauvegardes sont conservés. [Publication](../catalog/game-presentation/publications/b256155a8d780c8e.json) · [Vérifications et aperçus de cette mise à jour](prototypes/ouverture-rapide/verification.json).

## Mise à jour : cartes compactes et booster sur une ligne

Publiée le **2 novembre 2026 à 20:54:28 UTC**, version **`adae71ece203ed57`**. La collection et les cartes d’ouverture utilisent le même rendu compact, entre 200 et 260 px. Le gabarit de référence de 320 px est réduit ensemble, sans ellipse ni recadrage ; les cibles des favoris restent de 44 px.

Le récapitulatif du booster ne revient plus à la ligne : les cinq cartes tiennent ensemble à 1 440 px, et un défilement horizontal garde les cinq accessibles sur téléphone ou écran étroit, y compris au clavier. La collection garde ses filtres et sa pagination, dans une grille plus dense. Le rythme rapide et le bouton Tout révéler restent inchangés.

Les **178 tests** et les **4 044 compositions** des 1 011 cartes aux largeurs 200, 220, 240 et 260 px passent. Les 1 136 fichiers publiés correspondent au build par SHA-256. Le lab et les données du catalogue restent inchangés. [Publication](../catalog/game-presentation/publications/adae71ece203ed57.json) · [Vérifications et aperçus](prototypes/cartes-compactes/verification.json).

## Mise à jour : sombre uniquement

Publiée le **2 novembre 2026 à 21:23:31 UTC**, version **`2b882c1d138f52bb`**. Le sombre est fixé dans le HTML et la palette du jeu ; aucun sélecteur ne reste dans l’en-tête ou le profil. Une ancienne préférence `muse-theme=light`, un système clair et l’absence de JavaScript ne réactivent pas le clair. L’ancienne préférence locale est simplement ignorée, sans effacer de données.

Typage, **186 tests**, build et vérification SHA-256 des **1 136 fichiers** réussis. Les composants de thème partagés restent disponibles pour l’atelier ; le lab conserve exactement sa release présente avant cette livraison (`1a04421ac1f0dc9f`). [Publication](../catalog/game-presentation/publications/2b882c1d138f52bb.json) · [Vérifications et aperçus](prototypes/theme-sombre/verification.json).
