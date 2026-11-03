import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import sharp from "sharp";
import { friezeSpecs, friezeBrief } from "../../src/card-lab/friezeSpecs";
import { preservedFrameFamilies } from "../../src/card-lab/prestigeSpecs";
import { frameFamilies } from "../../src/card-lab/frameRules";
import { rarities } from "../../src/data";
import {
  applyDecorativeFinish,
  fitDecorativeWindow,
} from "./decorative-processing";

const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");
const registry = "src/card-lab/assets/refined-frames.json",
  root = "catalog/card-lab/frieze-frames",
  directory = "frieze-frames",
  out = `src/card-lab/assets/${directory}`;
if (Object.keys(friezeSpecs).length !== 13)
  throw Error(
    "Les treize générations doivent être enregistrées avant la préparation.",
  );
await mkdir(root, { recursive: true });
await mkdir(out, { recursive: true });
try {
  await readFile(`${root}/previous-edition.json`);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  const before = await readFile(registry);
  if (JSON.parse(before.toString()).edition !== "decor-v6")
    throw Error("Archive de l’édition précédente manquante.");
  await writeFile(`${root}/previous-edition.json`, before, { flag: "wx" });
}
const baselineBytes = await readFile(
    "catalog/card-lab/prestige-frames/baseline.json",
  ),
  baseline = JSON.parse(baselineBytes.toString());
const paletteFile = `${root}/references/material-palette.png`,
  paletteBytes = await readFile(paletteFile);
const generationReferences = [
  {
    purpose: "Colors only; no frame motifs or frame image supplied",
    inputFile: paletteFile,
    inputSha256: sha(paletteBytes),
  },
];
const designBenchmarks = [];
for (const family of ["egypte", "prehistoire", "decoratifs"]) {
  const file = `src/card-lab/assets/refined-frames/${family}-argent.webp`;
  designBenchmarks.push({
    family,
    file,
    sha256: sha(await readFile(file)),
    usage:
      "User-approved design benchmark inspected for motif legibility/detail; NOT supplied as a generation image.",
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
  const spec = friezeSpecs[family];
  if (!spec) throw Error(`Motifs manquants : ${family}`);
  const rawSourceFile = `src/card-lab/assets/generated-sources/${spec.source}`,
    raw = await readFile(rawSourceFile);
  let input = raw;
  let initialLayout: unknown = null;
  if (family === "arts-metal") {
    // Reviewed clear-window cuts: this source's unusually wide rails miss the
    // strict safe-window threshold by a few pixels. Scale its corners uniformly.
    const xs = [0, 224, 798, width],
      ys = [0, 290, 1290, height];
    const scale = 0.75;
    const tx = [0, 168, width - Math.round((width - 798) * scale), width];
    const ty = [
      0,
      Math.round(290 * scale),
      height - Math.round((height - 1290) * scale),
      height,
    ];
    const panels = [];
    for (let y = 0; y < 3; y++)
      for (let x = 0; x < 3; x++)
        panels.push({
          input: await sharp(raw)
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
    input = await sharp({
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
    initialLayout = {
      scale,
      sourceCuts: { x: xs, y: ys },
      targetCuts: { x: tx, y: ty },
    };
  }
  const fitted = await fitDecorativeWindow(input),
    p = fitted.prepared,
    r = p.rectangle;
  const sourceFile =
    fitted.layout || initialLayout
      ? rawSourceFile.replace(".png", "-layout.png")
      : rawSourceFile;
  if (fitted.layout || initialLayout)
    await writeFile(sourceFile, fitted.original);
  const windowFile = `${family}-frieze-v7-window.webp`,
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
    motifs: spec.motifs,
    forbidden: spec.forbidden,
    generationReferences,
    normalizedLayout: fitted.layout,
    initialLayout,
    removedMetalPixels: p.removedMetalPixels,
    backdropOnMetalPixels: p.backdropOnMetalPixels,
    interiorPixels: p.interiorPixels,
  };
  for (const [level, rarity] of rarities.entries()) {
    const key = `${family}-${rarity.finish}`,
      file = `${family}-frieze-v7-${rarity.finish}.webp`;
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
      origin: "generated-figurative-frieze-derived-finish",
      imageJob: spec.job,
      generationModel: "openai/gpt-image-2",
      removedMetalPixels: 0,
      backdropOnMetalPixels: 0,
      adaptation:
        "Motifs figuratifs propres au thème, gravés dans une frise régulière. Couleurs métal/fonds déclarées ; lapis/or natif, relief et alpha constants.",
    };
  }
  console.log(`Frise figurative : ${family} — ${spec.motifs.join(", ")}`);
}
const all = Object.values(frames),
  left = Math.max(...all.map((f) => f.aperture.left)),
  top = Math.max(...all.map((f) => f.aperture.top)),
  right = Math.min(...all.map((f) => f.aperture.left + f.aperture.width)),
  bottom = Math.min(...all.map((f) => f.aperture.top + f.aperture.height));
const commonAperture = { left, top, width: right - left, height: bottom - top };
if (commonAperture.width <= 60 || commonAperture.height <= 60)
  throw Error("Gabarit commun trop petit.");
const script = "scripts/card-lab/prepare-frieze-frames.ts",
  materialScript = "scripts/card-lab/decorative-processing.ts";
const manifest = {
  schemaVersion: 1,
  edition: "frieze-v7",
  width,
  height,
  commonAperture,
  neutralFamilies: 12,
  brief: friezeBrief,
  preservedFamilies: preservedFrameFamilies,
  baselineSha256: sha(baselineBytes),
  preparationScript: script,
  preparationScriptSha256: sha(await readFile(script)),
  processingScriptSha256: sha(
    await readFile("scripts/card-lab/refined-processing.ts"),
  ),
  materialScript,
  materialScriptSha256: sha(await readFile(materialScript)),
  specsScriptSha256: sha(await readFile("src/card-lab/friezeSpecs.ts")),
  method:
    "Treize frises figuratives différentes, images de motifs gravées dans le rail et non objets constituant le cadre. Seule une palette sans motifs est fournie comme référence de génération. Benchmarks Égypte/Paléolithique pour la lisibilité, Arts décoratifs pour les couleurs/détails. Six familles validées inchangées.",
  generationReferences,
  designBenchmarks,
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
