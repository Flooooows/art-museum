# Import de cent œuvres — 29 octobre 2026

## Résultat réel

Cent œuvres sont présentes dans la source locale et dans le site : vingt fiches historiques conservées, quatre-vingts ajouts. Chaque ajout a un titre français, une attribution, une datation affichée, un matériau, une origine, une anecdote, un récit et une notice institutionnelle. Les cent reproductions sont locales et accompagnées d’une revue de droits. Les six pochettes thématiques sont ouvertes au tirage ; aucune base hébergée n’a été provisionnée.

Les textes français sont des adaptations pour MUSE : ils ne constituent pas des notices officiellement approuvées par les musées. Les attributions discutées restent visibles, notamment le suiveur de Fra Filippo Lippi, l’atelier du Tintoret, le Cirque attribué à Valadon et le dessin de lampadaire probablement dû à Clara Driscoll. Les notices peu détaillées ne sont pas complétées par des histoires inventées : limites de datation, de provenance et de fonction y sont explicites.

## Sélection

La sélection éditoriale répartit 99 œuvres dans six ensembles, plus Hokusai conservé hors de ces ensembles pour atteindre exactement 100 œuvres uniques. La sélection européenne moderne passe donc de la cible initiale de 25 à 24, plutôt que de perdre Hokusai ou compter une 101e œuvre.

| Ensemble éditorial | Total | Anciens | Ajouts |
| --- | ---: | ---: | ---: |
| Renaissance italienne | 15 | 1 | 14 |
| Du néoclassicisme aux modernes | 24 | 3 | 21 |
| Regards sur l’Égypte ancienne | 20 | 5 | 15 |
| Matières autour de 1900 | 15 | 5 | 10 |
| Mythes et créatures | 15 | 5 | 10 |
| Premiers arts, premières traces | 10 | 0 | 10 |
| Hokusai conservé hors de ces ensembles | 1 | 1 | 0 |
| **Total unique** | **100** | **20** | **80** |

Les quatre identifiants de catalogues historiques sont préservés pour les sauvegardes. Les ajouts de peinture moderne rejoignent Beaux-Arts ; deux catalogues sont créés pour Renaissance italienne et Premiers arts. Les tailles visibles sont Beaux-Arts 26, Égypte 21, Arts décoratifs 15, Mythes 15, Renaissance italienne 15, Premiers arts 10. Elles totalisent 102 appartenances parce que Taouret est aussi en Égypte et La Joconde aussi en Renaissance italienne. L’inventaire reste lié à cent identifiants uniques.

Le choix des nouveaux objets privilégie les notices et images ouvertement réutilisables de Cleveland. Ce premier lot n’est pas un panorama équilibré de toute l’histoire mondiale de l’art : l’accès aux preuves et la précision des fiches priment sur une promesse d’exhaustivité. Le groupe néolithique rassemble Chine, Balkans, Europe centrale et Thaïlande ; il ne prétend pas couvrir tout le Paléolithique.

## Vérification des droits : cent décisions, pas une supposition globale

