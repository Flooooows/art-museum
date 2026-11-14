import { getCatalog, type Artwork } from "../data";

export type SortOrder = "collection" | "title" | "artist" | "rarity";
export type Exploration = {
  query: string;
  category: string;
  theme: string;
  rarity: string;
  sort: SortOrder;
};

export const initialExploration: Exploration = {
  query: "",
  category: "all",
  theme: "all",
  rarity: "all",
  sort: "collection",
};

export const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/[’'"\s-]+/g, " ")
    .trim();

const searchIndex = new WeakMap<Artwork, string>();
function searchableText(art: Artwork) {
  let value = searchIndex.get(art);
  if (value === undefined) {
    value = normalize(
      [
        art.title,
        art.artist,
        art.date,
        art.material,
        art.origin,
        art.id,
        art.anecdote,
        art.story,
        ...art.catalogIds.map((id) => getCatalog(id)?.title ?? ""),
      ].join(" "),
    );
    searchIndex.set(art, value);
  }
  return value;
}

const collator = new Intl.Collator("fr", {
  sensitivity: "base",
  numeric: true,
});

/** Counts per value of one filter, with every other active filter applied. */
export function facetCounts(
  source: readonly Artwork[],
  filters: Exploration,
  key: "category" | "theme" | "rarity",
  values: readonly string[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values)
    counts[value] = exploreArtworks(source, {
      ...filters,
      [key]: value,
      sort: "collection",
    }).length;
  return counts;
}

/** Pure, read-only exploration: never sorts or alters the source dataset. */
export function exploreArtworks(
  source: readonly Artwork[],
  filters: Exploration,
): Artwork[] {
  const words = normalize(filters.query).split(" ").filter(Boolean);
  const result = source.filter(
    (art) =>
      (filters.category === "all" || art.catalog === filters.category) &&
      (filters.theme === "all" || art.catalogIds.includes(filters.theme)) &&
      (filters.rarity === "all" || art.rarity === Number(filters.rarity)) &&
      words.every((word) => searchableText(art).includes(word)),
  );
  if (filters.sort === "title")
    result.sort((a, b) => collator.compare(a.title, b.title));
  if (filters.sort === "artist")
    result.sort(
      (a, b) =>
        collator.compare(a.artist, b.artist) ||
        collator.compare(a.title, b.title),
    );
  if (filters.sort === "rarity")
    result.sort(
      (a, b) => b.rarity - a.rarity || collator.compare(a.title, b.title),
    );
  return result;
}
