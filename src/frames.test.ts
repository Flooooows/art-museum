import { test } from "node:test";
import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { artworks, rarities } from "./data";
import { findFrame, frameAssets, getFrame } from "./frames";
import preparationReport from "./frame-assets.report.json";

test("les noms et matières restent stables, les nouveaux taux suivent la demande", () => {
  assert.deepEqual(
    rarities.map((rarity) => rarity.name),
    ["Esquisse", "Étude", "Composition", "Œuvre", "Pièce maîtresse"],
  );
  assert.deepEqual(
    rarities.map((rarity) => rarity.rate),
    [56.1, 25.5, 15, 3, 0.4],
  );
  assert.deepEqual(
    rarities.map((rarity) => rarity.finish),
    ["fer", "cuivre", "argent", "dore", "lapis-lazuli"],
  );
});

test("chaque original est activé avec une fenêtre transparente mesurée ou explicitement signalé", async () => {
  const originals = (await readdir("public/assets/collections"))
    .filter((name) =>
      /^.+-(fer|cuivre|argent|dore|lapis-lazuli)\.png$/.test(name),
    )
    .sort();
  assert.deepEqual(
    [
      ...Object.keys(frameAssets),
      ...preparationReport.ignored.map((item) => item.name.slice(0, -4)),
    ].sort(),
    originals.map((name) => name.slice(0, -4)),
  );
  for (const item of preparationReport.ignored) {
    assert.ok(item.reason.length > 0);
    assert.equal(frameAssets[item.name.slice(0, -4)], undefined);
  }
  for (const frame of Object.values(frameAssets)) {
    await access(`public${frame.original}`);
    const metadata = await sharp(`public${frame.src}`).metadata();
    assert.equal(metadata.width, 640);
    assert.equal(metadata.height, 960);
    assert.equal(metadata.hasAlpha, true);
    const { data } = await sharp(`public${frame.src}`)
      .ensureAlpha()
      .extract({ left: 320, top: 480, width: 1, height: 1 })
      .raw()
      .toBuffer({ resolveWithObject: true });
    assert.ok(data[3] < 24, frame.src);
    const window = frame.aperture;
    assert.ok(
      window.left > 0 &&
        window.top > 0 &&
        window.width > 40 &&
        window.height > 40,
    );
    assert.ok(
      window.left + window.width < 100 && window.top + window.height < 100,
    );
    const { data: opening } = await sharp(`public${frame.src}`)
      .ensureAlpha()
      .extract({
        left: Math.ceil((window.left / 100) * frame.width),
        top: Math.ceil((window.top / 100) * frame.height),
        width: Math.floor((window.width / 100) * frame.width),
        height: Math.floor((window.height / 100) * frame.height),
      })
      .raw()
      .toBuffer({ resolveWithObject: true });
    for (let pixel = 3; pixel < opening.length; pixel += 4) {
      assert.ok(
        opening[pixel] < 24,
        `${frame.src} : un ornement recouvre l’œuvre`,
      );
    }
  }
});

test("famille et rareté sélectionnent le bon cadre sans emprunter une autre famille", () => {
  for (const family of [
    "beaux-arts",
    "egypte",
    "art-mysterieux",
    "art-moderne",
    "prehistoire",
    "decoratifs",
  ]) {
    for (let level = 0; level < rarities.length; level++) {
      assert.ok(
        findFrame(family, level)?.src.endsWith(
          `${family}-${rarities[level].finish}.png`,
        ),
      );
    }
  }
  for (const art of artworks) {
    const expected =
      {
        mythes: "art-mysterieux",
        "renaissance-italienne": "beaux-arts",
        "premiers-arts": "prehistoire",
      }[art.catalog] ?? art.catalog;
    assert.ok(
      getFrame(art)?.src.endsWith(
        `${expected}-${rarities[art.rarity].finish}.png`,
      ),
    );
  }
  assert.equal(findFrame("famille-a-venir", 2), null);
  assert.equal(findFrame("egypte", 99), null);
});

