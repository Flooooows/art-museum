import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import legacy from "../../src/card-lab/assets/frames.json";
import generated from "../../src/card-lab/assets/generated-frames.json";
import { detailedSpecs } from "../../src/card-lab/detailedSpecs";
import {
  frameFamilies,
  generatedFrameFamilies,
} from "../../src/card-lab/frameRules";
import { rarities } from "../../src/data";
import { applyMaterial, materialRecipe } from "./generated-processing";
import { refineFrame } from "./refined-processing";

const width = 1024,
  height = 1536,
  out = "src/card-lab/assets/refined-frames";
const sha = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const oldFrames = { ...legacy.frames, ...generated.frames };
const frames: Record<string, any> = {},
  sources: Record<string, any> = {};
await mkdir(out, { recursive: true });
for (const family of frameFamilies) {
  const detail = detailedSpecs[family as keyof typeof detailedSpecs];
  const isGenerated = !!detail || family === "japon";
  const sourceCache = new Map<
    string,
    { original: Buffer; prepared: ReturnType<typeof refineFrame> }
  >();
  for (const [level, rarity] of rarities.entries()) {
    const key = `${family}-${rarity.finish}`,
      old = oldFrames[key as keyof typeof oldFrames];
    const sourceFile = detail
      ? `src/card-lab/assets/generated-sources/${detail.source}`
      : old.sourceFile;
    let source = sourceCache.get(sourceFile);
    if (!source) {
      const original = await readFile(sourceFile),
        decoded = await sharp(original)
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });
      if (decoded.info.width !== width || decoded.info.height !== height)
        throw Error(`Dimensions de source inattendues : ${sourceFile}`);
      source = {
        original,
        prepared: refineFrame(decoded.data, width, height, isGenerated),
      };
      sourceCache.set(sourceFile, source);
      sources[sourceFile] = {
        sourceSha256: sha(original),
        model: isGenerated ? "openai/gpt-image-2" : null,
        imageJob:
          detail?.job ??
          (family === "japon" ? generated.masters.japon.imageJob : null),
        reference: detail
          ? `src/card-lab/assets/generated-sources/${detail.reference}`
          : null,
        intent:
          detail?.intent ??
          "Source historique conservée ; fenêtre recalculée depuis sa transparence réelle.",
        removedMetalPixels: source.prepared.removedMetalPixels,
        backdropOnMetalPixels: source.prepared.backdropOnMetalPixels,
        interiorPixels: source.prepared.interiorPixels,
      };
    }
    const p = source.prepared,
      r = p.rectangle;
    const pixels = isGenerated ? applyMaterial(p.rgba, rarity.finish) : p.rgba;
    const file =
      family === "japon" ? `japon-v2-${rarity.finish}.webp` : `${key}.webp`;
    const bytes = await sharp(pixels, { raw: { width, height, channels: 4 } })
      .webp({ lossless: true, effort: 4 })
      .toBuffer();
    await writeFile(`${out}/${file}`, bytes);
    const windowFile =
      family === "japon"
        ? "japon-v2-generated-window.webp"
        : isGenerated
          ? `${family}-detail-window.webp`
          : `${key}-window.webp`;
    const windowBytes = await sharp(p.mask, {
      raw: { width, height, channels: 4 },
    })
      .webp({ lossless: true })
      .toBuffer();
    await writeFile(`${out}/${windowFile}`, windowBytes);
    frames[key] = {
      key,
      family,
      finish: rarity.finish,
      level,
      file,
      assetDirectory: "refined-frames",
      width,
      height,
      aperture: {
        left: (r.left / width) * 100,
        top: (r.top / height) * 100,
        width: ((r.right - r.left) / width) * 100,
        height: ((r.bottom - r.top) / height) * 100,
      },
      clearedRectangle: r,
      sourceFile,
      sourceSha256: sha(source.original),
      outputSha256: sha(bytes),
      windowFile,
      windowSha256: sha(windowBytes),
      sourceMaskFile: null,
      sourceMaskSha256: null,
      origin: detail
        ? "generated-detailed-master-derived-finish"
        : isGenerated
          ? "generated-master-derived-finish"
          : "historical-source-preserved",
      imageJob: sources[sourceFile].imageJob,
      generationModel: sources[sourceFile].model,
      removedMetalPixels: 0,
      backdropOnMetalPixels: 0,
      adaptation: isGenerated
        ? materialRecipe
        : "Source native intacte : aucun ornement opaque effacé, masque intérieur séparé et conservateur.",
    };
  }
  console.log(`Cadres détaillés et masque strict : ${family}`);
}
const all = Object.values(frames),
  left = Math.max(...all.map((f) => f.aperture.left)),
  top = Math.max(...all.map((f) => f.aperture.top)),
  right = Math.min(...all.map((f) => f.aperture.left + f.aperture.width)),
  bottom = Math.min(...all.map((f) => f.aperture.top + f.aperture.height));
const commonAperture = { left, top, width: right - left, height: bottom - top };
if (commonAperture.width < 57 || commonAperture.height < 57)
  throw Error("Gabarit commun trop petit.");
const manifest = {
  schemaVersion: 1,
  width,
  height,
  commonAperture,
  neutralFamilies: generatedFrameFamilies.length,
  preparationScriptSha256: sha(
    await readFile("scripts/card-lab/prepare-refined-frames.ts"),
  ),
  processingScriptSha256: sha(
    await readFile("scripts/card-lab/refined-processing.ts"),
  ),
  materialScriptSha256: sha(
    await readFile("scripts/card-lab/generated-processing.ts"),
  ),
  method:
    "Sources natives 1024×1536 et WebP sans perte ; masque strict recalculé, jamais découpé dans le métal ; gabarit commun et nouveaux masters détaillés. Archives intactes.",
  sources,
  frames,
};
await writeFile(
  "src/card-lab/assets/refined-frames.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
await mkdir("catalog/card-lab/refined-frames", { recursive: true });
await writeFile(
  "catalog/card-lab/refined-frames/provenance.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    variants: all.length,
    commonAperture,
    removedMetalPixels: 0,
    backdropOnMetalPixels: 0,
  }),
);
