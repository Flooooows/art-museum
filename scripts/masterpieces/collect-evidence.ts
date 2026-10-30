import { readFile, writeFile } from "node:fs/promises";
import { DiskCaptureStore, JsonCaptureClient, sha256 } from "../rarity-v2/http";

const dir = "catalog/masterpieces";
const client = new JsonCaptureClient({
  store: new DiskCaptureStore(`${dir}/cache`),
  offline: !process.argv.includes("--live"),
  minimumIntervalMs: 1000,
  timeoutMs: 60000,
  maximumRetryAfterMs: 120000,
  userAgent:
    "MUSE-Masterpieces-Research/1.0 (metadata and public monthly counters; no image download)",
});
const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown) => (typeof v === "string" ? v : "");
const values = (entity: unknown, property: string) =>
  arr(obj(obj(entity).claims)[property])
    .map((v) => obj(obj(obj(v).mainsnak).datavalue).value)
    .filter((v) => v !== undefined);
const lead = JSON.parse(
  await readFile(`${dir}/identity-leads.json`, "utf8"),
) as { entities: { evidenceFile: string }[] };
const entities: Record<string, unknown> = {};
for (const entry of lead.entities)
  Object.assign(
    entities,
    obj(obj(JSON.parse(await readFile(entry.evidenceFile, "utf8"))).payload)
      .entities,
  );
const relatedIds = new Set<string>();
for (const entity of Object.values(entities))
  for (const property of ["P170", "P195", "P31"])
    for (const v of values(entity, property))
      if (str(obj(v).id)) relatedIds.add(str(obj(v).id));
const related: Record<string, unknown> = {};
const captures: string[] = [];
const query = (base: string, params: Record<string, string>) => {
  const u = new URL(base);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.toString();
};
for (let offset = 0, ids = [...relatedIds]; offset < ids.length; offset += 35) {
  const r = await client.request(
    "wikimedia",
    query("https://www.wikidata.org/w/api.php", {
      action: "wbgetentities",
      format: "json",
      ids: ids.slice(offset, offset + 35).join("|"),
      props: "labels|claims|sitelinks",
      languages: "fr|en",
      sitefilter: "enwiki|frwiki",
    }),
  );
  if (r.status !== "available") throw new Error(`Entités liées : ${r.status}`);
  captures.push(`${dir}/cache/${sha256(r.url)}.json`);
  Object.assign(related, obj(r.payload).entities);
}
const files = [
  ...new Set(
    Object.values(entities)
      .flatMap((e) => values(e, "P18").map(str))
      .filter(Boolean),
  ),
];
const imageMetadata: Record<string, unknown> = {};
for (let offset = 0; offset < files.length; offset += 15) {
  const r = await client.request(
    "wikimedia",
    query("https://commons.wikimedia.org/w/api.php", {
      action: "query",
      format: "json",
      formatversion: "2",
      redirects: "1",
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      titles: files
        .slice(offset, offset + 15)
        .map((f) => `File:${f}`)
        .join("|"),
    }),
  );
  if (r.status !== "available")
    throw new Error(`Métadonnées Commons : ${r.status}`);
  captures.push(`${dir}/cache/${sha256(r.url)}.json`);
  for (const p of arr(obj(obj(r.payload).query).pages))
    imageMetadata[str(obj(p).title)] = p;
}
const audiences: Record<string, unknown> = {};
for (const [qid, entity] of Object.entries({ ...entities, ...related })) {
  // Only artwork lead pages and explicitly identified creators; never civilization audiences.
  const isCreator = Object.values(entities).some((e) =>
    values(e, "P170").some((v) => obj(v).id === qid),
  );
  if (!(qid in entities) && !isCreator) continue;
  const title = str(obj(obj(obj(entity).sitelinks).enwiki).title);
  if (!title) continue;
  const r = await client.request(
    "wikimedia",
    `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/${encodeURIComponent(title.replaceAll(" ", "_"))}/monthly/2025100100/2026093000`,
  );
  audiences[qid] = {
    title,
    status: r.status,
    evidenceFile:
      r.status === "available" ? `${dir}/cache/${sha256(r.url)}.json` : null,
    error: r.error ?? null,
  };
}
await writeFile(
  `${dir}/collected-evidence.json`,
  JSON.stringify(
    {
      note: "Métadonnées de recherche seulement. Aucune licence ni identité institutionnelle approuvée automatiquement ; aucun fichier image téléchargé. Les pages de série/personne seront exclues du scoring d’objet.",
      related,
      imageMetadata,
      audiences,
      captures,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `${Object.keys(entities).length} pistes, ${Object.keys(related).length} entités liées, ${files.length} métadonnées d’images et ${Object.keys(audiences).length} collectes d’audience (succès et erreurs distingués). Aucune image téléchargée.`,
);
