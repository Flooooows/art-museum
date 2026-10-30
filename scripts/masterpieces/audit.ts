import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { assertProtectedInputs } from "../rarity-v2/integrity";
import { parseReviewCatalog, parseReviewExport } from "../../src/review/model";

const digest = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");
const catalogPath = "public/review-data/catalog.json";
const bytes = await readFile(catalogPath);
const catalog = parseReviewCatalog(JSON.parse(bytes.toString()));
const protectedHashes = await assertProtectedInputs(process.cwd());
const count = (values: string[]) =>
  Object.fromEntries(
    [...new Set(values)]
      .sort()
      .map((value) => [value, values.filter((v) => v === value).length]),
  );
const directory = "catalog/masterpieces";
await mkdir(directory, { recursive: true });
const exportsFound = [];
const manualReferencePath = `${directory}/manual-reference.local.json`;
const flag = process.argv.indexOf("--decisions");
if (flag >= 0 && !process.argv[flag + 1])
  throw new Error("Chemin requis après --decisions.");
let manualPath = flag >= 0 ? process.argv[flag + 1] : undefined;
let previousReference: { path: string; sha256: string } | undefined;
try {
  previousReference = JSON.parse(await readFile(manualReferencePath, "utf8"));
  manualPath ??= previousReference!.path;
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}
let manual: ReturnType<typeof parseReviewExport> | undefined;
let manualHash: string | undefined;
if (manualPath) {
  const raw = await readFile(manualPath);
  manualHash = digest(raw);
  manual = parseReviewExport(JSON.parse(raw.toString()), catalog);
  if (
    previousReference &&
    (previousReference.path !== manualPath ||
      previousReference.sha256 !== manualHash)
  )
    throw new Error(
      "La référence humaine a changé : arrêt sans écrasement ni substitution automatique.",
    );
  if (!previousReference)
    await writeFile(
      manualReferencePath,
      JSON.stringify({ path: manualPath, sha256: manualHash }, null, 2) + "\n",
      { flag: "wx" },
    );
}
const exportPath =
  ".playwright-cli/muse-decisions-review-1000-b069bbaeeecc561d.json";
try {
  const raw = await readFile(exportPath);
  const parsed = parseReviewExport(JSON.parse(raw.toString()), catalog);
  exportsFound.push({
    path: exportPath,
    sha256: digest(raw),
    decisions: parsed.decisions.length,
    origin: "firebase-browser-test",
    note: "Export généré par le précédent test navigateur Firebase ; aucune validation humaine exhaustive présumée. Fichier laissé intact.",
  });
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}
const audit = {
  catalogVersion: catalog.version,
  totalReviewWorks: catalog.works.length,
  note: "Les 1000 entrées sont le catalogue de revue ; seules 100 fiches appartiennent au jeu actif. Aucun choix humain présumé depuis les propositions.",
  proposedRarities: count(catalog.works.map((w) => String(w.proposal.level))),
  activeRarities: count(
    catalog.works
      .filter((w) => w.activeLevel !== null)
      .map((w) => String(w.activeLevel)),
  ),
  institutions: count(catalog.works.map((w) => w.institution)),
  families: count(catalog.works.map((w) => w.family)),
  creatorCredits: count(catalog.works.map((w) => w.creator)),
  creatorCreditLimitation:
    "Les crédits peuvent combiner créateur, éditeur et atelier ; ce décompte n’est pas un nombre d’artistes individuels normalisés. Les mouvements artistiques ne sont pas structurés dans le modèle de revue.",
  currentMasterpieceProposals: catalog.works
    .filter((w) => w.proposal.level === 4)
    .map((w) => ({
      id: w.id,
      title: w.title,
      score: w.proposal.score,
      status: w.proposal.status,
    })),
  confirmedDuplicatesToAvoid: catalog.works
    .filter((w) => w.id === "cma-111654" || w.id === "45434")
    .map((w) => ({
      id: w.id,
      title: w.title,
      sourceUrl: w.sourceUrl,
      note:
        w.id === "cma-111654"
          ? "Le Fuji rouge / South Wind, Clear Sky, déjà présent."
          : "La Grande Vague, déjà présente.",
    })),
  availableExports: exportsFound,
  reviewedHumanDecisionsAvailable: !!manual,
  humanReview: manual
    ? {
        sourceSha256: manualHash,
        catalogVersion: manual.catalogVersion,
        reviewed: manual.decisions.length,
        unreviewed: catalog.works.length - manual.decisions.length,
        finalRaritiesForReviewedWorks: count(
          manual.decisions.map((d) => String(d.finalLevel)),
        ),
        differentFromAlgorithm: manual.decisions.filter(
          (d) =>
            catalog.works.find((w) => w.id === d.artworkId)!.proposal.level !==
            d.finalLevel,
        ).length,
        masterpiecesChosenByUser: manual.decisions
          .filter((d) => d.finalLevel === 4)
          .map((d) => ({
            id: d.artworkId,
            title: catalog.works.find((w) => w.id === d.artworkId)!.title,
          })),
        mixedPreviewRarities: count(
          catalog.works.map((w) =>
            String(
              manual!.decisions.find((d) => d.artworkId === w.id)?.finalLevel ??
                w.proposal.level,
            ),
          ),
        ),
        mixedPreviewNote:
          "Choix humains prioritaires sur les œuvres revues ; propositions algorithmiques conservées explicitement pour les autres. Ce décompte mixte n’est pas une validation des œuvres non revues.",
        preservation:
          "Aucune décision réécrite ; la référence utilisateur est distincte de l’export de test. Le chemin local est exclu de Git et le fichier original n’est jamais copié dans les assets publics.",
      }
    : null,
  scientificLimit:
    "Cet audit ne valide encore aucune candidate supplémentaire ni droits de nouvelle image.",
};
const manifest = {
  purpose: "Protection préalable ; aucune migration ni déploiement autorisés.",
  files: {
    ...protectedHashes,
    [catalogPath]: digest(bytes),
    ...Object.fromEntries(exportsFound.map((e) => [e.path, e.sha256])),
  },
};
const manifestPath = `${directory}/protected-inputs.json`;
try {
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", {
    flag: "wx",
  });
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  const existing = JSON.parse(await readFile(manifestPath, "utf8")) as {
    files: Record<string, string>;
  };
  for (const [file, hash] of Object.entries(existing.files))
    if (digest(await readFile(file)) !== hash)
      throw new Error(`Entrée protégée modifiée : ${file}`);
}
await writeFile(
  `${directory}/audit.json`,
  JSON.stringify(audit, null, 2) + "\n",
);
await assertProtectedInputs(process.cwd());
if (manualPath && digest(await readFile(manualPath)) !== manualHash)
  throw new Error("L’export humain a changé pendant l’audit.");
console.log(
  `${catalog.works.length} œuvres auditées ; 2 propositions Pièce maîtresse, ${manual?.decisions.length ?? 0} décisions humaines ; aucune donnée active modifiée.`,
);
