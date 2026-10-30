import { readFile, writeFile } from "node:fs/promises";
import { DiskCaptureStore, JsonCaptureClient, sha256 } from "../rarity-v2/http";
const dir = "catalog/enrichment-351";
const client = new JsonCaptureClient({
  store: new DiskCaptureStore(`${dir}/cache`),
  offline: !process.argv.includes("--live"),
  minimumIntervalMs: 6000,
  timeoutMs: 60000,
  maximumRetryAfterMs: 180000,
  userAgent: "MUSE exact-object identity follow-up; metadata only",
});
const titles: Record<string, string> = {
  "0006": "Saint John the Baptist (Leonardo)",
  "0008": "The Birth of Venus",
  "0009": "Primavera (Botticelli)",
  "0010": "Adoration of the Magi (Botticelli, 1475)",
  "0017": "The School of Athens",
  "0018": "Sistine Madonna",
  "0020": "The Marriage of the Virgin (Raphael)",
  "0021": "La belle jardinière",
  "0026": "Venus with a Mirror (Titian)",
  "0027": "The Tempest (Giorgione)",
  "0028": "Sleeping Venus (Giorgione)",
  "0034": "The Temptation of St. Anthony (Bosch)",
  "0036": "The Hunters in the Snow",
  "0038": "The Triumph of Death",
  "0040": "Young Hare",
  "0044": "Self-Portrait (Dürer, Munich)",
  "0046": "Portrait of Henry VIII",
  "0052": "Annunciation (Fra Angelico, San Marco)",
  "0053": "Flagellation of Christ (Piero della Francesca)",
  "0054": "The Resurrection (Piero della Francesca)",
  "0055": "The Descent from the Cross (van der Weyden)",
  "0058": "The Four Seasons (Arcimboldo)",
  "0062": "Judith Beheading Holofernes (Caravaggio)",
  "0064": "Judith Slaying Holofernes (Artemisia Gentileschi, Florence)",
  "0065": "Susanna and the Elders (Artemisia Gentileschi, Pommersfelden)",
  "0066": "Self-Portrait as the Allegory of Painting",
  "0069": "The Return of the Prodigal Son (Rembrandt)",
  "0070": "Syndics of the Drapers' Guild",
  "0077": "The Lacemaker (Vermeer)",
  "0080": "The Triumph of Bacchus",
  "0083": "The Descent from the Cross (Rubens)",
  "0084": "The Three Graces (Rubens)",
  "0090": "Still Life with Lemons, Oranges and a Rose",
  "0093": "Diana Leaving her Bath",
  "0097": "Marie Antoinette with a Rose",
  "0101": "The Death of Socrates",
  "0105": "Venus Victrix (Canova)",
  "0110": "The Sleep of Reason Produces Monsters",
  "0123": "The Burning of the Houses of Lords and Commons",
  "0125": "Salisbury Cathedral from the Meadows",
  "0127": "The Turkish Bath",
  "0131": "The Wave (Courbet)",
  "0139": "The Fifer",
  "0140": "The Balcony (Manet)",
  "0142": "Snap the Whip",
  "0146": "Whistler's Mother",
  "0149": "Woman with a Parasol – Madame Monet and Her Son",
  "0150": "Gare Saint-Lazare (Monet series)",
  "0152": "Water Lilies and Japanese Bridge",
  "0155": "Rouen Cathedral (Monet series)",
  "0157": "Bal du moulin de la Galette",
  "0162": "L'Étoile (Degas)",
  "0165": "The Cradle (painting)",
  "0168": "In the Loge",
  "0169": "Boulevard Montmartre at Night",
  "0170": "The Côte des Bœufs at L'Hermitage",
  "0171": "Flood at Port-Marly",
  "0174": "The Port of Saint-Tropez",
  "0175": "The Starry Night",
  "0179": "Starry Night Over the Rhône",
  "0180": "Irises (painting)",
  "0186": "The Card Players",
  "0188": "The Large Bathers (Cézanne)",
  "0189": "Apples and Oranges (Cézanne)",
  "0197": "The Hungry Lion Throws Itself on the Antelope",
  "0201": "Madonna (Munch)",
  "0204": "Portrait of Adele Bloch-Bauer I",
  "0206": "The Tree of Life, Stoclet Frieze",
  "0207": "Death and the Maiden (Schiele)",
  "0208": "Little Dancer of Fourteen Years",
  "0209": "Dance (Matisse)",
  "0210": "Music (Matisse)",
  "0211": "Woman with a Hat",
  "0213": "Le bonheur de vivre",
  "0215": "Charing Cross Bridge (Derain)",
  "0216": "L'Estaque (Derain)",
  "0219": "Several Circles",
  "0221": "Composition with Red, Blue and Yellow",
  "0222": "Broadway Boogie Woogie",
  "0226": "Suprematist Composition",
  "0227": "The Ten Largest",
  "0228": "The Swan (Hilma af Klint)",
  "0229": "Altarpieces (Hilma af Klint)",
  "0231": "Senecio (painting)",
  "0232": "Castle and Sun",
  "0233": "Champs de Mars: The Red Tower",
  "0234": "Sun, Tower, Airplane",
  "0237": "The City (Léger)",
  "0238": "The Discs (Léger)",
  "0242": "Nu couché (Modigliani)",
  "0244": "Carcass of Beef",
  "0246": "The Broken Column",
  "0248": "Self-Portrait with Cropped Hair",
  "0249": "Henry Ford Hospital (painting)",
  "0251": "The History of Mexico (mural)",
  "0263": "Wind God and Thunder God",
  "0264": "Winter Landscape (Sesshū)",
  "0265": "Along the River During the Qingming Festival",
  "0266": "Admonitions Scroll",
  "0267": "Travelers among Mountains and Streams",
  "0268": "Early Spring (painting)",
  "0271": "Lofty Mount Lu",
  "0273": "Jahangir Preferring a Sufi Shaikh to Kings",
  "0285": "The Seated Scribe",
  "0302": "Death mask of K'inich Janaab' Pakal",
  "0314": "Little Dancer of Fourteen Years",
  "0317": "Boulevard du Temple (photograph)",
  "0318": "The Open Door (photograph)",
  "0319": "The Ladder (photograph)",
  "0320": "The Whisper of the Muse",
  "0321": "Charles Darwin (Cameron photograph)",
  "0322": "Sallie Gardner at a Gallop",
  "0326": "Winter – Fifth Avenue",
  "0327": "The Terminal",
  "0332": "Gismonda (poster)",
  "0333": "Job (Mucha)",
  "0335": "Zodiac (Mucha)",
  "0336": "Divan Japonais",
  "0337": "Jane Avril (poster)",
  "0339": "The Peacock Skirt",
  "0340": "The Climax",
  "0342": "Acanthus (ornament)",
  "0351": "Hill House chair",
};
const artistTitles = { Raphaël: "Raphael", Caravage: "Caravaggio" };
const all = [
  ...new Set([...Object.values(titles), ...Object.values(artistTitles)]),
];
const query = (base: string, p: Record<string, string>) => {
  const u = new URL(base);
  for (const [k, v] of Object.entries(p)) u.searchParams.set(k, v);
  return u.toString();
};
async function request(url: string) {
  let r = await client.request("wikimedia", url);
  if (
    r.status === "rate_limited" &&
    r.retryAt &&
    Date.parse(r.retryAt) - Date.now() <= 180000
  )
    r = await client.request("wikimedia", url);
  if (r.status !== "available") throw Error(r.status);
  return r;
}
const pages: Record<string, any> = {},
  entities: Record<string, any> = {},
  entityFiles: Record<string, string> = {};
