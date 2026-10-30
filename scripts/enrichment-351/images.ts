import { readFile, writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";
import { sha256 } from "../rarity-v2/http";
const dir = "catalog/enrichment-351",
  outputDir = "public/enrichment-351-images";
const prepared = JSON.parse(await readFile(`${dir}/prepared.json`, "utf8"));
for (const [file, hash] of Object.entries(prepared.evidenceHashes))
  if (sha256(await readFile(file)) !== hash)
    throw Error(`Preuve modifiée : ${file}`);
await mkdir(outputDir, { recursive: true });
const manifestFile = `${dir}/image-manifest.json`;
let previous: { images: any[] } = { images: [] };
try {
  previous = JSON.parse(await readFile(manifestFile, "utf8"));
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
}
const images: any[] = [],
  failures: any[] = [];
for (const a of prepared.approved) {
  if (
    a.rights.status !== "cleared" ||
    !a.image.evidenceFiles.length ||
    !/^e351-[a-zA-Z0-9.-]+$/.test(a.workId)
  )
    throw Error(`Approbation absente : ${a.inputId}`);
  const source = new URL(a.image.downloadUrl);
  if (
    source.protocol !== "https:" ||
    ![
      "upload.wikimedia.org",
      "thumb.wikimedia.org",
      "images.metmuseum.org",
    ].includes(source.hostname)
  )
    throw Error("Hôte d’image non autorisé");
  const output = `${outputDir}/${a.workId}.webp`,
    approvalSha256 = sha256(
      JSON.stringify({ object: a.objectKey, rights: a.rights, image: a.image }),
    );
  const existing = previous.images.find(
    (i: any) =>
      i.workId === a.workId &&
      i.downloadUrl === a.image.downloadUrl &&
      i.approvalSha256 === approvalSha256,
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
  try {
    const r = await fetch(source, {
      signal: AbortSignal.timeout(90000),
      headers: { "User-Agent": "MUSE-Review/1.0", Referer: a.sourceUrl },
    });
    if (
      !r.ok ||
      !r.headers.get("content-type")?.startsWith("image/") ||
      Number(r.headers.get("content-length") ?? 0) > 40_000_000
    )
      throw Error(`HTTP ${r.status} ou ressource non image/trop volumineuse`);
    const raw = Buffer.from(await r.arrayBuffer());
    if (raw.length > 40_000_000) throw Error("Fichier trop volumineux");
    const original = await sharp(raw).metadata();
    if (
      !original.width ||
      !original.height ||
      Math.max(original.width, original.height) < 1600
    )
      throw Error(
        `Définition insuffisante : ${original.width}×${original.height}, minimum 1600 px sur le grand côté`,
      );
    const rendered = await sharp(raw)
      .rotate()
      .resize({
        width: 1800,
        height: 2000,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 91 })
      .toBuffer();
    const metadata = await sharp(rendered).metadata();
    await writeFile(output, rendered);
    images.push({
      workId: a.workId,
      inputId: a.inputId,
      objectKey: a.objectKey,
      approvalSha256,
      sourceOriginalUrl: a.image.originalUrl,
      downloadUrl: a.image.downloadUrl,
      retrievedAt: new Date().toISOString(),
      downloadSha256: sha256(raw),
      downloadWidth: original.width,
      downloadHeight: original.height,
      output,
      outputSha256: sha256(rendered),
      width: metadata.width,
      height: metadata.height,
      transformation:
        "Orientation EXIF et réduction proportionnelle sans recadrage, WebP qualité 91 ; aucune retouche de couleur ni IA. L’empreinte de téléchargement n’est pas présentée comme celle du master original si une vignette a été utilisée.",
      license: a.image.license,
      licenseUrl: a.image.licenseUrl,
      credit: a.image.credit,
    });
    console.log(a.suffix, a.input.title, rendered.length);
  } catch (error) {
    failures.push({
      inputId: a.inputId,
      workId: a.workId,
      error: String(error),
      status: "technical_file_not_ready",
    });
    console.log("DIFFÉRÉ", a.suffix, String(error));
  }
  await writeFile(
    manifestFile,
    JSON.stringify(
      { stage: "approved_images_only", images, failures },
      null,
      2,
    ) + "\n",
  );
}
await writeFile(
  manifestFile,
  JSON.stringify({ stage: "approved_images_only", images, failures }, null, 2) +
    "\n",
);
console.log(
  `${images.length} images vérifiées, ${failures.length} différées ; aucun fichier non approuvé téléchargé.`,
);
