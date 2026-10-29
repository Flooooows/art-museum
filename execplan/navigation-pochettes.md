# Recentrer MUSE sur les pochettes et quatre destinations utiles

Ce plan est vivant ; Progress, Surprises & Discoveries, Decision Log et Outcomes & Retrospective sont mis à jour jusqu’à livraison.

## Purpose / Big Picture

L’utilisateur veut choisir ses boosters dès l’accueil, plus léger, avec la pochette tous styles en premier. La navigation doit contenir exactement Pochettes / Marché / Collection / Profil. Ouvrir puis dévoiler est une interaction liée au choix, plus une paire de pages. On conserve le bordeaux profond, les polices locales, les textes lisibles, l’image fournie et les sauvegardes existantes.

## Progress

- [x] (2026-10-29 10:00 UTC+8) Lire les composants, les contraintes locales et consulter Kyara dans le navigateur.
- [x] (2026-10-29 10:00 UTC+8) Confirmer avec l’utilisateur le Marché préparatoire : vrais doublons, échanges à venir, aucun faux achat.
- [x] (2026-10-29 10:08 UTC+8) Remplacer l’accueil et intégrer le parcours d’ouverture dans un dialogue.
- [x] (2026-10-29 10:08 UTC+8) Créer Marché et Profil, adapter la navigation et conserver import/export.
- [x] (2026-10-29 10:08 UTC+8) Premier contrôle navigateur : 16 audits sans violation, ouverture/reprise et imports validés ; 13 tests et compilation réussis.
- [x] (2026-10-29 10:16 UTC+8) Contrôler 48 combinaisons de largeur/thème/page, les anciens liens, le clavier, le stock vide, le double-clic, les dialogues imbriqués et la reprise après rechargement.
- [x] (2026-10-29 10:16 UTC+8) Corriger le contraste doré des probabilités claires ; les quatre nouveaux audits de probabilités passent. Relecture indépendante : ship sur les 27 captures demandées, aucun point matériel restant.
- [x] (2026-10-29 10:24 UTC+8) DESIGN.md et sidecar finalisés et vérifiés ; README, PRODUCT et rapport actualisés. Focus de recherche et contraste de réinitialisation vérifiés puis validés par le relecteur. Aucun jalon restant pour la navigation.

## Surprises & Discoveries

Kyara est une application rendue par JavaScript : la consultation HTTP ne renvoie pas le contenu utile ; la navigation réelle montre un choix de booster, une collection et un marché distincts. L’application MUSE n’a aucun serveur ni comptes : les échanges ne peuvent être représentés comme actifs. Le dernier tirage est déjà enregistré avec les indices des cartes révélées, permettant une reprise sans second tirage.

Les fiches peuvent être ouvertes au-dessus du dialogue de découverte. Un verrou de défilement par compteur et des titres de dialogue uniques évitent de laisser la page bloquée quand les deux dialogues ferment ensemble lors d’une navigation navigateur.

## Decision Log

Décision : conserver le monde MUSE et appliquer la structure explicitement demandée, sans nouvelle identité. Raison : Kyara est une inspiration d’usage, pas une demande de copier son graphisme. Auteur/date : assistant, 2026-10-29.

Décision : utiliser un dialogue pour ouvrir puis révéler, avec retour au même accueil et reprise du tirage sauvegardé. Raison : retirer les pages redondantes sans perdre le plaisir de découverte ni les trois cartes. Les anciens liens #atelier et #revelation redirigent vers Pochettes, sans consommer de stock. Auteur/date : assistant, 2026-10-29.

Décision : Marché affiche les vrais doublons locaux et un statut d’échanges à venir. Raison : périmètre expressément confirmé par l’utilisateur, pas de comptes ni transactions factices. Profil devient une page regroupant progression, export/import et musée personnel. Auteur/date : utilisateur/assistant, 2026-10-29.

## Outcomes & Retrospective

Les quatre destinations sont livrées et l’accueil est nettement allégé, avec une vedette tous styles et quatre choix thématiques. La découverte est un dialogue unique sans changement de route ; sa fermeture ne perd pas les cartes. Marché reste honnêtement préparatoire, avec les vrais doublons consultables ; Profil reprend toutes les fonctions de sauvegarde. Le format de sauvegarde et les œuvres utilisateur restent intacts. Treize tests et compilation réussis ; 48 combinaisons sans débordement, audits de pages et dialogues validés après correction de l’encre dorée en clair. La relecture indépendante conclut ship, y compris les corrections ciblées du focus de recherche et du contraste de réinitialisation. Registre visuel et sidecar vérifiés, aucun jalon restant. Le retour suivant sur les cadres et raretés prolonge le travail dans un plan distinct.

## Context and Orientation