for (let i = 0; i < all.length; i += 30) {
  const r = await request(
    query("https://en.wikipedia.org/w/api.php", {
      action: "query",
      format: "json",
      formatversion: "2",
      redirects: "1",
      prop: "pageprops|info",
      inprop: "url",
      titles: all.slice(i, i + 30).join("|"),
    }),
  );
  const p: any = r.payload;
  const aliases = new Map<string, string>(
    [...(p.query.normalized ?? []), ...(p.query.redirects ?? [])].map(
      (v: any) => [v.from, v.to],
    ),
  );
  for (const name of all.slice(i, i + 30)) {
    let resolved = name;
    const seen = new Set();
    while (aliases.has(resolved) && !seen.has(resolved)) {
      seen.add(resolved);
      resolved = aliases.get(resolved)!;
    }
    pages[name] = {
      ...p.query.pages.find((p: any) => p.title === resolved),
      evidenceFile: `${dir}/cache/${sha256(r.url)}.json`,
    };
  }
}
const ids = [
  ...new Set(
    Object.values(pages)
      .map((p) => p.pageprops?.wikibase_item)
      .filter(Boolean),
  ),
] as string[];
async function get(ids: string[]) {
  for (let i = 0; i < ids.length; i += 30) {
    const r = await request(
      query("https://www.wikidata.org/w/api.php", {
        action: "wbgetentities",
        format: "json",
        ids: ids.slice(i, i + 30).join("|"),
        props: "labels|aliases|claims|sitelinks",
        languages: "en|fr",
        sitefilter: "enwiki|frwiki",
      }),
    );
    Object.assign(entities, (r.payload as any).entities);
    for (const id of ids.slice(i, i + 30))
      entityFiles[id] = `${dir}/cache/${sha256(r.url)}.json`;
  }
}
await get(ids);
const values = (e: any, p: string) =>
  (e?.claims?.[p] ?? [])
    .map((v: any) => v.mainsnak?.datavalue?.value)
    .filter(Boolean);
const primary = JSON.parse(await readFile(`${dir}/identities.json`, "utf8"));
await get([
  ...new Set(
    Object.values(entities)
      .flatMap((e) =>
        [...values(e, "P170"), ...values(e, "P195")].map((v) => v.id),
      )
      .filter((v) => v && !entities[v] && !primary.entities[v]),
  ),
]);
const images: Record<string, any> = {};
const files = [
  ...new Set(
    ids
      .flatMap((id) => values(entities[id], "P18"))
      .filter((v) => typeof v === "string" && !primary.images[`File:${v}`]),
  ),
];
for (let i = 0; i < files.length; i += 15) {
  const r = await request(
    query("https://commons.wikimedia.org/w/api.php", {
      action: "query",
      format: "json",
      formatversion: "2",
      redirects: "1",
      prop: "imageinfo",
      iiprop: "url|extmetadata|size",
      iiurlwidth: "1600",
      titles: files
        .slice(i, i + 15)
        .map((f) => `File:${f}`)
        .join("|"),
    }),
  );
  for (const p of (r.payload as any).query.pages)
    images[p.title] = {
      ...p,
      evidenceFile: `${dir}/cache/${sha256(r.url)}.json`,
    };
}
await writeFile(
  `${dir}/supplement.json`,
  JSON.stringify(
    {
      note: "Compléments de pistes : toujours vérifier artiste, version et licence ; pas une approbation.",
      titles,
      artistTitles,
      pages,
      entities,
      entityFiles,
      images,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `${Object.keys(titles).length} titres recherchés en anglais, ${ids.length} entités ; aucune image téléchargée.`,
);
