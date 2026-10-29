/** Exploratory v2; intentionally independent of the active v1 assessments. */
export const NOTORIETY_WEIGHTS = {
  P: 0.3,
  A: 0.25,
  H: 0.2,
  M: 0.15,
  C: 0.1,
} as const;

export const NOTORIETY_THRESHOLDS = [40, 60, 75, 90] as const;
export type NotorietyCriterion = keyof typeof NOTORIETY_WEIGHTS;
export type NotorietyScores = Record<NotorietyCriterion, number | null>;

export function notorietyLevel(score: number): number {
  if (!Number.isFinite(score) || score < 0 || score > 100)
    throw new Error("Score de notoriété attendu entre 0 et 100.");
  return NOTORIETY_THRESHOLDS.filter((threshold) => score >= threshold).length;
}

/** Fixed anchor, not a percentile of these 100 works. Zero requires real data. */
export function normalizeDailyViews(
  views: number,
  days: number,
  anchor = 1000,
): number {
  if (
    !Number.isSafeInteger(views) ||
    views < 0 ||
    !Number.isInteger(days) ||
    days <= 0 ||
    !Number.isFinite(anchor) ||
    anchor <= 0
  )
    throw new Error(
      "Audience entière positive ou nulle et période positive requises.",
    );
  return Math.min(100, (100 * Math.log1p(views / days)) / Math.log1p(anchor));
}

export function calculateNotoriety(scores: NotorietyScores) {
  if (
    !scores ||
    Object.keys(scores).sort().join() !==
      Object.keys(NOTORIETY_WEIGHTS).sort().join()
  )
    throw new Error(
      "Les cinq critères P/A/H/M/C sont requis, avec null pour une donnée absente.",
    );
  let lower = 0;
  let missingWeight = 0;
  const missing: NotorietyCriterion[] = [];
  for (const criterion of Object.keys(
    NOTORIETY_WEIGHTS,
  ) as NotorietyCriterion[]) {
    const score = scores[criterion];
    const weight = NOTORIETY_WEIGHTS[criterion];
    if (score === null) {
      missing.push(criterion);
      missingWeight += weight;
    } else {
      if (
        typeof score !== "number" ||
        !Number.isFinite(score) ||
        score < 0 ||
        score > 100
      )
        throw new Error(
          `Critère ${criterion} attendu entre 0 et 100, ou null.`,
        );
      lower += score * weight;
    }
  }
  // Do not round scores before classification; only clamp numeric overflow.
  const minimum = Math.min(100, lower);
  const maximum = Math.min(100, lower + missingWeight * 100);
  const complete = missing.length === 0;
  const first = notorietyLevel(minimum);
  const last = notorietyLevel(maximum);
  return {
    total: complete ? minimum : null,
    level: complete ? first : null,
    minimum,
    maximum,
    coverage: Math.round((1 - missingWeight) * 1e10) / 1e10,
    missing,
    possibleLevels: Array.from(
      { length: last - first + 1 },
      (_, index) => first + index,
    ),
  };
}
