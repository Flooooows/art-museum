import type {
  ReviewArtwork,
  ReviewDecision,
  ReviewLevel,
} from "../review/types";
import { validLevel } from "../review/model";
import { CRITERIA } from "../rarity-engine/types";

export const STORAGE_KEY = "muse:masterpieces-review:v1";
export const STATUSES = {
  accepted: "Retenir",
  rejected: "Écarter",
  deferred: "Reporter",
  reexamine: "Réexaminer",
} as const;
export type SelectionStatus = keyof typeof STATUSES;
export interface CandidateMetadata {
  id: string;
  title: string;
  creator: string;
  region: string;
  sourceUrl: string;
  inventoryNumber: string;
  rationale: string;
  recommended: boolean;
  rights: {
    status: "cleared" | "rights_review_required";
    license: string;
    licenseUrl: string;
    artwork: string;
    image: string;
    jurisdiction: string;
  };
}
export interface CandidateCatalog {
  schemaVersion: 1;
  version: string;
  works: ReviewArtwork[];
  candidates: CandidateMetadata[];
  summary: {
    researchedExactObjects: number;
    recommended: number;
    rightsReviewRequired: number;
    eligibleNotSelected: number;
  };
}
type EventBase = { id: string; artworkId: string; at: string };
export type ReviewEvent = EventBase &
  (
    | { kind: "rarity"; level: ReviewLevel | null }
    | { kind: "selection"; status: SelectionStatus }
  );
