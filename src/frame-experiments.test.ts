import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { frameFamilies } from "./card-lab/frameRules";
import { preservedFrameFamilies } from "./card-lab/prestigeSpecs";
import {
  allFrameExperiments,
  newFrameExperiments,
} from "./card-lab/experiments/series";
import { experimentalFrameFinishes } from "./card-lab/generationStyle";

const root = "src/card-lab/experiments";
const sha = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");

test("palettes — 19 familles et 95 variantes, intégration limitée au lab", async () => {
  const catalogue = JSON.parse(
    await readFile(`${root}/catalogue.json`, "utf8"),
  );
  assert.equal(catalogue.families, 19);
  assert.equal(catalogue.totalVariants, 95);
  assert.deepEqual(
    catalogue.entries.map((e: { family: string }) => e.family),
    [...frameFamilies],
  );
  assert.equal(newFrameExperiments.length, 11);
  assert.equal(allFrameExperiments.length, 13);
  assert.equal(
    new Set([
      ...allFrameExperiments.map((e) => e.family),
      ...preservedFrameFamilies,
    ]).size,
    19,
  );
  for (const entry of catalogue.entries) {
    assert.equal(entry.files.length, 5);
    const manifest = JSON.parse(
      await readFile(`${root}/${entry.family}/essai-01-finitions.json`, "utf8"),
    );
    assert.deepEqual(
      manifest.outputs.map((o: { finish: string }) => o.finish),
      experimentalFrameFinishes.map((e) => e.finish),
    );
    for (const output of manifest.outputs) {
      const bytes = await readFile(output.file);
      assert.equal(sha(bytes), output.sha256);
      if (entry.kind === "existing-approved-copy")
        assert.deepEqual(bytes, await readFile(output.referenceFile));
    }
    const sheet = await sharp(`${root}/${entry.sheet}`).metadata();
    assert.equal(sheet.width, 1380);
    assert.equal(sheet.height, 432);
  }
  for (const file of [
    "src/card-lab/assets/refined-frames.json",
    "src/game-presentation/cards/assets/refined-frames.json",
  ]) {
    const registry = JSON.parse(await readFile(file, "utf8"));
    const lab = file.startsWith("src/card-lab/");
    assert.equal(registry.edition, lab ? "experiments-v1" : "approved-only");
    assert.ok(
      lab
        ? Object.keys(registry.frames).length === 95
        : Object.values(registry.frames).every((f: any) =>
            (preservedFrameFamilies as readonly string[]).includes(f.family),
          ),
    );
  }
});

test("palettes locales — chaque nouvelle famille garde exactement l’alpha du master dans les cinq finitions", async () => {
  for (const { family, imageJob } of newFrameExperiments) {
    const manifest = JSON.parse(
      await readFile(`${root}/${family}/essai-01-finitions.json`, "utf8"),
    );
    assert.equal(manifest.imageJob, imageJob);
    const master = await readFile(manifest.sourceFile);
    assert.equal(sha(master), manifest.sourceSha256);
    const { data: alpha, info } = await sharp(master)
      .ensureAlpha()
      .extractChannel("alpha")
      .raw()
      .toBuffer({ resolveWithObject: true });
    assert.equal(info.width, 1024);
    assert.equal(info.height, 1536);
    assert.equal(alpha[768 * 1024 + 512], 0);
    assert.equal(manifest.generationReferences.length, 8);
    for (const ref of manifest.generationReferences)
      assert.equal(sha(await readFile(ref.file)), ref.sha256);
    for (const output of manifest.outputs)
      assert.deepEqual(
        await sharp(output.file)
          .ensureAlpha()
          .extractChannel("alpha")
          .raw()
          .toBuffer(),
        alpha,
      );
    assert.equal(
      new Set(manifest.outputs.map((o: { sha256: string }) => o.sha256)).size,
      5,
    );
    assert.deepEqual(
      await readFile(`${root}/${family}/essai-01-lapis-lazuli.png`),
      master,
    );
  }
});
