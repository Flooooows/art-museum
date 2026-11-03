import { rarities, type Artwork } from "../data";
import { previewWorksFor, worksForBooster } from "../booster-lab/groups";

export type MaximumRarity = "auto" | 0 | 1 | 2 | 3 | 4;

export function openingScenarioAvailable(groupId: string, level: number) {
  ambienceForCards([{ rarity: level }]);
  const pool = worksForBooster(groupId).filter((art) => art.rarity <= level);
  return pool.length >= 5 && pool.some((art) => art.rarity === level);
}

/** Manual scenarios use five real, distinct works and put their actual maximum last. */
export function openingWorksFor(groupId: string, maximum: MaximumRarity) {
  if (maximum === "auto") return previewWorksFor(groupId).slice(0, 5);
  if (!openingScenarioAvailable(groupId, maximum))
    throw Error("Rareté maximale indisponible pour cette sélection.");
  const pool = worksForBooster(groupId).filter((art) => art.rarity <= maximum);
  const finale = pool.find((art) => art.rarity === maximum)!;
  const lower = pool.filter(
    (art) => art.id !== finale.id && art.rarity < maximum,
  );
  const candidates =
    lower.length >= 4 ? lower : pool.filter((art) => art.id !== finale.id);
  const preferred = previewWorksFor(groupId).filter((art) =>
    candidates.includes(art),
  );
  const first = [
    ...preferred,
    ...candidates.filter((art) => !preferred.includes(art)),
  ].slice(0, 4);
  if (first.length !== 4) throw Error("Lot de démonstration incomplet.");
  return [...first, finale];
}

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
