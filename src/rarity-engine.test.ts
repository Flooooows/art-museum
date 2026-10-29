import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { parseEngineConfig } from "./rarity-engine/configuration";
import {
  normalizeAudience,
  normalizeCreatorAudience,
  validateReference,
} from "./rarity-engine/normalization";
import { criterion, scoreDirect } from "./rarity-engine/scoring";
import { completeCriteria } from "./rarity-engine/estimation";
import {
  confidenceFor,
  rarityLevel,
  validationReasons,
  weightedInterval,
} from "./rarity-engine/validation";
import { simulateRarities } from "./rarity-engine/calibration";
import { resolveIdentity } from "./rarity-engine/collection";
import {
  CRITERIA,
  type ArtworkInput,
  type CriteriaResults,
  type CriterionResult,
  type DirectResults,
  type EngineConfig,
  type Evidence,
  type ReferenceCatalog,
} from "./rarity-engine/types";
import {
  DiskCaptureStore,
  JsonCaptureClient,
  payloadHash,
  publicUrl,
  retryAfterMs,
  sha256,
  type Capture,
  type CaptureStore,
} from "../scripts/rarity-v2/http";
import { createConnectors } from "../scripts/rarity-v2/connectors";
import { creatorModeFor, loadInputs } from "../scripts/rarity-v2/inputs";
import {
  assertProtectedInputs,
  frozenWrite,
} from "../scripts/rarity-v2/integrity";

const configuration = () =>
  parseEngineConfig(
    JSON.parse(readFileSync("catalog/rarity-v2/config-2.0.0.json", "utf8")),
  );
const policy: Evidence = {
  id: "policy",
  provider: "policy",
  independentGroup: "policy",
  url: "urn:muse:test",
  retrievedAt: "2026-10-30",
  file: "fixture",
  sha256: "fixture",
  tier: 3,
  scope: "policy",
};
const evidence: Evidence = {
  ...policy,
  id: "source",
  provider: "fixture",
  independentGroup: "museum",
  url: "https://example.org/work",
  tier: 1,
  scope: "artwork",
};
const work = (id = "fixture"): ArtworkInput => ({
  id,
  title: `Œuvre ${id}`,
  creator: "Artiste identifié",
  creatorMode: "identified",
  category: "painting",
  medium: "Huile",
  displayDate: "1880",
  yearStart: 1880,
  yearEnd: 1880,
  institution: "museum",
  context: "France, XIXe siècle",
  externalIds: [{ provider: "museum", id }],
  identity: {
    status: "verified",
    confidence: 0.99,
    reasons: ["Notice exacte"],
  },
  activeLevel: 0,
  exploratoryScore: null,
  institutionEvidence: [evidence],
  workAudience: [],
  artistAudiences: [],
  audienceScope: "exact_object",
  institutionSignals: {
    collectionVerified: true,
    publicRecord: true,
    highlight: false,
    citations: null,
    exhibitions: null,
    educationText: null,
  },
  editorial: {},
});
const fixed = (score: number, extra: Partial<CriterionResult> = {}) =>
  criterion({
    score,
    halfWidth: 1,
    type: "derived",
    method: "fixture-direct",
    sourceTier: 1,
    sourceQuality: 0.9,
    observedShare: 1,
    evidence: [evidence],
    notes: [],
    rawIndicators: {},
    ...extra,
  });
const options = () => ({
  days: 365,
  period: { start: "2025-10-01", end: "2026-09-30" },
  languages: ["fr", "en"],
  policyEvidence: policy,
});

test("V2 — les audiences des artistes ne sont pas comparées aux percentiles des œuvres", () => {
  const c = configuration();
  c.normalization.mode = "reference-percentiles";
  c.normalization.referenceFile = "fixture";
  const reference: ReferenceCatalog = {
    version: "fixture",
    frozenAt: "2026-10-30",
    representative: true,
    provenance: "Fixture contrôlée uniquement pour les tests",
    period: options().period,
    languages: options().languages,
    records: Array.from({ length: 600 }, (_, i) => ({
      id: `work-${i}`,
      category: "painting",
      dailyViews: i,
    })),
  };
  assert.equal(normalizeCreatorAudience(100, c, reference).provisional, true);
  reference.creatorRecords = Array.from({ length: 100 }, (_, i) => ({
    id: `artist-${i}`,
    dailyViews: i * 100,
  }));
  validateReference(reference, c, [], options().period, options().languages);
  assert.equal(normalizeCreatorAudience(100, c, reference).provisional, false);
  assert.notEqual(
    normalizeCreatorAudience(100, c, reference).score,
    normalizeAudience(100, "painting", c, reference).score,
  );
  assert.throws(() =>
    validateReference(
      reference,
      c,
      ["artist-5"],
      options().period,
      options().languages,
    ),
  );
});

