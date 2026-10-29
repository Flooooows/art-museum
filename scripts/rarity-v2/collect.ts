import { readFile, readdir, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseEngineConfig } from "../../src/rarity-engine/configuration";
import { parseCatalog } from "../../src/catalog/model";
import { createConnectors } from "./connectors";
import {
  DiskCaptureStore,
  JsonCaptureClient,
  publicUrl,
  sha256,
  type Capture,
} from "./http";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const live = process.argv.includes("--live");
const config = parseEngineConfig(
  JSON.parse(
    await readFile(
      path.join(root, "catalog/rarity-v2/config-2.0.0.json"),
      "utf8",
    ),
  ),
);
const directory = path.join(root, "catalog/rarity-v2");
const seed = parseCatalog(
  JSON.parse(await readFile(path.join(root, "src/catalog/seed.json"), "utf8")),
);
const store = new DiskCaptureStore(path.join(directory, "cache"));
const client = new JsonCaptureClient({
  store,
  offline: !live,
  ...config.providers,
});
const connectors = createConnectors(client, {
  smithsonian: process.env.SMITHSONIAN_API_KEY,
  europeana: process.env.EUROPEANA_API_KEY,
});

// Import successful captures with their ORIGINAL dates; no fake refresh.
for (const image of seed.images) {
  const verification = image.rights.verification;
  if (!verification || verification.provider === "commons") continue;
  const old = JSON.parse(
    await readFile(path.join(root, verification.evidenceFile), "utf8"),
  );
  await client.importCapture(
    verification.provider,
    old.sourceUrl,
    old.retrievedAt,
    old.response,
  );
}
for (const name of (
  await readdir(path.join(root, "catalog/notoriety/evidence"))
).sort()) {
  if (!name.endsWith(".json")) continue;
  const old = JSON.parse(
    await readFile(path.join(root, "catalog/notoriety/evidence", name), "utf8"),
  );
  if (old.status === 200 && old.url && old.response)
    await client.importCapture(
      "wikimedia",
      old.url,
      old.retrievedAt,
      old.response,
    );
}
const recordInfo = (capture: Capture) => ({
  status: capture.status,
  url: capture.url,
  retrievedAt: capture.status === "available" ? capture.retrievedAt : null,
  evidenceFile:
    capture.status === "available"
      ? `catalog/rarity-v2/cache/${sha256(publicUrl(capture.url))}.json`
      : null,
  error: capture.error ?? null,
  retryAt: capture.retryAt ?? null,
});
const records = [];
for (const work of seed.works) {
  const source = work.sources.find(
    (row) => row.provider === "met" || row.provider === "cma",
  );
  if (!source) continue;
  const captured =
    source.provider === "met"
      ? await connectors.met.record(source.recordId)
      : await connectors.cleveland.record(source.recordId);
  records.push({
    artworkId: work.id,
    provider: source.provider,
    ...recordInfo(captured),
  });
}

const observations = JSON.parse(
  await readFile(
    path.join(root, "catalog/notoriety/observations.json"),
    "utf8",
  ),
) as {
  works: {
    id: string;
    workAudience: {
      qid: string;
      pages: { language: string; title: string }[];
    } | null;
  }[];
};
const wikipedia: {
  language: string;
  title: string;
  status: string;
  expectedQid: string;
  actualQid: string | null;
  evidenceFile: string | null;
  error: string | null;
}[] = [];
for (const language of ["fr", "en"]) {
  const targets = observations.works.flatMap((work) =>
    work.workAudience
      ? work.workAudience.pages
          .filter((page) => page.language === language)
          .map((page) => ({ title: page.title, qid: work.workAudience!.qid }))
      : [],
  );
  if (!targets.length) continue;
  const captured = await connectors.wikipedia.pages(language, [
    ...new Set(targets.map((target) => target.title)),
  ]);
  const payload = captured.payload as {
    query?: {
      pages?: {
        title: string;
        pageprops?: { wikibase_item?: string };
        missing?: boolean;
      }[];
      redirects?: { from: string; to: string }[];
    };
  } | null;
  const pages = Array.isArray(payload?.query?.pages) ? payload.query.pages : [];
  for (const target of targets) {
    const redirect =
      payload?.query?.redirects?.find((row) => row.from === target.title)?.to ??
      target.title;
    const page = pages.find((row) => row.title === redirect);
    const qid = page?.pageprops?.wikibase_item ?? null;
    wikipedia.push({
      language,
      title: target.title,
      expectedQid: target.qid,
      actualQid: qid,
      status: qid
        ? qid === target.qid
          ? "verified"
          : "mismatch"
        : captured.status === "available"
          ? "unresolved"
          : captured.status,
      evidenceFile: recordInfo(captured).evidenceFile,
      error: captured.error ?? null,
    });
  }
}
const providerStates = [
  {
    provider: "met",
    status: records.some(
      (row) => row.provider === "met" && row.status === "available",
    )
      ? "used_archived_api"
      : "unavailable",
    note: "Identifiants exacts ; captures existantes réutilisées, pas fraîcheur prétendue.",
  },
  {
    provider: "cma",
    status: records.some(
      (row) => row.provider === "cma" && row.status === "available",
    )
      ? "used_archived_api"
      : "unavailable",
    note: "Notices, bibliographies et expositions structurées.",
  },
  {
    provider: "wikidata",
    status: "used_archived_api",
    note: "Identités exactes et créateurs depuis les preuves existantes.",
  },
  {
    provider: "pageviews",
    status: "used_archived_api",
    note: "Douze mois complets ou mois partiels explicitement estimés par le moteur.",
  },
  {
    provider: "wikipedia",
    status: wikipedia.some((row) => row.status === "verified")
      ? "used_verification_api"
      : live
        ? "attempted_unavailable_or_unresolved"
        : "not_collected_offline",
    note: "Vérification des pages de l’objet par wikibase_item ; aucun transfert depuis une série.",
  },
  {
    provider: "smithsonian",
    status: process.env.SMITHSONIAN_API_KEY
      ? "configured_no_linked_ids"
      : "auth_missing",
    note: "Connecteur disponible ; aucun objet lié à un identifiant Smithsonian dans ces cent cibles, aucune recherche homonyme adoptée.",
  },
  {
    provider: "europeana",
    status: process.env.EUROPEANA_API_KEY
      ? "configured_no_linked_ids"
      : "auth_missing",
    note: "Connecteur disponible ; clé et identité précise nécessaires avant exploitation de données.",
  },
  {
    provider: "google-trends",
    status: "not_integrated",
    note: "Aucune intégration authentifiée et comparable disponible ; aucune donnée supposée.",
  },
];
await mkdir(directory, { recursive: true });
await writeFile(
  path.join(directory, "collection.tmp"),
  JSON.stringify(
    {
      mode: live ? "live_with_cache" : "offline_cache",
      records,
      wikipedia,
      providers: providerStates,
    },
    null,
    2,
  ) + "\n",
);
await rename(
  path.join(directory, "collection.tmp"),
  path.join(directory, "collection.json"),
);
console.log(
  `${records.length} notices institutionnelles accessibles par identifiant ; ${wikipedia.filter((row) => row.status === "verified").length}/${wikipedia.length} correspondances Wikipédia vérifiées.`,
);
console.log(
  "Collecte limitée à catalog/rarity-v2 ; archives et catalogue actif inchangés. Smithsonian/Europeana : état d’authentification déclaré, aucune donnée inventée.",
);
