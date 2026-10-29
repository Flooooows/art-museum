# MUSE — Un musée à collectionner

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + TypeScript, avec Vite, approuvé par l’utilisateur. Première version invitée avec sauvegarde dans le navigateur, également approuvée. Aucun service de comptes, de paiement ou de synchronisation n’est fourni.

## Users

Personnes aimant collectionner des cartes, sans prérequis en histoire de l’art. Utilisation sur ordinateur et téléphone.

## Product Purpose

Ouvrir des pochettes, découvrir l’histoire d’œuvres et d’objets, compléter des catalogues et exposer ses acquisitions dans son musée personnel.

## Capabilities and Constraints

Le fonctionnement de référence est `concept.md`. Les quatre écrans fournis sont la référence visuelle. Les niveaux de rareté sont Esquisse, Étude, Composition, Œuvre et Pièce maîtresse. Les probabilités sont les mêmes pour tous. La rareté des œuvres et les paramètres de distribution de cette démonstration sont provisoires : le processus de validation éditoriale décrit dans le concept reste à conduire. Ne pas ajouter de blockchain, de prix spéculatifs ou de faux échanges entre joueurs.

À la demande de l’utilisateur, l’organisation évolue vers quatre onglets : **Pochettes / Marché / Collection / Profil**. L’accueil se concentre sur le choix des pochettes, avec la généraliste tous styles en premier, sans les blocs promotionnels répétés. Ouverture et révélation appartiennent à un seul parcours depuis cet accueil, et non à des pages de navigation. Le marché affiche seulement les vrais doublons locaux avec un statut d’échanges à venir, périmètre confirmé par l’utilisateur ; aucun compte ni service transactionnel n’est ajouté. Profil centralise progression, préférences, musée et sauvegardes.

Les nouvelles pochettes contiennent **cinq cartes**. Les résultats historiques de trois restent lisibles et inchangés, sans ajout rétroactif. Le catalogue local compte maintenant **cent œuvres** : les vingt fiches historiques conservées et quatre-vingts ajouts français sourcés. Les cent reproductions ont des preuves de droits vérifiées (Cleveland CC0, Met Open Access/domaine public et déclaration PD-Art pour La Joconde), avec réserve juridique explicite pour les différences de juridiction. Six pochettes thématiques sont disponibles ; les appartenances multiples ne doublent pas l’inventaire. Les fiches restent de démonstration et les raretés provisoires : aucune validation de notoriété n’est inventée. La source structurée ne constitue pas une base hébergée et la référence active d’évaluation empêche un nouveau brouillon de changer silencieusement une carte.

Taux généralistes par carte demandés : argent 15 %, or 3 %, lapis-lazuli 0,4 %. Le reste conserve la proportion fer/cuivre précédente : **56,1 % / 25,5 %**. Les thèmes renormalisent ces poids entre les niveaux présents. La grille historique active utilise les seuils 30/50/70/90, distincts des probabilités.

La nouvelle demande Rarity Engine V2 gouverne le moteur indépendant **2.0.0** : cinq entrées sur 100, **P/A/H/M/C pondérés 25/20/25/20/10**, seuils configurables **40/60/75/90**, noms MUSE conservés. Il propose des estimations contextualisées et traçables quand les observations manquent, avec plages de plausibilité, confiance distincte et statuts `confirmed`/`provisional`. Les distributions initiales et la normalisation restent provisoires tant qu’un référentiel externe fiable manque. Les objets anonymes sont évalués par contexte précis, jamais par zéro ou renommée entière de civilisation. Rapport : `catalog/rarity-v2/REPORT.md` ; méthode et limites : `catalog/rarity-v2/README.md`.

L’ancienne grille active et l’essai Internet à quatre scores complets (`catalog/notoriety`, poids 30/25/20/15/10 issus de `MUSE_systeme_rarete.md`) sont conservés. Aucune migration de catalogue, carte acquise, prix, marché ou probabilité : elle nécessitera une validation explicite. Les sources effectivement exploitées et les critères observés/dérivés/estimés sont distingués ; avoir cent propositions ne signifie pas cent classements confirmés.

### Atelier de validation indépendant

L’utilisateur a confirmé un mini-site séparé de 1 000 œuvres au total : les 100 actuelles et 900 nouvelles. `/review.html` affiche les scores et propositions V2 sous les reproductions, avec un seul choix humain de rareté finale, filtres, progression et export/import. Les décisions sont locales au navigateur, dans un stockage distinct du jeu. Les nouvelles familles appartiennent à l’atelier, pas aux pochettes actives. Aucun choix n’est précoché ni activé automatiquement. Les scores historiques sont conservés ; les nouvelles notices sont CC0 de Cleveland, avec estimations et limites explicites. Aucun backend ou déploiement supplémentaire n’est inclus.

## Brand Commitments

Nom MUSE issu des maquettes. Reproduire la direction visuelle des fichiers dans `stitch_booster_pack_opening_platform/`, en adaptant les textes aux règles du concept.

Conserver les textes lisibles, les thèmes ivoire et bordeaux profond et l’image `booster.png` fournie par l’utilisateur. Kyara sert de référence pour la séparation des usages des onglets, pas pour remplacer le graphisme MUSE. La structure simplifiée demandée prime sur les anciennes compositions d’accueil et pages d’ouverture.

Les cadres transparents fournis dans `public/assets/collections` habillent les cartes selon leur famille et leur rareté. L’utilisateur a confirmé le maintien des noms éditoriaux ; les matières suivent fer, cuivre, argent, or puis lapis-lazuli. Les originaux et les reproductions restent intacts. Préparer l’ajout progressif de cadres et de familles, sans attribuer un cadre historique incorrect ni inventer des œuvres pour remplir les familles encore absentes.

L’utilisateur a autorisé la génération des cinq cadres Arts décoratifs, réalisés dans une famille Art nouveau à iris et ginkgo. Il a ensuite choisi explicitement un **passe-partout papier neutre** pour combler les écarts de proportions : ivoire en clair, brun-bordeaux en sombre. Le fond suit l’ouverture intérieure réelle de chaque cadre, avec une petite marge autour de l’œuvre entière, sans recadrage, étirement des motifs ni couleur calculée depuis la reproduction. Provenance des cadres générés distincte des droits des œuvres ; aucune rareté n’est modifiée pour utiliser une finition.

## Evidence on Hand

`concept.md`, quatre maquettes HTML et PNG, et `stitch_booster_pack_opening_platform/classical_editorial_gilded_tactile/DESIGN.md`. Les comptes, paiements, abonnements, bourse et échanges nécessitent un futur backend ; ne pas les présenter comme opérationnels.

## Product Principles

Entrer sans inscription. Faire découvrir avant de monétiser. Préserver la reproduction entière dans les fiches. Rendre l’histoire accessible au toucher et au clavier. Expliquer les limites de la sauvegarde locale.

## Accessibility & Inclusion

À la demande de l’utilisateur, la lisibilité prime sur les microtextes des maquettes initiales. La navigation doit rester disponible pendant le défilement. Un thème sombre cohérent avec l’identité et un thème clair sont proposés, sans modifier les couleurs des reproductions.
