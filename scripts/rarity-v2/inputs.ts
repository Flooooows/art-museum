import { readFile } from "node:fs/promises";
import path from "node:path";
import { activeAssessment, parseCatalog } from "../../src/catalog/model";
import { deduplicateStatements } from "../../src/rarity-engine/collection";
import type {
  ArtworkInput,
  Category,
  Evidence,
  MonthlyAudience,
} from "../../src/rarity-engine/types";
import { sha256, payloadHash } from "./http";

type ObjectValue = Record<string, unknown>;
const obj = (value: unknown): ObjectValue =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as ObjectValue)
    : {};
const array = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];
const text = (value: unknown): string =>
  typeof value === "string" ? value : "";
const integer = (value: unknown): number | null =>
  typeof value === "number" && Number.isInteger(value) ? value : null;
const strip = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:amp|nbsp|quot);/g, " ")
    .replace(/\s+/g, " ")
    .trim();

interface LegacyAudience {
  qid: string;
  identityAvailable: boolean;
  identityEvidence: string;
  pages: { language: string; title: string; evidence: string[] }[];
}
interface LegacyObservation {
  id: string;
  sourceUrl: string;
  institutionEvidence: string;
  objectQid: string | null;
  audienceScope: string;
  workAudience: LegacyAudience | null;
  artistAudiences: LegacyAudience[];
}

