import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { artworks } from "../../src/data";

const out = "dist-muse-lab";
const sources = new Set([
  "favicon.svg",
  "assets/inter-0.woff2",
  "assets/playfair-0.woff2",
  "assets/inter-OFL.txt",
  "assets/playfairdisplay-OFL.txt",
]);
for (const art of artworks) {
  if (!art.image.startsWith("/assets/"))
    throw Error(`Image hors liste publique attendue : ${art.id}`);
  const relative = decodeURIComponent(art.image.slice(1));
  if (relative.includes("..") || relative.includes("\\"))
    throw Error("Chemin public invalide.");
  sources.add(relative);
}
for (const source of sources) {
  await mkdir(path.dirname(`${out}/${source}`), { recursive: true });
  await copyFile(`public/${source}`, `${out}/${source}`);
}
await copyFile(`${out}/muse-lab.html`, `${out}/index.html`);
await writeFile(`${out}/robots.txt`, "User-agent: *\nDisallow: /\n");
const files: Record<string, string> = {};
async function walk(dir: string, prefix = "") {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    if (entry.name.startsWith("."))
      throw Error(`Fichier caché inattendu : ${relative}`);
    if (entry.isDirectory()) await walk(`${dir}/${entry.name}`, relative + "/");
    else
      files[relative] = createHash("sha256")
        .update(await readFile(`${dir}/${entry.name}`))
        .digest("hex");
  }
}
await walk(out);
for (const name of Object.keys(files))
  if (
    /(?:review|masterpieces|enrichment|legal-eu|generated-sources|provenance|service-account|firebase-adminsdk|assets\/collections)/.test(
      name,
    )
  )
    throw Error(`Fichier hors périmètre lab : ${name}`);
await mkdir("catalog/muse-lab", { recursive: true });
await writeFile(
  "catalog/muse-lab/hosting-manifest.json",
  JSON.stringify(
    {
      schemaVersion: 1,
      scope:
        "Cartes, boosters, ouverture et accueil du laboratoire uniquement.",
      works: artworks.length,
      publicFilesCopied: sources.size,
      fileCount: Object.keys(files).length,
      files,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `MUSE Lab : ${Object.keys(files).length} fichiers, ${artworks.length} œuvres, aucun fichier d’atelier ou source générée.`,
);
