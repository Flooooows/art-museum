import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import sharp from "sharp";
import { frameFamilies } from "../../src/card-lab/frameRules";
import { preservedFrameFamilies } from "../../src/card-lab/prestigeSpecs";
import { themedSpecs, thematicBrief } from "../../src/card-lab/themedSpecs";
import { rarities } from "../../src/data";
import {
  applyThemedMaterial,
  clearSculptureBackdrop,
} from "./themed-processing";
import { refineFrame } from "./refined-processing";

const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");
const registry = "src/card-lab/assets/refined-frames.json";
const root = "catalog/card-lab/themed-frames";
const directory = "themed-frames",
  out = `src/card-lab/assets/${directory}`;
await mkdir(root, { recursive: true });
await mkdir(out, { recursive: true });
const before = await readFile(registry);
// Preserve the rejected edition and its exact active registry for traceability.
try {
  await readFile(`${root}/previous-edition.json`);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  if (JSON.parse(before.toString()).edition !== "prestige-v3")
    throw Error("Archive précédente manquante.");
  await writeFile(`${root}/previous-edition.json`, before, { flag: "wx" });
}
const baselineBytes = await readFile(
  "catalog/card-lab/prestige-frames/baseline.json",
);
const baseline = JSON.parse(baselineBytes.toString());
const frames: Record<string, any> = {},
  sources: Record<string, any> = {};
const width = 1024,
  height = 1536;

for (const family of frameFamilies) {
  if ((preservedFrameFamilies as readonly string[]).includes(family)) {
    for (const rarity of rarities) {
      const key = `${family}-${rarity.finish}`,
        old = baseline.frames[key];
      for (const [file, fingerprint] of [
        [old.file, old.outputSha256],
        [old.windowFile, old.windowSha256],
      ]) {
        const source = `src/card-lab/assets/${old.assetDirectory}/${file}`;
        if (sha(await readFile(source)) !== fingerprint)
          throw Error(`Cadre approuvé altéré : ${key}`);
        await copyFile(source, `${out}/${file}`);
      }
      frames[key] = { ...old, assetDirectory: directory };
      sources[old.sourceFile] = baseline.sources[old.sourceFile];
    }
    console.log(`Conservé : ${family}`);
    continue;
  }
  const spec = themedSpecs[family as keyof typeof themedSpecs];
  if (!spec) throw Error(`Thème manquant : ${family}`);
  const rawSourceFile = `src/card-lab/assets/generated-sources/${spec.source}`;
  const rawSource = await readFile(rawSourceFile);
  let sourceFile = rawSourceFile,
    original = rawSource;
  if (family === "sculpture") {
    const rgba = await sharp(rawSource).ensureAlpha().raw().toBuffer();
    original = await sharp(clearSculptureBackdrop(rgba), {
      raw: { width, height, channels: 4 },
    })
      .png()
      .toBuffer();
    sourceFile = rawSourceFile.replace(".png", "-clean.png");
    await writeFile(sourceFile, original);
  }
  let decoded = await sharp(original)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (decoded.info.width !== width || decoded.info.height !== height)
    throw Error(`Dimensions inattendues : ${family}`);
  let p = refineFrame(decoded.data, width, height, true);
  const safe = p.rectangle;
  // Nine-slice layout: corners use one uniform scale (round optical lenses
  // stay round); straight rails expand without deleting a single motif.
  const layoutScale = Math.min(
    1,
    180 / safe.left,
    180 / (width - safe.right),
    225 / safe.top,
    225 / (height - safe.bottom),
  );
  let normalizedLayout: unknown = null;
  if (layoutScale < 0.999) {
    const xs = [0, safe.left, safe.right, width],
      ys = [0, safe.top, safe.bottom, height];
    const tx = [
      0,
      Math.round(safe.left * layoutScale),
      width - Math.round((width - safe.right) * layoutScale),
      width,
    ];
    const ty = [
      0,
      Math.round(safe.top * layoutScale),
      height - Math.round((height - safe.bottom) * layoutScale),
      height,
    ];
    const panels = [];
    for (let y = 0; y < 3; y++)
      for (let x = 0; x < 3; x++)
        panels.push({
          input: await sharp(original)
            .extract({
              left: xs[x],
              top: ys[y],
              width: xs[x + 1] - xs[x],
              height: ys[y + 1] - ys[y],
            })
            .resize(tx[x + 1] - tx[x], ty[y + 1] - ty[y], { fit: "fill" })
            .png()
            .toBuffer(),
          left: tx[x],
          top: ty[y],
        });
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
    decoded = await sharp(original)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    p = refineFrame(decoded.data, width, height, true);
    normalizedLayout = {
      scale: layoutScale,
      sourceCuts: { x: xs, y: ys },
      targetCuts: { x: tx, y: ty },
      method: "Nine-slice, uniform corner scaling, no ornament removed.",
    };
  }
  const r = p.rectangle;
  const windowFile = `${family}-theme-v4-window.webp`;
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
    generationReferences: [],
    cues: spec.cues,
    materials: spec.materials,
    normalizedLayout,
    removedMetalPixels: p.removedMetalPixels,
    backdropOnMetalPixels: p.backdropOnMetalPixels,
    interiorPixels: p.interiorPixels,
  };
  for (const [level, rarity] of rarities.entries()) {
    const key = `${family}-${rarity.finish}`,
      file = `${family}-theme-v4-${rarity.finish}.webp`;
    const pixels = applyThemedMaterial(p.rgba, rarity.finish, family);
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
      assetDirectory: directory,
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
      origin: "generated-thematic-master-derived-finish",
      imageJob: spec.job,
      generationModel: "openai/gpt-image-2",
      removedMetalPixels: 0,
      backdropOnMetalPixels: 0,
      adaptation:
        rarity.finish === "lapis-lazuli"
          ? "Master natif : matières et accents précieux spécifiques au thème, sans cadre floral commun."
          : "Finition des accents bleus/métalliques ; matières du thème majoritairement préservées, alpha identique.",
    };
  }
  console.log(`Thème refait : ${family}`);
}
const all = Object.values(frames);
const left = Math.max(...all.map((f) => f.aperture.left)),
  top = Math.max(...all.map((f) => f.aperture.top));