export async function loadInputs(root: string) {
  const files = new Map<string, { bytes: Buffer; data: ObjectValue }>();
  async function json(file: string) {
    if (!file || path.isAbsolute(file) || file.split(/[\\/]/).includes(".."))
      throw new Error("Chemin de preuve local invalide.");
    if (!files.has(file)) {
      const bytes = await readFile(path.join(root, file));
      files.set(file, { bytes, data: obj(JSON.parse(bytes.toString())) });
    }
    return files.get(file)!.data;
  }
  const seedData = await json("src/catalog/seed.json");
  const seed = parseCatalog(seedData);
  const legacy = await json("catalog/notoriety/observations.json");
  if (legacy.seedSha256 !== sha256(files.get("src/catalog/seed.json")!.bytes))
    throw new Error(
      "Les observations ne correspondent plus au catalogue actif.",
    );
  const observations = array(legacy.works) as unknown as LegacyObservation[];
  const periodRaw = obj(legacy.period);
  const period = { start: text(periodRaw.start), end: text(periodRaw.end) };
  const days = integer(periodRaw.days);
  if (!days || !period.start || !period.end)
    throw new Error("Période des captures absente.");
  const expectedMonths: string[] = [];
  const cursor = new Date(`${period.start}T00:00:00Z`);
  const end = new Date(`${period.end}T00:00:00Z`);
  while (cursor <= end) {
    expectedMonths.push(
      cursor.toISOString().slice(0, 7).replace("-", "") + "0100",
    );
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  const review = await json("catalog/notoriety/editorial-review.json");
  const previous = await json("catalog/notoriety/results.json");
  const editorialWorks = obj(review.works);
  const oldResults = array(previous.works).map(obj);
  const supplementary: ObjectValue = await json(
    "catalog/rarity-v2/collection.json",
  ).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
    return {};
  });
  const wikiRecords = array(supplementary.wikipedia).map(obj);
  const supplementaryRecords = array(supplementary.records).map(obj);

  async function evidence(
    file: string,
    provider: string,
    scope: Evidence["scope"],
    tier: Evidence["tier"],
    url?: string,
    date?: string,
  ): Promise<Evidence> {
    const raw = await json(file);
    const hash = sha256(files.get(file)!.bytes);
    const publicAddress = url || text(raw.sourceUrl) || text(raw.url);
    if (!publicAddress.startsWith("https://"))
      throw new Error(`URL de preuve manquante : ${file}`);
    const retrievedAt = date || text(raw.retrievedAt);
    if (!Number.isFinite(Date.parse(retrievedAt)))
      throw new Error(`Date de preuve manquante : ${file}`);
    const host = new URL(publicAddress).hostname.replace(/^www\./, "");
    const independentGroup = /wiki(?:media|data|pedia)/.test(host)
      ? "wikimedia"
      : /metmuseum/.test(host)
        ? "met"
        : /clevelandart/.test(host)
          ? "cma"
          : /louvre/.test(host)
            ? "louvre"
            : host;
    return {
      id: hash.slice(0, 24),
      provider,
      independentGroup,
      url: publicAddress,
      retrievedAt,
      file,
      sha256: hash,
      scope,
      tier,
    };
  }

  async function audiences(
    audience: LegacyAudience | null,
    scope: "artwork" | "creator",
    expectedQid: string | null,
  ): Promise<MonthlyAudience[]> {
    if (
      !audience?.identityAvailable ||
      !expectedQid ||
      audience.qid !== expectedQid
    )
      return [];
    const identityRaw = await json(audience.identityEvidence);
    if (
      identityRaw.status !== 200 ||
      !obj(obj(obj(identityRaw.response).entities)[expectedQid]).id
    )
      return [];
    const identityEvidence = await evidence(
      audience.identityEvidence,
      "wikidata",
      scope,
      scope === "creator" ? 2 : 1,
    );
    const pages: MonthlyAudience[] = [];
    for (const page of audience.pages) {
      const verification = wikiRecords.find(
        (record) =>
          record.language === page.language && record.title === page.title,
      );
      if (verification && verification.status === "mismatch") continue;
      const monthly: MonthlyAudience = {
        title: page.title,
        language: page.language,
        expectedMonths,
        months: [],
        evidence: [identityEvidence],
      };
      for (const file of page.evidence.filter(Boolean)) {
        const raw = await json(file);
        if (raw.status !== 200) continue;
        const items = array(obj(raw.response).items).map(obj);
        if (
          items.some(
            (item) =>
              item.agent !== "user" ||
              item.access !== "all-access" ||
              item.project !== `${page.language}.wikipedia` ||
              text(item.article).replaceAll("_", " ") !== page.title ||
              integer(item.views) === null ||
              Number(item.views) < 0,
          )
        )
          continue;
        const valid = items.map((item) => ({
          timestamp: text(item.timestamp),
          views: Number(item.views),
        }));
        if (
          valid.some((item) => !expectedMonths.includes(item.timestamp)) ||
          new Set(valid.map((item) => item.timestamp)).size !== valid.length
        )
          continue;
        monthly.months = valid;
        monthly.evidence.push(
          await evidence(file, "pageviews", scope, scope === "creator" ? 2 : 1),
        );
      }
      if (verification && text(verification.evidenceFile))
        monthly.evidence.push(
          await evidence(
            text(verification.evidenceFile),
            "wikipedia",
            scope,
            scope === "creator" ? 2 : 1,
          ),
        );
      // Empty monthly arrays remain explicit unknown pages, never zero traffic.
      pages.push(monthly);
    }
    return pages;
  }

  const works: ArtworkInput[] = [];
  for (const work of seed.works) {
    const observation = observations.find((row) => row.id === work.id);
    if (!observation) throw new Error(`Observation absente pour ${work.id}`);
    const supplement = supplementaryRecords.find(
      (record) => record.artworkId === work.id && record.status === "available",
    );
    const institutionFile =
      supplement && text(supplement.evidenceFile)
        ? text(supplement.evidenceFile)
        : observation.institutionEvidence;
    const rawRecord = await json(institutionFile);
    if (
      "payload" in rawRecord &&
      payloadHash(rawRecord.payload) !== rawRecord.payloadSha256
    )
      throw new Error(`Capture institutionnelle altérée : ${institutionFile}`);
    const response =
      "payload" in rawRecord ? rawRecord.payload : rawRecord.response;
    const isCma = work.id.startsWith("cma-");
    const data = obj(isCma ? obj(response).data : response);
    const externalSource = work.sources.find((source) =>
      ["cma", "met"].includes(source.provider),
    );
    if (
      externalSource &&
      Number(isCma ? data.id : data.objectID) !==
        Number(externalSource.recordId)
    )
      throw new Error(
        `Identité institutionnelle contradictoire pour ${work.id}`,
      );
    const provider = isCma
      ? "cma"
      : work.museumId === "met"
        ? "met"
        : "commons";
    const source = await evidence(institutionFile, provider, "artwork", 1);
    const category = categoryFor(
      work.familyId,
      work.medium,
      text(data.type) || text(data.classification),
    );
    const creatorMode = creatorModeFor(work.creatorDisplayName);
    const yearStart =
      work.yearStart ??
      integer(data.creation_date_earliest) ??
      integer(data.objectBeginDate);
    const yearEnd =
      work.yearEnd ??
      integer(data.creation_date_latest) ??
      integer(data.objectEndDate);
    const culture = isCma
      ? array(data.culture).map(text).join(" ; ")
      : [text(data.culture), text(data.period), text(data.dynasty)]
          .filter(Boolean)
          .join(" ; ");
    const citations = Array.isArray(data.citations)
      ? deduplicateStatements(
          array(data.citations)
            .map(obj)
            .filter((item) => text(item.citation))
            .map((item) => ({
              key: strip(text(item.citation)),
              text: strip(text(item.citation)),
            })),
        )
      : null;
    const exhibitionObject = obj(data.exhibitions);
    const exhibitions = Array.isArray(exhibitionObject.current)
      ? deduplicateStatements(
          array(exhibitionObject.current)
            .map(obj)
            .filter((item) => text(item.title))
            .map((item) => ({
              key: `${strip(text(item.title))} ${text(item.opening_date).slice(0, 10)}`,
              title: strip(text(item.title)),
            })),
        )
      : null;
    const editorial: ArtworkInput["editorial"] = {};
    for (const [key, entry] of Object.entries(obj(editorialWorks[work.id]))) {
      if (!["H", "M", "C"].includes(key)) continue;
      const item = obj(entry);
      if (
        typeof item.score !== "number" ||
        item.score < 0 ||
        item.score > 100 ||
        !text(item.reason)
      )
        throw new Error("Appréciation éditoriale invalide.");
      editorial[key as "H" | "M" | "C"] = {
        score: item.score,
        reason: text(item.reason),
        evidence: await Promise.all(
          array(item.sources)
            .map(text)
            .map((url) =>
              evidence(
                "catalog/notoriety/editorial-review.json",
                "editorial-review",
                "artwork",
                1,
                url,
                text(review.assessedAt),
              ),
            ),
        ),
      };
    }
    const expectedWorkQid =
      work.id === "45434" ? "Q252485" : observation.objectQid;
    const workAudience = await audiences(
      observation.workAudience,
      "artwork",
      expectedWorkQid,
    );
    const artistAudiences = await Promise.all(
      observation.artistAudiences.map((artist) =>
        audiences(artist, "creator", artist.qid),
      ),
    );
    const prior = oldResults.find((row) => row.id === work.id);
    const identityReasons = [
      externalSource
        ? "Identifiant exact concordant avec la notice institutionnelle conservée."
        : "Identité éditoriale explicite Louvre/La Joconde et correspondance Wikidata conservée.",
    ];
    if (observation.audienceScope === "composition")
      identityReasons.push(
        "Exception d’estampe revue : impression du Met Q28912605 et composition identique Q252485, pas audience d’une série.",
      );
    works.push({
      id: work.id,
      title: work.title,
      creator: work.creatorDisplayName,
      creatorMode,
      category,
      medium: work.medium,
      displayDate: work.displayDate,
      yearStart,
      yearEnd,
      institution: work.museumId,
      context: culture || work.origin,
      externalIds: [
        ...work.sources.map((record) => ({
          provider: record.provider,
          id: record.recordId,
        })),
        ...(observation.objectQid
          ? [{ provider: "wikidata", id: observation.objectQid }]
          : []),
      ],
      creatorIds: observation.artistAudiences.map((artist) => artist.qid),
      identity: {
        status: "verified",
        confidence: observation.objectQid ? 0.98 : 0.93,
        reasons: identityReasons,
      },
      activeLevel: activeAssessment(seed, work.id)!.level,
      exploratoryScore:
        typeof obj(prior?.calculation).total === "number"
          ? Number(obj(prior?.calculation).total)
          : null,
      institutionEvidence: [source],
      workAudience,
      artistAudiences,
      audienceScope:
        work.id === "45434" ? "reviewed_composition" : "exact_object",
      institutionSignals: {
        collectionVerified: true,
        publicRecord: true,
        highlight:
          typeof data.is_highlight === "boolean"
            ? data.is_highlight
            : typeof data.isHighlight === "boolean"
              ? data.isHighlight
              : null,
        citations,
        exhibitions,
        educationText:
          text(data.early_education_description) ||
          text(data.artlens_description) ||
          null,
      },
      editorial,
    });
  }
  return {
    works,
    days,
    period,
    languages: array(legacy.languages).map(text),
    seed,
    files: Object.fromEntries(
      [...files.entries()]
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([file, record]) => [file, sha256(record.bytes)]),
    ),
    supplementary,
  };
}

