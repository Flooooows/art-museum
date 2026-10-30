import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { sha256 } from "../rarity-v2/http";
import { assertProtectedInputs } from "../rarity-v2/integrity";
import { parseReviewCatalog, parseReviewExport } from "../../src/review/model";

const dir = "catalog/enrichment-351";
await mkdir(dir, { recursive: true });
const inputFile = "muse_oeuvres_candidates.json",
  mdFile = "MUSE_catalogue_oeuvres_domaine_public_a_verifier.md";
const bytes = await readFile(inputFile),
  input = JSON.parse(bytes.toString());
const rows = input.artworks as {
  id: string;
  artist: string;
  title: string;
  category: string;
}[];
if (
  rows.length !== 351 ||
  new Set(rows.map((r) => r.id)).size !== 351 ||
  rows.some(
    (r, i) => r.id !== `muse-candidate-${String(i + 1).padStart(4, "0")}`,
  )
)
  throw Error("Liste incompatible");
const md = await readFile(mdFile, "utf8");
const tableRows = md
  .split("\n")
  .filter((l) => l.startsWith("| ") && !l.startsWith("| Artiste"));
if (tableRows.length !== 351)
  throw Error("Le Markdown ne contient pas les mêmes 351 lignes");
for (const [i, line] of tableRows.entries()) {
  const cells = line.split("|").map((s) => s.trim());
  if (cells[1] !== rows[i].artist || cells[2] !== rows[i].title)
    throw Error(`Divergence Markdown/JSON ligne ${i + 1}`);
}
const catalog = parseReviewCatalog(
  JSON.parse(await readFile("public/review-data/catalog.json", "utf8")),
);
const previous = JSON.parse(
  await readFile("masterpieces-candidates.json", "utf8"),
);
const protectedFiles: Record<string, string> = {
  ...(await assertProtectedInputs(process.cwd())),
};
for (const file of [
  inputFile,
  mdFile,
  "public/review-data/catalog.json",
  "public/masterpieces-data/catalog.json",
  "masterpieces-candidates.json",
  "masterpieces-import-preview.json",
  "catalog/masterpieces/image-manifest.json",
]) {
  protectedFiles[file] = sha256(await readFile(file));
}
for (const name of await readdir("src/rarity-engine"))
  if (name.endsWith(".ts")) {
    const file = `src/rarity-engine/${name}`;
    protectedFiles[file] = sha256(await readFile(file));
  }
const ref = JSON.parse(
  await readFile("catalog/masterpieces/manual-reference.local.json", "utf8"),
);
const manualBytes = await readFile(ref.path),
  manual = parseReviewExport(JSON.parse(manualBytes.toString()), catalog);
if (sha256(manualBytes) !== ref.sha256)
  throw Error("Référence humaine modifiée");
const frozen = { files: protectedFiles, manualDecisionsSha256: ref.sha256 };
const frozenFile = `${dir}/protected-inputs.json`;
try {
  const old = JSON.parse(await readFile(frozenFile, "utf8"));
  if (JSON.stringify(old) !== JSON.stringify(frozen))
    throw Error("Entrées protégées du lot 351 modifiées depuis son démarrage");
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  await writeFile(frozenFile, JSON.stringify(frozen, null, 2) + "\n", {
    flag: "wx",
  });
}
export const knownMatches: Record<
  string,
  { id: string; relation: string; note: string }
