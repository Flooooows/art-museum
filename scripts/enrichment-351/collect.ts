import { readFile, writeFile, mkdir } from "node:fs/promises";
import { DiskCaptureStore, JsonCaptureClient, sha256 } from "../rarity-v2/http";

const directory = "catalog/enrichment-351";
await mkdir(directory, { recursive: true });
const input = JSON.parse(
  await readFile("muse_oeuvres_candidates.json", "utf8"),
);
if (input.artworks.length !== 351)
  throw Error("Les 351 entrées attendues ne sont pas présentes.");
const client = new JsonCaptureClient({
  store: new DiskCaptureStore(`${directory}/cache`),
  offline: !process.argv.includes("--live"),
  minimumIntervalMs: 6000,
  timeoutMs: 60000,
  maximumRetryAfterMs: 240000,
  userAgent:
    "MUSE-Catalogue-351/1.0 (identity and licence metadata research; no image download)",
});
async function request(provider: string, url: string) {
  let result = await client.request(provider, url);
  if (
    result.status === "rate_limited" &&
    result.retryAt &&
    Date.parse(result.retryAt) - Date.now() <= 240000
  )
    result = await client.request(provider, url);
  if (result.status !== "available")
    await writeFile(
      `${directory}/last-collection-error.json`,
      JSON.stringify(result, null, 2) + "\n",
    );
  return result;
}
const overrides: Record<string, string> = {
  "0002": "La Cène (Léonard de Vinci)",
  "0004": "La Vierge aux rochers",
  "0007": "L'Annonciation (Léonard de Vinci)",
  "0010": "L'Adoration des mages (Botticelli)",
  "0012": "La Création d'Adam",
  "0013": "Le Jugement dernier (Michel-Ange)",
  "0014": "Pietà (Michel-Ange)",
  "0015": "David (Michel-Ange)",
  "0016": "Moïse (Michel-Ange)",
  "0019": "La Transfiguration (Raphaël)",
  "0025": "L'Assomption de la Vierge (Titien)",
  "0026": "Vénus au miroir (Titien)",
  "0030": "L'Agneau mystique",
  "0034": "La Tentation de saint Antoine (Bosch)",
  "0035": "La Tour de Babel (Brueghel)",
  "0037": "Les Proverbes flamands",
  "0039": "Le Repas de noce",
  "0040": "Le Lièvre (Dürer)",
  "0041": "Mains en prière",
  "0043": "Rhinocéros de Dürer",
  "0044": "Autoportrait à vingt-huit ans",
  "0046": "Portrait d'Henri VIII (Holbein)",
  "0052": "Annonciation (Fra Angelico, San Marco)",
  "0058": "L'Été (Arcimboldo)",
  "0060": "Les Tricheurs (Le Caravage)",
  "0061": "La Mise au tombeau (Le Caravage)",
  "0062": "Judith décapitant Holopherne (Le Caravage)",
  "0063": "Bacchus (Le Caravage)",
  "0064": "Judith décapitant Holopherne (Artemisia Gentileschi, Florence)",
  "0065": "Suzanne et les Vieillards (Artemisia Gentileschi, Pommersfelden)",
  "0066": "Autoportrait en allégorie de la Peinture",
  "0074": "Vue de Delft",
  "0081": "Vénus à son miroir",
  "0083": "La Descente de croix (Rubens)",
  "0086": "L'Enlèvement des Sabines (Poussin)",
  "0089": "Agnus Dei (Zurbarán)",
  "0092": "Pèlerinage à l'île de Cythère",
  "0097": "Marie-Antoinette à la rose",
  "0102": "Bonaparte franchissant le Grand-Saint-Bernard",
  "0104": "Les Trois Grâces (Canova)",
  "0106": "Tres de mayo",
  "0109": "Le Chien (Goya)",
  "0120": "Le Dernier Voyage du Téméraire",
  "0123": "L'Incendie de la Chambre des lords et des communes",
  "0131": "La Vague (Courbet)",
  "0137": "Olympia (Manet)",
  "0138": "Un bar aux Folies Bergère",
  "0141": "Le Gulf Stream",
  "0142": "Snap the Whip",
  "0144": "Madame X (Sargent)",
  "0146": "Arrangement en gris et noir no 1",
  "0147": "Nocturne en noir et or : la fusée qui retombe",
  "0148": "Impression, soleil levant",
  "0149": "La Femme à l'ombrelle",
  "0150": "La Gare Saint-Lazare (Monet)",
  "0152": "Le Pont japonais (Monet)",
  "0154": "Les Meules",
  "0155": "Cathédrales de Rouen (série de Monet)",
  "0156": "Les Nymphéas",
  "0159": "La Loge (Renoir)",
  "0160": "Les Grandes Baigneuses (Renoir)",
  "0161": "La Classe de danse",
  "0162": "L'Étoile (Degas)",
  "0165": "Le Berceau (Morisot)",
  "0166": "Jour d'été",
  "0167": "Le Bain de l'enfant",
  "0168": "Dans la loge (Cassatt)",
  "0172": "Un dimanche après-midi à l'Île de la Grande Jatte",
  "0173": "Une baignade à Asnières",
  "0175": "La Nuit étoilée",
  "0176": "Les Tournesols",
  "0177": "La Chambre de Van Gogh à Arles",
  "0178": "Terrasse du café le soir",
  "0182": "Champ de blé avec cyprès",
  "0186": "Les Joueurs de cartes",
  "0187": "Montagne Sainte-Victoire (Cézanne)",
  "0188": "Les Grandes Baigneuses (Cézanne)",
  "0193": "Au Moulin-Rouge",
  "0194": "Moulin-Rouge - La Goulue",
  "0196": "Le Rêve (Rousseau)",
  "0198": "Rue de Paris, temps de pluie",
  "0200": "Le Cri",
  "0201": "Madone (Munch)",
  "0203": "Le Baiser (Klimt)",
  "0205": "Judith et Holopherne (Klimt)",
  "0209": "La Danse (Matisse)",
  "0210": "La Musique (Matisse)",
  "0212": "La Desserte rouge",
  "0213": "Le Bonheur de vivre",
  "0214": "Jazz (Matisse)",
  "0217": "Composition VIII",
  "0218": "Jaune-rouge-bleu",
  "0221": "Composition avec rouge, bleu et jaune",
  "0224": "Carré noir sur fond blanc",
  "0225": "Carré blanc sur fond blanc",
  "0226": "Composition suprématiste",
  "0227": "Les Dix Plus Grands",
  "0228": "Le Cygne (Hilma af Klint)",
  "0230": "La Machine à gazouiller",
  "0231": "Senecio (Klee)",
  "0235": "Prismes électriques",
  "0237": "La Ville (Léger)",
  "0239": "L'Oiseau dans l'espace",
  "0240": "Le Baiser (Brâncuși)",
  "0242": "Nu couché (Modigliani)",
  "0246": "La Colonne brisée",
  "0247": "Autoportrait au collier d'épines et colibri",
  "0248": "Autoportrait aux cheveux coupés",
  "0249": "L'Hôpital Henry-Ford",
  "0250": "L'Homme contrôleur de l'univers",
  "0253": "Le Fuji par temps clair",
  "0254": "Orage sous le sommet",
  "0255": "Le Rêve de la femme du pêcheur",
  "0256": "Averse soudaine sur le pont Shin-Ōhashi et Atake",
  "0258": "Les Cinquante-trois Stations du Tōkaidō",
  "0259": "Cent vues d'Edo",
  "0260": "Trois Beautés de notre temps",
  "0261": "Ōtani Oniji III dans le rôle du valet Edobei",
  "0265": "Le Jour de Qingming au bord de la rivière",
  "0266": "Rouleau des conseils aux monitrices du palais",
  "0267": "Voyageurs parmi les montagnes et les ruisseaux",
  "0268": "Début du printemps",
  "0269": "Le Jour de Qingming au bord de la rivière",
  "0271": "Le Mont Lu",
  "0273": "Jahangir préférant un cheikh soufi à des rois",
  "0276": "Discobole",
  "0277": "Groupe du Laocoon",
  "0278": "Auguste de Prima Porta",
  "0280": "Hermès portant Dionysos enfant",
  "0284": "Palette de Narmer",
  "0286": "Khéphren assis",
  "0289": "Code de Hammurabi",
  "0293": "Les Très Riches Heures du duc de Berry",
  "0294": "La Dame à la licorne",
  "0295": "La Chasse à la licorne",
  "0300": "Chapiteau aux lions d'Ashoka",
  "0302": "Masque de Pakal",
  "0303": "Pierre du Soleil",
  "0307": "Le Penseur",
  "0308": "Le Baiser (Rodin)",
  "0311": "La Valse (Claudel)",
  "0314": "La Petite Danseuse de quatorze ans",
  "0316": "Point de vue du Gras",
  "0318": "The Open Door (photographie)",
  "0322": "Sallie Gardner at a Gallop",
  "0325": "The Steerage",
  "0332": "Gismonda (affiche)",
  "0339": "The Peacock Skirt",
  "0341": "Strawberry Thief",
  "0347": "Sagrada Família",
  "0348": "Casa Batlló",
  "0349": "Parc Güell",
  "0350": "Hôtel Tassel",
};
const query = (base: string, params: Record<string, string>) => {
  const u = new URL(base);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.toString();
};
const titles = [
  ...new Set(
    input.artworks
      .map((a: any) => overrides[a.id.slice(-4)] ?? a.title)
      .concat(input.artworks.map((a: any) => a.artist)),
  ),
] as string[];
const pages: Record<string, any> = {},
  captures: string[] = [];