export function creatorModeFor(creator: string): ArtworkInput["creatorMode"] {
  if (
    /^(?:Atelier.*non identifié|Atelier romain|Égypte ancienne|Culture|Fabrication|Scribe et peintre|Ateliers des Pays)/i.test(
      creator,
    )
  )
    return "anonymous";
  if (/Atelier (?:de|d[’']|du)|Suiveur de|Entourage de/i.test(creator))
    return "workshop";
  if (/Attribué|Probablement|probably|attributed/i.test(creator))
    return "uncertain";
  return "identified";
}

export function categoryFor(
  family: string,
  medium: string,
  type: string,
): Category {
  if (family === "archeologie" || /arch[eé]olog/i.test(family))
    return "antiquity";
  if (/parchemin|papyrus|manuscript|manuscrit/i.test(`${medium} ${type}`))
    return "manuscript";
  if (/photograph|photograph/i.test(`${medium} ${type}`)) return "photography";
  if (family === "arts-decoratifs" || /decorati|décorati/i.test(family))
    return "decorative";
  if (
    /sculpture|statue|statuette|bronze|marbre|schiste|grès|terre cuite/i.test(
      `${medium} ${type}`,
    )
  )
    return "sculpture";
  if (
    /painting|huile|tempera|estampe|woodblock|encre|peinture|fresque|fresco/i.test(
      `${medium} ${type}`,
    )
  )
    return "painting";
  return "other";
}
