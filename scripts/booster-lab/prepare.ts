import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { boosterGroups } from "../../src/booster-lab/groups";
import { cleanBoosterSource, isBoosterChroma } from "./processing";

const sha = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const width = 768,
  height = 1152,
  out = "src/booster-lab/assets/prepared";
await mkdir(out, { recursive: true });
const packs: Record<string, unknown> = {};
for (const group of boosterGroups) {
  const sourceFile = `src/booster-lab/assets/generated-sources/${group.id}-master.png`,
    source = await readFile(sourceFile);
  const decoded = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (decoded.info.width !== 1024 || decoded.info.height !== 1536)
    throw Error(`Dimensions inattendues : ${group.id}`);
  const cleaned = cleanBoosterSource(decoded.data, 1024, 1536);
  const resized = await sharp(cleaned.rgba, {
    raw: { width: 1024, height: 1536, channels: 4 },
  })
    .extract(cleaned.bounds)
    .resize(648, 1104, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extend({
      left: 60,
      right: 60,
      top: 24,
      bottom: 24,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .raw()
    .toBuffer();
  // Remove resampling fringes before lossless encoding; keep the foil body opaque.
  for (let p = 0; p < resized.length; p += 4) {
    if (
      resized[p + 3] < 8 ||
      isBoosterChroma(resized[p], resized[p + 1], resized[p + 2])
    )
      resized.fill(0, p, p + 4);
  }
  const bytes = await sharp(resized, { raw: { width, height, channels: 4 } })
    .webp({ lossless: true, effort: 5 })
    .toBuffer();
  const file = `${group.id}.webp`;
  await writeFile(`${out}/${file}`, bytes);
  packs[group.id] = {
    id: group.id,
    file,
    width,
    height,
    sourceFile,
    sourceSha256: sha(source),
    outputSha256: sha(bytes),
    sourceBounds: cleaned.bounds,
    exteriorPixels: cleaned.exteriorPixels,
    model: "openai/gpt-image-2",
    imageJob: group.job,
    promptSummary: {
      palette: group.palette,
      motif: group.motif,
      layout:
        "Pochette frontale scellée ; zones supérieures et inférieures sans texte pour typographie HTML commune.",
      reference: "public/assets/booster.png",
    },
    type: "generated-pack-illustration",
    rightsNote:
      "Illustration générée ; aucune licence muséale attribuée. Ce n’est pas une reproduction d’œuvre du catalogue.",
  };
  console.log(`Pochette préparée : ${group.title}`);
}
const manifest = {
  schemaVersion: 1,
  method:
    "Sept illustrations générées distinctes ; détourage du fond extérieur et mise à l’échelle proportionnelle commune. Textes ajoutés en HTML, pas dans les images sources.",
  referenceSha256: sha(await readFile("public/assets/booster.png")),
  preparationScriptSha256: sha(
    await readFile("scripts/booster-lab/prepare.ts"),
  ),
  processingScriptSha256: sha(
    await readFile("scripts/booster-lab/processing.ts"),
  ),
  packs,
};
await writeFile(
  "src/booster-lab/assets/packs.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
await mkdir("catalog/booster-lab", { recursive: true });
await writeFile(
  "catalog/booster-lab/provenance.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
