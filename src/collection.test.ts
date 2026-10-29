import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
  openPack,
  drawPack,
  refreshStock,
  parseState,
  REFILL_MS,
  duplicateCount,
  revealCards,
  catalogProgress,
  uniqueCount,
} from "./collection";
import {
  byId,
  catalogs,
  ratesForCatalog,
  artworkInCatalog,
  catalogSize,
  artworks,
} from "./data";

test("une ouverture consomme une pochette et conserve exactement cinq cartes", () => {
  const state = openPack(initialState(1000), "all", 2000, () => 0);
  assert.equal(state.stock, 9);
  assert.equal(state.opened, 1);
  assert.equal(
    Object.values(state.counts).reduce((a, b) => a + b, 0),
    5,
  );
  assert.deepEqual(
    state.latest?.cards.map((card) => card.isNew),
    [true, false, false, false, false],
  );
  assert.equal(duplicateCount(state), 4);
});

test("les tirages suivent les taux affichés et restent dans le catalogue choisi", () => {
  for (const catalog of catalogs) {
    const rates = ratesForCatalog(catalog.id);
    let cumulative = 0;
    for (let rarity = 0; rarity < rates.length; rarity++) {
      if (!rates[rarity]) continue;
      const roll = (cumulative + rates[rarity] / 2) / 100;
      cumulative += rates[rarity];
      let index = 0;
      const result = drawPack(catalog.id, () => (index++ % 2 ? 0 : roll));
      assert.ok(
        result.every(
          (id) =>
            artworkInCatalog(byId[id], catalog.id) &&
            byId[id].rarity === rarity,
        ),
      );
    }
  }
  assert.deepEqual(
    ratesForCatalog("all").map((rate) => Number(rate.toFixed(1))),
    [56.1, 25.5, 15, 3, 0.4],
  );
});

test("les taux fractionnaires totalisent cent et réservent les derniers 0,4 % au lapis", () => {
  assert.ok(
    Math.abs(
      ratesForCatalog("all").reduce((sum, rate) => sum + rate, 0) - 100,
    ) < 1e-10,
  );
  for (const [roll, level] of [
    [0, 0],
    [0.560999, 0],
    [0.561001, 1],
    [0.815999, 1],
    [0.816001, 2],
    [0.965999, 2],
    [0.966001, 3],
    [0.995999, 3],
    [0.996001, 4],
    [0.999999, 4],
  ]) {
    let step = 0;
    assert.ok(
      drawPack("all", () => (step++ % 2 ? 0 : roll)).every(
        (id) => byId[id].rarity === level,
      ),
      `tirage ${roll}`,
    );
  }
});

test("les anciennes pochettes de trois cartes restent intactes et les suivantes donnent cinq", () => {
  const legacy = {
    ...initialState(1000),
    stock: 9,
    opened: 1,
    counts: { "437654": 3 },
    latest: {
      catalog: "all",
      date: 2000,
      cards: [true, false, false].map((isNew) => ({ id: "437654", isNew })),
      revealed: [0],
    },
  };
  const restored = parseState(JSON.stringify(legacy), 3000);
  assert.deepEqual(restored, legacy);
  const revealed = revealCards(restored);
  assert.deepEqual(revealed.latest?.revealed, [0, 1, 2]);
  assert.deepEqual(revealed.counts, legacy.counts);
  const next = openPack(restored, "all", 3000, () => 0);
  assert.equal(next.latest?.cards.length, 5);
  assert.equal(next.counts["437654"], 8);
  assert.equal(next.stock, 8);
});

test("révéler cinq cartes ne consomme ni stock ni nouveau tirage", () => {
  const drawn = openPack(initialState(1000), "all", 2000, () => 0);
  const last = revealCards(drawn, 4);
  assert.deepEqual(last.latest?.revealed, [4]);
  const all = revealCards(last);
  assert.deepEqual(all.latest?.revealed, [0, 1, 2, 3, 4]);
  assert.deepEqual(all.latest?.cards, drawn.latest?.cards);
  assert.deepEqual(all.counts, drawn.counts);
  assert.equal(all.stock, drawn.stock);
  assert.deepEqual(parseState(JSON.stringify(all), 3000), all);
  for (const index of [-1, 5, 1.5, NaN])
    assert.equal(revealCards(drawn, index), drawn);
});

