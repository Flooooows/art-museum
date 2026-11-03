import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { museumSpecs, framingReferences } from "./card-lab/museumSpecs";
import { rarities } from "./data";
import { renderMuseumFrame } from "../scripts/card-lab/museum-rendering";
import sharp from "sharp";

test("profils muséaux — treize profils sobres, soixante-cinq variantes et références d’encadrement réelles", async () => {
  const active = JSON.parse(
    await readFile(
      "catalog/card-lab/decorative-frames/previous-edition.json",
      "utf8",
    ),
  );
  const previous = JSON.parse(
    await readFile(
      "catalog/card-lab/museum-frames/previous-edition.json",
      "utf8",
    ),
  );
  assert.equal(active.edition, "museum-v5");
  assert.equal(Object.keys(museumSpecs).length, 13);
  assert.equal(framingReferences.length, 4);
  assert.equal(
    active.specsScriptSha256,
    createHash("sha256")
      .update(await readFile("src/card-lab/museumSpecs.ts"))
      .digest("hex"),
  );
  for (const [family, spec] of Object.entries(museumSpecs)) {
    assert.ok(spec.face <= 54);
    for (const r of rarities) {
      const key = `${family}-${r.finish}`,
        frame = active.frames[key];
      assert.notEqual(frame.outputSha256, previous.frames[key].outputSha256);
      assert.equal(active.frames[key].origin, "procedural-museum-profile");
      assert.equal(active.frames[key].imageJob, null);
      assert.equal(active.frames[key].generationModel, null);
      assert.ok(frame.aperture.width > 70 && frame.aperture.height > 75);
    }
  }
});

test("profils muséaux — contours identiques dans les cinq finitions, aucun texte ni image d’objet ajouté", async () => {
  for (const family of [
    "peinture-neutre",
    "photographie",
    "textiles",
    "japon",
  ] as const) {
    let alpha: Buffer | undefined;
    const hashes = new Set();
    for (const r of rarities) {
      const svg = renderMuseumFrame(family, r.finish);
      assert.doesNotMatch(svg, /<(?:image|text|use)\b/);
      const bytes = await sharp(Buffer.from(svg))
        .ensureAlpha()
        .raw()
        .toBuffer();
      const next = Buffer.alloc(bytes.length / 4);
      for (let i = 3, j = 0; i < bytes.length; i += 4, j++) next[j] = bytes[i];
      if (alpha) assert.deepEqual(next, alpha);
      else alpha = next;
      hashes.add(createHash("sha256").update(bytes).digest("hex"));
    }
    assert.equal(hashes.size, 5);
  }
});
