import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { artworks, byId, rarities } from "./data";
import {
  frameChoiceFor,
  frameFamilies,
  activeFrameFamilies,
  legacyFrameFamilies,
  decorative1900Ids,
  westernFantasticIds,
} from "./card-lab/frameRules";
import {
  isChroma,
  applyMaterial,
  cleanGeneratedMaster,
} from "../scripts/card-lab/generated-processing";
import { cardFrameFor, labFrames, commonCardAperture } from "./card-lab/frames";
import { sampleCases } from "./card-lab/samples";
import { allGeneratedSpecs } from "./card-lab/generatedSpecs";
import { detailedSpecs } from "./card-lab/detailedSpecs";
import { refineFrame } from "../scripts/card-lab/refined-processing";

test("cadres du lab — les 1011 cartes suivent la catégorie actuelle et la rareté humaine", () => {
  const before = JSON.stringify(artworks);
  for (const art of artworks) {
    const c = frameChoiceFor(art),
      f = cardFrameFor(art);
    assert.equal(c.finish, rarities[art.rarity].finish);
    assert.equal(f.level, art.humanRarity!.level);
    assert.equal(f.family, c.family);
    assert.equal(f.key, c.key);
  }
  assert.equal(JSON.stringify(artworks), before);
  assert.deepEqual(
    new Set(sampleCases.map((s) => cardFrameFor(s.art).family)),
    new Set(
      activeFrameFamilies.filter((f) => f !== "verre" && f !== "mobilier"),
    ),
  );
});
test("cadres du lab — type, contexte documenté et priorités explicites, sans ancien fourre-tout", () => {
  const expected: Record<string, string> = {
    "cma-136510": "beaux-arts-dore",
    "mona-lisa": "beaux-arts-lapis-lazuli",
    "45434": "japon-lapis-lazuli",
    "cma-137128": "sculpture-cuivre",
    "467642": "textiles-dore",
    "cma-164940": "photographie-argent",
    "544453": "egypte-fer",
    "544864": "egypte-fer",
    "cma-136667": "egypte-lapis-lazuli",
    "cma-130939": "archeologie-fer",
    "cma-129216": "arts-metal-cuivre",
    "cma-113945": "peinture-neutre-cuivre",
    "cma-105933": "manuscrits-cuivre",
    "9480": "decoratifs-fer",
    "1085": "decoratifs-fer",
    "cma-149105": "art-mysterieux-argent",
    "cma-143278": "art-moderne-dore",
  };
  for (const [id, key] of Object.entries(expected))
    assert.equal(cardFrameFor(byId[id]).key, key, id);
  const staleHistoricalFrame = {
    ...byId["cma-164940"],
    frameFamily: "beaux-arts",
  };
  assert.equal(cardFrameFor(staleHistoricalFrame).family, "photographie");
  assert.throws(() => frameChoiceFor({ ...byId["mona-lisa"], rarity: 5 }));
  assert.throws(() =>
    frameChoiceFor({
      ...byId["mona-lisa"],
      id: "inconnu",
      catalog: "inconnu",
      catalogIds: [],
      origin: "Non précisée",
    }),
  );
});
test("cadres du lab — 95 variantes traçables, toutes les ouvertures laissent passer les informations", async () => {
  assert.equal(Object.keys(labFrames).length, 95);
  const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");
  const manifest = JSON.parse(
    await readFile("src/card-lab/assets/frames.json", "utf8"),
  );
  assert.equal(
    sha(await readFile("scripts/card-lab/prepare-frames.ts")),
    manifest.preparationScriptSha256,
  );
  const generated = JSON.parse(
    await readFile("src/card-lab/assets/generated-frames.json", "utf8"),
  );
  const refined = JSON.parse(
    await readFile("src/card-lab/assets/refined-frames.json", "utf8"),
  );
  assert.deepEqual(
    refined,
    JSON.parse(
      await readFile("catalog/card-lab/refined-frames/provenance.json", "utf8"),
    ),
  );
  assert.equal(
    sha(
      await readFile(
        refined.preparationScript ??
          "scripts/card-lab/prepare-refined-frames.ts",
      ),
    ),
    refined.preparationScriptSha256,
  );
  assert.equal(
    sha(await readFile("scripts/card-lab/refined-processing.ts")),
    refined.processingScriptSha256,
  );
  assert.equal(
    sha(
      await readFile(
        refined.materialScript ?? "scripts/card-lab/generated-processing.ts",
      ),
    ),
    refined.materialScriptSha256,
  );
  assert.equal(Object.keys(detailedSpecs).length, 12);
  assert.equal(
    Object.keys(manifest.frames).length,
    legacyFrameFamilies.length * 5,
  );
  assert.equal(
    Object.keys(generated.frames).length,
    Object.keys(allGeneratedSpecs).length * 5,
  );
  assert.equal(Object.keys(generated.masters).length, 13);
  assert.equal(
    sha(await readFile("scripts/card-lab/prepare-generated-frames.ts")),
    generated.preparationScriptSha256,
  );
  assert.equal(
    sha(await readFile("scripts/card-lab/generated-processing.ts")),
    generated.processingScriptSha256,
  );
  assert.deepEqual(
    generated,
    JSON.parse(
      await readFile(
        "catalog/card-lab/generated-frames/provenance.json",
        "utf8",
      ),
    ),
  );
  for (const frame of Object.values(generated.frames) as {
    sourceFile: string;
    sourceSha256: string;
    file: string;
    outputSha256: string;
  }[]) {
    assert.equal(sha(await readFile(frame.sourceFile)), frame.sourceSha256);
    assert.equal(
      sha(await readFile(`src/card-lab/assets/frames/${frame.file}`)),
      frame.outputSha256,
    );
  }
  for (const family of Object.keys(allGeneratedSpecs)) {
    const variants = rarities.map((r) => labFrames[`${family}-${r.finish}`]);
    assert.equal(new Set(variants.map((f) => f.outputSha256)).size, 5);
    assert.equal(new Set(variants.map((f) => f.sourceSha256)).size, 1);
    assert.equal(new Set(variants.map((f) => f.windowSha256)).size, 1);
  }
  for (const family of frameFamilies)
    for (const [level, r] of rarities.entries()) {
      const f = labFrames[`${family}-${r.finish}`];
      assert.ok(f);
      assert.equal(f.level, level);
      assert.equal(sha(await readFile(f.sourceFile)), f.sourceSha256);
      if (f.sourceMaskFile)
        assert.equal(sha(await readFile(f.sourceMaskFile)), f.sourceMaskSha256);
      const b = await readFile(
        `src/card-lab/assets/${f.assetDirectory}/${f.file}`,
      );
      assert.equal(sha(b), f.outputSha256);
      const m = await sharp(b).metadata();
      assert.equal(m.width, 1024);
      assert.equal(m.height, 1536);
      assert.ok(m.hasAlpha);
      if (generated.frames[f.key]) {
        const raw = await sharp(b).ensureAlpha().raw().toBuffer();
        for (let p = 0; p < raw.length; p += 4)
          assert.ok(
            !raw[p + 3] || !isChroma(raw[p], raw[p + 1], raw[p + 2]),
            `Fond magenta restant : ${f.key}`,
          );
        assert.ok(
          raw.some((v, i) => i % 4 === 3 && v > 200),
          `Cadre absent : ${f.key}`,
        );
        const record = generated.frames[f.key];
        assert.equal(record.origin, "generated-master-derived-finish");
        assert.equal(record.generationModel, "openai/gpt-image-2");
        assert.match(record.imageJob, /^image_/);
      }
      const a = f.aperture;
      assert.ok(a.width > 60 && a.height > 60);
      const alpha = await sharp(b)
        .extract({
          left: Math.ceil((a.left * f.width) / 100),
          top: Math.ceil((a.top * f.height) / 100),
          width: Math.floor((a.width * f.width) / 100),
          height: Math.floor((a.height * f.height) / 100),
        })
        .ensureAlpha()
        .extractChannel("alpha")
        .raw()
        .toBuffer();
      assert.ok(
        alpha.every((v) => v === 0),
        `Ornement sur la zone utile : ${f.key}`,
      );
      const maskBytes = await readFile(
        `src/card-lab/assets/${f.assetDirectory}/${f.windowFile}`,
      );
      assert.equal(sha(maskBytes), f.windowSha256);
      const mask = await sharp(maskBytes)
        .extract({
          left: Math.ceil((a.left * f.width) / 100),
          top: Math.ceil((a.top * f.height) / 100),
          width: Math.floor((a.width * f.width) / 100),
          height: Math.floor((a.height * f.height) / 100),
        })
        .ensureAlpha()
        .extractChannel("alpha")
        .raw()
        .toBuffer();
      assert.ok(
        mask.every((v) => v === 255),
        `Fond absent derrière les informations : ${f.key}`,
      );
    }
});
test("cadres Japon — nouvelle série isolée, archives préservées et raretés inchangées", async () => {
  const legacy = JSON.parse(
    await readFile("src/card-lab/assets/frames.json", "utf8"),
  );
  const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");
  for (const rarity of rarities) {
    const key = `japon-${rarity.finish}`,
      frame = labFrames[key],
      old = legacy.frames[key];
    assert.equal(frame.file, `japon-frieze-v7-${rarity.finish}.webp`);
    assert.equal(frame.windowFile, "japon-frieze-v7-window.webp");
    assert.equal(
      frame.sourceFile,
      "src/card-lab/assets/generated-sources/japon-frieze-v7.png",
    );
    assert.equal(sha(await readFile(old.sourceFile)), old.sourceSha256);
    assert.equal(
      sha(await readFile(`src/card-lab/assets/frames/${old.file}`)),
      old.outputSha256,
    );
    const { data, info } = await sharp(
      `src/card-lab/assets/${frame.assetDirectory}/${frame.file}`,
    )
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    for (let y = 0; y < info.height; y++)
      for (let x = 0; x < info.width; x++)
        if (x < 12 || y < 12 || x >= info.width - 12 || y >= info.height - 12) {
          assert.equal(
            data[(y * info.width + x) * 4 + 3],
            0,
            `Fond extérieur opaque : ${key}`,
          );
        }
  }
  const japanese = artworks.filter((a) => frameChoiceFor(a).family === "japon");
  assert.equal(japanese.length, 26);
  for (const art of japanese)
    assert.equal(
      cardFrameFor(art).finish,
      rarities[art.humanRarity!.level].finish,
    );
});

