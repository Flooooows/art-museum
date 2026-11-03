import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir, access } from "node:fs/promises";
import sharp from "sharp";
import { artworks, byId, rarities } from "./data";
import {
  frameChoiceFor,
  decorative1900Ids,
  westernFantasticIds,
} from "./card-lab/frameRules";
import { preservedFrameFamilies } from "./card-lab/prestigeSpecs";
import { cardFrameFor, labFrames, commonCardAperture } from "./card-lab/frames";
import {
  applyMaterial,
  cleanGeneratedMaster,
} from "../scripts/card-lab/generated-processing";
import { refineFrame } from "../scripts/card-lab/refined-processing";
const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");

test("cadres du lab — 1011 cartes couvertes par les palettes intégrées, raretés inchangées", () => {
  const before = JSON.stringify(artworks);
  let framed = 0,
    unframed = 0;
  for (const art of artworks) {
    const choice = frameChoiceFor(art),
      result = cardFrameFor(art);
    assert.equal(result.family, choice.family);
    assert.equal(result.key, choice.key);
    assert.equal(result.finish, rarities[art.rarity].finish);
    assert.equal(result.level, art.humanRarity!.level);
    assert.ok(result.asset);
    if (result.asset) {
      assert.equal(result.asset.key, choice.key);
      framed++;
    } else {
      assert.equal(result.asset, null);
      unframed++;
    }
  }
  assert.equal(framed, artworks.length);
  assert.equal(unframed, 0);
  assert.equal(JSON.stringify(artworks), before);
  for (const id of [
    "45434",
    "cma-137128",
    "467642",
    "cma-164940",
    "cma-130939",
    "cma-105933",
  ])
    assert.ok(cardFrameFor(byId[id]).asset);
});

test("cadres — 95 progressions actives, sources traçables et fenêtres sûres", async () => {
  assert.equal(Object.keys(labFrames).length, 95);
  const manifest = JSON.parse(
    await readFile("src/card-lab/assets/refined-frames.json", "utf8"),
  );
  assert.equal(manifest.edition, "progression-v2");
  assert.deepEqual(
    manifest,
    JSON.parse(
      await readFile("catalog/card-lab/refined-frames/provenance.json", "utf8"),
    ),
  );
  for (const f of Object.values(labFrames)) {
    assert.equal(f.finish, rarities[f.level].finish);
    assert.equal(sha(await readFile(f.sourceFile)), f.sourceSha256);
    if (f.sourceMaskFile)
      assert.equal(sha(await readFile(f.sourceMaskFile)), f.sourceMaskSha256);
    const bytes = await readFile(
      `src/card-lab/assets/${f.assetDirectory}/${f.file}`,
    );
    assert.equal(sha(bytes), f.outputSha256);
    const maskBytes = await readFile(
      `src/card-lab/assets/${f.assetDirectory}/${f.windowFile}`,
    );
    assert.equal(sha(maskBytes), f.windowSha256);
    const meta = await sharp(bytes).metadata();
    assert.equal(meta.width, 1024);
    assert.equal(meta.height, 1536);
    assert.ok(meta.hasAlpha);
    const a = f.aperture,
      c = commonCardAperture;
    assert.ok(a.width > 60 && a.height > 60);
    assert.ok(
      c.left >= a.left - 1e-8 &&
        c.top >= a.top - 1e-8 &&
        c.left + c.width <= a.left + a.width + 1e-8 &&
        c.top + c.height <= a.top + a.height + 1e-8,
    );
    const rect = {
      left: Math.ceil((a.left * f.width) / 100),
      top: Math.ceil((a.top * f.height) / 100),
      width: Math.floor((a.width * f.width) / 100),
      height: Math.floor((a.height * f.height) / 100),
    };
    const alpha = await sharp(bytes)
      .extract(rect)
      .ensureAlpha()
      .extractChannel("alpha")
      .raw()
      .toBuffer();
    assert.ok(
      alpha.every((v) => v === 0),
      f.key,
    );
    const mask = await sharp(maskBytes)
      .extract(rect)
      .ensureAlpha()
      .extractChannel("alpha")
      .raw()
      .toBuffer();
    assert.ok(
      mask.every((v) => v === 255),
      f.key,
    );
  }
});

test("nettoyage — toutes les images supprimées sont absentes et les six familles sont inchangées", async () => {
  const report = JSON.parse(
    await readFile("catalog/card-lab/asset-cleanup.json", "utf8"),
  );
  assert.deepEqual(report.preservedFamilies, [...preservedFrameFamilies]);
  assert.ok(report.removedFiles.length > 700);
  for (const path of report.removedFiles)
    await assert.rejects(access(path), { code: "ENOENT" });
  for (const [path, hash] of Object.entries(report.preservedAssets))
    assert.equal(sha(await readFile(path)), hash, path);
  const previous = JSON.parse(
    await readFile(
      "catalog/card-lab/progression-frames/previous-edition.json",
      "utf8",
    ),
  );
  const integratedFiles = new Set(
    [
      ...Object.values(labFrames),
      ...(Object.values(previous.frames) as (typeof labFrames)[string][]),
    ].flatMap((f) => [
      `src/card-lab/assets/${f.assetDirectory}/${f.file}`,
      `src/card-lab/assets/${f.assetDirectory}/${f.windowFile}`,
    ]),
  );
  async function inspect(dir: string) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) await inspect(path);
      else if (
        /\.(png|webp|svg|jpe?g|gif)$/.test(entry.name) &&
        entry.name !== "carton-velvet.webp"
      )
        assert.ok(
          preservedFrameFamilies.some((f) => entry.name.startsWith(f + "-")) ||
            integratedFiles.has(path),
          path,
        );
    }
  }
  for (const dir of [
    "src/card-lab/assets",
    "src/game-presentation/cards/assets",
    "public/assets/collections",
  ])
    await inspect(dir);
});

test("cadres — sélections bornées, aucune substitution archéologie / Paléolithique", () => {
  for (const art of artworks) {
    const f = frameChoiceFor(art).family;
    assert.notEqual(f, "prehistoire");
    if (f === "decoratifs") assert.ok(decorative1900Ids.has(art.id));
    if (f === "art-mysterieux") assert.ok(westernFantasticIds.has(art.id));
    if (f === "art-moderne") assert.equal(art.id, "cma-143278");
    if (art.catalog === "objets-archeologiques")
      assert.ok(f === "archeologie" || f === "egypte");
  }
  assert.equal(
    cardFrameFor({
      ...byId["cma-164940"],
      frameFamily: "beaux-arts",
    } as (typeof artworks)[number]).family,
    "photographie",
  );
  assert.throws(() => frameChoiceFor({ ...byId["mona-lisa"], rarity: 5 }));
});

test("traitement — masque sûr, refus de sources ouvertes et cinq finitions sans altérer l’alpha", () => {
  const rgba = Buffer.alloc(100 * 150 * 4, 255);
  for (let y = 15; y < 135; y++)
    for (let x = 10; x < 90; x++)
      rgba.fill(0, (y * 100 + x) * 4, (y * 100 + x) * 4 + 4);
  const result = refineFrame(rgba, 100, 150, false);
  assert.equal(result.removedMetalPixels, 0);
  assert.equal(result.backdropOnMetalPixels, 0);
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
    for (let p = 3; p < input.length; p += 4) assert.equal(out[p], input[p]);
});
