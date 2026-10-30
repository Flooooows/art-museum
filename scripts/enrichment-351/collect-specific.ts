import { readFile, writeFile } from "node:fs/promises";
import { DiskCaptureStore, JsonCaptureClient, sha256 } from "../rarity-v2/http";
const dir = "catalog/enrichment-351";
const client = new JsonCaptureClient({
  store: new DiskCaptureStore(`${dir}/cache`),
  offline: !process.argv.includes("--live"),
  minimumIntervalMs: 6000,
  timeoutMs: 60000,
  maximumRetryAfterMs: 180000,
  userAgent: "MUSE exact-file licensing research; no image download",
});
const query = (base: string, p: Record<string, string>) => {
  const u = new URL(base);
  for (const [k, v] of Object.entries(p)) u.searchParams.set(k, v);
  return u.toString();
};
const titles = [
  "File:Vincent van Gogh - Sunflowers - Google Art Project.jpg",
  "File:Vincent van Gogh - Sunflowers - National Gallery.jpg",
  "File:Van Gogh Vase with Fifteen Sunflowers.jpg",
  "File:Edouard Manet 004.jpg",
  "File:Pierre-Auguste Renoir - La Loge - Google Art Project.jpg",
];
const r = await client.request(
  "wikimedia",
  query("https://commons.wikimedia.org/w/api.php", {
    action: "query",
    format: "json",
    formatversion: "2",
    redirects: "1",
    prop: "imageinfo",
    iiprop: "url|extmetadata|size",
    iiurlwidth: "1600",
    titles: titles.join("|"),
  }),
);
if (r.status !== "available") throw Error(r.status);
const records = (r.payload as any).query.pages.map((p: any) => ({
  ...p,
  evidenceFile: `${dir}/cache/${sha256(r.url)}.json`,
}));
const original = JSON.parse(await readFile(`${dir}/identities.json`, "utf8"));
const category = await client.request(
  "wikimedia",
  query("https://commons.wikimedia.org/w/api.php", {
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "categorymembers",
    gcmtitle: "Category:Still Life: Vase with Fifteen Sunflowers (F454)",
    gcmtype: "file",
    gcmlimit: "15",
    prop: "imageinfo",
    iiprop: "url|extmetadata|size",
    iiurlwidth: "1600",
  }),
);
if (category.status !== "available") throw Error(category.status);
for (const page of (category.payload as any).query?.pages ?? [])
  records.push({
    ...page,
    evidenceFile: `${dir}/cache/${sha256(category.url)}.json`,
  });
const statements = [];
for (const title of [
  "File:Un bar aux Folies-Bergère d'E. Manet (Fondation Vuitton, Paris) (33539037428).jpg",
  "File:La Loge de P.-A. Renoir (Fondation Vuitton, Paris) (46499625955).jpg",
]) {
  const u = query("https://commons.wikimedia.org/w/api.php", {
    action: "parse",
    format: "json",
    page: title,
    prop: "wikitext",
  });
  const c = await client.request("wikimedia", u);
  statements.push({
    title,
    status: c.status,
    evidenceFile:
      c.status === "available" ? `${dir}/cache/${sha256(c.url)}.json` : null,
  });
}
await writeFile(
  `${dir}/specific-files.json`,
  JSON.stringify({ records, statements }, null, 2) + "\n",
);
for (const p of records)
  console.log(
    p.title,
    p.imageinfo?.[0]?.extmetadata?.ObjectName?.value
      ?.replace(/<[^>]*>/g, " ")
      .slice(0, 160),
    p.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value,
  );
