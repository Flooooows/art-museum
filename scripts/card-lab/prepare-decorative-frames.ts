import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import sharp from "sharp";
import {
  decorativeSpecs,
  decorativeBrief,
} from "../../src/card-lab/decorativeSpecs";
import { preservedFrameFamilies } from "../../src/card-lab/prestigeSpecs";
import { frameFamilies } from "../../src/card-lab/frameRules";
import { rarities } from "../../src/data";
import {
  applyDecorativeFinish,
  fitDecorativeWindow,
} from "./decorative-processing";

const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");
const registry = "src/card-lab/assets/refined-frames.json",
  root = "catalog/card-lab/decorative-frames",
  directory = "decorative-frames",
  out = `src/card-lab/assets/${directory}`;
await mkdir(root, { recursive: true });
await mkdir(out, { recursive: true });
await mkdir(`${root}/references`, { recursive: true });
try {
  await readFile(`${root}/previous-edition.json`);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  const before = await readFile(registry);
  if (JSON.parse(before.toString()).edition !== "museum-v5")
    throw Error("Archive de l’édition sobre manquante.");
  await writeFile(`${root}/previous-edition.json`, before, { flag: "wx" });
}
const baselineBytes = await readFile(
    "catalog/card-lab/prestige-frames/baseline.json",
  ),
  baseline = JSON.parse(baselineBytes.toString());
const references = [];
for (const finish of ["lapis-lazuli", "argent"]) {
  const sourceFile = `src/card-lab/assets/refined-frames/decoratifs-${finish}.webp`,
    source = await readFile(sourceFile);
  const inputFile = `${root}/references/decoratifs-${finish}-reference.png`,
    input = await sharp(source)
      .flatten({ background: "#e9e3d8" })
      .png()
      .toBuffer();
  await writeFile(inputFile, input);
  references.push({
    key: `decoratifs-${finish}`,
    sourceFile,
    sourceSha256: sha(source),
    inputFile,
    inputSha256: sha(input),
    preparation:
      "Alpha composited on #e9e3d8, no change to the approved frame.",
  });
}
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
        const path = `src/card-lab/assets/${old.assetDirectory}/${file}`;
        if (sha(await readFile(path)) !== fingerprint)
          throw Error(`Cadre validé altéré : ${key}`);
        await copyFile(path, `${out}/${file}`);
      }
      frames[key] = { ...old, assetDirectory: directory };
      sources[old.sourceFile] = baseline.sources[old.sourceFile];
    }
    console.log(`Conservé : ${family}`);
    continue;
  }
  const spec = decorativeSpecs[family as keyof typeof decorativeSpecs];
  if (!spec) throw Error(`Motif manquant : ${family}`);
  const rawSourceFile = `src/card-lab/assets/generated-sources/${spec.source}`,
    raw = await readFile(rawSourceFile);
  let input = raw,
    cleaning: unknown = null;
  if (family === "dessins") {
    // Reviewed drawing master: blank-window veil is alpha 3..47; actual
    // engraved metal/inlay is opaque. Keep the raw image, clear only this veil.
    const pixels = await sharp(raw).ensureAlpha().raw().toBuffer();
    for (let i = 0; i < pixels.length; i += 4)
      if (pixels[i + 3] < 64) pixels.fill(0, i, i + 4);
    input = await sharp(pixels, { raw: { width, height, channels: 4 } })
      .png()
      .toBuffer();
    cleaning = {
      method: "Reviewed soft-backdrop alpha threshold",
      threshold: 64,
    };
  }
  const fitted = await fitDecorativeWindow(input),
    p = fitted.prepared,
    r = p.rectangle;
  const sourceFile = fitted.layout
    ? rawSourceFile.replace(".png", "-layout.png")
    : cleaning
      ? rawSourceFile.replace(".png", "-clean.png")
      : rawSourceFile;
  if (fitted.layout || cleaning) await writeFile(sourceFile, fitted.original);
  const windowFile = `${family}-decor-v6-window.webp`,
    mask = await sharp(p.mask, { raw: { width, height, channels: 4 } })
      .webp({ lossless: true })
      .toBuffer();
  await writeFile(`${out}/${windowFile}`, mask);
  sources[sourceFile] = {
    sourceSha256: sha(fitted.original),
    rawSourceFile,
    rawSourceSha256: sha(raw),
    model: "openai/gpt-image-2",
    imageJob: spec.job,
    motif: spec.motif,
    generationReferences: references,
    cleaning,
    normalizedLayout: fitted.layout,
    removedMetalPixels: p.removedMetalPixels,
    backdropOnMetalPixels: p.backdropOnMetalPixels,
    interiorPixels: p.interiorPixels,
  };
  for (const [level, rarity] of rarities.entries()) {
    const key = `${family}-${rarity.finish}`,
      file = `${family}-decor-v6-${rarity.finish}.webp`;
    const rgba = applyDecorativeFinish(p.rgba, rarity.finish),
      bytes = await sharp(rgba, { raw: { width, height, channels: 4 } })
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
      sourceSha256: sha(fitted.original),
      outputSha256: sha(bytes),
      windowFile,
      windowSha256: sha(mask),
      sourceMaskFile: null,
      sourceMaskSha256: null,
      origin: "generated-decorative-master-derived-finish",
      imageJob: spec.job,
      generationModel: "openai/gpt-image-2",
      removedMetalPixels: 0,
      backdropOnMetalPixels: 0,
      adaptation:
        rarity.finish === "lapis-lazuli"
          ? "Master polychrome lapis/or natif, motif propre à la catégorie, niveau de détail Arts décoratifs."
          : "Finition à deux matières : métal en relief et fonds colorés inspirés d’Arts décoratifs. Relief et alpha identiques au master.",
    };
  }
  console.log(`Détail Arts décoratifs, thème conservé : ${family}`);
}
const all = Object.values(frames),
  left = Math.max(...all.map((f) => f.aperture.left)),
  top = Math.max(...all.map((f) => f.aperture.top)),
  right = Math.min(...all.map((f) => f.aperture.left + f.aperture.width)),
  bottom = Math.min(...all.map((f) => f.aperture.top + f.aperture.height));