for (let i = 0; i < titles.length; i += 30) {
  const r = await request(
    "wikimedia",
    query("https://fr.wikipedia.org/w/api.php", {
      action: "query",
      format: "json",
      formatversion: "2",
      redirects: "1",
      prop: "pageprops|info",
      inprop: "url",
      titles: titles.slice(i, i + 30).join("|"),
    }),
  );
  if (r.status !== "available") throw Error(`Pages : ${r.status}`);
  const p: any = r.payload;
  const aliases = new Map<string, string>(
    [...(p.query.normalized ?? []), ...(p.query.redirects ?? [])].map(
      (a: any) => [a.from, a.to],
    ),
  );
  for (const title of titles.slice(i, i + 30)) {
    let resolved = title;
    const seen = new Set();
    while (aliases.has(resolved) && !seen.has(resolved)) {
      seen.add(resolved);
      resolved = aliases.get(resolved)!;
    }
    const found = p.query.pages.find((p: any) => p.title === resolved);
    pages[title] = {
      ...found,
      evidenceFile: `${directory}/cache/${sha256(r.url)}.json`,
    };
  }
  captures.push(`${directory}/cache/${sha256(r.url)}.json`);
}
await writeFile(
  `${directory}/pages.json`,
  JSON.stringify({ overrides, pages, captures }, null, 2) + "\n",
);
const qids = [
  ...new Set(
    Object.values(pages)
      .map((p) => p.pageprops?.wikibase_item)
      .filter(Boolean),
  ),
] as string[];
const entities: Record<string, any> = {};
const entityFiles: Record<string, string> = {};
async function entitiesFor(ids: string[]) {
  for (let i = 0; i < ids.length; i += 35) {
    const r = await request(
      "wikimedia",
      query("https://www.wikidata.org/w/api.php", {
        action: "wbgetentities",
        format: "json",
        ids: ids.slice(i, i + 35).join("|"),
        props: "labels|aliases|claims|sitelinks",
        languages: "fr|en",
        sitefilter: "enwiki|frwiki",
      }),
    );
    if (r.status !== "available") throw Error(`Entités : ${r.status}`);
    Object.assign(entities, (r.payload as any).entities);
    for (const id of ids.slice(i, i + 35))
      entityFiles[id] = `${directory}/cache/${sha256(r.url)}.json`;
  }
}
await entitiesFor(qids);
const values = (e: any, p: string) =>
  (e?.claims?.[p] ?? [])
    .map((c: any) => c.mainsnak?.datavalue?.value)
    .filter(Boolean);
