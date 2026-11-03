import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { artworks, catalogs, catalogCover } from "../../src/data";

const out = "dist";
const publicFiles = new Set([
  "favicon.svg",
  "assets/renaissance-art.jpg",
  "assets/hero-art.jpg",
  "assets/hero-texture.jpg",
  "assets/atelier-bg.jpg",
  "assets/provenance.json",
  "assets/inter-OFL.txt",
  "assets/playfairdisplay-OFL.txt",
  "assets/spacegrotesk-OFL.txt",
]);
for (const family of ["inter", "playfair", "space"])
  for (let i = 0; i < 3; i++) publicFiles.add(`assets/${family}-${i}.woff2`);
for (const url of [
  ...artworks.map((a) => a.image),
  ...catalogs.map(catalogCover),
]) {
  if (!url.startsWith("/assets/") || url.includes("..") || url.includes("\\"))
    throw Error(`Ressource publique invalide : ${url}`);
  publicFiles.add(url.slice(1));
}
for (const catalog of catalogs)
  publicFiles.add(`assets/${catalog.texture}.jpg`);
for (const file of publicFiles) {
  await mkdir(path.dirname(`${out}/${file}`), { recursive: true });
  await copyFile(`public/${file}`, `${out}/${file}`);
}
const provenance = JSON.parse(
  await readFile("public/assets/provenance.json", "utf8"),
);
await writeFile(
  `${out}/assets/provenance.json`,
  JSON.stringify(
    {
      ...provenance,
      "presentation-jeu": {
        source:
          "Présentation validée dans MUSE Lab 3b5f3172d4865a5a, copiée et isolée dans src/game-presentation/.",
        frames:
          "90 variantes affectables ; anciens décors fournis conservés, douze bases neutres détaillées et série Japon générées. Dérivés natifs sans perte avec masques stricts.",
        boosters:
          "Sept illustrations synthétiques générées distinctes ; textes de pochette ajoutés dans l’interface.",
        model: "openai/gpt-image-2 pour les nouveaux visuels générés.",
        note: "Les décors et illustrations ne sont pas des reproductions historiques. Les crédits des œuvres et reproductions restent propres à chaque fiche. Aucune licence supplémentaire n’est inventée pour les cadres fournis.",
      },
    },
    null,
    2,
  ) + "\n",
);
const files: Record<string, string> = {};
async function walk(dir: string, prefix = "") {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (
      /review|masterpieces|enrichment|legal-eu|generated-sources|service-account|firebase-adminsdk|assets\/collections|(?:card|booster|opening|muse)-lab/.test(
        name,
      ) ||
      entry.name.startsWith(".")
    )
      throw Error(`Fichier non publiable : ${name}`);
    if (entry.isDirectory()) await walk(`${dir}/${entry.name}`, `${name}/`);
    else
      files[name] = createHash("sha256")
        .update(await readFile(`${dir}/${entry.name}`))
        .digest("hex");
  }
}
await walk(out);
await mkdir("catalog/game-presentation", { recursive: true });
await writeFile(
  "catalog/game-presentation/hosting-manifest.json",
  JSON.stringify(
    {
      schemaVersion: 1,
      scope: "Jeu principal ; présentation validée du lab figée et autonome.",
      works: artworks.length,
      fileCount: Object.keys(files).length,
      files,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Jeu MUSE : ${Object.keys(files).length} fichiers, ${artworks.length} œuvres, aucun fichier de laboratoire ou d’atelier.`,
);