test("V2 — formule configurable 25/20/25/20/10 et seuils sans arrondi", () => {
  const c = configuration();
  const values = Object.fromEntries(
    CRITERIA.map((key, index) => [key, fixed([100, 80, 60, 40, 20][index])]),
  ) as CriteriaResults;
  assert.equal(weightedInterval(values, c).score, 66);
  for (const [score, level] of [
    [0, 0],
    [39.999, 0],
    [40, 1],
    [59.999, 1],
    [60, 2],
    [74.999, 2],
    [75, 3],
    [89.99999999, 3],
    [90, 4],
    [100, 4],
  ])
    assert.equal(rarityLevel(score, c), level);
  for (const score of [-1, 101, Infinity, NaN])
    assert.throws(() => rarityLevel(score, c));
  const altered = structuredClone(c);
  altered.weights = { P: 0.2, A: 0.2, H: 0.2, M: 0.2, C: 0.2 };
  assert.equal(weightedInterval(values, parseEngineConfig(altered)).score, 60);
});

test("V2 — configurations incohérentes et poids implicites refusés", () => {
  for (const modify of [
    (c: EngineConfig) => {
      c.weights.P = 0.9;
    },
    (c: EngineConfig) => {
      c.weights.H = -0.1;
    },
    (c: EngineConfig) => {
      c.thresholds = [40, 40, 75, 90];
    },
    (c: EngineConfig) => {
      c.rarities[4] = "Légendaire";
    },
    (c: EngineConfig) => {
      c.normalization.mode = "reference-percentiles";
    },
    (c: EngineConfig) => {
      c.estimation.priors.painting.A = [80, 30, 70];
    },
    (c: EngineConfig) => {
      c.confidence.confirmedMinimum = 2;
    },
    (c: EngineConfig) => {
      c.normalization.dailyViewKnots = [
        [0, 0],
        [10, 80],
        [5, 100],
      ];
    },
  ]) {
    const c = configuration();
    modify(c);
    assert.throws(() => parseEngineConfig(c));
  }
});

test("V2 — absence d’un critère ne renormalise jamais le total", () => {
  const c = configuration();
  const incomplete = {
    P: fixed(80),
    A: fixed(80),
    H: fixed(80),
    M: fixed(80),
  } as CriteriaResults;
  assert.throws(() => weightedInterval(incomplete, c));
  for (const score of [-1, 101, NaN]) assert.throws(() => fixed(score));
  const criteria = Object.fromEntries(
    CRITERIA.map((key) => [key, fixed(80)]),
  ) as CriteriaResults;
  assert.ok(Math.abs(weightedInterval(criteria, c).score - 80) < 1e-10);
});

test("V2 — sans page Wikipédia, estimation explicite et non zéro ou 50 uniforme", () => {
  const c = configuration();
  const w = work();
  const output = simulateRarities([w], c, options()).results[0];
  assert.equal(output.criteria.P.type, "estimated");
  assert.ok(output.criteria.P.score > 0);
  assert.notEqual(output.criteria.P.score, 50);
  assert.ok(
    output.scoreInterval.lower < output.notorietyScore &&
      output.scoreInterval.upper > output.notorietyScore,
  );
  assert.equal(output.status, "provisional");
  assert.ok(output.confidenceScore < 0.6);
});

test("V2 — ni rareté active ni valeurs imputées ne servent à fabriquer le score", () => {
  const c = configuration();
  const w = work();
  const first = simulateRarities([w], c, options()).results[0];
  w.activeLevel = 4;
  w.exploratoryScore = 100;
  const second = simulateRarities([w], c, options()).results[0];
  assert.equal(first.notorietyScore, second.notorietyScore);
  const map = new Map<string, DirectResults>([
    [w.id, { M: fixed(100, { type: "estimated" }) }],
  ]);
  const completed = completeCriteria(w, [w], map, c, policy);
  assert.equal(completed.P.score, c.estimation.priors.painting.P[1]);
  assert.equal(completed.P.comparableIds.length, 0);
});

