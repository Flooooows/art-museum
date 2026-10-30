import { writeFile } from "node:fs/promises";
import { DiskCaptureStore, JsonCaptureClient, sha256 } from "../rarity-v2/http";
const dir = "catalog/masterpieces";
const client = new JsonCaptureClient({
  store: new DiskCaptureStore(`${dir}/cache`),
  offline: !process.argv.includes("--live"),
  minimumIntervalMs: 400,
  timeoutMs: 45000,
  maximumRetryAfterMs: 120000,
  userAgent: "MUSE research (metadata only)",
});
const queries = [
  "Coronation Stone Motecuhzoma",
  "Seated Buddha Nagapattinam",
  "Shiva Lord Dance",
  "Bodhisattva Avalokiteshvara",
  "Horse Tang dynasty",
  "Ritual Vessel Gui",
  "Pair of Six Panel Screens Birds Flowers",
  "A Sunday La Grande Jatte",
  "Reliquary Figure Kota",
  "Headdress Baga",
  "Mask Fang",
  "Malagan",
  "Ancestor Figure Easter Island",
  "Ceremonial Adze Polynesia",
  "Royal Headdress Bamum",
  "Mummy Case Paankhenamun",
  "Statuette of Osiris",
  "Feline Head Moche",
  "Vessel Maya",
  "Arapaho Painted Buffalo Robe",
  "Mangaaka",
  "America Windows Chagall",
  "Sky above Clouds O'Keeffe",
  "The Fountain of Vaucluse",
  "The Child's Bath",
  "Judith and Holofernes Artemisia",
  "The Combat of the Giaour and Hassan",
  "A Lion Attacking a Horse",
  "The Rock Peter Blume",
  "The Old Temple Hubert Robert",
];
const searches = [];
for (const q of queries) {
  const url = new URL("https://api.artic.edu/api/v1/artworks/search");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "3");
  url.searchParams.set(
    "fields",
    "id,title,artist_title,date_display,is_public_domain,image_id,main_reference_number",
  );
  const r = await client.request("artic", url.toString());
  if (r.status !== "available") throw Error(`${q}: ${r.status}`);
  const data = (r.payload as { data: unknown[] }).data;
  searches.push({
    query: q,
    results: data,
    evidenceFile: `${dir}/cache/${sha256(r.url)}.json`,
  });
  console.log(q, JSON.stringify(data));
}
await writeFile(
  `${dir}/world-searches.json`,
  JSON.stringify({ searches }, null, 2) + "\n",
);
