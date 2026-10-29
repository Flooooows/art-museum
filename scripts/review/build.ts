import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadInputs } from "../rarity-v2/inputs";
import { assertProtectedInputs, frozenWrite } from "../rarity-v2/integrity";
import { sha256, payloadHash, type Capture } from "../rarity-v2/http";
import { scoreDirect } from "../../src/rarity-engine/scoring";
import { completeCriteria } from "../../src/rarity-engine/estimation";
import {
  confidenceFor,
  rarityLevel,
  validationReasons,
  weightedInterval,
} from "../../src/rarity-engine/validation";
import { parseEngineConfig } from "../../src/rarity-engine/configuration";
import {
  CRITERIA,
  type ArtworkInput,
  type CriteriaResults,
  type Evidence,
  type RarityResult,
} from "../../src/rarity-engine/types";
import type {
  ReviewArtwork,
  ReviewCatalog,
  ReviewLevel,
} from "../../src/review/types";
import { museumInput, plain, validMuseumRecord } from "./records";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const directory = path.join(root, "catalog/review-1000");
const protectedHashes = await assertProtectedInputs(root);
const historical = await loadInputs(root);
const selectionBytes = await readFile(path.join(directory, "selection.json"));
const selection = JSON.parse(selectionBytes.toString()) as {
  works: {
    id: string;
    family: string;
    evidenceFile: string;
    sourceUrl: string;
    retrievedAt: string;
  }[];
};
const configBytes = await readFile(
  path.join(root, "catalog/rarity-v2/config-2.0.0.json"),
);
const config = parseEngineConfig(JSON.parse(configBytes.toString()));
const oldScoresFile =
  "catalog/rarity-v2/runs/02b68c195210ea3536d84c1a/results.json";
const oldBytes = await readFile(path.join(root, oldScoresFile));
const oldScores = (
  JSON.parse(oldBytes.toString()) as { results: RarityResult[] }
).results;
const evidenceHashes: Record<string, string> = {
  ...historical.files,
  [oldScoresFile]: sha256(oldBytes),
};
const implementationHashes: Record<string, string> = {};
for (const folder of [
  "src/rarity-engine",
  "scripts/review",
  "scripts/rarity-v2",
])
  for (const file of (await readdir(path.join(root, folder))).sort())
    if (file.endsWith(".ts"))
      implementationHashes[`${folder}/${file}`] = sha256(
        await readFile(path.join(root, folder, file)),
      );
const policy: Evidence = {
  id: sha256(configBytes).slice(0, 24),
  provider: "muse-editorial-policy",
  independentGroup: "muse-policy",
  url: `urn:muse:rarity:${config.configurationVersion}`,
  retrievedAt: config.issuedAt,
  file: "catalog/rarity-v2/config-2.0.0.json",
  sha256: sha256(configBytes),
  tier: 3,
  scope: "policy",
};
const peerMaps = new Map(
  config.sensitivity.normalizationScales.map((scale) => [
    scale,
    new Map(
      historical.works.map((w) => [
        w.id,
        scoreDirect(w, config, historical.days, undefined, scale),
      ]),
    ),
  ]),
);
if (!peerMaps.has(1)) throw new Error("Scénario de base manquant.");

function proposal(work: ArtworkInput): ReviewArtwork["proposal"] {
  const criteriaAt = (scale: number) => {
    const direct = new Map(peerMaps.get(scale)!);
    direct.set(
      work.id,
      scoreDirect(work, config, historical.days, undefined, scale),
    );
    return completeCriteria(work, historical.works, direct, config, policy);
  };
  const criteria = criteriaAt(1);
  const total = weightedInterval(criteria, config);
  const level = rarityLevel(total.score, config);
  const normalizationStable = config.sensitivity.normalizationScales.every(
    (scale) =>
      rarityLevel(
        weightedInterval(scale === 1 ? criteria : criteriaAt(scale), config)
          .score,
        config,
      ) === level,
  );
  const stable =
    normalizationStable &&
    Object.values(config.sensitivity.weightProfiles).every(
      (weights) =>
        rarityLevel(
          weightedInterval(criteria, { ...config, weights }).score,
          config,
        ) === level,
    );
  const confidence = confidenceFor(work, criteria, config);
  const reasons = validationReasons(
    work,
    criteria,
    total,
    total.score,
    confidence,
    stable,
    config,
  );
  return summarizeProposal(
    criteria,
    total.score,
    level,
    total,
    confidence.score,
    stable,
    reasons,
    reasons.length ? "provisional" : "confirmed",
  );
}

function summarizeProposal(
  criteria: CriteriaResults,
  score: number,
  level: number,
  interval: { lower: number; upper: number },
  confidence: number,
  stable: boolean,
  reasons: string[],
  status: "provisional" | "confirmed",
): ReviewArtwork["proposal"] {
  return {
    score,
    level: level as ReviewLevel,
    interval: { lower: interval.lower, upper: interval.upper },
    confidence,
    stable,
    reasons,
    status,
    criteria: Object.fromEntries(
      CRITERIA.map((key) => {
        const c = criteria[key];
        return [
          key,
          {
            score: c.score,
            lower: c.lower,
            upper: c.upper,
            type: c.type,
            method: c.method,
            notes: c.notes,
            sourceUrls: [
              ...new Set(
                c.evidence
                  .filter((e) => e.url.startsWith("https://"))
                  .map((e) => e.url),
              ),
            ],
            comparableIds: c.comparableIds,
          },
        ];
      }),
    ) as ReviewArtwork["proposal"]["criteria"],
  };
}

