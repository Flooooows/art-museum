import { mkdir, writeFile } from "node:fs/promises";
import { DiskCaptureStore, JsonCaptureClient, sha256 } from "../rarity-v2/http";
const dir = "catalog/masterpieces";
const client = new JsonCaptureClient({
  store: new DiskCaptureStore(`${dir}/cache`),
  offline: !process.argv.includes("--live"),
  minimumIntervalMs: 500,
  timeoutMs: 45000,
  maximumRetryAfterMs: 120000,
  userAgent: "MUSE metadata rights research",
});
const q = new URL("https://www.wikidata.org/w/api.php");
for (const [k, v] of Object.entries({
  action: "wbgetentities",
  format: "json",
  ids: "Q18891156",
  props: "labels|claims|sitelinks",
  languages: "fr|en",
}))
  q.searchParams.set(k, v);
const entity = await client.request("wikimedia", q.toString());
if (entity.status !== "available") throw Error(entity.status);
const file = new URL("https://commons.wikimedia.org/w/api.php");
for (const [k, v] of Object.entries({
  action: "query",
  format: "json",
  formatversion: "2",
  prop: "imageinfo",
  iiprop: "url|extmetadata",
  iiurlwidth: "1000",
  titles:
    "File:Van Gogh - Starry Night - Google Art Project.jpg|File:Edvard Munch, 1893, The Scream, oil, tempera and pastel on cardboard, 91 x 73 cm, National Gallery of Norway.jpg",
}))
  file.searchParams.set(k, v);
const images = await client.request("wikimedia", file.toString());
if (images.status !== "available") throw Error(images.status);
await mkdir(`${dir}/official`, { recursive: true });
const pages = [];
// Text-only captures: never fetch or copy institutional images at this stage.
for (const url of [
  "https://www.nasjonalmuseet.no/en/collection/object/NG.M.00939",
  "https://www.artic.edu/open-access/open-access-images",
  "https://www.metmuseum.org/policies/image-resources",
  "https://www.moma.org/collection/works/79802",
]) {
  const r = await fetch(url, { signal: AbortSignal.timeout(45000) });
  const text = await r.text();
  const path = `${dir}/official/${sha256(url)}.json`;
  const item = {
    url,
    httpStatus: r.status,
    retrievedAt: new Date().toISOString(),
    sha256: sha256(text),
    text: r.ok ? text : null,
  };
  await writeFile(path, JSON.stringify(item, null, 2) + "\n");
  pages.push({ url, path, httpStatus: r.status });
}
await writeFile(
  `${dir}/official.json`,
  JSON.stringify(
    {
      screamEntityFile: `${dir}/cache/${sha256(entity.url)}.json`,
      imagesFile: `${dir}/cache/${sha256(images.url)}.json`,
      pages,
    },
    null,
    2,
  ) + "\n",
);
