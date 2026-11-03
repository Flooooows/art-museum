import {
  artworks,
  artworkInCatalog,
  catalogs,
  getCatalog,
  ratesForCatalog,
} from "./data";
import { RARITY_WEIGHTS } from "./packRules";
import {
  boosterGroups,
  specializedBoosterFor,
  worksForBooster,
} from "./game-presentation/boosters/groups";

export const isPackSelection = (id: string) =>
  id === "all" ||
  catalogs.some((c) => c.id === id) ||
  boosterGroups.some((g) => g.id === id);

export function packWorks(id: string) {
  if (!isPackSelection(id)) throw Error("Catalogue inconnu.");
  return boosterGroups.some((g) => g.id === id)
    ? worksForBooster(id)
    : artworks.filter((art) => artworkInCatalog(art, id));
}

export function ratesForPack(id = "all"): number[] {
  if (!boosterGroups.some((g) => g.id === id)) return ratesForCatalog(id);
  const pool = packWorks(id);
  const available = RARITY_WEIGHTS.map((weight, level) =>
    pool.some((art) => art.rarity === level) ? weight : 0,
  );
  const total = available.reduce<number>((sum, weight) => sum + weight, 0);
  return available.map((weight) => (total ? (weight / total) * 100 : 0));
}

export function packTitle(id: string) {
  return (
    boosterGroups.find((g) => g.id === id)?.title ??
    getCatalog(id)?.title ??
    "Collection universelle"
  );
}

/** Legacy saved selections retain their exact pool, but use a compatible new wrapper. */
export function packVisualGroup(id: string) {
  const group = boosterGroups.find((g) => g.id === id);
  if (group) return group;
  const catalog = getCatalog(id);
  return catalog?.kind === "type"
    ? specializedBoosterFor({ catalog: id })
    : boosterGroups[0];
}
