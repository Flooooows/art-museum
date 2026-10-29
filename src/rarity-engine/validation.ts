import { clamp } from "./normalization";
import { validateWeights } from "./configuration";
import {
  CRITERIA,
  type ArtworkInput,
  type ConfidenceDetails,
  type CriteriaResults,
  type EngineConfig,
  type Interval,
} from "./types";

export function rarityLevel(score: number, config: EngineConfig): number {
  if (!Number.isFinite(score) || score < 0 || score > 100)
    throw new Error("Score final attendu entre 0 et 100.");
  return config.thresholds.filter((threshold) => score >= threshold).length;
}

export function weightedInterval(
  criteria: CriteriaResults,
  config: EngineConfig,
): Interval & { score: number } {
  validateWeights(config.weights);
  let score = 0,
    lower = 0,
    upper = 0;
  for (const key of CRITERIA) {
    const value = criteria[key];
    if (
      !value ||
      !Number.isFinite(value.score) ||
      value.score < 0 ||
      value.score > 100 ||
      !Number.isFinite(value.lower) ||
      !Number.isFinite(value.upper) ||
      value.lower < 0 ||
      value.upper > 100 ||
      value.lower > value.score ||
      value.upper < value.score
    )
      throw new Error(
        `Critère/intervalle ${key} invalide ; aucune renormalisation autorisée.`,
      );
    score += config.weights[key] * value.score;
    lower += config.weights[key] * value.lower;
    upper += config.weights[key] * value.upper;
  }
  return { score: clamp(score), lower: clamp(lower), upper: clamp(upper) };
}

export function confidenceFor(
  work: ArtworkInput,
  criteria: CriteriaResults,
  config: EngineConfig,
): ConfidenceDetails {
  const weighted = (fn: (key: (typeof CRITERIA)[number]) => number) =>
    CRITERIA.reduce((sum, key) => sum + config.weights[key] * fn(key), 0);
  const estimatedWeight = weighted((key) =>
    criteria[key].type === "estimated" ? 1 : 0,
  );
  const groups = [
    ...new Set(
      CRITERIA.flatMap((key) =>
        criteria[key].evidence
          .filter((e) => e.scope !== "policy" && e.scope !== "context")
          .map((e) => e.independentGroup),
      ),
    ),
  ].sort();
  const components = {
    coverage: weighted((key) => criteria[key].observedShare),
    sourceQuality: weighted((key) => criteria[key].sourceQuality),
    identification: work.identity.confidence,
    observedShare: weighted((key) =>
      criteria[key].type === "observed"
        ? 1
        : criteria[key].type === "derived"
          ? criteria[key].observedShare
          : 0.25 * criteria[key].observedShare,
    ),
    precision: weighted(
      (key) => 1 - (criteria[key].upper - criteria[key].lower) / 100,
    ),
    consistency: weighted((key) => criteria[key].consistency),
  };
  let score = Object.entries(components).reduce(
    (sum, [key, value]) =>
      sum +
      config.confidence.componentWeights[key as keyof typeof components] *
        clamp(value, 0, 1),
    0,
  );
  const capsApplied: string[] = [];
  const cap = (maximum: number, label: string) => {
    if (score > maximum) {
      score = maximum;
      capsApplied.push(label);
    }
  };
  if (estimatedWeight >= config.confidence.highEstimationWeight)
    cap(
      config.confidence.highEstimationConfidenceCap,
      "majorité des poids estimés",
    );
  if (
    CRITERIA.every(
      (key) => criteria[key].method === "declared-contextual-prior",
    )
  )
    cap(
      config.confidence.priorOnlyConfidenceCap,
      "distributions initiales seules",
    );
  if (
    config.normalization.mode === "provisional" ||
    CRITERIA.some(
      (key) => criteria[key].rawIndicators.normalizationProvisional === true,
    )
  )
    cap(
      config.confidence.provisionalNormalizationCap,
      "normalisation non étalonnée sur référence externe",
    );
  return {
    score: clamp(score, 0, 1),
    components,
    estimatedWeight,
    independentGroups: groups,
    capsApplied,
  };
}

export function validationReasons(
  work: ArtworkInput,
  criteria: CriteriaResults,
  interval: Interval,
  score: number,
  confidence: ConfidenceDetails,
  stable: boolean,
  config: EngineConfig,
): string[] {
  const reasons: string[] = [];
  if (work.identity.status !== "verified")
    reasons.push("identification non vérifiée institutionnellement");
  if (confidence.score < config.confidence.confirmedMinimum)
    reasons.push("confiance insuffisante");
  if (
    confidence.components.coverage < config.confidence.minimumObservedCoverage
  )
    reasons.push("couverture observée insuffisante");
  if (confidence.estimatedWeight > config.confidence.maximumEstimatedWeight)
    reasons.push("part estimée trop élevée pour confirmation");
  if (
    confidence.independentGroups.length <
    config.confidence.minimumIndependentGroups
  )
    reasons.push("sources indépendantes insuffisantes");
  if (!stable) reasons.push("classement sensible à la calibration");
  if (
    rarityLevel(interval.lower, config) !== rarityLevel(interval.upper, config)
  )
    reasons.push("intervalle traversant plusieurs raretés");
  if (
    config.thresholds.some(
      (threshold) =>
        Math.abs(score - threshold) < config.confidence.thresholdMargin,
    )
  )
    reasons.push("proximité d’un seuil");
  if (CRITERIA.some((key) => criteria[key].consistency < 0.8))
    reasons.push("désaccord entre indices à relire");
  if (rarityLevel(score, config) === 4)
    reasons.push("candidature Pièce maîtresse : validation humaine requise");
  return reasons;
}
