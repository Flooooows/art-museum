# Validation juridique automatique — Union européenne

## Ce que fait MUSE

Le moteur `src/legal-eu/` prend une **date explicite et des faits sourcés**, puis classe chaque dossier :

- **AUTO_APPROVED_EU** : admissible pour le périmètre commercial UE documenté, sans nouvelle confirmation humaine. Les crédits et autres obligations affichés restent applicables.
- **REVIEW_REQUIRED** : une condition précise manque ou une exception demande un autre calcul. Ce n'est pas une demande de reconfirmer une ancienne date de décès déjà établie.
- **BLOCKED** : protection non expirée sans permission adaptée, ou restriction incompatible identifiée. Ne pas publier le fichier. Les cartes bloquées n'affichent pas leur image dans la revue.

Les badges, filtres, justifications et téléchargement des dossiers sont intégrés à la revue des 1 000 œuvres et aux deux lots de candidates. Les cartes ne chargent pas leur image avant réception d'un dossier juridique valide. Un dossier absent, altéré, périmé ou lié à un autre catalogue ne donne jamais un feu vert automatique.

**Cette décision ne change ni la rareté, ni la sélection artistique, ni les exports humains. Elle n'active aucune carte et n'autorise pas à elle seule sa publication dans le jeu.** Les catalogues historiques et leurs versions restent inchangés ; le nouveau rapport est un fichier complémentaire. L'admissibilité concerne l'œuvre et le fichier précis, pas tout fichier trouvé sous le même titre, une adaptation future ou un usage hors UE.

## Règles appliquées

### Durée ordinaire

