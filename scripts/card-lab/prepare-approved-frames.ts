import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { preservedFrameFamilies } from "../../src/card-lab/prestigeSpecs";

// Only verify/re-index approved bytes. Never regenerate the rejected editions.
const baseline = JSON.parse(
  await readFile("catalog/card-lab/prestige-frames/baseline.json", "utf8"),
);
const frames = Object.fromEntries(
  Object.entries(baseline.frames).filter(([, f]: [string, any]) =>
    (preservedFrameFamilies as readonly string[]).includes(f.family),
  ),
);
const sources: Record<string, unknown> = {};
for (const f of Object.values(frames) as any[]) {
  for (const [path, expected] of [
    [`src/card-lab/assets/${f.assetDirectory}/${f.file}`, f.outputSha256],
    [`src/card-lab/assets/${f.assetDirectory}/${f.windowFile}`, f.windowSha256],
    [f.sourceFile, f.sourceSha256],
    ...(f.sourceMaskFile ? [[f.sourceMaskFile, f.sourceMaskSha256]] : []),
  ]) {
    const hash = createHash("sha256")
      .update(await readFile(path))
      .digest("hex");
    if (hash !== expected) throw Error(`Cadre approuvé altéré : ${path}`);
  }
  sources[f.sourceFile] = baseline.sources[f.sourceFile];
}
const manifest = {
  schemaVersion: 1,
  edition: "approved-only",
  width: baseline.width,
  height: baseline.height,
  commonAperture: baseline.commonAperture,
  preservedFamilies: preservedFrameFamilies,
  method:
    "Six familles validées inchangées ; les familles supprimées s’affichent sans cadre. Registres des anciennes éditions conservés uniquement comme historique textuel.",
  sources,
  frames,
};
const json = JSON.stringify(manifest, null, 2) + "\n";
await writeFile("src/card-lab/assets/refined-frames.json", json);
await writeFile("catalog/card-lab/refined-frames/provenance.json", json);
const gameFile = "src/game-presentation/cards/assets/refined-frames.json";
const game = JSON.parse(await readFile(gameFile, "utf8"));
game.frames = Object.fromEntries(
  Object.entries(game.frames).filter(([, f]: [string, any]) =>
    (preservedFrameFamilies as readonly string[]).includes(f.family),
  ),
);
game.edition = "approved-only";
await writeFile(gameFile, JSON.stringify(game, null, 2) + "\n");
console.log(
  `${Object.keys(frames).length} cadres validés indexés, sans régénération.`,
);
