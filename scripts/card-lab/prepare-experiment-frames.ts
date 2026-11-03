import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { frameFamilies } from "../../src/card-lab/frameRules";
import { preservedFrameFamilies } from "../../src/card-lab/prestigeSpecs";
import { allFrameExperiments } from "../../src/card-lab/experiments/series";
import { frameGenerationStyle } from "../../src/card-lab/generationStyle";
import { rarities } from "../../src/data";
import { refineFrame } from "./refined-processing";

const sha = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const registryFile = "src/card-lab/assets/refined-frames.json";
const root = "catalog/card-lab/experiment-frames";
const assetDirectory = "experiment-frames";
const out = `src/card-lab/assets/${assetDirectory}`;
const width = 1024,
  height = 1536;
await mkdir(root, { recursive: true });
await mkdir(out, { recursive: true });
try {
  await readFile(`${root}/previous-edition.json`);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  const previous = await readFile(registryFile);
  if (JSON.parse(previous.toString()).edition !== "approved-only")
    throw Error("Archive approuvée manquante.");
  await writeFile(`${root}/previous-edition.json`, previous, { flag: "wx" });
}
const baseline = JSON.parse(
  await readFile("catalog/card-lab/prestige-frames/baseline.json", "utf8"),
);
const frames: Record<string, any> = {},
  sources: Record<string, any> = {};
