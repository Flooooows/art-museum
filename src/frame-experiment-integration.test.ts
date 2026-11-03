import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { allFrameExperiments } from "./card-lab/experiments/series";
import { rarities } from "./data";
const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");

test("intégration des expériences — 65 variantes aux couleurs et à la géométrie examinées, sans effacement opaque", async () => {
  const { frames: labFrames } = JSON.parse(
    await readFile(
      "catalog/card-lab/progression-frames/previous-edition.json",
      "utf8",
    ),
  );
  for (const { family } of allFrameExperiments) {
    let alpha: Buffer | undefined;
    for (const rarity of rarities) {
      const f = labFrames[`${family}-${rarity.finish}`];
      assert.equal(f.assetDirectory, "experiment-frames");
      const source = await sharp(f.sourceFile).ensureAlpha().raw().toBuffer();
      const output = await sharp(
        `src/card-lab/assets/${f.assetDirectory}/${f.file}`,
      )
        .ensureAlpha()
        .raw()
        .toBuffer();
      const mask = await sharp(
        `src/card-lab/assets/${f.assetDirectory}/${f.windowFile}`,
      )
        .ensureAlpha()
        .extractChannel("alpha")
        .raw()
        .toBuffer();
      assert.equal(output.length, source.length);
      const currentAlpha = Buffer.alloc(source.length / 4);
      for (let p = 0; p < source.length; p += 4) {
        currentAlpha[p / 4] = output[p + 3];
        if (source[p + 3] >= 16) {
          for (let c = 0; c < 4; c++)
            assert.equal(
              output[p + c],
              source[p + c],
              `${f.key} : pixel altéré`,
            );
          assert.equal(mask[p / 4], 0, `${f.key} : fond sur un ornement`);
        } else assert.equal(output[p + 3], 0);
      }
      if (alpha) assert.deepEqual(currentAlpha, alpha);
      else alpha = currentAlpha;
    }
  }
});

test("intégration des expériences — provenance exacte, archive antérieure et jeu principal indépendant", async () => {
  const registry = JSON.parse(
    await readFile(
      "catalog/card-lab/progression-frames/previous-edition.json",
      "utf8",
    ),
  );
  assert.equal(registry.edition, "experiments-v1");
  assert.equal(
    sha(await readFile(registry.preparationScript)),
    registry.preparationScriptSha256,
  );
  assert.deepEqual(
    registry,
    JSON.parse(
      await readFile(
        "catalog/card-lab/experiment-frames/provenance.json",
        "utf8",
      ),
    ),
  );
  assert.equal(
    JSON.parse(
      await readFile(
        "catalog/card-lab/experiment-frames/previous-edition.json",
        "utf8",
      ),
    ).edition,
    "approved-only",
  );
  const game = JSON.parse(
    await readFile(
      "src/game-presentation/cards/assets/refined-frames.json",
      "utf8",
    ),
  );
  assert.equal(game.edition, "approved-only");
  assert.equal(Object.keys(game.frames).length, 25);
  for (const source of Object.values(registry.sources) as any[]) {
    if (source.paletteManifest) {
      assert.equal(sha(await readFile(source.masterFile)), source.masterSha256);
      assert.equal(source.layoutTransformation, null);
    }
  }
});
