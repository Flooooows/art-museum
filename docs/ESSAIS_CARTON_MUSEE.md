# Essais « carte-cadre » — carton musée

> Ce document conserve **l'essai 01**, avec douze cartes et un décor doré commun. Le laboratoire courant propose maintenant [l'essai 03 : bases neutres et affectations corrigées](ESSAIS_CADRES_NEUTRES.md). L’[essai 02](ESSAIS_CADRES_CATEGORIE_RARETE.md) est aussi conservé. Les aperçus ci-dessous restent ceux du premier essai pour comparaison ; les commandes ouvrent la version courante.

**Prototype local, non publié.** Le site en ligne reste dans sa version sans cadres. Aucun commit/push ni déploiement n'a été effectué pour ces essais.

## Aperçus

- [Comparer quatre formats](prototypes/carton-musee/comparaison-4-formats.png) : Nymphéas, Joconde, Grande Vague et sculpture.
- [Planche des douze cartes](prototypes/carton-musee/planche-12-cartes.png).
- [Nymphéas sur mobile](prototypes/carton-musee/nympheas-mobile.png).
- [Titre très long sur mobile](prototypes/carton-musee/titre-long-mobile.png).
- [Référence originale fournie](Carton%20musée%20des%20Nymphéas.png).

## Principe testé

Le cadre entoure **la carte entière**, pas uniquement la reproduction. Rareté, image, numéro, titre, artiste, type d'œuvre et favori sont tous placés dans le même panneau bordeaux, à l'intérieur du contour ornementé.

La bordure a été extraite de la référence utilisateur. Toute la zone contenant la peinture et les textes de l'exemple a été effacée, pixels RGBA remis à zéro. Il ne reste que le décor extérieur et une texture de velours sans texte. L'image, les libellés et les interactions sont de vrais éléments HTML indépendants ; chaque carte n'est pas une image aplatie.

La référence originale reste intacte. Les transformations et empreintes sont dans `src/card-lab/assets/provenance.json` ; aucune nouvelle licence n'est attribuée à cette référence.

Les reproductions sont affichées **entières et proportionnelles**, sans recadrage. Une peinture panoramique comme les Nymphéas occupe donc moins de hauteur qu'un portrait : les plages de velours varient selon le format réel de l'œuvre. Les textes longs prennent la place nécessaire dans la carte, sans ellipse ni titre coupé.

**Un seul décor doré est utilisé pour l'essai**, sur les cinq raretés réelles. Les finitions par rareté et les autres familles de cadres ne sont pas encore définies.

## Douze cartes réelles

| Carte | Cas testé |
| --- | --- |
| Nymphéas (Agapanthes) — `cma-136510` | Peinture horizontale et comparaison avec la référence |
| La Joconde — `mona-lisa` | Portrait vertical, titre court |
| La Grande Vague — `45434` | Estampe horizontale |
| Ganesha dansant — `cma-137128` | Sculpture verticale |
| La Licorne captive — `467642` | Tapisserie et détails fins |
| Winter Trees Reflected in a Pond — `cma-164940` | Photographie monochrome |
| Great Pagoda… — `cma-153706` | Photographie avec titre institutionnel de 161 caractères |
| A Procession of Triumphal Cars… — `cma-132644` | Dessin et titre très long |
| Red-Figure Calyx-Krater… — `cma-155665` | Céramique en volume |
| Front Cover for a Gospel Book… — `cma-129216` | Orfèvrerie et titre long |
| Sculptura in Aes… — `cma-324441` | Attribution à plusieurs intervenants |
| Monsieur Boileau at the Café — `cma-173263` | Dessin en couleurs |

Les niveaux proviennent des raretés humaines du catalogue actif. Le favori est interactif dans le laboratoire uniquement : aucune collection ni préférence du jeu n'est lue ou remplacée. La fiche ouverte au clic conserve artiste complet, musée, crédit et liens institutionnels/de réutilisation.

## Ouvrir le laboratoire

```sh
npm run card-lab:prepare
npm run dev:card-lab
```

Puis ouvrir http://127.0.0.1:4175/card-lab.html. La préparation est manuelle ; elle ne s'ajoute pas au démarrage, aux tests ou au build du jeu.

Version compilée indépendante :

```sh
npm run build:card-lab
npm run preview:card-lab -- --port 4176
```

Ouvrir http://127.0.0.1:4176/card-lab.html. Choisir le fond clair/sombre et le format confort/compact pour comparer. La sortie `dist-card-lab/` est distincte de `dist/` et ignorée par Git.

## Vérifications

- **145 tests unitaires réussis**, typage et builds du jeu et du laboratoire réussis.
- Le build du jeu conserve **exactement les 1 044 fichiers** de la version publiée, avec les mêmes empreintes. Le prototype n'est pas intégré au bundle du jeu.
- Navigateur : **12 cartes × 12 configurations**, à 320/390/1440 px, en confort/compact et sur fond clair/sombre. Contrôle des informations et caractères à l'intérieur du cadre, absence de troncature, images en `contain`, favoris, ouverture au clavier et retour du focus, stockage du jeu inchangé.
- La vérification porte sur le rendu réel du texte : un débordement métrique de police avec `overflow: visible` n'est pas confondu avec une troncature. Les rectangles des caractères restent dans le panneau utile.

Les captures et rapports de travail sont dans `/tmp/opencode/muse-card-lab/`. Les aperçus de cette documentation proviennent de captures du prototype réel, pas de cartes recréées ou de données inventées.

**À valider avant généralisation :** principe de carte-cadre, largeur du décor, respiration autour des formats horizontaux et taille de lecture en mode compact. Aucun remplacement de la collection, du musée ou des tirages du site n'a encore été effectué.