test("cadres détaillés — aucun métal effacé, aucun fond rouge possible sur le métal d’origine", async () => {
  const refined = JSON.parse(
    await readFile("src/card-lab/assets/refined-frames.json", "utf8"),
  );
  for (const f of Object.values(labFrames)) {
    const source = await sharp(f.sourceFile).ensureAlpha().raw().toBuffer();
    const frame = await sharp(
      `src/card-lab/assets/${f.assetDirectory}/${f.file}`,
    )
      .ensureAlpha()
      .raw()
      .toBuffer();
    const mask = await sharp(
      `src/card-lab/assets/${f.assetDirectory}/${f.windowFile}`,
    )
      .ensureAlpha()
      .raw()
      .toBuffer();
    let overlay = 0,
      removed = 0,
      changedLegacy = 0;
    const historical =
      refined.frames[f.key].origin === "historical-source-preserved";
    for (let p = 0; p < source.length; p += 4)
      if (
        source[p + 3] >= 16 &&
        (historical || !isChroma(source[p], source[p + 1], source[p + 2]))
      ) {
        if (mask[p + 3]) overlay++;
        if (frame[p + 3] !== source[p + 3]) removed++;
        if (
          historical &&
          (frame[p] !== source[p] ||
            frame[p + 1] !== source[p + 1] ||
            frame[p + 2] !== source[p + 2])
        )
          changedLegacy++;
      }
    assert.equal(overlay, 0, `Fond sur un ornement : ${f.key}`);
    assert.equal(removed, 0, `Métal effacé : ${f.key}`);
    assert.equal(changedLegacy, 0, `Décor historique altéré : ${f.key}`);
  }
});