test("V2 — anonymes : contexte limité, sans popularité entière d’une civilisation", () => {
  const c = configuration();
  const w = work();
  w.creatorMode = "anonymous";
  w.creator = "Atelier égyptien non identifié";
  w.context = "Égypte, Thèbes, XVIIIe dynastie";
  w.yearStart = -1400;
  w.category = "antiquity";
  const result = simulateRarities([w], c, options()).results[0];
  assert.equal(result.criteria.A.type, "estimated");
  assert.ok(
    result.criteria.A.score > 0 &&
      result.criteria.A.score <= c.estimation.anonymousContextMaximum,
  );
  assert.ok(
    result.criteria.A.notes.some((note) => note.includes("civilisation")),
  );
  assert.ok(result.criteria.A.evidence.some((e) => e.scope === "policy"));
});

test("V2 — à preuves manquantes identiques, antiquité et peinture n’ont pas de pénalité de genre", () => {
  const a = work("painting");
  const b = work("heritage");
  a.creatorMode = "anonymous";
  b.creatorMode = "anonymous";
  b.category = "antiquity";
  b.yearStart = -2000;
  const output = simulateRarities([a, b], configuration(), options()).results;
  assert.equal(output[0].notorietyScore, output[1].notorietyScore);
});

test("V2 — une icône anonyme n’est pas mathématiquement exclue du niveau supérieur", () => {
  const c = configuration();
  const w = work();
  w.creatorMode = "anonymous";
  w.creator = "Auteur non identifié";
  w.context = "Contexte patrimonial identifié";
  w.category = "antiquity";
  w.yearStart = -1000;
  w.institutionSignals.highlight = true;
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
  w.workAudience = [
    {
      language: "fr",
      title: w.title,
      expectedMonths: months,
      months: months.map((timestamp) => ({ timestamp, views: 400000 })),
      evidence: [evidence],
    },
  ];
  w.editorial = {
    H: {
      score: 100,
      reason: "Fixture documentaire explicite",
      evidence: [evidence],
    },
    M: {
      score: 100,
      reason: "Fixture documentaire explicite",
      evidence: [evidence],
    },
    C: {
      score: 100,
      reason: "Fixture documentaire explicite",
      evidence: [evidence],
    },
  };
  const result = simulateRarities([w], c, options()).results[0];
  assert.equal(result.rarity, "Pièce maîtresse");
  assert.ok(result.criteria.A.score < 100);
  assert.equal(result.status, "provisional");
  assert.equal(result.masterpieceCandidate, true);
});

test("V2 — crédits d’auteurs et attributions ne confondent pas Bugatti avec un anonyme", () => {
  assert.equal(
    creatorModeFor("Carlo Bugatti ; fabrication Adrien-Aurélien Hébrard"),
    "identified",
  );
  assert.equal(creatorModeFor("Atelier d’Antonio Canova"), "workshop");
  assert.equal(creatorModeFor("Suiveur de Fra Filippo Lippi"), "workshop");
  assert.equal(creatorModeFor("Attribué à Suzanne Valadon"), "uncertain");
  assert.equal(creatorModeFor("Culture de Hongshan"), "anonymous");
  assert.equal(creatorModeFor("Atelier égyptien non identifié"), "anonymous");
});

test("V2 — une notice muséale seule ne produit pas M maximal ni H/C mesurés", () => {
  const direct = scoreDirect(work(), configuration(), 365);
  assert.ok(direct.M!.score < 75);
  assert.equal(direct.M!.type, "estimated");
  assert.ok(Number(direct.M!.rawIndicators.estimatedComponents) >= 2);
  assert.equal(direct.H, undefined);
  assert.equal(direct.C, undefined);
});

test("V2 — bibliographies et expositions dédupliquées, sans fabriquer une influence culturelle", () => {
  const w = work();
  w.institutionSignals.citations = [
    { key: "same", text: "Book" },
    { key: "same", text: "Book duplicate" },
  ];
  w.institutionSignals.exhibitions = [
    { key: "event", title: "Exposition" },
    { key: "event", title: "Copie" },
  ];
  const direct = scoreDirect(w, configuration(), 365);
  assert.equal(direct.H!.rawIndicators.distinctScholarlyReferences, 1);
  assert.equal(direct.M!.rawIndicators.distinctExhibitions, 1);
  assert.equal(direct.M!.rawIndicators.distinctPublications, 1);
  assert.equal(direct.C, undefined);
  assert.match(direct.H!.method, /proxy/);
  assert.ok(direct.H!.upper - direct.H!.lower > 30);
});

