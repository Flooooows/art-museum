import type {
  ArtworkInput,
  Category,
  Evidence,
} from "../../src/rarity-engine/types";
import { deduplicateStatements } from "../../src/rarity-engine/collection";

export interface MuseumRecord {
  id: number;
  accession_number: string;
  title: string;
  share_license_status: string;
  creation_date: string;
  creation_date_earliest: number | null;
  creation_date_latest: number | null;
  technique: string;
  department: string;
  type: string;
  culture: string[];
  creators: { description: string; qualifier?: string | null }[];
  images: { web?: { url: string; width: string; height: string } };
  url: string;
  citations?: { citation: string }[] | null;
  exhibitions?: { current?: { title: string; opening_date?: string }[] } | null;
  is_highlight?: boolean;
  early_education_description?: string | null;
  artlens_description?: string | null;
}

export const COLLECTION_GROUPS = [
  { type: "Painting", family: "Peinture", count: 180 },
  { type: "Sculpture", family: "Sculpture", count: 120 },
  { type: "Print", family: "Estampes", count: 150 },
  { type: "Drawing", family: "Dessins", count: 100 },
  { type: "Photograph", family: "Photographie", count: 90 },
  { type: "Textile", family: "Textiles", count: 90 },
  { type: "Ceramic", family: "Céramique", count: 90 },
  { type: "Metalwork", family: "Arts du métal", count: 80 },
] as const;

export function validMuseumRecord(value: unknown): value is MuseumRecord {
  if (!value || typeof value !== "object") return false;
  const r = value as MuseumRecord;
  const image = r.images?.web;
  return (
    Number.isSafeInteger(r.id) &&
    r.id > 0 &&
    r.share_license_status === "CC0" &&
    typeof r.title === "string" &&
    !!r.title.trim() &&
    typeof r.accession_number === "string" &&
    !!r.accession_number.trim() &&
    typeof r.creation_date === "string" &&
    !!r.creation_date.trim() &&
    typeof r.technique === "string" &&
    typeof r.type === "string" &&
    typeof r.department === "string" &&
    Array.isArray(r.culture) &&
    Array.isArray(r.creators) &&
    !!image &&
    /^https:\/\/openaccess-cdn\.clevelandart\.org\//.test(image.url) &&
    /^https:\/\/(?:www\.)?clevelandart\.org\/art\//.test(r.url) &&
    Number(image.width) > 0 &&
    Number(image.height) > 0
  );
}

export const plain = (text: string) =>
  text
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&(?:nbsp|quot);/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function categoryForRecord(r: MuseumRecord): Category {
  if (
    /Egyptian|Ancient Near Eastern|Greek and Roman|Art of the Americas/i.test(
      r.department,
    ) &&
    r.creation_date_latest !== null &&
    r.creation_date_latest < 1500
  )
    return "antiquity";
  if (r.type === "Photograph") return "photography";
  if (r.type === "Sculpture") return "sculpture";
  if (["Painting", "Print", "Drawing"].includes(r.type)) return "painting";
  return "decorative";
}

export function museumInput(r: MuseumRecord, evidence: Evidence): ArtworkInput {
  const creator = r.creators
    .map((c) => [c.qualifier, c.description].filter(Boolean).join(" "))
    .join(" ; ");
  const creatorMode = !creator
    ? "anonymous"
    : /attribut|probably|possibly|manner of|style of|after |workshop|studio of|circle of/i.test(
          creator,
        )
      ? "uncertain"
      : "identified";
  const citations = Array.isArray(r.citations)
    ? deduplicateStatements(
        r.citations
          .filter((c) => c.citation)
          .map((c) => ({ key: plain(c.citation), text: plain(c.citation) })),
      )
    : null;
  const exhibitions = Array.isArray(r.exhibitions?.current)
    ? deduplicateStatements(
        r.exhibitions.current
          .filter((e) => e.title)
          .map((e) => ({
            key: `${plain(e.title)} ${(e.opening_date ?? "").slice(0, 10)}`,
            title: plain(e.title),
          })),
      )
    : null;
  return {
    id: `cma-${r.id}`,
    title: plain(r.title),
    creator: creator || "Auteur non identifié",
    creatorMode,
    category: categoryForRecord(r),
    medium: plain(r.technique),
    displayDate: plain(r.creation_date),
    yearStart: Number.isInteger(r.creation_date_earliest)
      ? r.creation_date_earliest
      : null,
    yearEnd: Number.isInteger(r.creation_date_latest)
      ? r.creation_date_latest
      : null,
    institution: "cma",
    context: r.culture.join(" ; ") || r.department,
    externalIds: [{ provider: "cma", id: String(r.id) }],
    identity: {
      status: "verified",
      confidence: 0.93,
      reasons: [
        "Identifiant et notice exacts de l’API institutionnelle Cleveland ; aucune correspondance Wikipédia supposée.",
      ],
    },
    // Required by the existing engine contract, never used to score; not an active assessment.
    activeLevel: 0,
    exploratoryScore: null,
    institutionEvidence: [evidence],
    workAudience: [],
    artistAudiences: [],
    audienceScope: "exact_object",
    editorial: {},
    institutionSignals: {
      collectionVerified: true,
      publicRecord: true,
      highlight: typeof r.is_highlight === "boolean" ? r.is_highlight : null,
      citations,
      exhibitions,
      educationText:
        r.early_education_description || r.artlens_description || null,
    },
  };
}
