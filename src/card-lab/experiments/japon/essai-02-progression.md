# Essai 02 — Japon : une progression de travail, pas seulement de couleur

Test local demandé après l’intégration de l’essai 01. **Aucun remplacement du lab, aucune publication ni push.** Le dessin commun et les recolorations de l’essai 01 restent intacts.

## Références confirmées par l’utilisateur

Les deux séries à examiner sont **Égypte et Paléolithique**, pas les deux cartes Van Gogh / Nymphéas ni les expériences Japon / Photo. Chaque série est observée dans ses cinq raretés existantes, du fer au lapis.

### Différences observées

- **Fer :** métal sombre et patiné, traits gravés et reliefs peu lumineux. L’Égypte a des coins assez simples et des registres incisés. Le Paléolithique privilégie la pierre irrégulière, les traces d’ocre, les ligatures et le silex.
- **Cuivre :** matière chaude et travaillée, moulures et jonctions plus résolues, reliefs repoussés, accents métalliques davantage modelés. Le Paléolithique devient plus symétrique et construit que son fer brut.
- **Argent :** ciselures plus nettes, arêtes et assemblages précis, métal clair ou ivoire contrasté. L’Égypte est même plus rectiligne et épurée que certaines autres variantes : le niveau ne se résume donc pas au nombre d’ornements.
- **Or :** lumière et modelé plus riches, coins et transitions plus sculptés. L’Égypte ajoute notamment des ornements de coins bien développés ; le Paléolithique affine ses motifs et ses moulures dorées.
- **Lapis :** contraste pierre bleue / métal doré, incrustations délimitées, motifs fins et précis, matière précieuse. Ce n’est pas nécessairement le cadre au contour le plus chargé : le contraste et la finition portent aussi le caractère exceptionnel.

## Transposition essayée pour le Japon

Cinq images sont générées séparément, avec la série japonaise comme identité de famille et les deux séries historiques comme repères de progression. Les planches de référence et les exemples de la matière visée sont fournis à chaque génération.

1. **Fer :** Japon reconnaissable, texture forgée et vieillie, gravure et bas-relief, moulures modestes ; pas un simple rectangle vide.
2. **Cuivre :** patine chaude, relief repoussé et jonctions travaillées, première étape de raffinement sans reproduire un cadre royal recoloré en brun.
3. **Argent :** ciselures précises, détails fins de bambou ou de plumage, structure claire et maîtrisée.
4. **Or :** relief plus sculptural, coins et accents coordonnés, ornements japonais enrichis, sans fond bleu réservé au lapis.
5. **Lapis :** pierre bleue et or, incrustations nettes, reliefs et motifs japonais finement résolus, sans accumulation arbitraire de bijoux ou d’objets.

Les compositions et silhouettes peuvent donc varier entre les raretés : **contrairement à l’essai 01, un alpha identique n’est pas recherché**. La parenté de famille, une grande ouverture et des proportions proches restent souhaitées. Ce test n’impose pas encore cette nouvelle méthode aux prochaines générations : il attend le retour de l’utilisateur.

## Fichiers

- `essai-02-fer.png`, `essai-02-cuivre.png`, `essai-02-argent.png`, `essai-02-dore.png`, `essai-02-lapis-lazuli.png` : générations indépendantes, sources conservées.
- `essai-02-cinq-raretes.png` : comparaison complète.
- `essai-02-details.png` : détails du haut et des côtés.
- `essai-02-progression.json` : jobs, empreintes, références et contrôles.
- `essai-02-references/` : copies des deux planches comparatives fournies au générateur.

Après réception des cinq générations, `node --import tsx src/card-lab/experiments/japon/prepare-essai-02.ts` prépare uniquement ces planches et la provenance. Il ne recolore pas les cadres et ne touche pas à l’intégration existante.