export interface CandidateExport {
  format: "muse-masterpieces-review";
  schemaVersion: 1;
  catalogVersion: string;
  events: ReviewEvent[];
}
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const score = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100;
const hosts = new Set([
  "www.artic.edu",
  "www.metmuseum.org",
  "www.moma.org",
  "www.nasjonalmuseet.no",
  "commons.wikimedia.org",
  "creativecommons.org",
  "collections.louvre.fr",
  "iiif.musee-orsay.fr",
  "www.nationalgallery.org.uk",
  "www.rijksmuseum.nl",
  "www.mauritshuis.nl",
  "courtauld.ac.uk",
  "www.marmottan.fr",
  "www.phillipscollection.org",
  "krollermuller.nl",
  "www.getty.edu",
  "www.vangoghmuseum.nl",
  "buffaloakg.org",
  "online-sammlung.hamburger-kunsthalle.de",
]);
function safeUrl(v: unknown) {
  if (typeof v !== "string") return false;
  try {
    const u = new URL(v);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      hosts.has(u.hostname)
    );
  } catch {
    return false;
  }
}
export function parseCandidateCatalog(
  v: unknown,
  imageDirectory:
    "/masterpieces-images" | "/enrichment-351-images" = "/masterpieces-images",
): CandidateCatalog {
  if (
    !record(v) ||
    v.schemaVersion !== 1 ||
    typeof v.version !== "string" ||
    !/^masterpieces-[a-f0-9]{16}$/.test(v.version) ||
    !Array.isArray(v.works) ||
    !v.works.length ||
    v.works.length > 100 ||
    !Array.isArray(v.candidates) ||
    v.candidates.length > 500 ||
    !record(v.summary)
  )
    throw Error("Catalogue des candidates incompatible.");
  const ids = new Set<string>(),
    metadata = new Map<string, Record<string, unknown>>();
  for (const c of v.candidates) {
    if (
      !record(c) ||
      typeof c.id !== "string" ||
      metadata.has(c.id) ||
      !["title", "creator", "region", "inventoryNumber", "rationale"].every(
        (k) => typeof c[k] === "string",
      ) ||
      !safeUrl(c.sourceUrl) ||
      typeof c.recommended !== "boolean" ||
      !record(c.rights) ||
      !["cleared", "rights_review_required"].includes(
        String(c.rights.status),
      ) ||
      !safeUrl(c.rights.licenseUrl) ||
      !["license", "artwork", "image", "jurisdiction"].every(
        (k) => typeof (c.rights as Record<string, unknown>)[k] === "string",
      )
    )
      throw Error("Métadonnées ou droits de candidate invalides.");
    metadata.set(c.id, c);
  }
  for (const w of v.works) {
    if (
      !record(w) ||
      typeof w.id !== "string" ||
      !/^[a-zA-Z0-9.-]+$/.test(w.id) ||
      ids.has(w.id) ||
      ![
        "title",
        "creator",
        "date",
        "medium",
        "context",
        "family",
        "institution",
        "license",
      ].every((k) => typeof w[k] === "string") ||
      !safeUrl(w.sourceUrl) ||
      w.imageUrl !== `${imageDirectory}/${w.id}.webp` ||
      w.activeLevel !== null ||
      w.origin !== "new" ||
      !record(w.proposal)
    )
      throw Error("Carte candidate invalide.");
    const c = metadata.get(w.id);
    if (
      !c?.recommended ||
      (c.rights as Record<string, unknown>).status !== "cleared" ||
      c.sourceUrl !== w.sourceUrl
    )
      throw Error("Image sans approbation de droits.");
    const p = w.proposal;
    if (
      !score(p.score) ||
      !validLevel(p.level) ||
      !score(p.confidence) ||
      p.confidence > 1 ||
      !record(p.interval) ||
      !score(p.interval.lower) ||
      !score(p.interval.upper) ||
      p.interval.lower > p.score ||
      p.interval.upper < p.score ||
      !["confirmed", "provisional"].includes(String(p.status)) ||
      typeof p.stable !== "boolean" ||
      !Array.isArray(p.reasons) ||
      !p.reasons.every((v) => typeof v === "string") ||
      !record(p.criteria)
    )
      throw Error("Proposition V2 invalide.");
    for (const key of CRITERIA) {
      const c = p.criteria[key];
      if (
        !record(c) ||
        !score(c.score) ||
        !score(c.lower) ||
        !score(c.upper) ||
        !["observed", "derived", "estimated"].includes(String(c.type)) ||
        typeof c.method !== "string" ||
        !["notes", "sourceUrls", "comparableIds"].every(
          (k) =>
            Array.isArray(c[k]) && c[k].every((v) => typeof v === "string"),
        )
      )
        throw Error("Critères V2 invalides.");
    }
    ids.add(w.id);
  }
  if (
    v.summary.recommended !== ids.size ||
    v.summary.researchedExactObjects !== metadata.size ||
    v.candidates.filter((c) => c.recommended).length !== ids.size
  )
    throw Error("Décompte des candidates incohérent.");
  return v as unknown as CandidateCatalog;
}
export function makeExport(
  catalog: CandidateCatalog,
  events: ReviewEvent[],
): CandidateExport {
  return {
    format: "muse-masterpieces-review",
    schemaVersion: 1,
    catalogVersion: catalog.version,
    events,
  };
}
export function parseCandidateExport(
  value: unknown,
  catalog: CandidateCatalog,
): CandidateExport {
  if (
    !record(value) ||
    value.format !== "muse-masterpieces-review" ||
    value.schemaVersion !== 1 ||
    value.catalogVersion !== catalog.version ||
    !Array.isArray(value.events) ||
    value.events.length > 20000
  )
    throw Error(
      "Export incompatible : utiliser le fichier des nouvelles candidates, pas celui des 1 000 œuvres. Aucun choix modifié.",
    );
  const artworks = new Set(catalog.candidates.map((w) => w.id)),
    illustrated = new Set(catalog.works.map((w) => w.id)),
    ids = new Set<string>();
  for (const e of value.events) {
    if (
      !record(e) ||
      typeof e.id !== "string" ||
      !/^[a-zA-Z0-9-]{1,100}$/.test(e.id) ||
      ids.has(e.id) ||
      typeof e.artworkId !== "string" ||
      !artworks.has(e.artworkId) ||
      typeof e.at !== "string" ||
      !Number.isFinite(Date.parse(e.at)) ||
      new Date(e.at).toISOString() !== e.at ||
      !(
        (e.kind === "rarity" &&
          illustrated.has(e.artworkId) &&
          (e.level === null || validLevel(e.level))) ||
        (e.kind === "selection" &&
          typeof e.status === "string" &&
          Object.hasOwn(STATUSES, e.status))
      )
    )
      throw Error(
        "Historique invalide ou œuvre inconnue ; aucun choix modifié.",
      );
    ids.add(e.id);
  }
  return value as unknown as CandidateExport;
}
export function mergeEvents(
  current: ReviewEvent[],
  incoming: ReviewEvent[],
): ReviewEvent[] {
  const all = new Map(current.map((e) => [e.id, e]));
  for (const event of incoming) {
    const existing = all.get(event.id);
    if (
      existing &&
      (existing.artworkId !== event.artworkId ||
        existing.at !== event.at ||
        existing.kind !== event.kind ||
        (existing.kind === "rarity" &&
          event.kind === "rarity" &&
          existing.level !== event.level) ||
        (existing.kind === "selection" &&
          event.kind === "selection" &&
          existing.status !== event.status))
    )
      throw Error("Conflit d’identifiant d’historique ; import refusé.");
    all.set(event.id, event);
  }
  if (all.size > 20000)
    throw Error(
      "Historique trop volumineux ; exporte tes choix avant de continuer.",
    );
  return [...all.values()].sort(
    (a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id),
  );
}
export function decisionsFor(events: ReviewEvent[]) {
  const rarities: Record<string, ReviewDecision> = {},
    selections: Record<string, SelectionStatus> = {};
  for (const event of mergeEvents([], events)) {
    if (event.kind === "selection") selections[event.artworkId] = event.status;
    else if (event.level === null) delete rarities[event.artworkId];
    else
      rarities[event.artworkId] = {
        artworkId: event.artworkId,
        finalLevel: event.level,
        decidedAt: event.at,
      };
  }
  return { rarities, selections };
}
