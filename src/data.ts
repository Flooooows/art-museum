import {
  catalogDataset,
  assessmentFor,
  catalogsFor,
  primaryImageFor,
} from "./catalog/repository";
import { RARITY_WEIGHTS } from "./packRules";
import { type PublicationStatus } from "./catalog/model";
import releaseSource from "./catalog/game-release.json";
import { parseGameRelease, type HumanRarity } from "./catalog/gameRelease";
import taxonomySource from "./catalog/taxonomy.json";
import { parseTaxonomy } from "./catalog/taxonomy";

export const activeGameRelease = parseGameRelease(
  releaseSource,
  catalogDataset,
);
const humanRarities = new Map(
  activeGameRelease.existingRarities.map((d) => [d.artworkId, d]),
);

export const rarities = [
  {
    name: "Esquisse",
    material: "Fer",
    finish: "fer",
    color: "#626970",
    ink: "#4c525a",
    darkInk: "#c0c5ca",
    badgeInk: "#ffffff",
    rate: RARITY_WEIGHTS[0],
  },
  {
    name: "Étude",
    material: "Cuivre",
    finish: "cuivre",
    color: "#b9784f",
    ink: "#854622",
    darkInk: "#e9af88",
    badgeInk: "#211108",
    rate: RARITY_WEIGHTS[1],
  },
  {
    name: "Composition",
    material: "Argent",
    finish: "argent",
    color: "#bfc7d1",
    ink: "#505f70",
    darkInk: "#dbe2ed",
    badgeInk: "#1c2630",
    rate: RARITY_WEIGHTS[2],
  },
  {
    name: "Œuvre",
    material: "Or",
    finish: "dore",
    color: "#d1aa49",
    ink: "#765b11",
    darkInk: "#ecd184",
    badgeInk: "#302407",
    rate: RARITY_WEIGHTS[3],
  },
  {
    name: "Pièce maîtresse",
    material: "Lapis-lazuli",
    finish: "lapis-lazuli",
    color: "#2549a8",
    ink: "#23449f",
    darkInk: "#a6bdff",
    badgeInk: "#ffffff",
    rate: RARITY_WEIGHTS[4],
  },
] as const;

export interface Catalog {
  id: string;
  title: string;
  subtitle: string;
  family: string;
  familyIds: string[];
  description: string;
  color: string;
  image: string;
  texture: string;
  frameFamily?: string;
  kind?: "type" | "theme" | "legacy";
  coverImage?: string;
}
export interface Artwork {
  id: string;
  title: string;
  artist: string;
  date: string;
  material: string;
  /** Stable principal catalog determines the visual family, not all memberships. */
  catalog: string;
  catalogIds: string[];
  familyId: string;
  museumId: string;
  rarity: number;
  anecdote: string;
  story: string;
  origin: string;
  source: string;
  image: string;
  imageCredit: string;
  publicationStatus: PublicationStatus;
  rarityOrigin?: "manual-review";
  humanRarity?: HumanRarity;
  inventoryNumber?: string;
  category?: string;
  frameFamily?: string;
  institutionalNote?: string;
  imageSource?: string;
  reuseUrl?: string;
  reuseLabel?: string;
  reuseObligations?: string[];
}

const legacyCatalogs: Catalog[] = catalogDataset.catalogs
  .filter((catalog) => catalog.status !== "draft")
  .map((catalog) => ({
    ...catalog,
    description:
      activeGameRelease.catalogDescriptions[catalog.id] ?? catalog.description,
    family: catalogDataset.families.find(
      (family) => family.id === catalog.familyIds[0],
    )!.name,
  }));

