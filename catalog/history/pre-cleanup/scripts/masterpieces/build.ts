import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { sha256, payloadHash, type Capture } from "../rarity-v2/http";
import { assertProtectedInputs } from "../rarity-v2/integrity";
import { plain } from "../review/records";
import { createScorer } from "./score";
import type {
  ArtworkInput,
  Evidence,
  MonthlyAudience,
} from "../../src/rarity-engine/types";
import { REVIEW_RARITIES, type ReviewArtwork } from "../../src/review/types";

const dir = "catalog/masterpieces";
const json = async (file: string) => JSON.parse(await readFile(file, "utf8"));
const before = await assertProtectedInputs(process.cwd());
const catalog = await json("public/review-data/catalog.json");
if (
  sha256(await readFile("public/review-data/catalog.json")) !==
  "c39fe57cb4353b4d624a204f6ed78329859e9d1df76275098597196bd13b9451"
)
  throw Error("Catalogue original modifié");
const audit = await json(`${dir}/audit.json`);
const official = await json(`${dir}/official.json`);
const collected = await json(`${dir}/collected-evidence.json`);
const leads = await json(`${dir}/identity-leads.json`);
const entities: Record<string, any> = {};
const evidenceHashes: Record<string, string> = {};
for (const name of [
  "collected-evidence.json",
  "identity-leads.json",
  "objects.json",
  "official.json",
]) {
  const file = `${dir}/${name}`;
  evidenceHashes[file] = sha256(await readFile(file));
}
async function capture(file: string): Promise<Capture> {
  const bytes = await readFile(file);
  evidenceHashes[file] = sha256(bytes);
  const c = JSON.parse(bytes.toString());
  if (c.status !== "available" || c.payloadSha256 !== payloadHash(c.payload))
    throw Error(`Capture invalide : ${file}`);
  return c;
}
for (const r of leads.entities)
  Object.assign(
    entities,
    (
      (await capture(r.evidenceFile)).payload as {
        entities: Record<string, unknown>;
      }
    ).entities,
  );
Object.assign(
  entities,
  (
    (await capture(official.screamEntityFile)).payload as {
      entities: Record<string, unknown>;
    }
  ).entities,
);
const val = (e: any, p: string): any[] =>
  (e?.claims?.[p] ?? [])
    .map((v: any) => v.mainsnak?.datavalue?.value)
    .filter((v: any) => v !== undefined);
