import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { experimentalFrameFinishes } from "../../generationStyle";

// Run only after all five independent image jobs have completed.
// This assembles previews and provenance; it never recolors the generated frames.
const dir = "src/card-lab/experiments/japon";
const jobs = {
  fer: "image_19f388cd5001j4RpLTBRZrnIWh",
  cuivre: "image_19f388d05001vOYMkvtlUu6GHR",
  argent: "image_19f388cee0013qPQQJw6zYea7G",
  dore: "image_19f388d1f001AN6ZHad9OLmXtk",
  "lapis-lazuli": "image_19f388d41001CLFcu6zaKH7qLX",
};
const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");
await mkdir(`${dir}/essai-02-references`, { recursive: true });
const references = [];
for (const family of ["egypte", "prehistoire"]) {
  const suppliedFile = `/tmp/opencode/reference-progression-${family}.png`;
  const archivedFile = `${dir}/essai-02-references/${family}-cinq-raretes.png`;
  await copyFile(suppliedFile, archivedFile);
  references.push({
    suppliedFile,
    archivedFile,
    sha256: sha(await readFile(archivedFile)),
  });
}
const baseFile = `${dir}/essai-01.png`;
const outputs = [],
  tiles = [],
  details = [];
for (const [index, { finish, label }] of experimentalFrameFinishes.entries()) {
  const file = `${dir}/essai-02-${finish}.png`,
    bytes = await readFile(file);
  const { data, info } = await sharp(bytes)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.width !== 1024 || info.height !== 1536)
    throw Error(`Dimensions inattendues : ${file}`);
  const alpha = await sharp(bytes)
    .ensureAlpha()
    .extractChannel("alpha")
    .raw()
    .toBuffer();
  const centerAlpha = alpha[768 * 1024 + 512];
  if (centerAlpha !== 0) throw Error(`Centre non transparent : ${file}`);
  const materialReferences = [];
  for (const family of ["egypte", "prehistoire"]) {
    const path = `src/card-lab/assets/refined-frames/${family}-${finish}.webp`;
    materialReferences.push({ file: path, sha256: sha(await readFile(path)) });
  }
  outputs.push({
    finish,
    label,
    file,
    sha256: sha(bytes),
    alphaSha256: sha(alpha),
    width: info.width,
    height: info.height,
    centerAlpha,
    imageJob: jobs[finish],
    materialReferences,
  });
  tiles.push({
    input: await sharp(bytes).resize(280, 420).png().toBuffer(),
    left: index * 300 + 10,
    top: 36,
  });
  const title = Buffer.from(
    `<svg width="300" height="30"><text x="10" y="21" font-family="Arial" font-size="14" fill="#f5eadb">${label}</text></svg>`,
  );
  tiles.push({ input: title, left: index * 300, top: 0 });
  details.push({
    input: await sharp(bytes)
      .extract({ left: 0, top: 0, width: 1024, height: 420 })
      .resize(300, 123)
      .png()
      .toBuffer(),
    left: index * 300,
    top: 36,
  });
  details.push({
    input: await sharp(bytes)
      .extract({ left: 0, top: 450, width: 240, height: 720 })
      .resize(120, 360)
      .png()
      .toBuffer(),
    left: index * 300 + 15,
    top: 185,
  });
  details.push({
    input: await sharp(bytes)
      .extract({ left: 784, top: 450, width: 240, height: 720 })
      .resize(120, 360)
      .png()
      .toBuffer(),
    left: index * 300 + 165,
    top: 185,
  });
  details.push({ input: title, left: index * 300, top: 0 });
}
if (new Set(outputs.map((o) => o.alphaSha256)).size === 1)
  throw Error(
    "Les cinq designs ont un alpha identique : vérifier qu’il ne s’agit pas d’une simple recoloration.",
  );
await sharp({
  create: { width: 1500, height: 474, channels: 4, background: "#34242d" },
})
  .composite(tiles)
  .png()
  .toFile(`${dir}/essai-02-cinq-raretes.png`);
await sharp({
  create: { width: 1500, height: 565, channels: 4, background: "#34242d" },
})
  .composite(details)
  .png()
  .toFile(`${dir}/essai-02-details.png`);
await writeFile(
  `${dir}/essai-02-progression.json`,
  JSON.stringify(
    {
      scope:
        "Nouveau test local uniquement ; aucun remplacement, aucune intégration, publication, commit ou push.",
      method:
        "Cinq générations indépendantes : détails, reliefs, moulures et matières varient par rareté ; aucune recoloration du master commun de l’essai 01.",
      model: "openai/gpt-image-2",
      baseFile,
      baseSha256: sha(await readFile(baseFile)),
      references,
      outputs,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Essai 02 : cinq designs distincts, centres transparents, planches et provenance enregistrées.",
);