Projet React/TypeScript/Vite dans /home/ubuntu/art-booster. `src/App.tsx` gère la navigation par fragment d’URL (texte après #), l’état invité, les fiches et l’import/export. `src/Home.tsx` est l’accueil chargé à alléger. `src/Opening.tsx` contient les anciennes pages à remplacer par un dialogue. `src/Collection.tsx` reste l’inventaire et son musée interne. `src/collection.ts` fournit openPack, parseState, compteurs et recharge ; le format `muse-collection-v1` est conservé. `src/components.tsx` fournit Modal, Pack, Rates et Rarity. `src/appearance.css` contient les thèmes et est chargé après les styles historiques ; un fichier `src/navigation.css` portera les nouveaux écrans sans perturber la collection.

## Plan of Work

Premier jalon : remplacer Home par un titre simple, un statut de stock, une vedette utilisant booster.png et quatre choix thématiques. Supprimer les sections promotionnelles répétées, statistiques, étapes et filtres inutiles pour quatre choix. Créer PackOpening dans Opening.tsx, confirmation et probabilités repliées, option rapide, trois cartes à révéler et sortie vers collection ; fermer conserve le tirage.

Deuxième jalon : ajouter navigation.ts avec résolution des quatre pages et anciens liens, Market.tsx pour les doublons consultables et Profile.tsx pour l’espace invité. App conserve les fonctions de stockage, la fiche et la confirmation de remplacement ; tous les accès au profil aboutissent à sa page. La navigation principale reste active sur Pochettes pendant le dialogue. Les dialogues ont des titres uniques, une fermeture clavier et une restitution du focus.

Troisième jalon : écrire des tests de résolution de routes, lancer tests et compilation, inspecter le navigateur en clair/sombre et plusieurs largeurs. Tester l’ouverture sans changement de route, consommation unique, fermeture et reprise, tirage thématique, export/import et doublons. Mettre à jour les documents avec la nouvelle organisation.

## Concrete Steps

Depuis /home/ubuntu/art-booster : `npm test`, `npm run build`, puis `npm run dev -- --host 0.0.0.0` si le port 5173 n’est pas déjà servi. Utiliser la prévisualisation compilée sur 4173 pour les contrôles finaux. Les résultats attendus sont tous les tests réussis et une compilation TypeScript/Vite sans erreur. Captures de contrôle dans output/playwright, revue dans .impeccable/review.

## Validation and Acceptance

À 390 et 1440 px, en clair et sombre, les quatre liens demandés sont présents et aucun lien Ouvrir/Révéler ne subsiste. La pochette tous styles est principale ; quatre univers sont directement sélectionnables. Choisir ouvre un dialogue sans quitter #pochettes ; confirmer consomme un stock et ajoute exactement trois cartes, les révéler ne consomme rien. Fermer avant confirmation ne consomme rien ; fermer après le tirage puis reprendre conserve les mêmes cartes. Marché vide explique son statut ; une collection avec doublons en montre le vrai nombre sans annonce fictive. Profil permet export et import avec confirmation destructive, explique le stockage local et donne accès au musée. Les anciens fragments reviennent à une destination valide. Aucun débordement à 320 px ; focus clavier, Échap, navigation sticky et choix de thème persistent.

## Idempotence and Recovery

Ne pas modifier le format de sauvegarde, effacer localStorage ou écraser les fichiers utilisateur. Les tests navigateur utilisent une session isolée. Une erreur d’import conserve la collection actuelle ; la confirmation permet d’annuler et d’exporter avant remplacement. Les changements peuvent être retestés sans migration.

## Artifacts and Notes

Référence consultée : https://kyara.games/ et /marche, lecture seule. La séparation des usages est reprise, sans données, prix, garanties de rareté, événements ou monnaie Kyara.

## Interfaces and Dependencies

Pas de dépendance ajoutée. navigation.ts exporte Page et resolvePage(hash). Home reçoit state, countdown, onChoose et onResume. PackOpening reçoit selected, state, countdown, revealed, onOpen, onReveal, onClose, onDetail et onCollection. Market reçoit state, onDetail et onOpen. Profile reçoit state, persistence, theme, onToggleTheme, onExport, onImport, importError et onMuseum. App reste responsable de la collection persistée et du tirage unique.

Révision initiale : structure choisie par l’utilisateur, périmètre Marché confirmé avant code.

Révision de validation : regroupement terminé, contrôles navigateur et imports réussis, contraste de la dernière probabilité corrigé et quatre audits ciblés repassés. Aucun jalon fonctionnel restant ; mise à jour du registre visuel en cours pour refléter la nouvelle navigation.

Révision finale : documentation reçue et validée, focus et contraste filtré confirmés ; demande suivante sur les cadres suivie dans `execplan/cadres-raretes.md`.
