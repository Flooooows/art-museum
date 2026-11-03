import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import sharp from "sharp";
import { frameFamilies } from "../../src/card-lab/frameRules";
import {
  prestigeSpecs,
  preservedFrameFamilies,
  prestigeBrief,
} from "../../src/card-lab/prestigeSpecs";
import { rarities } from "../../src/data";
import { applyMaterial } from "./generated-processing";
import { refineFrame } from "./refined-processing";

const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");
const registry = "src/card-lab/assets/refined-frames.json";
const archive = "catalog/card-lab/prestige-frames/baseline.json";
const out = "src/card-lab/assets/prestige-frames";
await mkdir("catalog/card-lab/prestige-frames", { recursive: true });
await mkdir(out, { recursive: true });
let baselineBytes: Buffer;
try {
  baselineBytes = await readFile(archive);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  baselineBytes = await readFile(registry);
  const previous = JSON.parse(baselineBytes.toString());
  if (previous.edition === "prestige-v3")
    throw Error("Archive d’avant refonte manquante.");
  await writeFile(archive, baselineBytes, { flag: "wx" });
}
const baseline = JSON.parse(baselineBytes.toString());
const frames: Record<string, any> = {},
  sources: Record<string, any> = {};
const width = 1024,
  height = 1536;

for (const family of frameFamilies) {
  if ((preservedFrameFamilies as readonly string[]).includes(family)) {
    for (const rarity of rarities) {
      const key = `${family}-${rarity.finish}`,
        previous = baseline.frames[key];
      for (const [file, fingerprint] of [
        [previous.file, previous.outputSha256],
        [previous.windowFile, previous.windowSha256],
      ]) {
        const path = `src/card-lab/assets/${previous.assetDirectory}/${file}`;
        if (sha(await readFile(path)) !== fingerprint)
          throw Error(`Décor approuvé altéré : ${key}`);
        await copyFile(path, `${out}/${file}`);
      }
      frames[key] = { ...previous, assetDirectory: "prestige-frames" };
      sources[previous.sourceFile] = baseline.sources[previous.sourceFile];
    }
    console.log(`Conservé à l’identique : ${family}`);
    continue;
  }
  const spec = prestigeSpecs[family as keyof typeof prestigeSpecs];
  if (!spec) throw Error(`Intention manquante : ${family}`);
  const rawSourceFile = `src/card-lab/assets/generated-sources/${spec.source}`;
  const rawSource = await readFile(rawSourceFile);
  // Preserve the binding clasps, but compress the two side strips rather than
  // cutting ornaments off to create a sufficiently wide text-safe opening.
  let sourceFile = rawSourceFile,
    original = rawSource;
  if (family === "manuscrits") {
    const panels = await Promise.all(
      [
        { left: 0, width: 256, target: 200, x: 0 },
        { left: 256, width: 512, target: 624, x: 200 },
        { left: 768, width: 256, target: 200, x: 824 },
      ].map(async (panel) => ({
        input: await sharp(rawSource)
          .extract({ left: panel.left, top: 0, width: panel.width, height })
          .resize(panel.target, height, { fit: "fill" })
          .png()
          .toBuffer(),
        left: panel.x,
        top: 0,
      })),
    );
    original = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(panels)
      .png()
      .toBuffer();
    sourceFile = rawSourceFile.replace(".png", "-layout.png");
    await writeFile(sourceFile, original);
  }
  const decoded = await sharp(original)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (decoded.info.width !== width || decoded.info.height !== height)
    throw Error(`Dimensions : ${family}`);
  const p = refineFrame(decoded.data, width, height, true),
    r = p.rectangle;
  const windowFile = `${family}-prestige-v3-window.webp`;
  const mask = await sharp(p.mask, { raw: { width, height, channels: 4 } })
    .webp({ lossless: true })
    .toBuffer();
  await writeFile(`${out}/${windowFile}`, mask);
  sources[sourceFile] = {
    sourceSha256: sha(original),
    rawSourceFile,
    rawSourceSha256: sha(rawSource),
    model: "openai/gpt-image-2",
    imageJob: spec.job,
    intent: spec.intent,
    references: preservedFrameFamilies,
    removedMetalPixels: p.removedMetalPixels,
    backdropOnMetalPixels: p.backdropOnMetalPixels,
    interiorPixels: p.interiorPixels,
  };
  for (const [level, rarity] of rarities.entries()) {
    const key = `${family}-${rarity.finish}`,
      file = `${family}-prestige-v3-${rarity.finish}.webp`;
    // Lapis is the actual multicolour stone-and-gold master, NOT a blue LUT.
    // The other four material palettes share the same sculpted relief/alpha.
    const pixels =
      rarity.finish === "lapis-lazuli"
        ? p.rgba
        : applyMaterial(p.rgba, rarity.finish);
    const bytes = await sharp(pixels, { raw: { width, height, channels: 4 } })
      .webp({ lossless: true, effort: 4 })
      .toBuffer();
    await writeFile(`${out}/${file}`, bytes);
    frames[key] = {
      key,
      family,
      finish: rarity.finish,
      level,
      file,
      assetDirectory: "prestige-frames",
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
      sourceSha256: sha(original),
      outputSha256: sha(bytes),
      windowFile,
      windowSha256: sha(mask),
      sourceMaskFile: null,
      sourceMaskSha256: null,
      origin: "generated-prestige-master-derived-finish",
      imageJob: spec.job,
      generationModel: "openai/gpt-image-2",
      removedMetalPixels: 0,
      backdropOnMetalPixels: 0,
      adaptation:
        rarity.finish === "lapis-lazuli"
          ? "Master polychrome : lapis profond, pyrite, or sculpté et cabochons conservés ; aucune recoloration bleue uniforme."
          : "Palette métallique déclarée dérivée du relief du master prestige ; alpha et ornements intacts.",
    };
  }
  console.log(`Refonte prestige : ${family}`);
}
const all = Object.values(frames);
const left = Math.max(...all.map((f) => f.aperture.left)),
  top = Math.max(...all.map((f) => f.aperture.top));
