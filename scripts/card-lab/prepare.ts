import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const source = "docs/Carton musée des Nymphéas.png";
const output = "src/card-lab/assets";
const bytes = await readFile(source);
const sha = (data: Buffer) => createHash("sha256").update(data).digest("hex");
const { data, info } = await sharp(bytes)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
if (info.width !== 1024 || info.height !== 1536 || info.channels !== 4)
  throw Error("Dimensions de la référence inattendues.");
// The user reference becomes only the outside of the CARD. Remove every pixel
// of the original painting and labels; React supplies all actual information.
const opening = { left: 123, top: 142, right: 903, bottom: 1340 };
for (let y = opening.top; y < opening.bottom; y++)
  data.fill(
    0,
    (y * info.width + opening.left) * 4,
    (y * info.width + opening.right) * 4,
  );
const frame = await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png({ compressionLevel: 9 })
  .toBuffer();
const textureRegion = { left: 400, top: 154, width: 450, height: 174 };
const texture = await sharp(bytes)
  .extract(textureRegion)
  .webp({ quality: 92 })
  .toBuffer();
await mkdir(output, { recursive: true });
await writeFile(`${output}/carton-frame.png`, frame);
await writeFile(`${output}/carton-velvet.webp`, texture);
await writeFile(
  `${output}/provenance.json`,
  JSON.stringify(
    {
      source,
      sourceSha256: sha(bytes),
      usage:
        "Prototype local à partir de la référence fournie par l’utilisateur ; aucune nouvelle licence attribuée.",
      frame: {
        file: "carton-frame.png",
        sha256: sha(frame),
        width: info.width,
        height: info.height,
        clearedRectangle: opening,
        method:
          "Seule la bordure extérieure est conservée. Pixels RGBA intérieurs remis à zéro : aucune œuvre ni information incrustée.",
      },
      texture: {
        file: "carton-velvet.webp",
        sha256: sha(texture),
        extractedRectangle: textureRegion,
        method: "Zone de velours vide de la référence, sans œuvre ni texte.",
      },
      preparationScriptSha256: sha(
        await readFile("scripts/card-lab/prepare.ts"),
      ),
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Bordure de carte transparente et velours préparés ; référence originale inchangée.",
);