const related = [
  ...new Set(
    Object.values(entities)
      .flatMap((e) =>
        [...values(e, "P170"), ...values(e, "P195")].map((v: any) => v.id),
      )
      .filter((v) => v && !entities[v]),
  ),
] as string[];
await entitiesFor(related);
const imageFiles = [
  ...new Set(
    qids
      .flatMap((id) => values(entities[id], "P18"))
      .filter((v) => typeof v === "string"),
  ),
] as string[];
const images: Record<string, any> = {};
for (let i = 0; i < imageFiles.length; i += 15) {
  const r = await request(
    "wikimedia",
    query("https://commons.wikimedia.org/w/api.php", {
      action: "query",
      format: "json",
      formatversion: "2",
      redirects: "1",
      prop: "imageinfo",
      iiprop: "url|extmetadata|size",
      iiurlwidth: "1600",
      titles: imageFiles
        .slice(i, i + 15)
        .map((f) => `File:${f}`)
        .join("|"),
    }),
  );
  if (r.status !== "available") throw Error(`Licences : ${r.status}`);
  for (const p of (r.payload as any).query.pages)
    images[p.title] = {
      ...p,
      evidenceFile: `${directory}/cache/${sha256(r.url)}.json`,
    };
}
await writeFile(
  `${directory}/identities.json`,
  JSON.stringify(
    {
      note: "Pistes documentaires, pas approbations. Les correspondances d’artiste, version, institution et droits doivent être examinées séparément. Aucun raster téléchargé.",
      pages,
      entities,
      entityFiles,
      images,
      captures,
      overrides,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `${input.artworks.length} entrées ; ${qids.length} entités principales, ${related.length} liées, ${imageFiles.length} métadonnées d’images. Aucune image téléchargée.`,
);
