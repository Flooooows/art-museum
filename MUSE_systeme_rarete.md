# MUSE | Système de rareté artistique

> **Document de conception** — Proposition de méthode basée sur la notoriété réelle des œuvres d’art et les données publiques pour déterminer la rareté des cartes MUSE.

Pour MUSE, l'algorithme de rareté est basé sur la **notoriété réelle des œuvres d’art**, à partir de données récupérées sur Internet.

- **La Joconde**, mondialement connue, serait **légendaire**.
- Une œuvre de **Monet** moins emblématique pourrait être **rare** ou **épique**.
- Une œuvre peu connue pourrait être **commune**.

**Attention :** la célébrité d’une œuvre, sa valeur artistique et la rareté de sa carte sont trois notions distinctes.

## 1. Un score de notoriété artistique sur 100

| Critère | Poids | Ce qu’on mesure |
|---|---:|---|
| Popularité sur Internet (`P`) | 30 % | Consultations Wikipédia et intérêt de recherche |
| Notoriété de l’artiste (`A`) | 25 % | Renommée et reconnaissance de l’artiste |
| Importance historique (`H`) | 20 % | Influence et références en histoire de l’art |
| Reconnaissance institutionnelle (`M`) | 15 % | Présence dans les grands musées et leurs publications |
| Présence culturelle (`C`) | 10 % | Références publiques, publications et mentions |

**Formule :**

```text
S = 0.30 * P + 0.25 * A + 0.20 * H + 0.15 * M + 0.10 * C
```

- `P`, `A`, `H`, `M` et `C` sont chacun normalisés sur une échelle de **0 à 100**.
- Le score final `S` est compris entre **0 et 100**.
- La **valeur marchande** d’une œuvre n’est **pas** assimilée à sa notoriété.

## 2. Les cinq niveaux de rareté MUSE

| Rareté | Score proposé | Interprétation |
|---|---:|---|
| Commune | 0–39 | Œuvres peu connues du grand public |
| Peu commune | 40–59 | Œuvres reconnues dans certains milieux |
| Rare | 60–74 | Œuvres relativement célèbres |
| Épique | 75–89 | Œuvres emblématiques |
| Légendaire | 90–100 | Icônes mondiales de l’art |

> Ces seuils sont des **propositions** et ne proviennent pas d’un calcul effectué sur un catalogue réel.

## 3. Exemples illustratifs

| Œuvre | Niveau | Score fictif | Pourquoi |
|---|---|---:|---|
| La Joconde — Léonard de Vinci | Légendaire | 99/100 | Reconnaissance mondiale et importance historique majeure |
| La Nuit étoilée — Vincent van Gogh | Légendaire | 97/100 | Œuvre identifiable et très présente dans la culture populaire |
| Impression, soleil levant — Claude Monet | Épique | 87/100 | Importance historique considérable, notoriété publique moins universelle |

**Important :** ces scores sont **purement illustratifs**, pas des résultats mesurés.

## 4. Les données Internet à récupérer

| Source | Utilisation |
|---|---|
| [Wikidata](https://www.wikidata.org/) | Identifier l’œuvre, l’artiste, le musée, les dates et les identifiants |
| [Wikimedia Pageviews](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/concepts/page-views.html) | Évaluer les consultations des pages consacrées à l’œuvre et à l’artiste |
| [Google Trends](https://trends.google.com/trends/) | Mesurer l’intérêt relatif du public sur une période et dans une zone définies |

### Pipeline de traitement côté serveur

1. **Identifier** l’œuvre de manière non ambiguë.
2. **Collecter** les données publiques disponibles.
3. **Normaliser et vérifier** les informations collectées.
4. **Calculer** le score de notoriété `S`.
5. **Attribuer** le niveau de rareté MUSE en utilisant les seuils du point 2.

### Précautions

- **Google Trends** mesure un intérêt **relatif**, pas le nombre absolu de recherches. Comparer sur la **même période** et dans la **même zone géographique**.
- Les **données manquantes** ne doivent **pas** entraîner automatiquement le classement d’une œuvre comme **commune**.

---

*Document de référence MUSE pour Codex. Contient uniquement les sections 1 à 4 de la version PDF révisée.*
