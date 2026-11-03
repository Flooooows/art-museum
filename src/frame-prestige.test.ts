import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
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

test("archives textuelles prestige — treize familles distinctes déclarées", async () => {
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
    assert.match(
      archived.frames[`${family}-lapis-lazuli`].outputSha256,
      /^[a-f0-9]{64}$/,
    );
  }
});
