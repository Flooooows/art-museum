// Run with tsx. Playwright can be supplied externally without changing the app's dependencies.
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { artworks, typeCatalogs, themeCatalogs } from "../../src/data.ts";
import {
  exploreArtworks,
  initialExploration,
} from "../../src/collection-lab/exploration.ts";

const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const origin = process.env.MUSE_LAB_ORIGIN || "http://127.0.0.1:4184";
const output =
  process.env.MUSE_LAB_TEST_OUTPUT || "/tmp/opencode/muse-collection-lab";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.CHROMIUM_EXECUTABLE }
    : {}),
});
const errors = [],
  results = [],
  accessibility = [];
const sentinel = '{"test":"collection-lab-does-not-touch-game-storage"}';

async function noOverflow(page) {
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
}
async function audit(page, label) {
  await page.addScriptTag({
    content: await readFile(
      new URL("../../node_modules/axe-core/axe.min.js", import.meta.url),
      "utf8",
    ),
  });
  const report = await page.evaluate(async () =>
    window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    }),
  );
  const violations = report.violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    targets: nodes.map((node) => node.target),
  }));
  accessibility.push({ label, violations });
  assert.deepEqual(violations, [], `Accessibilité : ${label}`);
}

try {
  for (const [label, width, height, columns] of [
    ["desktop", 1440, 1080, 4],
    ["tablet", 834, 1112, 3],
    ["mobile", 390, 844, 2],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      reducedMotion: "reduce",
      isMobile: label === "mobile",
      hasTouch: label === "mobile",
    });
    await context.addInitScript((value) => {
      localStorage.setItem("muse-collection-v1", value);
      window.__storageCalls = [];
      for (const method of ["getItem", "setItem", "removeItem", "clear"]) {
        const original = Storage.prototype[method];
        Storage.prototype[method] = function (...args) {
          window.__storageCalls.push([method, ...args]);
          return original.apply(this, args);
        };
      }
    }, sentinel);
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${origin}/collection-lab.html`);
    await page.locator(".cl-artwork").first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page
      .locator(".cl-artwork img")
      .first()
      .evaluate((img) => img.decode());
    assert.equal(await page.locator(".cl-artwork").count(), 24);
    assert.equal(
      await page
        .locator(".cl-gallery")
        .evaluate(
          (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
        ),
      columns,
    );
    assert.equal(
      await page
        .getByRole("navigation", { name: "Types d’œuvres" })
        .getByRole("button")
        .count(),
      typeCatalogs.length + 1,
    );
    assert.ok(
      await page
        .locator(".cl-artwork img")
        .first()
        .evaluate((el) => getComputedStyle(el).objectFit === "contain"),
    );
    await noOverflow(page);
    await page.screenshot({ path: `${output}/${label}.png` });
    if (label === "desktop") await audit(page, "gallery-desktop");

    const search = page.getByRole("searchbox");
    await search.fill("zzzzzz-introuvable");
    await page.getByRole("heading", { name: "Un autre regard ?" }).waitFor();
    assert.equal(await page.locator(".cl-artwork").count(), 0);
    await page
      .getByRole("button", { name: "Retrouver toutes les œuvres" })
      .click();
    await page.locator(".cl-artwork").first().waitFor();
    assert.equal(await search.inputValue(), "");
    await search.fill(artworks[0].id);
    await page.waitForFunction(
      (title) =>
        document.querySelector(".cl-artwork__title")?.textContent === title,
      artworks[0].title,
    );
    assert.equal(
      await page.locator(".cl-artwork").count(),
      exploreArtworks(artworks, {
        ...initialExploration,
        query: artworks[0].id,
      }).length,
    );
    await page
      .getByRole("button", { name: "Tout effacer", exact: true })
      .click();

    const categories = page.getByRole("navigation", { name: "Types d’œuvres" });
    await categories
      .getByRole("button", { name: typeCatalogs.at(-1).title, exact: true })
      .click();
    assert.equal(
      await categories
        .getByRole("button", { name: typeCatalogs.at(-1).title, exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    assert.equal(
      await page.locator(".cl-artwork").count(),
      Math.min(
        24,
        artworks.filter((art) => art.catalog === typeCatalogs.at(-1).id).length,
      ),
    );
    await page
      .getByRole("button", { name: "Tout effacer", exact: true })
      .click();

    const filters = page.getByRole("button", { name: /^Filtres/ });
    await filters.click();
    const panel = page.getByRole("dialog", { name: "Les filtres" });
    await panel
      .getByRole("radio", { name: themeCatalogs[0].title, exact: true })
      .check();
    await page.keyboard.press("Escape");
    await panel.waitFor({ state: "detached" });
    assert.equal(
      await filters.evaluate((el) => document.activeElement === el),
      true,
    );
    assert.equal(await page.locator(".cl-chip").count(), 0);
    await filters.click();
    assert.equal(
      await panel
        .getByRole("radio", { name: "Tous les thèmes", exact: true })
        .isChecked(),
      true,
    );
    const chosen = artworks.find((art) =>
      art.catalogIds.includes(themeCatalogs[0].id),
    );
    await panel
      .getByRole("radio", { name: themeCatalogs[0].title, exact: true })
      .check();
    await panel
      .getByLabel("Rareté dans MUSE")
      .selectOption(String(chosen.rarity));
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      assert.equal(
        await panel.evaluate((el) => el.contains(document.activeElement)),
        true,
      );
    }
    if (label === "mobile") {
      await page.screenshot({ path: `${output}/mobile-filters.png` });
      await audit(page, "filters-mobile");
    }
    await panel.getByRole("button", { name: "Afficher les résultats" }).click();
    await panel.waitFor({ state: "detached" });
    const expected = exploreArtworks(artworks, {
      ...initialExploration,
      theme: themeCatalogs[0].id,
      rarity: String(chosen.rarity),
    });
    assert.equal(
      await page.locator(".cl-artwork").count(),
      Math.min(24, expected.length),
    );
    assert.equal(await page.locator(".cl-chip").count(), 2);
    await page
      .getByRole("button", {
        name: `Retirer le filtre ${themeCatalogs[0].title}`,
        exact: true,
      })
      .click();
    assert.equal(await page.locator(".cl-chip").count(), 1);
    await page
      .getByRole("button", { name: "Tout effacer", exact: true })
      .click();

    for (const sort of ["title", "artist", "rarity"]) {
      await page
        .getByRole("combobox", { name: "Trier les œuvres" })
        .selectOption(sort);
      const expectedFirst = exploreArtworks(artworks, {
        ...initialExploration,
        sort,
      })[0].title;
      await page.waitForFunction(
        (title) =>
          document.querySelector(".cl-artwork__title")?.textContent === title,
        expectedFirst,
      );
    }
    await page
      .getByRole("combobox", { name: "Trier les œuvres" })
      .selectOption("collection");
    const opener = page.locator(".cl-artwork button").first();
    await opener.click();
    const viewer = page.getByRole("dialog", {
      name: artworks[0].title,
      exact: true,
    });
    await viewer.waitFor();
    assert.equal(
      await page
        .getByRole("button", { name: "Œuvre précédente", exact: true })
        .isDisabled(),
      true,
    );
    await page.locator(".cl-viewer img").evaluate((img) => img.decode());
    await page.screenshot({ path: `${output}/${label}-viewer.png` });
    if (label === "desktop") await audit(page, "viewer-desktop");
    await page
      .getByRole("button", { name: "Œuvre suivante", exact: true })
      .click();
    await page
      .getByRole("heading", { name: artworks[1].title, exact: true })
      .waitFor();
    await page.keyboard.press("ArrowLeft");
    await page
      .getByRole("heading", { name: artworks[0].title, exact: true })
      .waitFor();
    await page.locator(".cl-disclosure summary").last().click();
    assert.equal(
      await page
        .getByRole("link", { name: /^Notice de l’institution/ })
        .getAttribute("href"),
      artworks[0].source,
    );
    await page.keyboard.press("Escape");
    await page.locator(".cl-viewer").waitFor({ state: "detached" });
    assert.equal(
      await opener.evaluate((el) => el === document.activeElement),
      true,
    );
    await page.getByRole("button", { name: /Voir 24 œuvres de plus/ }).click();
    assert.equal(await page.locator(".cl-artwork").count(), 48);
    assert.equal(
      await page
        .locator(".cl-artwork button")
        .nth(24)
        .evaluate((el) => el === document.activeElement),
      true,
    );
    await noOverflow(page);
    const calls = await page.evaluate(() => window.__storageCalls);
    assert.deepEqual(
      calls,
      [],
      "Aucun appel aux stockages pendant l’exploration",
    );
    const stored = await page.evaluate(() =>
      localStorage.getItem("muse-collection-v1"),
    );
    assert.equal(stored, sentinel);
    results.push({
      label,
      width,
      height,
      columns,
      search: true,
      filters: true,
      cancellation: true,
      sort: true,
      viewer: true,
      keyboard: true,
      loadMore: true,
      storageUntouched: true,
      horizontalOverflow: false,
    });
    await context.close();
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  let releaseImages;
  const holdImages = new Promise((resolve) => {
    releaseImages = resolve;
  });
  await page.route(/\.(?:webp|jpg|png)(?:\?.*)?$/, async (route) => {
    await holdImages;
    await route.abort();
  });
  await page.goto(`${origin}/collection-lab.html`, {
    waitUntil: "domcontentloaded",
  });
  await page.locator(".cl-artwork").first().waitFor();
  assert.equal(await page.locator(".cl-image--loading").count(), 24);
  releaseImages();
  await page.locator(".cl-image--error").first().waitFor();
  await page.locator(".cl-artwork button").first().click();
  await page.locator(".cl-viewer .cl-image--error").waitFor();
  await page.unroute(/\.(?:webp|jpg|png)(?:\?.*)?$/);
  await page.getByRole("button", { name: "Réessayer", exact: true }).click();
  await page.locator(".cl-viewer .cl-image--ready").waitFor();
  await page.keyboard.press("Escape");
  results.push({
    loadingPlaceholder: true,
    imageErrorFallback: true,
    imageRetry: true,
  });
  await page.setViewportSize({ width: 320, height: 740 });
  const longest = artworks.reduce((a, b) =>
    a.title.length > b.title.length ? a : b,
  );
  await page.getByRole("searchbox").fill(longest.id);
  await page.waitForFunction(
    (title) =>
      document.querySelector(".cl-artwork__title")?.textContent === title,
    longest.title,
  );
  await noOverflow(page);
  await page.locator(".cl-artwork button").first().click();
  await page
    .getByRole("heading", { name: longest.title, exact: true })
    .waitFor();
  await page.locator(".cl-disclosure summary").last().click();
  assert.equal(
    await page
      .locator(".cl-viewer")
      .evaluate((el) => el.scrollWidth > el.clientWidth),
    false,
  );
  assert.equal(
    await page
      .getByRole("button", { name: "Œuvre suivante", exact: true })
      .isDisabled(),
    true,
  );
  await page
    .getByRole("button", { name: "Retour à la galerie", exact: true })
    .click();
  assert.equal(await page.getByRole("searchbox").inputValue(), longest.id);
  results.push({
    narrowWidth: 320,
    longestRealTitle: longest.id,
    fullTitleWraps: true,
    singleResultNavigationDisabled: true,
    searchPreservedOnReturn: true,
  });
  await context.close();
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  await writeFile(
    `${output}/browser-verification.json`,
    JSON.stringify({ origin, results, accessibility, errors }, null, 2) + "\n",
  );
}
console.log(JSON.stringify({ results, accessibility, errors }, null, 2));
