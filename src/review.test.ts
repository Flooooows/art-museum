import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  decide,
  filterReviewWorks,
  makeExport,
  mergeDecisions,
  parseReviewCatalog,
  parseReviewExport,
  REVIEW_STORAGE_KEY,
  reviewCsv,
  type ReviewFilters,
} from "./review/model";
import type { ReviewCatalog, ReviewDecisions } from "./review/types";
import { validMuseumRecord, museumInput } from "../scripts/review/records";
import { assertProtectedInputs } from "../scripts/rarity-v2/integrity";

const catalog: ReviewCatalog = parseReviewCatalog(
  JSON.parse(await readFile("public/review-data/catalog.json", "utf8")),
);
const first = catalog.works[0].id;
const second = catalog.works[1].id;
const now = "2026-10-30T12:00:00.000Z";
const filters: ReviewFilters = {
  query: "",
  family: "all",
  proposed: "all",
  state: "all",
  sort: "score-desc",
};

test("atelier — exactement 1000 œuvres uniques, dont les 100 historiques et 900 nouvelles CC0", async () => {
  assert.equal(catalog.works.length, 1000);
  assert.equal(new Set(catalog.works.map((w) => w.id)).size, 1000);
  assert.equal(
    catalog.works.filter((w) => w.origin === "existing").length,
    100,
  );
  assert.equal(catalog.works.filter((w) => w.origin === "new").length, 900);
  assert.equal(new Set(catalog.works.map((w) => w.family)).size, 12);
  for (const w of catalog.works) {
    assert.ok(w.proposal.score >= 0 && w.proposal.score <= 100);
    assert.equal(w.proposal.status, "provisional");
    assert.ok(w.imageUrl && w.sourceUrl && w.license);
    if (w.origin === "new") {
      assert.equal(w.activeLevel, null);
      assert.match(w.license, /CC0/);
      assert.match(
        w.imageUrl,
        /^https:\/\/openaccess-cdn\.clevelandart\.org\//,
      );
    }
  }
  const old = JSON.parse(
    await readFile("catalog/rarity-v2/results.json", "utf8"),
  ) as {
    results: {
      artworkId: string;
      notorietyScore: number;
      rarityLevel: number;
    }[];
  };
  for (const w of old.results) {
    const review = catalog.works.find((r) => r.id === w.artworkId)!;
    assert.equal(review.proposal.score, w.notorietyScore);
    assert.equal(review.proposal.level, w.rarityLevel);
  }
  await assertProtectedInputs(process.cwd());
});

test("atelier — aucune décision par défaut, choix exclusif, modification et annulation sans mutation", () => {
  const empty: ReviewDecisions = {};
  const a = decide(empty, first, 0, now);
  assert.equal(Object.keys(empty).length, 0);
  assert.equal(a[first].finalLevel, 0);
  const b = decide(a, first, 4, now);
  assert.equal(a[first].finalLevel, 0);
  assert.equal(b[first].finalLevel, 4);
  assert.equal(Object.keys(b).length, 1);
  assert.deepEqual(decide(b, first, null), {});
  assert.throws(() => decide(empty, first, 5 as 0));
  assert.ok(!REVIEW_STORAGE_KEY.includes("collection"));
});

test("atelier — aller-retour JSON, conservation du niveau zéro et ordre déterministe", () => {
  const choices = decide(decide({}, second, 4, now), first, 0, now);
  const exported = makeExport(catalog, choices, now);
  const parsed = parseReviewExport(
    JSON.parse(JSON.stringify(exported)),
    catalog,
  );
  assert.deepEqual(mergeDecisions({}, parsed.decisions), choices);
  assert.deepEqual(
    exported.decisions.map((d) => d.artworkId),
    [...exported.decisions.map((d) => d.artworkId)].sort((a, b) =>
      a.localeCompare(b),
    ),
  );
});

test("atelier — imports inconnus, dupliqués, incomplets ou incompatibles refusés atomiquement", () => {
  const base = makeExport(catalog, decide({}, first, 2, now), now);
  for (const value of [
    null,
    {},
    { ...base, catalogVersion: "autre" },
    { ...base, algorithmVersion: "9" },
    { ...base, schemaVersion: 2 },
    { ...base, decisions: [base.decisions[0], base.decisions[0]] },
    { ...base, decisions: [{ ...base.decisions[0], artworkId: "unknown" }] },
    { ...base, decisions: [{ ...base.decisions[0], finalLevel: "2" }] },
    { ...base, decisions: [{ ...base.decisions[0], finalLevel: 6 }] },
    { ...base, decisions: [{ ...base.decisions[0], decidedAt: "hier" }] },
  ])
    assert.throws(() => parseReviewExport(value, catalog));
  assert.equal(base.decisions[0].finalLevel, 2);
});

