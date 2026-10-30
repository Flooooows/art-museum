import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import sharp from "sharp";
import { sha256 } from "../scripts/rarity-v2/http";
import { createScorer } from "../scripts/masterpieces/score";
import {
  STORAGE_KEY,
  decisionsFor,
  makeExport,
  mergeEvents,
  parseCandidateCatalog,
  parseCandidateExport,
  type ReviewEvent,
} from "./masterpieces/model";
import { REVIEW_STORAGE_KEY } from "./review/model";
import { candidateBatch, ENRICHMENT_STORAGE_KEY } from "./masterpieces/batches";

const json = async (file: string) => JSON.parse(await readFile(file, "utf8"));
const report = await json("enrichment-351-results.json");
const catalog = parseCandidateCatalog(
  await json("public/enrichment-351-data/catalog.json"),
  "/enrichment-351-images",
);
const first = catalog.works[0].id;

test("351 — exhaustivité, trois groupes exclusifs, aucun statut présumé autorisant", async () => {
  const input = await json("muse_oeuvres_candidates.json");
  assert.equal(report.observations.length, 351);
  assert.deepEqual(
    report.observations.map((r: any) => r.inputId),
    input.artworks.map((r: any) => r.id),
  );
  assert.equal(
    new Set(report.observations.map((r: any) => r.inputId)).size,
    351,
  );
  const groups = [
    "ready_for_review",
    "legal_review_required",
    "not_usable_with_current_files",
  ];
  assert.equal(
    Object.values(report.summary.groups).reduce(
      (a: number, b: any) => a + b,
      0,
    ),
    351,
  );
  for (const r of report.observations) {
    assert.ok(groups.includes(r.group));
    assert.ok(r.reason.length > 15);
    if (r.proposeNewCard) assert.equal(r.group, "ready_for_review");
    if (r.group !== "ready_for_review") assert.equal(r.proposal, null);
  }
  assert.equal(report.inputFlagsAreNotLegalAuthority, true);
  assert.equal(report.publication, "review_prepared_game_not_activated");
});

test("351 — empreintes des entrées, décisions, cartes et V2 préservées", async () => {
  for (const hashes of [
    report.protectedInputs.files,
    report.evidenceHashes,
    report.implementationHashes,
  ]) {
    for (const [file, expected] of Object.entries(hashes))
      assert.equal(sha256(await readFile(file)), expected, file);
  }
  assert.equal(
    report.protectedInputs.manualDecisionsSha256,
    "223cef98656d0cbe94a9bfff575475d4b175efe8b37eb41cb73e84166a8cba28",
  );
  assert.equal(
    (await json("public/review-data/catalog.json")).version,
    "review-1000-b069bbaeeecc561d",
  );
  assert.equal(
    (await json("public/masterpieces-data/catalog.json")).version,
    "masterpieces-818ec04f3f8db6b3",
  );
  assert.deepEqual(report.summary.activeGameUnchanged, [43, 39, 14, 3, 1]);
});

test("351 — déduplication par objet, composition et ligne canonique", async () => {
  const old = await json("public/review-data/catalog.json");
  const previous = await json("masterpieces-candidates.json");
  const known = [...old.works, ...previous.candidates];
  assert.equal(
    new Set(report.scoredNewWorks.map((r: any) => r.objectKey)).size,
    catalog.works.length,
  );
  assert.equal(
    new Set(catalog.works.map((w) => w.id)).size,
    catalog.works.length,
  );
  for (const w of catalog.works) {
    assert.ok(!known.some((o) => o.id === w.id || o.sourceUrl === w.sourceUrl));
    assert.equal(w.activeLevel, null);
  }
  for (const r of report.observations.filter(
    (r: any) => r.existingMatch || r.internalDuplicate,
  )) {
    assert.equal(r.proposeNewCard, false);
  }
  for (const [suffix, canonical] of [
    ["0269", "0265"],
    ["0314", "0208"],
  ]) {
    assert.equal(
      report.observations.find((r: any) => r.inputId.endsWith(suffix))
        .internalDuplicate.canonical,
      `muse-candidate-${canonical}`,
    );
  }
  for (const suffix of ["0001", "0042", "0252", "0253", "0256", "0325", "0341"])
    assert.equal(
      report.observations.find((r: any) => r.inputId.endsWith(suffix)).presence,
      "already_represented",
    );
});

