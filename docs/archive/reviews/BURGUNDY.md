# Bordeaux profond et visuel fourni

## Livraison

Le thème sombre utilise le canevas bordeaux #210a12, des surfaces lie-de-vin étagées, du texte ivoire et rose poudré, des actions bordeaux éclaircies et des accents or/outremer. La couleur du navigateur est synchronisée avant affichage puis lors des changements de thème. La lisibilité, l’en-tête persistant et la préférence mémorisée sont conservés.

L’atelier affiche `/assets/booster.png` pour les pochettes générales et thématiques, avec le catalogue indiqué séparément. Le fichier utilisateur reste intact, entier au ratio 2:3 ; les anciens dégradés et la seconde marque superposée sont retirés. Le contrôle d’ouverture de 48 px est placé sur la soudure haute ; son instruction reste distincte de l’icône dès 320 px. Les titres de la chambre nocturne restent ivoire, y compris avec la navigation claire.

## Vérification

- Onze tests réussis et compilation TypeScript/Vite réussie.
- Version compilée vérifiée : 48 combinaisons, quatre écrans, deux thèmes, largeurs 320/390/768/1024/1280/1440 px. Aucun débordement horizontal ; en-tête sticky présent.
- Axe WCAG 2 A/AA : aucune violation détectée sur les 16 combinaisons des quatre écrans en clair/sombre à 390 et 1440 px. Cela ne constitue pas une certification ; les captures ont aussi été examinées, notamment pour les titres sur fond photographique.
- Contrastes calculés des encres sur les surfaces sombres : texte courant ≥10,30:1, secondaire ≥6,95:1, titres ≥9,40:1, liens ≥7,64:1 et or ≥7,79:1. Texte des actions ≥5,67:1, y compris au survol.
- Image chargée, affichage `contain`, ratio vérifié ; contrôle de 48 px et absence de chevauchement icône/instruction vérifiés à toutes les largeurs.
- Ouvertures générale et thématique testées, rituels immersif et rapide, cartes ajoutées et sélection thématique respectée. Thème conservé au rechargement, inventaire inchangé par la bascule et le rechargement. Bascule par clic physique sans déplacement de la page après 1400 px de défilement.
- Captures dans `output/playwright/burgundy-*.png` : accueil, atelier clair/sombre, collection, révélation, fiche et téléphone de 320 px.

Relecture visuelle : livrable pour ce périmètre, sans point matériel restant. Le thème clair général et les reproductions ne sont pas recolorés.
