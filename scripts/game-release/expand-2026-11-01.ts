import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";
import {
  parseGameRelease,
  type ReleasedArtwork,
} from "../../src/catalog/gameRelease";
import { parseCatalog } from "../../src/catalog/model";
import {
  parseReviewCatalog,
  parseReviewExport,
  mergeDecisions,
} from "../../src/review/model";
import {
  parseLegalReport,
  matchingLegalDataset,
  assertLegalBindings,
} from "../../src/legal-eu/report";

const sha = (b: string | Buffer) =>
  createHash("sha256").update(b).digest("hex");
const day = "2026-11-01";
const previousId = "game-2026-10-30-d985529a3c5c";
const previousPath = `catalog/game-release/${previousId}/release.json`;
const priorBytes = await readFile(previousPath);
const baseBytes = await readFile("src/catalog/seed.json");
const base = parseCatalog(JSON.parse(baseBytes.toString()));
const prior = parseGameRelease(JSON.parse(priorBytes.toString()), base);
const evidence: Record<string, string> = {};
async function json(file: string) {
  const b = await readFile(file);
  evidence[file] = sha(b);
  return JSON.parse(b.toString());
}
async function immutable(file: string, bytes: string | Buffer) {
  await mkdir(file.slice(0, file.lastIndexOf("/")), { recursive: true });
  try {
    await writeFile(file, bytes, { flag: "wx" });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
    assert.deepEqual(await readFile(file), Buffer.from(bytes));
  }
}
const priorManifest = await json(
  `catalog/game-release/${previousId}/manifest.json`,
);
assert.equal(sha(priorBytes), priorManifest.releaseSha256);
for (const [file, hash] of Object.entries(priorManifest.evidenceHashes)) {
  assert.equal(
    sha(await readFile(file)),
    hash,
    `Preuve historique modifiée : ${file}`,
  );
}
const catalog = parseReviewCatalog(
  await json("public/review-data/catalog.json"),
);
const report = parseLegalReport(await json("public/legal-eu/report.json"));
assert.equal(evidence["public/legal-eu/report.json"], prior.legalReportSha256);
const catalogSha = sha(JSON.stringify(catalog));
assert.equal(catalogSha, prior.sourceCatalogHashes["review-data"]);
const dataset = matchingLegalDataset(
  report,
  "review-data",
  catalog.version,
  catalogSha,
  day,
);
assertLegalBindings(dataset, catalog);
const rights = new Map(dataset.entries.map((e) => [e.input.artworkId, e]));
const inputDir = "private/imports/state-2026-10-30-9b4b2a1552a4";
const raw = await readFile(`${inputDir}/mille.json`);
assert.equal(sha(raw), priorManifest.sourceExportHashes["mille.json"]);
evidence[`${inputDir}/mille.json`] = sha(raw);
const decisions = mergeDecisions(
  {},
  parseReviewExport(JSON.parse(raw.toString()), catalog).decisions,
);
const selection = new Map(
  (await json("catalog/review-1000/selection.json")).works.map((w: any) => [
    w.id,
    w,
  ]),
);
const existing = new Set([...base.works, ...prior.works].map((w) => w.id));
const missing = catalog.works.filter(
  (w) => !existing.has(w.id) && rights.get(w.id)!.decision.status !== "BLOCKED",
);
const blocked = catalog.works
  .filter((w) => rights.get(w.id)!.decision.status === "BLOCKED")
  .map((w) => w.id)
  .sort();
