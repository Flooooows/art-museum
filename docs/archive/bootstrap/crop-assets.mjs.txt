import sharp from "sharp";
import { readFile, writeFile, readdir } from "node:fs/promises";

for (const [name, crop] of Object.entries({
  "hero-texture": { left: 0, top: 25, width: 512, height: 254 },
  "atelier-bg": { left: 73, top: 16, width: 367, height: 263 },
  "atelier-pack": { left: 167, top: 0, width: 179, height: 279 },
})) {
  const path = `public/assets/${name}.jpg`;
  const original = await readFile(path);
  await writeFile(
    path,
    await sharp(original).extract(crop).jpeg({ quality: 94 }).toBuffer(),
  );
}

for (const file of await readdir("public/assets")) {
  if (file.endsWith(".jpg")) await sharp(`public/assets/${file}`).metadata();
}
console.log("Images vérifiées ; navigation incrustée retirée des décors.");
