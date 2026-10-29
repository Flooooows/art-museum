import { CATEGORIES, CRITERIA, type EngineConfig, type Weights } from "./types";

const assert = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(`Configuration V2 invalide : ${message}`);
};
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const finite = (value: unknown, lower: number, upper: number) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= lower &&
  value <= upper;

export function validateWeights(value: Weights): void {
  assert(
    object(value) &&
      Object.keys(value).sort().join() === [...CRITERIA].sort().join(),
    "cinq poids P/A/H/M/C requis",
  );
  assert(
    Object.values(value).every((weight) => finite(weight, 0, 1)),
    "poids entre 0 et 1",
  );
  assert(
    Math.abs(
      Object.values(value).reduce((sum, weight) => sum + weight, 0) - 1,
    ) < 1e-10,
    "la somme des poids doit être 1 ; pas de renormalisation implicite",
  );
}

function validateKnots(knots: number[][], maximum = 100): void {
  assert(
    Array.isArray(knots) && knots.length >= 2,
    "au moins deux points de normalisation",
  );
  for (const [index, pair] of knots.entries()) {
    assert(
      Array.isArray(pair) &&
        pair.length === 2 &&
        finite(pair[0], 0, Number.MAX_SAFE_INTEGER) &&
        finite(pair[1], 0, 100),
      "points de normalisation invalides",
    );
    if (index)
      assert(
        pair[0] > knots[index - 1][0] && pair[1] >= knots[index - 1][1],
        "courbe croissante requise",
      );
  }
  assert(
    knots[0][0] === 0 && knots.at(-1)![1] <= maximum,
    "courbe bornée attendue",
  );
}

