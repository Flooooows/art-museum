import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { sampleCases } from "./card-lab/samples";
import { byId, rarities } from "./data";

test("carton musée — vingt et un cas réels, cinq raretés, formats et textes difficiles", () => {
  assert.equal(sampleCases.length, 21);
  assert.equal(new Set(sampleCases.map((s) => s.id)).size, 21);
  assert.deepEqual(
    [...new Set(sampleCases.map((s) => s.art.rarity))].sort(),
    [0, 1, 2, 3, 4],
  );
  for (const sample of sampleCases) {
    assert.equal(sample.art, byId[sample.id]);
    assert.equal(sample.art.rarity, sample.art.humanRarity!.level);
    assert.ok(rarities[sample.art.rarity]);
  }
  assert.ok(sampleCases.some((s) => s.art.title.length > 130));
  assert.ok(sampleCases.some((s) => s.art.artist.length > 120));
  for (const id of ["cma-136510", "mona-lisa", "45434", "cma-137128"])
    assert.ok(sampleCases.some((s) => s.id === id));
});
test("carton musée — référence utilisateur intacte après suppression du prototype non validé", async () => {
  const root = "src/card-lab/assets";
  const provenance = JSON.parse(
    await readFile(`${root}/provenance.json`, "utf8"),
  );
  const sha = (bytes: Buffer) =>
    createHash("sha256").update(bytes).digest("hex");
  assert.equal(sha(await readFile(provenance.source)), provenance.sourceSha256);
  assert.equal(
    sha(await readFile("scripts/card-lab/prepare.ts")),
    provenance.preparationScriptSha256,
  );
  await assert.rejects(readFile(`${root}/${provenance.frame.file}`), {
    code: "ENOENT",
  });
});
test("carton musée — le laboratoire reste séparé du jeu et de ses données persistées", async () => {
  const vite = await readFile("vite.config.ts", "utf8");
  assert.ok(!vite.includes("card-lab"));
  const entry = await readFile("src/main.tsx", "utf8");
  assert.ok(!entry.includes("card-lab"));
  const lab = await readFile("src/card-lab/main.tsx", "utf8");
  assert.doesNotMatch(lab, /localStorage|muse-collection-v1|openPack/);
  const card = await readFile("src/card-lab/MuseumCard.tsx", "utf8");
  assert.doesNotMatch(card, /\.\.\/frames|frame-assets|assets\/collections/);
  assert.match(card, /art\.title/);
  assert.match(card, /art\.artist/);
  assert.match(card, /art\.image/);
});
