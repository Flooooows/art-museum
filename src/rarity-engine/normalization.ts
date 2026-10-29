import {
  CATEGORIES,
  type Category,
  type EngineConfig,
  type ReferenceCatalog,
} from "./types";

export function clamp(value: number, lower = 0, upper = 100): number {
  if (!Number.isFinite(value)) throw new Error("Nombre fini requis.");
  return Math.max(lower, Math.min(upper, value));
}

export function interpolateKnots(
  value: number,
  knots: number[][],
  logarithmic = false,
): number {
  if (!Number.isFinite(value) || value < 0)
    throw new Error("Indicateur non négatif requis.");
  if (value >= knots.at(-1)![0]) return knots.at(-1)![1];
  const index = knots.findIndex((pair) => pair[0] >= value);
  if (index <= 0) return knots[0][1];
  const [x0, y0] = knots[index - 1];
  const [x1, y1] = knots[index];
  const transform = logarithmic ? Math.log1p : (n: number) => n;
  return (
    y0 +
    ((y1 - y0) * (transform(value) - transform(x0))) /
      (transform(x1) - transform(x0))
  );
}

export function validateReference(
  reference: ReferenceCatalog,
  config: EngineConfig,
  excludedIds: string[],
  period: { start: string; end: string },
  languages: string[],
): void {
  if (
    !reference ||
    reference.representative !== true ||
    typeof reference.version !== "string" ||
    !reference.version.trim() ||
    typeof reference.provenance !== "string" ||
    !reference.provenance.trim() ||
    !Number.isFinite(Date.parse(reference.frozenAt))
  )
    throw new Error(
      "Référentiel externe figé, documenté et déclaré représentatif requis.",
    );
  if (
    !Array.isArray(reference.records) ||
    reference.records.length < config.normalization.minimumReferenceSize
  )
    throw new Error("Référentiel trop petit ; conserver le mode provisoire.");
  if (
    reference.period.start !== period.start ||
    reference.period.end !== period.end ||
    [...reference.languages].sort().join() !== [...languages].sort().join()
  )
    throw new Error("Période et langues du référentiel incompatibles.");
  const ids = reference.records.map((row) => row.id);
  if (
    new Set(ids).size !== ids.length ||
    ids.some((id) => excludedIds.includes(id))
  )
    throw new Error(
      "Chevauchement cible/référence ou références dupliquées : percentiles refusés.",
    );
  if (
    reference.records.some(
      (row) =>
        typeof row.id !== "string" ||
        !row.id.trim() ||
        !Number.isFinite(row.dailyViews) ||
        row.dailyViews < 0 ||
        !CATEGORIES.includes(row.category),
    )
  )
    throw new Error("Références invalides.");
  if (reference.creatorRecords) {
    const ids = reference.creatorRecords.map((row) => row.id);
    if (
      reference.creatorRecords.length <
        config.normalization.minimumCreatorReferenceSize ||
      new Set(ids).size !== ids.length ||
      ids.some((id) => excludedIds.includes(id)) ||
      reference.creatorRecords.some(
        (row) =>
          typeof row.id !== "string" ||
          !row.id.trim() ||
          !Number.isFinite(row.dailyViews) ||
          row.dailyViews < 0,
      )
    )
      throw new Error(
        "Référentiel d’auteurs insuffisant, invalide ou chevauchant les cibles.",
      );
  }
}

function percentile(value: number, values: number[]): number {
  return (
    (100 *
      (values.filter((v) => v < value).length +
        0.5 * values.filter((v) => v === value).length)) /
    values.length
  );
}

export function normalizeAudience(
  dailyViews: number,
  category: Category,
  config: EngineConfig,
  reference?: ReferenceCatalog,
  scale = 1,
) {
  if (
    !Number.isFinite(dailyViews) ||
    dailyViews < 0 ||
    !Number.isFinite(scale) ||
    scale <= 0
  )
    throw new Error("Audience/échelle invalide.");
  let globalScore: number;
  let categoryScore: number;
  let categoryReferenceAvailable = false;
  if (config.normalization.mode === "reference-percentiles") {
    if (!reference?.records.length)
      throw new Error("Aucun référentiel fourni pour les percentiles.");
    globalScore = percentile(
      dailyViews / scale,
      reference.records.map((row) => row.dailyViews),
    );
    const peers = reference.records.filter((row) => row.category === category);
    categoryReferenceAvailable =
      peers.length >= config.normalization.minimumCategorySize;
    categoryScore = categoryReferenceAvailable
      ? percentile(
          dailyViews / scale,
          peers.map((row) => row.dailyViews),
        )
      : globalScore;
  } else {
    globalScore = interpolateKnots(
      dailyViews / scale,
      config.normalization.dailyViewKnots,
      true,
    );
    categoryScore = interpolateKnots(
      dailyViews / (scale * config.normalization.categoryDailyScale[category]),
      config.normalization.dailyViewKnots,
      true,
    );
  }
  const blend = config.normalization.categoryBlend;
  return {
    score: (1 - blend) * globalScore + blend * categoryScore,
    globalScore,
    categoryScore,
    categoryReferenceAvailable,
    provisional: config.normalization.mode === "provisional",
  };
}

export function normalizeCreatorAudience(
  dailyViews: number,
  config: EngineConfig,
  reference?: ReferenceCatalog,
  scale = 1,
) {
  if (
    !Number.isFinite(dailyViews) ||
    dailyViews < 0 ||
    !Number.isFinite(scale) ||
    scale <= 0
  )
    throw new Error("Audience d’auteur invalide.");
  const available =
    config.normalization.mode === "reference-percentiles" &&
    !!reference?.creatorRecords &&
    reference.creatorRecords.length >=
      config.normalization.minimumCreatorReferenceSize;
  const score = available
    ? percentile(
        dailyViews / scale,
        reference!.creatorRecords!.map((row) => row.dailyViews),
      )
    : interpolateKnots(
        dailyViews / scale,
        config.normalization.creatorDailyViewKnots,
        true,
      );
  return {
    score,
    globalScore: score,
    categoryScore: score,
    categoryReferenceAvailable: false,
    provisional: !available,
  };
}
