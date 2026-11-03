export interface TaxonomyCatalog {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  kind: "type" | "theme";
  familyId: string;
  frameFamily: string;
  color: string;
  texture: string;
  coverArtworkId: string;
}
export interface TaxonomyAssignment {
  artworkId: string;
  primaryCatalogId: string;
  themeIds: string[];
  sourceType: string;
  sourceFiles: string[];
  reason: string;
  themeReasons: Record<string, string>;
}
export interface CatalogTaxonomy {
  schemaVersion: 1;
  id: string;
  releaseId: string;
  sourceHashes: Record<string, string>;
  catalogs: TaxonomyCatalog[];
  assignments: TaxonomyAssignment[];
}
function requireValue(value: unknown, message: string): asserts value {
  if (!value) throw Error(`Classement invalide : ${message}`);
}
const text = (s: unknown): s is string =>
  typeof s === "string" && s.trim().length > 0;
export function parseTaxonomy(
  value: unknown,
  works: { id: string }[],
  releaseId: string,
): CatalogTaxonomy {
  const t = value as CatalogTaxonomy;
  requireValue(
    t && t.schemaVersion === 1 && text(t.id) && t.releaseId === releaseId,
    "version/livraison",
  );
  requireValue(
    t.sourceHashes &&
      Object.values(t.sourceHashes).every((h) => /^[a-f0-9]{64}$/.test(h)),
    "empreintes sources",
  );
  requireValue(
    Array.isArray(t.catalogs) && t.catalogs.length > 0,
    "catalogues absents",
  );
  const cats = new Map<string, TaxonomyCatalog>(),
    ids = new Set(works.map((w) => w.id));
  for (const c of t.catalogs) {
    requireValue(
      c &&
        /^[a-z0-9-]+$/.test(c.id) &&
        !cats.has(c.id) &&
        [c.title, c.subtitle, c.description, c.familyId, c.frameFamily].every(
          text,
        ) &&
        ["type", "theme"].includes(c.kind) &&
        ["beaux-arts", "arts-decoratifs", "archeologie", "imaginaire"].includes(
          c.familyId,
        ) &&
        /^#[a-f0-9]{6}$/i.test(c.color) &&
        /^[a-z0-9-]+$/.test(c.texture) &&
        ids.has(c.coverArtworkId),
      "définition de catalogue",
    );
    cats.set(c.id, c);
  }
  requireValue(
    Array.isArray(t.assignments) && t.assignments.length === works.length,
    "couverture incomplète",
  );
  const seen = new Set<string>();
  for (const a of t.assignments) {
    requireValue(
      a &&
        ids.has(a.artworkId) &&
        !seen.has(a.artworkId) &&
        cats.get(a.primaryCatalogId)?.kind === "type",
      "identifiant/type principal",
    );
    seen.add(a.artworkId);
    requireValue(
      Array.isArray(a.themeIds) &&
        new Set(a.themeIds).size === a.themeIds.length &&
        a.themeIds.every((id) => cats.get(id)?.kind === "theme"),
      "thèmes inconnus ou doublés",
    );
    requireValue(
      text(a.sourceType) &&
        text(a.reason) &&
        Array.isArray(a.sourceFiles) &&
        a.sourceFiles.length > 0 &&
        a.sourceFiles.every(
          (f) =>
            typeof f === "string" &&
            /^(catalog|src\/catalog)\/[a-zA-Z0-9/_.-]+\.json$/.test(f) &&
            !f.includes("..") &&
            Object.hasOwn(t.sourceHashes, f),
        ),
      "preuve de classement",
    );
    requireValue(
      a.themeReasons &&
        Object.keys(a.themeReasons).length === a.themeIds.length &&
        a.themeIds.every((id) => text(a.themeReasons[id])),
      "preuve thématique",
    );
  }
  for (const c of t.catalogs)
    requireValue(
      t.assignments.some(
        (a) =>
          a.artworkId === c.coverArtworkId &&
          (a.primaryCatalogId === c.id || a.themeIds.includes(c.id)),
      ),
      "couverture hors catalogue",
    );
  return t;
}
