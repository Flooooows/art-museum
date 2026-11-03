import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import {
  parseTaxonomy,
  type TaxonomyCatalog,
  type TaxonomyAssignment,
} from "../../src/catalog/taxonomy";

const hashes: Record<string, string> = {};
async function json(file: string) {
  const bytes = await readFile(file);
  hashes[file] = createHash("sha256").update(bytes).digest("hex");
  return JSON.parse(bytes.toString());
}
const seed = await json("src/catalog/seed.json"),
  release = await json("src/catalog/game-release.json");
const selection = await json("catalog/review-1000/selection.json");
const oldWorks = [
  ...seed.works.map((w: any) => ({
    ...w,
    id: w.id,
    title: w.title,
    image: seed.images.find((i: any) => i.workId === w.id && i.primary).url,
    rarity: release.existingRarities.find((d: any) => d.artworkId === w.id)
      .level,
  })),
  ...release.works,
];
const selected = new Map(selection.works.map((s: any) => [s.id, s]));
const cache = new Map<string, any>();
async function source(file: string) {
  if (!cache.has(file)) cache.set(file, await json(file));
  return cache.get(file);
}
const definitions = [
  [
    "peinture",
    "Peintures",
    "Couleurs & surfaces",
    "beaux-arts",
    "beaux-arts",
    "Tableaux, fresques et peintures sur toile, bois ou soie.",
  ],
  [
    "sculpture",
    "Sculptures",
    "Le volume & le geste",
    "beaux-arts",
    "beaux-arts",
    "Statues, reliefs, bustes et figurines : des œuvres en trois dimensions.",
  ],
  [
    "estampes",
    "Estampes",
    "L’empreinte & le multiple",
    "beaux-arts",
    "beaux-arts",
    "Gravures, lithographies et estampes sur bois, d’Europe et d’Asie.",
  ],
  [
    "dessins",
    "Dessins",
    "Le trait & l’étude",
    "beaux-arts",
    "beaux-arts",
    "Études, esquisses et dessins identifiés comme tels par les musées.",
  ],
  [
    "photographie",
    "Photographies",
    "La lumière & l’instant",
    "beaux-arts",
    "art-moderne",
    "Photographies et tirages photographiques, distincts des estampes.",
  ],
  [
    "textiles",
    "Textiles & tapisseries",
    "Fibres & motifs",
    "arts-decoratifs",
    "decoratifs",
    "Tapisseries, tissus, vêtements et fragments textiles.",
  ],
  [
    "ceramique",
    "Céramiques",
    "Terre & feu",
    "arts-decoratifs",
    "decoratifs",
    "Poteries, porcelaines et objets classés en céramique par les musées.",
  ],
  [
    "arts-metal",
    "Orfèvrerie & arts du métal",
    "Métaux & éclats",
    "arts-decoratifs",
    "decoratifs",
    "Objets de métal, orfèvrerie, bijoux et émaux sur métal.",
  ],
  [
    "verre",
    "Arts du verre",
    "Transparences & reflets",
    "arts-decoratifs",
    "decoratifs",
    "Vases et objets dont le travail du verre est la technique principale.",
  ],
  [
    "mobilier",
    "Mobilier & luminaires",
    "Habiter & éclairer",
    "arts-decoratifs",
    "decoratifs",
    "Meubles, écrans de cheminée et luminaires.",
  ],
  [
    "manuscrits",
    "Manuscrits & enluminures",
    "Écrire & illustrer",
    "beaux-arts",
    "beaux-arts",
    "Feuillets manuscrits et enluminés, sur parchemin ou papyrus.",
  ],
  [
    "objets-archeologiques",
    "Objets archéologiques",
    "Rites, usages & outils",
    "archeologie",
    "prehistoire",
    "Objets funéraires, amulettes, outils et jades rituels, hors sculptures et céramiques déjà identifiées.",
  ],
] as const;
const catalogs: TaxonomyCatalog[] = definitions.map(
  ([id, title, subtitle, familyId, frameFamily, description]) => ({
    id,
    title,
    subtitle,
    familyId,
    frameFamily,
    description,
    kind: "type",
    color: familyId === "arts-decoratifs" ? "#5c1a3a" : "#4a0011",
    texture: "renaissance-texture",
    coverArtworkId: "",
  }),
);
for (const [id, title, description] of [
  [
    "egypte",
    "Égypte ancienne",
    "Œuvres égyptiennes antiques : objets, sculptures et images. Ne comprend pas automatiquement tout objet produit en Égypte à une époque plus récente.",
  ],
  [
    "renaissance-italienne",
    "Renaissance italienne",
    "Sélection historique documentée et œuvres italiennes dont les bornes de création sont comprises entre 1400 et 1600.",
  ],
  [
    "mythes",
    "Mythes & créatures",
    "Figures, récits et créatures identifiés dans les titres institutionnels, et sélection thématique historique. Le thème ne remplace pas le type de l’œuvre.",
  ],
  [
    "premiers-arts",
    "Premières traces",
    "Les dix objets néolithiques documentés de la sélection historique ; aucune attribution à la Préhistoire sur la seule ancienneté.",
  ],
]) {
  const old = seed.catalogs.find((c: any) => c.id === id);
  catalogs.push({
    id,
    title,
    description,
    subtitle: old.subtitle,
    familyId: old.familyIds[0],
    frameFamily: old.frameFamily ?? old.id,
    color: old.color,
    texture: old.texture,
    kind: "theme",
    coverArtworkId: "",
  });
}
const typeMap: Record<string, string> = {
  Painting: "peinture",
  Sculpture: "sculpture",
  Print: "estampes",
  Drawing: "dessins",
  Photograph: "photographie",
  Textile: "textiles",
  Ceramic: "ceramique",
  Metalwork: "arts-metal",
  Glass: "verre",
  Silver: "arts-metal",
  Jewelry: "arts-metal",
  Enamel: "arts-metal",
  Manuscript: "manuscrits",
  "Furniture and woodwork": "mobilier",
  Jade: "objets-archeologiques",
  Stone: "objets-archeologiques",
  Amulets: "objets-archeologiques",
  "Funerary Equipment": "objets-archeologiques",
  "Cosmetic Objects": "objets-archeologiques",
  "Tools and Equipment": "objets-archeologiques",
  Vessels: "objets-archeologiques",
};
// Individually reviewed historical objects: objectName is often a description, not a taxonomy.
const overrides: Record<string, [string, string]> = {
  "437654": ["peinture", "Painting"],
  "436105": ["peinture", "Painting"],
  "436535": ["peinture", "Painting"],
  "mona-lisa": ["peinture", "Painting"],
  "45434": ["estampes", "Woodblock print"],
  "544453": ["sculpture", "Head"],
  "544184": ["sculpture", "Head"],
  "544450": ["sculpture", "Statue"],
  "544442": ["sculpture", "Sphinx"],
  "544227": ["sculpture", "Figurine"],
  "544864": ["sculpture", "Statuette"],
  "820892": ["arts-metal", "Vase en argent"],
  "20804": ["arts-metal", "Vase en argent"],
  "35": ["arts-metal", "Vase en or"],
  "9480": ["verre", "Vase en verre"],
  "1085": ["mobilier", "Cabinet"],
  "250945": ["peinture", "Wall painting"],
  "204759": ["sculpture", "Cast"],
  "204758": ["sculpture", "Statue"],
  "467642": ["textiles", "Tapestry"],
  "cma-142734": ["arts-metal", "Miscellaneous — orfèvrerie, pierres et perles"],
  "cma-140001": ["arts-metal", "Miscellaneous — œuf d’orfèvrerie émaillé"],
  "cma-102388": [
    "manuscrits",
    "Funerary Equipment — Livre des morts sur papyrus",
  ],
};
const myth =
  /\b(venus|aphrodite|eros|cupid|apollo|daphne|dana[eë]|hercules|heracles|herakles|bacchus|dionys\w*|satyr\w*|maenad\w*|medusa|gorgon\w*|perseus|andromeda|pegasus|bellerophon|chimaera|chimera|zeus|jupiter|minerva|neptune|poseidon|unicorn|dragon|griffin|sphinx|mars|nymph\w*|nereid|orpheus|eurydice|aeneas|trojan\w*|medea|orestes|amazons|leda)\b/i;