test("V2 — seuls comparables directs, hors objet cible et avec effectif minimal", () => {
  const c = configuration();
  const w = work("target");
  const peers = Array.from({ length: 6 }, (_, index) => work(`peer-${index}`));
  const map = new Map<string, DirectResults>(
    peers.map((peer, index) => [peer.id, { H: fixed(55 + index) }]),
  );
  map.get(peers[0].id)!.H = fixed(99, { type: "estimated" });
  const calculated = completeCriteria(w, [w, ...peers], map, c, policy).H;
  assert.equal(calculated.comparableIds.length, 5);
  assert.ok(
    !calculated.comparableIds.includes(w.id) &&
      !calculated.comparableIds.includes(peers[0].id),
  );
  assert.equal(calculated.type, "estimated");
  const small = completeCriteria(
    w,
    [w, ...peers.slice(0, 4)],
    map,
    c,
    policy,
  ).H;
  assert.equal(small.comparableIds.length, 0);
  assert.equal(small.method, "declared-contextual-prior");
  assert.deepEqual(
    completeCriteria(w, [...peers].reverse().concat(w), map, c, policy).H,
    calculated,
  );
});

test("V2 — compteurs annuels partiels restent estimés et un zéro réellement observé est conservé", () => {
  const w = work();
  const months = ["2025010100", "2025020100", "2025030100"];
  w.workAudience = [
    {
      language: "fr",
      title: "Exact",
      expectedMonths: months,
      months: [
        { timestamp: months[0], views: 0 },
        { timestamp: months[1], views: 0 },
      ],
      evidence: [evidence],
    },
  ];
  const partial = scoreDirect(w, configuration(), 365).P!;
  assert.equal(partial.type, "estimated");
  assert.equal(partial.rawIndicators.annualViews, null);
  assert.equal(partial.rawIndicators.observedMonths, 2);
  w.workAudience[0].months.push({ timestamp: months[2], views: 0 });
  const full = scoreDirect(w, configuration(), 365).P!;
  assert.equal(full.type, "derived");
  assert.equal(full.score, 0);
  w.workAudience[0].months.push({ timestamp: months[2], views: 100 });
  assert.throws(() => scoreDirect(w, configuration(), 365));
});

test("V2 — normalisation progressive et perspectives sans percentiles sur les cibles", () => {
  const c = configuration();
  assert.ok(normalizeAudience(1000, "painting", c).score < 100);
  assert.equal(normalizeAudience(0, "antiquity", c).score, 0);
  assert.equal(
    normalizeAudience(30, "painting", c).score,
    normalizeAudience(30, "antiquity", c).score,
  );
  assert.equal(
    normalizeAudience(10, "painting", c).categoryReferenceAvailable,
    false,
  );
  const reference: ReferenceCatalog = {
    version: "fixture",
    frozenAt: "2026-10-30",
    provenance: "Fixture de test, jamais un référentiel de production",
    representative: true,
    period: options().period,
    languages: options().languages,
    records: Array.from({ length: 600 }, (_, i) => ({
      id: `external-${i}`,
      category: i < 300 ? "painting" : "antiquity",
      dailyViews: i < 300 ? i * 10 : i / 10,
    })),
  };
  c.normalization.mode = "reference-percentiles";
  c.normalization.referenceFile = "fixture";
  validateReference(
    reference,
    c,
    ["target"],
    options().period,
    options().languages,
  );
  const normalized = normalizeAudience(100, "painting", c, reference);
  assert.equal(normalized.categoryReferenceAvailable, true);
  assert.notEqual(normalized.globalScore, normalized.categoryScore);
  assert.throws(() =>
    validateReference(
      { ...reference, records: reference.records.slice(0, 100) },
      c,
      [],
      options().period,
      options().languages,
    ),
  );
  assert.throws(() =>
    validateReference(
      reference,
      c,
      ["external-4"],
      options().period,
      options().languages,
    ),
  );
  assert.throws(() =>
    validateReference(
      { ...reference, representative: false },
      c,
      [],
      options().period,
      options().languages,
    ),
  );
  assert.throws(() =>
    validateReference(
      reference,
      c,
      [],
      { start: "2024-01-01", end: "2024-12-31" },
      options().languages,
    ),
  );
});

