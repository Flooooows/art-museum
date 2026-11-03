/** Rights decisions are independent from rarity, selection and publication. */
export const LEGAL_STATUSES = [
  "AUTO_APPROVED_EU",
  "REVIEW_REQUIRED",
  "BLOCKED",
] as const;
export type LegalStatus = (typeof LEGAL_STATUSES)[number];
export const ENGINE_VERSION = "eu-visual-1.0.0";
export const TERM_DIRECTIVE = "https://eur-lex.europa.eu/eli/dir/2006/116/oj";
export const REPRODUCTION_DIRECTIVE =
  "https://eur-lex.europa.eu/eli/dir/2019/790/oj";
export const SPAIN_TERM =
  "https://www.boe.es/buscar/act.php?id=BOE-A-1996-8930#dtcuarta";

export interface LegalSource {
  url: string;
  label: string;
  kind: "institution" | "authority" | "policy" | "file";
  /** A locator describes the exact field, not merely a link to a museum home page. */
  locator: string;
}
export interface Finding {
  state: "clear" | "uncertain" | "blocked";
  explanation: string;
  sources: LegalSource[];
}
export interface LegalAuthor {
  name: string;
  id: string;
  deathEvidence: { year: number; source: LegalSource }[];
}
export interface LegalInput {
  artworkId: string;
  title: string;
  creator: string;
  sourceUrl: string;
  imageUrl: string | null;
  identity: Finding;
  authorship:
    "identified_single" | "joint" | "anonymous" | "pseudonymous" | "unknown";
  authors: LegalAuthor[];
  /** Permission for the underlying work, not merely for its photograph. */
  artworkPermission: Finding | null;
  /** Explicit checks, never inferred from an empty exceptions array. */
  checks: {
    nationalTerms: Finding;
    publication: Finding;
    creativeContributions: Finding;
    contracts: Finding;
    otherRights: Finding;
  };
  exceptions: string[];
  image: {
    kind: "faithful_non_original" | "original_photograph" | "unknown";
    basis:
      | "CC0"
      | "CC-BY-2.0"
      | "CC-BY-3.0"
      | "CC-BY-4.0"
      | "CC-BY-SA-3.0"
      | "CC-BY-SA-4.0"
      | "ARTICLE_14"
      | "UNKNOWN";
    sourceUrl: string | null;
    licenseUrl: string | null;
    evidence: LegalSource[];
    credit: string;
    /** NC/ND or a binding prohibition, not a bare website copyright notice. */
    commercialUse: "permitted" | "prohibited" | "unknown";
  };
}
export interface LegalDecision {
  status: LegalStatus;
  territory: "European Union";
  verifiedAt: string;
  engineVersion: typeof ENGINE_VERSION;
  generalPublicDomainDate: string | null;
  reasons: string[];
  rules: { id: string; url: string }[];
  attribution: string;
  obligations: string[];
  publicationAuthorized: false;
}

export const validDay = (v: unknown): v is string =>
  typeof v === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v;
