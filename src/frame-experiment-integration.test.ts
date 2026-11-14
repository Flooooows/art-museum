import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");

// Les images de l’édition experiments-v1 et leurs masters essai-01 ont été supprimés
// le 2026-11-14 (catalog/card-lab/asset-cleanup-2026-11-14.json) ; seuls les registres restent vérifiés.
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
      "catalog/game-presentation/frame-editions/before-progression-v2.json",
      "utf8",
    ),
  );
  assert.equal(game.edition, "approved-only");
  assert.equal(Object.keys(game.frames).length, 25);
  for (const source of Object.values(registry.sources) as any[]) {
    if (source.paletteManifest) {
      assert.match(source.masterSha256, /^[a-f0-9]{64}$/);
      assert.equal(source.layoutTransformation, null);
    }
  }
});
