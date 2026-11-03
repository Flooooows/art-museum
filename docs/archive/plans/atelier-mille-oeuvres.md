# Atelier de validation de 1 000 œuvres

## Purpose / Big Picture

L’utilisateur veut examiner mille cartes, lire sous chacune le score et la rareté conseillés par le moteur, puis décider lui-même de la rareté finale. Il a confirmé 1 000 œuvres au total (les 100 existantes et 900 nouvelles), une grille au style MUSE, des filtres et une sauvegarde locale exportable. La page indépendante `/review.html` n’active aucune décision dans le jeu. Une seule rareté peut être choisie par carte ; les boutons radio expriment ce choix exclusif, avec possibilité de revenir à « à examiner ».

## Progress

- [x] (2026-10-30 UTC+8) Lire le catalogue, les contrats V2 et le système visuel existants ; obtenir la confirmation du périmètre.
- [x] (2026-10-30 UTC+8) Collecter 900 notices CC0 distinctes sur huit médiums via 12 captures paginées Cleveland, sans doublon avec les 100 existantes.
- [x] (2026-10-30 UTC+8) Réutiliser V2 et les comparables historiques fixes : catalogue `review-1000-b069bbaeeecc561d`, 1000 propositions provisoires, sans modification de l’exécution historique.
- [x] (2026-10-30 UTC+8) Construire la page indépendante, 12 familles, filtres, pagination 24 cartes, choix exclusifs non précochés et sauvegarde/import/export.
- [x] (2026-10-30 UTC+8) 76 tests réussis, build double entrée et TypeScript strict ; recalcul hors réseau identique, empreintes protégées intactes. Parcours réels choix/export/import/rechargement/erreurs vérifiés, largeurs 1440/390/320 sans débordement.
- [x] (2026-10-30 UTC+8) Documenter méthode, sources, limites, commandes et résultats ; revue indépendante réalisée et correction de pagination notée résolue.
- [x] (2026-10-30 UTC+8) Terminer la comparaison documentaire dans `.impeccable/review/review-workspace-documentation.md`, en conservant `DESIGN.md` et son sidecar ; revue et documentation closes.

## Surprises & Discoveries

Les cent entrées et le moteur V2 sont déjà disponibles et archivés. Les cinq critères ne sont généralement pas tous mesurés : P/A/C manquent souvent de mesures directes. Il faut afficher l’incertitude et les types de critères, pas confondre décision humaine et confirmation algorithmique. L’API ouverte Cleveland fournit des notices complètes et des images CC0 en lots, permettant une sélection diversifiée sans mille appels individuels. Les nouvelles familles appartiennent seulement à l’atelier, pas aux pochettes actives.

## Decision Log

Décision : nouvelle entrée Vite `/review.html` et fichiers `src/review/`, sans importer l’atelier dans React principal ni modifier `seed.json`. Raison : traiter l’atelier comme une étape de validation, pas une migration. Auteur/date : assistant, 2026-10-30.

Décision : conserver les 100 propositions figées V2 et scorer les nouvelles œuvres avec les mêmes poids/seuils, en réutilisant les observations non imputées du lot historique comme comparables fixes. Cela évite de faire varier les anciens scores au gré du nouvel échantillon et de présenter les mille cibles comme une normalisation représentative. La politique et le groupe de comparables seront déclarés explicitement. Auteur/date : assistant, 2026-10-30.

Décision : sauvegarde dans une clé locale distincte, export JSON versionné et CSV, import validé et confirmation des conflits avant remplacement ; aucune sélection préalable depuis la proposition. Un document chargé avec erreurs ne doit jamais effacer une décision. Auteur/date : assistant, 2026-10-30.

## Outcomes & Retrospective

Livraison documentaire terminée : le documenter indépendant a inspecté les huit captures, le code, les tokens et la provenance, puis rédigé `.impeccable/review/review-workspace-documentation.md`. Les écarts locaux et les anciens décalages documentaires sont signalés, sans réécrire le système global. Le premier commit de fonctionnalité est `3a4997139f4882dc4797945ef2a9abc4e108acfc` ; les décisions utilisateur ne font pas partie des fichiers committés.

