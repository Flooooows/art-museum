import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { readHistoricalFile } from "../scripts/project-files";
import {
  artworks,
  byId,
  catalogs,
  artworkInCatalog,
  ratesForCatalog,
} from "./data";
import {
  boosterGroups,
  specializedBoosterGroups,
  worksForBooster,
} from "./game-presentation/boosters/groups";
import {
  cardFrameFor,
  labFrames,
  commonCardAperture,
} from "./game-presentation/cards/frames";
import { ambienceForCards } from "./game-presentation/opening/rules";

test("jeu — le moteur historique reste vérifiable sans remplacer son empreinte", async () => {
  const protectedInputs = JSON.parse(
    await readFile("catalog/rarity-v2/protected-inputs.json", "utf8"),
  );
  const expected = protectedInputs.files["src/collection.ts"];
  const historical = await readHistoricalFile("src/collection.ts", expected);
  assert.equal(createHash("sha256").update(historical).digest("hex"), expected);
});
import { packWorks, ratesForPack } from "./packSelection";
import {
  drawPack,
  initialState,
  openPack,
  parseState,
  revealCards,
} from "./collection";

test("jeu — les sept pochettes couvrent les 1011 œuvres sans réécrire types et thèmes", () => {
  assert.equal(boosterGroups.length, 7);
  const ids = specializedBoosterGroups.flatMap((g) =>
    worksForBooster(g.id).map((a) => a.id),
  );
  assert.equal(ids.length, 1011);
  assert.equal(new Set(ids).size, 1011);
  assert.deepEqual(packWorks("universel"), artworks);
  assert.deepEqual(ratesForPack("universel"), ratesForCatalog("all"));
  for (const catalog of catalogs) {
    assert.deepEqual(
      packWorks(catalog.id),
      artworks.filter((a) => artworkInCatalog(a, catalog.id)),
    );
    assert.deepEqual(ratesForPack(catalog.id), ratesForCatalog(catalog.id));
  }
});

test("jeu — chaque nouveau tirage respecte les probabilités affichées et le regroupement choisi", () => {
  for (const group of boosterGroups) {
    const pool = new Set(packWorks(group.id).map((a) => a.id)),
      rates = ratesForPack(group.id);
    assert.ok(Math.abs(rates.reduce((a, b) => a + b, 0) - 100) < 1e-9);
    let cumulative = 0;
    for (let level = 0; level < rates.length; level++) {
      if (!rates[level]) continue;
      const roll = (cumulative + rates[level] / 2) / 100;
      cumulative += rates[level];
      for (const position of [0, 0.5, 0.999999]) {
        let step = 0;
        const drawn = drawPack(group.id, () => (step++ % 2 ? position : roll));
        assert.equal(drawn.length, 5);
        assert.ok(
          drawn.every((id) => pool.has(id) && byId[id].rarity === level),
        );
      }
    }
  }
});

test("jeu — stock, inventaire, favoris et musée survivent au nouveau format de pochette", () => {
  const before = {
    ...initialState(1000),
    counts: { "mona-lisa": 2 },
    favorites: ["mona-lisa"],
    exhibited: ["mona-lisa"],
  };
  for (const group of boosterGroups) {
    const drawn = openPack(before, group.id, 2000, () => 0);
    assert.equal(drawn.stock, 9);
    assert.equal(drawn.opened, 1);
    assert.equal(
      Object.values(drawn.counts).reduce((a, b) => a + b, 0),
      7,
    );
    assert.deepEqual(drawn.favorites, before.favorites);
    assert.deepEqual(drawn.exhibited, before.exhibited);
    assert.deepEqual(parseState(JSON.stringify(drawn), 3000), drawn);
    const visible = revealCards(revealCards(drawn, 4));
    assert.deepEqual(visible.counts, drawn.counts);
    assert.equal(visible.stock, drawn.stock);
    assert.deepEqual(parseState(JSON.stringify(visible), 3000), visible);
  }
  assert.deepEqual(before.counts, { "mona-lisa": 2 });
});

