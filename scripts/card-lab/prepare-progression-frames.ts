import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { frameFamilies } from "../../src/card-lab/frameRules";
import { rarities } from "../../src/data";
import { progressionJobs } from "../../src/card-lab/experiments/progression-series";
import { fitProgressionWindow } from "./progression-processing";

const sha = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const registry = "src/card-lab/assets/refined-frames.json",
  root = "catalog/card-lab/progression-frames",
  assetDirectory = "progression-frames",
  out = `src/card-lab/assets/${assetDirectory}`;
await mkdir(out, { recursive: true });
await mkdir(`${root}/normalized`, { recursive: true });
const protection = JSON.parse(
  await readFile(`${root}/preserved-inputs.json`, "utf8"),
);
for (const [path, hash] of Object.entries(protection.hashes))
  if (sha(await readFile(path)) !== hash)
    throw Error(`Ancien fichier altéré : ${path}`);
try {
  await readFile(`${root}/previous-edition.json`);
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  const previous = await readFile(registry);
  if (JSON.parse(previous.toString()).edition !== "experiments-v1")
    throw Error("Archive précédente manquante.");
  await writeFile(`${root}/previous-edition.json`, previous, { flag: "wx" });
}
const width = 1024,
  height = 1536,
  frames: Record<string, any> = {},
  sources: Record<string, any> = {};
if (Object.keys(progressionJobs).length !== 19)
  throw Error("Dix-neuf familles attendues.");
for (const family of frameFamilies) {
  const provenance = JSON.parse(
    await readFile(`${root}/${family}.json`, "utf8"),
  );
  for (const [level, rarity] of rarities.entries()) {
    const declared = provenance.outputs.find(
      (o: { finish: string }) => o.finish === rarity.finish,
    );
    const rawSourceFile = `src/card-lab/experiments/${family}/essai-02-${rarity.finish}.png`,
      raw = await readFile(rawSourceFile);
    if (
      sha(raw) !== declared.sha256 ||
      declared.imageJob !== progressionJobs[family][level]
    )
      throw Error(`Source invalide : ${rawSourceFile}`);
    const fitted = await fitProgressionWindow(raw),
      p = fitted.prepared,
      r = p.rectangle;
    const sourceFile = fitted.layout
      ? `${root}/normalized/${family}-${rarity.finish}.png`
      : rawSourceFile;
    if (fitted.layout) await writeFile(sourceFile, fitted.original);
    const key = `${family}-${rarity.finish}`,
      file = `${family}-progression-02-${rarity.finish}.webp`,
      windowFile = `${family}-progression-02-${rarity.finish}-window.webp`;
    const output = await sharp(p.rgba, { raw: { width, height, channels: 4 } })
      .webp({ lossless: true, effort: 4 })
      .toBuffer();
    const mask = await sharp(p.mask, { raw: { width, height, channels: 4 } })
      .webp({ lossless: true })
      .toBuffer();
    await writeFile(`${out}/${file}`, output);
    await writeFile(`${out}/${windowFile}`, mask);
    sources[sourceFile] = {
      sourceSha256: sha(fitted.original),
      rawSourceFile,
      rawSourceSha256: sha(raw),
      imageJob: declared.imageJob,
      model: "openai/gpt-image-2",
      normalizedLayout: fitted.layout,
      generationReferences: declared.generationReferences,
      originalTestManifest: provenance.originalTestManifest,
      cleaning: "Alpha <16 cleared; no chroma key or opaque erasure.",
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
      sourceFile,
      sourceSha256: sha(fitted.original),
      outputSha256: sha(output),
      windowFile,
      windowSha256: sha(mask),
      sourceMaskFile: null,
      sourceMaskSha256: null,
      origin: "independently-generated-rarity-progression",
      imageJob: declared.imageJob,
      generationModel: "openai/gpt-image-2",
      removedMetalPixels: p.removedMetalPixels,
      backdropOnMetalPixels: p.backdropOnMetalPixels,
      adaptation:
        "Génération indépendante par rareté ; adaptation éventuelle de fenêtre par neuf zones et coins à échelle uniforme, source brute conservée. Couleurs inchangées, masque individuel, WebP sans perte.",
    };
  }
  console.log(`Progression intégrée : ${family}`);
}
const all = Object.values(frames),
  left = Math.max(...all.map((f) => f.aperture.left)),
  top = Math.max(...all.map((f) => f.aperture.top)),
  right = Math.min(...all.map((f) => f.aperture.left + f.aperture.width)),
  bottom = Math.min(...all.map((f) => f.aperture.top + f.aperture.height));
const commonAperture = { left, top, width: right - left, height: bottom - top };
if (
  commonAperture.width <= 60 ||
  commonAperture.height <= 60 ||
  all.length !== 95
)
  throw Error("Fenêtre ou registre invalide.");
const script = "scripts/card-lab/prepare-progression-frames.ts",
  processingScript = "scripts/card-lab/progression-processing.ts";
const manifest = {
  schemaVersion: 1,
  edition: "progression-v2",
  width,
  height,
  commonAperture,
  preparationScript: script,
  preparationScriptSha256: sha(await readFile(script)),
  processingScript,
  processingScriptSha256: sha(await readFile(processingScript)),
  method:
    "Dix-neuf thèmes autorisés par l’utilisateur, cinq générations distinctes par thème. Progression des matières, gravures, reliefs et ornements. Aucun premier essai ni original supprimé. Jeu principal inchangé.",
  preservationManifest: `${root}/preserved-inputs.json`,
  sources,
  frames,
};
const json = JSON.stringify(manifest, null, 2) + "\n";
await writeFile(registry, json);
await writeFile(`${root}/provenance.json`, json);
await writeFile("catalog/card-lab/refined-frames/provenance.json", json);
console.log(
  JSON.stringify({
    variants: all.length,
    commonAperture,
    previousFilesPreserved: Object.keys(protection.hashes).length,
  }),
);
