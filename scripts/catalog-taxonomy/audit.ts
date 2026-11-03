import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  activeTaxonomy,
  activeGameRelease,
  artworks,
  byId,
  typeCatalogs,
  themeCatalogs,
  catalogSize,
  artworkInCatalog,
  catalogCover,
} from "../../src/data";
import { catalogDataset } from "../../src/catalog/repository";
import { parseTaxonomy } from "../../src/catalog/taxonomy";

parseTaxonomy(activeTaxonomy, artworks, activeGameRelease.id);
for (const [file, expected] of Object.entries(activeTaxonomy.sourceHashes)) {
  assert.equal(
    createHash("sha256")
      .update(await readFile(file))
      .digest("hex"),
    expected,
    `Source de classement modifiée : ${file}`,
  );
}
const report = JSON.parse(
  await readFile("catalog/taxonomy/report.json", "utf8"),
);
assert.equal(typeCatalogs.length, 12);
assert.equal(themeCatalogs.length, 4);
assert.equal(
  typeCatalogs.reduce((n, c) => n + catalogSize(c.id), 0),
  1011,
);
for (const c of [...typeCatalogs, ...themeCatalogs]) {
  const stored = [...report.types, ...report.themes].find(
    (v: any) => v.id === c.id,
  );
  assert.equal(catalogSize(c.id), stored.count);
  await readFile(`public${catalogCover(c)}`);
}
for (const a of activeTaxonomy.assignments) {
  const w = byId[a.artworkId];
  assert.equal(w.catalog, a.primaryCatalogId);
  assert.deepEqual(w.catalogIds, [a.primaryCatalogId, ...a.themeIds]);
  for (const file of a.sourceFiles)
    assert.ok(activeTaxonomy.sourceHashes[file]);
  const original = activeGameRelease.works.find((v) => v.id === w.id);
  if (original) {
    // Only classification and its independent visual-frame pointer may change in this projection.
    for (const [key, value] of Object.entries(original)) {
      if (["catalog", "catalogIds", "familyId"].includes(key)) continue;
      assert.deepEqual((w as any)[key], value, `${w.id} : ${key}`);
    }
  } else assert.ok(catalogDataset.works.some((v) => v.id === w.id));
  assert.equal(typeCatalogs.filter((c) => artworkInCatalog(w, c.id)).length, 1);
}
console.log(
  JSON.stringify({
    taxonomy: activeTaxonomy.id,
    total: artworks.length,
    types: report.types,
    themes: report.themes,
  }),
);
