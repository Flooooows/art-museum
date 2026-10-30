import { readFile, writeFile } from "node:fs/promises";
import { DiskCaptureStore, JsonCaptureClient, sha256 } from "../rarity-v2/http";
import { loadResearch, values, norm } from "./research";
const dir = "catalog/enrichment-351",
  prepared = JSON.parse(await readFile(`${dir}/prepared.json`, "utf8")),
  research = await loadResearch();
const old = JSON.parse(
  await readFile("catalog/masterpieces/collected-evidence.json", "utf8"),
);
const client = new JsonCaptureClient({
  store: new DiskCaptureStore(`${dir}/cache`),
  offline: !process.argv.includes("--live"),
  minimumIntervalMs: 1500,
  timeoutMs: 45000,
  maximumRetryAfterMs: 120000,
  userAgent: "MUSE monthly human pageviews research; no image download",
});
const entities = { ...research.entities },
  files = { ...research.entityFiles };
const missing = [
  ...new Set(
    prepared.approved
      .map((a: any) => a.wikidataId)
      .filter((q: string) => q && !entities[q]),
  ),
] as string[];
for (let start = 0; start < missing.length; start += 30) {
  const u = new URL("https://www.wikidata.org/w/api.php");
  for (const [k, v] of Object.entries({
    action: "wbgetentities",
    format: "json",
    ids: missing.slice(start, start + 30).join("|"),
    props: "labels|claims|sitelinks",
    languages: "en|fr",
    sitefilter: "enwiki|frwiki",
  }))
    u.searchParams.set(k, v);
  const r = await client.request("wikimedia", u.toString());
  if (r.status !== "available") throw Error(r.status);
  Object.assign(entities, (r.payload as any).entities);
  for (const q of missing.slice(start, start + 30))
    files[q] = `${dir}/cache/${sha256(r.url)}.json`;
}
const subjects = new Set<string>();
const scopes: any[] = [];
for (const a of prepared.approved) {
  const entity = entities[a.wikidataId];
  const exactInventory =
    entity &&
    values(entity, "P217").some(
      (v) => norm(String(v)) === norm(a.inventoryNumber),
    );
  const correction = ["0121", "0134"].includes(a.suffix);
  const printComposition = ["0043", "0254", "0260", "0261"].includes(a.suffix);
  const workQid =
    entity && (exactInventory || correction) ? a.wikidataId : null;
  const artists =
    a.input.creatorMode === "anonymous"
      ? []
      : a.creatorIds.filter(
          (qid: string) =>
            entities[qid] &&
            values(entities[qid], "P31").some((v) => v.id === "Q5"),
        );
  if (workQid) subjects.add(workQid);
  for (const q of artists) subjects.add(q);
  scopes.push({
    workId: a.workId,
    workQid,
    artistQids: artists,
    audienceScope:
      printComposition && workQid ? "reviewed_composition" : "exact_object",
    reason: workQid
      ? printComposition
        ? "Audience de la composition d’estampe explicitement revue, pas de la notoriété de l’épreuve physique."
        : "Page liée à l’objet sélectionné et à son inventaire (ou correction institutionnelle documentée)."
      : "Pas d’audience d’œuvre transférée : page absente, version collective ou inventaire non concordant.",
  });
}
const records = [];
for (const qid of [...subjects].sort())
  for (const language of ["en", "fr"]) {
    const title = entities[qid]?.sitelinks?.[`${language}wiki`]?.title;
    if (!title) continue;
    const previous = language === "en" && old.audiences[qid];
    if (previous?.status === "available" && previous.title === title) {
      records.push({
        qid,
        language,
        title,
        status: "available",
        evidenceFile: previous.evidenceFile,
        reused: true,
      });
      continue;
    }
    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${language}.wikipedia/all-access/user/${encodeURIComponent(title.replaceAll(" ", "_"))}/monthly/2025100100/2026093000`;
    let r = await client.request("wikimedia", url);
    if (
      r.status === "rate_limited" &&
      r.retryAt &&
      Date.parse(r.retryAt) - Date.now() <= 120000
    )
      r = await client.request("wikimedia", url);
    records.push({
      qid,
      language,
      title,
      status: r.status,
      evidenceFile:
        r.status === "available" ? `${dir}/cache/${sha256(r.url)}.json` : null,
      error: r.error ?? null,
      retryAt: r.retryAt ?? null,
    });
  }
await writeFile(
  `${dir}/audiences.json`,
  JSON.stringify(
    {
      period: { start: "2025-10-01", end: "2026-09-30", days: 365 },
      scopes,
      records,
      entityFiles: files,
      entities: Object.fromEntries(
        [...subjects].map((qid) => [qid, entities[qid]]),
      ),
      note: "Aucune série, civilisation, artiste homonyme ni autre version ne remplace une page manquante. Erreurs distinctes de zéro, deux langues lorsqu’existantes. Les audiences d’estampes au niveau composition sont explicitement distinguées.",
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `${scopes.length} objets ; ${records.filter((r) => r.status === "available").length} audiences disponibles / ${records.length} ; erreurs non imputées à zéro.`,
);