test("351 — licences exactes commerciales, crédits et rasters contrôlés", async () => {
  const manifest = await json("catalog/enrichment-351/image-manifest.json");
  assert.equal(manifest.failures.length, 0);
  assert.equal(manifest.images.length, catalog.works.length);
  assert.equal(
    (await readdir("public/enrichment-351-images")).length,
    catalog.works.length,
  );
  for (const r of report.scoredNewWorks) {
    assert.equal(r.rights.status, "cleared");
    assert.equal(r.input.identity.status, "verified");
    assert.ok(r.inventoryNumber && r.sourceUrl && r.image.evidenceFiles.length);
    assert.ok(
      [
        "Domaine public / reproduction plane",
        "CC0",
        "CC BY 2.0",
        "CC BY 4.0",
      ].includes(r.image.license),
    );
    assert.ok(!/\b(?:NC|ND)\b/.test(r.image.license));
    assert.equal(r.rasterVerified, true);
    assert.ok(
      Math.max(r.raster.downloadWidth, r.raster.downloadHeight) >= 1600,
    );
    const bytes = await readFile(r.raster.output);
    assert.equal(sha256(bytes), r.raster.outputSha256);
    const metadata = await sharp(bytes).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, r.raster.width);
    assert.equal(metadata.height, r.raster.height);
    if (r.image.license.startsWith("CC BY"))
      assert.match(r.image.credit, /Jean-Pierre Dalbéra|Jean-Pol GRANDMONT/);
    assert.equal(
      report.observations.find((o: any) => o.inputId === r.inputId).territories
        .otherTerritories,
      "not_assessed",
    );
  }
});

test("351 — versions et datations primaires, ni homonymes ni autre musée", () => {
  const by = (suffix: string) =>
    report.scoredNewWorks.find((r: any) => r.suffix === suffix);
  assert.equal(by("0121").inventoryNumber, "NG538");
  assert.equal(by("0134").inventoryNumber, "RF 1877");
  assert.equal(by("0180").inventoryNumber, "90.PA.20");
  assert.equal(by("0161").inventoryNumber, "RF 1976");
  assert.equal(by("0186").inventoryNumber, "61.101.1");
  assert.equal(by("0103").input.yearStart, 1787);
  assert.equal(by("0103").input.yearEnd, 1793);
  assert.equal(by("0202").input.yearStart, 1899);
  assert.equal(by("0202").input.yearEnd, 1900);
  assert.equal(by("0158").input.yearEnd, 1881);
  assert.notEqual(by("0179").wikidataId, "Q45585");
  for (const suffix of ["0176", "0217", "0218", "0222", "0227", "0245", "0347"])
    assert.equal(by(suffix), undefined);
  for (const suffix of ["0274", "0275"]) {
    assert.equal(by(suffix).input.creatorMode, "anonymous");
    assert.equal(by(suffix).input.artistAudiences.length, 0);
    assert.equal(by(suffix).image.license, "CC0");
    assert.match(by(suffix).image.credit, /Shonagon/);
  }
});

test("351 — V2 reproductible sans bonus éditorial, scopes d’audiences distincts", async () => {
  const scorer = await createScorer();
  const config = await json("catalog/rarity-v2/config-2.0.0.json");
  assert.deepEqual(config.weights, {
    P: 0.25,
    A: 0.2,
    H: 0.25,
    M: 0.2,
    C: 0.1,
  });
  assert.deepEqual(config.thresholds, [40, 60, 75, 90]);
  for (const r of report.scoredNewWorks) {
    assert.deepEqual(scorer(r.input), r.proposal);
    assert.deepEqual(r.input.editorial, {});
    assert.equal(
      catalog.works.find((w) => w.id === r.workId)!.proposal.score,
      r.proposal.score,
    );
    if (r.suffix === "0186") assert.equal(r.input.workAudience.length, 0);
    for (const a of r.input.workAudience) {
      assert.ok(
        a.months.every((m: any) => a.expectedMonths.includes(m.timestamp)),
      );
      assert.equal(
        new Set(a.months.map((m: any) => m.timestamp)).size,
        a.months.length,
      );
    }
  }
  for (const suffix of ["0043", "0254", "0260", "0261"]) {
    const r = report.scoredNewWorks.find((r: any) => r.suffix === suffix);
    if (r.input.workAudience.length)
      assert.equal(r.input.audienceScope, "reviewed_composition");
  }
});