test("cadres détaillés — gabarit identique dans les 95 fenêtres sûres", () => {
  const c = commonCardAperture;
  assert.ok(c.width > 60 && c.height > 60);
  for (const frame of Object.values(labFrames)) {
    const a = frame.aperture;
    assert.ok(c.left >= a.left - 1e-8 && c.top >= a.top - 1e-8, frame.key);
    assert.ok(
      c.left + c.width <= a.left + a.width + 1e-8 &&
        c.top + c.height <= a.top + a.height + 1e-8,
      frame.key,
    );
  }
  const rgba = Buffer.alloc(100 * 150 * 4, 255);
  for (let y = 15; y < 135; y++)
    for (let x = 10; x < 90; x++)
      rgba.fill(0, (y * 100 + x) * 4, (y * 100 + x) * 4 + 4);
  const result = refineFrame(rgba, 100, 150, false);
  assert.equal(result.removedMetalPixels, 0);
  assert.equal(result.backdropOnMetalPixels, 0);
});
test("cadres du lab — sélections bornées et aucune confusion archéologie / Paléolithique", () => {
  for (const art of artworks) {
    const f = frameChoiceFor(art).family;
    assert.notEqual(f, "prehistoire", art.id);
    if (f === "decoratifs") assert.ok(decorative1900Ids.has(art.id));
    if (f === "art-mysterieux") assert.ok(westernFantasticIds.has(art.id));
    if (f === "art-moderne") assert.equal(art.id, "cma-143278");
    if (art.catalog === "objets-archeologiques")
      assert.ok(f === "archeologie" || f === "egypte");
  }
  assert.equal(
    artworks.filter((a) => frameChoiceFor(a).family === "decoratifs").length,
    15,
  );
  assert.equal(
    artworks.filter((a) => frameChoiceFor(a).family === "art-mysterieux")
      .length,
    4,
  );
  for (const [catalog, family] of [
    ["verre", "verre"],
    ["mobilier", "mobilier"],
    ["ceramique", "ceramique"],
    ["manuscrits", "manuscrits"],
    ["peinture", "peinture-neutre"],
  ])
    assert.equal(
      frameChoiceFor({
        ...byId["mona-lisa"],
        id: "type-test",
        catalog,
        catalogIds: [],
        origin: "Non précisée",
      }).family,
      family,
    );
});
test("cadres générés — détourage fermé et finitions différentes sans changer l’alpha", () => {
  assert.throws(
    () => cleanGeneratedMaster(Buffer.alloc(8 * 8 * 4), 8, 8),
    /non fermée/,
  );
  assert.throws(
    () => cleanGeneratedMaster(Buffer.alloc(8 * 8 * 4, 255), 8, 8),
    /n’est pas vide/,
  );
  const input = Buffer.from([
    128, 128, 128, 255, 220, 220, 220, 80, 0, 0, 0, 0,
  ]);
  const outputs = rarities.map((r) => applyMaterial(input, r.finish));
  assert.equal(new Set(outputs.map((b) => b.toString("hex"))).size, 5);
  for (const out of outputs)
    for (let p = 3; p < out.length; p += 4) assert.equal(out[p], input[p]);
});