test("jeu — les 90 cadres actifs reprennent les finitions humaines et le gabarit sûr", async () => {
  assert.equal(Object.keys(labFrames).length, 90);
  for (const art of artworks) {
    const f = cardFrameFor(art);
    assert.notEqual(f.family, "prehistoire");
    assert.equal(f.level, art.rarity);
    assert.equal(art.rarity, art.humanRarity!.level);
  }
  for (const f of Object.values(labFrames)) {
    const bytes = await readFile(
      `src/game-presentation/cards/assets/refined-frames/${f.file}`,
    );
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      f.outputSha256,
    );
    const mask = await readFile(
      `src/game-presentation/cards/assets/refined-frames/${f.windowFile}`,
    );
    assert.equal(
      createHash("sha256").update(mask).digest("hex"),
      f.windowSha256,
    );
    const c = commonCardAperture,
      a = f.aperture;
    assert.ok(
      c.left >= a.left - 1e-8 &&
        c.top >= a.top - 1e-8 &&
        c.left + c.width <= a.left + a.width + 1e-8 &&
        c.top + c.height <= a.top + a.height + 1e-8,
    );
  }
});

test("jeu — la mise en scène suit le maximum réel, sans scénario de démonstration", () => {
  for (let level = 0; level < 5; level++) {
    const cards = artworks.filter((a) => a.rarity <= level).slice(0, 4);
    cards.push(artworks.find((a) => a.rarity === level)!);
    assert.equal(ambienceForCards(cards).level, level);
  }
});

test("jeu — ouverture rapide une par une, sans réglages, avec tout révéler sous les cartes", async () => {
  const opening = await readFile("src/Opening.tsx", "utf8");
  assert.match(opening, /speed=\{1\.6\}/);
  assert.match(opening, /showAll \? "board" : "sequential"/);
  assert.match(opening, /onOpen\(false\)/);
  assert.doesNotMatch(
    opening,
    /<select|type="checkbox"|setSpeed|setMood|published-opening__modes/,
  );
  const scene = await readFile(
    "src/game-presentation/opening/OpeningScene.tsx",
    "utf8",
  );
  assert.match(
    scene,
    /className="study-actions"[\s\S]*className="study-secondary study-reveal-all"[\s\S]*Tout révéler/,
  );
});

test("jeu — cartes compactes communes et lot horizontal sans retour à la ligne", async () => {
  const css = await readFile("src/game-presentation/integration.css", "utf8");
  assert.match(css, /grid-auto-flow: column/);
  assert.match(css, /grid-auto-columns: clamp\(200px/);
  assert.match(css, /overflow-x: auto/);
  assert.match(css, /--compact-inverse-scale/);
  for (const file of [
    "src/components.tsx",
    "src/game-presentation/opening/OpeningScene.tsx",
  ]) {
    assert.match(await readFile(file, "utf8"), /<CompactCard/);
  }
});

test("jeu — aucune dépendance de la présentation publiée vers les futurs essais du lab", async () => {
  async function inspect(dir: string) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const file = `${dir}/${entry.name}`;
      if (entry.isDirectory()) await inspect(file);
      else if (/\.(tsx?|css)$/.test(entry.name))
        assert.doesNotMatch(
          await readFile(file, "utf8"),
          /(?:from\s*|import\s*|url\()["'`]?[^\n;]*(?:card-lab|booster-lab|opening-lab|muse-lab)/,
          file,
        );
    }
  }
  await inspect("src/game-presentation");
  const opening = await readFile(
    "src/game-presentation/opening/OpeningScene.tsx",
    "utf8",
  );
  assert.doesNotMatch(
    opening,
    /openingWorksFor|openingScenarioAvailable|MaximumRarity|aucune acquisition/,
  );
  const build = await readFile("vite.config.ts", "utf8");
  assert.doesNotMatch(build, /review\.html|lab\.html/);
});
