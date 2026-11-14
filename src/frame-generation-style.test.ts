import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { rarities } from "./data";
import {
  acceptedFrameExperiments,
  experimentalFrameFinishes,
  frameGenerationRequest,
  frameGenerationStyle,
  frameFinishReference,
} from "./card-lab/generationStyle";

const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");

test("direction artistique — les deux expériences acceptées précèdent les six références existantes", async () => {
  const request = frameGenerationRequest("Textiles");
  assert.equal(request.images.length, 8);
  assert.equal(new Set(request.images).size, 8);
  assert.deepEqual(
    request.images.slice(0, 2),
    acceptedFrameExperiments.map((e) => e.file),
  );
  for (const file of request.images) await access(file);
  assert.match(request.prompt, /Textiles/);
  assert.match(request.prompt, /sculptural workmanship/);
  assert.match(request.prompt, /transparent alpha/);
  assert.match(request.prompt, /own rhythm/);
  assert.doesNotMatch(
    request.prompt,
    /4 discrete|four motifs|flat frieze rails|x180/,
  );
  assert.throws(() => frameGenerationRequest("  "), /thème/);
  assert.equal(frameGenerationStyle.archivedBriefs.length, 7);
});

test("direction artistique — cinq matières cohérentes et expériences de référence intactes", async () => {
  assert.deepEqual(
    experimentalFrameFinishes.map((e) => e.finish),
    rarities.map((r) => r.finish),
  );
  // Les finitions essai-01 ont été supprimées le 2026-11-14 ; les deux masters de référence restent.
  const masters = {
    japon: "3e37e756df31fe12c6266d6bd97cebf25c0c8ae59253a2035d6209f38d58c439",
    photographie:
      "98863e38287f58104cb41c74c1aea774a19c46f0fce91617f1ea32b5a6e59536",
  } as Record<string, string>;
  for (const entry of acceptedFrameExperiments) {
    const master = await readFile(entry.file);
    assert.equal(sha(master), masters[entry.family], entry.file);
    const meta = await sharp(master).metadata();
    assert.equal(meta.width, 1024);
    assert.equal(meta.height, 1536);
    assert.ok(meta.hasAlpha);
  }
  for (const { finish } of experimentalFrameFinishes) {
    const reference = frameFinishReference(finish);
    if (reference) await readFile(reference);
  }
});

test("direction artistique — expériences du lab et ancienne copie du jeu conservées", async () => {
  for (const path of [
    "src/card-lab/assets/refined-frames.json",
    "catalog/game-presentation/frame-editions/before-progression-v2.json",
  ]) {
    const registry = JSON.parse(await readFile(path, "utf8"));
    const lab = path.startsWith("src/card-lab/");
    assert.equal(registry.edition, lab ? "progression-v2" : "approved-only");
    for (const entry of acceptedFrameExperiments)
      assert.equal(
        Object.values(registry.frames).some(
          (frame: any) => frame.family === entry.family,
        ),
        lab,
      );
  }
});
