import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { frameFamilies } from "./card-lab/frameRules";
import { rarities } from "./data";
import { progressionJobs } from "./card-lab/experiments/progression-series";
import { rarityProgressionRequest } from "./card-lab/generationStyle";
const sha = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const root = "catalog/card-lab/progression-frames";

test("progressions — le brief futur distingue le travail de chaque rareté et utilise les références approuvées", () => {
  const prompts = new Set();
  for (const rarity of rarities) {
    const request = rarityProgressionRequest(
      "Textiles",
      "src/card-lab/experiments/textiles/essai-01.png",
      rarity.finish,
    );
    assert.equal(request.images.length, 5);
    assert.match(request.images[1], /japon\/essai-02-cinq-raretes/);
    assert.match(request.images[2], /verre\/essai-02-cinq-raretes/);
    assert.ok(request.images[3].includes(`egypte-${rarity.finish}`));
    assert.match(request.prompt, /not recoloring one common master/);
    prompts.add(request.prompt);
  }
  assert.equal(prompts.size, 5);
});

test("progressions — 19 thèmes, 95 jobs distincts et dessins variant avec la rareté", async () => {
  const registry = JSON.parse(
    await readFile("src/card-lab/assets/refined-frames.json", "utf8"),
  );
  assert.equal(registry.edition, "progression-v2");
  assert.equal(Object.keys(registry.frames).length, 95);
  assert.deepEqual(
    new Set(Object.keys(progressionJobs)),
    new Set(frameFamilies),
  );
  assert.equal(new Set(Object.values(progressionJobs).flat()).size, 95);
  assert.equal(
    sha(await readFile(registry.preparationScript)),
    registry.preparationScriptSha256,
  );
  assert.equal(
    sha(await readFile(registry.processingScript)),
    registry.processingScriptSha256,
  );
  assert.deepEqual(
    registry,
    JSON.parse(await readFile(`${root}/provenance.json`, "utf8")),
  );
  for (const family of frameFamilies) {
    const images = new Set(),
      alphas = new Set(),
      masks = new Set();
    for (const [level, rarity] of rarities.entries()) {
      const f = registry.frames[`${family}-${rarity.finish}`],
        s = registry.sources[f.sourceFile];
      assert.equal(f.imageJob, progressionJobs[family][level]);
      assert.equal(f.assetDirectory, "progression-frames");
      assert.equal(f.removedMetalPixels, 0);
      assert.equal(f.backdropOnMetalPixels, 0);
      const raw = await readFile(s.rawSourceFile);
      assert.equal(sha(raw), s.rawSourceSha256);
      images.add(sha(raw));
      const alpha = await sharp(raw)
        .ensureAlpha()
        .extractChannel("alpha")
        .raw()
        .toBuffer();
      alphas.add(sha(alpha));
      masks.add(f.windowSha256);
      const layout = s.normalizedLayout;
      if (layout)
        for (const x of [0, 2])
          for (const y of [0, 2]) {
            const sx =
              (layout.targetCuts.x[x + 1] - layout.targetCuts.x[x]) /
              (layout.sourceCuts.x[x + 1] - layout.sourceCuts.x[x]);
            const sy =
              (layout.targetCuts.y[y + 1] - layout.targetCuts.y[y]) /
              (layout.sourceCuts.y[y + 1] - layout.sourceCuts.y[y]);
            assert.ok(Math.abs(sx - sy) < 0.02, `${f.key}: coins déformés`);
          }
    }
    assert.equal(images.size, 5);
    assert.ok(alphas.size > 1);
    assert.ok(masks.size > 1);
  }
});

test("progressions — tous les premiers essais, leurs sorties et la copie du jeu sont conservés", async () => {
  const protectedFiles = JSON.parse(
    await readFile(`${root}/preserved-inputs.json`, "utf8"),
  );
  assert.equal(Object.keys(protectedFiles.hashes).length, 695);
  for (const [file, hash] of Object.entries(protectedFiles.hashes))
    assert.equal(sha(await readFile(file)), hash, file);
  const previous = JSON.parse(
    await readFile(`${root}/previous-edition.json`, "utf8"),
  );
  assert.equal(previous.edition, "experiments-v1");
  assert.equal(Object.keys(previous.frames).length, 95);
  const game = JSON.parse(
    await readFile(
      "src/game-presentation/cards/assets/refined-frames.json",
      "utf8",
    ),
  );
  assert.equal(game.edition, "approved-only");
  assert.equal(Object.keys(game.frames).length, 25);
});

test("progressions — couleurs et pixels opaques des sources adaptées inchangés, masques sans chevauchement", async () => {
  const registry = JSON.parse(
    await readFile("src/card-lab/assets/refined-frames.json", "utf8"),
  );
  for (const f of Object.values(registry.frames) as any[]) {
    const input = await sharp(f.sourceFile).ensureAlpha().raw().toBuffer();
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
    assert.equal(input.length, output.length);
    for (let p = 0; p < input.length; p += 4)
      if (input[p + 3] >= 16) {
        for (let c = 0; c < 4; c++)
          assert.equal(output[p + c], input[p + c], f.key);
        assert.equal(mask[p / 4], 0, f.key);
      } else assert.equal(output[p + 3], 0);
  }
});
