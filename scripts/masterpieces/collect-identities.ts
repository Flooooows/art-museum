import { mkdir, writeFile } from "node:fs/promises";
import { DiskCaptureStore, JsonCaptureClient, sha256 } from "../rarity-v2/http";

// Research leads only: page identity is not an institutional match or a rights approval.
const titles = [
  "The Starry Night",
  "Bedroom in Arles",
  "Café Terrace at Night",
  "Self-Portrait with Bandaged Ear",
  "Impression, Sunrise",
  "Woman with a Parasol – Madame Monet and Her Son",
  "The Water Lily Pond",
  "La Japonaise (painting)",
  "Gare Saint-Lazare (Monet series)",
  "Guernica (Picasso)",
  "Les Demoiselles d'Avignon",
  "The Weeping Woman",
  "The Old Guitarist",
  "The Two Fridas",
  "Self-Portrait with Thorn Necklace and Hummingbird",
  "The Broken Column",
  "The Persistence of Memory",
  "The Temptation of St. Anthony (Dalí)",
  "The Kiss (Klimt)",
  "Portrait of Adele Bloch-Bauer I",
  "The Scream",
  "Girl with a Pearl Earring",
  "The Milkmaid (Vermeer)",
  "View of Delft",
  "The Birth of Venus",
  "Primavera (Botticelli)",
  "The Last Supper (Leonardo)",
  "Lady with an Ermine",
  "Vitruvian Man",
  "The Creation of Adam",
  "The Last Judgment (Michelangelo)",
  "David (Michelangelo)",
  "Liberty Leading the People",
  "The Raft of the Medusa",
  "The Son of Man",
  "American Gothic",
  "The Garden of Earthly Delights",
  "The Night Watch",
  "Las Meninas",
  "A Sunday Afternoon on the Island of La Grande Jatte",
  "Grande Odalisque",
  "Composition VIII",
  "The Treachery of Images",
  "The Kiss (Rodin sculpture)",
  "Venus de Milo",
  "Winged Victory of Samothrace",
  "Nighthawks (painting)",
  "The Birth of the World",
  "The Sleeping Gypsy",
  "The Third of May 1808",
  "The Arnolfini Portrait",
  "A Bar at the Folies-Bergère",
  "Olympia (Manet)",
  "The Gleaners",
  "The Hay Wain",
  "Travelers among Mountains and Streams",
  "Along the River During the Qingming Festival",
  "A Thousand Li of Rivers and Mountains",
  "Wind God and Thunder God",
  "Shakuntala (Raja Ravi Varma)",
  "Bharat Mata (painting)",
  "Fujin Raijin-zu",
  "Nefertiti Bust",
  "Mask of Tutankhamun",
  "Bust of Queen Mother Idia",
  "Benin Bronzes",
  "Mangaaka",
  "Coyolxauhqui Stone",
  "Aztec sun stone",
  "Moai",
  "A'a from Rurutu",
  "The Death of Cleopatra",
  "Oath of the Horatii",
  "The Swing (Fragonard)",
];
const directory = "catalog/masterpieces";
const client = new JsonCaptureClient({
  store: new DiskCaptureStore(`${directory}/cache`),
  offline: !process.argv.includes("--live"),
  minimumIntervalMs: 6000,
  timeoutMs: 60000,
  maximumRetryAfterMs: 120000,
  userAgent:
    "MUSE-Masterpieces-Research/1.0 (metadata-only; no image download)",
});
const leads: unknown[] = [];
const qids = new Set<string>();
for (let start = 0; start < titles.length; start += 20) {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  for (const [key, value] of Object.entries({
    action: "query",
    format: "json",
    formatversion: "2",
    redirects: "1",
    prop: "pageprops|info",
    inprop: "url",
    titles: titles.slice(start, start + 20).join("|"),
  }))
    url.searchParams.set(key, value);
  const result = await client.request("wikimedia", url.toString());
  if (result.status !== "available")
    throw new Error(`Wikipedia: ${result.status}`);
  const query = (
    result.payload as {
      query: {
        pages: {
          title: string;
          pageprops?: { wikibase_item?: string };
          missing?: boolean;
          fullurl?: string;
        }[];
      };
    }
  ).query;
  for (const page of query.pages) {
    const qid = page.pageprops?.wikibase_item;
    if (qid && /^Q\d+$/.test(qid)) qids.add(qid);
    leads.push({
      title: page.title,
      qid: qid ?? null,
      missing: page.missing === true,
      url: page.fullurl ?? null,
      evidenceFile: `${directory}/cache/${sha256(result.url)}.json`,
      status: "research_lead_unverified",
      note: "Une page de série, groupe ou site archéologique exige la sélection d’un objet/version exact avant toute carte.",
    });
  }
}
const ids = [...qids];
const entities = [];
for (let start = 0; start < ids.length; start += 40) {
  const url = new URL("https://www.wikidata.org/w/api.php");
  for (const [key, value] of Object.entries({
    action: "wbgetentities",
    format: "json",
    ids: ids.slice(start, start + 40).join("|"),
    props: "labels|aliases|claims|sitelinks",
    languages: "fr|en",
    sitefilter: "enwiki|frwiki",
  }))
    url.searchParams.set(key, value);
  const result = await client.request("wikimedia", url.toString());
  if (result.status !== "available")
    throw new Error(`Wikidata: ${result.status}`);
  entities.push({
    ids: ids.slice(start, start + 40),
    evidenceFile: `${directory}/cache/${sha256(result.url)}.json`,
  });
}
await mkdir(directory, { recursive: true });
await writeFile(
  `${directory}/identity-leads.json`,
  JSON.stringify(
    {
      purpose:
        "Pistes documentaires, pas candidates validées ; aucun droit d’image ni score supposé.",
      requestedTitles: titles,
      leads,
      entities,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `${leads.length} pages documentaires, ${qids.size} entités Wikidata capturées ; identités institutionnelles et droits à vérifier, aucune image téléchargée.`,
);