test("V2 — confiance distincte du score, copies de sources non indépendantes", () => {
  const c = configuration();
  const w = work();
  const criteria = Object.fromEntries(
    CRITERIA.map((key) => [key, fixed(80)]),
  ) as CriteriaResults;
  const first = confidenceFor(w, criteria, c);
  for (const key of CRITERIA)
    criteria[key].evidence.push(...criteria[key].evidence);
  assert.deepEqual(confidenceFor(w, criteria, c), first);
  assert.deepEqual(first.independentGroups, ["museum"]);
  for (const key of CRITERIA) {
    criteria[key].type = "estimated";
    criteria[key].observedShare = 0;
    criteria[key].lower = 0;
    criteria[key].upper = 100;
  }
  const poor = confidenceFor(w, criteria, c);
  assert.ok(poor.score < first.score);
  assert.ok(poor.score <= c.confidence.highEstimationConfidenceCap);
});

test("V2 — confirmation possible seulement avec identité, sources, confiance, stabilité et seuil sûrs", () => {
  const c = configuration();
  c.confidence.provisionalNormalizationCap = 1;
  const w = work();
  const criteria = Object.fromEntries(
    CRITERIA.map((key) => [
      key,
      fixed(80, {
        type: "observed",
        evidence: [
          evidence,
          {
            ...evidence,
            independentGroup: "independent",
            url: "https://independent.org",
          },
        ],
      }),
    ]),
  ) as CriteriaResults;
  const confidence = confidenceFor(w, criteria, c);
  assert.deepEqual(
    validationReasons(
      w,
      criteria,
      { lower: 79, upper: 81 },
      80,
      confidence,
      true,
      c,
    ),
    [],
  );
  assert.ok(
    validationReasons(
      w,
      criteria,
      { lower: 70, upper: 85 },
      80,
      confidence,
      true,
      c,
    ).some((reason) => reason.includes("intervalle")),
  );
  assert.ok(
    validationReasons(
      w,
      criteria,
      { lower: 79, upper: 81 },
      80,
      confidence,
      false,
      c,
    ).some((reason) => reason.includes("calibration")),
  );
  assert.ok(
    validationReasons(
      w,
      criteria,
      { lower: 94, upper: 96 },
      95,
      confidence,
      true,
      c,
    ).some((reason) => reason.includes("Pièce maîtresse")),
  );
});

test("V2 — homonymes, séries et reproductions ne sont pas adoptés depuis une recherche", () => {
  const target = {
    id: "target",
    title: "Portrait d’un homme",
    creator: "Lotto",
    institution: "Cleveland",
    yearStart: 1533,
    yearEnd: 1534,
    externalIds: [],
    kind: "work" as const,
  };
  const candidate = { ...target, id: "candidate" };
  assert.equal(resolveIdentity(target, [candidate]).status, "matched");
  assert.equal(
    resolveIdentity(target, [candidate, { ...candidate, id: "homonym" }])
      .status,
    "ambiguous",
  );
  assert.equal(
    resolveIdentity(target, [{ ...candidate, creator: "Autre artiste" }])
      .status,
    "unresolved",
  );
  assert.equal(
    resolveIdentity(target, [{ ...candidate, kind: "series" }]).status,
    "unresolved",
  );
  assert.equal(
    resolveIdentity(target, [{ ...candidate, kind: "reproduction" }]).status,
    "unresolved",
  );
});

test("V2 — identité insuffisante refusée et calcul déterministe sans réseau", () => {
  const c = configuration();
  const w = work();
  const invalid = work("bad");
  invalid.identity.status = "ambiguous";
  const output = simulateRarities([w, invalid], c, options());
  assert.equal(output.results.length, 1);
  assert.equal(output.rejected.length, 1);
  assert.equal(
    JSON.stringify(output),
    JSON.stringify(simulateRarities([w, invalid], c, options())),
  );
  assert.throws(() => simulateRarities([w, w], c, options()));
});