test("le parseur refuse les tailles de tirage non reconnues et indices hors du résultat", () => {
  const state = openPack(initialState(1000), "all", 2000, () => 0);
  for (const size of [0, 1, 2, 4, 6]) {
    const invalid = {
      ...state,
      latest: {
        ...state.latest!,
        cards: Array.from({ length: size }, () => state.latest!.cards[0]),
      },
    };
    assert.throws(() => parseState(JSON.stringify(invalid), 3000));
  }
  for (const revealed of [[5], [-1], [0.5], [0, 0]])
    assert.throws(() =>
      parseState(
        JSON.stringify({ ...state, latest: { ...state.latest, revealed } }),
        3000,
      ),
    );
  assert.throws(() =>
    parseState(
      JSON.stringify({
        ...state,
        latest: {
          ...state.latest,
          cards: state.latest!.cards.slice(0, 3),
          revealed: [3],
        },
      }),
      3000,
    ),
  );
});

test("une œuvre peut appartenir à deux catalogues sans doubler l’inventaire", () => {
  const art = byId["544864"];
  assert.equal(art.catalog, "mythes");
  assert.ok(artworkInCatalog(art, "egypte"));
  assert.equal(catalogSize("egypte"), 21);
  const state = { ...initialState(1000), counts: { [art.id]: 1 } };
  assert.equal(catalogProgress(state, "egypte"), 1);
  assert.equal(catalogProgress(state, "mythes"), 1);
  assert.equal(uniqueCount(state), 1);
  let index = 0;
  const pool = artworks.filter(
    (item) => item.rarity === art.rarity && artworkInCatalog(item, "egypte"),
  );
  const position =
    (pool.findIndex((item) => item.id === art.id) + 0.5) / pool.length;
  assert.ok(
    drawPack("egypte", () => (index++ % 2 ? position : 0)).every(
      (id) => id === art.id,
    ),
  );
});

test("la recharge fonctionne hors ligne, conserve le reliquat et respecte le plafond", () => {
  const state = { ...initialState(1000), stock: 5 };
  const refreshed = refreshStock(state, 1000 + REFILL_MS * 2.5);
  assert.equal(refreshed.stock, 7);
  assert.equal(refreshed.rechargedAt, 1000 + REFILL_MS * 2);
  assert.equal(refreshStock(state, 1000 + REFILL_MS * 100).stock, 10);
});

test("une ouverture après stock plein redémarre le délai", () => {
  const state = openPack(
    initialState(1000),
    "all",
    1000 + REFILL_MS * 5,
    () => 0,
  );
  assert.equal(state.rechargedAt, 1000 + REFILL_MS * 5);
  assert.equal(refreshStock(state, state.rechargedAt + REFILL_MS - 1).stock, 9);
});

test("le stock vide ne modifie pas la collection et refuse l’ouverture", () => {
  const state = { ...initialState(1000), stock: 0 };
  assert.throws(() => openPack(state, "all", 2000), /Aucune pochette/);
  assert.deepEqual(state.counts, {});
});

test("sauvegarde et restauration conservent les cartes sans doubler le tirage", () => {
  const state = openPack(initialState(1000), "all", 2000, () => 0);
  assert.deepEqual(parseState(JSON.stringify(state), 3000), state);
});

test("les sauvegardes corrompues, identifiants inconnus et valeurs invalides sont rejetés", () => {
  for (const patch of [
    { counts: { fake: 3 } },
    { stock: -1 },
    { favorites: ["fake"] },
    { exhibited: ["mona-lisa"] },
    { rechargedAt: Infinity },
    { latest: {} },
    { counts: { "436535": -2 } },
  ]) {
    assert.throws(() =>
      parseState(JSON.stringify({ ...initialState(1000), ...patch }), 3000),
    );
  }
  assert.throws(() => parseState("not json"));
});

test("un catalogue inexistant est refusé et une horloge reculée ne crée pas de stock", () => {
  assert.throws(() => drawPack("inconnu"));
  const state = { ...initialState(1000), stock: 5 };
  assert.equal(refreshStock(state, 500).stock, 5);
});
