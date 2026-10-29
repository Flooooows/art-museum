export type PublicationStatus = "draft" | "demo" | "published";
export interface FamilyRecord {
  id: string;
  name: string;
}
export interface MuseumRecord {
  id: string;
  name: string;
  city: string;
  country: string;
  website: string;
}
export interface CatalogRecord {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  familyIds: string[];
  color: string;
  image: string;
  texture: string;
  frameFamily?: string;
  status: PublicationStatus;
}
export interface WorkRecord {
  id: string;
  title: string;
  creatorDisplayName: string;
  displayDate: string;
  yearStart: number | null;
  yearEnd: number | null;
  medium: string;
  origin: string;
  familyId: string;
  primaryCatalogId: string;
  museumId: string;
  rarityAssessmentId: string | null;
  anecdote: string;
  story: string;
  status: PublicationStatus;
  sources: { provider: string; recordId: string; url: string }[];
}
export interface ImageRightsVerification {
  provider: "met" | "cma" | "commons";
  recordUrl: string;
  policyUrl: string;
  sourceImageUrl: string;
  evidenceFile: string;
  retrievedAt: string;
  sha256: string;
  sourceSha256: string;
  decodedPixelsSha256: string | null;
  note: string;
}
export interface WorkImage {
  id: string;
  workId: string;
  url: string;
  sourceUrl: string;
  alt: string;
  primary: boolean;
  rights: {
    license: "CC0" | "public-domain" | "unknown";
    statement: string;
    reviewStatus: "needs_review" | "verified";
    reviewedAt: string | null;
    verification?: ImageRightsVerification;
  };
}
export const RARITY_CRITERIA = {
  visualRecognition: 40,
  popularCulture: 25,
  educationalReach: 20,
  geographicReach: 15,
} as const;
export const RARITY_SCORE_THRESHOLDS = [30, 50, 70, 90] as const;

export function rarityLevelForScore(score: number): number {
  requireValue(
    Number.isFinite(score) && score >= 0 && score <= 100,
    "score total de notoriété attendu entre 0 et 100",
  );
  return RARITY_SCORE_THRESHOLDS.filter((threshold) => score >= threshold)
    .length;
}

export interface RarityAssessment {
  id: string;
  workId: string;
  version: number;
  level: number;
  rubricVersion: string;
  audience: string;
  status: "provisional" | "needs_review" | "validated";
  confidence: "unassessed" | "low" | "medium" | "high";
  assessedAt: string | null;
  scores: Record<keyof typeof RARITY_CRITERIA, number | null>;
  justification: string;
  sources: string[];
}
export interface CatalogDataset {
  schemaVersion: 1;
  families: FamilyRecord[];
  museums: MuseumRecord[];
  catalogs: CatalogRecord[];
  works: WorkRecord[];
  images: WorkImage[];
  memberships: { workId: string; catalogId: string }[];
  rarityAssessments: RarityAssessment[];
}

