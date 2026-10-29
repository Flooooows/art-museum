import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  calculateNotoriety,
  normalizeDailyViews,
  notorietyLevel,
  NOTORIETY_WEIGHTS,
  type NotorietyScores,
} from "./catalog/notoriety";

test("la simulation v2 applique la formule P/A/H/M/C sans changer la grille active", () => {
  assert.equal(
    Object.values(NOTORIETY_WEIGHTS).reduce<number>((a, b) => a + b, 0),
    1,
  );
  assert.equal(
    calculateNotoriety({ P: 100, A: 80, H: 60, M: 40, C: 20 }).total,
    70,
  );
  assert.equal(
    calculateNotoriety({ P: 100, A: 100, H: 100, M: 100, C: 100 }).level,
    4,
  );
  assert.equal(calculateNotoriety({ P: 0, A: 0, H: 0, M: 0, C: 0 }).level, 0);
});

test("les nouveaux seuils 40/60/75/90 classent les valeurs sans arrondi d’affichage", () => {
  assert.equal(
    calculateNotoriety({
      P: 89.9999999999,
      A: 89.9999999999,
      H: 89.9999999999,
      M: 89.9999999999,
      C: 89.9999999999,
    }).level,
    3,
  );
  for (const [score, level] of [
    [0, 0],
    [39.999, 0],
    [40, 1],
    [59.999, 1],
    [60, 2],
    [74.999, 2],
    [75, 3],
    [89.999, 3],
    [90, 4],
    [100, 4],
  ])
    assert.equal(notorietyLevel(score), level);
  for (const score of [-1, 101, NaN, Infinity])
    assert.throws(() => notorietyLevel(score));
});

test("les données absentes donnent des bornes et jamais un zéro ou une renormalisation", () => {
  const result = calculateNotoriety({
    P: null,
    A: 100,
    H: 100,
    M: 100,
    C: 100,
  });
  assert.equal(result.total, null);
  assert.equal(result.level, null);
  assert.equal(result.minimum, 70);
  assert.equal(result.maximum, 100);
  assert.equal(result.coverage, 0.7);
  assert.deepEqual(result.possibleLevels, [2, 3, 4]);
  const absent = calculateNotoriety({
    P: null,
    A: null,
    H: null,
    M: null,
    C: null,
  });
  assert.equal(absent.minimum, 0);
  assert.equal(absent.maximum, 100);
  assert.equal(absent.total, null);
  assert.deepEqual(
    calculateNotoriety({ P: 0, A: 0, H: 0, M: 100, C: null }).possibleLevels,
    [0],
  );
});

test("les entrées hors plage ou critères incomplets sont refusés", () => {
  for (const value of [-1, 101, NaN, Infinity, undefined, "50"]) {
    assert.throws(() =>
      calculateNotoriety({
        P: value,
        A: null,
        H: null,
        M: null,
        C: null,
      } as NotorietyScores),
    );
  }
  assert.throws(() => calculateNotoriety({ P: 100 } as NotorietyScores));
  assert.throws(() =>
    calculateNotoriety({
      P: 100,
      A: 100,
      H: 100,
      M: 100,
      C: 100,
      extra: 0,
    } as NotorietyScores),
  );
});

test("la normalisation fixe n’invente pas de percentile ni d’audience négative", () => {
  assert.equal(normalizeDailyViews(0, 365), 0);
  assert.equal(normalizeDailyViews(365000, 365), 100);
  assert.equal(normalizeDailyViews(3650000, 365), 100);
  assert.ok(normalizeDailyViews(36500, 365) < 100);
  assert.ok(normalizeDailyViews(365, 365) < normalizeDailyViews(3650, 365));
  for (const [views, days] of [
    [-1, 365],
    [1, 0],
    [NaN, 365],
    [0.5, 365],
  ])
    assert.throws(() => normalizeDailyViews(views, days));
});

test("le rapport conserve les cent identifiants et l’empreinte du catalogue actif", () => {
  const seedBytes = readFileSync("src/catalog/seed.json");
  const seed = JSON.parse(seedBytes.toString());
  const report = JSON.parse(
    readFileSync("catalog/notoriety/results.json", "utf8"),
  );
  assert.equal(
    report.seedSha256,
    createHash("sha256").update(seedBytes).digest("hex"),
  );
  assert.equal(report.works.length, 100);
  assert.equal(
    new Set(report.works.map((work: { id: string }) => work.id)).size,
    100,
  );
  assert.deepEqual(
    report.works.map((work: { id: string }) => work.id).sort(),
    seed.works.map((work: { id: string }) => work.id).sort(),
  );
  for (const work of report.works) {
    assert.deepEqual(work.calculation, calculateNotoriety(work.scores));
    if (work.calculation.missing.length)
      assert.equal(work.calculation.total, null);
  }
});

test("chaque audience mesurée provient de douze mois humains conservés, sans emprunt à une série", () => {
  const observations = JSON.parse(
    readFileSync("catalog/notoriety/observations.json", "utf8"),
  );
  assert.deepEqual(observations.period, {
    start: "2025-10-01",
    end: "2026-09-30",
    days: 365,
  });
  const months = [
    "2025100100",
    "2025110100",
    "2025120100",
    "2026010100",
    "2026020100",
    "2026030100",
    "2026040100",
    "2026050100",
    "2026060100",
    "2026070100",
    "2026080100",
    "2026090100",
  ];
  for (const work of observations.works) {
    if (work.workAudience) {
      assert.equal(
        work.workAudience.qid,
        work.id === "45434" ? "Q252485" : work.objectQid,
      );
      if (work.id !== "45434") assert.equal(work.audienceScope, "exact_object");
    }
    if (work.creatorStatus !== "identified")
      assert.deepEqual(work.artistAudiences, []);
    for (const audience of [work.workAudience, ...work.artistAudiences].filter(
      Boolean,
    )) {
      for (const page of audience.pages) {
        if (page.status !== "measured") {
          assert.equal(page.views, null);
          continue;
        }
        assert.equal(page.months, 12);
        const raw = JSON.parse(readFileSync(page.evidence.at(-1), "utf8"));
        assert.equal(raw.status, 200);
        assert.ok(Number.isFinite(Date.parse(raw.retrievedAt)));
        assert.ok(Date.parse(raw.retrievedAt) >= Date.parse("2026-10-01"));
        assert.deepEqual(
          raw.response.items
            .map((item: { timestamp: string }) => item.timestamp)
            .sort(),
          months,
        );
        assert.equal(
          raw.response.items.reduce(
            (sum: number, item: { views: number }) => sum + item.views,
            0,
          ),
          page.views,
        );
        for (const item of raw.response.items) {
          assert.equal(item.agent, "user");
          assert.equal(item.access, "all-access");
          assert.equal(item.project, `${page.language}.wikipedia`);
          assert.equal(item.article.replaceAll("_", " "), page.title);
        }
      }
    }
  }
});
