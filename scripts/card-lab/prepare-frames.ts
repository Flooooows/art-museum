import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import historical from "../../src/frame-assets.json";
import { legacyFrameFamilies } from "../../src/card-lab/frameRules";
import { rarities } from "../../src/data";

const out = "src/card-lab/assets/frames",
  width = 768,
  height = 1152;
const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");
const frames: Record<string, unknown> = {};
await mkdir(out, { recursive: true });
for (const family of legacyFrameFamilies)
  for (const [level, rarity] of rarities.entries()) {
    const key = `${family}-${rarity.finish}`,
      sourceFile = `public/assets/collections/${key}.png`;
    const original = await readFile(sourceFile),
      meta = await sharp(original).metadata();
    if (meta.width !== 1024 || meta.height !== 1536)
      throw Error(`Dimensions de cadre inattendues : ${key}`);
    const old = (
      historical as Record<
        string,
        {
          matte: string;
          aperture: {
            left: number;
            top: number;
            width: number;
            height: number;
          };
        }
      >
    )[key];
    // The five Japanese originals need a clean opening; their silhouettes remain unchanged.
    // This conservative common rectangle was checked against all five supplied ornaments.
    const a =
      family === "japon"
        ? {
            left: (176 / 1024) * 100,
            top: (224 / 1536) * 100,
            width: (674 / 1024) * 100,
            height: (1056 / 1536) * 100,
          }
        : old?.aperture;
    if (!a) throw Error(`Ouverture non vérifiée : ${key}`);
    const rectangle = {
      left: Math.ceil((a.left * width) / 100),
      top: Math.ceil((a.top * height) / 100),
      right: Math.floor(((a.left + a.width) * width) / 100),
      bottom: Math.floor(((a.top + a.height) * height) / 100),
    };
    const { data } = await sharp(original)
      .resize(width, height)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const mask = Buffer.alloc(width * height * 4);
    let sourceMaskFile: string | null = null,
      sourceMaskSha256: string | null = null;
    if (family === "japon") {
      const openings: Record<
        string,
        { left: number; top: number; right: number; bottom: number }
      > = {
        fer: { left: 144, top: 162, right: 886, bottom: 1308 },
        cuivre: { left: 152, top: 188, right: 874, bottom: 1294 },
        argent: { left: 154, top: 202, right: 870, bottom: 1290 },
        dore: { left: 152, top: 188, right: 874, bottom: 1294 },
        "lapis-lazuli": { left: 152, top: 164, right: 874, bottom: 1324 },
      };
      const hole = openings[rarity.finish];
      for (
        let y = Math.ceil((hole.top * height) / 1536);
        y < Math.floor((hole.bottom * height) / 1536);
        y++
      )
        for (
          let x = Math.ceil((hole.left * width) / 1024);
          x < Math.floor((hole.right * width) / 1024);
          x++
        )
          mask.fill(255, (y * width + x) * 4, (y * width + x) * 4 + 4);
    } else {
      sourceMaskFile = `public${old.matte}`;
      const originalMask = await readFile(sourceMaskFile);
      sourceMaskSha256 = sha(originalMask);
      const inner = await sharp(originalMask)
        .resize(width, height, { kernel: "nearest" })
        .ensureAlpha()
        .raw()
        .toBuffer();
      for (let p = 0; p < width * height; p++)
        if (inner[p * 4 + 3] > 127) mask.fill(255, p * 4, p * 4 + 4);
    }
    for (let y = rectangle.top; y < rectangle.bottom; y++)
      for (let x = rectangle.left; x < rectangle.right; x++)
        mask.fill(255, (y * width + x) * 4, (y * width + x) * 4 + 4);
    for (let p = 0; p < width * height; p++)
      if (mask[p * 4 + 3]) data.fill(0, p * 4, p * 4 + 4);
    const bytes = await sharp(data, { raw: { width, height, channels: 4 } })
      .webp({ quality: 92, alphaQuality: 100, effort: 5 })
      .toBuffer();
    const file = `${key}.webp`;
    await writeFile(`${out}/${file}`, bytes);
    const windowFile = `${key}-window.webp`;
    const windowBytes = await sharp(mask, {
      raw: { width, height, channels: 4 },
    })
      .webp({ lossless: true })
      .toBuffer();
    await writeFile(`${out}/${windowFile}`, windowBytes);
    // A two-pixel inset stays clear of the resampled transparency edge.
    const aperture = {
      left: ((rectangle.left + 2) / width) * 100,
      top: ((rectangle.top + 2) / height) * 100,
      width: ((rectangle.right - rectangle.left - 4) / width) * 100,
      height: ((rectangle.bottom - rectangle.top - 4) / height) * 100,
    };
    frames[key] = {
      key,
      family,
      finish: rarity.finish,
      level,
      file,
      width,
      height,
      aperture,
      clearedRectangle: rectangle,
      sourceFile,
      sourceSha256: sha(original),
      outputSha256: sha(bytes),
      windowFile,
      windowSha256: sha(windowBytes),
      sourceMaskFile,
      sourceMaskSha256,
      adaptation:
        family === "japon"
          ? "Copie de laboratoire : ouverture intérieure rendue transparente, originaux inchangés."
          : "Copie de laboratoire : fenêtre mesurée conservée et nettoyée ; aucun ornement ajouté ni recoloré.",
    };
  }
await writeFile(
  "src/card-lab/assets/frames.json",
  JSON.stringify(
    {
      schemaVersion: 1,
      preparationScriptSha256: sha(
        await readFile("scripts/card-lab/prepare-frames.ts"),
      ),
      method:
        "Exemples existants adaptés en cadres de carte. Aucun changement aux registres historiques ou au site publié.",
      frames,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Laboratoire : ${Object.keys(frames).length} cadres préparés (7 familles × 5 finitions), originaux inchangés.`,
);
