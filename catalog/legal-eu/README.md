# Dossiers juridiques UE

Ce dossier complète les données éditoriales historiques sans les réécrire. Voir [les règles, les limites et les commandes](../../docs/DROITS_UE.md).

## Résultat initial — 30 octobre 2026

| Revue | AUTO_APPROVED_EU | REVIEW_REQUIRED | BLOCKED |
| --- | ---: | ---: | ---: |
| 1 000 œuvres | 261 | 736 | 3 |
| Premier lot : 25 cartes et 39 notices de recherche | 0 | 62 | 2 |
| 78 nouvelles candidates | 14 | 64 | 0 |
| **Total de dossiers** | **275** | **862** | **5** |

Les dossiers complémentaires comprennent notamment des auteurs anonymes, plusieurs contributeurs, des dates incertaines ou des preuves manquantes de publication/conditions. Une ancienne mention `cleared` n'est pas convertie sans contrôle en admissibilité dans toute l'UE.

Parmi les cas bloqués figurent des œuvres d'Edward Hopper et de Picasso : une mise à disposition du fichier en CC0 aux États-Unis ne suffit pas à établir les droits de l'œuvre dans l'UE.

## Conservation

- `sources/` conserve les textes et politiques effectivement reçus, avec leurs métadonnées et empreintes.
- `runs/<sha256>/` conserve chaque résultat final figé et les empreintes des entrées et sources du calcul. Le nom est l'empreinte SHA-256 du fichier `report.json`.
- Le rapport courant, identique à celui de cette exécution, est `public/legal-eu/report.json`.
- `historical-sources/` conserve la version originale de `CandidateApp.tsx` requise par l'empreinte du rapport historique des 351 entrées. `historical-sources.json` la déclare explicitement ; les tests d'intégrité conservent l'empreinte attendue, pas une nouvelle empreinte recalculée pour accepter la maintenance.

Les sorties intermédiaires de développement, jamais publiées, sont conservées hors dépôt dans `/tmp/opencode/muse-legal-eu/draft-runs/`. Aucune preuve antérieure du projet, décision humaine ou donnée privée n'a été supprimée.

## Vérifications de cette livraison

- `npm run check` : **119 tests**, typages, audits du catalogue/images et reproduction du rapport juridique réussis.
- Builds du jeu et de l'atelier réussis ; le build atelier vérifie les dossiers avant de les copier.
- Les trois versions et fichiers des catalogues, les raretés, les règles de tirage et l'export humain original restent inchangés.
- Les tests navigateur utilisent des contextes isolés, sans toucher aux choix personnels. Voir les journaux temporaires dans `/tmp/opencode/muse-legal-eu/`.
- Douze parcours navigateur droits UE : trois revues × 390/1440 px × clair/sombre ; filtres, justificatifs, séparation de la rareté et absence de requêtes d'images bloquées vérifiés. Rapport absent, incohérent ou lié à un autre catalogue : aucun feu vert indu, choix de rareté toujours sauvegardable.
- Les trois revues conservent choix, rechargement et export/import à 390/1440 px. Le jeu conserve l'ouverture de cinq cartes, la persistance, l'export/import, le refus d'un JSON invalide et le thème.

Cette livraison n'a déclenché ni activation dans le jeu, ni commit/push Git, ni déploiement Firebase.

**Publication demandée ensuite :** l'atelier a été déployé le 30 octobre 2026 à 14:05 UTC, version Hosting `f47feab88990b55c`. Les 221 fichiers en ligne correspondent au build vérifié. À `/masterpieces.html?lot=initial`, sélection, rareté, rechargement, export/import et filtre des œuvres sans sélection ont été testés en ligne à 390/1440 px. Le jeu et les sauvegardes personnelles ne sont pas déployés ni modifiés par cette publication.
