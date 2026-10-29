import {
  artworks,
  byId,
  catalogs,
  ratesForCatalog,
  artworkInCatalog,
} from "./data";
import { CARDS_PER_PACK, LEGACY_CARDS_PER_PACK } from "./packRules";

export const STORAGE_KEY = "muse-collection-v1";
export const MAX_STOCK = 10;
export const REFILL_MS = 10 * 60 * 1000;

export interface DrawnCard {
  id: string;
  isNew: boolean;
}
export interface PackResult {
  cards: DrawnCard[];
  catalog: string;
  date: number;
  revealed: number[];
}
export interface CollectionState {
  version: 1;
  counts: Record<string, number>;
  favorites: string[];
  exhibited: string[];
  stock: number;
  rechargedAt: number;
  opened: number;
  latest: PackResult | null;
}

export function initialState(now = Date.now()): CollectionState {
  return {
    version: 1,
    counts: {},
    favorites: [],
    exhibited: [],
    stock: MAX_STOCK,
    rechargedAt: now,
    opened: 0,
    latest: null,
  };
}

export function refreshStock(
  state: CollectionState,
  now: number,
): CollectionState {
  if (state.stock === MAX_STOCK) return state;
  const elapsed = Math.max(0, now - state.rechargedAt);
  const refills = Math.floor(elapsed / REFILL_MS);
  if (!refills) return state;
  const stock = Math.min(MAX_STOCK, state.stock + refills);
  return {
    ...state,
    stock,
    rechargedAt:
      stock === MAX_STOCK ? now : state.rechargedAt + refills * REFILL_MS,
  };
}

export function drawPack(
  catalog: string,
  random: () => number = Math.random,
): string[] {
  if (catalog !== "all" && !catalogs.some((item) => item.id === catalog))
    throw new Error("Catalogue inconnu.");
  const rates = ratesForCatalog(catalog);
  return Array.from({ length: CARDS_PER_PACK }, () => {
    const roll = Math.max(0, Math.min(0.99999999, random())) * 100;
    let cumulative = 0;
    const rarity = rates.findIndex((rate) => {
      cumulative += rate;
      return roll < cumulative;
    });
    const pool = artworks.filter(
      (art) => art.rarity === rarity && artworkInCatalog(art, catalog),
    );
    const index = Math.floor(
      Math.max(0, Math.min(0.99999999, random())) * pool.length,
    );
    return pool[index].id;
  });
}

export function openPack(
  state: CollectionState,
  catalog: string,
  now = Date.now(),
  random = Math.random,
): CollectionState {
  const refreshed = refreshStock(state, now);
  if (refreshed.stock < 1)
    throw new Error(
      "Aucune pochette disponible. La prochaine recharge arrive bientôt.",
    );
  const counts = { ...refreshed.counts };
  const cards = drawPack(catalog, random).map((id) => {
    const isNew = !counts[id];
    counts[id] = (counts[id] || 0) + 1;
    return { id, isNew };
  });
  return {
    ...refreshed,
    counts,
    stock: refreshed.stock - 1,
    opened: refreshed.opened + 1,
    rechargedAt: refreshed.stock === MAX_STOCK ? now : refreshed.rechargedAt,
    latest: { cards, catalog, date: now, revealed: [] },
  };
}

export function parseState(value: string, now = Date.now()): CollectionState {
  const data = JSON.parse(value) as CollectionState;
  const validInteger = (n: unknown, max = 1e9): n is number =>
    typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= max;
  const ids = (value: unknown): value is string[] =>
    Array.isArray(value) &&
    value.length <= artworks.length &&
    value.every((id) => typeof id === "string" && Object.hasOwn(byId, id)) &&
    new Set(value).size === value.length;
  if (
    !data ||
    data.version !== 1 ||
    !data.counts ||
    typeof data.counts !== "object" ||
    Array.isArray(data.counts) ||
    !Object.entries(data.counts).every(
      ([id, count]) =>
        Object.hasOwn(byId, id) && validInteger(count, 1e6) && count > 0,
    ) ||
    !ids(data.favorites) ||
    !ids(data.exhibited) ||
    !data.exhibited.every((id) => data.counts[id] > 0) ||
    !validInteger(data.stock, MAX_STOCK) ||
    !validInteger(data.rechargedAt, now + REFILL_MS) ||
    !validInteger(data.opened)
  ) {
    throw new Error("Ce fichier ne contient pas une sauvegarde MUSE valide.");
  }
  if (data.latest !== null) {
    const last = data.latest;
    if (
      !last ||
      !Array.isArray(last.cards) ||
      ![LEGACY_CARDS_PER_PACK, CARDS_PER_PACK].includes(last.cards.length) ||
      !last.cards.every(
        (card) =>
          card &&
          Object.hasOwn(byId, card.id) &&
          typeof card.isNew === "boolean" &&
          data.counts[card.id] > 0,
      ) ||
      !validInteger(last.date, now + REFILL_MS) ||
      !Array.isArray(last.revealed) ||
      !last.revealed.every((index) =>
        validInteger(index, last.cards.length - 1),
      ) ||
      new Set(last.revealed).size !== last.revealed.length ||
      (last.catalog !== "all" &&
        !catalogs.some((catalog) => catalog.id === last.catalog))
    ) {
      throw new Error("Le dernier tirage de cette sauvegarde est invalide.");
    }
  }
  return refreshStock(data, now);
}

export const uniqueCount = (state: CollectionState) =>
  Object.keys(state.counts).length;
export const duplicateCount = (state: CollectionState) =>
  Object.values(state.counts).reduce(
    (sum, count) => sum + Math.max(0, count - 1),
    0,
  );
export const catalogProgress = (state: CollectionState, catalog: string) =>
  artworks.filter(
    (art) => artworkInCatalog(art, catalog) && state.counts[art.id],
  ).length;

export function revealCards(
  state: CollectionState,
  index?: number,
): CollectionState {
  const latest = state.latest;
  if (
    !latest ||
    (index !== undefined &&
      (!Number.isInteger(index) || index < 0 || index >= latest.cards.length))
  )
    return state;
  const revealed =
    index === undefined
      ? latest.cards.map((_, position) => position)
      : [...new Set([...latest.revealed, index])];
  return { ...state, latest: { ...latest, revealed } };
}