La revue indépendante complète a demandé une correction matérielle de continuité clavier. Celle-ci est implémentée, vérifiée dans le navigateur, puis notée **resolved**, disposition **ship**, par le même réviseur sur son passage de verdict limité à ce correctif (pas un nouvel audit intégral). Les captures bureau/téléphone ont été renouvelées. La version statique issue du build a aussi été ouverte sur le port 4173 : aucune présélection, choix persistant après rechargement et annulation fonctionnels. Les décisions de test ont été retirées des sessions de test, pas des données utilisateur.

L’atelier contient exactement 1000 œuvres uniques : 100 historiques inchangées et 900 notices CC0 supplémentaires, réparties dans 12 familles de revue. Proposition initiale : 161 Esquisse, 741 Étude, 94 Composition, 2 Œuvre, 2 Pièce maîtresse. Les mille statuts restent provisoires ; confiance moyenne 56,6 %, indice heuristique et non probabilité d’exactitude. Les notes identiques de nombreuses nouvelles entrées reflètent des preuves limitées, pas un quota ni une précision inventée.

Le catalogue `review-1000-b069bbaeeecc561d` est identique après recalcul hors réseau (SHA-256 `c39fe57cb4353b4d624a204f6ed78329859e9d1df76275098597196bd13b9451`). Douze captures institutionnelles sont figées, la sélection et les empreintes sont documentées. Les 76 tests passent, le build émet les deux entrées et l’ancienne simulation conserve exactement son identifiant `02b68c195210ea3536d84c1a`. Aucune décision n’est activée et les données protégées restent inchangées.

Le navigateur a vérifié le choix exclusif, l’annulation individuelle, la restauration après rechargement, l’export JSON, l’import du niveau zéro, la fusion et son annulation, le refus atomique d’un fichier invalide, la conservation d’un stockage corrompu, la protection d’un autre onglet, les échecs de catalogue/image et la reprise. Les filtres (dont 90 photographies), la dernière page de 16 cartes, les deux thèmes et les vues 1440/390/320 ont été exercés. Le contrôle axe WCAG 2A/AA et 2.1AA de la vue principale ne retourne aucune violation automatique ; il ne remplace pas une expertise exhaustive.

## Context and Orientation

Projet React/Vite/TypeScript dans `/home/ubuntu/art-booster`. Les données actives sont dans `src/catalog/seed.json`. Le domaine indépendant est dans `src/rarity-engine/`, les outils HTTP et l’adaptateur existants dans `scripts/rarity-v2/`. La simulation finale des cent œuvres est `catalog/rarity-v2/runs/02b68c195210ea3536d84c1a/`. Ne modifier ni ces sources/archives ni les fichiers protégés par `catalog/rarity-v2/protected-inputs.json`. Réutiliser les fonctions pures de scoring/estimation/validation et le client HTTP. Les données de l’atelier vont dans `catalog/review-1000/`, les fichiers à afficher dans `public/review-data/` et les exports de l’utilisateur restent dans son navigateur/téléchargements.

## Plan of Work

Premier jalon : collecter des notices CC0 par types d’objets via l’API institutionnelle, avec cache, délai et contrôle des droits/identifiants. Geler les réponses avec date/empreinte et une sélection déterministe de 900 objets distincts des 100 existants. Garder les titres originaux plutôt qu’inventer des traductions. Retenir de vraies notices d’œuvres/objets et une URL de reproduction institutionnelle. Documenter le biais d’un fournisseur dominant et l’absence de mesures Internet supplémentaires.

Deuxième jalon : transformer chaque nouvelle notice en `ArtworkInput`. Réutiliser `scoreDirect`, `completeCriteria`, `weightedInterval`, `confidenceFor` et `validationReasons` avec les comparables historiques non imputés, et recalculer les variantes pour la sensibilité. Ne pas attribuer une rareté active aux nouvelles entrées ; les types d’adaptation pourront avoir un champ technique neutre ignoré et la sortie publique précisera activeLevel=null. Produire un manifeste des sources/code/configuration et un JSON de consultation compact, sans embarquer des centaines de copies de la même preuve. Les résultats et identifiants sont déterministes à partir des captures.

