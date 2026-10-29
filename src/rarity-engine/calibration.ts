import { completeCriteria } from "./estimation";
import { scoreDirect } from "./scoring";
import { validateReference } from "./normalization";
import {
  confidenceFor,
  rarityLevel,
  validationReasons,
  weightedInterval,
} from "./validation";
import type {
  ArtworkInput,
  DirectResults,
  EngineConfig,
  Evidence,
  RarityResult,
  ReferenceCatalog,
} from "./types";
import { parseEngineConfig } from "./configuration";

export interface EngineOptions {
  days: number;
  period: { start: string; end: string };
  languages: string[];
  policyEvidence: Evidence;
  reference?: ReferenceCatalog;
}

function calculatePass(
  works: ArtworkInput[],
  config: EngineConfig,
  options: EngineOptions,
  scale = 1,
) {
  const direct = new Map<string, DirectResults>(
    works.map((work) => [
      work.id,
      scoreDirect(work, config, options.days, options.reference, scale),
    ]),
  );
  return new Map(
    works.map((work) => [
      work.id,
      completeCriteria(work, works, direct, config, options.policyEvidence),
    ]),
  );
}

export function simulateRarities(
  works: ArtworkInput[],
  config: EngineConfig,
  options: EngineOptions,
): {
  results: RarityResult[];
  rejected: { artworkId: string; reasons: string[] }[];
} {
  parseEngineConfig(config);
  if (!Number.isInteger(options.days) || options.days <= 0)
    throw new Error("Période d’audience positive requise.");
  const start = new Date(`${options.period.start}T00:00:00Z`);
  const end = new Date(`${options.period.end}T00:00:00Z`);
  const after = new Date(end.getTime() + 86400000);
  if (
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    end < start ||
    start.getUTCDate() !== 1 ||
    after.getUTCDate() !== 1 ||
    Math.round((end.getTime() - start.getTime()) / 86400000) + 1 !==
      options.days
  )
    throw new Error("Période complète et nombre de jours cohérents requis.");
  const expectedMonths: string[] = [];
  for (
    const cursor = new Date(start);
    cursor <= end;
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  )
    expectedMonths.push(
      cursor.toISOString().slice(0, 7).replace("-", "") + "0100",
    );
  if (expectedMonths.length !== 12)
    throw new Error("Douze mois complets comparables sont requis.");
  if (new Set(works.map((work) => work.id)).size !== works.length)
    throw new Error("Identifiants d’œuvre dupliqués.");
  if (config.normalization.mode === "reference-percentiles") {
    if (!options.reference)
      throw new Error("Référentiel de normalisation absent.");
    validateReference(
      options.reference,
      config,
      works.flatMap((work) => [
        work.id,
        ...work.externalIds.map((id) => id.id),
        ...work.externalIds.map((id) => `${id.provider}:${id.id}`),
        ...(work.creatorIds ?? []),
        ...(work.creatorIds ?? []).map((id) => `wikidata:${id}`),
      ]),
      options.period,
      options.languages,
    );
  }
  const rejected: { artworkId: string; reasons: string[] }[] = [];
  const eligible = works.filter((work) => {
    if (
      !work.id ||
      !work.title.trim() ||
      !work.institution.trim() ||
      ["ambiguous", "insufficient"].includes(work.identity.status) ||
      !work.displayDate.trim() ||
      (!work.creator.trim() && !work.context.trim())
    ) {
      rejected.push({
        artworkId: work.id,
        reasons: [
          ...work.identity.reasons,
          "métadonnées minimales ou identité insuffisantes pour une estimation raisonnable",
        ],
      });
      return false;
    }
    return true;
  });
  for (const work of eligible)
    for (const page of [...work.workAudience, ...work.artistAudiences.flat()]) {
      if ([...page.expectedMonths].sort().join() !== expectedMonths.join())
        throw new Error(
          `Fenêtre d’audience incompatible pour ${work.id} ; aucune combinaison de périodes différentes.`,
        );
    }
  const base = calculatePass(eligible, config, options);
  const scenarios: {
    name: string;
    config: EngineConfig;
    criteria: ReturnType<typeof calculatePass>;
  }[] = [];
  for (const scale of config.sensitivity.normalizationScales)
    scenarios.push({
      name: `audience-scale-${scale}`,
      config,
      criteria:
        scale === 1 ? base : calculatePass(eligible, config, options, scale),
    });
  for (const [name, weights] of Object.entries(
    config.sensitivity.weightProfiles,
  ))
    scenarios.push({
      name: `weights-${name}`,
      config: { ...config, weights },
      criteria: base,
    });
  const results = eligible.map((work) => {
    const criteria = base.get(work.id)!;
    const total = weightedInterval(criteria, config);
    const sensitivity = scenarios.map((scenario) => {
      const score = weightedInterval(
        scenario.criteria.get(work.id)!,
        scenario.config,
      ).score;
      return {
        profile: scenario.name,
        score,
        level: rarityLevel(score, scenario.config),
      };
    });
    const level = rarityLevel(total.score, config);
    const stable = sensitivity.every((scenario) => scenario.level === level);
    const confidence = confidenceFor(work, criteria, config);
    const reviewReasons = validationReasons(
      work,
      criteria,
      total,
      total.score,
      confidence,
      stable,
      config,
    );
    const p = criteria.P.rawIndicators;
    const globalP =
      typeof p.globalScore === "number" ? p.globalScore : criteria.P.score;
    const categoryP =
      typeof p.categoryScore === "number" ? p.categoryScore : criteria.P.score;
    const globalScore =
      total.score + config.weights.P * (globalP - criteria.P.score);
    const categoryScore =
      total.score + config.weights.P * (categoryP - criteria.P.score);
    return {
      artworkId: work.id,
      title: work.title,
      category: work.category,
      creatorMode: work.creatorMode,
      algorithmVersion: config.algorithmVersion,
      configurationVersion: config.configurationVersion,
      notorietyScore: total.score,
      rarityLevel: level,
      rarity: config.rarities[level],
      activeLevel: work.activeLevel,
      activeRarity: config.rarities[work.activeLevel],
      exploratoryScore: work.exploratoryScore,
      scoreInterval: { lower: total.lower, upper: total.upper },
      confidenceScore: confidence.score,
      confidence,
      status: reviewReasons.length
        ? ("provisional" as const)
        : ("confirmed" as const),
      criteria,
      perspectives: {
        globalScore,
        categoryScore,
        categoryReferenceAvailable: p.categoryReferenceAvailable === true,
      },
      sensitivity,
      stableClassification: stable,
      reviewReasons,
      masterpieceCandidate: level === 4,
      possibleRarities: config.rarities.slice(
        rarityLevel(total.lower, config),
        rarityLevel(total.upper, config) + 1,
      ),
      identity: work.identity,
    };
  });
  return { results, rejected };
}
