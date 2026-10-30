import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import {
  STORAGE_KEY,
  decisionsFor,
  makeExport,
  mergeEvents,
  parseCandidateCatalog,
  parseCandidateExport,
  type ReviewEvent,
} from "./masterpieces/model";
import { REVIEW_STORAGE_KEY, parseReviewCatalog } from "./review/model";
import { sha256 } from "../scripts/rarity-v2/http";
import { createScorer } from "../scripts/masterpieces/score";

const json = async (p: string) => JSON.parse(await readFile(p, "utf8"));
const catalog = parseCandidateCatalog(
  await json("public/masterpieces-data/catalog.json"),
);
const report = await json("masterpieces-candidates.json");
const first = catalog.works[0].id;
const at = "2026-10-30T12:00:00.000Z";
const event: ReviewEvent = {
  id: "test-1",
  artworkId: first,
  at,
  kind: "selection",
  status: "accepted",
};

test("candidates — au moins 50 objets exacts, 25 cartes libres distinctes, cinq régions", () => {
  assert.ok(report.candidates.length >= 50);
  assert.equal(catalog.works.length, 25);
  assert.equal(
    new Set(report.candidates.map((c: any) => c.id)).size,
    report.candidates.length,
  );
  assert.equal(
    new Set(
      catalog.candidates.filter((c) => c.recommended).map((c) => c.region),
    ).size,
    5,
  );
  for (const w of catalog.works) {
    const c = report.candidates.find((c: any) => c.id === w.id);
    assert.equal(c.rights.status, "cleared");
    assert.equal(c.identity.status, "verified");
    assert.ok(
      c.inventoryNumber && c.imageSource && c.rights.evidenceFiles.length,
    );
    assert.equal(w.activeLevel, null);
  }
});
test("candidates — images téléchargées après approbation, aucune image protégée", async () => {
  const manifest = await json("catalog/masterpieces/image-manifest.json");
  assert.equal(manifest.version, catalog.version);
  assert.equal(manifest.images.length, 25);
  assert.equal((await readdir("public/masterpieces-images")).length, 25);
  for (const image of manifest.images) {
    assert.ok(catalog.works.some((w) => w.id === image.id));
    assert.equal(image.outputSha256, sha256(await readFile(image.output)));
    assert.ok(image.width > 0 && image.height > 0);
  }
  for (const c of report.candidates.filter(
    (c: any) => c.rights.status !== "cleared",
  )) {
    assert.equal(c.imageSource, null);
    assert.ok(!catalog.works.some((w) => w.id === c.id));
  }
});
test("candidates — catalogue de 1000 et clés de stockage préservés", async () => {
  assert.notEqual(STORAGE_KEY, REVIEW_STORAGE_KEY);
  assert.equal(
    sha256(await readFile("public/review-data/catalog.json")),
    "c39fe57cb4353b4d624a204f6ed78329859e9d1df76275098597196bd13b9451",
  );
  const old = parseReviewCatalog(await json("public/review-data/catalog.json"));
  assert.equal(old.version, "review-1000-b069bbaeeecc561d");
  for (const w of catalog.works)
    assert.ok(
      !old.works.some((o) => o.id === w.id || o.sourceUrl === w.sourceUrl),
    );
  assert.throws(() => parseReviewCatalog(catalog));
  assert.ok(!JSON.stringify(catalog).includes("manual-reference"));
  assert.ok(!JSON.stringify(catalog).includes("sourceSha256"));
});
test("candidates — versions et séries non substituées à des objets exacts", () => {
  const byId = (id: string) => report.candidates.find((c: any) => c.id === id);
  assert.equal(byId("nm-NG.M.00939").wikidataId, "Q18891156");
  assert.equal(byId("nm-NG.M.00939").scoreInput.workAudience.length, 0);
  for (const id of ["artic-28560", "artic-16568", "artic-16571"])
    assert.equal(byId(id).scoreInput.workAudience.length, 0);
  for (const id of [
    "artic-187528",
    "artic-110246",
    "artic-75644",
    "artic-64339",
  ]) {
    assert.equal(byId(id).scoreInput.creatorMode, "anonymous");
    assert.equal(byId(id).scoreInput.artistAudiences.length, 0);
  }
  assert.equal(byId("artic-28560").inventoryNumber, "1926.417");
  assert.equal(byId("artic-16568").date, "1906");
  assert.ok(
    !catalog.works.some((w) =>
      /Sunflowers|Tournesols|Great Wave|South Wind/i.test(w.title),
    ),
  );
});
test("candidates — calcul V2 reproductible avec preuves figées, aucun bonus pour 90", async () => {
  const score = await createScorer();
  const config = await json("catalog/rarity-v2/config-2.0.0.json");
  assert.deepEqual(config.weights, {
    P: 0.25,
    A: 0.2,
    H: 0.25,
    M: 0.2,
    C: 0.1,
  });
  assert.deepEqual(config.thresholds, [40, 60, 75, 90]);
  assert.equal(
    (await json("masterpieces-import-preview.json")).configurationVersion,
    config.configurationVersion,
  );
  for (const c of report.candidates)
    assert.deepEqual(score(c.scoreInput), c.proposal);
  for (const [file, hash] of Object.entries(report.evidenceHashes))
    assert.equal(sha256(await readFile(file)), hash);
  for (const [file, hash] of Object.entries(report.implementationHashes))
    assert.equal(sha256(await readFile(file)), hash);
});
test("candidates — aucun choix initial, statuts et rareté indépendants, annulation historisée", () => {
  assert.deepEqual(decisionsFor([]), { rarities: {}, selections: {} });
  const events: ReviewEvent[] = [
    event,
    { id: "test-2", artworkId: first, at, kind: "rarity", level: 4 },
    { id: "test-3", artworkId: first, at, kind: "rarity", level: null },
  ];
  const state = decisionsFor(events);
  assert.equal(state.selections[first], "accepted");
  assert.equal(state.rarities[first], undefined);
  assert.equal(events.length, 3);
  for (const status of [
    "accepted",
    "rejected",
    "deferred",
    "reexamine",
  ] as const)
    assert.equal(
      decisionsFor([{ ...event, status }]).selections[first],
      status,
    );
});
test("candidates — export/import isolé, historique fusionné sans duplication", () => {
  const data = makeExport(catalog, [event]);
  assert.deepEqual(
    parseCandidateExport(JSON.parse(JSON.stringify(data)), catalog),
    data,
  );
  const blocked = catalog.candidates.find(
    (c) => c.rights.status === "rights_review_required",
  )!;
  const researchChoice = { ...event, artworkId: blocked.id };
  assert.equal(
    parseCandidateExport(makeExport(catalog, [researchChoice]), catalog).events
      .length,
    1,
  );
  assert.throws(() =>
    parseCandidateExport(
      makeExport(catalog, [{ ...researchChoice, kind: "rarity", level: 2 }]),
      catalog,
    ),
  );
  assert.deepEqual(mergeEvents([event], [event]), [event]);
  assert.deepEqual(
    mergeEvents(
      [event],
      [
        {
          status: "accepted",
          kind: "selection",
          at,
          artworkId: first,
          id: "test-1",
        },
      ],
    ),
    [
      {
        status: "accepted",
        kind: "selection",
        at,
        artworkId: first,
        id: "test-1",
      },
    ],
  );
  assert.throws(() => mergeEvents([event], [{ ...event, status: "rejected" }]));
  const later: ReviewEvent = {
    ...event,
    id: "test-later",
    at: "2026-10-30T13:00:00.000Z",
    status: "deferred",
  };
  assert.equal(
    decisionsFor(mergeEvents([later], [event])).selections[first],
    "deferred",
  );
  for (const bad of [
    { ...data, format: "muse-rarity-review" },
    { ...data, catalogVersion: "wrong" },
    { ...data, events: [event, event] },
    { ...data, events: [{ ...event, artworkId: "45434" }] },
    { ...data, events: [{ ...event, status: "__proto__" }] },
    { ...data, events: [{ ...event, at: "invalid" }] },
    { ...data, events: [{ ...event, kind: "rarity", level: 5 }] },
  ])
    assert.throws(() => parseCandidateExport(bad, catalog));
});
test("candidates — refuse carte non approuvée, URL dangereuse et score incohérent", () => {
  for (const mutate of [
    (c: any) => (c.works[0].imageUrl = "https://example.com/a.jpg"),
    (c: any) => (c.works[0].sourceUrl = "javascript:alert(1)"),
    (c: any) =>
      (c.candidates.find((m: any) => m.id === first).rights.status =
        "rights_review_required"),
    (c: any) => (c.works[0].proposal.score = NaN),
    (c: any) => (c.works[0].proposal.interval.lower = 100),
    (c: any) => c.works.push(c.works[0]),
  ]) {
    const copy = structuredClone(catalog);
    mutate(copy);
    assert.throws(() => parseCandidateCatalog(copy));
  }
});