function requireValue(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Catalogue invalide : ${message}`);
}
function record(value: unknown): asserts value is Record<string, unknown> {
  requireValue(
    value && typeof value === "object" && !Array.isArray(value),
    "objet attendu",
  );
}
function text(value: unknown): asserts value is string {
  requireValue(
    typeof value === "string" && value.trim().length > 0,
    "texte non vide attendu",
  );
}
function list(value: unknown): asserts value is unknown[] {
  requireValue(Array.isArray(value), "liste attendue");
}
function oneOf(value: unknown, choices: readonly string[]) {
  requireValue(
    typeof value === "string" && choices.includes(value),
    `valeur attendue parmi ${choices.join(", ")}`,
  );
}
function https(value: unknown) {
  text(value);
  let valid = false;
  try {
    valid = new URL(value).protocol === "https:";
  } catch {
    /* Invalid input is reported through the domain validation error. */
  }
  requireValue(valid, "URL HTTPS attendue");
}
function date(value: unknown) {
  requireValue(
    value === null ||
      (typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}/.test(value) &&
        Number.isFinite(Date.parse(value))),
    "date ISO ou null attendue",
  );
}
function unique(values: string[], label: string) {
  requireValue(new Set(values).size === values.length, `${label} dupliqué`);
}

export function latestAssessment(
  data: CatalogDataset,
  workId: string,
): RarityAssessment | null {
  return data.rarityAssessments
    .filter((item) => item.workId === workId)
    .reduce<RarityAssessment | null>(
      (latest, item) =>
        !latest || item.version > latest.version ? item : latest,
      null,
    );
}

export function activeAssessment(
  data: CatalogDataset,
  workId: string,
): RarityAssessment | null {
  const work = data.works.find((item) => item.id === workId);
  return (
    data.rarityAssessments.find(
      (item) => item.id === work?.rarityAssessmentId && item.workId === workId,
    ) ?? null
  );
}

export function publicationIssues(
  data: CatalogDataset,
  workId: string,
): string[] {
  const work = data.works.find((item) => item.id === workId);
  if (!work) return ["œuvre inconnue"];
  const issues: string[] = [];
  if (!work.sources.length) issues.push("notice source manquante");
  const image = data.images.find(
    (item) => item.workId === workId && item.primary,
  );
  if (
    !image ||
    image.rights.license === "unknown" ||
    image.rights.reviewStatus !== "verified" ||
    !image.rights.reviewedAt ||
    !image.rights.verification
  )
    issues.push("droits de reproduction à vérifier");
  if (activeAssessment(data, workId)?.status !== "validated")
    issues.push("rareté éditoriale à valider");
  return issues;
}

export function publishWork(
  data: CatalogDataset,
  workId: string,
): CatalogDataset {
  const issues = publicationIssues(data, workId);
  requireValue(
    !issues.length,
    `publication refusée pour ${workId} : ${issues.join(" ; ")}`,
  );
  const next: CatalogDataset = {
    ...data,
    works: data.works.map((work) =>
      work.id === workId ? { ...work, status: "published" } : work,
    ),
  };
  return parseCatalog(next);
}

export function parseCatalog(value: unknown): CatalogDataset {
  record(value);
  requireValue(value.schemaVersion === 1, "version non prise en charge");
  const tables = [
    "families",
    "museums",
    "catalogs",
    "works",
    "images",
    "memberships",
    "rarityAssessments",
  ] as const;
  for (const table of tables) {
    list(value[table]);
    for (const row of value[table]) {
      record(row);
      if (table !== "memberships") text(row.id);
    }
    if (table !== "memberships")
      unique(
        value[table].map((row) => (row as { id: string }).id),
        table,
      );
  }
  const data = value as unknown as CatalogDataset;
  const has = (table: { id: string }[], id: unknown) =>
    typeof id === "string" && table.some((row) => row.id === id);
  for (const family of data.families) text(family.name);
  for (const museum of data.museums) {
    text(museum.name);
    text(museum.city);
    text(museum.country);
    https(museum.website);
  }
  for (const catalog of data.catalogs) {
    for (const field of [
      catalog.title,
      catalog.subtitle,
      catalog.description,
      catalog.image,
      catalog.texture,
    ])
      text(field);
    requireValue(
      /^#[a-f\d]{6}$/i.test(catalog.color),
      "couleur de catalogue invalide",
    );
    if (catalog.frameFamily !== undefined) text(catalog.frameFamily);
    oneOf(catalog.status, ["draft", "demo", "published"]);
    list(catalog.familyIds);
    requireValue(catalog.familyIds.length, "catalogue sans famille");
    unique(catalog.familyIds, "famille de catalogue");
    requireValue(
      catalog.familyIds.every((id) => has(data.families, id)),
      "famille de catalogue inconnue",
    );
  }
  const externalIds: string[] = [];
  for (const work of data.works) {
    for (const field of [
      work.title,
      work.creatorDisplayName,
      work.displayDate,
      work.medium,
      work.origin,
      work.anecdote,
      work.story,
    ])
      text(field);
    requireValue(
      has(data.families, work.familyId) &&
        has(data.catalogs, work.primaryCatalogId) &&
        has(data.museums, work.museumId),
      "référence d’œuvre inconnue",
    );
    requireValue(
      data.catalogs
        .find((catalog) => catalog.id === work.primaryCatalogId)!
        .familyIds.includes(work.familyId),
      "famille principale incohérente",
    );
    oneOf(work.status, ["draft", "demo", "published"]);
    requireValue(
      work.status === "draft" ||
        data.catalogs.find((catalog) => catalog.id === work.primaryCatalogId)!
          .status !== "draft",
      "catalogue principal indisponible",
    );
    requireValue(
      [work.yearStart, work.yearEnd].every(
        (year) => year === null || Number.isInteger(year),
      ),
      "bornes de datation invalides",
    );
    requireValue(
      work.yearStart === null ||
        work.yearEnd === null ||
        work.yearStart <= work.yearEnd,
      "datation inversée",
    );
    list(work.sources);
    requireValue(
      work.status === "draft" || work.sources.length > 0,
      "notice source manquante",
    );
    for (const source of work.sources) {
      record(source);
      text(source.provider);
      text(source.recordId);
      https(source.url);
      externalIds.push(JSON.stringify([source.provider, source.recordId]));
    }
  }
  unique(externalIds, "identifiant de notice externe");
  for (const image of data.images) {
    requireValue(has(data.works, image.workId), "œuvre d’image inconnue");
    text(image.url);
    requireValue(
      (/^\/assets\/[a-zA-Z0-9/_.-]+$/.test(image.url) &&
        !image.url.includes("..")) ||
        image.url.startsWith("https://"),
      "URL d’image invalide",
    );
    if (image.url.startsWith("https://")) https(image.url);
    text(image.alt);
    https(image.sourceUrl);
    requireValue(
      typeof image.primary === "boolean",
      "indicateur d’image principale invalide",
    );
    record(image.rights);
    oneOf(image.rights.license, ["CC0", "public-domain", "unknown"]);
    text(image.rights.statement);
    oneOf(image.rights.reviewStatus, ["needs_review", "verified"]);
    date(image.rights.reviewedAt);
    const verification = image.rights.verification;
    if (verification !== undefined) {
      record(verification);
      oneOf(verification.provider, ["met", "cma", "commons"]);
      for (const url of [
        verification.recordUrl,
        verification.policyUrl,
        verification.sourceImageUrl,
      ])
        https(url);
      requireValue(
        typeof verification.evidenceFile === "string" &&
          /^catalog\/evidence\/[a-z0-9-]+\.json$/.test(
            verification.evidenceFile,
          ),
        "chemin de preuve des droits invalide",
      );
      date(verification.retrievedAt);
      requireValue(
        verification.retrievedAt !== null,
        "date de collecte manquante",
      );
      for (const hash of [verification.sha256, verification.sourceSha256])
        requireValue(
          typeof hash === "string" && /^[a-f0-9]{64}$/.test(hash),
          "empreinte d’image invalide",
        );
      requireValue(
        verification.decodedPixelsSha256 === null ||
          (typeof verification.decodedPixelsSha256 === "string" &&
            /^[a-f0-9]{64}$/.test(verification.decodedPixelsSha256)),
        "empreinte des pixels invalide",
      );
      text(verification.note);
    }
    if (image.rights.reviewStatus === "verified")
      requireValue(
        image.rights.reviewedAt &&
          image.rights.license !== "unknown" &&
          verification,
        "droits déclarés vérifiés sans date, licence ou preuve",
      );
  }
  for (const membership of data.memberships)
    requireValue(
      has(data.works, membership.workId) &&
        has(data.catalogs, membership.catalogId),
      "appartenance inconnue",
    );
  unique(
    data.memberships.map((item) =>
      JSON.stringify([item.workId, item.catalogId]),
    ),
    "appartenance œuvre/catalogue",
  );
  for (const assessment of data.rarityAssessments) {
    requireValue(
      has(data.works, assessment.workId),
      "œuvre d’évaluation inconnue",
    );
    requireValue(
      Number.isInteger(assessment.version) &&
        assessment.version > 0 &&
        Number.isInteger(assessment.level) &&
        assessment.level >= 0 &&
        assessment.level < 5,
      "version ou niveau de rareté invalide",
    );
    text(assessment.rubricVersion);
    text(assessment.audience);
    text(assessment.justification);
    oneOf(assessment.status, ["provisional", "needs_review", "validated"]);
    oneOf(assessment.confidence, ["unassessed", "low", "medium", "high"]);
    date(assessment.assessedAt);
    record(assessment.scores);
    requireValue(
      Object.keys(assessment.scores).sort().join(",") ===
        Object.keys(RARITY_CRITERIA).sort().join(","),
      "critères de notoriété inattendus",
    );
    for (const [criterion, maximum] of Object.entries(RARITY_CRITERIA)) {
      const score =
        assessment.scores[criterion as keyof typeof RARITY_CRITERIA];
      requireValue(
        score === null ||
          (typeof score === "number" &&
            Number.isFinite(score) &&
            score >= 0 &&
            score <= maximum),
        "score de notoriété invalide",
      );
    }
    list(assessment.sources);
    for (const source of assessment.sources) https(source);
    if (assessment.status === "validated") {
      const scores = Object.values(assessment.scores);
      requireValue(
        scores.every((score) => score !== null) &&
          assessment.sources.length &&
          assessment.assessedAt &&
          assessment.confidence !== "unassessed",
        "évaluation validée sans critères, preuves, confiance ou date",
      );
      const total = scores.reduce<number>(
        (sum, score) => sum + (score ?? 0),
        0,
      );
      requireValue(
        assessment.level === rarityLevelForScore(total),
        "rareté incohérente avec le score documenté",
      );
    }
  }
  unique(
    data.rarityAssessments.map((item) =>
      JSON.stringify([item.workId, item.version]),
    ),
    "version d’évaluation",
  );
  for (const work of data.works) {
    requireValue(
      data.memberships.some(
        (item) =>
          item.workId === work.id && item.catalogId === work.primaryCatalogId,
      ),
      "appartenance principale manquante",
    );
    const count = data.images.filter(
      (image) => image.workId === work.id && image.primary,
    ).length;
    requireValue(
      count <= 1 && (work.status === "draft" || count === 1),
      "image principale manquante ou multiple",
    );
    requireValue(
      work.rarityAssessmentId === null || activeAssessment(data, work.id),
      "référence d’évaluation inconnue",
    );
    requireValue(
      work.status === "draft" || activeAssessment(data, work.id),
      "rareté de démonstration manquante",
    );
    if (work.status === "published")
      requireValue(
        !publicationIssues(data, work.id).length,
        `publication non validée : ${work.id}`,
      );
  }
  for (const catalog of data.catalogs.filter(
    (item) => item.status !== "draft",
  )) {
    const members = data.memberships.filter(
      (item) => item.catalogId === catalog.id,
    );
    requireValue(
      members.some(
        (member) =>
          data.works.find((work) => work.id === member.workId)?.status !==
          "draft",
      ),
      "catalogue actif sans œuvre disponible",
    );
    if (catalog.status === "published")
      requireValue(
        members.length > 0 &&
          members.every(
            (member) =>
              data.works.find((work) => work.id === member.workId)?.status ===
              "published",
          ),
        "catalogue publié avec des fiches non publiées",
      );
  }
  return data;
}