test("V2 — des audiences de périodes différentes ne sont pas mélangées", () => {
  const w = work();
  w.workAudience = [
    {
      language: "fr",
      title: w.title,
      months: [{ timestamp: "2024010100", views: 50 }],
      expectedMonths: ["2024010100"],
      evidence: [evidence],
    },
  ];
  assert.throws(
    () => simulateRarities([w], configuration(), options()),
    /Fenêtre d’audience/,
  );
  assert.throws(
    () =>
      simulateRarities([work()], configuration(), { ...options(), days: 30 }),
    /Période/,
  );
});

class MemoryStore implements CaptureStore {
  values = new Map<string, Capture>();
  async get(key: string) {
    return this.values.get(key) ?? null;
  }
  async put(key: string, value: Capture) {
    this.values.set(key, value);
  }
}
const httpOptions = () => ({
  store: new MemoryStore(),
  offline: false,
  minimumIntervalMs: 1,
  timeoutMs: 30,
  maximumRetryAfterMs: 120000,
  userAgent: "MUSE-Test/2.0",
  now: () => Date.parse("2026-10-30T00:00:00Z"),
  sleep: async () => {},
});

test("V2 HTTP — cache réutilisé, appels identiques concurrents fusionnés", async () => {
  const settings = httpOptions();
  let calls = 0;
  const client = new JsonCaptureClient({
    ...settings,
    fetch: (async () => {
      calls++;
      return new Response(JSON.stringify({ value: 42 }));
    }) as typeof fetch,
  });
  const [a, b] = await Promise.all([
    client.request("fixture", "https://example.org/a"),
    client.request("fixture", "https://example.org/a"),
  ]);
  assert.equal(calls, 1);
  assert.deepEqual(a, b);
  assert.deepEqual(await client.request("fixture", "https://example.org/a"), a);
});

test("V2 HTTP — clé absente et mode offline ne déclenchent aucune requête", async () => {
  let calls = 0;
  const client = new JsonCaptureClient({
    ...httpOptions(),
    fetch: (async () => {
      calls++;
      throw new Error("Forbidden");
    }) as typeof fetch,
  });
  const providers = createConnectors(client);
  assert.equal(
    (await providers.smithsonian.search("painting")).status,
    "auth_missing",
  );
  assert.equal(
    (await providers.europeana.search("painting")).status,
    "auth_missing",
  );
  const offline = new JsonCaptureClient({ ...httpOptions(), offline: true });
  assert.equal(
    (await offline.request("fixture", "https://example.org/a")).status,
    "offline_missing",
  );
  assert.equal(calls, 0);
});

test("V2 HTTP — Retry-After secondes/date respecté sans requête prématurée", async () => {
  const settings = httpOptions();
  let calls = 0;
  const client = new JsonCaptureClient({
    ...settings,
    fetch: (async () => {
      calls++;
      return new Response("{}", {
        status: 429,
        headers: { "Retry-After": "300" },
      });
    }) as typeof fetch,
  });
  assert.equal(
    (await client.request("fixture", "https://example.org/a")).status,
    "rate_limited",
  );
  assert.equal(
    (await client.request("fixture", "https://example.org/b")).status,
    "rate_limited",
  );
  assert.equal(calls, 1);
  assert.equal(retryAfterMs("30", 0), 30000);
  assert.equal(retryAfterMs("Thu, 01 Jan 1970 00:01:00 GMT", 0), 60000);
});

test("V2 HTTP — JSON invalide, API contradictoire, erreur et timeout restent des erreurs", async () => {
  const malformed = new JsonCaptureClient({
    ...httpOptions(),
    fetch: (async () => new Response("not-json")) as typeof fetch,
  });
  assert.equal(
    (await malformed.request("fixture", "https://example.org/a")).status,
    "invalid_json",
  );
  const wrongOptions = httpOptions();
  const wrongRecord = new JsonCaptureClient({
    ...wrongOptions,
    fetch: (async () => new Response('{"objectID":999}')) as typeof fetch,
  });
  assert.equal(
    (await createConnectors(wrongRecord).met.record("1")).status,
    "invalid_json",
  );
  assert.equal(wrongOptions.store.values.size, 0);
  const failure = new JsonCaptureClient({
    ...httpOptions(),
    fetch: (async () => new Response("{}", { status: 500 })) as typeof fetch,
  });
  assert.equal(
    (await failure.request("fixture", "https://example.org/a")).status,
    "http_error",
  );
  const timeout = new JsonCaptureClient({
    ...httpOptions(),
    timeoutMs: 5,
    fetch: ((_url, init) =>
      new Promise((_resolve, reject) =>
        init!.signal!.addEventListener("abort", () =>
          reject(new Error("timeout")),
        ),
      )) as typeof fetch,
  });
  const response = await timeout.request("fixture", "https://example.org/a");
  assert.equal(response.status, "network_error");
  assert.equal(response.payload, null);
});

