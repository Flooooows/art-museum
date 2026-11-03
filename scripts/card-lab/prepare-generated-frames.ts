import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { allGeneratedSpecs } from "../../src/card-lab/generatedSpecs";
import { rarities } from "../../src/data";
import {
  applyMaterial,
  cleanGeneratedMaster,
  materialRecipe,
} from "./generated-processing";

const out = "src/card-lab/assets/frames",
  width = 768,
  height = 1152;
const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");
const frames: Record<string, unknown> = {},
  masters: Record<string, unknown> = {};
await mkdir(out, { recursive: true });
for (const [family, spec] of Object.entries(allGeneratedSpecs)) {
  const assetFamily = "assetFamily" in spec ? spec.assetFamily : family;
  const sourceFile = `src/card-lab/assets/generated-sources/${spec.source}`,
    original = await readFile(sourceFile);
  const decoded = await sharp(original)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (decoded.info.width !== 1024 || decoded.info.height !== 1536)
    throw Error(`Dimensions générées inattendues : ${family}`);
  const cleaned = cleanGeneratedMaster(decoded.data, 1024, 1536),
    r = cleaned.opening;
  const rectangle = {
    left: Math.ceil((r.left * width) / 1024),
    top: Math.ceil((r.top * height) / 1536),
    right: Math.floor((r.right * width) / 1024),
    bottom: Math.floor((r.bottom * height) / 1536),
  };
  const base = await sharp(cleaned.rgba, {
    raw: { width: 1024, height: 1536, channels: 4 },
  })
    .resize(width, height)
    .raw()
    .toBuffer();
  const mask = await sharp(cleaned.window, {
    raw: { width: 1024, height: 1536, channels: 4 },
  })
    .resize(width, height, { kernel: "nearest" })
    .raw()
    .toBuffer();
  for (let y = rectangle.top; y < rectangle.bottom; y++)
    for (let x = rectangle.left; x < rectangle.right; x++) {
      base.fill(0, (y * width + x) * 4, (y * width + x) * 4 + 4);
      mask.fill(255, (y * width + x) * 4, (y * width + x) * 4 + 4);
    }
  const windowFile = `${assetFamily}-generated-window.webp`,
    windowBytes = await sharp(mask, { raw: { width, height, channels: 4 } })
      .webp({ lossless: true })
      .toBuffer();
  await writeFile(`${out}/${windowFile}`, windowBytes);
  masters[family] = {
    sourceFile,
    sourceSha256: sha(original),
    model: "openai/gpt-image-2",
    imageJob: spec.job,
    promptSummary: spec.intent,
    originalWidth: 1024,
    originalHeight: 1536,
    emptyPixels: cleaned.insidePixels,
    sourceOpening: r,
  };
  for (const [level, rarity] of rarities.entries()) {
    const key = `${family}-${rarity.finish}`,
      file = `${assetFamily}-${rarity.finish}.webp`;
    const bytes = await sharp(applyMaterial(base, rarity.finish), {
      raw: { width, height, channels: 4 },
    })
      .webp({ quality: 92, alphaQuality: 100, effort: 5 })
      .toBuffer();
    await writeFile(`${out}/${file}`, bytes);
    frames[key] = {
      key,
      family,
      finish: rarity.finish,
      level,
      file,
      width,
      height,
      aperture: {
        left: ((rectangle.left + 2) / width) * 100,
        top: ((rectangle.top + 2) / height) * 100,
        width: ((rectangle.right - rectangle.left - 4) / width) * 100,
        height: ((rectangle.bottom - rectangle.top - 4) / height) * 100,
      },
      clearedRectangle: rectangle,
      sourceFile,
      sourceSha256: sha(original),
      outputSha256: sha(bytes),
      windowFile,
      windowSha256: sha(windowBytes),
      sourceMaskFile: null,
      sourceMaskSha256: null,
      origin: "generated-master-derived-finish",
      generationModel: "openai/gpt-image-2",
      imageJob: spec.job,
      adaptation: materialRecipe,
    };
  }
  console.log(`Cadre généré préparé : ${family} · 5 finitions`);
}
const data = {
  schemaVersion: 1,
  preparationScriptSha256: sha(
    await readFile("scripts/card-lab/prepare-generated-frames.ts"),
  ),
  processingScriptSha256: sha(
    await readFile("scripts/card-lab/generated-processing.ts"),
  ),
  method: materialRecipe,
  masters,
  frames,
};
await writeFile(
  "src/card-lab/assets/generated-frames.json",
  JSON.stringify(data, null, 2) + "\n",
);
await mkdir("catalog/card-lab/generated-frames", { recursive: true });
await writeFile(
  "catalog/card-lab/generated-frames/provenance.json",
  JSON.stringify(
    {
      ...data,
      frames: Object.fromEntries(
        Object.entries(frames).map(([k, v]) => [k, v]),
      ),
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Laboratoire : ${Object.keys(masters).length} bases générées, ${Object.keys(frames).length} variantes de finition, sans publication.`,
);
