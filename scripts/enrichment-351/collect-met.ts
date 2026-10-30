import { writeFile, mkdir } from "node:fs/promises";
import { DiskCaptureStore, JsonCaptureClient, sha256 } from "../rarity-v2/http";
const dir = "catalog/enrichment-351";
await mkdir(dir, { recursive: true });
const client = new JsonCaptureClient({
  store: new DiskCaptureStore(`${dir}/cache`),
  offline: !process.argv.includes("--live"),
  minimumIntervalMs: 1000,
  timeoutMs: 60000,
  maximumRetryAfterMs: 120000,
  userAgent: "MUSE metadata research; no image download",
});
const queries = [
  "View of Toledo El Greco",
  "The Gulf Stream Winslow Homer",
  "Snap the Whip Winslow Homer",
  "Madame X Sargent",
  "The Third-Class Carriage Daumier",
  "The Card Players Cezanne",
  "The Dance Class Degas",
  "The Great Wave",
  "Iris Yatsuhashi Korin",
  "The Peacock Skirt Beardsley",
  "Gismonda Mucha",
  "JOB Mucha",
  "The Climax Beardsley",
  "The Rhinoceros Durer",
  "Storm below the Summit Hokusai",
  "Three Beauties Utamaro",
  "Otani Oniji Sharaku",
  "The Open Door Talbot",
  "The Terminal Stieglitz",
  "The Steerage Stieglitz",
];
const searches = [];
for (const q of queries) {
  const u = new URL(
    "https://collectionapi.metmuseum.org/public/collection/v1.1/search",
  );
  u.searchParams.set("q", q);
  u.searchParams.set("hasImages", "true");
  u.searchParams.set("limit", "4");
  const r = await client.request("met", u.toString());
  if (r.status !== "available") throw Error(`${q}: ${r.status}`);
  const records = [];
  for (const id of (r.payload as any).objectIDs ?? []) {
    const c = await client.request(
      "met",
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`,
    );
    if (c.status !== "available") throw Error(`${id}: ${c.status}`);
    const p: any = c.payload;
    records.push({
      id,
      title: p.title,
      artist: p.artistDisplayName,
      culture: p.culture,
      date: p.objectDate,
      accessionNumber: p.accessionNumber,
      isPublicDomain: p.isPublicDomain,
      hasImage: !!p.primaryImage,
      evidenceFile: `${dir}/cache/${sha256(c.url)}.json`,
    });
  }
  searches.push({ query: q, records });
  console.log(q, JSON.stringify(records));
}
await writeFile(
  `${dir}/met-searches.json`,
  JSON.stringify({ searches }, null, 2) + "\n",
);
