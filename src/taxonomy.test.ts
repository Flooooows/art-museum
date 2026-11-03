import { test } from "node:test";
import assert from "node:assert/strict";
import {
  activeTaxonomy,
  activeGameRelease,
  artworks,
  byId,
  typeCatalogs,
  themeCatalogs,
  visibleCatalogs,
  catalogs,
  catalogSize,
  artworkInCatalog,
  ratesForCatalog,
} from "./data";
import { parseTaxonomy } from "./catalog/taxonomy";
import { initialState, parseState, drawPack } from "./collection";
import { getFrame } from "./frames";
import { paginationPages } from "./pagination";

test("classement — douze types exclusifs, quatre thèmes, 1011 cartes sans doublon", () => {
  assert.equal(typeCatalogs.length, 12);
  assert.equal(themeCatalogs.length, 4);
  assert.equal(visibleCatalogs.length, 16);
  assert.equal(
    typeCatalogs.reduce((n, c) => n + catalogSize(c.id), 0),
    1011,
  );
  for (const w of artworks) {
    assert.equal(
      typeCatalogs.filter((c) => artworkInCatalog(w, c.id)).length,
      1,
    );
    assert.equal(w.rarity, w.humanRarity!.level);
    assert.ok(getFrame(w));
  }
});
test("classement — formes et techniques vérifiées, pas de fourre-tout Renaissance", () => {
  for (const [id, type] of Object.entries({
    "45434": "estampes",
    "437654": "peinture",
    "9480": "verre",
    "1085": "mobilier",
    "467642": "textiles",
    "544864": "sculpture",
    "cma-102388": "manuscrits",
    "cma-105933": "manuscrits",
    "cma-130939": "objets-archeologiques",
  }))
    assert.equal(byId[id].catalog, type);
  assert.equal(catalogSize("peinture"), 235);
  assert.equal(catalogSize("photographie"), 90);
  assert.ok(!visibleCatalogs.some((c) => c.title === "Renaissance Éternelle"));
  assert.ok(artworkInCatalog(byId["mona-lisa"], "renaissance-italienne"));
  assert.ok(!artworkInCatalog(byId["436535"], "renaissance-italienne"));
});
test("classement — anciens catalogues des derniers tirages toujours importables, sans don", () => {
  for (const c of catalogs)
    for (const size of [3, 5]) {
      const ids = artworks.slice(0, size).map((w) => w.id);
      const state = {
        ...initialState(1000),
        counts: Object.fromEntries(ids.map((id) => [id, 2])),
        favorites: ids.slice(0, 1),
        exhibited: ids.slice(0, 2),
        latest: {
          catalog: c.id,
          date: 1000,
          cards: ids.map((id) => ({ id, isNew: false })),
          revealed: [0],
        },
      };
      assert.deepEqual(parseState(JSON.stringify(state), 2000), state);
    }
});
test("classement — les seize pochettes tirent uniquement leurs membres, taux généralistes inchangés", () => {
  for (const c of visibleCatalogs)
    for (const roll of [0, 0.56, 0.82, 0.97, 0.99999]) {
      const pack = drawPack(c.id, () => roll);
      assert.equal(pack.length, 5);
      assert.ok(pack.every((id) => artworkInCatalog(byId[id], c.id)));
    }
  assert.deepEqual(
    ratesForCatalog("all").map((n) => +n.toFixed(1)),
    [56.1, 25.5, 15, 3, 0.4],
  );
});
test("classement — couverture, types et thèmes invalides ou sans preuve refusés", () => {
  for (const mutate of [
    (t: any) => t.assignments.pop(),
    (t: any) => t.assignments.push(t.assignments[0]),
    (t: any) => (t.assignments[0].primaryCatalogId = "egypte"),
    (t: any) => t.assignments[0].themeIds.push("peinture"),
    (t: any) => (t.assignments[0].sourceFiles = []),
    (t: any) => (t.catalogs[0].coverArtworkId = "not-a-work"),
    (t: any) => (t.releaseId = "other-release"),
  ]) {
    const t = structuredClone(activeTaxonomy);
    mutate(t);
    assert.throws(() => parseTaxonomy(t, artworks, activeGameRelease.id));
  }
});

test("pagination — navigation bornée, premières et dernières pages toujours accessibles", () => {
  assert.deepEqual(paginationPages(1, 1), [1]);
  assert.deepEqual(paginationPages(1, 169), [1, 2, null, 169]);
  assert.deepEqual(paginationPages(85, 169), [1, null, 84, 85, 86, null, 169]);
  assert.deepEqual(paginationPages(169, 169), [1, null, 168, 169]);
  for (let p = 1; p <= 169; p++) {
    const pages = paginationPages(p, 169);
    assert.ok(pages.includes(p));
    assert.ok(pages.includes(1));
    assert.ok(pages.includes(169));
    assert.ok(pages.length <= 7);
  }
});
