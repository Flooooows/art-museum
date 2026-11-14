import { test } from "node:test";
import assert from "node:assert/strict";
import { artworks, rarities } from "./data";
import { findFrame, getFrame } from "./frames";

// Les images de l’ancien registre (public/assets/collections) ont été supprimées le 2026-11-14 ;
// seule la correspondance famille/rareté textuelle reste vérifiée.

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

test("archives — l’ancienne correspondance famille/rareté reste conservée pour la refonte", () => {
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
    const expected = art.frameFamily;
    assert.ok(
      getFrame(art)?.src.endsWith(
        `${expected}-${rarities[art.rarity].finish}.png`,
      ),
    );
  }
  assert.equal(findFrame("famille-a-venir", 2), null);
  assert.equal(findFrame("egypte", 99), null);
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
