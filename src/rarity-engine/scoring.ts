import {
  clamp,
  interpolateKnots,
  normalizeAudience,
  normalizeCreatorAudience,
} from "./normalization";
import {
  CRITERIA,
  type ArtworkInput,
  type CriterionResult,
  type DirectResults,
  type EngineConfig,
  type Evidence,
  type MonthlyAudience,
  type ReferenceCatalog,
} from "./types";

export function deduplicateEvidence(evidence: Evidence[]): Evidence[] {
  return [
    ...new Map(
      evidence.map((item) => [
        `${item.independentGroup}:${item.url}:${item.scope}`,
        item,
      ]),
    ).values(),
  ];
}

export function median(values: number[]): number {
  if (!values.length) throw new Error("Médiane sans observation refusée.");
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function criterion(
  value: Omit<
    CriterionResult,
    "lower" | "upper" | "consistency" | "comparableIds"
  > & {
    lower?: number;
    upper?: number;
    halfWidth?: number;
    consistency?: number;
    comparableIds?: string[];
  },
): CriterionResult {
  if (!Number.isFinite(value.score) || value.score < 0 || value.score > 100)
    throw new Error("Score de critère invalide.");
  if (
    [value.sourceQuality, value.observedShare, value.consistency ?? 1].some(
      (v) => !Number.isFinite(v) || v < 0 || v > 1,
    )
  )
    throw new Error("Qualité/couverture/cohérence de critère invalide.");
  const { halfWidth = 15, ...rest } = value;
  const score = clamp(value.score);
  const lower = clamp(value.lower ?? score - halfWidth);
  const upper = clamp(value.upper ?? score + halfWidth);
  if (lower > score || upper < score || lower > upper)
    throw new Error("Intervalle de critère incohérent.");
  return {
    ...rest,
    score,
    lower,
    upper,
    consistency: value.consistency ?? 1,
    comparableIds: value.comparableIds ?? [],
    evidence: deduplicateEvidence(value.evidence),
  };
}

function annualAudience(pages: MonthlyAudience[], days: number) {
  if (!pages.length) return null;
  let total = 0,
    lower = 0,
    upper = 0,
    observedMonths = 0,
    expectedMonths = 0;
  for (const page of pages) {
    const expected = new Set(page.expectedMonths);
    const items = page.months;
    if (
      !expected.size ||
      new Set(items.map((m) => m.timestamp)).size !== items.length ||
      items.some(
        (m) =>
          !expected.has(m.timestamp) ||
          !Number.isSafeInteger(m.views) ||
          m.views < 0,
      )
    )
      throw new Error("Mois d’audience invalides ou dupliqués.");
    if (!items.length) return null;
    const seen = items.reduce((sum, month) => sum + month.views, 0);
    const missing = expected.size - items.length;
    const middle = median(items.map((m) => m.views));
    const high = Math.max(middle * 4, ...items.map((m) => m.views), 1);
    total += seen + missing * middle;
    lower += seen;
    upper += seen + missing * high;
    observedMonths += items.length;
    expectedMonths += expected.size;
  }
  return {
    total,
    lower,
    upper,
    daily: total / days,
    complete: observedMonths === expectedMonths,
    observedShare: observedMonths / expectedMonths,
    observedMonths,
    expectedMonths,
  };
}

export function audienceCriterion(
  pages: MonthlyAudience[],
  work: ArtworkInput,
  config: EngineConfig,
  days: number,
  reference?: ReferenceCatalog,
  scale = 1,
  subject: "artwork" | "creator" = "artwork",
): CriterionResult | undefined {
  const annual = annualAudience(pages, days);
  if (!annual) return;
  const normalize = (daily: number) =>
    subject === "creator"
      ? normalizeCreatorAudience(daily, config, reference, scale)
      : normalizeAudience(daily, work.category, config, reference, scale);
  const normalization = normalize(annual.daily);
  const normalizedLower = normalize(annual.lower / days).score;
  const normalizedUpper = normalize(annual.upper / days).score;
  const uncertainty =
    config.normalization.uncertaintyPoints + (annual.complete ? 0 : 8);
  return criterion({
    score: normalization.score,
    lower: normalizedLower - uncertainty,
    upper: normalizedUpper + uncertainty,
    type: annual.complete ? "derived" : "estimated",
    method: annual.complete
      ? "normalized-human-pageviews"
      : "partial-months-median-estimate",
    sourceTier: 1,
    sourceQuality: annual.complete ? 0.9 : 0.6,
    observedShare: annual.observedShare,
    evidence: pages.flatMap((page) => page.evidence),
    rawIndicators: {
      annualViews: annual.complete ? annual.total : null,
      estimatedAnnualViews: annual.complete ? null : annual.total,
      observedMonths: annual.observedMonths,
      expectedMonths: annual.expectedMonths,
      globalScore: normalization.globalScore,
      categoryScore: normalization.categoryScore,
      categoryReferenceAvailable: normalization.categoryReferenceAvailable,
      normalizationProvisional: normalization.provisional,
    },
    notes: [
      "Vues humaines des pages précisément identifiées, pas nombre de personnes reconnaissant l’œuvre.",
      ...(annual.complete
        ? []
        : [
            "Mois absents estimés depuis les mois disponibles ; aucun titre antérieur ou série substitué. Plage élargie pour l’extrapolation.",
          ]),
      ...(normalization.provisional
        ? [
            "Normalisation provisoire sans référentiel représentatif ; perspectives globales/catégorielles non empiriquement calibrées.",
          ]
        : []),
    ],
  });
}

function institutionalRecognition(
  work: ArtworkInput,
  config: EngineConfig,
): CriterionResult | undefined {
  const s = work.institutionSignals;
  if (!s.publicRecord || !s.collectionVerified) return;
  const c = config.indicators;
  const citationCount =
    s.citations === null
      ? null
      : new Set(s.citations.map((item) => item.key)).size;
  const exhibitionCount =
    s.exhibitions === null
      ? null
      : new Set(s.exhibitions.map((item) => item.key)).size;
  const missing =
    Number(citationCount === null) +
    Number(exhibitionCount === null) +
    Number(s.highlight === null);
  const score =
    c.collectionPoints +
    c.publicRecordPoints +
    (s.highlight === null
      ? c.missingHighlightPoints
      : s.highlight
        ? c.highlightPoints
        : 0) +
    (exhibitionCount === null
      ? c.missingExhibitionPoints
      : Math.min(
          c.exhibitionMaximum,
          (c.exhibitionMaximum * Math.log1p(exhibitionCount)) / Math.log1p(10),
        )) +
    (citationCount === null
      ? c.missingPublicationPoints
      : Math.min(
          c.publicationMaximum,
          (c.publicationMaximum * Math.log1p(citationCount)) / Math.log1p(30),
        ));
  return criterion({
    score: Math.min(c.institutionMaximum, score),
    halfWidth: c.institutionHalfWidth + missing * 4,
    type: missing ? "estimated" : "derived",
    method: "deduplicated-institution-signals",
    sourceTier: 1,
    sourceQuality: 0.85 - 0.08 * missing,
    observedShare: 1 - 0.2 * missing,
    evidence: work.institutionEvidence,
    rawIndicators: {
      collectionVerified: s.collectionVerified,
      publicRecord: s.publicRecord,
      highlight: s.highlight,
      distinctExhibitions: exhibitionCount,
      distinctPublications: citationCount,
      estimatedComponents: missing,
    },
    notes: [
      "La seule collection et sa notice valent les composantes configurées, pas une reconnaissance maximale.",
      "Références et événements dédupliqués ; une source répétée n’ajoute pas de reconnaissance.",
      ...(missing
        ? [
            "Listes non documentées : contributions provisoires explicites de configuration, pas compteurs à zéro. Intervalle élargi ; ce critère est estimé.",
          ]
        : []),
    ],
  });
}

export function scoreDirect(
  work: ArtworkInput,
  config: EngineConfig,
  days: number,
  reference?: ReferenceCatalog,
  scale = 1,
): DirectResults {
  const result: DirectResults = {};
  const popularity = audienceCriterion(
    work.workAudience,
    work,
    config,
    days,
    reference,
    scale,
  );
  if (popularity) result.P = popularity;
  if (work.creatorMode === "identified" && work.artistAudiences.length) {
    const artists = work.artistAudiences.map((pages) =>
      audienceCriterion(pages, work, config, days, reference, scale, "creator"),
    );
    if (artists.every((artist): artist is CriterionResult => !!artist)) {
      const mean = (
        field: "score" | "lower" | "upper" | "observedShare" | "sourceQuality",
      ) =>
        artists.reduce((sum, artist) => sum + artist[field], 0) /
        artists.length;
      const commercial = /Tiffany\s*&\s*Co|Maison|Brothers|Studios/i.test(
        work.creator,
      );
      result.A = criterion({
        score: mean("score"),
        lower: mean("lower") - (commercial ? 10 : 0),
        upper: mean("upper") + (commercial ? 10 : 0),
        type: artists.some((a) => a.type === "estimated")
          ? "estimated"
          : "derived",
        method: "identified-creator-audience-mean",
        sourceTier: 2,
        sourceQuality: commercial ? 0.6 : mean("sourceQuality"),
        observedShare: mean("observedShare"),
        evidence: artists.flatMap((a) =>
          a.evidence.map((e) => ({
            ...e,
            tier: 2 as const,
            scope: "creator" as const,
          })),
        ),
        rawIndicators: {
          creators: artists.length,
          commercialAudienceRisk: commercial,
          normalizationProvisional: artists.some(
            (a) => a.rawIndicators.normalizationProvisional === true,
          ),
        },
        notes: [
          "Audience du créateur, distincte de celle de l’objet ; aucune transmission à P sans atténuation explicite.",
          "Les auteurs ne sont jamais normalisés contre un référentiel de consultations d’œuvres. Sans référence d’auteurs, courbe provisoire globale dédiée.",
          ...(commercial
            ? [
                "Trafic commercial potentiellement étranger à la création artistique : intervalle élargi et qualité réduite.",
              ]
            : []),
        ],
      });
    }
  }
  const citations = work.institutionSignals.citations;
  if (citations?.length) {
    const count = new Set(citations.map((item) => item.key)).size;
    result.H = criterion({
      score: interpolateKnots(count, config.indicators.historyCitationKnots),
      halfWidth: config.indicators.historyProxyHalfWidth,
      type: "derived",
      method: "specific-scholarly-documentation-proxy",
      sourceTier: 1,
      sourceQuality: 0.65,
      observedShare: 0.65,
      evidence: work.institutionEvidence,
      rawIndicators: { distinctScholarlyReferences: count },
      notes: [
        "Indice de documentation historique spécifique, non mesure directe de l’influence ou de l’innovation. Plage large pour cette différence.",
        "Ni célébrité de l’auteur ni ancienneté de l’objet utilisée pour attribuer H.",
      ],
    });
  }
  const institution = institutionalRecognition(work, config);
  if (institution) result.M = institution;
  if (work.institutionSignals.educationText)
    result.C = criterion({
      score: config.indicators.educationOnlyCultureScore,
      halfWidth: config.indicators.educationOnlyCultureHalfWidth,
      type: "derived",
      method: "documented-education-resource-only",
      sourceTier: 1,
      sourceQuality: 0.65,
      observedShare: 0.7,
      evidence: work.institutionEvidence,
      rawIndicators: { educationResource: true },
      notes: [
        "Médiation pédagogique spécifiquement identifiée ; ne prouve pas une influence populaire universelle.",
      ],
    });
  for (const key of CRITERIA) {
    const review = work.editorial[key];
    if (!review) continue;
    const previous = result[key];
    const difference = previous ? Math.abs(previous.score - review.score) : 0;
    result[key] = criterion({
      score: review.score,
      halfWidth:
        config.indicators.editorialHalfWidth +
        Math.max(0, difference - config.confidence.conflictTolerance) / 2,
      type: "estimated",
      method: "sourced-unvalidated-editorial-assessment",
      sourceTier: 1,
      sourceQuality: 0.7,
      observedShare: 0,
      consistency: Math.max(0.3, 1 - difference / 100),
      evidence: review.evidence,
      rawIndicators: {
        priorDerivedScore: previous?.score ?? null,
        sourceDisagreement: difference,
      },
      notes: [
        review.reason,
        "Appréciation éditoriale antérieure sourcée mais non validée ; jamais présentée comme mesure réelle.",
        ...(difference > config.confidence.conflictTolerance
          ? ["Écart avec l’indice documentaire automatique : revue nécessaire."]
          : []),
      ],
    });
  }
  return result;
}