const label = (e: any) => e?.labels?.en?.value ?? e?.labels?.fr?.value ?? "";
function ev(
  c: Capture,
  file: string,
  scope: Evidence["scope"] = "artwork",
): Evidence {
  return {
    id: sha256(c.url).slice(0, 24),
    provider: c.provider,
    independentGroup: c.provider === "wikimedia" ? "wikimedia" : c.provider,
    url: c.url,
    retrievedAt: c.retrievedAt,
    file,
    sha256: evidenceHashes[file],
    tier: 1,
    scope,
  };
}
const expectedMonths = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(Date.UTC(2025, 9 + i, 1));
  return d.toISOString().slice(0, 7).replace("-", "") + "0100";
});
async function audience(
  qid: string | undefined,
  scope: Evidence["scope"],
): Promise<MonthlyAudience[]> {
  const a = qid && collected.audiences[qid];
  if (!a || a.status !== "available") return [];
  const c = await capture(a.evidenceFile),
    items = (c.payload as any).items;
  if (
    !Array.isArray(items) ||
    items.some((i: any) => !expectedMonths.includes(i.timestamp))
  )
    throw Error("Période d’audience inattendue");
  return [
    {
      title: a.title,
      language: "en",
      months: items.map((i: any) => ({
        timestamp: i.timestamp,
        views: i.views,
      })),
      expectedMonths,
      evidence: [ev(c, a.evidenceFile, scope)],
    },
  ];
}
const recommended = new Set(
  [
    27992, 28560, 20684, 111442, 14655, 94841, 61128, 16571, 16568, 87479,
    21023, 24548, 35376, 75644, 187528, 64339, 110246, 127643, 102611, 80607,
    25865,
  ]
    .map((id) => `artic-${id}`)
    .concat(["met-320053", "met-313680", "moma-79802", "nm-NG.M.00939"]),
);
const world: Record<number, string> = {
  21023: "Asie",
  24548: "Asie",
  58541: "Asie",
  47163: "Asie",
  35376: "Asie",
  127643: "Asie",
  7634: "Asie",
  75644: "Amériques",
  8746: "Amériques",
  110246: "Amériques",
  75645: "Amériques",
  18757: "Amériques",
  111442: "Amériques",
  25865: "Amériques",
  6565: "Amériques",
  111628: "Amériques",
  100858: "Amériques",
  61428: "Amériques",
  24306: "Amériques",
  56682: "Amériques",
  191213: "Afrique",
  30731: "Afrique",
  5567: "Afrique",
  187528: "Afrique",
  8027: "Afrique",
  120215: "Afrique",
  102611: "Afrique",
  64339: "Afrique",
  136740: "Afrique",
  617: "Afrique",
};
const reasons: Record<string, string> = {
  "moma-79802":
    "Icône postimpressionniste ; notice MoMA 79802 et inventaire 472.1941 concordants. Reproduction Commons indépendante du site MoMA.",
  "nm-NG.M.00939":
    "Version peinte de 1893 du Nasjonalmuseet, pas le pastel de 1895 ni la peinture de 1910. L’institution documente sa portée expressionniste et culturelle.",
  "artic-27992":
    "Œuvre majeure du pointillisme ; ne pas confondre la toile définitive avec les études. Bibliographie et présence au cinéma documentées dans la notice.",
  "artic-28560":
    "Deuxième version, septembre 1889, Chicago, inventaire 1926.417 ; ni Amsterdam 1888 ni la réduction d’Orsay. Audience de la composition exclue.",
  "artic-16568":
    "Tableau de 1906, Chicago, inventaire 1933.1157 ; ni la série entière, ni les panneaux de l’Orangerie. Audience de série exclue.",
  "artic-16571":
    "Toile précise de 1877, Chicago, inventaire 1933.1158 ; l’audience de la série Gare Saint-Lazare n’est pas transférée.",
  "artic-21023":
    "Bouddha monumental de Nagapattinam, période Chola ; entrée substantielle dans les guides et études institutionnels. Pas de popularité empruntée au bouddhisme.",
  "artic-24548":
    "Nataraja de la période Chola ; objet exact, pas la popularité globale de Shiva. Apporte une tradition sculpturale indienne majeure.",
  "artic-35376":
    "Cavalière Tang du VIIIe siècle ; céramique et culture chinoise, pas un substitut au paysage de Fan Kuan encore à documenter.",
  "artic-127643":
    "Paravents de Tosa Mitsuoki, XVIIe siècle ; ensemble précis, peinture japonaise distincte des estampes déjà présentes.",
  "artic-75644":
    "Pierre de couronnement de Moctezuma Xocoyotzin vers 1503 ; objet mexica identifié, distinct de la Pierre du Soleil.",
  "artic-110246":
    "Fragment de panneau maya en calcaire figurant le jeu de balle ; pas un vase. La notice API date 650–700, tandis que son commentaire évoque la fin du VIIIe siècle : datation à réexaminer, identité d’objet stable (1965.407).",
  "artic-187528":
    "Tête fang, inventaire 2006.127 ; objet exact déclaré domaine public. Importance contextualisée, jamais déduite de la seule étiquette culturelle.",
  "artic-102611":
    "Poteau de véranda d’Olowe of Ise, palais d’Ikere ; auteur identifié mort en 1938, bibliographie et expositions documentées.",
  "artic-64339":
    "Cercueil de Paankhaenamun, XXIIe dynastie ; intérêt funéraire et pictural. Sujet sensible : restes humains et contexte de provenance à respecter.",
  "met-320053":
    "Mangaaka exact du Met, 2008.30, Q81384323 ; pas le groupe général des minkisi. La politique Open Access couvre cette reproduction.",
  "met-313680":
    "Moai kavakava du Met, figure en bois rapanui du XIXe siècle ; ni le groupe des moai monumentaux ni une photo de site. Priorité pour l’Océanie.",
};
const score = await createScorer();
Object.assign(evidenceHashes, score.referenceFiles);
const implementationHashes: Record<string, string> = {};
for (const folder of [
  "src/rarity-engine",
  "scripts/masterpieces",
  "scripts/rarity-v2",
  "scripts/review",
]) {
  for (const name of (await readdir(folder))
    .filter((name) => name.endsWith(".ts"))
    .sort()) {
    const file = `${folder}/${name}`;
    implementationHashes[file] = sha256(await readFile(file));
  }
}
const candidates: any[] = [];
const objects = await json(`${dir}/objects.json`);
function paragraphs(v: unknown) {
  return typeof v === "string" && v.trim()
    ? [
        ...new Set(
          v
            .split(/\n\s*\n/)
            .map(plain)
            .filter(Boolean),
        ),
      ]
    : null;
}
async function add(input: ArtworkInput, meta: any, imageSource: string | null) {
  if (
    catalog.works.some(
      (w: ReviewArtwork) => w.id === input.id || w.sourceUrl === meta.sourceUrl,
    )
  )
    throw Error(`Doublon exact : ${input.id}`);
  const proposal = score(input);
  const why =
    reasons[input.id] ??
    "Notice institutionnelle exacte ; intérêt de comparaison par l’auteur, la technique, la période ou le contexte. La sélection éditoriale ne constitue pas une mesure de notoriété.";
  const selected = recommended.has(input.id);
  if (selected && meta.rights.status !== "cleared")
    throw Error(`Image non approuvée : ${input.id}`);
  candidates.push({
    id: input.id,
    title: input.title,
    originalTitle: meta.originalTitle ?? input.title,
    aliases: meta.aliases ?? [],
    creator: input.creator,
    date: input.displayDate,
    region: meta.region,
    medium: input.medium,
    family: meta.family,
    context: input.context,
    institution: meta.institution,
    sourceUrl: meta.sourceUrl,
    institutionalId: meta.institutionalId,
    inventoryNumber: meta.inventoryNumber,
    wikidataId: meta.wikidataId ?? null,
    identity: input.identity,
    versionNote: why,
    rights: meta.rights,
    recommended: selected,
    selectionStatus: "reexamine",
    selectionHistory: [],
    rationale: why,
    proposal,
    scoreInput: input,
    imageSource: meta.rights.status === "cleared" ? imageSource : null,
  });
}
for (const entry of objects.records) {
  const c = await capture(entry.evidenceFile);
  const r: any =
    entry.provider === "artic" ? (c.payload as any).data : c.payload;
  const a = entry.provider === "artic",
    id = `${entry.provider}-${entry.id}`;
  const institution = a
    ? "The Art Institute of Chicago"
    : "The Metropolitan Museum of Art";
  const sourceUrl = a ? `https://www.artic.edu/artworks/${r.id}` : r.objectURL;
  const inventory = a ? r.main_reference_number : r.accessionNumber;
  const type = a ? r.artwork_type_title : r.classification;
  const category = /Painting|Drawing|Print/i.test(type)
    ? "painting"
    : /Sculpture/i.test(type)
      ? "sculpture"
      : /Ceramic|Vessel|Pottery|Wood-Implements/i.test(type)
        ? "decorative"
        : "other";
  const start = a ? r.date_start : r.objectBeginDate,
    end = a ? r.date_end : r.objectEndDate;
  const region = a
    ? (world[entry.id] ?? "Europe")
    : entry.id === 320053
      ? "Afrique"
      : /Atauro/.test(r.culture)
        ? "Asie"
        : "Océanie";
  const creator = a ? r.artist_title : r.artistDisplayName;
  const anonymous =
    !creator ||
    /peoples|artist and nganga/i.test(creator) ||
    /^(Fang|Maya|Moche|Chimú|Mexica \(Aztec\)|Ancient Egyptian|Khmer|Kota|Baga|Chokwe)$/.test(
      creator,
    );
  const citations = a ? paragraphs(r.publication_history) : null,
    exhibitions = a ? paragraphs(r.exhibition_history) : null;
  // Identity match requires an exact institution identifier or accession number; a title alone never authorizes audience transfer.
  const found = Object.entries(entities).find(([, e]) =>
    a
      ? val(e, "P4610").includes(String(entry.id)) ||
        (val(e, "P217").includes(inventory) &&
          val(e, "P195").some((v: any) => v.id === "Q239303"))
      : false,
  );
  const qid = a
    ? found?.[0]
    : (r.objectWikidata_URL?.match(/Q\d+$/)?.[0] ?? undefined);
  const creatorQid = anonymous
    ? undefined
    : found
      ? val(found[1], "P170")[0]?.id
      : Object.entries(collected.related).find(
          ([, e]) => label(e) === creator,
        )?.[0];
  const publicDomain = a
    ? r.is_public_domain === true
    : r.isPublicDomain === true;
  const remote = a
    ? r.image_id
      ? `https://www.artic.edu/iiif/2/${r.image_id}/full/!1000,1000/0/default.jpg`
      : null
    : r.primaryImageSmall || r.primaryImage || null;
  const status =
    publicDomain && remote && !r.copyright_notice
      ? "cleared"
      : "rights_review_required";
  const rights = {
    status,
    artwork: publicDomain
      ? "Institution déclare l’objet dans le domaine public ; ancienneté et auteur/attribution contrôlés pour la sélection."
      : "Domaine public non établi pour cette utilisation ; ne pas inférer une protection ou liberté universelle.",
    image:
      status === "cleared"
        ? "CC0 / Open Access institutionnel, usages commerciaux compris."
        : "Licence libre non établie ; aucune image téléchargée ou publiée.",
    license: status === "cleared" ? "CC0" : "Non établie",
    licenseUrl: a
      ? "https://www.artic.edu/open-access/open-access-images"
      : "https://www.metmuseum.org/about-the-met/policies-and-documents/open-access",
    credit: `${creator || r.culture || r.artist_display}. ${r.title}, ${a ? r.date_display : r.objectDate}. ${institution}. ${inventory}.`,
    evidenceFiles: [entry.evidenceFile],
    jurisdiction:
      "Vérification documentaire, pas avis juridique universel. Respecter droits moraux, provenance et éventuelles restrictions culturelles ; réexaminer avant exploitation dans une autre juridiction.",
  };
  const input: ArtworkInput = {
    id,
    title: plain(r.title),
    creator:
      anonymous && creator
        ? `Artiste non identifié (${creator})`
        : creator || "Artiste non identifié",
    creatorMode: anonymous ? "anonymous" : "identified",
    category: end < 500 ? "antiquity" : category,
    medium: plain(a ? r.medium_display : r.medium),
    displayDate: a ? r.date_display : r.objectDate,
    yearStart: start,
    yearEnd: end,
    institution: entry.provider,
    context: a ? plain(r.artist_display || r.place_of_origin) : r.culture,
    externalIds: [
      { provider: entry.provider, id: String(entry.id) },
      ...(qid ? [{ provider: "wikidata", id: qid }] : []),
    ],
    identity: {
      status: "verified",
      confidence: 0.97,
      reasons: [
        "Notice complète officielle et identifiant exact ; inventaire, auteur/contexte, période et type examinés. QID absent ou audience non concordante laissés absents.",
      ],
    },
    activeLevel: 0,
    exploratoryScore: null,
    institutionEvidence: [ev(c, entry.evidenceFile)],
    workAudience: await audience(qid, "artwork"),
    artistAudiences: creatorQid
      ? [await audience(creatorQid, "creator")].filter((v) => v.length)
      : [],
    audienceScope: "exact_object",
    institutionSignals: {
      collectionVerified: true,
      publicRecord: true,
      highlight: a
        ? citations?.some((v) =>
            /Highlights|Essential Guide|100 Masterpieces/i.test(v),
          )
          ? true
          : null
        : typeof r.isHighlight === "boolean"
          ? r.isHighlight
          : null,
      citations: citations?.map((text) => ({ key: text, text })) ?? null,
      exhibitions: exhibitions?.map((title) => ({ key: title, title })) ?? null,
      educationText: a ? (r.description ? plain(r.description) : null) : null,
    },
    editorial: {},
  };
  await add(
    input,
    {
      institution,
      sourceUrl,
      inventoryNumber: inventory,
      institutionalId: String(entry.id),
      wikidataId: qid,
      region,
      family:
        input.category === "antiquity"
          ? "Antiquité"
          : category === "painting"
            ? "Peinture"
            : category === "sculpture"
              ? "Sculpture"
              : "Arts décoratifs",
      rights,
    },
    remote,
  );
}
const commons = await capture(official.imagesFile);
const images = (commons.payload as any).query.pages;
for (const item of [
  {
    id: "moma-79802",
    title: "La Nuit étoilée",
    originalTitle: "The Starry Night",
    creator: "Vincent van Gogh",
    creatorQid: "Q5582",
    qid: "Q45585",
    date: "Saint-Rémy, juin 1889",
    year: 1889,
    death: 1890,
    institution: "The Museum of Modern Art",
    inventory: "472.1941",
    museumId: "79802",
    url: "https://www.moma.org/collection/works/79802",
    file: "File:Van Gogh - Starry Night - Google Art Project.jpg",
    medium: "Huile sur toile",
    context: "Postimpressionnisme, Saint-Rémy-de-Provence",
  },
  {
    id: "nm-NG.M.00939",
    title: "Le Cri — version de 1893",
    originalTitle: "Skrik",
    creator: "Edvard Munch",
    creatorQid: "Q41406",
    qid: "Q18891156",
    date: "1893",
    year: 1893,
    death: 1944,
    institution: "Nasjonalmuseet",
    inventory: "NG.M.00939",
    museumId: "NG.M.00939",
    url: "https://www.nasjonalmuseet.no/en/collection/object/NG.M.00939",
    file: "File:Edvard Munch, 1893, The Scream, oil, tempera and pastel on cardboard, 91 x 73 cm, National Gallery of Norway.jpg",
    medium: "Tempera et crayon gras sur carton",
    context: "Symbolisme et expressionnisme, Norvège",
  },
]) {
  const image = images.find((p: any) => p.title === item.file)?.imageinfo?.[0];
  if (
    !image ||
    image.extmetadata?.LicenseShortName?.value !== "Public domain" ||
    !image.extmetadata?.Categories?.value.includes("PD-Art") ||
    item.death > 1955 ||
    !/^https:\/\/(upload|thumb)\.wikimedia\.org\//.test(image.thumburl ?? "")
  )
    throw Error(`Licence plane non vérifiée : ${item.id}`);
  let institutionEvidence: Evidence;
  if (item.id === "moma-79802") {
    const file = `${dir}/moma-starry-night.json`,
      bytes = await readFile(file),
      m = JSON.parse(bytes.toString());
    evidenceHashes[file] = sha256(bytes);
    if (
      m.record.ObjectID !== "79802" ||
      m.record.AccessionNumber !== item.inventory ||
      m.record.Artist !== item.creator
    )
      throw Error("MoMA non concordant");
    institutionEvidence = {
      id: sha256(bytes).slice(0, 24),
      provider: "moma",
      independentGroup: "moma",
      url: m.url,
      retrievedAt: m.retrievedAt,
      file,
      sha256: sha256(bytes),
      tier: 1,
      scope: "artwork",
    };
  } else {
    const p = official.pages.find((p: any) => p.url === item.url),
      bytes = await readFile(p.path),
      s = JSON.parse(bytes.toString());
    evidenceHashes[p.path] = sha256(bytes);
    if (
      s.httpStatus !== 200 ||
      !s.text.includes(item.inventory) ||
      !s.text.includes("1893")
    )
      throw Error("Notice du Cri absente");
    institutionEvidence = {
      id: sha256(bytes).slice(0, 24),
      provider: "nasjonalmuseet",
      independentGroup: "nasjonalmuseet",
      url: item.url,
      retrievedAt: s.retrievedAt,
      file: p.path,
      sha256: sha256(bytes),
      tier: 1,
      scope: "artwork",
    };
  }
  const input: ArtworkInput = {
    id: item.id,
    title: item.title,
    creator: item.creator,
    creatorMode: "identified",
    category: "painting",
    medium: item.medium,
    displayDate: item.date,
    yearStart: item.year,
    yearEnd: item.year,
    institution: item.id.startsWith("moma") ? "moma" : "nasjonalmuseet",
    context: item.context,
    externalIds: [
      { provider: "wikidata", id: item.qid },
      { provider: "museum", id: item.museumId },
    ],
    identity: {
      status: "verified",
      confidence: 0.99,
      reasons: [
        "Auteur, date, inventaire et institution concordants ; reproduction plane identifiée séparément.",
      ],
    },
    activeLevel: 0,
    exploratoryScore: null,
    institutionEvidence: [institutionEvidence],
    workAudience: await audience(item.qid, "artwork"),
    artistAudiences: [await audience(item.creatorQid, "creator")].filter(
      (v) => v.length,
    ),
    audienceScope: "exact_object",
    institutionSignals: {
      collectionVerified: true,
      publicRecord: true,
      highlight: null,
      citations: null,
      exhibitions: null,
      educationText: null,
    },
    editorial: {},
  };
  await add(
    input,
    {
      originalTitle: item.originalTitle,
      aliases: [item.originalTitle],
      institution: item.institution,
      sourceUrl: item.url,
      institutionalId: item.museumId,
      inventoryNumber: item.inventory,
      wikidataId: item.qid,
      region: "Europe",
      family: "Peinture",
      rights: {
        status: "cleared",
        artwork: `Auteur mort en ${item.death} ; durée ordinaire vie + 70 expirée en France/UE. Œuvre publiée au XIXe siècle.`,
        image:
          "Reproduction fidèle d’une œuvre plane, déclaration PD-Art/Public domain sur le fichier exact Commons ; pas de photo de salle.",
        license: "Domaine public · PD-Art",
        licenseUrl: image.descriptionurl,
        credit: `${item.creator}, ${item.originalTitle}, ${item.date}. ${item.institution}. Reproduction : Commons / ${plain(image.extmetadata.Credit?.value ?? "")}.`,
        evidenceFiles: [official.imagesFile, institutionEvidence.file],
        jurisdiction:
          "PD-Art non uniformément reconnu partout. Usage documenté France/UE et États-Unis ; réexaminer les droits voisins avant extension à une autre juridiction.",
      },
    },
    image.thumburl,
  );
}
if (
  candidates.length < 50 ||
  candidates.filter((c) => c.recommended).length !== 25
)
  throw Error("Lot incomplet");
