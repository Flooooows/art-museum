import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import {
  preservedFrameFamilies,
  prestigeSpecs,
} from "./card-lab/prestigeSpecs";
import { labFrames } from "./card-lab/frames";
import { rarities } from "./data";

const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");
test("prestige — six thèmes approuvés, trente cadres et leurs masques strictement identiques", async () => {
  const before = JSON.parse(
    await readFile("catalog/card-lab/prestige-frames/baseline.json", "utf8"),
  );
  for (const family of preservedFrameFamilies)
    for (const r of rarities) {
      const key = `${family}-${r.finish}`,
        frame = labFrames[key],
        old = before.frames[key];
      assert.equal(frame.sourceSha256, old.sourceSha256);
      assert.equal(frame.outputSha256, old.outputSha256);
      assert.equal(frame.windowSha256, old.windowSha256);
      assert.deepEqual(frame.aperture, old.aperture);
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

test("prestige — treize familles réellement refaites, lapis polychrome avec or et pierre bleue", async () => {
  const before = JSON.parse(
    await readFile("catalog/card-lab/prestige-frames/baseline.json", "utf8"),
  );
  const archived = JSON.parse(
    await readFile(
      "catalog/card-lab/themed-frames/previous-edition.json",
      "utf8",
    ),
  );
  assert.equal(Object.keys(prestigeSpecs).length, 13);
  for (const family of Object.keys(prestigeSpecs)) {
    for (const rarity of rarities)
      assert.notEqual(
        archived.frames[`${family}-${rarity.finish}`].outputSha256,
        before.frames[`${family}-${rarity.finish}`].outputSha256,
      );
    const frame = archived.frames[`${family}-lapis-lazuli`];
    const pixels = await sharp(
      `src/card-lab/assets/${frame.assetDirectory}/${frame.file}`,
    )
      .ensureAlpha()
      .raw()
      .toBuffer();
    let gold = 0,
      blue = 0;
    for (let i = 0; i < pixels.length; i += 4)
      if (pixels[i + 3] > 200) {
        const [r, g, b] = pixels.subarray(i, i + 3);
        if (r > 150 && g > 85 && r > b * 1.5 && g > b * 1.2) gold++;
        if (b > 70 && b > r * 1.5 && b > g * 1.2) blue++;
      }
    assert.ok(gold > 5000, `${family} : or absent`);
    assert.ok(blue > 5000, `${family} : lapis absent`);
  }
});