for (const family of frameFamilies) {
  if ((preservedFrameFamilies as readonly string[]).includes(family)) {
    for (const rarity of rarities) {
      const key = `${family}-${rarity.finish}`,
        frame = baseline.frames[key];
      for (const [file, expected] of [
        [frame.file, frame.outputSha256],
        [frame.windowFile, frame.windowSha256],
      ]) {
        if (
          sha(
            await readFile(
              `src/card-lab/assets/${frame.assetDirectory}/${file}`,
            ),
          ) !== expected
        )
          throw Error(`Cadre historique altéré : ${key}`);
      }
      frames[key] = frame;
      sources[frame.sourceFile] = baseline.sources[frame.sourceFile];
    }
    console.log(`Conservé à l’identique : ${family}`);
    continue;
  }
  const experiment = allFrameExperiments.find((e) => e.family === family);
  if (!experiment) throw Error(`Expérience manquante : ${family}`);
  const manifest = JSON.parse(
    await readFile(
      `src/card-lab/experiments/${family}/essai-01-finitions.json`,
      "utf8",
    ),
  );
  const masterFile = `src/card-lab/experiments/${family}/essai-01.png`;
  const master = await readFile(masterFile);
  if (sha(master) !== manifest.sourceSha256)
    throw Error(`Master altéré : ${family}`);
  const pixels = await sharp(master)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (pixels.info.width !== width || pixels.info.height !== height)
    throw Error(`Dimensions inattendues : ${family}`);
  // Keep the reviewed geometry and colors. Only clear already near-transparent
  // pixels (<16 alpha); no chroma key, palette change, resizing or opaque erasure.
  const prepared = refineFrame(pixels.data, width, height, false),
    r = prepared.rectangle;
  const windowFile = `${family}-essai-01-window.webp`;
  const mask = await sharp(prepared.mask, {
    raw: { width, height, channels: 4 },
  })
    .webp({ lossless: true })
    .toBuffer();
  await writeFile(`${out}/${windowFile}`, mask);
  for (const [level, rarity] of rarities.entries()) {
    const original = manifest.outputs.find(
      (o: { finish: string }) => o.finish === rarity.finish,
    );
    if (!original)
      throw Error(`Finition manquante : ${family}/${rarity.finish}`);
    const input = await readFile(original.file);
    if (sha(input) !== original.sha256)
      throw Error(`Palette altérée : ${original.file}`);
    const raw = await sharp(input).ensureAlpha().raw().toBuffer();
    for (let p = 3; p < raw.length; p += 4)
      if (raw[p] !== pixels.data[p])
        throw Error(`Alpha différent : ${original.file}`);
    const variant = refineFrame(raw, width, height, false);
    if (!variant.mask.equals(prepared.mask))
      throw Error(`Masque différent : ${original.file}`);
    const key = `${family}-${rarity.finish}`,
      file = `${family}-essai-01-${rarity.finish}.webp`;
    const output = await sharp(variant.rgba, {
      raw: { width, height, channels: 4 },
    })
      .webp({ lossless: true, effort: 4 })
      .toBuffer();
    await writeFile(`${out}/${file}`, output);
    sources[original.file] = {
      sourceSha256: original.sha256,
      masterFile,
      masterSha256: manifest.sourceSha256,
      imageJob: experiment.imageJob,
      model: "openai/gpt-image-2",
      paletteManifest: `src/card-lab/experiments/${family}/essai-01-finitions.json`,
      materialReference: original.referenceFile,
      materialReferenceSha256: original.referenceSha256,
      layoutTransformation: null,
      cleaning:
        "Pixels alpha <16 cleared, no opaque pixel removed, no chroma key.",
    };
    frames[key] = {
      key,
      family,
      finish: rarity.finish,
      level,
      file,
      assetDirectory,
      width,
      height,
      aperture: {
        left: (r.left / width) * 100,
        top: (r.top / height) * 100,
        width: ((r.right - r.left) / width) * 100,
        height: ((r.bottom - r.top) / height) * 100,
      },
      clearedRectangle: r,
      sourceFile: original.file,
      sourceSha256: original.sha256,
      outputSha256: sha(output),
      windowFile,
      windowSha256: sha(mask),
      sourceMaskFile: null,
      sourceMaskSha256: null,
      origin: "reviewed-experiment-palette",
      imageJob: experiment.imageJob,
      generationModel: "openai/gpt-image-2",
      removedMetalPixels: variant.removedMetalPixels,
      backdropOnMetalPixels: variant.backdropOnMetalPixels,
      adaptation:
        "Palette examinée par l’utilisateur, couleurs et géométrie conservées ; masque mesuré et WebP sans perte pour le lab uniquement.",
    };
  }
  console.log(`Intégré au lab : ${family}`);
}
const all = Object.values(frames),
  left = Math.max(...all.map((f) => f.aperture.left)),
  top = Math.max(...all.map((f) => f.aperture.top)),
  right = Math.min(...all.map((f) => f.aperture.left + f.aperture.width)),
  bottom = Math.min(...all.map((f) => f.aperture.top + f.aperture.height));
const commonAperture = { left, top, width: right - left, height: bottom - top };
if (
  all.length !== 95 ||
  commonAperture.width <= 60 ||
  commonAperture.height <= 60
)
  throw Error("Registre ou gabarit commun invalide.");
const script = "scripts/card-lab/prepare-experiment-frames.ts";
const manifest = {
  schemaVersion: 1,
  edition: "experiments-v1",
  width,
  height,
  commonAperture,
  preservedFamilies: preservedFrameFamilies,
  artDirection: frameGenerationStyle.id,
  preparationScript: script,
  preparationScriptSha256: sha(await readFile(script)),
  processingScriptSha256: sha(
    await readFile("scripts/card-lab/refined-processing.ts"),
  ),
  method:
    "Intégration lab des treize palettes locales examinées, sans nouvelle génération ni recoloration. Six familles historiques et copie du jeu inchangées. Géométrie native, transparence nettoyée sous le seuil alpha 16 et masques mesurés.",
  sources,
  frames,
};
const json = JSON.stringify(manifest, null, 2) + "\n";
await writeFile(registryFile, json);
await writeFile("catalog/card-lab/refined-frames/provenance.json", json);
await writeFile(`${root}/provenance.json`, json);
console.log(JSON.stringify({ variants: all.length, commonAperture }));
