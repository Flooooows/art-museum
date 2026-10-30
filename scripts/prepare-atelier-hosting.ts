import { copyFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseReviewCatalog } from "../src/review/model";
import { parseCandidateCatalog } from "../src/masterpieces/model";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogFile = "review-data/catalog.json";
const catalog = parseReviewCatalog(
  JSON.parse(await readFile(path.join(root, "public", catalogFile), "utf8")),
);
const candidatesFile = "masterpieces-data/catalog.json";
const candidates = parseCandidateCatalog(
  JSON.parse(await readFile(path.join(root, "public", candidatesFile), "utf8")),
);
const enrichmentFile = "enrichment-351-data/catalog.json";
const enrichment = parseCandidateCatalog(
  JSON.parse(await readFile(path.join(root, "public", enrichmentFile), "utf8")),
  "/enrichment-351-images",
);
const files = new Set([
  catalogFile,
  candidatesFile,
  enrichmentFile,
  ...enrichment.works.map((w) => w.imageUrl.slice(1)),
  ...candidates.works.map((w) => w.imageUrl.slice(1)),
  "favicon.svg",
  "assets/playfair-0.woff2",
  "assets/inter-0.woff2",
  "assets/inter-2.woff2",
  "assets/playfairdisplay-OFL.txt",
  "assets/inter-OFL.txt",
  ...catalog.works
    .filter((w) => w.imageUrl.startsWith("/assets/"))
    .map((w) => w.imageUrl.slice(1)),
]);
for (const file of files) {
  if (path.isAbsolute(file) || file.split(/[\\/]/).includes(".."))
    throw new Error("Chemin de ressource invalide.");
  const target = path.join(root, "dist-atelier", file);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(path.join(root, "public", file), target);
}
await copyFile(
  path.join(root, "dist-atelier/review.html"),
  path.join(root, "dist-atelier/index.html"),
);
console.log(
  `Atelier seul prêt : ${catalog.works.length} œuvres, ${candidates.works.length} candidates initiales et ${enrichment.works.length} nouvelles, ${files.size} ressources locales ; aucun jeu ni sauvegarde utilisateur.`,
);
