import {
  catalogDataset,
  assessmentFor,
  catalogsFor,
  primaryImageFor,
} from "./catalog/repository";
import { RARITY_WEIGHTS } from "./packRules";
import { type PublicationStatus } from "./catalog/model";

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
}

export const families = catalogDataset.families;
export const catalogs: Catalog[] = catalogDataset.catalogs
  .filter((catalog) => catalog.status !== "draft")
  .map((catalog) => ({
    ...catalog,
    family: families.find((family) => family.id === catalog.familyIds[0])!.name,
  }));

/** Compatibility projection: catalog data is edited in catalog/seed.json, not JSX. */
export const artworks: Artwork[] = catalogDataset.works
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
    rarity: assessmentFor(work.id)!.level,
    anecdote: work.anecdote,
    story: work.story,
    origin: work.origin,
    source: work.sources[0].url,
    image: primaryImageFor(work.id)!.url,
    imageCredit: primaryImageFor(work.id)!.rights.statement,
    publicationStatus: work.status,
  }));

export const byId = Object.fromEntries(artworks.map((art) => [art.id, art]));
export const getCatalog = (id: string) =>
  catalogs.find((catalog) => catalog.id === id);
export const artworkInCatalog = (art: Artwork, catalog: string) =>
  catalog === "all" || art.catalogIds.includes(catalog);
export const catalogSize = (id: string) =>
  artworks.filter((art) => artworkInCatalog(art, id)).length;
export const museumName = (art: Artwork) => {
  const museum = catalogDataset.museums.find(
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