const commonAperture = { left, top, width: right - left, height: bottom - top };
if (commonAperture.width <= 60 || commonAperture.height <= 60)
  throw Error("Gabarit commun trop petit.");
const script = "scripts/card-lab/prepare-decorative-frames.ts",
  materialScript = "scripts/card-lab/decorative-processing.ts";
const manifest = {
  schemaVersion: 1,
  edition: "decor-v6",
  width,
  height,
  commonAperture,
  neutralFamilies: 12,
  brief: decorativeBrief,
  preservedFamilies: preservedFrameFamilies,
  baselineSha256: sha(baselineBytes),
  preparationScript: script,
  preparationScriptSha256: sha(await readFile(script)),
  processingScriptSha256: sha(
    await readFile("scripts/card-lab/refined-processing.ts"),
  ),
  materialScript,
  materialScriptSha256: sha(await readFile(materialScript)),
  specsScriptSha256: sha(await readFile("src/card-lab/decorativeSpecs.ts")),
  method:
    "Treize masters générés avec les cadres Arts décoratifs approuvés comme références de détail et de couleur, mais un motif propre à chaque thème ; cinq finitions déclarées, six familles validées inchangées.",
  references,
  sources,
  frames,
};
const json = JSON.stringify(manifest, null, 2) + "\n";
await writeFile(registry, json);
await writeFile("catalog/card-lab/refined-frames/provenance.json", json);
await writeFile(`${root}/provenance.json`, json);
console.log(
  JSON.stringify({
    cadres: all.length,
    refaits: 65,
    conserves: 30,
    commonAperture,
  }),
);