const works: ReviewArtwork[] = candidates
  .filter((c) => c.recommended)
  .sort((a, b) => {
    const priority = ["moma-79802", "artic-27992", "nm-NG.M.00939"];
    const rank = (id: string) =>
      priority.includes(id) ? priority.indexOf(id) : 3;
    return rank(a.id) - rank(b.id);
  })
  .map((c) => ({
    id: c.id,
    title: c.title,
    creator: c.creator,
    date: c.date,
    medium: c.medium,
    context: c.context,
    family: c.family,
    institution: c.institution,
    sourceUrl: c.sourceUrl,
    imageUrl: `/masterpieces-images/${c.id}.webp`,
    license: `${c.rights.license} · ${c.rights.credit}`,
    origin: "new",
    activeLevel: null,
    proposal: c.proposal,
  }));
const version = `masterpieces-${sha256(JSON.stringify(candidates)).slice(0, 16)}`;
const distribution = (scores: number[]) =>
  REVIEW_RARITIES.map((rarity, i) => ({
    rarity,
    count: scores.filter((n) => n === i).length,
  }));
const summary = {
  researchedExactObjects: candidates.length,
  recommended: works.length,
  rightsReviewRequired: candidates.filter((c) => c.rights.status !== "cleared")
    .length,
  eligibleNotSelected: candidates.filter(
    (c) => c.rights.status === "cleared" && !c.recommended,
  ).length,
  regions: Object.fromEntries(
    [
      ...new Set(candidates.filter((c) => c.recommended).map((c) => c.region)),
    ].map((region) => [
      region,
      candidates.filter((c) => c.recommended && c.region === region).length,
    ]),
  ),
  before: distribution(
    catalog.works.map((w: ReviewArtwork) => w.proposal.level),
  ),
  additions: distribution(works.map((w) => w.proposal.level)),
  afterSimulation: distribution(
    [...catalog.works, ...works].map((w) => w.proposal.level),
  ),
  humanReview: audit.humanReview,
  activeDistributionUnchanged: [43, 39, 14, 3, 1],
};
const preview = {
  schemaVersion: 1,
  version,
  algorithmVersion: score.algorithmVersion,
  configurationVersion: score.configurationVersion,
  method:
    "V2 inchangé, poids 25/20/25/20/10, seuils 40/60/75/90 ; pairs historiques fixes non imputés ; aucune activation. Audiences exactes 2025-10 à 2026-09, anglais seulement lorsqu’elles sont disponibles.",
  works,
};
await mkdir("public/masterpieces-data", { recursive: true });
await writeFile(
  "masterpieces-import-preview.json",
  JSON.stringify(preview, null, 2) + "\n",
);
await writeFile(
  "masterpieces-candidates.json",
  JSON.stringify(
    {
      schemaVersion: 1,
      version,
      summary,
      protectedInputs: before,
      originalCatalogSha256: sha256(
        await readFile("public/review-data/catalog.json"),
      ),
      evidenceHashes,
      implementationHashes,
      candidates,
      unverifiedLeads: leads.leads,
      note: "Les pistes non rapprochées ne comptent pas parmi les objets exacts vérifiés. Statut initial reexamine ; recommandation éditoriale distincte d’une acceptation humaine. Aucune décision utilisateur copiée dans les assets publics.",
    },
    null,
    2,
  ) + "\n",
);
await writeFile(
  "public/masterpieces-data/catalog.json",
  JSON.stringify(
    {
      ...preview,
      summary: { ...summary, humanReview: undefined },
      candidates: candidates.map(({ scoreInput, imageSource, ...c }) => c),
    },
    null,
    2,
  ) + "\n",
);
const rows = candidates
  .map(
    (c) =>
      `| ${c.id} | [${c.title.replaceAll("|", "/")}](${c.sourceUrl}) | ${c.creator} | ${c.region} | ${c.proposal.score.toFixed(1)} / ${REVIEW_RARITIES[c.proposal.level]} | ${(c.proposal.confidence * 100).toFixed(0)} % | ${c.recommended ? "**Recommandée**" : c.rights.status === "cleared" ? "Admissible, différée" : "Droits à vérifier"} |`,
  )
  .join("\n");
