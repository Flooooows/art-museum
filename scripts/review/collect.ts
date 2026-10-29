import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DiskCaptureStore, JsonCaptureClient, sha256 } from "../rarity-v2/http";
import { assertProtectedInputs } from "../rarity-v2/integrity";
import { COLLECTION_GROUPS, validMuseumRecord } from "./records";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const directory = path.join(root, "catalog/review-1000");
await assertProtectedInputs(root);
const seed = JSON.parse(
  await readFile(path.join(root, "src/catalog/seed.json"), "utf8"),
) as { works: { id: string }[] };
const used = new Set(seed.works.map((w) => w.id));
const client = new JsonCaptureClient({
  store: new DiskCaptureStore(path.join(directory, "cache")),
  offline: !process.argv.includes("--live"),
  minimumIntervalMs: 6000,
  timeoutMs: 60000,
  maximumRetryAfterMs: 120000,
  userAgent:
    "MUSE-Catalog-Research/2.0 (noncommercial review; cached institutional records)",
});
const selection: {
  id: string;
  family: string;
  type: string;
  evidenceFile: string;
  sourceUrl: string;
  retrievedAt: string;
}[] = [];
for (const group of COLLECTION_GROUPS) {
  let count = 0;
  for (let skip = 0; count < group.count && skip < 1500; skip += 100) {
    const url = new URL(
      "https://openaccess-api.clevelandart.org/api/artworks/",
    );
    for (const [key, value] of Object.entries({
      cc0: "1",
      has_image: "1",
      type: group.type,
      limit: "100",
      skip: String(skip),
    }))
      url.searchParams.set(key, value);
    const capture = await client.request(
      "cma",
      url.toString(),
      undefined,
      (value) =>
        !!value &&
        typeof value === "object" &&
        Array.isArray((value as { data?: unknown }).data),
    );
    if (capture.status !== "available")
      throw new Error(
        `${group.type} : ${capture.status}. Relancer avec --live si la capture manque ; aucune donnée fabriquée.`,
      );
    const data = (capture.payload as { data: unknown[] }).data;
    if (!data.length) break;
    const evidenceFile = `catalog/review-1000/cache/${sha256(capture.url)}.json`;
    for (const record of data) {
      if (!validMuseumRecord(record) || record.type !== group.type) continue;
      const id = `cma-${record.id}`;
      if (used.has(id)) continue;
      used.add(id);
      count++;
      selection.push({
        id,
        family: group.family,
        type: group.type,
        evidenceFile,
        sourceUrl: record.url,
        retrievedAt: capture.retrievedAt,
      });
      if (count === group.count) break;
    }
  }
  if (count !== group.count)
    throw new Error(
      `${group.type} : seulement ${count}/${group.count} notices admissibles.`,
    );
  console.log(`${group.family} : ${count} nouvelles œuvres CC0.`);
}
if (selection.length !== 900)
  throw new Error("900 nouvelles œuvres distinctes attendues.");
await mkdir(directory, { recursive: true });
await writeFile(
  path.join(directory, "selection.json"),
  JSON.stringify(
    {
      schemaVersion: 1,
      purpose: "Atelier uniquement ; aucune importation dans le jeu.",
      method:
        "Sélection par médium, premières notices admissibles des captures paginées ; exclusion des identifiants déjà actifs. Ce n’est pas un échantillon mondial représentatif ni un quota de rareté.",
      groups: COLLECTION_GROUPS,
      works: selection,
    },
    null,
    2,
  ) + "\n",
);
await assertProtectedInputs(root);
console.log(
  "900 nouvelles œuvres sélectionnées ; les 100 actives restent inchangées.",
);