export function parseEngineConfig(value: unknown): EngineConfig {
  assert(object(value), "objet attendu");
  const c = value as EngineConfig;
  assert(
    c.algorithmVersion === "2.0.0" &&
      typeof c.configurationVersion === "string" &&
      c.configurationVersion.length > 0,
    "versions requises",
  );
  assert(c.mode === "simulation", "seul le mode simulation est autorisé");
  assert(
    typeof c.issuedAt === "string" && Number.isFinite(Date.parse(c.issuedAt)),
    "date de configuration requise",
  );
  validateWeights(c.weights);
  assert(
    Array.isArray(c.thresholds) &&
      c.thresholds.length === 4 &&
      c.thresholds.every(
        (v, i) => finite(v, 0.01, 99.99) && (!i || v > c.thresholds[i - 1]),
      ),
    "quatre seuils croissants",
  );
  assert(
    JSON.stringify(c.rarities) ===
      JSON.stringify([
        "Esquisse",
        "Étude",
        "Composition",
        "Œuvre",
        "Pièce maîtresse",
      ]),
    "noms MUSE à préserver",
  );
  for (const key of [
    "normalization",
    "estimation",
    "indicators",
    "confidence",
    "sensitivity",
    "providers",
  ] as const)
    assert(object(c[key]), `${key} requis`);
  assert(
    ["provisional", "reference-percentiles"].includes(c.normalization.mode),
    "mode de normalisation inconnu",
  );
  assert(
    c.normalization.referenceFile === null ||
      typeof c.normalization.referenceFile === "string",
    "référence de normalisation invalide",
  );
  if (c.normalization.mode === "reference-percentiles")
    assert(
      !!c.normalization.referenceFile,
      "fichier de référence obligatoire pour percentiles",
    );
  validateKnots(c.normalization.dailyViewKnots);
  validateKnots(c.normalization.creatorDailyViewKnots);
  validateKnots(c.indicators.historyCitationKnots);
  for (const key of [
    "minimumReferenceSize",
    "minimumCategorySize",
    "minimumCreatorReferenceSize",
  ] as const)
    assert(
      Number.isInteger(c.normalization[key]) && c.normalization[key] >= 2,
      `${key} invalide`,
    );
  assert(
    finite(c.normalization.categoryBlend, 0, 1) &&
      finite(c.normalization.uncertaintyPoints, 0, 50),
    "incertitude/poids de catégorie invalides",
  );
  assert(
    object(c.normalization.categoryDailyScale) && object(c.estimation.priors),
    "catégories requises",
  );
  for (const category of CATEGORIES) {
    assert(
      finite(c.normalization.categoryDailyScale[category], 0.01, 100),
      "échelle de catégorie invalide",
    );
    const prior = c.estimation.priors[category];
    assert(object(prior), `distribution absente pour ${category}`);
    for (const criterion of CRITERIA) {
      const points = prior[criterion];
      assert(
        Array.isArray(points) &&
          points.length === 3 &&
          points.every((p) => finite(p, 0, 100)) &&
          points[0] <= points[1] &&
          points[1] <= points[2],
        `distribution ${category}/${criterion} invalide`,
      );
    }
  }
  for (const key of [
    "minimumPeers",
    "minimumPopularityPeers",
    "priorStrength",
  ] as const)
    assert(
      Number.isInteger(c.estimation[key]) && c.estimation[key] > 0,
      `${key} invalide`,
    );
  for (const [key, number] of Object.entries(c.estimation))
    if (typeof number === "number")
      assert(finite(number, 0.01, 100), `estimation.${key} invalide`);
  assert(
    finite(c.estimation.minimumPeerQuality, 0, 1),
    "qualité minimale invalide",
  );
  assert(
    object(c.estimation.contextSignals) &&
      [
        "highlightUplift",
        "minimumScholarlyReferences",
        "scholarlyUplift",
        "minimumExhibitions",
        "exhibitionUplift",
        "maximumUplift",
      ].every((key) =>
        finite(
          c.estimation.contextSignals[
            key as keyof typeof c.estimation.contextSignals
          ],
          0,
          100,
        ),
      ),
    "indices de contexte invalides",
  );
  assert(
    c.estimation.contextSignals.minimumScholarlyReferences >= 1 &&
      c.estimation.contextSignals.minimumExhibitions >= 1,
    "preuves positives requises pour le contexte",
  );
  for (const [key, number] of Object.entries(c.indicators))
    if (typeof number === "number")
      assert(finite(number, 0, 100), `indicators.${key} invalide`);
  const componentKeys = [
    "coverage",
    "sourceQuality",
    "identification",
    "observedShare",
    "precision",
    "consistency",
  ];
  assert(
    object(c.confidence.componentWeights) &&
      Object.keys(c.confidence.componentWeights).sort().join() ===
        componentKeys.sort().join(),
    "composantes de confiance invalides",
  );
  const componentWeights = Object.values(c.confidence.componentWeights);
  assert(
    componentWeights.every((w) => finite(w, 0, 1)) &&
      Math.abs(componentWeights.reduce((a, b) => a + b, 0) - 1) < 1e-10,
    "poids de confiance invalides",
  );
  for (const key of [
    "confirmedMinimum",
    "minimumObservedCoverage",
    "maximumEstimatedWeight",
    "highEstimationWeight",
    "highEstimationConfidenceCap",
    "priorOnlyConfidenceCap",
    "provisionalNormalizationCap",
  ] as const)
    assert(finite(c.confidence[key], 0, 1), `confidence.${key} invalide`);
  assert(
    Number.isInteger(c.confidence.minimumIndependentGroups) &&
      c.confidence.minimumIndependentGroups >= 1 &&
      finite(c.confidence.thresholdMargin, 0, 25) &&
      finite(c.confidence.conflictTolerance, 0.1, 100),
    "seuils de revue invalides",
  );
  assert(
    Array.isArray(c.sensitivity.normalizationScales) &&
      c.sensitivity.normalizationScales.length > 0 &&
      c.sensitivity.normalizationScales.every((s) => finite(s, 0.01, 100)),
    "scénarios de normalisation invalides",
  );
  assert(object(c.sensitivity.weightProfiles), "profils de sensibilité requis");
  for (const weights of Object.values(c.sensitivity.weightProfiles))
    validateWeights(weights);
  for (const key of [
    "minimumIntervalMs",
    "timeoutMs",
    "maximumRetryAfterMs",
  ] as const)
    assert(finite(c.providers[key], 1, 300000), `providers.${key} invalide`);
  assert(
    typeof c.providers.userAgent === "string" &&
      c.providers.userAgent.length > 10,
    "User-Agent explicite requis",
  );
  for (const section of [
    c.normalization,
    c.estimation,
    c.indicators,
    c.confidence,
  ])
    assert(
      typeof section.rationale === "string" && section.rationale.length > 20,
      "justification de configuration requise",
    );
  return c;
}