const assignments: TaxonomyAssignment[] = [];
for (const w of oldWorks) {
  const legacy = seed.works.find((v: any) => v.id === w.id);
  let d: any, file: string, rawType: string;
  if (legacy) {
    file = seed.images.find((i: any) => i.workId === w.id && i.primary).rights
      .verification.evidenceFile;
    const envelope = await source(file);
    d = envelope.response?.data ?? envelope.response ?? {};
    rawType = d.type ?? d.objectName ?? "Painting";
  } else if (w.museumId === "cma") {
    const s: any = selected.get(w.id);
    assert.ok(s);
    file = s.evidenceFile;
    d = (await source(file)).payload.data.find(
      (v: any) => `cma-${v.id}` === w.id,
    );
    assert.ok(d);
    rawType = d.type;
    assert.equal(d.type, s.type);
  } else {
    assert.equal(w.museumId, "louvre");
    assert.equal(w.category, "Peinture");
    rawType = "Painting";
    file = "src/catalog/game-release.json";
    d = {
      title: w.title,
      culture: [],
      creation_date_earliest: null,
      creation_date_latest: null,
    };
  }
  const override = overrides[w.id];
  const primaryCatalogId = override?.[0] ?? typeMap[rawType];
  assert.ok(primaryCatalogId, `Type non traité : ${w.id} ${rawType}`);
  const themeIds = legacy
    ? seed.memberships
        .filter(
          (m: any) =>
            m.workId === w.id &&
            [
              "egypte",
              "renaissance-italienne",
              "mythes",
              "premiers-arts",
            ].includes(m.catalogId),
        )
        .map((m: any) => m.catalogId)
    : [];
  const themeReasons: Record<string, string> = Object.fromEntries(
    themeIds.map((id: string) => [
      id,
      "Appartenance documentée dans la sélection historique.",
    ]),
  );
  const culture = Array.isArray(d.culture)
    ? d.culture.join(" ; ")
    : (d.culture ?? "");
  const start = d.creation_date_earliest ?? d.objectBeginDate,
    end = d.creation_date_latest ?? d.objectEndDate;
  const addTheme = (id: string, reason: string) => {
    if (!themeIds.includes(id)) themeIds.push(id);
    themeReasons[id] = reason;
  };
  if (
    /Egypt/i.test(culture) &&
    /(Dynasty|dynasties|Kingdom|Ptolemaic|Greco-Roman|Pharaon)/i.test(
      culture,
    ) &&
    typeof end === "number" &&
    end <= 395
  )
    addTheme(
      "egypte",
      `Culture institutionnelle : ${culture} ; borne finale ${end}.`,
    );
  if (
    /\bItaly\b|\bItalian\b/i.test(culture) &&
    typeof start === "number" &&
    typeof end === "number" &&
    start >= 1400 &&
    end <= 1600 &&
    !/19th|20th/i.test(culture)
  )
    addTheme(
      "renaissance-italienne",
      `Culture institutionnelle : ${culture} ; création ${start}–${end}.`,
    );
  if (w.id === "e351-Q783215" || w.id === "e351-Q656434")
    addTheme(
      "renaissance-italienne",
      "Léonard de Vinci : œuvre de la Renaissance, datation de la notice Louvre.",
    );
  if (myth.test(d.title ?? w.title) && w.id !== "cma-156896")
    addTheme(
      "mythes",
      `Figure ou créature explicitement nommée dans le titre institutionnel : ${d.title ?? w.title}.`,
    );
  assignments.push({
    artworkId: w.id,
    primaryCatalogId,
    themeIds,
    sourceType: rawType,
    sourceFiles: override ? [file, "src/catalog/seed.json"] : [file],
    reason: override
      ? `Classement individuel : ${override[1]} ; forme, fonction et technique documentées dans la notice et la fiche historique.`
      : `Type institutionnel : ${rawType}.`,
    themeReasons,
  });
}
for (const c of catalogs) {
  const members = oldWorks.filter((w: any) =>
    assignments.some(
      (a) =>
        a.artworkId === w.id &&
        (a.primaryCatalogId === c.id || a.themeIds.includes(c.id)),
    ),
  );
  assert.ok(members.length, c.id);
  members.sort((a: any, b: any) => b.rarity - a.rarity);
  c.coverArtworkId = members[0].id;
}
hashes["scripts/catalog-taxonomy/build.ts"] = createHash("sha256")
  .update(await readFile("scripts/catalog-taxonomy/build.ts"))
  .digest("hex");
const output = {
  schemaVersion: 1 as const,
  id: "taxonomy-2026-11-01",
  releaseId: release.id,
  sourceHashes: hashes,
  catalogs,
  assignments,
};
parseTaxonomy(output, oldWorks, release.id);
await mkdir("catalog/taxonomy", { recursive: true });
await writeFile("src/catalog/taxonomy.json", JSON.stringify(output) + "\n");
const report = {
  id: output.id,
  releaseId: release.id,
  total: oldWorks.length,
  types: catalogs
    .filter((c) => c.kind === "type")
    .map((c) => ({
      id: c.id,
      title: c.title,
      count: assignments.filter((a) => a.primaryCatalogId === c.id).length,
    })),
  themes: catalogs
    .filter((c) => c.kind === "theme")
    .map((c) => ({
      id: c.id,
      title: c.title,
      count: assignments.filter((a) => a.themeIds.includes(c.id)).length,
    })),
  note: "Un seul type par carte ; les thèmes se recoupent et ne s’additionnent pas au total unique.",
};
await writeFile(
  "catalog/taxonomy/report.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
