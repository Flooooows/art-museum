import { rarities, type Artwork } from "../../data";

const materials = [
  { base: "#171e27", mid: "#4f5c6a", glow: "#a9bbcc", light: "#e1e9f0" },
  { base: "#27150f", mid: "#814829", glow: "#d58c56", light: "#ffe0bd" },
  { base: "#17202c", mid: "#61748d", glow: "#bdcee4", light: "#f2f6ff" },
  { base: "#261c0c", mid: "#886322", glow: "#e4bb54", light: "#fff0bc" },
  { base: "#060f2a", mid: "#123f93", glow: "#5689ff", light: "#d7e5ff" },
] as const;

/** The lot's light follows its actual maximum rarity, never its wrapper category. */
export function ambienceForCards(cards: readonly Pick<Artwork, "rarity">[]) {
  if (!cards.length) throw Error("Un lot vide n’a pas de rareté maximale.");
  let level = 0;
  for (const card of cards) {
    if (
      !Number.isInteger(card.rarity) ||
      card.rarity < 0 ||
      card.rarity >= rarities.length
    )
      throw Error("Rareté du lot invalide.");
    level = Math.max(level, card.rarity);
  }
  return { level, rarity: rarities[level], ...materials[level] };
}

/** One accepted activation advances one card, with an immediate animation lock. */
export function nextRevealIndex(
  revealed: number,
  total: number,
  locked: boolean,
) {
  if (
    !Number.isInteger(revealed) ||
    !Number.isInteger(total) ||
    total < 1 ||
    revealed < 0 ||
    revealed > total
  )
    throw Error("Progression de révélation invalide.");
  return locked || revealed === total ? null : revealed;
}
