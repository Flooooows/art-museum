# Créer les cinq cadres Arts décoratifs

## Purpose / Big Picture

L’utilisateur demande des cadres dédiés aux Arts décoratifs et autorise image_generate. Les quinze œuvres de ce catalogue doivent recevoir un vrai cadre illustré dans chacune des cinq matières de rareté, au lieu du repli CSS. Pendant l’exécution, il signale les espaces autour d’images de proportions variées et choisit explicitement le papier neutre parmi les solutions proposées. Le rendu partagé doit donc ajouter un passe-partout intérieur adapté aux trente cadres, sans recadrer les œuvres ni déformer leurs motifs. Œuvres, noms, taux et sauvegardes restent inchangés.

## Progress

- [x] (2026-10-29 UTC+8) Lire les cadres existants, le choix de famille et la préparation des ouvertures ; lancer une première génération Art nouveau en fer.
- [x] (2026-10-29 UTC+8) Générer les quatre autres matières à partir du premier cadre ; cinq sorties avec alpha natif et silhouette cohérente, aucune génération répétée.
- [x] (2026-10-29 UTC+8) Préparer les cinq PNG transparents et dérivés, avec prompts réels, références et provenance XMP. Trente cadres admis ; trente-deux tests et build réussis avant adaptation du passe-partout.
- [x] (2026-10-29) Ajouter le passe-partout neutre choisi : trente masques issus de l’alpha réel et rendu partagé, vérifiés en collection, fiche, musée et ouverture.
- [x] (2026-10-29) Finaliser : 33 tests, build et cent images auditées ; vérification Chromium dans les deux thèmes à 390/768/1440 px, repli réseau et dos cachés ; préparation identique sur 93 fichiers, documentation et revue enregistrées.

## Surprises & Discoveries

Le catalogue decoratifs n’a pas de frameFamily et emploie donc déjà son identifiant comme préfixe. Ajouter decoratifs-fer/cuivre/argent/dore/lapis-lazuli suffit à le brancher sans modifier React. La préparation exige un PNG transparent 1024×1536 et mesure le plus grand rectangle entièrement transparent contenant le centre. Les cinq Japon invalides restent explicitement signalés et hors périmètre.

Les cinq générations ont déjà un vrai canal alpha : aucun détourage chromatique ou masque manuel n’a été nécessaire malgré la précaution magenta du premier prompt. Le composant avait un fond limité au plus grand rectangle de sécurité ; les petits espaces autour des ornements restaient transparents. Une exploration des trente sources confirme que la région alpha <250 connectée au centre est fermée avant le bord du canevas dans tous les cas, ce qui permet un fond suivant exactement le contour réel.

## Decision Log

Décision : un vocabulaire Art nouveau vers 1900, iris, feuilles de ginkgo et lignes végétales sinueuses, distinct du baroque Beaux-Arts et de la géométrie Art moderne. Raison : le catalogue contient Tiffany, Lalique, Fabergé et Bugatti ; le cadre évoque l’art de l’objet sans imiter une œuvre particulière. Date/auteur : 2026-10-29, assistant.

Décision : une première image en fer puis quatre éditions par matière, à composition commune, sans texte ni cartouche. Le fond et l’ouverture sont générés en magenta uni réservé au détourage. Raison : un masque calculé depuis la vraie couleur de fond donne un canal alpha exploitable sans dessiner un cadre de substitution ou couvrir l’œuvre. Les sources générées sont conservées séparément. Date/auteur : 2026-10-29, assistant.

Décision complémentaire : conserver l’alpha natif effectivement obtenu, sans détourage ; pour le passe-partout demandé ensuite, calculer un masque séparé depuis la composante intérieure des pixels alpha, pas une approximation géométrique. Le thème fournit var(--mat) (ivoire en clair, brun-bordeaux en sombre) ; une marge de 3 % autour de la boîte de reproduction rend l’encadrement intentionnel. Raison : choix explicite « Papier neutre » de l’utilisateur, image entière, aucune modification des motifs ou des fichiers sources. Date/auteur : 2026-10-29, assistant.

## Outcomes & Retrospective

Cinq variantes Arts décoratifs sont préparées avec alpha natif et provenance honnête ; trente cadres disposent d’un fond intérieur neutre suivant les ornements. Images entières, matières et taux préservés. Trente-trois tests et compilation réussis ; preuve d’idempotence sur 93 fichiers et rendu observé dans les quatre contextes, deux thèmes et plusieurs formats. Revue : `.impeccable/review/cadres-passe-partout.md`. Montage des cinq matières : `output/playwright/decoratifs-five-finishes.png`.

Découverte lors de la vérification : les cinq identifiants historiques Arts décoratifs ne couvrent pas les cinq raretés. Les niveaux actuels n’utilisent que fer/cuivre/argent ; or et lapis sont prêts et testés sans modifier les évaluations pour les faire apparaître. Les panoramas gardent davantage de papier vertical, compromis explicite de la reproduction entière dans un cadre portrait. Aucun déploiement ; limites navigateur/accessibilité consignées dans la revue.

