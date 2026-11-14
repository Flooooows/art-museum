import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import {
  artworks,
  typeCatalogs,
  themeCatalogs,
  rarities,
  type Artwork,
} from "./data";
import {
  exploreArtworks,
  initialExploration,
  normalize,
} from "./collection-lab/exploration";

test("Collection Lab — le parcours expose uniquement les œuvres réelles, sans mutation", () => {
  const before = JSON.stringify(artworks);
  const order = artworks.map((art) => art.id);
  assert.deepEqual(
    exploreArtworks(artworks, initialExploration).map((art) => art.id),
    order,
  );
  for (const sort of ["title", "artist", "rarity"] as const) {
    const result = exploreArtworks(artworks, { ...initialExploration, sort });
    assert.equal(result.length, artworks.length);
    assert.equal(new Set(result.map((art) => art.id)).size, artworks.length);
    assert.ok(result.every((art) => artworks.includes(art)));
  }
  assert.equal(JSON.stringify(artworks), before);
});

test("Collection Lab — recherche accentuée, mots-clés, artiste, date et identifiant", () => {
  const sample = {
    ...artworks[0],
    title: "L’Été à Arles",
    artist: "Émile Martin",
    date: "1888",
    material: "Huile sur toile",
    origin: "France",
    id: "test-ete",
    anecdote: "Un paysage de Provence",
    story: "Un regard sur la campagne.",
  } as Artwork;
  for (const query of [
    "ÉTÉ",
    "ete arles",
    "Emile",
    "1888",
    "huile",
    "Provence",
    "test-ete",
    "  L'été   ",
  ]) {
    assert.equal(
      exploreArtworks([sample], { ...initialExploration, query }).length,
      1,
      query,
    );
  }
  assert.equal(normalize("L’ÉTÉ"), normalize("l'ete"));
  assert.deepEqual(
    exploreArtworks([sample], { ...initialExploration, query: "absent" }),
    [],
  );
  assert.deepEqual(
    exploreArtworks([sample], { ...initialExploration, query: "huile absent" }),
    [],
  );
});

test("Collection Lab — les douze types et quatre thèmes utilisent les appartenances réelles", () => {
  for (const category of typeCatalogs) {
    const results = exploreArtworks(artworks, {
      ...initialExploration,
      category: category.id,
    });
    assert.deepEqual(
      results,
      artworks.filter((art) => art.catalog === category.id),
    );
    assert.ok(results.length > 0, category.id);
  }
  for (const theme of themeCatalogs) {
    const results = exploreArtworks(artworks, {
      ...initialExploration,
      theme: theme.id,
    });
    assert.deepEqual(
      results,
      artworks.filter((art) => art.catalogIds.includes(theme.id)),
    );
    assert.ok(results.length > 0, theme.id);
  }
});

test("Collection Lab — croisement des filtres, niveaux et résultat vide", () => {
  for (const [level] of rarities.entries()) {
    assert.deepEqual(
      exploreArtworks(artworks, {
        ...initialExploration,
        rarity: String(level),
      }),
      artworks.filter((art) => art.rarity === level),
    );
  }
  for (const art of artworks.slice(0, 30)) {
    const filters = {
      ...initialExploration,
      category: art.catalog,
      theme: art.catalogIds[1] ?? "all",
      rarity: String(art.rarity),
      query: art.id,
    };
    const results = exploreArtworks(artworks, filters);
    assert.ok(results.includes(art));
    assert.ok(
      results.every(
        (item) =>
          item.catalog === filters.category &&
          item.rarity === art.rarity &&
          (filters.theme === "all" || item.catalogIds.includes(filters.theme)),
      ),
    );
  }
  assert.deepEqual(
    exploreArtworks(artworks, {
      ...initialExploration,
      query: "zzzzzzzzzz-introuvable",
    }),
    [],
  );
});

test("Collection Lab — tris français stables et rareté décroissante", () => {
  const collator = new Intl.Collator("fr", {
    sensitivity: "base",
    numeric: true,
  });
  for (const sort of ["title", "artist", "rarity"] as const) {
    const result = exploreArtworks(artworks, { ...initialExploration, sort });
    for (let i = 1; i < result.length; i++) {
      const a = result[i - 1],
        b = result[i];
      assert.ok(
        sort === "rarity"
          ? a.rarity >= b.rarity
          : collator.compare(a[sort], b[sort]) <= 0,
      );
    }
  }
});

test("Collection Lab — composants autonomes, aucun accès aux sauvegardes ni composants du jeu", async () => {
  for (const name of await readdir("src/collection-lab")) {
    if (!/\.tsx?$/.test(name)) continue;
    const source = await readFile(`src/collection-lab/${name}`, "utf8");
    assert.doesNotMatch(
      source,
      /localStorage|sessionStorage|indexedDB|openPack|saveCollection|fetch\(/,
      name,
    );
    assert.doesNotMatch(
      source,
      /from ["']\.\.\/(?:collection["']|components|Collection|game-presentation|styles)/,
      name,
    );
    assert.doesNotMatch(source, /import ["']\.\.\/.*\.css/, name);
  }
  for (const file of [
    "vite.config.ts",
    "src/main.tsx",
    "src/Collection.tsx",
    "src/components.tsx",
  ]) {
    assert.doesNotMatch(
      await readFile(file, "utf8"),
      /collection-lab|CollectionLab/,
      file,
    );
  }
  const styles = await readFile("src/collection-lab/styles.css", "utf8");
  assert.doesNotMatch(styles, /(?:^|\n)(?:body|html|:root|\*)\s*\{/);
  assert.match(
    await readFile("collection-lab.html", "utf8"),
    /noindex,nofollow/,
  );
});
