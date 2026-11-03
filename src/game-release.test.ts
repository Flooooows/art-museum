import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { catalogDataset } from "./catalog/repository";
import { parseGameRelease } from "./catalog/gameRelease";
import {
  artworks,
  byId,
  activeGameRelease,
  catalogs,
  ratesForCatalog,
} from "./data";
import { parseState, initialState, openPack, revealCards } from "./collection";
import { auditGameRelease } from "../scripts/game-release/audit";

test("publication — 997 cartes du millier et 14 extras, raretés humaines, socle intact", async () => {
  assert.equal(catalogDataset.works.length, 100);
  assert.equal(activeGameRelease.works.length, 911);
  assert.equal(artworks.length, 1011);
  assert.equal(activeGameRelease.existingRarities.length, 100);
  assert.equal(new Set(artworks.map((w) => w.id)).size, 1011);
  for (const d of activeGameRelease.existingRarities)
    assert.equal(byId[d.artworkId].rarity, d.level);
  assert.equal(
    createHash("sha256")
      .update(await readFile("src/catalog/seed.json"))
      .digest("hex"),
    activeGameRelease.baseCatalogSha256,
  );
  for (const w of activeGameRelease.works)
    assert.equal(w.rarity, w.humanRarity.level);
});

test("publication — chaque nouvelle image, preuve et choix final restent contrôlés", async () => {
  const audit = await auditGameRelease();
  assert.equal(audit.imagesDecoded, 911);
  assert.equal(audit.totalWorks, 1011);
});

test("publication — falsification juridique, blocage, autre image ou rareté remplacée refusés", () => {
  for (const change of [
    (r: any) => (r.works[0].legal.decision.status = "REVIEW_REQUIRED"),
    (r: any) => (r.works[0].legal.decision.status = "BLOCKED"),
    (r: any) => (r.works[0].rarity = (r.works[0].rarity + 1) % 5),
    (r: any) => (r.works[0].legal.input.artworkId = "other-work"),
    (r: any) =>
      (r.works[0].imageSource = "https://example.org/other-image.jpg"),
    (r: any) => (r.works[0].image = "/assets/other.webp"),
    (r: any) => (r.works[0].humanRarity.exportSha256 = "invalid"),
    (r: any) => r.works.push(r.works[0]),
    (r: any) => r.existingRarities.pop(),
    (r: any) => (r.authorization = "automatic"),
    (r: any) => delete r.reviewPublicationAuthorization,
    (r: any) => r.reviewPublicationAuthorization.artworkIds.pop(),
    (r: any) => r.reviewPublicationAuthorization.artworkIds.push("cma-111594"),
    (r: any) =>
      (r.reviewPublicationAuthorization.catalogVersion = "another-catalog"),
    (r: any) =>
      (r.reviewPublicationAuthorization.catalogSha256 = "0".repeat(64)),
    (r: any) =>
      (r.works.find(
        (w: any) => w.legal.decision.status === "REVIEW_REQUIRED",
      ).legal.decision.status = "AUTO_APPROVED_EU"),
  ]) {
    const r = structuredClone(activeGameRelease);
    change(r);
    assert.throws(() => parseGameRelease(r, catalogDataset));
  }
});

test("publication — sauvegarde intégrale ancienne et dernières pochettes de trois/cinq cartes conservées", () => {
  const ids = catalogDataset.works.map((w) => w.id);
  for (const size of [3, 5]) {
    const state = {
      ...initialState(1000),
      counts: Object.fromEntries(ids.map((id) => [id, 2])),
      favorites: ids.slice(0, 3),
      exhibited: ids.slice(0, 6),
      stock: 8,
      opened: 40,
      latest: {
        catalog: "all",
        date: 1000,
        cards: ids.slice(0, size).map((id) => ({ id, isNew: false })),
        revealed: [0],
      },
    };
    assert.deepEqual(parseState(JSON.stringify(state), 2000), state);
    const revealed = revealCards(state);
    assert.equal(revealed.latest?.revealed.length, size);
    assert.deepEqual(revealed.counts, state.counts);
    const next = openPack(state, "all", 2000, () => 0);
    for (const id of ids) assert.ok(next.counts[id] >= 2);
    assert.equal(
      Object.values(next.counts).reduce((a, b) => a + b, 0),
      205,
    );
  }
});

test("publication — nouvelles cartes tirables et réimportables, probabilités inchangées", () => {
  assert.equal(catalogs.filter((c) => c.kind !== "legacy").length, 16);
  assert.deepEqual(
    ratesForCatalog("all").map((r) => Number(r.toFixed(1))),
    [56.1, 25.5, 15, 3, 0.4],
  );
  const w = activeGameRelease.works.find(
    (w) => w.legal.decision.status === "REVIEW_REQUIRED",
  )!;
  const pool = artworks.filter((a) => a.rarity === w.rarity);
  const rates = ratesForCatalog("all");
  const roll =
    (rates.slice(0, w.rarity).reduce((a, b) => a + b, 0) +
      rates[w.rarity] / 2) /
    100;
  const position = (pool.findIndex((a) => a.id === w.id) + 0.5) / pool.length;
  let step = 0;
  const state = openPack(initialState(1000), "all", 2000, () =>
    step++ % 2 ? position : roll,
  );
  assert.ok(state.latest?.cards.every((c) => c.id === w.id));
  assert.deepEqual(parseState(JSON.stringify(state), 3000), state);
});

test("publication — autorisation explicite sans convertir les 658 dossiers à revérifier", () => {
  assert.equal(
    parseGameRelease(activeGameRelease, catalogDataset),
    activeGameRelease,
  );
  assert.equal(
    activeGameRelease.reviewPublicationAuthorization?.artworkIds.length,
    658,
  );
  assert.equal(
    activeGameRelease.works.filter(
      (w) => w.legal.decision.status === "REVIEW_REQUIRED",
    ).length,
    658,
  );
});

test("publication — la sauvegarde des 353 cartes reste entière, sans don de nouvelles cartes", async () => {
  const prior = JSON.parse(
    await readFile(
      "catalog/game-release/game-2026-10-30-d985529a3c5c/release.json",
      "utf8",
    ),
  );
  const ids = [...catalogDataset.works, ...prior.works].map((w) => w.id);
  const state = {
    ...initialState(1000),
    counts: Object.fromEntries(ids.map((id) => [id, 2])),
    favorites: ids.slice(-3),
    exhibited: ids.slice(-6),
    latest: {
      catalog: "all",
      date: 1000,
      cards: ids.slice(-5).map((id) => ({ id, isNew: false })),
      revealed: [0, 1],
    },
  };
  const restored = parseState(JSON.stringify(state), 2000);
  assert.deepEqual(restored, state);
  assert.equal(Object.keys(restored.counts).length, 353);
  assert.equal(
    activeGameRelease.works.filter((w) => !restored.counts[w.id]).length,
    658,
  );
});

test("publication — les cinq dossiers bloqués ne sont ni ajoutés ni tirables", async () => {
  const report = JSON.parse(
    await readFile("public/legal-eu/report.json", "utf8"),
  );
  const blocked = Object.values(report.datasets)
    .flatMap((d: any) => d.entries)
    .filter((e: any) => e.decision.status === "BLOCKED");
  assert.equal(blocked.length, 5);
  for (const e of blocked) assert.equal(byId[e.input.artworkId], undefined);
});
