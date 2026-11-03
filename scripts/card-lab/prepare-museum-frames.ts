import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import sharp from "sharp";
import {
  museumSpecs,
  museumBrief,
  framingReferences,
} from "../../src/card-lab/museumSpecs";
import { preservedFrameFamilies } from "../../src/card-lab/prestigeSpecs";
import { frameFamilies } from "../../src/card-lab/frameRules";
import { rarities } from "../../src/data";
import { renderMuseumFrame } from "./museum-rendering";
import { refineFrame } from "./refined-processing";

const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");
const root = "catalog/card-lab/museum-frames",
  dir = "museum-frames",
  out = `src/card-lab/assets/${dir}`,
  sourceDir = "src/card-lab/assets/museum-sources";
const registry = "src/card-lab/assets/refined-frames.json";
await mkdir(root, { recursive: true });
await mkdir(out, { recursive: true });
await mkdir(sourceDir, { recursive: true });
try {
  await readFile(`${root}/previous-edition.json`);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  const previous = await readFile(registry);
  if (JSON.parse(previous.toString()).edition !== "theme-v4")
    throw Error("Archive thématique précédente manquante.");
  await writeFile(`${root}/previous-edition.json`, previous, { flag: "wx" });
}
const baselineBytes = await readFile(
    "catalog/card-lab/prestige-frames/baseline.json",
  ),
  baseline = JSON.parse(baselineBytes.toString());
const frames: Record<string, any> = {},
  sources: Record<string, any> = {};
const width = 1024,
  height = 1536;
for (const family of frameFamilies) {
  if ((preservedFrameFamilies as readonly string[]).includes(family)) {
    for (const r of rarities) {
      const key = `${family}-${r.finish}`,
        old = baseline.frames[key];
      for (const [file, hash] of [
        [old.file, old.outputSha256],
        [old.windowFile, old.windowSha256],
      ]) {
        const path = `src/card-lab/assets/${old.assetDirectory}/${file}`;
        if (sha(await readFile(path)) !== hash)
          throw Error(`Décor validé altéré : ${key}`);
        await copyFile(path, `${out}/${file}`);
      }
      frames[key] = { ...old, assetDirectory: dir };
      sources[old.sourceFile] = baseline.sources[old.sourceFile];
    }
    console.log(`Conservé : ${family}`);
    continue;
  }
  const id = family as keyof typeof museumSpecs,
    spec = museumSpecs[id];
  if (!spec) throw Error(`Profil manquant : ${family}`);
  const svg = Buffer.from(renderMuseumFrame(id, "argent"));
  const svgFile = `${sourceDir}/${family}-museum-v5.svg`,
    sourceFile = `${sourceDir}/${family}-museum-v5.png`;
  const source = await sharp(svg).png().toBuffer();
  await writeFile(svgFile, svg);
  await writeFile(sourceFile, source);
  const sourcePixels = await sharp(source).ensureAlpha().raw().toBuffer();
  const p = refineFrame(sourcePixels, width, height, false),
    r = p.rectangle;
  const windowFile = `${family}-museum-v5-window.webp`,
    mask = await sharp(p.mask, { raw: { width, height, channels: 4 } })
      .webp({ lossless: true })
      .toBuffer();
  await writeFile(`${out}/${windowFile}`, mask);
  sources[sourceFile] = {
    sourceSha256: sha(source),
    svgFile,
    svgSha256: sha(svg),
    origin: "procedural-museum-profile",
    model: null,
    imageJob: null,
    profile: spec,
    referenceURLs: framingReferences.map((r) => r.url),
    removedMetalPixels: 0,
    backdropOnMetalPixels: 0,
    interiorPixels: p.interiorPixels,
  };
  for (const [level, rarity] of rarities.entries()) {
    const variantSVG = Buffer.from(renderMuseumFrame(id, rarity.finish));
    const decoded = await sharp(variantSVG).ensureAlpha().raw().toBuffer();
    const v = refineFrame(decoded, width, height, false);
    for (let i = 3; i < sourcePixels.length; i += 4)
      if (sourcePixels[i] !== decoded[i])
        throw Error(`Alpha variable : ${family}-${rarity.finish}`);
    const file = `${family}-museum-v5-${rarity.finish}.webp`,
      key = `${family}-${rarity.finish}`;
    const bytes = await sharp(v.rgba, { raw: { width, height, channels: 4 } })
      .webp({ lossless: true, effort: 4 })
      .toBuffer();
    await writeFile(`${out}/${file}`, bytes);
    frames[key] = {
      key,
      family,
      finish: rarity.finish,
      level,
      file,
      assetDirectory: dir,
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
      sourceSha256: sha(source),
      outputSha256: sha(bytes),
      windowFile,
      windowSha256: sha(mask),
      sourceMaskFile: null,
      sourceMaskSha256: null,
      origin: "procedural-museum-profile",
      imageJob: null,
      generationModel: null,
      removedMetalPixels: 0,
      backdropOnMetalPixels: 0,
      adaptation:
        "Profil paramétrique inspiré d’encadrements réels ; matière et géométrie identiques, seuls les filets de finition changent. Lapis bleu et or discret, aucun objet ajouté.",
      variantSVGSha256: sha(variantSVG),
    };
  }
  console.log(`Profil muséal : ${family} — ${spec.name}`);
}
const all = Object.values(frames),
  left = Math.max(...all.map((f) => f.aperture.left)),
  top = Math.max(...all.map((f) => f.aperture.top)),
  right = Math.min(...all.map((f) => f.aperture.left + f.aperture.width)),
  bottom = Math.min(...all.map((f) => f.aperture.top + f.aperture.height));
const commonAperture = { left, top, width: right - left, height: bottom - top };
if (commonAperture.width <= 60 || commonAperture.height <= 60)
  throw Error("Gabarit trop petit.");
const script = "scripts/card-lab/prepare-museum-frames.ts",
  materialScript = "scripts/card-lab/museum-rendering.ts";
const manifest = {
  schemaVersion: 1,
  edition: "museum-v5",
  width,
  height,
  commonAperture,
  neutralFamilies: 12,
  brief: museumBrief,
  preservedFamilies: preservedFrameFamilies,
  baselineSha256: sha(baselineBytes),
  preparationScript: script,
  preparationScriptSha256: sha(await readFile(script)),
  processingScriptSha256: sha(
    await readFile("scripts/card-lab/refined-processing.ts"),
  ),
  materialScript,
  materialScriptSha256: sha(await readFile(materialScript)),
  specsScriptSha256: sha(await readFile("src/card-lab/museumSpecs.ts")),
  method:
    "Treize profils d’encadrement sobres, rendus paramétriquement depuis des SVG : onglets, bois, métaux satinés et passe-partout. Aucune nouvelle génération IA, aucun objet symbolique. Six familles validées inchangées.",
  references: framingReferences,
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
