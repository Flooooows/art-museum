import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";
import { parseCatalog } from "../../src/catalog/model";
import {
  parseGameRelease,
  type GameRelease,
  type HumanRarity,
  type ReleasedArtwork,
} from "../../src/catalog/gameRelease";
import {
  parseReviewCatalog,
  parseReviewExport,
  mergeDecisions,
} from "../../src/review/model";
import {
  parseCandidateCatalog,
  parseCandidateExport,
  decisionsFor,
} from "../../src/masterpieces/model";
import {
  assertLegalBindings,
  matchingLegalDataset,
  parseLegalReport,
} from "../../src/legal-eu/report";

const sha = (b: string | Buffer) =>
  createHash("sha256").update(b).digest("hex");
const day = "2026-10-30";
const inputDir = "private/imports/state-2026-10-30-9b4b2a1552a4";
const evidence: Record<string, string> = {};
async function json(file: string) {
  const bytes = await readFile(file);
  evidence[file] = sha(bytes);
  return JSON.parse(bytes.toString());
}
async function immutable(file: string, data: string | Buffer) {
  await mkdir(file.slice(0, file.lastIndexOf("/")), { recursive: true });
  try {
    await writeFile(file, data, { flag: "wx" });
  } catch (e) {
    if (
      (e as NodeJS.ErrnoException).code !== "EEXIST" ||
      !Buffer.from(await readFile(file)).equals(Buffer.from(data))
    )
      throw e;
  }
}
const plain = (s: unknown) =>
  String(s ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;|&apos;/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
const baseBytes = await readFile("src/catalog/seed.json");
const base = parseCatalog(JSON.parse(baseBytes.toString()));
const legalBytes = await readFile("public/legal-eu/report.json");
const report = parseLegalReport(JSON.parse(legalBytes.toString()));
const receipt = await json(`${inputDir}/receipt.json`);
if (sha(await readFile(`${inputDir}/state.zip`)) !== receipt.archiveSha256)
  throw Error("Archive humaine altérée.");
const selected = new Map(
  (await json("catalog/review-1000/selection.json")).works.map((w: any) => [
    w.id,
    w,
  ]),
);
const prepared = new Map(
  (await json("catalog/enrichment-351/prepared.json")).approved.map(
    (a: any) => [a.workId, a],
  ),
);
const images351 = new Map(
  (await json("catalog/enrichment-351/image-manifest.json")).images.map(
    (a: any) => [a.workId, a],
  ),
);
const records = new Map<string, any>();
async function cachedJson(file: string) {
  if (!records.has(file)) records.set(file, await json(file));
  return records.get(file);
}
const oldIds = new Set(base.works.map((w) => w.id));
const updates: HumanRarity[] = [],
  candidates: any[] = [],
  deferred: any[] = [];
const exportHashes: Record<string, string> = {};
const sourceCatalogHashes: Record<string, string> = {};
for (const [dir, file, main] of [
  ["review-data", "mille.json", true],
  ["masterpieces-data", "25.json", false],
  ["enrichment-351-data", "masterpiece.json", false],
] as const) {
  const bytes = await readFile(`${inputDir}/${file}`);
  const exportSha256 = sha(bytes);
  if (receipt.files.find((f: any) => f.name === file)?.sha256 !== exportSha256)
    throw Error(`Export humain altéré : ${file}`);
  exportHashes[file] = exportSha256;
  const catalogData = await json(`public/${dir}/catalog.json`);
  const catalog = main
    ? parseReviewCatalog(catalogData)
    : parseCandidateCatalog(
        catalogData,
        dir === "enrichment-351-data"
          ? "/enrichment-351-images"
          : "/masterpieces-images",
      );
  const dataset = matchingLegalDataset(
    report,
    dir,
    catalog.version,
    sha(JSON.stringify(catalog)),
    day,
  );
  assertLegalBindings(dataset, catalog);
  sourceCatalogHashes[dir] = sha(JSON.stringify(catalog));
  const rights = new Map(dataset.entries.map((e) => [e.input.artworkId, e]));
  let decisions: any,
    selections: any = {};
  if (main)
    decisions = mergeDecisions(
      {},
      parseReviewExport(JSON.parse(bytes.toString()), catalog as any).decisions,
    );
  else
    ({ rarities: decisions, selections } = decisionsFor(
      parseCandidateExport(JSON.parse(bytes.toString()), catalog as any).events,
    ));
  for (const work of catalog.works) {
    const d = decisions[work.id];
    if (!d) throw Error(`Rareté humaine absente : ${work.id}`);
    const human: HumanRarity = {
      artworkId: work.id,
      level: d.finalLevel,
      decidedAt: d.decidedAt,
      catalogVersion: catalog.version,
      exportSha256,
    };
    if (oldIds.has(work.id)) {
      if (rights.get(work.id)?.decision.status === "BLOCKED")
        throw Error(
          "Œuvre historique bloquée : migration spécifique requise avant publication.",
        );
      updates.push(human);
      continue;
    }
    const proof = rights.get(work.id)!;
    if (selections[work.id] && selections[work.id] !== "accepted") {
      deferred.push({
        id: work.id,
        reason: `selection_${selections[work.id]}`,
      });
      continue;
    }
    if (proof.decision.status !== "AUTO_APPROVED_EU") {
      deferred.push({ id: work.id, reason: proof.decision.status });
      continue;
    }
    candidates.push({ work, human, proof, dataset: dir });
  }
}
if (
  updates.length !== base.works.length ||
  new Set(updates.map((d) => d.artworkId)).size !== base.works.length
)
  throw Error("Mise à jour humaine historique incomplète.");
evidence["src/catalog/seed.json"] = sha(baseBytes);
evidence["public/legal-eu/report.json"] = sha(legalBytes);
evidence["scripts/game-release/prepare.ts"] = sha(
  await readFile("scripts/game-release/prepare.ts"),
);
const id = `game-${day}-${sha(JSON.stringify({ exportHashes, legal: sha(legalBytes), sourceCatalogHashes, code: evidence["scripts/game-release/prepare.ts"] })).slice(0, 12)}`;
const cacheDir = "/tmp/opencode/muse-game-publication/downloads";
await mkdir(cacheDir, { recursive: true });
async function download(url: string, workId: string) {
  if (new URL(url).hostname !== "openaccess-cdn.clevelandart.org")
    throw Error("Source de téléchargement non prévue.");
  const file = `${cacheDir}/${workId}.bin`,
    metaFile = `${cacheDir}/${workId}.json`;
  try {
    const bytes = await readFile(file),
      meta = JSON.parse(await readFile(metaFile, "utf8"));
    if (meta.url !== url || meta.sha256 !== sha(bytes))
      throw Error(`Cache incohérent : ${workId}`);
    return { bytes, retrievedAt: meta.retrievedAt };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(60000),
      headers: { "User-Agent": "MUSE-Catalogue/1.0 (CC0 artwork publication)" },
    });
    if ([429, 500, 502, 503, 504].includes(response.status) && attempt < 2) {
      await response.body?.cancel();
      await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
      continue;
    }
    if (
      !response.ok ||
      new URL(response.url).hostname !== "openaccess-cdn.clevelandart.org"
    )
      throw Error(`Téléchargement refusé ${workId}: HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 20_000_000) throw Error("Image trop volumineuse.");
    const retrievedAt = new Date().toISOString();
    await immutable(file, bytes);
    await immutable(
      metaFile,
      JSON.stringify({ url, sha256: sha(bytes), retrievedAt }),
    );
    return { bytes, retrievedAt };
  }
  throw Error(`Téléchargement impossible : ${workId}`);
}
async function prepare(item: any): Promise<ReleasedArtwork> {
  const { work: w, human, proof, dataset } = item;
  let bytes: Buffer,
    sourceSha256: string,
    transformation: string,
    inventoryNumber: string,
    institutionalNote = "",
    evidenceFiles: string[],
    retrievedAt: string;
  if (dataset === "review-data") {
    const s: any = selected.get(w.id);
    if (!s) throw Error(`Notice source absente : ${w.id}`);
    const envelope = await cachedJson(s.evidenceFile);
    const r = envelope.payload.data.find((v: any) => `cma-${v.id}` === w.id);
    if (
      !r ||
      r.share_license_status !== "CC0" ||
      r.images.web.url !== proof.input.image.sourceUrl ||
      r.images.web.url !== w.imageUrl ||
      r.url !== w.sourceUrl ||
      r.copyright
    )
      throw Error(`Source CC0 non concordante : ${w.id}`);
    const downloaded = await download(r.images.web.url, w.id);
    sourceSha256 = sha(downloaded.bytes);
    retrievedAt = downloaded.retrievedAt;
    bytes = await sharp(downloaded.bytes)
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 88 })
      .toBuffer();
    transformation =
      "Orientation EXIF et réduction proportionnelle dans 1600×1600, sans recadrage, WebP qualité 88 ; aucune retouche créative.";
    inventoryNumber = r.accession_number;
    institutionalNote = plain(r.did_you_know || r.description || "");
    evidenceFiles = [
      s.evidenceFile,
      "catalog/legal-eu/sources/cma-open-access.json",
    ];
  } else {
    const a: any = prepared.get(w.id),
      m: any = images351.get(w.id);
    if (
      !a ||
      !m ||
      a.sourceUrl !== w.sourceUrl ||
      a.image.originalUrl !== proof.input.image.sourceUrl
    )
      throw Error(`Preuve des candidates absente : ${w.id}`);
    bytes = await readFile(m.output);
    if (sha(bytes) !== m.outputSha256)
      throw Error(`Image de candidate altérée : ${w.id}`);
    sourceSha256 = m.downloadSha256;
    retrievedAt = m.retrievedAt;
    transformation = m.transformation;
    inventoryNumber = a.inventoryNumber;
    evidenceFiles = [
      "catalog/enrichment-351/image-manifest.json",
      ...a.image.evidenceFiles,
    ];
    for (const file of a.image.evidenceFiles) await cachedJson(file);
  }
  const image = `/assets/game-release/${w.id}.webp`;
  const dimensions = await sharp(bytes).metadata();
  if (!dimensions.width || !dimensions.height)
    throw Error(`Raster invalide : ${w.id}`);
  await immutable(`public${image}`, bytes);
  const decorative = ["Arts décoratifs", "Arts du métal"].includes(w.family);
  const museumId =
    w.institution === "The Cleveland Museum of Art" ? "cma" : "louvre";
  const basis = proof.input.image.basis;
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
    museumId,
    rarity: human.level,
    rarityOrigin: "manual-review",
    publicationStatus: "published",
    anecdote: `Artiste : ${w.creator}. Collection : ${w.institution}.`,
    story: `${w.title} est datée de ${w.date || "une période non précisée"}. Technique indiquée par le musée : ${w.medium || "non renseignée"}. La notice institutionnelle liée ci-dessous permet de consulter les informations de collection disponibles.`,
    origin: w.context || "Contexte non précisé par la notice",
    source: w.sourceUrl,
    image,
    imageCredit: proof.input.image.credit,
    inventoryNumber,
    category: w.family,
    institutionalNote,
    imageSource: proof.input.image.sourceUrl,
    reuseUrl: proof.input.image.licenseUrl,
    reuseLabel:
      basis === "ARTICLE_14"
        ? "Domaine public UE · reproduction fidèle (article 14)"
        : basis,
    reuseObligations: proof.decision.obligations,
    humanRarity: human,
    legal: proof,
    imageEvidence: {
      sourceUrl: proof.input.image.sourceUrl,
      sourceSha256,
      outputSha256: sha(bytes),
      width: dimensions.width,
      height: dimensions.height,
      transformation,
      evidenceFiles,
      retrievedAt,
    },
  };
}
const works: ReleasedArtwork[] = [];
for (let index = 0; index < candidates.length; index += 3)
  works.push(
    ...(await Promise.all(candidates.slice(index, index + 3).map(prepare))),
  );
const release: GameRelease = {
  schemaVersion: 1,
  id,
  authorizedAt: day,
  authorization: "explicit-user-request",
  baseCatalogSha256: sha(baseBytes),
  legalReportSha256: sha(legalBytes),
  sourceCatalogHashes,
  existingRarities: updates,
  museums: [],
  catalogDescriptions: {
    "beaux-arts":
      "Peintures, dessins, estampes, photographies et sculptures : des regards et des gestes à travers l’histoire de l’art.",
  },
  works,
};
parseGameRelease(release, base);
const bytes = JSON.stringify(release) + "\n";
const manifest = {
  schemaVersion: 1,
  releaseId: id,
  releaseSha256: sha(bytes),
  authorizedAt: day,
  sourceExportHashes: exportHashes,
  newWorks: works.length,
  existingRarities: updates.length,
  totalWorks: works.length + base.works.length,
  deferred: deferred.reduce((counts: Record<string, number>, w: any) => {
    counts[w.reason] = (counts[w.reason] ?? 0) + 1;
    return counts;
  }, {}),
  evidenceHashes: evidence,
};
await immutable(`catalog/game-release/${id}/release.json`, bytes);
await immutable(
  `catalog/game-release/${id}/manifest.json`,
  JSON.stringify(manifest, null, 2) + "\n",
);
await immutable("src/catalog/game-release.json", bytes);
console.log(
  JSON.stringify({
    release: id,
    newWorks: works.length,
    existingRarities: updates.length,
    total: works.length + base.works.length,
    deferred: manifest.deferred,
  }),
);