export function publicDomainDate(deathYear: number, term = 70): string {
  if (
    !Number.isInteger(deathYear) ||
    deathYear < 1 ||
    deathYear > 9999 - term - 1 ||
    ![70, 80].includes(term)
  )
    throw Error("Année de décès ou durée invalide.");
  return `${String(deathYear + term + 1).padStart(4, "0")}-01-01`;
}
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;
export function safeLegalUrl(v: unknown): v is string {
  if (typeof v !== "string") return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch {
    return false;
  }
}
function source(v: unknown): v is LegalSource {
  return (
    record(v) &&
    safeLegalUrl(v.url) &&
    text(v.label) &&
    text(v.locator) &&
    ["institution", "authority", "policy", "file"].includes(String(v.kind))
  );
}
function finding(v: unknown): v is Finding {
  return (
    record(v) &&
    ["clear", "uncertain", "blocked"].includes(String(v.state)) &&
    text(v.explanation) &&
    Array.isArray(v.sources) &&
    v.sources.every(source) &&
    (v.state !== "clear" || v.sources.length > 0)
  );
}
export function parseLegalInput(v: unknown): LegalInput {
  if (
    !record(v) ||
    !["artworkId", "title", "creator"].every((k) => text(v[k])) ||
    !safeLegalUrl(v.sourceUrl) ||
    !(
      v.imageUrl === null ||
      (typeof v.imageUrl === "string" &&
        (/^\/(?:assets|masterpieces-images|enrichment-351-images)\/[a-zA-Z0-9./_-]+$/.test(
          v.imageUrl,
        ) ||
          safeLegalUrl(v.imageUrl)))
    ) ||
    !finding(v.identity) ||
    ![
      "identified_single",
      "joint",
      "anonymous",
      "pseudonymous",
      "unknown",
    ].includes(String(v.authorship)) ||
    !Array.isArray(v.authors) ||
    !v.authors.every(
      (a) =>
        record(a) &&
        text(a.name) &&
        text(a.id) &&
        Array.isArray(a.deathEvidence) &&
        a.deathEvidence.every(
          (e) =>
            record(e) &&
            Number.isInteger(e.year) &&
            Number(e.year) >= 1 &&
            Number(e.year) <= 9900 &&
            source(e.source),
        ),
    ) ||
    !(v.artworkPermission === null || finding(v.artworkPermission)) ||
    !record(v.checks) ||
    ![
      "nationalTerms",
      "publication",
      "creativeContributions",
      "contracts",
      "otherRights",
    ].every((k) => finding((v.checks as Record<string, unknown>)[k])) ||
    !Array.isArray(v.exceptions) ||
    !v.exceptions.every(text) ||
    !record(v.image) ||
    !["faithful_non_original", "original_photograph", "unknown"].includes(
      String(v.image.kind),
    ) ||
    ![
      "CC0",
      "CC-BY-2.0",
      "CC-BY-3.0",
      "CC-BY-4.0",
      "CC-BY-SA-3.0",
      "CC-BY-SA-4.0",
      "ARTICLE_14",
      "UNKNOWN",
    ].includes(String(v.image.basis)) ||
    !(v.image.sourceUrl === null || safeLegalUrl(v.image.sourceUrl)) ||
    !(v.image.licenseUrl === null || safeLegalUrl(v.image.licenseUrl)) ||
    !Array.isArray(v.image.evidence) ||
    !v.image.evidence.every(source) ||
    typeof v.image.credit !== "string" ||
    !["permitted", "prohibited", "unknown"].includes(
      String(v.image.commercialUse),
    )
  )
    throw Error("Dossier juridique UE invalide.");
  return v as unknown as LegalInput;
}

