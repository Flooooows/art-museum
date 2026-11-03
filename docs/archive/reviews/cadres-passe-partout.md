# Arts décoratifs et passe-partout neutre — revue finale

Date : 2026-10-29. Verdict : **ship local**, agent principal ; aucune revue indépendante prétendue. Pas de déploiement.

## Demande et résultat

Cinq cadres Arts décoratifs générés à la demande, famille Art nouveau à iris et ginkgo, fer/cuivre/argent/or/lapis-lazuli. Le signalement suivant de l’utilisateur sur les écarts de proportions a conduit à son choix explicite « Papier neutre » : trente masques intérieurs calculés depuis le vrai alpha des cadres, couleur `--mat` claire ou sombre et marge de 3 % dans la fenêtre sûre. L’œuvre entière reste centrée en contain, sans déformation, recadrage ou changement des ornements.

Les cinq sorties image_generate sont conservées, ainsi que les prompts et références exacts. Les originaux et dérivés Arts décoratifs embarquent une provenance XMP ; le registre décrit aussi chaque masque technique. Les assets générés ne reçoivent aucune licence CC0 supposée. Les cent reproductions et leurs preuves de droits ne changent pas.

## Vérifications exécutées

- `npm test` : **33/33 réussis**, dont mappings, provenance et alpha des cinq nouvelles finitions, couverture des fenêtres sûres et transparence des bords des trente masques, compatibilité des anciennes sauvegardes de trois et des nouvelles pochettes de cinq.
- `npm run build` : réussi, avec audit des cent œuvres/images et de leurs droits. Les cinq originaux Japon invalides sont toujours signalés et conservés.
- Réexécution de `node scripts/prepare-decorative-frames.mjs` : **93 fichiers identiques**, originaux/affichages/masques et trois registres ; preuve `output/playwright/matte-idempotency.json`.
- Chromium sur la version compilée `http://localhost:4173`, session isolée `matte`. Import par le vrai formulaire et confirmation, sans modification d’une sauvegarde utilisateur.
- Collection Arts décoratifs à 390 et 1440 px, clair/sombre : cadres fer/cuivre/argent effectivement sélectionnés, images décodées, masque CSS actif et aucun débordement horizontal. Fiche Favrile et musée vérifiés ; musée capturé dans les deux thèmes aux deux largeurs.
- Fiches Hokusai, Lippi, Hori et Monet à **390/768/1440 px**, deux thèmes : ratio du cadre 2:3, `object-fit: contain`, aucun débordement du dialogue. La Joconde portrait vérifiée aux deux largeurs extrêmes et dans les deux thèmes. Inspection visuelle des captures représentatives portrait/paysage/cercle/panorama et des nouveaux cadres.
- Ouverture réelle Arts décoratifs : cinq dos, **aucun FramedArtwork ni requête de cadre/masque avant révélation** ; révélation d’une carte puis de toutes, cinq blocs encadrés. Captures à 390/1440 px dans les deux thèmes, sans débordement du dialogue.
- Échec réseau volontaire des overlays Arts décoratifs : repli géométrique de même matière, reproduction décodée entière, papier neutre conservé ; interception retirée puis page rechargée. Les trois erreurs réseau du journal correspondent à cette simulation.
- Une passe du détecteur sur `src/FramedArtwork.tsx` et `src/frames.css`, aucun finding regex. Ses règles nécessitant une page n’ont pas été exécutées : ne pas assimiler ce résultat à un audit complet axe ou à une validation mult navigateur.

## Preuves visuelles

Dans `output/playwright/` :

- `decoratifs-five-finishes.png` : montage technique des cinq matières avec une même reproduction, **pas** une capture d’inventaire ni un changement de rareté.
- `matte-decoratifs-{light,dark}-{390,1440}.png` : vraie collection.
- `matte-detail-dark-1440.png` : fiche Favrile, argent et papier brun-bordeaux.
- `matte-museum-{light,dark}-{390,1440}.png` : cinq acquisitions exposées.
- `matte-{landscape,round,panorama,wide,portrait}-{light,dark}-{390,1440}.png` : reproductions entières dans leurs cadres réels.
- `matte-pack-hidden-390.png`, `matte-pack-{light,dark}-{390,1440}.png` : ouverture réelle.
- `matte-fallback-light-1440.png` : échec réseau simulé.

## Limites intentionnelles

Arts décoratifs contient actuellement seulement les niveaux fer, cuivre et argent : les variantes or et lapis sont générées, préparées et testées, mais aucune œuvre n’est promue pour les afficher. Le montage des cinq matières permet leur comparaison sans falsifier le catalogue.

Un panorama très large laisse nécessairement beaucoup de papier au-dessus et au-dessous dans un cadre portrait. C’est le compromis choisi : conserver le cadre et la reproduction entiers. Les arrière-plans photographiques déjà présents dans les fichiers sources restent visibles et ne sont pas détourés.

Pas de nouvelle campagne axe ni de test Safari/Firefox pour ce lot. Les vérifications historiques des autres lots restent historiques. Aucune migration, réinitialisation, nouvelle distribution, commit ou publication n’a été effectué.
