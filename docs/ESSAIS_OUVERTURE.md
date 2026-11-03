# Essais d’ouverture des pochettes

[Ouvrir le lab d’ouverture](https://muse-lab-6f2d.web.app/opening-lab.html), sur le [projet MUSE Lab](MUSE_LAB.md) séparé du jeu. En local : `npm run dev:lab`, puis <http://127.0.0.1:4180/opening-lab.html>.

Cette page est publiée uniquement dans le build du laboratoire, jamais dans celui du jeu. Elle ne lit ni n’écrit la sauvegarde de collection et ne consomme aucun stock. Les cinq œuvres présentées sont des exemples fixes, pas un tirage ou une promesse de probabilités.

## À essayer

- Ouvrir : léger flottement, tension, séparation du haut de la pochette, lumière, apparition des cartes.
- **Une par une**, mode initial : chaque clic sur le bouton ou l’image de la carte fait entrer et retourner la suivante en grand. Progression bornée à cinq ; les clics pendant une transition ne sautent pas de carte.
- **Planche** conserve la comparaison précédente, avec choix individuel ou « Tout révéler ». Les textes défilants des cartes révélées sont accessibles au clavier.
- **Rareté maximale du lot** : automatique, ou chacune des cinq raretés. Un choix manuel compose cinq œuvres réelles de la sélection ; la dernière possède la rareté choisie, les quatre premières restent inférieures quand le catalogue le permet. Les raretés humaines ne sont jamais modifiées.
- Les cinq choix sont disponibles dans **Collection universelle**. Une rareté inexistante dans une sélection est grisée : aucune pièce maîtresse n’est inventée dans les photographies, Matières & objets ou Textiles & intérieur. Passer vers une sélection incompatible remet le choix sur « Automatique ».
- Comparer les sept pochettes, les ambiances Muséale / Éclat lumineux et les trois rythmes.
- Rejouer, passer l’animation en cours ou activer les mouvements réduits (préférence système prise en compte au chargement).
- Vérifier sur mobile : carte unique en grand dans le nouveau mode ; plusieurs cartes sur deux lignes en mode Planche.

## Une ambiance qui suit réellement le maximum

`src/opening-lab/rules.ts` calcule le maximum des cinq œuvres. L’ambiance ne dépend ni du nom ni de la couleur de famille du booster : **fer, cuivre, argent, or, lapis-lazuli**. La pochette conserve son identité graphique.

La pièce maîtresse a une mise en scène exclusive, et pas seulement une autre teinte : halo et couronne lapis, rayons en rotation lente, constellations, reflets mobiles sur le sachet et anticipation supplémentaire à l’ouverture. La carte pièce maîtresse reçoit aussi un éclat lumineux à son retournement. Ces effets ne sont pas appliqués aux cartes ordinaires du lot.

En mouvements réduits, les couleurs et ornements statiques restent visibles, mais les rotations, flottements, reflets animés et retournements en mouvement sont supprimés. Aucun son ni clignotement rapide.

GSAP orchestre l’ouverture et la révélation séquentielle ; CSS conserve le retournement de la planche. Les illustrations existantes sont réutilisées, sans nouvelle génération d’images. Changer un réglage remet la scène à zéro et annule les animations précédentes.

## Vérifications et aperçus

- [Comparer les cinq ambiances](prototypes/ouverture-sequentielle/cinq-ambiances.png).
- [Pochette et ambiance lapis sur mobile](prototypes/ouverture-sequentielle/lapis-booster-mobile.png).
- [Dernière carte pièce maîtresse](prototypes/ouverture-sequentielle/finale-lapis-mobile.png).
- [Rapport de vérification](prototypes/ouverture-sequentielle/verification.json).

Les tests couvrent les maxima réels, les 32 compositions possibles parmi les sept pochettes, les sélections indisponibles et la progression bornée. Les parcours navigateur vérifient clic, clavier, verrou anti-double-clic, retour du focus, interruption d’une animation, deux modes, images entières et absence d’écriture dans les sauvegardes.

L’intégration au véritable tirage reste une étape ultérieure : l’acquisition devra rester immédiate et indépendante de la fin de l’animation, pour préserver la sauvegarde même si l’utilisateur ferme la fenêtre.
