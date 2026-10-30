import { writeFile } from "node:fs/promises";
import { DiskCaptureStore, JsonCaptureClient, sha256 } from "../rarity-v2/http";

const dir = "catalog/masterpieces";
const client = new JsonCaptureClient({
  store: new DiskCaptureStore(`${dir}/cache`),
  offline: !process.argv.includes("--live"),
  minimumIntervalMs: 1000,
  timeoutMs: 45000,
  maximumRetryAfterMs: 120000,
  userAgent:
    "MUSE-Masterpieces-Research/1.0 (institutional metadata; no image download)",
});
const queries = [
  "A Sunday on La Grande Jatte",
  "The Bedroom",
  "Paris Street Rainy Day",
  "The Child's Bath",
  "Two Sisters On the Terrace",
  "The Song of the Lark",
  "At the Moulin Rouge",
  "The Old Guitarist",
  "American Gothic",
  "Nighthawks",
  "Arrival of the Normandy Train Gare Saint-Lazare",
  "Stacks of Wheat End of Summer",
  "Water Lilies Monet",
  "Self-Portrait Vincent van Gogh",
  "Buddha Shakyamuni Seated in Meditation",
  "Veranda Post Olowe",
  "A Sunday Afternoon Seurat",
  "The Assumption of the Virgin El Greco",
  "Saint George Killing the Dragon Martorell",
  "Portrait of a Man with a Medallion Botticelli",
  "The Golden Age Lucas Cranach",
  "The Herring Net Winslow Homer",
  "The Banquet of Cleopatra Tiepolo",
  "The Adoration of the Magi Bernard van Orley",
  "The Poet's Garden Van Gogh",
  "Bathers by a River Matisse",
];
const searches = [];
for (const q of queries) {
  const url = new URL("https://api.artic.edu/api/v1/artworks/search");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "4");
  url.searchParams.set(
    "fields",
    "id,title,artist_title,date_display,is_public_domain,image_id,main_reference_number",
  );
  const result = await client.request("artic", url.toString());
  if (result.status !== "available") throw new Error(`${q}: ${result.status}`);
  const data = (result.payload as { data: { id: number; title: string }[] })
    .data;
  searches.push({
    query: q,
    evidenceFile: `${dir}/cache/${sha256(result.url)}.json`,
    results: data,
    status: "candidates_to_match_manually",
  });
  console.log(q, JSON.stringify(data.map((r) => [r.id, r.title])));
}
await writeFile(
  `${dir}/artic-searches.json`,
  JSON.stringify(
    {
      note: "Résultats de recherche seulement ; les homonymes doivent être exclus. Aucune image téléchargée, aucun droit supposé.",
      searches,
    },
    null,
    2,
  ) + "\n",
);