/** Keep the historical seed immutable; an explicitly authorized release adds cards and human rarity updates. */
const releasedArtworks: Artwork[] = catalogDataset.works
  .filter((work) => work.status !== "draft")
  .map((work) => ({
    id: work.id,
    title: work.title,
    artist: work.creatorDisplayName,
    date: work.displayDate,
    material: work.medium,
    catalog: work.primaryCatalogId,
    catalogIds: catalogsFor(work.id),
    familyId: work.familyId,
    museumId: work.museumId,
    rarity: humanRarities.get(work.id)?.level ?? assessmentFor(work.id)!.level,
    rarityOrigin: "manual-review" as const,
    humanRarity: humanRarities.get(work.id),
    anecdote: work.anecdote,
    story: work.story,
    origin: work.origin,
    source: work.sources[0].url,
    image: primaryImageFor(work.id)!.url,
    imageCredit: primaryImageFor(work.id)!.rights.statement,
    publicationStatus: work.status,
    imageSource: primaryImageFor(work.id)!.rights.verification?.sourceImageUrl,
    reuseUrl: primaryImageFor(work.id)!.rights.verification?.policyUrl,
    reuseLabel:
      primaryImageFor(work.id)!.rights.license === "CC0"
        ? "CC0"
        : "Déclaration de droits de la source",
  }))
  .concat(activeGameRelease.works);

export const activeTaxonomy = parseTaxonomy(
  taxonomySource,
  releasedArtworks,
  activeGameRelease.id,
);
const assignments = new Map(
  activeTaxonomy.assignments.map((a) => [a.artworkId, a]),
);
const typeDefinitions = new Map(activeTaxonomy.catalogs.map((c) => [c.id, c]));
const legacyMemberships = new Map(
  releasedArtworks.map((w) => [w.id, w.catalogIds]),
);
export const artworks: Artwork[] = releasedArtworks.map((w) => {
  const a = assignments.get(w.id)!;
  const type = typeDefinitions.get(a.primaryCatalogId)!;
  return {
    ...w,
    catalog: a.primaryCatalogId,
    catalogIds: [a.primaryCatalogId, ...a.themeIds],
    familyId: type.familyId,
    frameFamily:
      legacyCatalogs.find((c) => c.id === w.catalog)?.frameFamily ?? w.catalog,
  };
});
const artworkImages = new Map(artworks.map((w) => [w.id, w.image]));
export const visibleCatalogs: Catalog[] = activeTaxonomy.catalogs.map((c) => ({
  ...c,
  familyIds: [c.familyId],
  family: catalogDataset.families.find((f) => f.id === c.familyId)!.name,
  image: "hero-art",
  coverImage: artworkImages.get(c.coverArtworkId),
}));
export const typeCatalogs = visibleCatalogs.filter((c) => c.kind === "type");
export const themeCatalogs = visibleCatalogs.filter((c) => c.kind === "theme");
/** Hidden legacy IDs remain readable in old saves, but are never offered as current catalogs. */
export const catalogs: Catalog[] = [
  ...visibleCatalogs,
  ...legacyCatalogs
    .filter((c) => !visibleCatalogs.some((v) => v.id === c.id))
    .map((c) => ({
      ...c,
      kind: "legacy" as const,
      title: `Ancien catalogue · ${c.family}`,
    })),
];
export const families = catalogDataset.families.filter((f) =>
  artworks.some((w) => w.familyId === f.id),
);
export const catalogCover = (catalog: Catalog) =>
  catalog.coverImage ?? `/assets/${catalog.image}.jpg`;

export const byId = Object.fromEntries(artworks.map((art) => [art.id, art]));
export const getCatalog = (id: string) =>
  catalogs.find((catalog) => catalog.id === id);
export const artworkInCatalog = (art: Artwork, catalog: string) =>
  catalog === "all" ||
  art.catalogIds.includes(catalog) ||
  (getCatalog(catalog)?.kind === "legacy" &&
    !!legacyMemberships.get(art.id)?.includes(catalog));
export const catalogSize = (id: string) =>
  artworks.filter((art) => artworkInCatalog(art, id)).length;
export const museumName = (art: Artwork) => {
  const museum = [...catalogDataset.museums, ...activeGameRelease.museums].find(
    (item) => item.id === art.museumId,
  )!;
  return `${museum.name}, ${museum.city}`;
};

// Distribution policy does not determine or rewrite an artwork's editorial level.
export function ratesForCatalog(catalog = "all"): number[] {
  const available = RARITY_WEIGHTS.map((weight, level) =>
    artworks.some(
      (art) => art.rarity === level && artworkInCatalog(art, catalog),
    )
      ? weight
      : 0,
  );
  const total = available.reduce<number>((sum, value) => sum + value, 0);
  return available.map((value) => (total ? (value / total) * 100 : 0));
}