test("351 — exports isolés et aucun choix imposé dans l’historique", async () => {
  const entry = await readFile("src/enrichment-351/main.tsx", "utf8");
  const key = entry.match(/muse:enrichment-351-review:v1/)![0];
  assert.notEqual(key, STORAGE_KEY);
  assert.notEqual(key, REVIEW_STORAGE_KEY);
  assert.deepEqual(decisionsFor([]), { rarities: {}, selections: {} });
  const events: ReviewEvent[] = [
    {
      id: "351-s",
      artworkId: first,
      at: "2026-10-30T12:00:00.000Z",
      kind: "selection",
      status: "accepted",
    },
    {
      id: "351-r",
      artworkId: first,
      at: "2026-10-30T12:00:01.000Z",
      kind: "rarity",
      level: 4,
    },
  ];
  const data = makeExport(catalog, events);
  assert.deepEqual(parseCandidateExport(data, catalog).events, events);
  assert.deepEqual(mergeEvents(events, events), events);
  assert.equal(decisionsFor(events).rarities[first].finalLevel, 4);
  assert.equal(decisionsFor(events).selections[first], "accepted");
  const prior = parseCandidateCatalog(
    await json("public/masterpieces-data/catalog.json"),
  );
  assert.throws(() => parseCandidateExport(data, prior));
  assert.throws(() => parseCandidateExport(makeExport(prior, []), catalog));
  assert.throws(() => parseCandidateCatalog(catalog));
});

test("351 — aucune intégration au jeu ni publication implicite", async () => {
  const seed = await readFile("src/catalog/seed.json", "utf8");
  assert.ok(!seed.includes("e351-"));
  const hosting = await json("firebase.muse.json");
  for (const path of [
    "enrichment-351-data/**",
    "enrichment-351-images/**",
    "review-351.html",
  ])
    assert.ok(hosting.hosting.ignore.includes(path));
  const publicData = JSON.stringify(catalog);
  assert.ok(!publicData.includes("manual-reference"));
  assert.ok(!publicData.includes("/mnt/c/Users"));
});

test("351 — atelier publié sur demande, lots et anciennes sauvegardes séparés", async () => {
  const current = candidateBatch("");
  const previous = candidateBatch("?lot=initial");
  assert.equal(current.initial, false);
  assert.equal(previous.initial, true);
  assert.equal(
    current.links.find((link) => link.current)!.href,
    "/masterpieces.html",
  );
  assert.equal(
    previous.links.find((link) => link.current)!.href,
    "/masterpieces.html?lot=initial",
  );
  assert.equal(candidateBatch("?lot=inconnu").initial, false);
  assert.notEqual(ENRICHMENT_STORAGE_KEY, STORAGE_KEY);
  assert.notEqual(ENRICHMENT_STORAGE_KEY, REVIEW_STORAGE_KEY);
  const hosting = await json("firebase.json");
  assert.equal(hosting.hosting.site, "art-museum-8fdd8-atelier");
  for (const path of ["enrichment-351-data/**", "enrichment-351-images/**"])
    assert.ok(!hosting.hosting.ignore.includes(path));
  assert.ok(
    hosting.hosting.headers.some(
      (h: any) => h.source === "/enrichment-351-data/catalog.json",
    ),
  );
  const preparation = await readFile(
    "scripts/prepare-atelier-hosting.ts",
    "utf8",
  );
  assert.ok(preparation.includes("enrichment.works.map"));
  assert.ok(!preparation.includes("manual-reference"));
});