Troisième jalon : page de travail MUSE, palette ivoire/bordeaux et typographie existantes, cartes illustrées entières sans cadre de rareté préjugeant la décision, score et proposition sous l’image. Grille trois colonnes bureau, une sur téléphone, 24 cartes par page. Recherche texte, famille, proposition et état de revue, tri, compteur de progression. Détails consultables pour les cinq critères et les sources. Les choix radio, un par rareté, restent entièrement manuels ; une sélection n’enlève pas immédiatement la carte sous le pointeur. États de chargement, échec de données/image, recherche vide et stockage indisponible sont explicites. Export JSON réimportable et CSV, import atomique validé avec confirmation des conflits ; aucune remise à zéro globale sans confirmation.

Quatrième jalon : tests unitaires pour choix/import/export/filtres, qualité des mille données et empreintes protégées. Démarrer Vite et vérifier via navigateur la sélection, le rechargement, les filtres, l’export/import et les dimensions 1440/390. Exécuter `npm test`, `npm run build` et le vérificateur V2 historique. Actualiser ce plan et le guide de l’atelier avec preuves effectives, sans changement de système visuel global.

## Concrete Steps

Depuis `/home/ubuntu/art-booster`, lancer les commandes qui seront ajoutées : `npm run review:collect -- --live` pour les notices, `npm run review:build` pour les propositions hors réseau, puis `npm run dev -- --host 0.0.0.0`. Ouvrir `/review.html`. `npm test`, `npm run build` et `npm run rarity:v2:verify` doivent réussir. Le build Vite doit émettre `index.html` et `review.html` dans `dist`.

## Validation and Acceptance

Le JSON public contient exactement 1 000 identifiants uniques et conserve les cent identifiants historiques et leurs propositions. Les 900 nouvelles notices ont source, date, droits CC0 et image institutionnelle. Chaque carte affiche score et rareté conseillés, confiance et choix indépendant initialement vide. Une décision persiste après rechargement, se modifie et s’annule individuellement ; l’export puis import la restitue sans confusion avec les données du jeu. Les imports inconnus, incomplets, dupliqués, hors échelle ou incompatibles sont refusés avant toute écriture. Aucun changement dans les fichiers protégés ; V2 historique demeure reproductible.

## Idempotence and Recovery

La collecte réutilise les captures réussies et ne fabrique pas de données si un fournisseur échoue. Le calcul fonctionne hors réseau. Garder les versions précédentes d’un catalogue publié plutôt que de réutiliser son identifiant pour un contenu différent. Ne jamais remplacer silencieusement un stockage local illisible ; proposer l’export de récupération et la confirmation d’un nouveau départ. Les décisions humaines ne sont pas envoyées sur Internet et ne déclenchent pas de migration.

## Artifacts and Notes

Le mini-site doit expliquer que la majorité des nouveaux scores emploient des estimations. Les nouvelles familles sont des regroupements de revue, pas de nouveaux packs jouables. Une image distante manquante garde titre et source accessibles. Le déploiement public et une base de comptes synchronisés ne font pas partie de cette demande.

## Interfaces and Dependencies

Pas de nouvelle dépendance d’exécution : React, lucide-react, TypeScript, Vite et Node existants. `ReviewArtwork` contient identité, image, famille et proposition ; `ReviewDecision` contient identifiant, niveau final et date ; `ReviewExport` lie les décisions à la version du catalogue et de l’algorithme. Une clé `muse:rarity-review:…` distincte du jeu protège l’indépendance. Les nouvelles commandes n’écrivent que les dossiers d’atelier ; le build applicatif reste sans import de ces données.

Révision initiale : périmètre confirmé et plan fondé sur l’architecture existante, avec réutilisation stricte et absence de migration.

Révision d’implémentation (2026-10-30 UTC+8) : collecte et atelier livrés dans les fichiers de travail, résultats et preuves réels consignés ; ajout de la protection des sauvegardes illisibles/concurrentes et maintien des cartes en place jusqu’à actualisation des filtres. Revue indépendante en cours avant clôture.

Révision finale (2026-10-30 UTC+8) : correction clavier notée résolue par le réviseur, comparaison documentaire terminée, tests et build relancés avec succès, preview statique vérifiée. Aucun déploiement, aucune importation dans le catalogue actif ni activation des décisions. Publication du code dans le dépôt déjà demandé par l’utilisateur, sans push forcé.
