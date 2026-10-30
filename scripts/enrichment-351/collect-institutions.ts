import { mkdir, readFile, writeFile } from "node:fs/promises";
import { DiskCaptureStore, JsonCaptureClient, sha256 } from "../rarity-v2/http";
import { loadResearch, values } from "./research";
const dir = "catalog/enrichment-351";
const client = new JsonCaptureClient({
  store: new DiskCaptureStore(`${dir}/cache`),
  offline: !process.argv.includes("--live"),
  minimumIntervalMs: 1600,
  timeoutMs: 45000,
  maximumRetryAfterMs: 90000,
  userAgent: "MUSE exact-institution record research; no image download",
});
const research = await loadResearch();
await mkdir(`${dir}/official`, { recursive: true });
const records = [];
for (const row of research.records) {
  if (!row.artistMatched && !["0274", "0275"].includes(row.suffix)) continue;
  const manifest = values(row.entity, "P6108").find(
    (v) =>
      typeof v === "string" && v.startsWith("https://iiif.musee-orsay.fr/"),
  );
  const louvre = values(row.entity, "P9394").find(
    (v) => typeof v === "string" && /^\d{9}$/.test(v),
  );
  if (manifest) {
    const c = await client.request("orsay", manifest);
    records.push({
      input: row.suffix,
      qid: row.qid,
      provider: "orsay",
      status: c.status,
      url: manifest,
      evidenceFile:
        c.status === "available" ? `${dir}/cache/${sha256(c.url)}.json` : null,
    });
    console.log(row.suffix, "orsay", c.status);
  }
  if (louvre) {
    const url = `https://collections.louvre.fr/ark:/53355/cl${louvre}`,
      file = `${dir}/official/${sha256(url)}.json`;
    let c;
    try {
      c = JSON.parse(await readFile(file, "utf8"));
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    }
    if (!c) {
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(45000) });
        const html = await r.text();
        c = {
          url,
          finalUrl: r.url,
          httpStatus: r.status,
          retrievedAt: new Date().toISOString(),
          html: r.status === 200 ? html : null,
          sha256: r.status === 200 ? sha256(html) : null,
        };
      } catch (e) {
        c = { url, httpStatus: null, html: null, error: String(e) };
      }
      await writeFile(file, JSON.stringify(c, null, 2) + "\n");
    }
    records.push({
      input: row.suffix,
      qid: row.qid,
      provider: "louvre",
      status: c.httpStatus === 200 ? "available" : "http_error",
      url,
      evidenceFile: file,
    });
    console.log(row.suffix, "louvre", c.httpStatus);
  }
}
await writeFile(
  `${dir}/institutions.json`,
  JSON.stringify(
    {
      records,
      note: "Métadonnées et texte seulement. Une notice accessible n’autorise pas sa photographie. Les correspondances doivent encore être approuvées individuellement.",
    },
    null,
    2,
  ) + "\n",
);
