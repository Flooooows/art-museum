import {
  REVIEW_RARITIES,
  type ReviewArtwork,
  type ReviewCatalog,
  type ReviewDecision,
  type ReviewDecisions,
  type ReviewExport,
  type ReviewLevel,
} from "./types";

export const REVIEW_STORAGE_KEY = "muse:rarity-review:v1";
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
export function validLevel(v: unknown): v is ReviewLevel {
  return Number.isInteger(v) && Number(v) >= 0 && Number(v) <= 4;
}
const finite = (v: unknown, lo: number, hi: number) =>
  typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi;

export function parseReviewCatalog(v: unknown): ReviewCatalog {
  if (
    !record(v) ||
    v.schemaVersion !== 1 ||
    typeof v.version !== "string" ||
    typeof v.algorithmVersion !== "string" ||
    typeof v.configurationVersion !== "string" ||
    typeof v.method !== "string" ||
    !Array.isArray(v.works) ||
    v.works.length !== 1000
  )
    throw new Error("Le catalogue de revue est incomplet ou incompatible.");
  const ids = new Set<string>();
  for (const w of v.works) {
    if (
      !record(w) ||
      [
        "id",
        "title",
        "creator",
        "date",
        "family",
        "institution",
        "sourceUrl",
        "imageUrl",
        "license",
        "medium",
        "context",
      ].some((k) => typeof w[k] !== "string") ||
      !w.id ||
      ids.has(w.id as string) ||
      !["existing", "new"].includes(String(w.origin)) ||
      !(w.activeLevel === null || validLevel(w.activeLevel))
    )
      throw new Error("Une fiche du catalogue est invalide ou dupliquée.");
    if (
      !/^https:\/\/(?:www\.)?(?:clevelandart\.org|metmuseum\.org|collections\.louvre\.fr|commons\.wikimedia\.org|www\.louvre\.fr)\//.test(
        w.sourceUrl as string,
      )
    )
      throw new Error("Source institutionnelle de fiche invalide.");
    if (
      !/^\/assets\/[^?#]+$/.test(w.imageUrl as string) &&
      !/^https:\/\/openaccess-cdn\.clevelandart\.org\//.test(
        w.imageUrl as string,
      )
    )
      throw new Error("Source d’image non autorisée.");
    const p = w.proposal;
    if (
      !record(p) ||
      !validLevel(p.level) ||
      !finite(p.score, 0, 100) ||
      !finite(p.confidence, 0, 1) ||
      !record(p.interval) ||
      !finite(p.interval.lower, 0, Number(p.score)) ||
      !finite(p.interval.upper, Number(p.score), 100) ||
      !["confirmed", "provisional"].includes(String(p.status)) ||
      typeof p.stable !== "boolean" ||
      !Array.isArray(p.reasons) ||
      !record(p.criteria)
    )
      throw new Error("Proposition algorithmique invalide.");
    for (const key of ["P", "A", "H", "M", "C"]) {
      const c = p.criteria[key];
      if (
        !record(c) ||
        !finite(c.score, 0, 100) ||
        !["observed", "derived", "estimated"].includes(String(c.type)) ||
        typeof c.method !== "string" ||
        !Array.isArray(c.notes) ||
        !c.notes.every((s) => typeof s === "string") ||
        !Array.isArray(c.sourceUrls) ||
        !c.sourceUrls.every(
          (s) => typeof s === "string" && /^https:\/\//.test(s),
        ) ||
        !Array.isArray(c.comparableIds)
      )
        throw new Error("Critère algorithmique invalide.");
    }
    ids.add(w.id as string);
  }
  return v as unknown as ReviewCatalog;
}

export function makeExport(
  catalog: ReviewCatalog,
  decisions: ReviewDecisions,
  now = new Date().toISOString(),
): ReviewExport {
  return {
    format: "muse-rarity-review",
    schemaVersion: 1,
    catalogVersion: catalog.version,
    algorithmVersion: catalog.algorithmVersion,
    exportedAt: now,
    decisions: Object.values(decisions).sort((a, b) =>
      a.artworkId.localeCompare(b.artworkId),
    ),
  };
}