/** Pure and clock-injected: identical facts + date produce the same decision. */
export function evaluateLegalEU(
  value: LegalInput,
  asOf: string,
): LegalDecision {
  const input = parseLegalInput(value);
  if (!validDay(asOf)) throw Error("Date de vérification invalide.");
  const review: string[] = [],
    blocked: string[] = [];
  const rules = [{ id: "2006/116/EC arts. 1(1), 8", url: TERM_DIRECTIVE }];
  if (input.identity.state !== "clear") review.push(input.identity.explanation);
  if (input.identity.state === "blocked")
    blocked.push(input.identity.explanation);
  if (input.authorship !== "identified_single" || input.authors.length !== 1)
    review.push(
      "Auteur anonyme, pseudonyme, coauteur ou attribution incertaine : calcul adapté nécessaire.",
    );
  const years: number[] = [];
  for (const a of input.authors) {
    const unique = [...new Set(a.deathEvidence.map((e) => e.year))];
    if (
      unique.length !== 1 ||
      !a.deathEvidence.some(
        (e) => e.source.kind === "institution" || e.source.kind === "authority",
      )
    ) {
      review.push(`Décès non établi ou contradictoire : ${a.name}.`);
    } else if (unique[0] > Number(asOf.slice(0, 4))) {
      review.push(`Décès dans le futur : ${a.name}.`);
    } else years.push(unique[0]);
  }
  const lifeRuleApplicable =
    (input.authorship === "identified_single" && input.authors.length === 1) ||
    (input.authorship === "joint" && input.authors.length > 1);
  const generalPublicDomainDate =
    lifeRuleApplicable && years.length && years.length === input.authors.length
      ? publicDomainDate(Math.max(...years))
      : null;
  if (!generalPublicDomainDate)
    review.push("Date d’entrée dans le domaine public non calculable.");
  if (years.some((y) => y < 1987 && publicDomainDate(y, 80) > asOf))
    review.push(
      "Le délai général de 70 ans ne suffit pas pour un feu vert toute UE : durée transitoire espagnole de 80 ans potentiellement encore en cours. Examiner le champ territorial applicable.",
    );
  if (generalPublicDomainDate && generalPublicDomainDate > asOf) {
    // An image licence never substitutes for the underlying artwork's rights.
    if (input.artworkPermission?.state === "clear")
      review.push(
        "Œuvre encore protégée mais permission commerciale distincte documentée : parcours de licence à vérifier, pas une approbation domaine public.",
      );
    else if (input.identity.state === "clear")
      blocked.push(
        `Droits patrimoniaux non expirés selon la règle générale : ${generalPublicDomainDate}. Aucune licence de l’œuvre elle-même établie par ce parcours domaine public.`,
      );
    else
      review.push(
        "Protection potentiellement en cours, mais identité de l’objet à établir avant de conclure définitivement.",
      );
  }
  for (const [key, check] of Object.entries(input.checks)) {
    if (check.state === "blocked") blocked.push(check.explanation);
    if (check.state === "uncertain") review.push(check.explanation);
    if (key === "nationalTerms")
      rules.push({
        id: "2006/116/EC arts. 7, 10 ; Espagne DT4 / 80 ans",
        url: SPAIN_TERM,
      });
  }
  review.push(...input.exceptions);
  const image = input.image;
  if (image.commercialUse === "prohibited")
    blocked.push(
      "Utilisation commerciale du fichier interdite par les conditions applicables.",
    );
  if (
    !input.imageUrl ||
    !image.sourceUrl ||
    !image.evidence.length ||
    !image.licenseUrl
  )
    review.push("Fichier exact ou preuve de réutilisation manquants.");
  if (image.commercialUse === "unknown" || image.basis === "UNKNOWN")
    review.push("Réutilisation commerciale du fichier non établie.");
  const licenseUrls: Record<string, string> = {
    CC0: "https://creativecommons.org/publicdomain/zero/1.0/",
    "CC-BY-2.0": "https://creativecommons.org/licenses/by/2.0/",
    "CC-BY-3.0": "https://creativecommons.org/licenses/by/3.0/",
    "CC-BY-4.0": "https://creativecommons.org/licenses/by/4.0/",
    "CC-BY-SA-3.0": "https://creativecommons.org/licenses/by-sa/3.0/",
    "CC-BY-SA-4.0": "https://creativecommons.org/licenses/by-sa/4.0/",
  };
  if (licenseUrls[image.basis] && image.licenseUrl !== licenseUrls[image.basis])
    review.push(
      "URL de licence non conforme à la licence structurée : contrôle requis.",
    );
  if (image.basis === "ARTICLE_14") {
    rules.push({ id: "2019/790/EU art. 14", url: REPRODUCTION_DIRECTIVE });
    if (image.kind !== "faithful_non_original")
      review.push(
        "Article 14 : fidélité et absence d’originalité non établies ; pas d’exemption automatique pour une photographie créative.",
      );
  }
  if (
    image.kind === "original_photograph" &&
    !Object.hasOwn(licenseUrls, image.basis)
  )
    review.push("Photographie originale sans licence commerciale établie.");
  if (image.basis.startsWith("CC-BY") && !image.credit.trim())
    review.push("Crédit obligatoire de licence incomplet.");
  const status = blocked.length
    ? "BLOCKED"
    : review.length
      ? "REVIEW_REQUIRED"
      : "AUTO_APPROVED_EU";
  return {
    status,
    territory: "European Union",
    verifiedAt: asOf,
    engineVersion: ENGINE_VERSION,
    generalPublicDomainDate,
    rules,
    reasons: [
      ...new Set([
        ...blocked,
        ...review,
        ...(status === "AUTO_APPROVED_EU"
          ? [
              "Auteur et décès établis, délais et contrôles UE satisfaits, fichier commercialement réutilisable. Aucune confirmation manuelle supplémentaire nécessaire.",
            ]
          : []),
      ]),
    ],
    attribution: image.credit,
    obligations: [
      "Respecter les droits moraux nationaux : nom de l’auteur et intégrité ; ne pas suggérer un soutien du musée.",
      ...(image.basis.startsWith("CC-BY")
        ? [
            "Créditer le photographe et la source, lier la licence et indiquer les modifications.",
          ]
        : []),
      ...(image.basis.startsWith("CC-BY-SA")
        ? [
            "Partager les adaptations du fichier sous la même licence ; pas de restriction technique incompatible.",
          ]
        : []),
    ],
    publicationAuthorized: false,
  };
}

export interface LegalDataset {
  catalogVersion: string;
  catalogSha256: string;
  entries: { input: LegalInput; decision: LegalDecision }[];
}
export interface LegalReport {
  schemaVersion: 1;
  engineVersion: typeof ENGINE_VERSION;
  verifiedAt: string;
  evidenceDigest: string;
  datasets: Record<string, LegalDataset>;
}