assert.deepEqual(blocked, ["cma-111594", "cma-127227", "cma-173965"]);
assert.equal(missing.length, 658);
const manual = {
  kind: "explicit-user-request" as const,
  authorizedAt: day,
  request: "Tu peux tout publier sauf les 3 blocked",
  catalogVersion: catalog.version,
  catalogSha256: catalogSha,
  artworkIds: missing.map((w) => w.id),
};
const cache = "/tmp/opencode/muse-game-publication/downloads";
await mkdir(cache, { recursive: true });
async function download(url: string, id: string) {
  assert.equal(new URL(url).hostname, "openaccess-cdn.clevelandart.org");
  const file = `${cache}/${id}.bin`,
    metaFile = `${cache}/${id}.json`;
  try {
    const bytes = await readFile(file),
      meta = JSON.parse(await readFile(metaFile, "utf8"));
    assert.equal(meta.url, url);
    assert.equal(meta.sha256, sha(bytes));
    return { bytes, retrievedAt: meta.retrievedAt as string };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch(url, {
        signal: AbortSignal.timeout(60000),
        headers: {
          "User-Agent": "MUSE-Catalogue/1.0 (CC0 artwork publication)",
        },
      });
      assert.equal(new URL(r.url).hostname, "openaccess-cdn.clevelandart.org");
      if (!r.ok) {
        await r.body?.cancel();
        throw Error(`HTTP ${r.status} : ${id}`);
      }
      const bytes = Buffer.from(await r.arrayBuffer());
      assert.ok(bytes.length < 20_000_000);
      const retrievedAt = new Date().toISOString();
      await immutable(file, bytes);
      await immutable(
        metaFile,
        JSON.stringify({ url, sha256: sha(bytes), retrievedAt }),
      );
      return { bytes, retrievedAt };
    } catch (e) {
      if (attempt === 3) throw e;
    }
  }
  throw Error(`Téléchargement impossible : ${id}`);
}
const records = new Map<string, any>();
const plain = (v: unknown) =>
  String(v ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;|&apos;/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
async function prepare(
  w: (typeof catalog.works)[number],
): Promise<ReleasedArtwork> {
  const proof = rights.get(w.id)!;
  assert.equal(proof.decision.status, "REVIEW_REQUIRED");
  const d = decisions[w.id];
  assert.ok(d);
  const s: any = selection.get(w.id);
  assert.ok(s);
  if (!records.has(s.evidenceFile))
    records.set(s.evidenceFile, await json(s.evidenceFile));
  const r = records
    .get(s.evidenceFile)
    .payload.data.find((v: any) => `cma-${v.id}` === w.id);
  assert.ok(r);
  assert.equal(r.share_license_status, "CC0");
  assert.ok(!r.copyright);
  assert.equal(r.images.web.url, w.imageUrl);
  assert.equal(r.images.web.url, proof.input.image.sourceUrl);
  assert.equal(r.url, w.sourceUrl);
  const source = await download(r.images.web.url, w.id);
  const bytes = await sharp(source.bytes)
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 88 })
    .toBuffer();
  const dimensions = await sharp(bytes).metadata();
  assert.ok(dimensions.width && dimensions.height);
  const image = `/assets/game-release/${w.id}.webp`;
  await immutable(`public${image}`, bytes);
  const decorative = ["Arts décoratifs", "Arts du métal"].includes(w.family);
  console.log(`Image prête : ${w.id}`);
  return {
    id: w.id,
    title: w.title,
    artist: w.creator,
    date: w.date || "Datation non renseignée",
    material: w.medium || "Technique non renseignée",
    catalog: decorative ? "decoratifs" : "beaux-arts",
    catalogIds: [decorative ? "decoratifs" : "beaux-arts"],
    familyId: decorative ? "arts-decoratifs" : "beaux-arts",
    museumId: "cma",
    rarity: d.finalLevel,
    rarityOrigin: "manual-review",
    publicationStatus: "published",
    anecdote: `Artiste : ${w.creator}. Collection : ${w.institution}.`,
    story: `${w.title} est datée de ${w.date || "une période non précisée"}. Technique indiquée par le musée : ${w.medium || "non renseignée"}. La notice institutionnelle liée ci-dessous permet de consulter les informations de collection disponibles.`,
    origin: w.context || "Contexte non précisé par la notice",
    source: w.sourceUrl,
    image,
    imageCredit: proof.input.image.credit,
    inventoryNumber: r.accession_number,
    category: w.family,
    institutionalNote: plain(r.did_you_know || r.description),
    imageSource: proof.input.image.sourceUrl!,
    reuseUrl: proof.input.image.licenseUrl!,
    reuseLabel: "CC0 · fichier du musée ; droits de l’œuvre à revérifier",
    reuseObligations: proof.decision.obligations,
    humanRarity: {
      artworkId: w.id,
      level: d.finalLevel,
      decidedAt: d.decidedAt,
      catalogVersion: catalog.version,
      exportSha256: sha(raw),
    },
    legal: proof,
    imageEvidence: {
      sourceUrl: proof.input.image.sourceUrl!,
      sourceSha256: sha(source.bytes),
      outputSha256: sha(bytes),
      width: dimensions.width,
      height: dimensions.height,
      retrievedAt: source.retrievedAt,
      transformation:
        "Orientation EXIF et réduction proportionnelle dans 1600×1600, sans recadrage, WebP qualité 88 ; aucune retouche créative.",
      evidenceFiles: [
        s.evidenceFile,
        "catalog/legal-eu/sources/cma-open-access.json",
      ],
    },
  };
}
const additions: ReleasedArtwork[] = [];
for (let i = 0; i < missing.length; i += 4)
  additions.push(...(await Promise.all(missing.slice(i, i + 4).map(prepare))));
const script = "scripts/game-release/expand-2026-11-01.ts";
evidence[script] = sha(await readFile(script));
evidence[previousPath] = sha(priorBytes);
evidence["src/catalog/seed.json"] = sha(baseBytes);
const id = `game-${day}-${sha(JSON.stringify({ previous: sha(priorBytes), manual, script: evidence[script] })).slice(0, 12)}`;
const release = parseGameRelease(
  {
    ...prior,
    id,
    authorizedAt: day,
    reviewPublicationAuthorization: manual,
    works: [...prior.works, ...additions],
  },
  base,
);
assert.equal(base.works.length + release.works.length, 1011);
const bytes = JSON.stringify(release) + "\n";
const manifest = {
  schemaVersion: 1,
  releaseId: id,
  releaseSha256: sha(bytes),
  authorizedAt: day,
  previousReleaseId: previousId,
  previousReleaseSha256: sha(priorBytes),
  sourceExportHashes: priorManifest.sourceExportHashes,
  newWorks: release.works.length,
  addedThisRelease: additions.length,
  existingRarities: 100,
  totalWorks: 1011,
  millierWorks: 997,
  retainedExtras: 14,
  excludedBlockedIds: blocked,
  reviewPublicationAuthorization: manual,
  evidenceHashes: evidence,
};
await immutable(`catalog/game-release/${id}/release.json`, bytes);
await immutable(
  `catalog/game-release/${id}/manifest.json`,
  JSON.stringify(manifest, null, 2) + "\n",
);
const active = await readFile("src/catalog/game-release.json");
assert.ok(
  active.equals(priorBytes) || active.equals(Buffer.from(bytes)),
  "Livraison active inattendue : activation refusée",
);
await writeFile("src/catalog/game-release.json", bytes);
console.log(JSON.stringify({ release: id, total: 1011, added: 658, blocked }));