[Directive 2006/116/CE](https://eur-lex.europa.eu/eli/dir/2006/116/oj), articles 1 et 8 : décès + 70 ans, puis entrée le **1er janvier de l'année suivante**. Un décès en 1955 donne ainsi le 1er janvier 2026. Le jour exact du décès n'est pas nécessaire à ce calcul annuel ; une année certaine et sourcée suffit. Les années approximatives, contradictoires ou dans le futur ne passent pas.

Les auteurs identifiés par une institution fiable peuvent être traités à partir de ses champs biographiques structurés ; une corroboration Wikidata disponible est ajoutée. Deux pages recopiant la même information ne sont pas présentées comme deux sources indépendantes. Un désaccord n'est pas résolu arbitrairement en choisissant la date la plus ancienne.

### L'UE n'est pas un délai unique sans exceptions

Les articles 7 et 10 ne permettent pas d'ignorer certaines durées anciennes et obligations internationales. En particulier, l'[Espagne, disposition transitoire 4](https://www.boe.es/buscar/act.php?id=BOE-A-1996-8930#dtcuarta), conserve des durées antérieures pour les auteurs décédés avant le 7 décembre 1987 ; la loi de 1879 prévoyait 80 ans. Le moteur applique un **contrôle conservateur de 80 ans**, sans inventer une règle de 80 ans uniforme dans toute l'UE ni raccourcir la protection d'après le seul pays d'origine.

Par conséquent, **Kahlo (1954) satisfait la règle générale au 1er janvier 2025 mais n'obtient pas automatiquement un feu vert pour toute l'UE** dans ce parcours. L'applicabilité des transitions et du régime des œuvres étrangères mérite un contrôle ciblé, pas une nouvelle vérification de sa date de décès. Picasso (1973) reste bloqué dans le parcours domaine public ; une éventuelle licence du fichier photo ne suffit pas.

Les profils français décédés depuis 1914 sont orientés vers un examen des prorogations, notamment [CPI, articles L123-8 à L123-10](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069414/LEGISCTA000006161638/). Un profil documentaire de Monet, décès institutionnel en 1926 corroboré avec Wikidata, est réutilisé entre ses tableaux au lieu de demander la même vérification pour chacun. Ce dispositif n'est pas un recensement exhaustif et définitif des 27 législations : une particularité pertinente nouvellement identifiée doit faire réviser le profil et les dossiers affectés.

### Fichier image et article 14

[Directive 2019/790/UE, article 14](https://eur-lex.europa.eu/eli/dir/2019/790/oj) : une reproduction fidèle **non originale** d'une œuvre d'art visuel dont la protection a expiré n'acquiert normalement pas un nouveau droit d'auteur ou droit voisin. `ARTICLE_14` est une **justification légale, pas une licence inventée**.

Le moteur distingue reproduction fidèle, photographie originale et originalité non qualifiée. Une photographie originale exige une permission propre. Une licence CC0 ou CC BY / BY-SA prise en charge peut rendre le fichier réutilisable sans devoir résoudre son originalité ; elle ne libère pas les droits d'un artiste tiers encore protégé. Les URL et versions de licences doivent correspondre exactement. Un simple « Open Access », une page de musée ou une mention « domaine public aux États-Unis » ne suffisent pas pour l'œuvre dans toute l'UE.

Une mention restrictive isolée n'est pas traitée comme une preuve de copyright sur un scan fidèle : les obligations contractuelles ou autres droits invoqués passent en revue. Une interdiction commerciale applicable, elle, bloque le dossier. Les questions de biens culturels d'institutions publiques italiennes sont distinctes du copyright. Les crédits, le partage à l'identique des adaptations de fichiers BY-SA, le nom de l'auteur et les droits moraux nationaux restent indiqués et à respecter.

### Publication et contributions supplémentaires

L'article 4 de 2006/116 peut protéger une première publication/communication licite postérieure à l'expiration du copyright pendant 25 ans ; l'article 5 prévoit certains droits d'édition scientifique/critique. **Une date de création ne prouve pas une publication.** Le collecteur réutilise des dates institutionnelles d'expositions anciennes ou des références explicitement illustrées, avec une marge calendaire conservatrice. Une réédition de 2025 sur une œuvre de 1810 ne devient pas une preuve de publication en 1810.

Coauteurs, anonymat/pseudonyme, attribution incertaine, édition, restauration signalée, composant d'une œuvre composite et autres contributions suivent un parcours complémentaire. Un auteur très ancien ne suffit pas à lever ces incertitudes.

## Données, preuves et reproductibilité

- `src/legal-eu/model.ts` : fonctions pures, schéma des faits, calcul des dates et trois statuts.
- `src/legal-eu/publication.ts` : reconnaissance conservatrice des références bibliographiques utilisables.
- `scripts/legal-eu/build.ts` : adaptation des preuves institutionnelles et des fichiers déjà conservés ; aucun recalcul de rareté, collecte d'audience ou changement de catalogue.
- `catalog/legal-eu/sources/` : captures de textes et politiques effectivement reçus, URL, date et SHA-256. Les réponses EUR-Lex vides déjà présentes dans les anciennes recherches ne sont **pas** des preuves utilisées ici : les articles des directives sont conservés depuis le miroir officiel britannique de leur texte adopté, avec liens EUR-Lex vers le droit de l'UE.
- `catalog/legal-eu/runs/<sha256>/report.json` : résultat figé, non écrasable ; `evidence.json` : empreintes des entrées, captures, fichiers locaux contrôlés et code du calcul.
- `public/legal-eu/report.json` : rapport courant téléchargeable, avec auteurs, années et sources de décès, date ordinaire calculée, règles, fichiers exacts, licences/justifications, contrôles, motifs, crédits, territoire et date de vérification.

Le rapport est lié aux versions **et empreintes complètes des trois catalogues** ainsi qu'aux identifiants, titres, auteurs et fichiers de chaque fiche. Le navigateur recalcule les décisions depuis les faits et refuse les incohérences. Une durée de validité opérationnelle de 365 jours évite d'afficher indéfiniment un ancien feu vert : ce n'est pas une durée légale. Les faits de décès ne « périment » pas ; les politiques et restrictions doivent pouvoir être réexaminées.

Les droits historiques `cleared` des anciennes recherches ne sont pas convertis aveuglément en approbations toute UE. Les adaptateurs actuels couvrent surtout les notices structurées Cleveland et une partie des peintures du lot de 78. D'autres notices restent à compléter pour la publication ancienne, les conditions exactes du fichier ou les durées particulières, même si leur date de décès est déjà connue. Les cas non couverts restent visibles avec leurs motifs ; aucune licence n'est devinée à partir d'un nom ou de l'âge de l'œuvre.

## Commandes

```sh
npm run legal:build -- --as-of=2026-10-30
npm run legal:check
npm run check
npm run build:atelier
```

`legal:build` est une reconstruction **explicite**, hors réseau, des dossiers à partir des preuves existantes ; il conserve le résultat figé et remplace uniquement le rapport courant. Pour changer les conclusions, compléter/corriger les preuves et adaptateurs, pas un champ de statut final ni un export humain. Actualiser les captures des politiques avant une nouvelle vérification lorsque leur période de contrôle est dépassée.

`legal:check` et les tests recalculent les résultats sans écrire les données. Le build atelier doit vérifier puis copier ce rapport ; Hosting le sert sans cache. Le site de jeu exclut `legal-eu/**`. Aucun déploiement ni activation n'est déclenché par ces commandes de vérification.
