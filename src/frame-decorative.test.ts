import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { decorativeSpecs } from "./card-lab/decorativeSpecs";
import { rarities } from "./data";
import { applyDecorativeFinish } from "../scripts/card-lab/decorative-processing";

const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");
test("Arts décoratifs — treize nouveaux masters, référence exacte et motifs déclarés propres à chaque famille", async () => {
  const active = JSON.parse(
    await readFile(
      "catalog/card-lab/frieze-frames/previous-edition.json",
      "utf8",
    ),
  );
  const previous = JSON.parse(
    await readFile(
      "catalog/card-lab/decorative-frames/previous-edition.json",
      "utf8",
    ),
  );
  assert.equal(active.edition, "decor-v6");
  assert.equal(Object.keys(decorativeSpecs).length, 13);
  assert.equal(active.references.length, 2);
  for (const ref of active.references) {
    assert.match(ref.key, /^decoratifs-(argent|lapis-lazuli)$/);
    assert.equal(sha(await readFile(ref.sourceFile)), ref.sourceSha256);
    assert.equal(sha(await readFile(ref.inputFile)), ref.inputSha256);
  }
  const masters = new Set();
  for (const [family, spec] of Object.entries(decorativeSpecs)) {
    for (const r of rarities)
      assert.notEqual(
        active.frames[`${family}-${r.finish}`].outputSha256,
        previous.frames[`${family}-${r.finish}`].outputSha256,
      );
    const source = active.sources[active.frames[`${family}-argent`].sourceFile];
    assert.equal(source.motif, spec.motif);
    assert.equal(source.imageJob, spec.job);
    assert.deepEqual(source.generationReferences, active.references);
    assert.equal(
      sha(await readFile(source.rawSourceFile)),
      source.rawSourceSha256,
    );
    masters.add(source.rawSourceSha256);
  }
  assert.equal(masters.size, 13);
});

test("Arts décoratifs — métal et fonds colorés distincts, cinq finitions et alpha inchangé", () => {
  const raw = Buffer.from([20, 45, 150, 255, 210, 170, 85, 230, 0, 0, 0, 0]);
  const before = Buffer.from(raw),
    outputs = [];
  for (const r of rarities) {
    const out = applyDecorativeFinish(raw, r.finish);
    outputs.push(out.toString("hex"));
    for (let i = 3; i < raw.length; i += 4) assert.equal(out[i], raw[i]);
  }
  assert.equal(new Set(outputs).size, 5);
  const copper = applyDecorativeFinish(raw, "cuivre"),
    silver = applyDecorativeFinish(raw, "argent");
  assert.ok(copper[0] > copper[2]);
  assert.ok(silver[2] > silver[0]);
  assert.notDeepEqual(silver.subarray(0, 3), silver.subarray(4, 7));
  assert.deepEqual(applyDecorativeFinish(raw, "lapis-lazuli"), raw);
  assert.deepEqual(raw, before);
});
