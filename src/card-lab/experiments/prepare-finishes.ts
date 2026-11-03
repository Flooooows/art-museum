import { createHash } from "node:crypto";
import { copyFile, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import {
  acceptedFrameExperiments,
  experimentalFrameFinishes,
  frameFinishReference,
  frameGenerationRequest,
  frameGenerationStyle,
} from "../generationStyle";
import { allFrameExperiments, generationIncidents } from "./series";

// Local experiments only: learn colors from existing approved frames rather
// than reviving the old generation briefs or altering either master design.
const root = "src/card-lab/experiments";
const finishes = experimentalFrameFinishes.map((entry) => entry.finish);
const labels = experimentalFrameFinishes.map((entry) => entry.label);
const sha = (data: Buffer) => createHash("sha256").update(data).digest("hex");
const luminance = (data: Buffer, p: number) =>
  Math.round(0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2]);

function distribution(data: Buffer) {
  const counts = new Float64Array(256);
  const sums = Array.from({ length: 256 }, () => [0, 0, 0]);
  let total = 0;
  for (let p = 0; p < data.length; p += 4)
    if (data[p + 3] >= 200) {
      const bin = luminance(data, p);
      counts[bin]++;
      total++;
      for (let c = 0; c < 3; c++) sums[bin][c] += data[p + c];
    }
  if (!total) throw Error("Image sans cadre opaque.");
  const cdf = new Float64Array(256);
  let accumulated = 0;
  for (let i = 0; i < 256; i++) {
    accumulated += counts[i];
    cdf[i] = accumulated / total;
  }
  return { counts, sums, cdf };
}

function colorTransfer(source: Buffer, target: Buffer) {
  const a = distribution(source),
    b = distribution(target);
  const palette = Array.from({ length: 256 }, (_, i) => {
    let bin = 0;
    while (bin < 255 && b.cdf[bin] < a.cdf[i]) bin++;
    const sum = [0, 0, 0];
    let count = 0;
    for (let j = Math.max(0, bin - 2); j <= Math.min(255, bin + 2); j++) {
      count += b.counts[j];
      for (let c = 0; c < 3; c++) sum[c] += b.sums[j][c];
    }
    return sum.map((value) => Math.round(count ? value / count : bin));
  });
  const output = Buffer.from(source);
  for (let p = 0; p < source.length; p += 4)
    if (source[p + 3]) {
      const color = palette[luminance(source, p)];
      for (let c = 0; c < 3; c++) output[p + c] = color[c];
    }
  return output;
}

const args = process.argv.slice(2);
const selected = args.includes("--all")
  ? allFrameExperiments
  : args.length
    ? args.map((family) => {
        const experiment = allFrameExperiments.find((e) => e.family === family);
        if (!experiment) throw Error(`Expérience inconnue : ${family}`);
        return experiment;
      })
    : acceptedFrameExperiments;

for (const { family, imageJob } of selected) {
  const dir = `${root}/${family}`,
    sourceFile = `${dir}/essai-01.png`;
  const original = await readFile(sourceFile);
  const { data, info } = await sharp(original)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const outputs = [];
  const tiles = [];
  for (const [index, finish] of finishes.entries()) {
    const file = `${dir}/essai-01-${finish}.png`;
    const referenceFile = frameFinishReference(finish);
    let referenceSha256: string | null = null;
    if (referenceFile) {
      const reference = await readFile(referenceFile);
      referenceSha256 = sha(reference);
      const pixels = await sharp(reference).ensureAlpha().raw().toBuffer();
      const derived = colorTransfer(data, pixels);
      await sharp(derived, {
        raw: { width: info.width, height: info.height, channels: 4 },
      })
        .png()
        .toFile(file);
    } else await copyFile(sourceFile, file);
    const bytes = await readFile(file);
    const result = await sharp(bytes).ensureAlpha().raw().toBuffer();
    if (result.length !== data.length)
      throw Error(`Dimensions modifiées : ${file}`);
    for (let p = 3; p < data.length; p += 4)
      if (result[p] !== data[p]) throw Error(`Alpha modifié : ${file}`);
    outputs.push({
      finish,
      file,
      sha256: sha(bytes),
      referenceFile,
      referenceSha256,
    });
    tiles.push({
      input: await sharp(bytes).resize(256, 384).png().toBuffer(),
      left: index * 276 + 10,
      top: 36,
    });
    tiles.push({
      input: Buffer.from(
        `<svg width="270" height="28"><text x="10" y="20" font-family="Arial" font-size="13" fill="#f5eadb">${labels[index]}</text></svg>`,
      ),
      left: index * 276,
      top: 0,
    });
  }
  if (new Set(outputs.map((o) => o.sha256)).size !== 5)
    throw Error("Les cinq finitions doivent être distinctes.");
  if (sha(await readFile(sourceFile)) !== sha(original))
    throw Error("Master altéré.");
  await sharp({
    create: { width: 1380, height: 432, channels: 4, background: "#34242d" },
  })
    .composite(tiles)
    .png()
    .toFile(`${dir}/essai-01-cinq-finitions.png`);
  await writeFile(
    `${dir}/essai-01-finitions.json`,
    JSON.stringify(
      {
        scope: "Essais locaux uniquement, aucune intégration ni publication.",
        sourceFile,
        sourceSha256: sha(original),
        width: info.width,
        height: info.height,
        method:
          "Quatre adaptations de couleur par correspondance des distributions de luminance aux cadres Égypte approuvés existants. Géométrie, motifs et alpha inchangés ; lapis-lazuli : copie exacte du master. Ce ne sont pas cinq générations indépendantes.",
        outputs,
        ...(!acceptedFrameExperiments.some(
          (e) => (e.family as string) === family,
        )
          ? {
              imageJob,
              artDirection: frameGenerationStyle.id,
              generationReferences: await Promise.all(
                frameGenerationRequest(family).images.map(async (file) => ({
                  file,
                  sha256: sha(await readFile(file)),
                })),
              ),
              incidents: generationIncidents.filter(
                (i) => (i.family as string) === family,
              ),
            }
          : {}),
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `${family} : cinq finitions distinctes, alpha identique, master intact.`,
  );
}
