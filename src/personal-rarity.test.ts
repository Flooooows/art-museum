import { test } from "node:test";
import assert from "node:assert/strict";
import {
  personalRarityCounts,
  matchesPersonalRarity,
} from "./review/personalRarity";
import { decide, mergeDecisions } from "./review/model";
import {
  decisionsFor,
  mergeEvents,
  type ReviewEvent,
} from "./masterpieces/model";
import type { ReviewDecisions } from "./review/types";

const now = "2026-10-30T15:00:00.000Z";
const works = ["a", "b", "c"].map((id) => ({ id, proposal: { level: 4 } }));

test("mes raretés — aucun choix ne reprend les propositions de l’algo", () => {
  assert.deepEqual(personalRarityCounts(works, {}), {
    byLevel: [0, 0, 0, 0, 0],
    assigned: 0,
    unassigned: 3,
    total: 3,
  });
});

test("mes raretés — compter le niveau zéro, toutes les cartes et seulement ce lot", () => {
  const decisions = decide(
    decide(decide({}, "a", 0, now), "b", 3, now),
    "other-batch",
    4,
    now,
  );
  assert.deepEqual(personalRarityCounts(works, decisions), {
    byLevel: [1, 0, 0, 1, 0],
    assigned: 2,
    unassigned: 1,
    total: 3,
  });
  assert.deepEqual(
    personalRarityCounts([{ id: "other-batch" }], decisions).byLevel,
    [0, 0, 0, 0, 1],
  );
  assert.equal(personalRarityCounts([...works, works[0]], decisions).total, 3);
});

test("mes raretés — modification, annulation et import déplacent les compteurs sans duplication", () => {
  const first = decide({}, "a", 0, now);
  const moved = decide(first, "a", 4, now);
  assert.deepEqual(personalRarityCounts(works, moved).byLevel, [0, 0, 0, 0, 1]);
  const incoming = [
    { artworkId: "a", finalLevel: 2 as const, decidedAt: now },
    { artworkId: "b", finalLevel: 1 as const, decidedAt: now },
  ];
  const imported = mergeDecisions(mergeDecisions(moved, incoming), incoming);
  assert.deepEqual(
    personalRarityCounts(works, imported).byLevel,
    [0, 1, 1, 0, 0],
  );
  const undone = decide(imported, "a", null, now);
  assert.deepEqual(personalRarityCounts(works, undone), {
    byLevel: [0, 1, 0, 0, 0],
    assigned: 1,
    unassigned: 2,
    total: 3,
  });
  assert.deepEqual(personalRarityCounts(works, first).byLevel, [1, 0, 0, 0, 0]);
});

test("mes raretés — filtres sur le choix humain, sans inclure les cartes non examinées", () => {
  const decisions = decide(decide({}, "a", 0, now), "b", 4, now);
  const filtered = (filter: Parameters<typeof matchesPersonalRarity>[2]) =>
    works
      .filter((w) => matchesPersonalRarity(w.id, decisions, filter))
      .map((w) => w.id);
  assert.deepEqual(filtered("0"), ["a"]);
  assert.deepEqual(filtered("4"), ["b"]);
  assert.deepEqual(filtered("assigned"), ["a", "b"]);
  assert.deepEqual(filtered("unassigned"), ["c"]);
  assert.deepEqual(filtered("all"), ["a", "b", "c"]);
  assert.deepEqual(filtered("2"), []);
});

test("mes raretés — historique des candidates : seul le dernier choix de rareté compte, pas Retenir", () => {
  const events: ReviewEvent[] = [
    { id: "one", artworkId: "a", at: now, kind: "rarity", level: 0 },
    {
      id: "two",
      artworkId: "a",
      at: "2026-10-30T15:01:00.000Z",
      kind: "rarity",
      level: 4,
    },
    {
      id: "three",
      artworkId: "b",
      at: now,
      kind: "selection",
      status: "accepted",
    },
  ];
  const merged = mergeEvents(events, events);
  assert.deepEqual(personalRarityCounts(works, decisionsFor(merged).rarities), {
    byLevel: [0, 0, 0, 0, 1],
    assigned: 1,
    unassigned: 2,
    total: 3,
  });
  const undone = mergeEvents(merged, [
    {
      id: "four",
      artworkId: "a",
      at: "2026-10-30T15:02:00.000Z",
      kind: "rarity",
      level: null,
    },
  ]);
  assert.equal(
    personalRarityCounts(works, decisionsFor(undone).rarities).assigned,
    0,
  );
  assert.equal(decisionsFor(undone).selections.b, "accepted");
});

test("mes raretés — décompte pur, identifiant incohérent ignoré", () => {
  const decisions: ReviewDecisions = {
    a: { artworkId: "unknown", finalLevel: 4, decidedAt: now },
  };
  const before = structuredClone({ works, decisions });
  assert.equal(personalRarityCounts(works, decisions).assigned, 0);
  assert.equal(matchesPersonalRarity("a", decisions, "unassigned"), true);
  assert.deepEqual({ works, decisions }, before);
});
