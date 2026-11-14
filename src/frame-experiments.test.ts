import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { frameFamilies } from "./card-lab/frameRules";
import { preservedFrameFamilies } from "./card-lab/prestigeSpecs";
import {
  allFrameExperiments,
  newFrameExperiments,
} from "./card-lab/experiments/series";

// La galerie essai-01, ses finitions et leurs manifestes ont été supprimés le 2026-11-14
// (catalog/card-lab/asset-cleanup-2026-11-14.json) ; la série active est vérifiée par card-lab-frames.test.ts.
test("palettes — 19 familles et 95 variantes, intégration limitée au lab", async () => {
  assert.equal(frameFamilies.length, 19);
  assert.equal(newFrameExperiments.length, 11);
  assert.equal(allFrameExperiments.length, 13);
  assert.equal(
    new Set([
      ...allFrameExperiments.map((e) => e.family),
      ...preservedFrameFamilies,
    ]).size,
    19,
  );
  for (const file of [
    "src/card-lab/assets/refined-frames.json",
    "catalog/game-presentation/frame-editions/before-progression-v2.json",
  ]) {
    const registry = JSON.parse(await readFile(file, "utf8"));
    const lab = file.startsWith("src/card-lab/");
    assert.equal(registry.edition, lab ? "progression-v2" : "approved-only");
    assert.ok(
      lab
        ? Object.keys(registry.frames).length === 95
        : Object.values(registry.frames).every((f: any) =>
            (preservedFrameFamilies as readonly string[]).includes(f.family),
          ),
    );
  }
});
