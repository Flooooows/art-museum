import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { experimentalFrameFinishes } from "../../generationStyle";

// Run after completion of all five image jobs. Preview/provenance only:
// no recoloring, source edits, registry updates, integration or publication.
const dir = "src/card-lab/experiments/verre";
const jobs = {
  fer: "image_1a1bbeeec001z36x3vfpt8Xm1U",
  cuivre: "image_1a1bbedf0001Je5YVAY5uefPEl",
  argent: "image_1a1bbeeaf001L9maMDwHQoHrTj",
  dore: "image_1a1bbed90001SYqDWkb40AQyoD",
  "lapis-lazuli": "image_1a1bbee47001rw0SKm8p0si2FG",
};
const sha = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const referenceFiles = [
  `${dir}/essai-01.png`,
  "src/card-lab/experiments/japon/essai-02-cinq-raretes.png",
  "src/card-lab/experiments/japon/essai-02-references/egypte-cinq-raretes.png",
  "src/card-lab/experiments/japon/essai-02-references/prehistoire-cinq-raretes.png",
];
const references = await Promise.all(
  referenceFiles.map(async (file) => ({
    file,
    sha256: sha(await readFile(file)),
  })),
);
const outputs = [],
  tiles = [],
  details = [];
for (const [index, { finish, label }] of experimentalFrameFinishes.entries()) {
  const file = `${dir}/essai-02-${finish}.png`,
    bytes = await readFile(file);
  const metadata = await sharp(bytes).metadata();
  if (metadata.width !== 1024 || metadata.height !== 1536)
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
    width: metadata.width,
    height: metadata.height,
    centerAlpha,
    imageJob: jobs[finish],
    materialReferences,
  });
  const title = Buffer.from(
    `<svg width="300" height="30"><text x="10" y="21" font-family="Arial" font-size="14" fill="#f5eadb">${label}</text></svg>`,
  );
  tiles.push({
    input: await sharp(bytes).resize(280, 420).png().toBuffer(),
    left: index * 300 + 10,
    top: 36,
  });
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
    "Les cinq designs ont le même alpha : vérifier qu’il ne s’agit pas d’une simple recoloration.",
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
        "Test local uniquement : aucun remplacement du lab, aucune intégration, publication, commit ou push.",
      method:
        "Cinq générations indépendantes sur le thème du verre : matières, gravures, reliefs, moulures et ornements évoluent avec la rareté, pas seulement les couleurs.",
      model: "openai/gpt-image-2",
      references,
      outputs,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Verre essai 02 : cinq designs distincts, centres transparents, planches et provenance prêtes.",
);
