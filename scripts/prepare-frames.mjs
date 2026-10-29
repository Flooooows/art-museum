import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(root, "public/assets/collections");
const outputDirectory = path.join(sourceDirectory, "display");
const manifestPath = path.join(root, "src/frame-assets.json");
const reportPath = path.join(root, "src/frame-assets.report.json");
const revision = "png640-alpha24-rectangle-inset8-matte250-v3";
const names = (await fs.readdir(sourceDirectory))
  .filter((name) =>
    /^.+-(fer|cuivre|argent|dore|lapis-lazuli)\.png$/.test(name),
  )
  .sort();
await fs.mkdir(outputDirectory, { recursive: true });
const previous = await fs
  .readFile(manifestPath, "utf8")
  .then(JSON.parse)
  .catch(() => ({}));
const manifest = {};
const ignored = [];

function aperture(data, width, height, channels) {
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const heights = new Uint32Array(width);
  let best = { left: 0, right: 0, top: 0, bottom: 0, area: 0 };
  // Largest fully transparent rectangle containing the center, not a sample of
  // a few scanlines: corner ornaments must never cover part of the reproduction.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * channels + channels - 1];
      heights[x] = alpha < 24 ? heights[x] + 1 : 0;
    }
    const stack = [];
    for (let x = 0; x <= width; x++) {
      const currentHeight = x === width ? 0 : heights[x];
      while (stack.length && heights[stack[stack.length - 1]] > currentHeight) {
        const rectangleHeight = heights[stack.pop()];
        const left = stack.length ? stack[stack.length - 1] + 1 : 0;
        const top = y - rectangleHeight + 1;
        const area = (x - left) * rectangleHeight;
        if (
          left <= centerX &&
          x > centerX &&
          top <= centerY &&
          y >= centerY &&
          area > best.area
        ) {
          best = { left, right: x, top, bottom: y + 1, area };
        }
      }
      if (x < width) stack.push(x);
    }
  }
  const left = best.left + 8;
  const right = best.right - 8;
  const top = best.top + 8;
  const bottom = best.bottom - 8;
  if (right - left < width * 0.4 || bottom - top < height * 0.4)
    throw new Error(
      "Ouverture du cadre trop petite ou non rectangulaire : vérifier le PNG.",
    );
  const percent = (value, total) => Number(((value / total) * 100).toFixed(4));
  return {
    left: percent(left, width),
    top: percent(top, height),
    width: percent(right - left, width),
    height: percent(bottom - top, height),
  };
}

function interiorMatte(data, width, height, channels) {
  const center = Math.floor(height / 2) * width + Math.floor(width / 2);
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  const mask = Buffer.alloc(width * height * 4);
  let head = 0;
  let tail = 1;
  queue[0] = center;
  visited[center] = 1;
  // Follow the actual inner opening, including recesses around ornaments.
  // Never fill disconnected holes outside the frame's inner metal border.
  while (head < tail) {
    const position = queue[head++];
    const x = position % width;
    const y = Math.floor(position / width);
    if (!x || !y || x === width - 1 || y === height - 1)
      throw new Error(
        "Ouverture reliée à l’extérieur : passe-partout non borné.",
      );
    mask.fill(255, position * 4, position * 4 + 4);
    const neighbors = [
      position - 1,
      position + 1,
      position - width,
      position + width,
    ];
    for (const next of neighbors) {
      if (!visited[next] && data[next * channels + channels - 1] < 250) {
        visited[next] = 1;
        queue[tail++] = next;
      }
    }
  }
  return mask;
}

for (const name of names) {
  const source = await fs.readFile(path.join(sourceDirectory, name));
  const fingerprint = createHash("sha256")
    .update(revision)
    .update(source)
    .digest("hex");
  const key = name.slice(0, -4);
  const output = path.join(outputDirectory, name);
  const matteOutput = path.join(outputDirectory, `${key}-matte.png`);
  if (
    previous[key]?.fingerprint === fingerprint &&
    previous[key]?.matte &&
    (await fs
      .access(output)
      .then(() => true)
      .catch(() => false)) &&
    (await fs
      .access(matteOutput)
      .then(() => true)
      .catch(() => false))
  ) {
    manifest[key] = previous[key];
    continue;
  }
  let window;
  let matte;
  try {
    const image = sharp(source);
    const metadata = await image.metadata();
    if (
      !metadata.hasAlpha ||
      metadata.width !== 1024 ||
      metadata.height !== 1536
    )
      throw new Error("PNG transparent 1024×1536 attendu.");
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    window = aperture(data, info.width, info.height, info.channels);
    matte = interiorMatte(data, info.width, info.height, info.channels);
  } catch (error) {
    ignored.push({
      name,
      reason: error instanceof Error ? error.message : String(error),
    });
    continue;
  }
  await sharp(source)
    .resize(640, 960)
    .keepXmp()
    .png({ compressionLevel: 9 })
    .toFile(output);
  await sharp(matte, { raw: { width: 1024, height: 1536, channels: 4 } })
    .resize(640, 960)
    .png({ compressionLevel: 9 })
    .toFile(matteOutput);
  manifest[key] = {
    src: `/assets/collections/display/${name}`,
    original: `/assets/collections/${name}`,
    matte: `/assets/collections/display/${key}-matte.png`,
    width: 640,
    height: 960,
    aperture: window,
    fingerprint,
  };
}
const content = JSON.stringify(manifest, null, 2) + "\n";
if ((await fs.readFile(manifestPath, "utf8").catch(() => "")) !== content)
  await fs.writeFile(manifestPath, content);
const report = JSON.stringify({ ignored }, null, 2) + "\n";
if ((await fs.readFile(reportPath, "utf8").catch(() => "")) !== report)
  await fs.writeFile(reportPath, report);
console.log(
  `${Object.keys(manifest).length} cadres prêts ; originaux conservés, PNG d’affichage 640×960.`,
);
for (const item of ignored)
  console.warn(`Cadre non activé (${item.name}) : ${item.reason}`);

const provenancePath = path.join(root, "public/assets/provenance.json");
const provenanceContent = await fs.readFile(provenancePath, "utf8");
const provenance = JSON.parse(provenanceContent);
for (const frame of Object.values(manifest)) {
  const bytes = await fs.readFile(path.join(root, "public", frame.matte));
  const source = await fs.readFile(path.join(root, "public", frame.original));
  const key = frame.matte.replace("/assets/", "");
  const sourceKey = frame.original.replace("/assets/", "");
  provenance[key] = {
    origin:
      "Masque technique du passe-partout dérivé des pixels alpha du cadre, pas une nouvelle illustration.",
    source: frame.original,
    sourceSha256: createHash("sha256").update(source).digest("hex"),
    sha256: createHash("sha256").update(bytes).digest("hex"),
    license:
      provenance[sourceKey]?.license ??
      "Licence du cadre source non précisée ; aucune nouvelle licence attribuée.",
    processing:
      "Région alpha <250 connectée au centre par quatre voisins, fermée avant les bords extérieurs ; PNG 640×960. Remplissage neutre par le thème, sans transformation du cadre ou de l’œuvre.",
  };
}
const nextProvenance = JSON.stringify(provenance, null, 2) + "\n";
if (nextProvenance !== provenanceContent)
  await fs.writeFile(provenancePath, nextProvenance);
