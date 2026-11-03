import { validLevel } from "./model";
import type { ReviewDecisions } from "./types";

export type PersonalRarityFilter =
  "all" | "assigned" | "unassigned" | "0" | "1" | "2" | "3" | "4";

function finalLevelFor(id: string, decisions: ReviewDecisions) {
  const decision = decisions[id];
  return decision?.artworkId === id && validLevel(decision.finalLevel)
    ? decision.finalLevel
    : null;
}

/** Count the current final choice once per card in this lot, never proposals/history. */
export function personalRarityCounts(
  works: readonly { id: string }[],
  decisions: ReviewDecisions,
) {
  const byLevel = [0, 0, 0, 0, 0];
  const ids = new Set(works.map((w) => w.id));
  let assigned = 0;
  for (const id of ids) {
    const level = finalLevelFor(id, decisions);
    if (level !== null) {
      byLevel[level]++;
      assigned++;
    }
  }
  return {
    byLevel,
    assigned,
    unassigned: ids.size - assigned,
    total: ids.size,
  };
}

export function matchesPersonalRarity(
  id: string,
  decisions: ReviewDecisions,
  filter: PersonalRarityFilter,
) {
  const level = finalLevelFor(id, decisions);
  if (filter === "all") return true;
  if (filter === "assigned") return level !== null;
  if (filter === "unassigned") return level === null;
  return level !== null && /^[0-4]$/.test(filter) && level === Number(filter);
}