test("les cinq cadres Arts décoratifs ont une provenance IA explicite et des PNG transparents", async () => {
  const design = JSON.parse(
    await readFile("catalog/decorative-frame-generation.json", "utf8"),
  );
  const provenance = JSON.parse(
    await readFile("public/assets/provenance.json", "utf8"),
  );
  assert.deepEqual(
    design.variants.map((variant: { finish: string }) => variant.finish),
    rarities.map((rarity) => rarity.finish),
  );
  for (const variant of design.variants) {
    for (const directory of ["collections", "collections/display"]) {
      const key = `${directory}/decoratifs-${variant.finish}.png`;
      const bytes = await readFile(`public/assets/${key}`);
      const record = provenance[key];
      assert.equal(record.generationPrompt, variant.prompt);
      assert.equal(record.generationModel, "openai/gpt-image-2");
      assert.equal(record.license, design.license);
      assert.equal(
        createHash("sha256").update(bytes).digest("hex"),
        record.sha256,
      );
      const metadata = await sharp(bytes).metadata();
      assert.equal(metadata.hasAlpha, true);
      assert.equal(metadata.width, directory === "collections" ? 1024 : 640);
      assert.equal(metadata.height, directory === "collections" ? 1536 : 960);
      assert.ok(metadata.xmp?.toString().includes("gpt-image-2"));
    }
  }
});

test("chaque passe-partout remplit l’ouverture réelle sans peindre l’extérieur du cadre", async () => {
  const provenance = JSON.parse(
    await readFile("public/assets/provenance.json", "utf8"),
  );
  for (const frame of Object.values(frameAssets)) {
    const bytes = await readFile(`public${frame.matte}`);
    const { data, info } = await sharp(bytes)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    assert.equal(info.width, frame.width);
    assert.equal(info.height, frame.height);
    assert.equal(
      data[
        (Math.floor(info.height / 2) * info.width +
          Math.floor(info.width / 2)) *
          4 +
          3
      ],
      255,
    );
    for (let x = 0; x < info.width; x++) {
      assert.equal(data[x * 4 + 3], 0);
      assert.equal(data[((info.height - 1) * info.width + x) * 4 + 3], 0);
    }
    for (let y = 0; y < info.height; y++) {
      assert.equal(data[y * info.width * 4 + 3], 0);
      assert.equal(data[(y * info.width + info.width - 1) * 4 + 3], 0);
    }
    const opening = frame.aperture;
    const inside = await sharp(bytes)
      .extract({
        left: Math.ceil((opening.left / 100) * info.width),
        top: Math.ceil((opening.top / 100) * info.height),
        width: Math.floor((opening.width / 100) * info.width),
        height: Math.floor((opening.height / 100) * info.height),
      })
      .ensureAlpha()
      .raw()
      .toBuffer();
    for (let position = 3; position < inside.length; position += 4)
      assert.equal(inside[position], 255, frame.matte);
    const record = provenance[frame.matte.replace("/assets/", "")];
    assert.equal(record.source, frame.original);
    assert.equal(
      record.sha256,
      createHash("sha256").update(bytes).digest("hex"),
    );
  }
});

const luminance = (hex: string) =>
  hex
    .slice(1)
    .match(/../g)!
    .map((channel) => parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    )
    .reduce(
      (sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index],
      0,
    );
const contrast = (a: string, b: string) => {
  const first = luminance(a),
    second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
};

test("les cinq badges et encres de rareté sont lisibles dans les deux thèmes", () => {
  for (const rarity of rarities) {
    assert.ok(
      contrast(rarity.color, rarity.badgeInk) >= 4.5,
      `${rarity.material} rempli`,
    );
    for (const surface of ["#fbf9f4", "#f0eee9", "#eee7d8"])
      assert.ok(
        contrast(rarity.ink, surface) >= 4.5,
        `${rarity.material} clair`,
      );
    for (const surface of ["#210a12", "#33131f", "#512237", "#48212e"])
      assert.ok(
        contrast(rarity.darkInk, surface) >= 4.5,
        `${rarity.material} sombre`,
      );
  }
});