const works: ReviewArtwork[] = historical.works.map((w) => {
  const seedWork = historical.seed.works.find((row) => row.id === w.id)!;
  const image = historical.seed.images.find(
    (row) => row.workId === w.id && row.primary,
  )!;
  const old = oldScores.find((row) => row.artworkId === w.id)!;
  if (!old || !image) throw new Error(`Référence historique absente : ${w.id}`);
  return {
    id: w.id,
    title: w.title,
    creator: w.creator,
    date: w.displayDate,
    medium: w.medium,
    context: w.context,
    family: historical.seed.families.find((f) => f.id === seedWork.familyId)!
      .name,
    institution: historical.seed.museums.find((m) => m.id === w.institution)!
      .name,
    sourceUrl: seedWork.sources[0].url,
    imageUrl: image.url,
    license: image.rights.statement,
    origin: "existing",
    activeLevel: w.activeLevel as ReviewLevel,
    proposal: summarizeProposal(
      old.criteria,
      old.notorietyScore,
      old.rarityLevel,
      old.scoreInterval,
      old.confidenceScore,
      old.stableClassification,
      old.reviewReasons,
      old.status,
    ),
  };
});
const captures = new Map<string, Capture>();
for (const entry of selection.works) {
  if (
    !entry.evidenceFile.startsWith("catalog/review-1000/cache/") ||
    entry.evidenceFile.includes("..")
  )
    throw new Error("Chemin de capture invalide.");
  if (!captures.has(entry.evidenceFile)) {
    const bytes = await readFile(path.join(root, entry.evidenceFile));
    evidenceHashes[entry.evidenceFile] = sha256(bytes);
    const capture = JSON.parse(bytes.toString()) as Capture;
    if (
      capture.status !== "available" ||
      payloadHash(capture.payload) !== capture.payloadSha256
    )
      throw new Error(`Capture altérée : ${entry.evidenceFile}`);
    captures.set(entry.evidenceFile, capture);
  }
  const capture = captures.get(entry.evidenceFile)!;
  const record = (capture.payload as { data: unknown[] }).data.find(
    (value) => validMuseumRecord(value) && `cma-${value.id}` === entry.id,
  );
  if (!validMuseumRecord(record))
    throw new Error(`Notice CC0 introuvable : ${entry.id}`);
  const evidence: Evidence = {
    id: `${evidenceHashes[entry.evidenceFile].slice(0, 16)}-${record.id}`,
    provider: "cma",
    independentGroup: "cma",
    url: record.url,
    retrievedAt: capture.retrievedAt,
    file: entry.evidenceFile,
    sha256: evidenceHashes[entry.evidenceFile],
    tier: 1,
    scope: "artwork",
  };
  const input = museumInput(record, evidence);
  works.push({
    id: input.id,
    title: plain(record.title),
    creator: input.creator,
    date: input.displayDate,
    medium: input.medium,
    context: input.context,
    family: entry.family,
    institution: "The Cleveland Museum of Art",
    sourceUrl: record.url,
    imageUrl: record.images.web!.url,
    license: "CC0 — Cleveland Museum of Art Open Access",
    origin: "new",
    activeLevel: null,
    proposal: proposal(input),
  });
}
if (
  works.length !== 1000 ||
  new Set(works.map((w) => w.id)).size !== 1000 ||
  works.filter((w) => w.origin === "new").length !== 900
)
  throw new Error(
    "Exactement 1000 œuvres uniques dont 900 nouvelles attendues.",
  );
const method =
  "100 propositions historiques figées ; 900 nouvelles avec le moteur V2 et les comparables historiques non imputés, sans les ajouter au groupe de référence. Ni percentile sur ces 1000 cibles ni collecte d’audience supplémentaire. Titres nouveaux conservés dans la langue de l’institution. Décisions humaines indépendantes, sans activation dans le jeu.";
const manifestBase = {
  selectionSha256: sha256(selectionBytes),
  configurationSha256: sha256(configBytes),
  historicalResultsSha256: sha256(oldBytes),
  evidenceHashes: Object.fromEntries(
    Object.entries(evidenceHashes).sort(([a], [b]) => a.localeCompare(b)),
  ),
  implementationHashes,
  protectedHashes,
  method,
};
const version = `review-1000-${sha256(JSON.stringify(manifestBase)).slice(0, 16)}`;
const catalog: ReviewCatalog = {
  schemaVersion: 1,
  version,
  algorithmVersion: config.algorithmVersion,
  configurationVersion: config.configurationVersion,
  method,
  works,
};
const publicDirectory = path.join(root, "public/review-data");
await mkdir(publicDirectory, { recursive: true });
const bytes = JSON.stringify(catalog) + "\n";
const summary = {
  total: works.length,
  existing: 100,
  added: 900,
  provisional: works.filter((w) => w.proposal.status === "provisional").length,
  distribution: config.rarities.map((rarity, level) => ({
    rarity,
    count: works.filter((w) => w.proposal.level === level).length,
  })),
  families: Object.fromEntries(
    [...new Set(works.map((w) => w.family))]
      .sort()
      .map((f) => [f, works.filter((w) => w.family === f).length]),
  ),
  meanConfidence:
    works.reduce((s, w) => s + w.proposal.confidence, 0) / works.length,
};
await assertProtectedInputs(root);
const manifestBytes =
  JSON.stringify(
    { version, ...manifestBase, catalogSha256: sha256(bytes), summary },
    null,
    2,
  ) + "\n";
await frozenWrite(path.join(directory, "runs", version, "catalog.json"), bytes);
await frozenWrite(
  path.join(directory, "runs", version, "manifest.json"),
  manifestBytes,
);
await writeFile(path.join(publicDirectory, "catalog.json"), bytes);
await writeFile(path.join(directory, "manifest.json"), manifestBytes);
console.log(
  JSON.stringify(
    { version, ...summary, bytes: Buffer.byteLength(bytes) },
    null,
    2,
  ),
);
