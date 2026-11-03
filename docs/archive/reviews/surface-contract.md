# MUSE — Écrans collectionneur

Mode : Operate, avec expérience de révélation. Référence imposée : les quatre PNG et HTML fournis. Pas de nouvelle direction à choisir.

## Direction contract

THESIS : un musée à collectionner, fidèle aux compositions fournies, pas une nouvelle landing page.

OWN-WORLD : papier ivoire #fbf9f4, bordeaux #4a0011 et #6b1123, bleu outremer #0038ff, or #cba72f. Titres Playfair Display, texte Inter, métadonnées Space Grotesk comme les références.

STORY : choisir une pochette, ouvrir son sceau, découvrir trois œuvres et enrichir son inventaire ; lire une anecdote puis une fiche sourcée ; exposer ses coups de cœur.

FIRST VIEWPORT : en-tête ivoire avec MUSE à gauche, navigation et stock à droite. Grand titre éditorial, puis panneau bordeaux à deux colonnes avec action d’ouverture à gauche et grande pochette à droite. Les quatre pochettes thématiques suivent. L’atelier centre une pochette entre probabilités et choix de rituel ; la révélation expose un triptyque ; la collection reprend rail gauche et grille de trois cartes.

FORM : compositions des quatre références fournies, seed: none (direction imposée). Ouverture du sceau, retournement des cartes et léger déplacement des pochettes au survol ; respecter prefers-reduced-motion.

FINISH : unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Adaptation suivante : catalogue structuré et cinq cartes

Cette demande remplace le nombre de trois découvertes décrit dans les contrats antérieurs, pas l’identité ni la navigation. Toute nouvelle pochette donne cinq cartes ; un résultat historique de trois reste intact. La grille conserve trois colonnes sur bureau (deux rangées pour cinq), une sur téléphone ; aucune réduction des textes ou des cadres pour faire tenir cinq colonnes. Crédit d’image issu des droits, tailles des ensembles calculées par appartenances, inventaire global unique. Le socle local reste de démonstration ; six ensembles pour cent œuvres sont proposés, non importés. La source structurée n’est pas une base hébergée.

## Cadres fournis et matières de rareté

Demande suivante : habiller la découverte et la collection avec les cadres transparents ajoutés par l’utilisateur. Garder les noms éditoriaux, confirmation explicite obtenue ; matières dans l’ordre fer, cuivre, argent, or et lapis-lazuli. Le rendu partagé choisit famille et niveau, conserve l’œuvre entière dans une fenêtre mesurée et l’entoure du PNG original réduit, sans recoloration. Arts décoratifs reçoit un repli sobre tant qu’aucun cadre de cette famille n’est fourni ; Art moderne et Préhistoire ne créent pas de fausses collections. Les futures variantes s’ajoutent au registre via un script, sans changer les composants. La transparence et la lisibilité des métadonnées priment sur les effets ; le cadre ne doit pas annoncer la rareté d’une carte encore cachée.

## Adaptation demandée : lisibilité et thèmes

La demande suivante de l’utilisateur remplace la fidélité aux microtextes : lecture courante 16 px, contrôles 15 px, libellés 14 px et informations de carte 13 px. Les familles de polices et la composition muséale sont conservées, avec une densité moindre sur téléphone. L’en-tête opaque est persistant ; il accueille une bascule Lune/Soleil. À sa demande, la palette sombre utilise désormais un bordeaux profond #210a12, des couches lie-de-vin, des textes ivoire et rose poudré, avec accents or et outremer, sans inversion des œuvres. L’atelier emploie son image `booster.png` entière, sans doublon de marque ; le contrôle d’ouverture se place sur la soudure haute. Les rôles sémantiques et les adaptations sont définis dans `src/appearance.css` et documentés dans le système visuel.

## Direction contract — navigation simplifiée demandée

Mode : Operate, avec révélation Experience. Cette demande remplace la composition chargée de l’accueil et les pages atelier/révélation, pas le monde visuel MUSE.

THESIS : choisir une pochette sans traverser trois pages ; refuser les sections promotionnelles répétées et donner une fonction distincte à chaque onglet.

OWN-WORLD : bordeaux profond ou papier ivoire selon le thème, titres Playfair, prose Inter, contrôles Space. L’image utilisateur de la pochette tous styles mène ; les quatre univers gardent leurs pochettes illustrées.

STORY : choisir, ouvrir et découvrir dans un même dialogue depuis Pochettes ; retrouver et exposer dans Collection ; consulter les doublons dans Marché ; sauvegarder et voir sa progression dans Profil. Aucun marché fictif.

FIRST VIEWPORT : navigation sticky Pochettes/Marché/Collection/Profil, titre bref et stock discret, vedette tous styles avec grande image à droite et action explicite à gauche ; la rangée des quatre univers commence juste dessous. Moins de texte, pas de statistiques imbriquées ni de bande promotionnelle.

FORM : structure épinglée par la demande et inspirée des rôles observés sur Kyara ; pas de nouvelle identité ni de tournoi de concepts. Le dévoilement des cinq cartes nouvelles dans le dialogue est le moment singulier ; les anciens tirages de trois restent intacts. Le téléphone empile sans réduire les textes.

FINISH : unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Import autorisé de cent œuvres

Les cent œuvres sont maintenant réellement présentes : vingt conservées et quatre-vingts ajouts français, cent reproductions aux droits contrôlés avec preuves datées. Les six pochettes thématiques gardent les mêmes composants, quatre colonnes sur bureau, deux sur tablette et rangées portrait + titre sur téléphone. Renaissance italienne et Premières traces affichent de vraies reproductions de leurs groupes ; le cadre Préhistoire sert désormais aux dix objets néolithiques. Aucun nouveau graphisme ni nouvelle navigation. Taux généralistes par carte : fer 56,1 %, cuivre 25,5 %, argent 15 %, or 3 %, lapis-lazuli 0,4 %, avec renormalisation dans les thèmes. Les raretés restent éditorialement provisoires, distinctes des droits maintenant vérifiés.

## Extension approuvée — Arts décoratifs et passe-partout neutre

Ce contrat remplace l’attente de cadres Arts décoratifs ci-dessus : cinq variantes Art nouveau générées à la demande, iris et ginkgo, fer/cuivre/argent/or/lapis-lazuli. Trente cadres actifs, sans modifier les originaux fournis ni les cinq Japon non exploitables. Le choix explicite « Papier neutre » ajoute un masque intérieur issu du vrai alpha de chaque cadre : `--mat`, ivoire #eeece4 ou brun-bordeaux #48212e, et marge de 3 % dans la fenêtre sûre. Œuvre entière en contain ; aucun cadre étiré, aucun recadrage, aucune nouvelle palette ni migration de sauvegarde. Les trois raretés actuellement présentes en Arts décoratifs utilisent fer, cuivre et argent ; or et lapis restent prêts sans promotion artificielle d’œuvres. Dos cachés sans cadre ni masque chargé. Revue et preuves : `.impeccable/review/cadres-passe-partout.md`.
