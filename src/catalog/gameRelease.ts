import type { Artwork } from "../data";
import type { CatalogDataset, MuseumRecord } from "./model";
import {
  evaluateLegalEU,
  parseLegalInput,
  safeLegalUrl,
  validDay,
  type LegalInput,
  type LegalDecision,
} from "../legal-eu/model";

export interface HumanRarity {
  artworkId: string;
  level: number;
  decidedAt: string;
  catalogVersion: string;
  exportSha256: string;
}
export interface PublishedImageEvidence {
  sourceUrl: string;
  sourceSha256: string;
  outputSha256: string;
  width: number;
  height: number;
  transformation: string;
  retrievedAt: string;
  evidenceFiles: string[];
}
export interface ReleasedArtwork extends Artwork {
  rarityOrigin: "manual-review";
  inventoryNumber: string;
  category: string;
  institutionalNote: string;
  imageSource: string;
  reuseUrl: string;
  reuseLabel: string;
  reuseObligations: string[];
  humanRarity: HumanRarity;
  legal: { input: LegalInput; decision: LegalDecision };
  imageEvidence: PublishedImageEvidence;
}
export interface GameRelease {
  schemaVersion: 1;
  id: string;
  authorizedAt: string;
  authorization: "explicit-user-request";
  reviewPublicationAuthorization?: {
    kind: "explicit-user-request";
    authorizedAt: string;
    request: string;
    catalogVersion: string;
    catalogSha256: string;
    artworkIds: string[];
  };
  baseCatalogSha256: string;
  legalReportSha256: string;
  sourceCatalogHashes: Record<string, string>;
  existingRarities: HumanRarity[];
  museums: MuseumRecord[];
  catalogDescriptions: Record<string, string>;
  works: ReleasedArtwork[];
}
const hash = (v: unknown): v is string =>
  typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
const text = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;
function requireValue(value: unknown, message: string): asserts value {
  if (!value) throw Error(`Livraison du jeu invalide : ${message}`);
}
function human(v: HumanRarity, id: string) {
  requireValue(
    v &&
      v.artworkId === id &&
      Number.isInteger(v.level) &&
      v.level >= 0 &&
      v.level <= 4 &&
      hash(v.exportSha256) &&
      text(v.catalogVersion) &&
      typeof v.decidedAt === "string" &&
      Number.isFinite(Date.parse(v.decidedAt)),
    `preuve de rareté humaine : ${id}`,
  );
}

