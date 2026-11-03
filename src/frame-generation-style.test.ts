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
  for (const entry of acceptedFrameExperiments) {
    const dir = `src/card-lab/experiments/${entry.family}`;
    const manifest = JSON.parse(
      await readFile(`${dir}/essai-01-finitions.json`, "utf8"),
    );
    const master = await readFile(entry.file);
    assert.equal(sha(master), manifest.sourceSha256);
    const alpha = await sharp(master)
      .ensureAlpha()
      .extractChannel("alpha")
      .raw()
      .toBuffer();
    assert.equal(manifest.outputs.length, 5);
    for (const output of manifest.outputs) {
      const bytes = await readFile(output.file);
      assert.equal(sha(bytes), output.sha256);
      assert.deepEqual(
        await sharp(bytes)
          .ensureAlpha()
          .extractChannel("alpha")
          .raw()
          .toBuffer(),
        alpha,
      );
      assert.equal(output.referenceFile, frameFinishReference(output.finish));
      if (output.referenceFile)
        assert.equal(
          sha(await readFile(output.referenceFile)),
          output.referenceSha256,
        );
      else assert.deepEqual(bytes, master);
    }
  }
});

test("direction artistique — expériences activées dans le lab uniquement, copie du jeu inchangée", async () => {
  for (const path of [
    "src/card-lab/assets/refined-frames.json",
    "src/game-presentation/cards/assets/refined-frames.json",
  ]) {
    const registry = JSON.parse(await readFile(path, "utf8"));
    const lab = path.startsWith("src/card-lab/");
    assert.equal(registry.edition, lab ? "experiments-v1" : "approved-only");
    for (const entry of acceptedFrameExperiments)
      assert.equal(
        Object.values(registry.frames).some(
          (frame: any) => frame.family === entry.family,
        ),
        lab,
      );
  }
});