test("V2 HTTP — secrets absents des URL, caches et réponses conservées", async () => {
  const secret = "SECRET+KEY=123";
  const settings = httpOptions();
  const client = new JsonCaptureClient({
    ...settings,
    fetch: (async () =>
      new Response(
        JSON.stringify({
          status: 200,
          response: { rows: [] },
          echo: secret,
          url: `https://example.org?api_key=${encodeURIComponent(secret)}`,
        }),
      )) as typeof fetch,
  });
  const capture = await createConnectors(client, {
    smithsonian: secret,
  }).smithsonian.search("art");
  assert.equal(capture.status, "available");
  assert.ok(!JSON.stringify([...settings.store.values]).includes(secret));
  assert.ok(!JSON.stringify(capture).includes(encodeURIComponent(secret)));
  assert.equal(
    new URL(
      publicUrl(`https://example.org?wskey=${encodeURIComponent(secret)}`),
    ).searchParams.get("wskey"),
    "REDACTED",
  );
});

test("V2 fichiers — cache altéré refusé, sortie figée jamais écrasée", async () => {
  const directory = await mkdtemp("/tmp/opencode/muse-v2-test-");
  try {
    const store = new DiskCaptureStore(directory);
    const value: Capture = {
      url: "https://example.org",
      provider: "fixture",
      retrievedAt: "2026-10-30",
      httpStatus: 200,
      status: "available",
      payload: { test: 1 },
      payloadSha256: payloadHash({ test: 1 }),
    };
    await store.put("fixture", value);
    assert.deepEqual(await store.get("fixture"), value);
    await writeFile(
      path.join(directory, "fixture.json"),
      JSON.stringify({ ...value, payload: { test: 2 } }),
    );
    assert.equal(await store.get("fixture"), null);
    const output = path.join(directory, "frozen.txt");
    await frozenWrite(output, "one");
    await frozenWrite(output, "one");
    await assert.rejects(() => frozenWrite(output, "two"));
    await mkdir(path.join(directory, "catalog/rarity-v2"), { recursive: true });
    await writeFile(path.join(directory, "input.txt"), "protected");
    await writeFile(
      path.join(directory, "catalog/rarity-v2/protected-inputs.json"),
      JSON.stringify({ files: { "input.txt": sha256("protected") } }),
    );
    await assertProtectedInputs(directory);
    await writeFile(path.join(directory, "input.txt"), "changed");
    await assert.rejects(() => assertProtectedInputs(directory));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("V2 intégration — cent propositions traçables, anciennes données strictement protégées", async () => {
  await assertProtectedInputs(process.cwd());
  const input = await loadInputs(process.cwd());
  assert.equal(input.works.length, 100);
  const simulation = simulateRarities(input.works, configuration(), {
    ...options(),
    days: input.days,
    period: input.period,
    languages: input.languages,
  });
  assert.equal(simulation.results.length, 100);
  assert.equal(simulation.rejected.length, 0);
  for (const result of simulation.results) {
    assert.equal(Object.keys(result.criteria).length, 5);
    assert.ok(
      result.notorietyScore >= 0 &&
        result.notorietyScore <= 100 &&
        result.confidenceScore >= 0 &&
        result.confidenceScore <= 1,
    );
    for (const key of CRITERIA) {
      assert.ok(result.criteria[key].method);
      assert.ok(result.criteria[key].evidence.length > 0);
    }
    if (
      result.scoreInterval.lower <
        configuration().thresholds[result.rarityLevel - 1] ||
      !result.stableClassification
    )
      assert.equal(result.status, "provisional");
  }
  assert.equal(
    input.works.find((w) => w.id === "45434")!.audienceScope,
    "reviewed_composition",
  );
  assert.equal(
    input.works.find((w) => w.id === "cma-136510")!.workAudience.length,
    0,
  );
  assert.equal(
    input.works.find((w) => w.id === "cma-150156")!.creatorMode,
    "identified",
  );
  await assertProtectedInputs(process.cwd());
});
