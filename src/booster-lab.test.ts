import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { artworks, typeCatalogs, themeCatalogs } from "./data";
import {
  boosterGroups,
  specializedBoosterGroups,
  worksForBooster,
  specializedBoosterFor,
  artworkInBooster,
  previewWorksFor,
} from "./booster-lab/groups";
import {
  cleanBoosterSource,
  isBoosterChroma,
} from "../scripts/booster-lab/processing";

test("pochettes du lab — une universelle et six ensembles exclusifs couvrent les 1011 œuvres", () => {
  const before = JSON.stringify(artworks);
  assert.equal(boosterGroups.length, 7);
  assert.equal(specializedBoosterGroups.length, 6);
  const expected = {
    universel: 1011,
    peintures: 235,
    "traits-pages": 250,
    sculptures: 139,
    photographies: 90,
    "matieres-objets": 202,
    "textiles-interieur": 95,
  };
  for (const group of boosterGroups)
    assert.equal(
      worksForBooster(group.id).length,
      expected[group.id],
      group.id,
    );
  const members = specializedBoosterGroups.flatMap((g) =>
    worksForBooster(g.id),
  );
  assert.equal(members.length, artworks.length);
  assert.equal(new Set(members.map((a) => a.id)).size, 1011);
  assert.deepEqual(
    new Set(specializedBoosterGroups.flatMap((g) => [...g.types])),
    new Set(typeCatalogs.map((c) => c.id)),
  );
  for (const art of artworks) {
    assert.equal(worksForBooster("universel").includes(art), true);
    assert.ok(artworkInBooster(art, specializedBoosterFor(art).id));
  }
  assert.equal(themeCatalogs.length, 4);
  assert.equal(JSON.stringify(artworks), before);
  assert.throws(() => worksForBooster("inconnu"));
  assert.throws(() => specializedBoosterFor({ catalog: "inconnu" }));
});
test("pochettes du lab — aperçus réels et non tirés, types et raretés intacts", () => {
  for (const group of boosterGroups) {
    const preview = previewWorksFor(group.id);
    assert.equal(preview.length, 6);
    assert.equal(new Set(preview.map((a) => a.id)).size, 6);
    assert.deepEqual(preview, previewWorksFor(group.id));
    for (const art of preview) {
      assert.ok(worksForBooster(group.id).includes(art));
      assert.equal(art.humanRarity!.level, art.rarity);
    }
    const expectedTypes = [
      ...new Set(worksForBooster(group.id).map((a) => a.catalog)),
    ].slice(0, 6);
    for (const type of expectedTypes)
      assert.ok(preview.some((a) => a.catalog === type));
  }
});
test("pochettes du lab — sept sources distinctes, provenance et silhouettes transparentes", async () => {
  const manifest = JSON.parse(
    await readFile("src/booster-lab/assets/packs.json", "utf8"),
  );
  assert.deepEqual(
    manifest,
    JSON.parse(await readFile("catalog/booster-lab/provenance.json", "utf8")),
  );
  const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");
  assert.equal(
    sha(await readFile("scripts/booster-lab/prepare.ts")),
    manifest.preparationScriptSha256,
  );
  assert.equal(
    sha(await readFile("scripts/booster-lab/processing.ts")),
    manifest.processingScriptSha256,
  );
  assert.equal(
    sha(await readFile("public/assets/booster.png")),
    manifest.referenceSha256,
  );
  assert.equal(Object.keys(manifest.packs).length, 7);
  assert.equal(
    new Set(Object.values(manifest.packs).map((p: any) => p.sourceSha256)).size,
    7,
  );
  for (const group of boosterGroups) {
    const p = manifest.packs[group.id];
    assert.equal(p.imageJob, group.job);
    assert.equal(p.model, "openai/gpt-image-2");
    assert.equal(sha(await readFile(p.sourceFile)), p.sourceSha256);
    const bytes = await readFile(`src/booster-lab/assets/prepared/${p.file}`);
    assert.equal(sha(bytes), p.outputSha256);
    const { data, info } = await sharp(bytes)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    assert.equal(info.width, 768);
    assert.equal(info.height, 1152);
    assert.ok(
      data[(576 * 768 + 384) * 4 + 3] > 200,
      `Pochette creuse : ${group.id}`,
    );
    for (let y = 0; y < 1152; y++)
      for (let x = 0; x < 768; x++) {
        const offset = (y * 768 + x) * 4;
        if (x < 24 || y < 12 || x >= 744 || y >= 1140)
          assert.equal(
            data[offset + 3],
            0,
            `Fond extérieur opaque : ${group.id}`,
          );
        assert.ok(
          !data[offset + 3] ||
            !isBoosterChroma(data[offset], data[offset + 1], data[offset + 2]),
          `Magenta restant : ${group.id}`,
        );
      }
  }
});
test("pochettes du lab — pas d’intégration au jeu, aux tirages ou aux sauvegardes", async () => {
  for (const path of [
    "src/main.tsx",
    "src/Home.tsx",
    "src/Opening.tsx",
    "src/components.tsx",
    "vite.config.ts",
    "firebase.muse.json",
  ]) {
    assert.doesNotMatch(await readFile(path, "utf8"), /booster-lab/);
  }
  for (const path of [
    "src/booster-lab/main.tsx",
    "src/booster-lab/groups.ts",
    "src/booster-lab/BoosterVisual.tsx",
  ]) {
    assert.doesNotMatch(
      await readFile(path, "utf8"),
      /localStorage|sessionStorage|openPack|Math\.random|muse-collection-v1/,
    );
  }
  const config = await readFile("vite.booster-lab.config.ts", "utf8");
  assert.match(config, /dist-booster-lab/);
  const pkg = JSON.parse(await readFile("package.json", "utf8"));
  assert.doesNotMatch(pkg.scripts.build, /booster-lab/);
});
test("pochettes du lab — détourage limité à l’extérieur, refus d’une source vide", () => {
  assert.throws(
    () => cleanBoosterSource(Buffer.alloc(16 * 16 * 4), 16, 16),
    /n’est pas opaque/,
  );
  assert.throws(
    () => cleanBoosterSource(Buffer.alloc(16 * 16 * 4, 255), 16, 16),
    /Aucun fond/,
  );
  assert.throws(
    () => cleanBoosterSource(Buffer.alloc(1), 16, 16),
    /incohérentes/,
  );
});