> = {
  "0001": {
    id: "mona-lisa",
    relation: "exact_object",
    note: "La Joconde déjà présente ; préserver son choix humain.",
  },
  "0042": {
    id: "cma-108501",
    relation: "same_print_composition",
    note: "Melencolia I est déjà représentée par l’épreuve Cleveland ; ne pas réimporter une autre épreuve comme nouveauté de composition.",
  },
  "0101": {
    id: "436105",
    relation: "exact_object",
    note: "La Mort de Socrate du Met déjà active.",
  },
  "0150": {
    id: "artic-16571",
    relation: "series_part_existing",
    note: "Une version Chicago existe en recherche ; la série n’est pas un objet unique et cette version n’épuise pas la série.",
  },
  "0156": {
    id: "artic-16568",
    relation: "series_part_existing",
    note: "Nymphéas de Chicago, 1906, en revue ; aucune assimilation à toute la série.",
  },
  "0167": {
    id: "artic-111442",
    relation: "exact_object",
    note: "Le Bain de l’enfant déjà proposé dans le précédent lot de review, pas activé dans le jeu.",
  },
  "0172": {
    id: "artic-27992",
    relation: "exact_object",
    note: "Toile définitive de Seurat déjà dans la revue des candidates.",
  },
  "0175": {
    id: "moma-79802",
    relation: "exact_object",
    note: "La Nuit étoilée, MoMA 472.1941, déjà en revue.",
  },
  "0177": {
    id: "artic-28560",
    relation: "version_selected_previously",
    note: "Version Chicago 1889 déjà en revue ; versions Amsterdam 1888 et Orsay distinctes, non substituées.",
  },
  "0182": {
    id: "436535",
    relation: "version_selected_previously",
    note: "Version du Met déjà active ; ne pas confondre avec les autres Champs de blé avec cyprès.",
  },
  "0193": {
    id: "artic-61128",
    relation: "exact_object",
    note: "Au Moulin Rouge, Chicago, déjà en revue.",
  },
  "0198": {
    id: "artic-20684",
    relation: "exact_object",
    note: "Rue de Paris, temps de pluie, Chicago, déjà en revue.",
  },
  "0200": {
    id: "nm-NG.M.00939",
    relation: "version_selected_previously",
    note: "Le Cri de 1893 déjà en revue ; pastel 1895 et peinture 1910 distincts.",
  },
  "0252": {
    id: "45434",
    relation: "same_print_composition",
    note: "La Grande Vague déjà active et choisie Pièce maîtresse par l’utilisateur ; préserver l’épreuve existante.",
  },
  "0253": {
    id: "cma-111654",
    relation: "same_print_composition",
    note: "Fuji rouge déjà dans le millier sous South Wind, Clear Sky.",
  },
  "0256": {
    id: "cma-103244",
    relation: "same_print_composition",
    note: "Averse sur Shin-Ōhashi et Atake déjà dans le millier sous le titre anglais.",
  },
  "0258": {
    id: "cma-126086",
    relation: "series_part_existing",
    note: "La série Tōkaidō est partiellement représentée par Driving Rain at Shōno ; pas toute la série.",
  },
  "0259": {
    id: "cma-152499",
    relation: "series_part_existing",
    note: "Les Cent vues d’Edo sont partiellement représentées, notamment Moon-Viewing Promontory ; ne pas assimiler la série à cette planche.",
  },
  "0295": {
    id: "467642",
    relation: "series_part_existing",
    note: "La Licorne captive est déjà active ; le cycle entier n’est pas une seule nouvelle carte.",
  },
  "0309": {
    id: "cma-100824",
    relation: "study_or_fragment_existing",
    note: "Tête de Pierre de Wissant déjà présente ; ce fragment n’est pas le groupe complet des Bourgeois de Calais.",
  },
  "0325": {
    id: "cma-325449",
    relation: "same_photographic_composition",
    note: "The Steerage déjà présent ; date du tirage et support à distinguer de la prise de vue.",
  },
  "0341": {
    id: "cma-117129",
    relation: "same_design_existing",
    note: "Strawberry Thief déjà dans le millier ; pas de second import nominal du motif.",
  },
};
const internal: Record<
  string,
  { canonical: string; relation: string; note: string }
> = {
  "0269": {
    canonical: "muse-candidate-0265",
    relation: "same_topic_exact_version_pending",
    note: "Deux libellés du Qingming de Zhang Zeduan : une entrée de composition, version du musée du Palais à confirmer ; ne pas assimiler aux copies Qing.",
  },
  "0314": {
    canonical: "muse-candidate-0208",
    relation: "same_topic_exact_cast_pending",
    note: "Petite Danseuse répétée ; distinguer cire originale et fontes posthumes avant toute carte.",
  },
};
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const existing = [...catalog.works, ...previous.candidates];
const records = rows.map((row) => {
  const match = knownMatches[row.id.slice(-4)];
  if (match && !existing.some((w) => w.id === match.id))
    throw Error(`Correspondance inexistante ${match.id}`);
  return {
    ...row,
    existingMatch: match ?? null,
    internalDuplicate: internal[row.id.slice(-4)] ?? null,
    titleOnlyLeads: existing
      .filter((w) => norm(w.title) === norm(row.title))
      .map((w) => ({
        id: w.id,
        title: w.title,
        creator: w.creator,
        note: "Piste textuelle seulement ; auteur et version à comparer.",
      })),
    inputLegalFlagsIgnored: true,
  };
});
await writeFile(
  `${dir}/audit.json`,
  JSON.stringify(
    {
      inputCount: rows.length,
      markdownCount: tableRows.length,
      protectedInputs: frozen,
      humanReference: {
        reviewed: manual.decisions.length,
        unreviewed: 1000 - manual.decisions.length,
        sha256: ref.sha256,
        scope:
          "Export original fourni uniquement ; les choix plus récents dans les navigateurs ne sont pas accessibles et restent préservés.",
      },
      existingCounts: {
        game: 100,
        review: 1000,
        priorCandidates: previous.candidates.length,
      },
      records,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `351 lignes concordantes ; ${Object.keys(knownMatches).length} correspondances documentées avec l’existant (objets/versions/parties distingués), 2 doublons de sujet internes ; ${manual.decisions.length} décisions originales protégées.`,
);
