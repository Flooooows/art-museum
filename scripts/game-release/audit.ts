import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { catalogDataset } from "../../src/catalog/repository";
import {
  artworks,
  activeGameRelease,
  byId,
  ratesForCatalog,
} from "../../src/data";
import { parseGameRelease } from "../../src/catalog/gameRelease";
import {
  parseLegalReport,
  matchingLegalDataset,
  assertLegalBindings,
} from "../../src/legal-eu/report";
import { parseReviewExport, mergeDecisions } from "../../src/review/model";
import {
  parseCandidateExport,
  decisionsFor,
} from "../../src/masterpieces/model";

const sha = (b: Buffer | string) =>
  createHash("sha256").update(b).digest("hex");
export async function auditGameRelease() {
  const bytes = await readFile("src/catalog/game-release.json");
  const release = parseGameRelease(
    JSON.parse(bytes.toString()),
    catalogDataset,
  );
  const manifest = JSON.parse(
    await readFile(`catalog/game-release/${release.id}/manifest.json`, "utf8"),
  );
  assert.equal(sha(bytes), manifest.releaseSha256);
  assert.deepEqual(
    await readFile(`catalog/game-release/${release.id}/release.json`),
    bytes,
  );
  assert.equal(
    sha(await readFile("src/catalog/seed.json")),
    release.baseCatalogSha256,
  );
  const rightsBytes = await readFile("public/legal-eu/report.json");
  assert.equal(sha(rightsBytes), release.legalReportSha256);
  const report = parseLegalReport(JSON.parse(rightsBytes.toString()));
  const today = new Date().toISOString().slice(0, 10);
  const oldIds = new Set(catalogDataset.works.map((w) => w.id));
  const expected = new Set<string>();
  const ratings = new Map<string, any>();
  for (const [dir, file, main] of [
    ["review-data", "mille.json", true],
    ["masterpieces-data", "25.json", false],
    ["enrichment-351-data", "masterpiece.json", false],
  ] as const) {
    const catalog = JSON.parse(
      await readFile(`public/${dir}/catalog.json`, "utf8"),
    );
    assert.equal(
      sha(JSON.stringify(catalog)),
      release.sourceCatalogHashes[dir],
    );
    const dataset = matchingLegalDataset(
      report,
      dir,
      catalog.version,
      release.sourceCatalogHashes[dir],
      today,
    );
    assertLegalBindings(dataset, catalog);
    for (const e of dataset.entries)
      if (
        (e.decision.status === "AUTO_APPROVED_EU" ||
          (main &&
            e.decision.status === "REVIEW_REQUIRED" &&
            release.reviewPublicationAuthorization?.artworkIds.includes(
              e.input.artworkId,
            ))) &&
        !oldIds.has(e.input.artworkId) &&
        catalog.works.some((w: any) => w.id === e.input.artworkId)
      )
        expected.add(e.input.artworkId);
    try {
      const raw = await readFile(
        `private/imports/state-2026-10-30-9b4b2a1552a4/${file}`,
      );
      assert.equal(sha(raw), manifest.sourceExportHashes[file]);
      const decisions = main
        ? mergeDecisions(
            {},
            parseReviewExport(JSON.parse(raw.toString()), catalog).decisions,
          )
        : decisionsFor(
            parseCandidateExport(JSON.parse(raw.toString()), catalog).events,
          ).rarities;
      for (const [id, d] of Object.entries(decisions)) ratings.set(id, d);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    }
  }
  assert.deepEqual(
    new Set(release.works.map((w) => w.id)),
    expected,
    "Publication partielle ou œuvres sans autorisation conforme",
  );
  for (const [file, hash] of Object.entries(manifest.evidenceHashes)) {
    if (file.startsWith("private/")) continue;
    assert.equal(sha(await readFile(file)), hash, `Preuve modifiée : ${file}`);
  }
  for (const update of release.existingRarities) {
    assert.equal(byId[update.artworkId].rarity, update.level);
    if (ratings.has(update.artworkId))
      assert.equal(update.level, ratings.get(update.artworkId).finalLevel);
  }
  for (const w of release.works) {
    assert.notEqual(w.legal.decision.status, "BLOCKED");
    if (ratings.has(w.id)) assert.equal(w.rarity, ratings.get(w.id).finalLevel);
    const source = Object.values(report.datasets)
      .flatMap((d) => d.entries)
      .find((e) => e.input.artworkId === w.id);
    assert.deepEqual(w.legal, source);
    assert.equal(byId[w.id].rarity, w.humanRarity.level);
    const image = await readFile(`public${w.image}`);
    assert.equal(
      sha(image),
      w.imageEvidence.outputSha256,
      `Raster modifié : ${w.id}`,
    );
    const decoded = await sharp(image)
      .raw()
      .toBuffer({ resolveWithObject: true });
    assert.equal(decoded.info.width, w.imageEvidence.width);
    assert.equal(decoded.info.height, w.imageEvidence.height);
  }
  assert.equal(
    artworks.length,
    catalogDataset.works.length + release.works.length,
  );
  assert.equal(new Set(artworks.map((w) => w.id)).size, artworks.length);
  assert.deepEqual(
    ratesForCatalog("all").map((r) => Number(r.toFixed(1))),
    [56.1, 25.5, 15, 3, 0.4],
  );
  assert.equal(activeGameRelease.id, release.id);
  if (release.reviewPublicationAuthorization) {
    const catalog = JSON.parse(
      await readFile("public/review-data/catalog.json", "utf8"),
    );
    const entries = report.datasets["review-data"].entries;
    const blocked = new Set(
      entries
        .filter((e) => e.decision.status === "BLOCKED")
        .map((e) => e.input.artworkId),
    );
    assert.deepEqual([...blocked].sort(), [
      "cma-111594",
      "cma-127227",
      "cma-173965",
    ]);
    const wanted = catalog.works
      .filter((w: any) => !blocked.has(w.id))
      .map((w: any) => w.id);
    assert.equal(wanted.length, 997);
    assert.ok(wanted.every((id: string) => byId[id]));
    assert.ok([...blocked].every((id) => !byId[id]));
    assert.equal(artworks.length, 1011);
    assert.equal(
      release.reviewPublicationAuthorization.catalogVersion,
      catalog.version,
    );
    assert.deepEqual(
      new Set(release.reviewPublicationAuthorization.artworkIds),
      new Set(
        release.works
          .filter((w) => w.legal.decision.status === "REVIEW_REQUIRED")
          .map((w) => w.id),
      ),
    );
    assert.equal(release.reviewPublicationAuthorization.artworkIds.length, 658);
    const priorBytes = await readFile(
      `catalog/game-release/${manifest.previousReleaseId}/release.json`,
    );
    assert.equal(sha(priorBytes), manifest.previousReleaseSha256);
    const prior = parseGameRelease(
      JSON.parse(priorBytes.toString()),
      catalogDataset,
    );
    assert.deepEqual(release.existingRarities, prior.existingRarities);
    for (const old of prior.works)
      assert.deepEqual(
        release.works.find((w) => w.id === old.id),
        old,
      );
    assert.deepEqual(
      release.reviewPublicationAuthorization,
      manifest.reviewPublicationAuthorization,
    );
  }
  return {
    releaseId: release.id,
    totalWorks: artworks.length,
    newWorks: release.works.length,
    updatedRarities: release.existingRarities.length,
    imagesDecoded: release.works.length,
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  console.log(
    "Livraison du jeu vérifiée :",
    JSON.stringify(await auditGameRelease()),
  );
