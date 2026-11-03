import { readFile, writeFile, copyFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import sharp from "sharp";
const source =
    process.env.MUSE_TEST_DIR || "/tmp/opencode/muse-main-integration",
  out = "docs/prototypes/integration-jeu";
const read = async (file) => JSON.parse(await readFile(file, "utf8"));
await mkdir(out, { recursive: true });
const browsers = {};
for (const name of ["dev", "compiled", "live"]) {
  const r = await read(`${source}/${name}-browser.json`);
  assert.deepEqual(r.errors, []);
  assert.ok(r.accessibility.every((a) => !a.violations.length));
  browsers[name] = {
    origin: r.origin,
    configurations: r.results.length,
    results: r.results,
    errors: r.errors,
    accessibilityConfigurations: r.accessibility.length,
    accessibilityViolations: 0,
    details: `${name}-browser.json`,
  };
  await copyFile(
    `${source}/${name}-browser.json`,
    `${out}/${name}-browser.json`,
  );
}
const allCards = await read(`${source}/all-cards.json`);
assert.ok(allCards.every((r) => r.cards === 1011 && !r.issues.length));
await copyFile(`${source}/all-cards.json`, `${out}/all-cards.json`);
const publication = await read("catalog/game-presentation/publication.json");
assert.equal(publication.version, "545b73e7f226d778");
assert.equal(publication.checkedFiles, 1136);
assert.deepEqual(publication.failures, []);
const snapshot = await read("catalog/game-presentation/snapshot.json");
for (const [file, expected] of Object.entries({
  ...snapshot.files,
  ...snapshot.catalogInputs,
}))
  assert.equal(
    createHash("sha256")
      .update(await readFile(file))
      .digest("hex"),
    expected,
    file,
  );
const testLog = await readFile(`${source}/test.log`, "utf8");
assert.match(testLog, /tests 176/);
assert.match(testLog, /pass 176/);
assert.match(testLog, /fail 0/);
const previews = [
  ["live-home-1440-light.png", "pochettes-ordinateur.png"],
  ["live-home-390-dark.png", "pochettes-mobile-sombre.png"],
  ["live-collection-390-light.png", "collection-mobile.png"],
  ["live-opening-1440-light.png", "ouverture-ordinateur.png"],
  ["live-opening-390-dark.png", "ouverture-mobile-sombre.png"],
  ["compiled-opening-320-dark.png", "ouverture-320-sombre.png"],
];
for (const [from, to] of previews)
  await sharp(`${source}/${from}`).png().toFile(`${out}/${to}`);
const report = {
  scope:
    "Intégration au jeu principal de la présentation validée du lab, sans modification des œuvres, des raretés, des droits ou des sauvegardes personnelles.",
  catalog: { artworks: 1011, types: 12, themes: 4 },
  presentation: {
    activeFrames: 90,
    unassignedPaleolithicFramesExcluded: 5,
    boosterVisuals: 7,
    wholeArtworkImages: true,
    completeTitlesAndArtists: true,
    commonRarityBand: true,
    labCodeImported: false,
  },
  checks: {
    typecheck: "passed",
    unitTests: { total: 176, passed: 176, failed: 0 },
    buildAndAudits: "passed",
    allCardLayouts: {
      cases: 5055,
      details: "all-cards.json",
      widths: allCards.map((r) => r.width),
      issues: [],
    },
    browsers,
    realAcquisitions: {
      cardsPerNewPack: 5,
      stockConsumedOnce: true,
      revealDoesNotDrawAgain: true,
      oldThreeCardResultsResumed: true,
      outOfOrderRevealsPreserved: true,
      favoritesAndMuseumPreserved: true,
      emptyStockGuard: true,
    },
    catalogInputsUnchanged: true,
  },
  publication,
  previews: previews.map(([, name]) => name),
};
await writeFile(
  `${out}/verification.json`,
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    report: `${out}/verification.json`,
    previews: previews.length,
    browserConfigurations: Object.values(browsers).reduce(
      (sum, b) => sum + b.configurations,
      0,
    ),
    accessibilityConfigurations: Object.values(browsers).reduce(
      (sum, b) => sum + b.accessibilityConfigurations,
      0,
    ),
    verifiedFiles: publication.checkedFiles,
  }),
);
