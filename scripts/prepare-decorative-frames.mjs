import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const design = JSON.parse(
  await fs.readFile(
    path.join(root, "catalog/decorative-frame-generation.json"),
    "utf8",
  ),
);
const provenancePath = path.join(root, "public/assets/provenance.json");
let provenance = JSON.parse(await fs.readFile(provenancePath, "utf8"));
const hash = (buffer) => createHash("sha256").update(buffer).digest("hex");
const xml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const pending = [];

// Validate the entire set before writing any new canonical asset.
for (const variant of design.variants) {
  const bytes = await fs.readFile(path.join(root, variant.source));
  const metadata = await sharp(bytes).metadata();
  assert.equal(metadata.width, 1024, variant.source);
  assert.equal(metadata.height, 1536, variant.source);
  assert.equal(
    metadata.hasAlpha,
    true,
    `${variant.source} : vrai canal alpha requis`,
  );
  const { data, info } = await sharp(bytes)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let transparent = 0;
  for (let position = 3; position < data.length; position += info.channels)
    if (data[position] < 24) transparent++;
  assert.ok(
    transparent / (info.width * info.height) > 0.5,
    "Une grande ouverture transparente est requise",
  );
  const center = (768 * info.width + 512) * info.channels;
  assert.equal(
    data[center + 3],
    0,
    "Le centre ne doit pas contenir un fond peint",
  );
  const key = `collections/decoratifs-${variant.finish}.png`;
  const destination = path.join(root, "public/assets", key);
  const existing = await fs.readFile(destination).catch((error) => {
    if (error.code !== "ENOENT") throw error;
    return null;
  });
  if (existing)
    assert.equal(
      hash(existing),
      provenance[key]?.sha256,
      `Fichier existant inconnu ou modifié, non écrasé : ${key}`,
    );
  const record = {
    origin: design.origin,
    license: design.license,
    generationModel: design.modelReportedByTool,
    generatedAt: design.createdAt,
    generationPrompt: variant.prompt,
    reference: variant.reference,
    referenceSha256: hash(
      await fs.readFile(path.join(root, variant.reference)),
    ),
    source: variant.source,
    sourceSha256: hash(bytes),
    processing:
      "PNG 1024×1536 ; canal alpha natif conservé sans masque ni recoloration ; provenance XMP ajoutée.",
  };
  const xmp = `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:description><rdf:Alt><rdf:li xml:lang="x-default">${xml(JSON.stringify(record))}</rdf:li></rdf:Alt></dc:description></rdf:Description></rdf:RDF></x:xmpmeta>`;
  const output = await sharp(bytes)
    .withXmp(xmp)
    .png({ compressionLevel: 9 })
    .toBuffer();
  pending.push({
    key,
    destination,
    output,
    record: { ...record, sha256: hash(output) },
  });
}

for (const asset of pending) {
  await fs.writeFile(asset.destination, asset.output);
  provenance[asset.key] = asset.record;
}
const preparation = spawnSync(
  process.execPath,
  [path.join(root, "scripts/prepare-frames.mjs")],
  { cwd: root, stdio: "inherit" },
);
assert.equal(
  preparation.status,
  0,
  "Échec de préparation des cadres d’affichage",
);
provenance = {
  ...JSON.parse(await fs.readFile(provenancePath, "utf8")),
  ...Object.fromEntries(pending.map((asset) => [asset.key, asset.record])),
};
for (const asset of pending) {
  const key = asset.key.replace("collections/", "collections/display/");
  const bytes = await fs.readFile(path.join(root, "public/assets", key));
  provenance[key] = {
    ...asset.record,
    source: `/assets/${asset.key}`,
    sourceSha256: asset.record.sha256,
    sha256: hash(bytes),
    processing:
      "Dérivé PNG transparent 640×960, ouverture mesurée et XMP conservée par prepare-frames.mjs.",
  };
}
await fs.writeFile(provenancePath, JSON.stringify(provenance, null, 2) + "\n");
console.log(
  "Cinq cadres Arts décoratifs activés ; alpha natif, sources et provenance conservés.",
);