## Context and Orientation

Projet React/Vite dans /home/ubuntu/art-booster. src/frames.ts choisit Catalog.frameFamily ou Catalog.id puis rarity.finish. src/FramedArtwork.tsx superpose le PNG à la reproduction entière, utilisée dans collection, ouverture, musée et fiche, avec un masque intérieur séparé pour le papier. scripts/prepare-frames.mjs transforme les originaux de public/assets/collections en réductions display et masques et écrit src/frame-assets.json ; les originaux fournis ne sont pas écrasés. src/frames.test.ts vérifie transparence, géométrie, provenance et mappings, dont decoratifs. Les œuvres et leurs droits sont dans src/catalog/seed.json et restent inchangés pour cet ajout décoratif.

## Plan of Work

Générer une image par finition via image_generate sans choisir de modèle particulier. Stocker les sorties brutes dans output/imagegen et noter prompts, références et modèle réellement retourné. Après la première image, les quatre éditions maintiennent dessin et dimensions et changent la matière principale. scripts/prepare-decorative-frames.mjs normalise les sources et conserve l’alpha natif effectivement obtenu, sans détourage magenta, puis écrit uniquement les cinq nouveaux fichiers decoratifs-*.png. Ne pas modifier les cadres fournis par l’utilisateur.

Exécuter npm run prepare:frames : le manifeste doit maintenant admettre trente cadres, avec les mêmes cinq Japon signalés. Ajouter decoratifs aux mappings testés et un test de provenance/alpha spécifique. Le repli doit rester testé pour une famille absente et en cas d’erreur réseau. Le registre doit suffire à activer les quinze œuvres existantes, sans changement de distribution.

Vérifier npm test et npm run build, puis voir les cinq finitions dans le vrai rendu partagé, dans les deux thèmes à 390 et 1440 px. Vérifier au moins fiche, collection, musée et ouverture ; les dos cachés ne chargent pas le cadre avant révélation. Consigner preuves et limites et actualiser README, DESIGN et son sidecar sur cette seule extension.

## Concrete Steps

Depuis /home/ubuntu/art-booster : node scripts/prepare-decorative-frames.mjs, npm run prepare:frames, npm test, npm run build. Ouvrir le site local avec Playwright ; garder les captures dans output/playwright. Le manifeste généré doit contenir les cinq clés decoratifs-* et les tests doivent garder les taux 56,1/25,5/15/3/0,4 et cent œuvres inchangés.

## Validation and Acceptance

Les cinq nouveaux originaux sont des PNG RGBA 1024×1536, sans magenta visible, avec une grande ouverture centrale intégralement transparente ; trente variantes valides sont préparées. Chaque œuvre Arts décoratifs choisit decoratifs-<finition> et non le repli ou une autre famille. Les pixels de toute l’ouverture mesurée restent transparents après réduction. Le rendu reste lisible sans déformation, l’œuvre entière est visible et les textes restent hors du cadre. La provenance indique génération IA, prompt réel et référence, pas un musée ni une licence CC0 inventée.

## Idempotence and Recovery

Ne pas relancer une génération simplement pour attendre sa sortie ; attendre la notification des jobs. Conserver les sorties brutes ; le détourage peut être ajusté sans nouvelle génération. Refuser d’écraser un decoratifs-*.png inconnu. Les préparations déterministes doivent être réexécutables sans altérer les autres originaux. Aucune suppression de stockage, image d’œuvre ou cadre Japon.

## Artifacts and Notes

Les reproductions des cent œuvres restent liées à leurs preuves de droits. Les nouveaux cadres sont des assets décoratifs générés à la demande, avec provenance distincte, et ne sont pas présentés comme des reproductions historiques.

## Interfaces and Dependencies

Utiliser Sharp et les scripts existants, sans nouvelle dépendance. Les cinq suffixes exacts sont fer, cuivre, argent, dore et lapis-lazuli. FramedArtwork ajoute seulement une couche décorative masquée ; FrameAsset expose matte. Aucun changement à la collection de données culturelles ou au stockage.

Révision initiale : extension de famille demandée, cinq matières prévues, aucune modification de l’identité ou des règles du produit.

Révision pendant exécution : l’utilisateur signale les écarts de proportions et choisit un passe-partout neutre ; le périmètre inclut désormais le fond intérieur des trente cadres. Les cinq nouveaux cadres sont déjà produits et ne sont pas régénérés pour cet ajustement de mise en page.

Clôture : vérifications, limites et preuves consignées ; documentation opérante actualisée, preuves historiques laissées intactes. Trente cadres actifs et cinq Japon signalés ; aucun chantier restant dans ce périmètre.