/** A release is a separate, explicitly authorized publication, not a rewrite of the seed or review catalogs. */
export function parseGameRelease(
  value: unknown,
  base: CatalogDataset,
): GameRelease {
  requireValue(!!value && typeof value === "object", "objet attendu");
  const r = value as GameRelease;
  requireValue(
    r.schemaVersion === 1 &&
      /^game-\d{4}-\d{2}-\d{2}-[a-f0-9]{12}$/.test(r.id) &&
      validDay(r.authorizedAt) &&
      r.authorization === "explicit-user-request" &&
      hash(r.baseCatalogSha256) &&
      hash(r.legalReportSha256),
    "autorisation/version/empreintes",
  );
  requireValue(
    r.sourceCatalogHashes &&
      Object.keys(r.sourceCatalogHashes).length === 3 &&
      Object.values(r.sourceCatalogHashes).every(hash),
    "catalogues source",
  );
  requireValue(
    Array.isArray(r.existingRarities) &&
      r.existingRarities.length === base.works.length,
    "raretés historiques incomplètes",
  );
  const legacy = new Set(base.works.map((w) => w.id)),
    updated = new Set<string>();
  for (const v of r.existingRarities) {
    human(v, v.artworkId);
    requireValue(
      legacy.has(v.artworkId) && !updated.has(v.artworkId),
      "référence historique inconnue/dupliquée",
    );
    updated.add(v.artworkId);
  }
  requireValue(
    Array.isArray(r.museums) &&
      r.catalogDescriptions &&
      typeof r.catalogDescriptions === "object",
    "musées/catalogues",
  );
  const museums = new Set(base.museums.map((m) => m.id));
  for (const m of r.museums) {
    requireValue(
      text(m.id) &&
        !museums.has(m.id) &&
        text(m.name) &&
        text(m.city) &&
        text(m.country) &&
        safeLegalUrl(m.website),
      "musée invalide",
    );
    museums.add(m.id);
  }
  for (const [id, description] of Object.entries(r.catalogDescriptions))
    requireValue(
      base.catalogs.some((c) => c.id === id) && text(description),
      "description de catalogue inconnue",
    );
  requireValue(
    Array.isArray(r.works) && r.works.length > 0 && r.works.length <= 2000,
    "nouvelles cartes",
  );
  const ids = new Set(legacy);
  const manual = r.reviewPublicationAuthorization;
  const authorized = new Set<string>();
  if (manual) {
    requireValue(
      manual.kind === "explicit-user-request" &&
        validDay(manual.authorizedAt) &&
        manual.authorizedAt === r.authorizedAt &&
        text(manual.request) &&
        text(manual.catalogVersion) &&
        hash(manual.catalogSha256) &&
        manual.catalogSha256 === r.sourceCatalogHashes["review-data"] &&
        Array.isArray(manual.artworkIds) &&
        manual.artworkIds.length > 0 &&
        manual.artworkIds.every(text) &&
        new Set(manual.artworkIds).size === manual.artworkIds.length,
      "autorisation manuelle hors périmètre",
    );
    for (const id of manual.artworkIds) authorized.add(id);
  }
  const usedAuthorization = new Set<string>();
  for (const w of r.works) {
    requireValue(
      w && /^[a-zA-Z0-9.-]+$/.test(w.id) && !ids.has(w.id),
      "identifiant nouveau dupliqué ou substitué",
    );
    ids.add(w.id);
    requireValue(
      [
        w.title,
        w.artist,
        w.date,
        w.material,
        w.anecdote,
        w.story,
        w.origin,
        w.imageCredit,
        w.inventoryNumber,
        w.category,
      ].every(text) && typeof w.institutionalNote === "string",
      `contenu de ${w.id}`,
    );
    requireValue(
      w.publicationStatus === "published" && w.rarityOrigin === "manual-review",
      "publication/rareté explicites requises",
    );
    human(w.humanRarity, w.id);
    requireValue(
      w.rarity === w.humanRarity.level,
      "rareté différente du choix humain",
    );
    const catalog = base.catalogs.find((c) => c.id === w.catalog);
    requireValue(
      catalog &&
        catalog.familyIds.includes(w.familyId) &&
        museums.has(w.museumId) &&
        Array.isArray(w.catalogIds) &&
        w.catalogIds.includes(w.catalog) &&
        new Set(w.catalogIds).size === w.catalogIds.length &&
        w.catalogIds.every((id) => base.catalogs.some((c) => c.id === id)),
      "appartenances de carte",
    );
    requireValue(
      w.image === `/assets/game-release/${w.id}.webp` &&
        safeLegalUrl(w.source) &&
        safeLegalUrl(w.imageSource) &&
        safeLegalUrl(w.reuseUrl) &&
        text(w.reuseLabel) &&
        Array.isArray(w.reuseObligations) &&
        w.reuseObligations.every(text),
      "image, crédit ou source invalides",
    );
    const input = parseLegalInput(w.legal?.input);
    const decision = evaluateLegalEU(input, w.legal.decision.verifiedAt);
    requireValue(
      JSON.stringify(decision) === JSON.stringify(w.legal.decision) &&
        (decision.status === "AUTO_APPROVED_EU" ||
          (decision.status === "REVIEW_REQUIRED" &&
            authorized.has(w.id) &&
            w.humanRarity.catalogVersion === manual?.catalogVersion)),
      `dossier UE non admissible : ${w.id}`,
    );
    if (decision.status === "REVIEW_REQUIRED") usedAuthorization.add(w.id);
    requireValue(
      input.artworkId === w.id &&
        input.title === w.title &&
        input.creator === w.artist &&
        input.sourceUrl === w.source &&
        input.image.sourceUrl === w.imageSource &&
        input.image.licenseUrl === w.reuseUrl &&
        input.image.credit === w.imageCredit,
      "preuve juridique d’un autre objet ou fichier",
    );
    const image = w.imageEvidence;
    requireValue(
      image &&
        image.sourceUrl === w.imageSource &&
        hash(image.sourceSha256) &&
        hash(image.outputSha256) &&
        Number.isInteger(image.width) &&
        image.width > 0 &&
        Number.isInteger(image.height) &&
        image.height > 0 &&
        text(image.transformation) &&
        typeof image.retrievedAt === "string" &&
        Number.isFinite(Date.parse(image.retrievedAt)) &&
        Array.isArray(image.evidenceFiles) &&
        image.evidenceFiles.length > 0 &&
        image.evidenceFiles.every(
          (p) =>
            /^catalog\/[a-zA-Z0-9/_.-]+\.(?:json|html)$/.test(p) &&
            !p.includes(".."),
        ),
      "preuve du raster",
    );
  }
  requireValue(
    usedAuthorization.size === authorized.size,
    "autorisation inutilisée ou dossier non conforme",
  );
  return r;
}
