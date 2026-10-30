import { readFile, writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";
import { sha256 } from "../rarity-v2/http";

const report = JSON.parse(
  await readFile("masterpieces-candidates.json", "utf8"),
);
const preview = JSON.parse(
  await readFile("masterpieces-import-preview.json", "utf8"),
);
if (report.version !== preview.version)
  throw Error("Approbation et aperçu incompatibles");
for (const [file, hash] of Object.entries(report.evidenceHashes))
  if (sha256(await readFile(file)) !== hash)
    throw Error(`Preuve modifiée : ${file}`);
const file = "catalog/masterpieces/image-manifest.json";
let previous: { images: any[] } = { images: [] };
try {
  previous = JSON.parse(await readFile(file, "utf8"));
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
}
await mkdir("public/masterpieces-images", { recursive: true });
const images = [];
for (const w of preview.works) {
  const c = report.candidates.find((c: any) => c.id === w.id);
  if (
    !c?.recommended ||
    c.rights.status !== "cleared" ||
    !c.imageSource ||
    !/^[a-zA-Z0-9.-]+$/.test(c.id) ||
    w.imageUrl !== `/masterpieces-images/${c.id}.webp`
  )
    throw Error(`Approbation d’image absente : ${w.id}`);
  const source = new URL(c.imageSource);
  if (
    source.protocol !== "https:" ||
    ![
      "www.artic.edu",
      "images.metmuseum.org",
      "upload.wikimedia.org",
      "thumb.wikimedia.org",
    ].includes(source.hostname)
  )
    throw Error("Hôte d’image refusé");
  const output = `public${w.imageUrl}`,
    existing = previous.images.find(
      (p: any) => p.id === c.id && p.sourceUrl === c.imageSource,
    );
  if (existing) {
    try {
      if (sha256(await readFile(output)) === existing.outputSha256) {
        images.push(existing);
        continue;
      }
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    }
  }
  const r = await fetch(source, {
    signal: AbortSignal.timeout(60000),
    headers: { "User-Agent": "MUSE-Atelier/1.0", Referer: c.sourceUrl },
  });
  if (
    !r.ok ||
    !r.headers.get("content-type")?.startsWith("image/") ||
    Number(r.headers.get("content-length") ?? 0) > 20_000_000
  )
    throw Error(`Téléchargement refusé : ${c.id}, HTTP ${r.status}`);
  const raw = Buffer.from(await r.arrayBuffer());
  if (raw.length > 20_000_000) throw Error("Image trop volumineuse");
  const bytes = await sharp(raw)
    .rotate()
    .resize({
      width: 1000,
      height: 1200,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 87 })
    .toBuffer();
  await writeFile(output, bytes);
  const meta = await sharp(bytes).metadata();
  images.push({
    id: c.id,
    sourceUrl: c.imageSource,
    retrievedAt: new Date().toISOString(),
    sourceSha256: sha256(raw),
    outputSha256: sha256(bytes),
    output,
    width: meta.width,
    height: meta.height,
    transformation:
      "Orientation EXIF, réduction proportionnelle sans recadrage, WebP qualité 87 ; couleurs de la reproduction non modifiées.",
    rights: c.rights,
  });
  console.log(c.id, bytes.length);
}
await writeFile(
  file,
  JSON.stringify({ version: report.version, images }, null, 2) + "\n",
);
console.log(
  `${images.length} reproductions autorisées ; aucune image des candidates bloquées.`,
);
