# MUSE Lab — cartes, boosters et ouverture

Projet Firebase dédié demandé par l’utilisateur, nommé **muse-lab**. L’identifiant mondial `muse-lab` étant déjà pris, le projet créé porte l’identifiant **`muse-lab-6f2d`**.

## Accès

- [Accueil du laboratoire](https://muse-lab-6f2d.web.app/).
- [Cartes et cadres](https://muse-lab-6f2d.web.app/card-lab.html) : 21 exemples, 30 variantes dans les six familles validées ; les autres cartes restent visibles sans cadre. Paléolithique reste non affecté.
- [Sept boosters](https://muse-lab-6f2d.web.app/booster-lab.html) : une collection universelle et six regroupements spécialisés.
- [Ouverture](https://muse-lab-6f2d.web.app/opening-lab.html) : carte par carte ou planche, sélecteur de rareté maximale, ambiance lapis exceptionnelle, sept pochettes, trois rythmes et mouvements réduits.

Une navigation commune relie les trois essais et l’accueil. Les adresses sont relatives au site, sans dépendance à un serveur local.

**Promotion vers le jeu :** les éléments validés ont été copiés dans une version autonome, publiée sur le site principal le 2 novembre 2026 à 00:31:00 UTC (`545b73e7f226d778`). Le lab reste le lieu des prochains essais et conserve sa release `3b5f3172d4865a5a` ; ses futures modifications ne changent pas automatiquement le jeu. [Intégration et sauvegardes](INTEGRATION_LAB_2026-11-02.md).

## Isolation

Ce n’est **pas une deuxième collection jouable**. Les œuvres sont des entrées réelles du catalogue, mais les aperçus et les ouvertures sont des démonstrations fixes. Aucun stock consommé, acquisition, nouvelle rareté ou écriture dans les sauvegardes du jeu.

Le déploiement ne vise que Firebase Hosting sur le nouveau projet. Ni le projet du jeu `muse-collection-6f2d`, ni celui de l’atelier `art-museum-8fdd8` ne sont des cibles de cette commande. Aucune base de données, facturation, fonction ou synchronisation des comptes n’est mise en place.

Le lab est **accessible publiquement par son URL**, sans authentification. Les métadonnées `noindex,nofollow`, l’en-tête `X-Robots-Tag` et `robots.txt` demandent aux moteurs de ne pas l’indexer ; ce ne sont pas des mesures de contrôle d’accès.

## Construction et publication

```sh
npm run dev:lab
# http://127.0.0.1:4180/muse-lab.html

npm run build:lab
npm run preview:lab
# http://127.0.0.1:4181/

npm run deploy:lab
```

- `vite.muse-lab.config.ts` compile les quatre entrées dans **`dist-muse-lab/`**, indépendamment des builds du jeu et de l’atelier.
- `scripts/muse-lab/prepare-hosting.ts` copie uniquement les images publiques des 1 011 œuvres, deux polices et leurs licences, le favicon et les pages compilées. Il prépare l’accueil `/` et `robots.txt`.
- Le répertoire `public/` n’est pas copié intégralement : aucun fichier de revue, atelier, preuve juridique, master de génération ou identifiant de service n’est livré par ce préparateur.
- `firebase.lab.json` cible explicitement **`muse-lab-6f2d`**, pas le site du jeu.
- `catalog/muse-lab/hosting-manifest.json` conserve les chemins et empreintes exactes du build préparé.

Les préparateurs d’images restent manuels ; ils ne relancent aucune génération et ne sont pas des hooks du build du jeu.

## Guides des essais

- [Nettoyage : six familles validées uniquement](NETTOYAGE_CADRES_VALIDES.md) : état actuel ; suppression de toutes les versions non validées, cartes concernées sans cadre et avis conservés.
- [Frises figuratives par thème](ESSAIS_CADRES_FRISES_V7.md) : ancien essai ; les assets non validés ont depuis été supprimés.
- [Arts décoratifs comme référence de détail et de couleur](ESSAIS_CADRES_ARTS_DECORATIFS_V6.md) : essai précédent archivé, remplacé par les frises figuratives.
- [Profils sobres inspirés d’encadrements réels](ESSAIS_CADRES_MUSEAUX.md) : version publiée ; outils et objets décoratifs retirés, matériaux et passe-partout discrets, six familles validées inchangées.
- [Cadres refaits selon leurs thèmes](ESSAIS_CADRES_THEMATIQUES.md) : version publiée, treize langages de matière distincts au lieu d’un décor floral commun ; six familles validées inchangées. Pages et treize cadres lapis vérifiés en ligne.
- [Refonte prestige et lapis exceptionnel](ESSAIS_CADRES_PRESTIGE.md) : publiée sur le laboratoire, six familles préservées et treize refaites ; un seul commentaire global par catégorie. Parcours d’avis et treize nouveaux cadres lapis vérifiés en ligne.
- [Avis sur le style des cadres et leurs finitions](AVIS_CADRES.md) : publié sur le laboratoire le 2 novembre 2026. Conservation locale et export JSON à transmettre pour les améliorations. Votes, commentaires, rechargement, export/import et isolation du jeu vérifiés en ligne, ainsi que six configurations de largeur et de thème sans violation détectée par les règles axe examinées.
- [Cadres neutres et affectations corrigées](ESSAIS_CADRES_NEUTRES.md).
- [Rendu actuel : masques stricts et cadres homogènes](ESSAIS_CADRES_HOMOGENES.md).
- [Sept visuels de pochettes et regroupements](ESSAIS_BOOSTERS.md).
- [Ouverture une par une et ambiances par rareté](ESSAIS_OUVERTURE.md).

Les anciens guides et registres JSON restent des documents historiques. Les images des essais de cadres non validés ont été supprimées : leurs anciens liens peuvent donc ne plus être disponibles. Une mention historique « publié » ne décrit pas l’état actuel.

## Première publication et contrôles

Publié le **1er novembre 2026 à 18:43:45 UTC**, version Firebase Hosting **`eef884b836375ac6`**.

- Typage et **161 tests** réussis ; build commun indépendant réussi.
- Les **1 145 fichiers préparés** ont tous été téléchargés depuis le site et comparés à leurs empreintes locales : aucune différence.
- Accueil et trois espaces testés en ligne à 320, 390 et 1 440 px ; navigation commune et images décodées sans erreur.
- Cartes : 12 configurations clair/sombre et confort/compact, images entières et textes dans leur cadre ; nouvelle série Japon vérifiée.
- Boosters : sept pochettes et leurs sélections vérifiées dans huit configurations en ligne, sans modification du stockage du jeu.
- Ouverture : 18 parcours de démonstration, sept pochettes, révélation au clavier, cinq cartes, animations normales ou réduites, passage de l’animation et remise à zéro.
- Vérification automatique d’accessibilité sur 12 configurations : aucune violation détectée par axe dans les règles examinées ; ce n’est pas une certification d’accessibilité.
- Chemins de revue, anciens fichiers `assets/collections/` et masters de génération testés en **404**. Pages en `no-cache` et en-têtes anti-indexation présents.
- Le jeu principal conserve **exactement sa version et sa release** `d2169e93bdbfd2bf` avant et après cette publication.

Preuves de la première livraison : [publication et isolation du jeu](../catalog/muse-lab/publications/eef884b836375ac6.json), [vérification des parcours](prototypes/muse-lab/verification.json). [Accueil sur ordinateur](prototypes/muse-lab/accueil-ordinateur.png) et [sur mobile](prototypes/muse-lab/accueil-mobile.png).

## Mise à jour : révélation séquentielle et raretés

Publié le **1er novembre 2026 à 19:30:04 UTC**, version **`5d248620a959da51`** : carte par carte au clic, sélection du maximum réel et ambiance lapis exclusive aux lots contenant une pièce maîtresse. Le mode Planche est conservé.

Typage, **167 tests** et build réussis. Les 32 compositions manuelles valides ont été vérifiées dans trois largeurs (96 cas), ainsi que 20 parcours de révélation manuelle en ligne. Le mode automatique, le verrou de double-clic, l’interruption des transitions et le retour du focus passent 30 configurations supplémentaires en développement. L’audit automatique d’accessibilité ne détecte aucune violation dans 22 états examinés.

Les **1 145 fichiers en ligne** correspondent au build. Le jeu conserve sa version et sa release `d2169e93bdbfd2bf`. [Publication courante](../catalog/muse-lab/publication.json) · [Manifest courant](../catalog/muse-lab/hosting-manifest.json) · [Guide et aperçus de l’ouverture](ESSAIS_OUVERTURE.md).

## Mise à jour : cadres détaillés et homogènes

Publié le **1er novembre 2026 à 23:45:30 UTC**, version **`3b5f3172d4865a5a`** : anciens masques corrigés sans découpe du métal, douze nouveaux masters détaillés, 95 variantes natives en WebP sans perte et bandeau de rareté ancré au même niveau, avant le type et le favori. Les titres, artistes et images restent complets.

Typage, **169 tests** et build commun réussis. Les parcours navigateur passent 16 configurations en développement et 16 sur le build (320, 390, 768 et 1 440 px ; confort/compact, clair/sombre), puis huit configurations en ligne. Les 95 variantes du nuancier ont été parcourues. Aucune violation automatique d’accessibilité détectée dans les 12 configurations examinées ; ce contrôle n’est pas une certification.

Les **1 140 fichiers publiés** sont vérifiés de façon incrémentale : téléchargement et SHA-256 pour les fichiers nouveaux ou modifiés, comparaison au manifest précédemment vérifié et contrôle HTTP pour les fichiers inchangés. Le jeu garde exactement sa version et sa release `d2169e93bdbfd2bf`. Les sauvegardes et les raretés ne changent pas.

[Guide et aperçus des cadres](ESSAIS_CADRES_HOMOGENES.md) · [Rapport de vérification](prototypes/cadres-homogenes/verification.json) · [Publication](../catalog/muse-lab/publications/3b5f3172d4865a5a.json).