const right = Math.min(...all.map((f) => f.aperture.left + f.aperture.width)),
  bottom = Math.min(...all.map((f) => f.aperture.top + f.aperture.height));
const commonAperture = { left, top, width: right - left, height: bottom - top };
if (commonAperture.width <= 60 || commonAperture.height <= 60)
  throw Error(`Gabarit trop petit : ${JSON.stringify(commonAperture)}`);
const script = "scripts/card-lab/prepare-themed-frames.ts",
  materialScript = "scripts/card-lab/themed-processing.ts";
const manifest = {
  schemaVersion: 1,
  edition: "theme-v4",
  width,
  height,
  commonAperture,
  neutralFamilies: 12,
  brief: thematicBrief,
  preservedFamilies: preservedFrameFamilies,
  baselineSha256: sha(baselineBytes),
  preparationScript: script,
  preparationScriptSha256: sha(await readFile(script)),
  processingScriptSha256: sha(
    await readFile("scripts/card-lab/refined-processing.ts"),
  ),
  materialScript,
  materialScriptSha256: sha(await readFile(materialScript)),
  method:
    "Treize masters distincts guidés par les matériaux, techniques et motifs de chaque thème. Six familles approuvées conservées octet pour octet ; anciennes éditions archivées. Finitions des accents et matières natives, masque strict, gabarit commun.",
  sources,
  frames,
};
const json = JSON.stringify(manifest, null, 2) + "\n";
await writeFile(registry, json);
await writeFile("catalog/card-lab/refined-frames/provenance.json", json);
await writeFile(`${root}/provenance.json`, json);
console.log(
  JSON.stringify({
    variants: all.length,
    refaites: 65,
    conservees: 30,
    commonAperture,
  }),
);
