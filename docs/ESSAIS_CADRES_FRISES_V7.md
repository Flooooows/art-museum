# Essai 09 — Des motifs qui racontent leur thème

Publié uniquement sur [MUSE Lab](https://muse-lab-6f2d.web.app/card-lab.html). Le jeu principal n’est pas modifié.

Cette édition corrige les rubans et volutes trop semblables de l’essai 08. Les Arts décoratifs servent aux couleurs et au niveau de détail, pas à la composition des motifs. Égypte ancienne et Paléolithique servent de repères de lisibilité : des sujets concrets, détaillés mais espacés dans les rails.

## Treize thèmes figuratifs

- Peinture : palettes, pinceaux, chevalets et pigments.
- Sculpture : bustes, mains modelées, têtes taillées et outils gravés.
- Estampes : presse, plaques, burins, rouleau encreur et empreinte de feuille.
- Dessins : crayons, étude de profil, fusain, gomme et hachures.
- Photographie : appareil à soufflet, pellicule, diaphragme et plaque photo.
- Textiles : métier à tisser, bobine, aiguilles et échantillon tissé.
- Céramique : amphores, bols, vases et pots.
- Métaux : enclume, marteau, coupe ciselée, tenaille et repoussé.
- Verre : verre à pied, carafe, cristal taillé et vitrail.
- Mobilier : chaise, armoire, table, marqueterie et assemblage.
- Manuscrits : codex, plume, encrier, page enluminée et parchemin.
- Archéologie : bol restauré, disque bi, fibule, tessons et stratigraphie.
- Japon : grues, éventails, cerisiers et panneaux seigaiha.

Ces objets sont des images en relief dans une moulure continue, pas les éléments structurels du cadre. [Planche des références et treize familles](prototypes/cadres-frises-v7/references-et-treize-familles.png) · [Cinq finitions photo](prototypes/cadres-frises-v7/cinq-finitions-photo.png).

## Sources et transformations

Les treize générations n’ont reçu qu’une **palette sans motifs** comme image de référence. Les cadres approuvés ont été inspectés comme repères esthétiques, sans être fournis au générateur. Cela évite de recopier leur composition. Les jobs, inventaires, empreintes et transformations sont enregistrés dans `src/card-lab/friezeSpecs.ts` et `catalog/card-lab/frieze-frames/provenance.json`.

Les sources originales restent conservées. Les éventuels ajustements d’ouverture utilisent neuf zones, avec mise à l’échelle uniforme des coins. Le master métal, dont les rails trop larges manquaient le seuil de sécurité, reçoit un premier ajustement explicite à 75 %, enregistré dans `initialLayout` ; aucun motif opaque n’est effacé.

Les cinq finitions dérivent de chaque master, via les recettes de métal et fonds colorés existantes. Le lapis conserve le bleu/or natif ; les quatre autres variantes sont des adaptations, pas des générations indépendantes. `npm run card-lab:prepare-frieze` reproduit la palette et les sorties.

Les six familles approuvées restent identiques, soit **30 cadres et leurs masques**, vérifiés octet par octet. Le registre V6 est archivé dans `catalog/card-lab/frieze-frames/previous-edition.json` ; toutes ses sources et sorties restent disponibles. Les règles d’affectation, raretés, votes et commentaire global par catégorie ne changent pas.

## Validation

- Typage réussi et **198 tests réussis**.
- 21 cartes dans 12 configurations locales et 12 en ligne : 1440/390/320 px, clair/sombre, confort/compact ; aucune erreur.
- Votes, commentaire unique, persistance, export/import, isolation du stockage du jeu et accessibilité vérifiés.
- 67 fichiers publiés (65 nouveaux cadres, page et bundle) téléchargés et comparés aux empreintes du build : identiques.

La validation esthétique finale reste celle de l’utilisateur.
