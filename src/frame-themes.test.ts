import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { themedSpecs } from "./card-lab/themedSpecs";
import { preservedFrameFamilies } from "./card-lab/prestigeSpecs";
import { rarities } from "./data";
import {
  applyThemedMaterial,
  clearSculptureBackdrop,
} from "../scripts/card-lab/themed-processing";

test("archives textuelles V4 — treize inventaires et transformations déclarées", async () => {
  const active = JSON.parse(
    await readFile(
      "catalog/card-lab/museum-frames/previous-edition.json",
      "utf8",
    ),
  );
  const previous = JSON.parse(
    await readFile(
      "catalog/card-lab/themed-frames/previous-edition.json",
      "utf8",
    ),
  );
  assert.equal(active.edition, "theme-v4");
  assert.equal(Object.keys(themedSpecs).length, 13);
  const sourceHashes = new Set();
  for (const [family, spec] of Object.entries(themedSpecs)) {
    assert.ok(!(preservedFrameFamilies as readonly string[]).includes(family));
    assert.equal(spec.cues.length, 3);
    for (const rarity of rarities) {
      const key = `${family}-${rarity.finish}`;
      assert.notEqual(
        active.frames[key].outputSha256,
        previous.frames[key].outputSha256,
      );
    }
    const f = active.frames[`${family}-argent`],
      source = active.sources[f.sourceFile];
    assert.deepEqual(source.cues, spec.cues);
    assert.deepEqual(source.generationReferences, []);
    assert.equal(source.imageJob, spec.job);
    assert.match(source.rawSourceSha256, /^[a-f0-9]{64}$/);
    sourceHashes.add(source.rawSourceSha256);
    const n = source.normalizedLayout;
    if (n)
      for (const x of [0, 2])
        for (const y of [0, 2]) {
          const sx =
            (n.targetCuts.x[x + 1] - n.targetCuts.x[x]) /
            (n.sourceCuts.x[x + 1] - n.sourceCuts.x[x]);
          const sy =
            (n.targetCuts.y[y + 1] - n.targetCuts.y[y]) /
            (n.sourceCuts.y[y + 1] - n.sourceCuts.y[y]);
          assert.ok(Math.abs(sx - sy) < 0.015, `Coins déformés : ${family}`);
        }
  }
  assert.equal(sourceHashes.size, 13);
  assert.match(themedSpecs.photographie.cues.join(" "), /pellicule/);
  assert.match(themedSpecs.textiles.cues.join(" "), /trame/);
  assert.match(themedSpecs.japon.cues.join(" "), /seigaiha/);
});

test("thèmes — finitions sur les accents, conservation dominante du bois, papier et cuir, alpha inchangé", () => {
  const source = Buffer.from([
    110, 65, 35, 255, 235, 225, 195, 230, 80, 25, 30, 255, 20, 45, 150, 210,
  ]);
  const before = Buffer.from(source);
  for (const finish of ["fer", "cuivre", "argent", "dore"] as const) {
    const out = applyThemedMaterial(source, finish, "mobilier");
    for (let p = 0; p < 12; p += 4)
      for (let c = 0; c < 3; c++)
        assert.ok(Math.abs(source[p + c] - out[p + c]) <= 31);
    for (let p = 3; p < source.length; p += 4) assert.equal(out[p], source[p]);
    assert.notDeepEqual(out.subarray(12, 15), source.subarray(12, 15));
  }
  assert.deepEqual(
    applyThemedMaterial(source, "lapis-lazuli", "mobilier"),
    source,
  );
  assert.deepEqual(source, before);
});

test("thèmes — voile semi-transparent du master sculpture nettoyé, pierre opaque intacte", () => {
  const raw = Buffer.from([
    200, 200, 200, 32, 210, 210, 210, 180, 230, 220, 205, 248,
  ]);
  const out = clearSculptureBackdrop(raw);
  assert.deepEqual(out.subarray(0, 8), Buffer.alloc(8));
  assert.deepEqual(out.subarray(8), raw.subarray(8));
  assert.equal(raw[3], 32);
});