const right = Math.min(...all.map((f) => f.aperture.left + f.aperture.width)),
  bottom = Math.min(...all.map((f) => f.aperture.top + f.aperture.height));
const commonAperture = { left, top, width: right - left, height: bottom - top };
if (commonAperture.width <= 60 || commonAperture.height <= 60)
  throw Error(`Gabarit trop petit : ${JSON.stringify(commonAperture)}`);
const manifest = {
  schemaVersion: 1,
  edition: "prestige-v3",
  width,
  height,
  commonAperture,
  neutralFamilies: 12,
  brief: prestigeBrief,
  preservedFamilies: preservedFrameFamilies,
  baselineSha256: sha(baselineBytes),
  preparationScript: "scripts/card-lab/prepare-prestige-frames.ts",
  preparationScriptSha256: sha(
    await readFile("scripts/card-lab/prepare-prestige-frames.ts"),
  ),
  processingScriptSha256: sha(
    await readFile("scripts/card-lab/refined-processing.ts"),
  ),
  materialScriptSha256: sha(
    await readFile("scripts/card-lab/generated-processing.ts"),
  ),
  method:
    "Treize nouveaux masters lapis/or riches ; quatre finitions métalliques dérivées, lapis polychrome natif. Six familles approuvées conservées octet pour octet. Masques stricts et gabarit commun.",
  sources,
  frames,
};
const json = JSON.stringify(manifest, null, 2) + "\n";
await writeFile(registry, json);
await writeFile("catalog/card-lab/refined-frames/provenance.json", json);
await writeFile("catalog/card-lab/prestige-frames/provenance.json", json);
console.log(
  JSON.stringify({
    variants: all.length,
    improved: 65,
    preserved: 30,
    commonAperture,
  }),
);