test("atelier — import fusionné ne supprime pas les décisions absentes du fichier", () => {
  const current = decide(decide({}, first, 1, now), second, 3, now);
  const incoming = parseReviewExport(
    makeExport(catalog, decide({}, first, 4, now), now),
    catalog,
  );
  const result = mergeDecisions(current, incoming.decisions);
  assert.equal(result[first].finalLevel, 4);
  assert.equal(result[second].finalLevel, 3);
  assert.equal(current[first].finalLevel, 1);
});

test("atelier — recherche insensible aux accents, filtres combinés et tri numérique", () => {
  assert.ok(
    filterReviewWorks(
      catalog.works,
      {},
      { ...filters, query: "joconde leonard" },
    ).some((w) => w.id === "mona-lisa"),
  );
  const decisions = decide(
    {},
    first,
    catalog.works[0].proposal.level === 4 ? 0 : 4,
    now,
  );
  assert.equal(
    filterReviewWorks(catalog.works, decisions, {
      ...filters,
      state: "decided",
    }).length,
    1,
  );
  assert.equal(
    filterReviewWorks(catalog.works, decisions, {
      ...filters,
      state: "pending",
    }).length,
    999,
  );
  assert.equal(
    filterReviewWorks(catalog.works, decisions, {
      ...filters,
      state: "different",
    }).length,
    1,
  );
  const family = filterReviewWorks(
    catalog.works,
    {},
    { ...filters, family: "Photographie" },
  );
  assert.equal(family.length, 90);
  const lower = filterReviewWorks(
    catalog.works,
    {},
    { ...filters, sort: "score-asc" },
  );
  assert.ok(lower[0].proposal.score <= lower.at(-1)!.proposal.score);
  assert.equal(
    filterReviewWorks(
      catalog.works,
      {},
      { ...filters, query: "zzzintrouvablezzz" },
    ).length,
    0,
  );
});

test("atelier — CSV complet, cellules protégées et décisions distinctes de la proposition", () => {
  const copy = {
    ...catalog,
    works: [
      { ...catalog.works[0], title: '=HYPERLINK("test")' },
      ...catalog.works.slice(1),
    ],
  };
  const csv = reviewCsv(copy, decide({}, first, 0, now));
  assert.ok(csv.startsWith("\ufeff"));
  assert.equal(csv.split("\r\n").length, 1002);
  assert.match(csv, /rarete_proposee/);
  assert.match(csv, /rarete_finale/);
  assert.ok(csv.includes('"\'=HYPERLINK(""test"")"'));
});

test("atelier — empreinte publique et preuves de sélection cohérentes", async () => {
  const bytes = await readFile("public/review-data/catalog.json");
  const manifest = JSON.parse(
    await readFile("catalog/review-1000/manifest.json", "utf8"),
  ) as {
    version: string;
    catalogSha256: string;
    evidenceHashes: Record<string, string>;
  };
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    manifest.catalogSha256,
  );
  assert.equal(manifest.version, catalog.version);
  for (const [file, hash] of Object.entries(manifest.evidenceHashes))
    assert.equal(
      createHash("sha256")
        .update(await readFile(file))
        .digest("hex"),
      hash,
      file,
    );
});

test("atelier — notices sans CC0/image ou avec mauvaise identité refusées", async () => {
  const selection = JSON.parse(
    await readFile("catalog/review-1000/selection.json", "utf8"),
  ) as { works: { id: string; evidenceFile: string }[] };
  const entry = selection.works[0];
  const capture = JSON.parse(await readFile(entry.evidenceFile, "utf8"));
  const record = capture.payload.data.find(
    (r: { id: number }) => `cma-${r.id}` === entry.id,
  );
  assert.ok(validMuseumRecord(record));
  assert.equal(
    validMuseumRecord({ ...record, share_license_status: "copyright" }),
    false,
  );
  assert.equal(validMuseumRecord({ ...record, images: {} }), false);
  assert.equal(validMuseumRecord({ ...record, id: "text" }), false);
  const input = museumInput(
    { ...record, creators: [] },
    {
      id: "fixture",
      provider: "cma",
      independentGroup: "cma",
      url: record.url,
      retrievedAt: "2026-10-30",
      file: entry.evidenceFile,
      sha256: "fixture",
      tier: 1,
      scope: "artwork",
    },
  );
  assert.equal(input.creatorMode, "anonymous");
  assert.deepEqual(input.workAudience, []);
});
