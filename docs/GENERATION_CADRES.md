# Direction artistique des prochaines générations de cadres

## Références acceptées — consigne actuelle

L’utilisateur a accepté la direction artistique des expériences **Japon et Photographie**, y compris leurs cinq raretés. Pour toute nouvelle génération, **partir de ces images, pas des anciens briefs**.

**Étape suivante autorisée :** les 95 variantes examinées sont désormais intégrées au lab à la demande de l’utilisateur. Voir [l’intégration des palettes](INTEGRATION_PALETTES_LAB.md). Cette autorisation ne s’étend pas au jeu principal ni aux futures générations non examinées.

- [Japon — master](../src/card-lab/experiments/japon/essai-01.png) · [cinq finitions](../src/card-lab/experiments/japon/essai-01-cinq-finitions.png)
- [Photographie — master](../src/card-lab/experiments/photographie/essai-01.png) · [cinq finitions](../src/card-lab/experiments/photographie/essai-01-cinq-finitions.png)
- Les six cadres historiques approuvés, dans `src/card-lab/assets/refined-frames/`, restent les références de collection et sont immuables.

Le descriptif réutilisable et la requête de génération sont dans **`src/card-lab/generationStyle.ts`** : `frameGenerationRequest(theme)` fournit le texte et les huit images de référence, avec les deux expériences en premier. Les planches comparatives servent à vérifier les raretés, pas à générer une planche à la place d’un cadre.

## Ce qu’il faut retrouver

Un objet travaillé : moulures superposées, métal sculpté, gravures fines, matière minérale et reliefs lisibles. Le master associe le bleu lapis et l’or des expériences. L’ensemble est riche, mais garde des zones de respiration ; ne pas revenir à un cadre plat et générique.

Les motifs évoquent **directement le thème** et participent à une composition décorative continue. Les expériences montrent qu’un appareil, une pellicule, un éventail ou une grue peuvent devenir un motif sculpté cohérent. Ce ne sont ni des stickers ni des objets géants qui constituent les rails.

**Un thème, une composition propre.** Garder la parenté de matière et de travail, pas une disposition identique de motifs remplacés un à un. Les courbes, accents centraux, articulations de coins et éléments figuratifs sont autorisés : ne pas reconduire les anciennes interdictions générales de rubans, d’objets, de motifs végétaux ou de médaillons quand les expériences acceptées montrent leur intérêt. Leur pertinence dépend du thème, de leur échelle et de leur intégration.

Ne pas imposer une grille de quatre symboles, des séparateurs systématiques, des rails plats ou une quantité fixe de motifs. Ne pas copier les fleurs du Japon dans la photographie, ni les symboles d’une autre civilisation. Les sujets précis du prochain cadre se choisissent à partir de son thème ; les références donnent le style, pas un inventaire à recycler.

## Les cinq raretés

| Rareté | Fichier / matière | Traitement attendu |
| --- | --- | --- |
| Esquisse | `fer` | Fer sombre, reliefs et reflets métalliques lisibles |
| Étude | `cuivre` | Cuivre chaud, ombres patinées |
| Composition | `argent` | Argent clair et contrastes de métal sculpté |
| Œuvre | `dore` | Or lumineux, ombres chaudes |
| Pièce maîtresse | `lapis-lazuli` | Bleu minéral et reliefs dorés du master |

Un master validé, puis quatre adaptations de matière : conserver exactement dessin, silhouette, dimensions et alpha. La rareté ne doit ni ajouter des motifs, ni épaissir le cadre, ni changer son thème. Les deux expériences utilisent les couleurs des cadres Égypte existants pour les quatre finitions métalliques, par transfert des distributions de luminance. Le lapis est une copie exacte du master. Ce sont des adaptations de couleur déclarées, pas cinq générations indépendantes.

Le préparateur local est `src/card-lab/experiments/prepare-finishes.ts`. Ses sorties actuelles et leurs références exactes sont documentées dans chaque `essai-01-finitions.json`. Les anciennes recettes des éditions supprimées ne sont pas la référence artistique pour la suite.

## Format et contrôle avant validation

- Un seul cadre portrait, vue de face, environ 1024 × 1536.
- Grande ouverture centrale vide ; ouverture et extérieur réellement transparents.
- Aucun texte, logo, œuvre, photographie, plaque de titre remplie ou fond incrusté.
- Contrôler l’alpha et voir le cadre composé sur un fond uni : les couleurs RGB cachées des pixels transparents ne sont pas un fond à reproduire.
- Comparer le nouveau master aux deux expériences : relief, finesse, matières, lisibilité du thème et équilibre du décor.
- Vérifier les cinq finitions côte à côte, l’intégrité du master et l’alpha identique.

## Travail local et statut des anciens fichiers

Enregistrer les essais dans **`src/card-lab/experiments/<theme>/`**, sans écraser une version existante. Garder la source brute et les éventuelles adaptations séparées. Ne modifier ni le registre actif, ni les six familles historiques, ni les affectations ou raretés des œuvres.

**L’acceptation de cette direction artistique n’autorise pas une intégration, un déploiement Firebase, un commit ou un push.** Attendre une demande explicite pour ces opérations.

Les fichiers `generatedSpecs.ts`, `detailedSpecs.ts`, `prestigeSpecs.ts`, `themedSpecs.ts`, `museumSpecs.ts`, `decorativeSpecs.ts` et `friezeSpecs.ts` décrivent les anciennes éditions. Ils restent inchangés pour conserver leurs jobs, intentions et empreintes historiques. **Ne plus utiliser leurs briefs comme instructions de génération.** Leurs contraintes anciennes ne s’ajoutent pas à la présente direction. Les préparateurs et registres de conservation des six cadres approuvés restent, eux, nécessaires et ne sont pas remplacés.