**80 images du Cleveland Museum of Art.** Chaque réponse individuelle indique `share_license_status: CC0` et fournit l’image web effectivement téléchargée. La politique [Open Access de Cleveland](https://www.clevelandart.org/open-access) distingue explicitement les images CC0 des œuvres protégées. Les deux ne sont pas confondues. Les descriptions et données sont également proposées sous CC0 par l’API.

**19 images du Metropolitan Museum of Art.** Chaque notice individuelle confirme `isPublicDomain: true`, une URL `primaryImageSmall` et un champ `rightsAndReproduction` vide. La [documentation institutionnelle de l’API](https://metmuseum.github.io/) décrit les images correspondantes comme disponibles en Open Access dans le domaine public. Les pages habituelles de politique ont répondu HTTP 429 lors de cette vérification : elles n’ont pas été prétendument lues. Le modèle enregistre « domaine public » sur la base des notices et de la documentation accessible, sans confondre la seule licence des métadonnées avec celle d’une image.

**La Joconde, Wikimedia Commons.** Les métadonnées de `File:Mona Lisa.jpg` indiquent `License: pd`, `Copyrighted: False` et une reproduction fidèle d’une œuvre en deux dimensions. La [page de fichier](https://commons.wikimedia.org/wiki/File:Mona_Lisa.jpg) et la [politique PD-Art](https://commons.wikimedia.org/wiki/Commons:Reuse_of_PD-Art_photographs) signalent que le traitement des reproductions peut différer selon les juridictions. Le statut « vérifié » signifie ici que cette déclaration et l’identité du fichier ont été contrôlées, pas qu’un avis juridique universel a été émis.

Les vingt JPEG préexistants portent des métadonnées différentes de celles des téléchargements actuels, mais la comparaison des pixels décodés est strictement identique, aux dimensions complètes. Les fichiers locaux d’origine n’ont donc pas été remplacés. La revue conserve le SHA-256 local, le SHA-256 téléchargé et, pour ces cas, le SHA-256 des pixels décodés. Les quatre-vingts nouveaux JPEG sont identiques aux téléchargements source ; environ 21 Mio au total, chargés paresseusement dans l’inventaire.

Ces droits concernent les **reproductions des œuvres**, non les illustrations de maquettes, les cadres ou `booster.png` fournis par l’utilisateur. Leur licence reste distincte et non inventée.

## Fichiers et contrôles

- `catalog/selection-100.json` : sélection explicite et textes des quatre-vingts ajouts.
- `catalog/initial-collections.json` : cent affectations uniques, réserve Hokusai comprise.
- `catalog/evidence/` : cent réponses API sources datées, sans modification de leur contenu institutionnel.
- `catalog/image-rights-review.json` : décision de droits, URLs, date et empreintes par image.
- `src/catalog/seed.json` : source activée, avec les preuves dans `images[].rights.verification`.
- `public/assets/provenance.json` : sources publiques et lien vers la preuve de chaque reproduction.

`npm run catalog:images` décode les cent images, vérifie leurs empreintes et rapproche chaque décision des champs de sa réponse institutionnelle. Le build inclut cet audit : une image changée ou une preuve incohérente ne passe pas silencieusement. L’import a été relancé pour confirmer son idempotence ; les textes d’une fiche déjà importée ne sont pas écrasés s’ils diffèrent de la sélection.

## Probabilités et raretés

Les taux par carte de la généraliste sont désormais fer **56,1 %**, cuivre **25,5 %**, argent **15 %**, or **3 %**, lapis-lazuli **0,4 %**. Les 81,6 points restants après les trois taux demandés ont été répartis selon l’ancien rapport fer/cuivre 55:25. Les cinq taux totalisent cent. Les pochettes thématiques renormalisent les poids entre leurs niveaux disponibles ; les dix Premières traces sont actuellement toutes Esquisse et cette pochette tire donc uniquement ce niveau.

Les scores éditoriaux gardent les seuils 30/50/70/90. Les cent évaluations actives restent `provisional`, avec critères inconnus à `null`, et non des scores fabriqués pour justifier un quota. Les niveaux des vingt anciennes cartes n’ont pas changé. L’import ne déclare aucune fiche `published` ni aucune rareté `validated`. Le contrôle strict de publication doit encore échouer pour la validation des raretés, alors que l’audit des droits réussit.

## Vérification fonctionnelle

31 tests réussis : cent identifiants, vingt anciens conservés, références et preuves, attributions nuancées, seuils, tirages fractionnaires et compatibilité des anciennes sauvegardes. Les vingt fiches culturelles et les URLs d’images historiques ont été comparées au snapshot pré-import et sont identiques.

Parcours Playwright : recherche et ouverture des quatre-vingts nouvelles fiches, titre/anecdote/récit exacts, crédit CC0, notice exacte et décodage de la bonne reproduction. Six choix thématiques visibles, sans débordement à 390 et 1440 px en clair/sombre ; quatre audits axe de l’accueil sans violation. Nouvelles ouvertures de cinq cartes dans Premières traces et Renaissance italienne, avec membres vérifiés. Le bilan de production et les éventuels contrôles supplémentaires sont consignés dans `.impeccable/review/import-cent-oeuvres.md`.