await writeFile(
  "masterpieces-candidates.md",
  `# MUSE — Nouvelles candidates\n\n${candidates.length} objets exacts vérifiés, ${works.length} recommandations publiables, ${summary.rightsReviewRequired} cas bloqués pour les images. Les autres pistes restent explicitement non vérifiées. Aucun ajout au jeu.\n\n## Méthode et limites\n\nV2 2.0.0, P/A/H/M/C = 25/20/25/20/10, seuils 40/60/75/90. Aucun bonus nominal, aucun score ajusté pour atteindre 90. Scores et intervalles détaillés, données d’entrée et empreintes des preuves dans le JSON. Les pairs sont les 100 historiques non imputés ; les nouvelles cibles ne se normalisent pas entre elles. Audiences anglaises sur 12 mois complets (octobre 2025–septembre 2026) uniquement pour les identités exactes concordantes, jamais une série ni une civilisation. Les erreurs de collecte ne valent pas zéro. Les champs absents sont estimés via V2. Les références bibliographiques et expositions institutionnelles sont découpées par paragraphes et dédupliquées ; ce sont des proxies, pas une validation indépendante de chaque publication.\n\nLes scores parfois bas des icônes reflètent les manques de collecte (notamment audiences exactes, références structurées, contexte d’auteur) et les priors prudents, pas un jugement concluant d’insignifiance. M mesure les signaux documentés, pas le prestige du nom du musée. Amélioration future : collecter les pages exactes multilingues et les bibliographies manquantes, puis recalculer en simulation ; ne pas modifier les seuils pour cette liste. Tous les résultats restent soumis à validation et le statut de chaque proposition est explicite.\n\n## Sélection et diversité\n\n${JSON.stringify(summary.regions)}. La sélection mêle icônes reconnues et objets de référence pour élargir les traditions représentées ; ne pas présenter tous ces objets comme également célèbres. Les identifiants muséaux sont la référence ; Wikidata absent est conservé null. Les œuvres anonymes n’héritent pas de l’audience entière de leur culture.\n\n## Préservation et distributions\n\nCatalogue de 1000 inchangé : **161/741/94/2/2**. Jeu actif inchangé : **43/39/14/3/1**. Choix humains : **722 revues, 278 non revues**, distribution **393/213/78/34/4**, aucune application automatique. Ajouts V2 : **${summary.additions.map((x) => x.count).join("/")}** ; simulation sur 1025 propositions : **${summary.afterSimulation.map((x) => x.count).join("/")}**. Cette simulation n’est pas une distribution humaine après import.\n\n## Objets examinés\n\n| Identifiant | Œuvre / source officielle | Auteur | Région culturelle | Score V2 / niveau | Confiance | Suite |\n|---|---|---|---|---|---|---|\n${rows}\n\n## Versions, doublons et priorités\n\n${candidates
    .filter((c) => c.recommended)
    .map(
      (c) =>
        `- **${c.title}** (${c.inventoryNumber}) : ${c.rationale} ${c.proposal.criteria.P.type === "estimated" ? "P estimé faute d’audience exacte exploitable ; pas une observation de faible popularité." : "P dérivé d’une audience exactement rapprochée."}`,
    )
    .join(
      "\n",
    )}\n\nLa Grande Vague (45434), La Joconde et Fuji rouge (cma-111654) sont déjà présents et exclus. Les Tournesols ne sont pas ajoutés : choisir et vérifier une version précise reste nécessaire. Les Nymphéas retenus sont le tableau de 1906 à Chicago ; la Chambre est la deuxième version de 1889 ; le Cri est NG.M.00939 / Q18891156, distinct du sujet général Q471379. Les figures moai en bois ne sont pas le groupe des statues monumentales. Contrôle automatique des identifiants et URLs exacts ; contrôle manuel des séries/versions citées.\n\n## Reproduction et futur import\n\nDepuis la racine :\n\n    npx tsx scripts/masterpieces/audit.ts\n    npx tsx scripts/masterpieces/build.ts\n    npx tsx scripts/masterpieces/images.ts\n    npm test\n    npm run build:atelier\n    npm run deploy:atelier\n\nLe build des rapports est hors réseau ; images.ts refuse tout objet non recommandé ou sans droits établis. Le déploiement ne vise que l’atelier. Pour une revue locale : ouvrir /masterpieces.html. Exporter les choix avec le format muse-masterpieces-review, séparé des décisions du millier. **Aucune commande d’import dans le jeu n’est fournie** : sa migration requiert une validation et un mapping vers CatalogDataset, pas une copie du preview. Le preview réutilise ReviewArtwork mais n’est volontairement pas accepté par parseReviewCatalog (contrat figé de 1000).\n`,
);
await writeFile(
  "masterpieces-rights-review.md",
  `# Droits — nouvelles candidates MUSE\n\nVérification documentaire au 30 octobre 2026 ; ce document ne remplace pas un avis juridique mondial. Les droits de l’objet et de la reproduction sont séparés. Seules les 25 recommandations dont status=cleared peuvent produire une image publique.\n\n## Sources et règles\n\nChicago : is_public_domain=true dans la notice complète et politique CC0 [officielle](https://www.artic.edu/open-access/open-access-images), qui inclut les usages commerciaux mais réserve les droits tiers. Met : isPublicDomain=true et reproduction fournie dans Open Access [politique](https://www.metmuseum.org/about-the-met/policies-and-documents/open-access). Les auteurs identifiés des recommandations sont morts depuis plus de 70 ans ; objets anciens/anonymes identifiés par période et contexte. Les fichiers Commons des deux tableaux sont des reproductions planes fidèles avec déclaration PD-Art, pas une photographie de sculpture ou de salle. Van Gogh mort en 1890, Munch en 1944 ; durées ordinaires France/UE expirées. Une disponibilité Commons ne suffit jamais pour Picasso, Hopper ou des artistes protégés.\n\nLes refus institutionnels ne prouvent pas forcément que l’œuvre est protégée dans tous les pays ; ils suffisent ici à suspendre la reproduction. Ainsi American Gothic reste bloqué malgré des déclarations Commons plus permissives. Les restrictions de photographie, droits voisins, droits moraux, patrimoine culturel, restitution et sensibilités rituelles ou funéraires demandent une lecture séparée. L’Open Access n’éteint pas ces enjeux. Le cercueil égyptien et les figures rituelles gardent leur attribution et leur source.\n\n## Recommandations avec images autorisées\n\n${candidates
    .filter((c) => c.recommended)
    .map(
      (c) =>
        `- **${c.title}** — ${c.rights.artwork} ${c.rights.image} [Déclaration](${c.rights.licenseUrl}). Crédit : ${c.rights.credit}`,
    )
    .join(
      "\n",
    )}\n\n## Objets exacts sans licence d’image établie\n\n${candidates
    .filter((c) => c.rights.status !== "cleared")
    .map(
      (c) =>
        `- **${c.title}** (${c.id}, ${c.inventoryNumber}) — rights_review_required. [Notice](${c.sourceUrl}). Métadonnées seulement ; aucun fichier image téléchargé ou vignette publié.`,
    )
    .join(
      "\n",
    )}\n\n## Pistes supplémentaires non autorisées\n\nGuernica, Les Demoiselles d’Avignon, Kahlo, Dalí, Magritte et autres modernes : droits territoriaux à examiner, pas de reproduction. Le fichier Commons « Mural del Guernica » représente une autre réalisation et ne remplace pas le tableau original. Botticelli et Michel-Ange : domaine public de l’œuvre ne résout pas toutes les règles italiennes de reproduction du patrimoine ; pas d’image importée dans ce lot. Fan Kuan, A’a et Cleopatra d’Edmonia Lewis : pistes institutionnelles conservées, rapprochements d’image exacts encore à compléter ; non inclus dans les 25. La notice Smithsonian annonce une reproduction libre, mais le QID obtenu initialement ne correspondait pas avec certitude à la sculpture. Aucun transfert de droits entre homonymes.\n\nLes preuves de licence, URLs de fichiers exacts, empreintes et données d’entrée sont dans masterpieces-candidates.json et catalog/masterpieces/. Les rasters ne sont téléchargés qu’après génération du rapport d’approbation, puis leurs empreintes et transformations sont consignées dans image-manifest.json.\n`,
);
if (
  JSON.stringify(before) !==
  JSON.stringify(await assertProtectedInputs(process.cwd()))
)
  throw Error("Entrées protégées modifiées");
console.log(JSON.stringify({ version, summary }, null, 2));
