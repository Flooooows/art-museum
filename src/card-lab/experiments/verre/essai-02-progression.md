# Verre — essai 02 : progression des détails par rareté

Même test que le [Japon, essai 02](../japon/essai-02-progression.md), appliqué aux arts du verre. Les séries Égypte et Paléolithique servent de repères du fer au lapis ; le premier essai Verre fournit l’identité thématique. La planche Japon essai 02 est également fournie comme référence de progression.

**Cinq générations indépendantes, pas cinq recolorations :**

- **Fer :** texture forgée et vieillie, gravures et bas-reliefs sobres, motifs de verrerie lisibles sans richesse excessive.
- **Cuivre :** patine chaude, repoussé, jonctions et accents davantage travaillés.
- **Argent :** ciselures nettes, gravures de facettes plus précises, moulures maîtrisées et motifs affinés.
- **Or :** modelé plus riche, coins et transitions plus sculptés, verrerie et travail du verre intégrés au décor.
- **Lapis :** incrustations bleues bordées d’or, résolution fine des facettes et accents opalescents, sans accumulation arbitraire de gros bijoux.

Le dessin, les coins et la silhouette peuvent varier ; la parenté de famille et une grande ouverture restent recherchées. Un verre à pied, une carafe, le cristal taillé et la verrerie doivent rester reconnaissables, sans devenir les éléments structurels géants du cadre.

## Fichiers de revue

- `essai-02-fer.png`, `essai-02-cuivre.png`, `essai-02-argent.png`, `essai-02-dore.png`, `essai-02-lapis-lazuli.png` : sources générées.
- `essai-02-cinq-raretes.png` : comparaison complète.
- `essai-02-details.png` : détails du haut et des côtés.
- `essai-02-progression.json` : jobs, références, empreintes et contrôles.

Après réception des cinq images, `node --import tsx src/card-lab/experiments/verre/prepare-essai-02.ts` prépare uniquement la comparaison et la provenance, sans modifier les sources.

**Aucune intégration ni publication.** Le premier essai et les cadres actuellement intégrés au lab restent inchangés. Cette progression reste à examiner avant toute adoption.
