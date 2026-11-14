import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

// Manual promotion only: never run from a build hook or regenerate any artwork.
const version = process.argv
  .find((arg) => arg.startsWith("--lab-version="))
  ?.split("=")[1];
if (!version || !/^[a-f0-9]{16}$/.test(version))
  throw Error("Indiquer la version du lab vérifiée : --lab-version=<version>.");
const sha = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const sourceFile = "src/card-lab/assets/refined-frames.json";
const sourceBytes = await readFile(sourceFile),
  source = JSON.parse(sourceBytes.toString());
assert.equal(source.edition, "progression-v2");
assert.equal(Object.keys(source.frames).length, 95);
const published = JSON.parse(
  await readFile("catalog/muse-lab/hosting-manifest.json", "utf8"),
);
const publishedHashes = new Set(Object.values(published.files));
const previous = await readFile(
  "src/game-presentation/cards/assets/refined-frames.json",
);
await mkdir("catalog/game-presentation/frame-editions", { recursive: true });
try {
  await writeFile(
    "catalog/game-presentation/frame-editions/before-progression-v2.json",
    previous,
    { flag: "wx" },
  );
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
}

const frames = Object.fromEntries(
  Object.entries(source.frames).filter(
    ([, value]) => (value as { family: string }).family !== "prehistoire",
  ),
) as Record<
  string,
  {
    family: string;
    assetDirectory: string;
    file: string;
    windowFile: string;
    outputSha256: string;
    windowSha256: string;
  }
>;
assert.equal(Object.keys(frames).length, 90);
for (const frame of Object.values(frames)) {
  assert.ok(
    publishedHashes.has(frame.outputSha256),
    `Absent du manifest lab : ${frame.file}`,
  );
  const directory = `src/game-presentation/cards/assets/${frame.assetDirectory}`;
  await mkdir(directory, { recursive: true });
  for (const [file, expected] of [
    [frame.file, frame.outputSha256],
    [frame.windowFile, frame.windowSha256],
  ]) {
    const original = `src/card-lab/assets/${frame.assetDirectory}/${file}`;
    assert.equal(sha(await readFile(original)), expected, original);
    await copyFile(original, `${directory}/${file}`);
    assert.equal(sha(await readFile(`${directory}/${file}`)), expected);
  }
}
const registry = {
  schemaVersion: 1,
  edition: source.edition,
  sourceLabVersion: version,
  sourceRegistrySha256: sha(sourceBytes),
  width: source.width,
  height: source.height,
  commonAperture: source.commonAperture,
  method:
    "Copie figée des cadres et masques publiés sur le lab, sans génération ni recoloration. Paléolithique reste non affecté. Anciens fichiers conservés.",
  frames,
};
await writeFile(
  "src/game-presentation/cards/assets/refined-frames.json",
  JSON.stringify(registry, null, 2) + "\n",
);
await writeFile(
  "catalog/game-presentation/lab-frame-promotion.json",
  JSON.stringify(
    {
      sourceLabVersion: version,
      edition: source.edition,
      sourceRegistrySha256: sha(sourceBytes),
      previousRegistrySha256: sha(previous),
      promotedVariants: 90,
      unassignedVariantsKeptInLab: 5,
      outputDirectory: "src/game-presentation/cards/assets/progression-frames",
      commonAperture: source.commonAperture,
      sourceAndDestinationHashesIdentical: true,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `90 cadres et leurs masques copiés à l’identique depuis le lab ${version}.`,
);
