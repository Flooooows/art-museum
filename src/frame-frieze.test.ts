import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { friezeSpecs, friezePalette } from "./card-lab/friezeSpecs";
import { preservedFrameFamilies } from "./card-lab/prestigeSpecs";
import { rarities } from "./data";
const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");

test("frises — treize masters distincts et inventaires thématiques, palette sans motifs comme seule entrée", async () => {
  const active = JSON.parse(
    await readFile("src/card-lab/assets/refined-frames.json", "utf8"),
  );
  const previous = JSON.parse(
    await readFile(
      "catalog/card-lab/frieze-frames/previous-edition.json",
      "utf8",
    ),
  );
  assert.equal(active.edition, "frieze-v7");
  assert.equal(previous.edition, "decor-v6");
  assert.equal(Object.keys(friezeSpecs).length, 13);
  assert.equal(active.generationReferences.length, 1);
  const reference = active.generationReferences[0];
  assert.match(reference.inputFile, /material-palette\.png$/);
  assert.equal(sha(await readFile(reference.inputFile)), reference.inputSha256);
  const svg = await readFile(
    "catalog/card-lab/frieze-frames/references/material-palette.svg",
    "utf8",
  );
  assert.equal(
    (svg.match(/<rect /g) ?? []).length,
    1 + friezePalette.length * 2,
  );
  assert.doesNotMatch(svg, /<(path|image|text|circle|polygon)\b/);
  const sources = new Set(),
    inventories = new Set();
  for (const [family, spec] of Object.entries(friezeSpecs)) {
    assert.ok(spec);
    assert.equal(spec.motifs.length, 4);
    assert.ok(spec.forbidden.length > 20);
    inventories.add(spec.motifs.join("|"));
    for (const r of rarities)
      assert.notEqual(
        active.frames[`${family}-${r.finish}`].outputSha256,
        previous.frames[`${family}-${r.finish}`].outputSha256,
      );
    const source = active.sources[active.frames[`${family}-argent`].sourceFile];
    assert.deepEqual(source.motifs, spec.motifs);
    assert.equal(source.imageJob, spec.job);
    assert.deepEqual(source.generationReferences, active.generationReferences);
    assert.equal(
      sha(await readFile(source.rawSourceFile)),
      source.rawSourceSha256,
    );
    sources.add(source.rawSourceSha256);
  }
  assert.equal(sources.size, 13);
  assert.equal(inventories.size, 13);
  assert.deepEqual(
    active.designBenchmarks.map((b: { family: string }) => b.family),
    ["egypte", "prehistoire", "decoratifs"],
  );
  for (const b of active.designBenchmarks)
    assert.equal(sha(await readFile(b.file)), b.sha256);
  assert.equal(
    sha(await readFile("src/card-lab/friezeSpecs.ts")),
    active.specsScriptSha256,
  );
});

test("frises — les trente variantes approuvées et leurs masques restent identiques", async () => {
  const active = JSON.parse(
    await readFile("src/card-lab/assets/refined-frames.json", "utf8"),
  );
  const baseline = JSON.parse(
    await readFile("catalog/card-lab/prestige-frames/baseline.json", "utf8"),
  );
  for (const family of preservedFrameFamilies)
    for (const r of rarities) {
      const key = `${family}-${r.finish}`,
        frame = active.frames[key],
        old = baseline.frames[key];
      assert.equal(frame.outputSha256, old.outputSha256);
      assert.equal(frame.windowSha256, old.windowSha256);
      assert.equal(
        sha(
          await readFile(
            `src/card-lab/assets/${frame.assetDirectory}/${frame.file}`,
          ),
        ),
        old.outputSha256,
      );
      assert.equal(
        sha(
          await readFile(
            `src/card-lab/assets/${frame.assetDirectory}/${frame.windowFile}`,
          ),
        ),
        old.windowSha256,
      );
    }
});
