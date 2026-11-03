import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { boosterGroups, previewWorksFor } from "./booster-lab/groups";
import { artworks, rarities } from "./data";
import {
  ambienceForCards,
  nextRevealIndex,
  openingScenarioAvailable,
  openingWorksFor,
  type MaximumRarity,
} from "./opening-lab/rules";
import { artworkInBooster } from "./booster-lab/groups";

test("ouverture du lab — cinq exemples distincts pour chaque pochette", () => {
  for (const group of boosterGroups) {
    const cards = previewWorksFor(group.id).slice(0, 5);
    assert.equal(cards.length, 5);
    assert.equal(new Set(cards.map((card) => card.id)).size, 5);
  }
});

test("ouverture du lab — aucune acquisition ni sauvegarde et aucune entrée de publication", async () => {
  const source = await readFile("src/opening-lab/main.tsx", "utf8");
  assert.doesNotMatch(
    source,
    /localStorage|sessionStorage|openPack|revealCards|\.\/collection/,
  );
  assert.match(source, /timeline\.current\?\.kill\(\)/);
  assert.match(source, /revealTimeline\.current\?\.kill\(\)/);
  for (const path of [
    "vite.config.ts",
    "vite.atelier.config.ts",
    "vite.booster-lab.config.ts",
  ]) {
    assert.doesNotMatch(await readFile(path, "utf8"), /opening-lab\.html/);
  }
});

test("ouverture du lab — l’ambiance prend la rareté maximale réelle, indépendamment de l’ordre", () => {
  for (let level = 0; level < rarities.length; level++) {
    const cards = Array.from({ length: 5 }, (_, i) => ({
      rarity: Math.max(0, level - i),
    }));
    const ambience = ambienceForCards(cards);
    assert.equal(ambience.level, level);
    assert.equal(ambience.rarity, rarities[level]);
    assert.deepEqual(ambienceForCards([...cards].reverse()), ambience);
  }
  const lapis = ambienceForCards([
    { rarity: 0 },
    { rarity: 4 },
    { rarity: 1 },
    { rarity: 2 },
    { rarity: 0 },
  ]);
  assert.equal(lapis.rarity.finish, "lapis-lazuli");
  assert.equal(lapis.rarity.name, "Pièce maîtresse");
  assert.equal(lapis.mid, "#123f93");
});

test("ouverture du lab — les sept lots gardent leurs œuvres et raretés humaines", () => {
  const before = JSON.stringify(artworks);
  for (const group of boosterGroups) {
    const works = previewWorksFor(group.id).slice(0, 5),
      ambience = ambienceForCards(works);
    assert.equal(ambience.level, Math.max(...works.map((art) => art.rarity)));
    for (const art of works) assert.equal(art.rarity, art.humanRarity!.level);
  }
  assert.equal(
    ambienceForCards(previewWorksFor("universel").slice(0, 5)).rarity.finish,
    "lapis-lazuli",
  );
  assert.equal(
    ambienceForCards(previewWorksFor("matieres-objets").slice(0, 5)).rarity
      .finish,
    "argent",
  );
  assert.equal(JSON.stringify(artworks), before);
});

test("ouverture du lab — progression une par une, verrou d’animation et borne à cinq", () => {
  for (let count = 0; count < 5; count++) {
    assert.equal(nextRevealIndex(count, 5, false), count);
    assert.equal(nextRevealIndex(count, 5, true), null);
  }
  assert.equal(nextRevealIndex(5, 5, false), null);
  assert.equal(nextRevealIndex(5, 5, true), null);
  for (const [count, total] of [
    [-1, 5],
    [6, 5],
    [1.5, 5],
    [0, 0],
  ])
    assert.throws(() => nextRevealIndex(count, total, false));
});

test("ouverture du lab — refus de lots sans rareté fiable", () => {
  assert.throws(() => ambienceForCards([]));
  for (const rarity of [-1, 5, 1.5, NaN, Infinity])
    assert.throws(() => ambienceForCards([{ rarity }]));
});

test("ouverture du lab — sélecteur de maximum : lots réels, exclusifs et finale exacte", () => {
  const before = JSON.stringify(artworks);
  for (const group of boosterGroups) {
    assert.deepEqual(
      openingWorksFor(group.id, "auto"),
      previewWorksFor(group.id).slice(0, 5),
    );
    for (let level = 0; level < 5; level++) {
      if (!openingScenarioAvailable(group.id, level)) {
        assert.throws(() => openingWorksFor(group.id, level as MaximumRarity));
        continue;
      }
      const cards = openingWorksFor(group.id, level as MaximumRarity);
      assert.equal(cards.length, 5);
      assert.equal(new Set(cards.map((a) => a.id)).size, 5);
      assert.equal(ambienceForCards(cards).level, level);
      assert.equal(cards[4].rarity, level);
      if (level > 0)
        assert.ok(cards.slice(0, 4).every((a) => a.rarity < level));
      for (const card of cards) {
        assert.ok(artworkInBooster(card, group.id));
        assert.equal(card.rarity, card.humanRarity!.level);
      }
      assert.deepEqual(
        cards,
        openingWorksFor(group.id, level as MaximumRarity),
      );
    }
  }
  assert.equal(JSON.stringify(artworks), before);
});

test("ouverture du lab — cinq raretés testables dans l’universelle, aucune pièce maîtresse inventée", () => {
  for (let level = 0; level < 5; level++)
    assert.equal(openingScenarioAvailable("universel", level), true);
  for (const group of [
    "photographies",
    "matieres-objets",
    "textiles-interieur",
  ])
    assert.equal(openingScenarioAvailable(group, 4), false);
  assert.throws(() => openingScenarioAvailable("universel", 5));
});