export function parseReviewExport(
  value: unknown,
  catalog: ReviewCatalog,
): ReviewExport {
  if (
    !record(value) ||
    value.format !== "muse-rarity-review" ||
    value.schemaVersion !== 1 ||
    value.catalogVersion !== catalog.version ||
    value.algorithmVersion !== catalog.algorithmVersion ||
    typeof value.exportedAt !== "string" ||
    !Number.isFinite(Date.parse(value.exportedAt)) ||
    !Array.isArray(value.decisions) ||
    value.decisions.length > catalog.works.length
  )
    throw new Error(
      "Sauvegarde incompatible : format ou version de catalogue différents.",
    );
  const known = new Set(catalog.works.map((w) => w.id));
  const seen = new Set<string>();
  const decisions: ReviewDecision[] = [];
  for (const d of value.decisions) {
    if (
      !record(d) ||
      typeof d.artworkId !== "string" ||
      !known.has(d.artworkId) ||
      seen.has(d.artworkId) ||
      !validLevel(d.finalLevel) ||
      typeof d.decidedAt !== "string" ||
      !Number.isFinite(Date.parse(d.decidedAt))
    )
      throw new Error(
        "Sauvegarde refusée : œuvre inconnue/dupliquée, date ou rareté invalide. Aucun choix n’a été modifié.",
      );
    seen.add(d.artworkId);
    decisions.push({
      artworkId: d.artworkId,
      finalLevel: d.finalLevel,
      decidedAt: d.decidedAt,
    });
  }
  return {
    format: "muse-rarity-review",
    schemaVersion: 1,
    catalogVersion: catalog.version,
    algorithmVersion: catalog.algorithmVersion,
    exportedAt: value.exportedAt,
    decisions,
  };
}

export function decide(
  decisions: ReviewDecisions,
  artworkId: string,
  finalLevel: ReviewLevel | null,
  now = new Date().toISOString(),
): ReviewDecisions {
  const next = { ...decisions };
  if (finalLevel === null) delete next[artworkId];
  else {
    if (!validLevel(finalLevel)) throw new Error("Rareté finale invalide.");
    next[artworkId] = { artworkId, finalLevel, decidedAt: now };
  }
  return next;
}

export function mergeDecisions(
  current: ReviewDecisions,
  incoming: ReviewDecision[],
): ReviewDecisions {
  return {
    ...current,
    ...Object.fromEntries(incoming.map((d) => [d.artworkId, d])),
  };
}

export interface ReviewFilters {
  query: string;
  family: string;
  proposed: string;
  state: "all" | "pending" | "decided" | "different";
  sort: "score-desc" | "score-asc" | "title" | "confidence";
}
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr");
export function filterReviewWorks(
  works: ReviewArtwork[],
  decisions: ReviewDecisions,
  filters: ReviewFilters,
): ReviewArtwork[] {
  const terms = normalize(filters.query.trim()).split(/\s+/).filter(Boolean);
  return works
    .filter((w) => {
      const d = decisions[w.id];
      return (
        (filters.family === "all" || w.family === filters.family) &&
        (filters.proposed === "all" ||
          w.proposal.level === Number(filters.proposed)) &&
        (filters.state === "all" ||
          (filters.state === "pending" && !d) ||
          (filters.state === "decided" && !!d) ||
          (filters.state === "different" &&
            !!d &&
            d.finalLevel !== w.proposal.level)) &&
        terms.every((term) =>
          normalize(
            `${w.title} ${w.creator} ${w.context} ${w.date} ${w.id} ${w.institution}`,
          ).includes(term),
        )
      );
    })
    .sort((a, b) => {
      const diff =
        filters.sort === "title"
          ? a.title.localeCompare(b.title, "fr")
          : filters.sort === "score-asc"
            ? a.proposal.score - b.proposal.score
            : filters.sort === "confidence"
              ? a.proposal.confidence - b.proposal.confidence
              : b.proposal.score - a.proposal.score;
      return diff || a.id.localeCompare(b.id);
    });
}

const csvCell = (v: unknown) => {
  const s = String(v ?? "");
  return `"${(/^[=+\-@\t\r]/.test(s) ? "'" : "") + s.replaceAll('"', '""')}"`;
};
export function reviewCsv(
  catalog: ReviewCatalog,
  decisions: ReviewDecisions,
): string {
  return (
    "\ufeff" +
    [
      [
        "id",
        "titre",
        "artiste_ou_contexte",
        "famille",
        "score_algo",
        "rarete_proposee",
        "confiance",
        "rarete_finale",
        "date_decision",
        "source",
        "version_catalogue",
      ],
      ...catalog.works.map((w) => [
        w.id,
        w.title,
        w.creator,
        w.family,
        w.proposal.score.toFixed(2),
        REVIEW_RARITIES[w.proposal.level],
        w.proposal.confidence.toFixed(3),
        decisions[w.id] ? REVIEW_RARITIES[decisions[w.id].finalLevel] : "",
        decisions[w.id]?.decidedAt ?? "",
        w.sourceUrl,
        catalog.version,
      ]),
    ]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n") +
    "\r\n"
  );
}
