// Run against the development, compiled or published game in isolated browser contexts.
// PLAYWRIGHT_MODULE and MUSE_CHROMIUM may point to an existing local installation.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const dir = process.env.MUSE_TEST_DIR || "/tmp/opencode/muse-main-integration";
const origin = process.env.MUSE_ORIGIN || "http://127.0.0.1:4182";
const label = process.env.MUSE_LABEL || "dev";
const widths = (process.env.MUSE_WIDTHS || "1440,768,390,320")
  .split(",")
  .map(Number);
const data = JSON.parse(await readFile(`${dir}/expected.json`, "utf8"));
const axe = await readFile("node_modules/axe-core/axe.min.js", "utf8");
const browser = await chromium.launch({
  headless: true,
  ...(process.env.MUSE_CHROMIUM
    ? { executablePath: process.env.MUSE_CHROMIUM }
    : {}),
});
const results = [],
  errors = [],
  accessibility = [];
await mkdir(dir, { recursive: true });
async function saved(page) {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem("muse-collection-v1")),
  );
}
async function audit(page, state, configuration) {
  await page.addScriptTag({ content: axe });
  const result = await page.evaluate(() =>
    axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    }),
  );
  accessibility.push({
    ...configuration,
    state,
    violations: result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target),
    })),
  });
}
async function checkCards(page) {
  await page
    .locator(".museum-card__frame")
    .evaluateAll((nodes) => Promise.all(nodes.map((n) => n.decode())));
  const metrics = await page.locator(".museum-card").evaluateAll((nodes) =>
    nodes.map((el) => {
      const panel = el
          .querySelector(".museum-card__panel")
          .getBoundingClientRect(),
        footer = el
          .querySelector(".museum-card__footer")
          .getBoundingClientRect(),
        caption = el
          .querySelector(".museum-card__caption")
          .getBoundingClientRect();
      return {
        id: el.dataset.artworkId,
        frame: el.dataset.frameKey,
        native: el.querySelector(".museum-card__frame").naturalWidth,
        title: el.querySelector("h2").textContent,
        artist: el.querySelector(".museum-card__artist").textContent,
        fit: getComputedStyle(el.querySelector(".museum-card__image img"))
          .objectFit,
        width: el.getBoundingClientRect().width,
        favoriteHeight:
          el.querySelector(".museum-card__favorite")?.getBoundingClientRect()
            .height ?? null,
        captionOverlap: caption.bottom > footer.top + 1,
        out: [...el.querySelectorAll(".museum-card__panel *")]
          .filter((n) => {
            const b = n.getBoundingClientRect();
            return (
              b.width &&
              (b.top < panel.top - 1 ||
                b.bottom > panel.bottom + 1 ||
                b.left < panel.left - 1 ||
                b.right > panel.right + 1)
            );
          })
          .map((n) => n.className),
      };
    }),
  );
  for (const m of metrics) {
    const expected = data.artworks[m.id];
    assert.equal(m.frame, expected.frame);
    assert.equal(m.title, expected.title);
    assert.equal(m.artist, expected.artist);
    assert.equal(m.native, 1024);
    assert.ok(m.width <= 260.6, `Carte non compacte : ${JSON.stringify(m)}`);
    if (m.favoriteHeight !== null)
      assert.ok(
        m.favoriteHeight >= 43.9,
        "La cible du favori doit rester de 44 px.",
      );
    assert.equal(m.fit, "contain");
    assert.equal(m.captionOverlap, false, JSON.stringify(m));
    assert.deepEqual(m.out, [], JSON.stringify(m));
  }
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  return metrics.length;
}
for (const width of widths)
  for (const theme of ["light", "dark"]) {
    const configuration = { width, theme: "dark", storedTheme: theme };
    const context = await browser.newContext({
      viewport: { width, height: 1100 },
      reducedMotion: "reduce",
      colorScheme: "light",
    });
    const seed = {
      version: 1,
      counts: {
        ...Object.fromEntries(data.sampleIds.map((id) => [id, 1])),
        "mona-lisa": 3,
      },
      favorites: ["mona-lisa"],
      exhibited: ["mona-lisa"],
      stock: 10,
      rechargedAt: Date.now(),
      opened: 1,
      latest: {
        catalog: "beaux-arts",
        date: Date.now(),
        cards: [true, false, false].map((isNew) => ({
          id: "mona-lisa",
          isNew,
        })),
        revealed: [0],
      },
    };
    await context.addInitScript(
      ({ seed, theme }) => {
        if (!localStorage.getItem("muse-collection-v1"))
          localStorage.setItem("muse-collection-v1", JSON.stringify(seed));
        localStorage.setItem("muse-theme", theme);
        let step = 0;
        Math.random = () => (step++ % 2 ? 0 : 0.998);
      },
      { seed, theme },
    );
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(origin);
    await page
      .getByRole("heading", { name: "Pochettes", exact: true })
      .waitFor();
    assert.deepEqual(await saved(page), seed);
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
    assert.equal(
      await page
        .locator("html")
        .evaluate((n) => getComputedStyle(n).colorScheme),
      "dark",
    );
    assert.equal(
      await page.getByRole("button", { name: /thème (clair|sombre)/i }).count(),
      0,
    );
    await page.evaluate(() =>
      window.dispatchEvent(
        new StorageEvent("storage", { key: "muse-theme", newValue: "light" }),
      ),
    );
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
    await page.getByRole("link", { name: "Profil", exact: true }).click();
    assert.equal(
      await page.getByRole("button", { name: /thème (clair|sombre)/i }).count(),
      0,
    );
    assert.equal(
      await page.getByRole("heading", { name: "À votre lumière" }).count(),
      0,
    );
    await audit(page, "profile-dark-only", configuration);
    if (width === 390)
      await page.screenshot({
        path: `${dir}/${label}-profile-${width}-${theme}.png`,
        fullPage: true,
      });
    await page.getByRole("link", { name: "Pochettes", exact: true }).click();
    assert.equal(await page.locator(".published-booster").count(), 6);
    assert.equal(
      await page.locator(".published-universal .booster-visual").count(),
      1,
    );
    await audit(page, "home", configuration);
    if (width === 1440 || width === 390)
      await page.screenshot({
        path: `${dir}/${label}-home-${width}-${theme}.png`,
        fullPage: true,
      });
    await page.getByRole("link", { name: "Collection", exact: true }).click();
    await page.locator(".museum-card").first().waitFor();
    let checked = await checkCards(page);
    await audit(page, "collection", configuration);
    const first = page.locator(".museum-card").first();
    const favorite = first.locator(".museum-card__favorite"),
      oldPressed = await favorite.getAttribute("aria-pressed");
    await favorite.click();
    assert.notEqual(await favorite.getAttribute("aria-pressed"), oldPressed);
    await favorite.click();
    const open = first.locator(".museum-card__open");
    await open.focus();
    await page.keyboard.press("Enter");
    await page.locator(".detail-modal[open]").waitFor();
    await page.keyboard.press("Escape");
    await page.locator(".detail-modal").waitFor({ state: "detached" });
    assert.equal(
      await open.evaluate((n) => n === document.activeElement),
      true,
    );
    if (width === 1440 || width === 390)
      await page.screenshot({
        path: `${dir}/${label}-compact-collection-${width}-${theme}.png`,
        fullPage: true,
      });
    for (let i = 1; i < Math.ceil(data.sampleIds.length / 6); i++) {
      await page
        .getByRole("button", { name: "Page suivante", exact: true })
        .click();
      checked += await checkCards(page);
    }
    assert.deepEqual((await saved(page)).counts, seed.counts);
    assert.deepEqual((await saved(page)).favorites, seed.favorites);
    if (width === 390)
      await page.screenshot({
        path: `${dir}/${label}-collection-${width}-${theme}.png`,
        fullPage: true,
      });
    await page.getByRole("link", { name: "Pochettes", exact: true }).click();
    await page
      .getByRole("button", { name: /Reprendre ma dernière ouverture/ })
      .click();
    await page.getByRole("button", { name: "Révéler la carte 2 / 3" }).click();
    await page.getByRole("button", { name: "Révéler la carte 3 / 3" }).click();
    assert.equal((await saved(page)).latest.revealed.length, 3);
    assert.equal((await saved(page)).stock, 10);
    assert.deepEqual((await saved(page)).counts, seed.counts);
    await page.getByRole("button", { name: "Fermer", exact: true }).click();
    for (const group of data.groups) {
      const before = await saved(page);
      await page
        .getByRole("button", {
          name:
            group.id === "universel"
              ? "Choisir la collection universelle"
              : `Choisir ${group.title}`,
          exact: true,
        })
        .click();
      assert.equal(
        await page
          .locator(
            '.published-opening select, .published-opening input[type="checkbox"]',
          )
          .count(),
        0,
      );
      await page.locator(".opening-probabilities summary").click();
      const shown = await page
        .locator(".rate > div:first-child > span:last-child")
        .allTextContents();
      assert.equal(shown.length, 5);
      for (let i = 0; i < 5; i++)
        assert.ok(
          Math.abs(parseFloat(shown[i].replace(",", ".")) - group.rates[i]) <
            0.011,
          `${group.id} rate ${i}`,
        );
      await page
        .getByRole("button", { name: "Ouvrir la pochette", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Révéler la carte 1 / 5" })
        .waitFor();
      const drawn = await saved(page);
      assert.equal(
        await page.locator(".opening-study").getAttribute("data-reveal-mode"),
        "sequential",
      );
      assert.equal(
        await page.locator(".opening-study").getAttribute("data-opening-speed"),
        "1.6",
      );
      const allButton = page.getByRole("button", {
        name: "Tout révéler",
        exact: true,
      });
      assert.equal(
        await allButton.locator("..").getAttribute("class"),
        "study-actions",
      );
      const stageBox = await page.locator(".study-stage").boundingBox();
      const allBox = await allButton.boundingBox();
      assert.ok(
        allBox.y >= stageBox.y + stageBox.height,
        "Tout révéler doit être sous les cartes.",
      );
      assert.equal(
        await page
          .getByRole("button", { name: "Planche", exact: true })
          .count(),
        0,
      );
      assert.equal(drawn.stock, before.stock - 1);
      assert.equal(drawn.opened, before.opened + 1);
      assert.equal(drawn.latest.cards.length, 5);
      assert.equal(drawn.latest.catalog, group.id);
      const expectedCounts = { ...before.counts };
      for (const card of drawn.latest.cards) {
        assert.ok(group.ids.includes(card.id));
        expectedCounts[card.id] = (expectedCounts[card.id] || 0) + 1;
      }
      assert.deepEqual(drawn.counts, expectedCounts);
      const max = Math.max(
        ...drawn.latest.cards.map((c) => data.artworks[c.id].rarity),
      );
      assert.equal(
        await page.locator(".study-stage").getAttribute("data-rarity-level"),
        String(max),
      );
      assert.equal(
        await page.locator(".study-masterpiece-effects").count(),
        max === 4 ? 1 : 0,
      );
      // Two rapid activations still reveal only one card, even with reduced motion.
      await page
        .getByRole("button", { name: "Révéler la carte 1 / 5" })
        .click();
      assert.equal((await saved(page)).latest.revealed.length, 1);
      const progress = await page.locator(".study-progress").boundingBox();
      const hint = await page.locator(".stage-hint").boundingBox();
      assert.ok(
        progress.y + progress.height <= hint.y - 2,
        "La progression ne doit pas chevaucher le texte mobile.",
      );
      if (group.id === "universel") {
        await audit(page, "sequential-card", configuration);
        await page.locator(".study-stage").screenshot({
          path: `${dir}/${label}-opening-${width}-${theme}.png`,
        });
        await page.locator(".opening-study").screenshot({
          path: `${dir}/${label}-opening-actions-${width}-${theme}.png`,
        });
        await page.getByRole("button", { name: "Fermer", exact: true }).click();
        await page.reload();
        await page
          .getByRole("button", { name: /Reprendre ma dernière ouverture/ })
          .click();
        assert.deepEqual((await saved(page)).counts, drawn.counts);
        assert.equal((await saved(page)).stock, drawn.stock);
      }
      for (let i = 2; i <= 4; i++)
        await page
          .getByRole("button", {
            name: `Révéler la carte ${i} / 5`,
            exact: true,
          })
          .click();
      await page
        .getByRole("button", { name: "Tout révéler", exact: true })
        .click();
      const after = await saved(page);
      assert.equal(after.latest.revealed.length, 5);
      assert.deepEqual(after.counts, drawn.counts);
      assert.equal(after.stock, drawn.stock);
      assert.equal(await page.locator(".study-card.is-revealed").count(), 5);
      const row = await page.locator(".study-card").evaluateAll((cards) =>
        cards.map((c) => ({
          top: c.getBoundingClientRect().top,
          width: c.getBoundingClientRect().width,
        })),
      );
      assert.ok(
        Math.max(...row.map((c) => c.top)) -
          Math.min(...row.map((c) => c.top)) <
          1,
        "Les cinq cartes doivent rester sur une seule ligne.",
      );
      assert.ok(row.every((c) => c.width <= 260.6));
      const strip = page.locator(".study-cards");
      if (width >= 1440)
        assert.equal(
          await strip.evaluate((n) => n.scrollWidth > n.clientWidth + 1),
          false,
          "Les cinq cartes doivent tenir sur ordinateur.",
        );
      if (width <= 390) {
        await strip.evaluate((n) => (n.scrollLeft = 0));
        const firstCard = await page
          .locator(".study-card")
          .first()
          .boundingBox();
        const stripBox = await strip.boundingBox();
        assert.ok(
          firstCard.x >= stripBox.x - 1,
          "La première carte doit rester accessible.",
        );
        assert.equal(
          await strip.evaluate((n) => n.scrollWidth > n.clientWidth),
          true,
        );
        await strip.focus();
        await page.keyboard.press("End");
        await page.locator(".study-card-front").last().focus();
        assert.ok(
          await strip.evaluate((n) => n.scrollLeft > 0),
          "La dernière carte doit rester accessible au clavier.",
        );
        await page.locator(".study-card-front").first().focus();
      }
      checked += await checkCards(page);
      if (group.id === "universel") {
        await audit(page, "board", configuration);
        await page.locator(".opening-study").screenshot({
          path: `${dir}/${label}-compact-row-${width}-${theme}.png`,
        });
      }
      await page.getByRole("button", { name: "Fermer", exact: true }).click();
    }
    const final = await saved(page);
    assert.equal(final.stock, 3);
    assert.equal(final.opened, 8);
    assert.deepEqual(final.favorites, seed.favorites);
    assert.deepEqual(final.exhibited, seed.exhibited);
    // Reveal-all can also interrupt the opening without drawing a second time.
    await page
      .getByRole("button", { name: "Choisir la collection universelle" })
      .click();
    await page
      .getByRole("button", { name: "Ouvrir la pochette", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Tout révéler", exact: true })
      .click();
    assert.equal((await saved(page)).stock, 2);
    assert.equal((await saved(page)).latest.revealed.length, 5);
    await page.getByRole("button", { name: "Fermer", exact: true }).click();
    results.push({
      ...configuration,
      checkedCards: checked,
      boosterPools: 7,
      legacyThreeCardResume: true,
      reloadResume: true,
      realAcquisitions: true,
      unchangedFavoritesAndMuseum: true,
      forcedDarkTheme: true,
      fastSequentialOnly: true,
      revealAllBelowCards: true,
    });
    await context.close();
  }
// Exercise the actual GSAP transitions, interruption, keyboard and double-click guard.
for (const width of [1440, 320]) {
  const context = await browser.newContext({
      viewport: { width, height: 1100 },
      reducedMotion: "no-preference",
    }),
    page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await context.addInitScript(() => {
    let step = 0;
    Math.random = () => (step++ % 2 ? 0 : 0.998);
  });
  await page.goto(origin);
  await page
    .getByRole("button", { name: "Choisir la collection universelle" })
    .click();
  await page
    .getByRole("button", { name: "Ouvrir la pochette", exact: true })
    .click();
  await page.getByRole("button", { name: "Passer l’animation" }).click();
  const primary = page.getByRole("button", {
    name: "Révéler la carte 1 / 5",
    exact: true,
  });
  await primary.focus();
  await page.keyboard.press("Enter");
  await page.locator(".study-primary").evaluate((n) => {
    n.click();
    n.click();
  });
  await page
    .getByRole("button", { name: "Révéler la carte 2 / 5", exact: true })
    .waitFor();
  assert.equal((await saved(page)).latest.revealed.length, 1);
  assert.equal(
    await page
      .locator(".study-primary")
      .evaluate((n) => n === document.activeElement),
    true,
  );
  await page
    .getByRole("button", { name: "Révéler la carte 2 / 5", exact: true })
    .click();
  await page.getByRole("button", { name: "Fermer", exact: true }).click();
  const before = await saved(page);
  await page.reload();
  await page
    .getByRole("button", { name: /Reprendre ma dernière ouverture/ })
    .click();
  assert.deepEqual((await saved(page)).counts, before.counts);
  assert.equal((await saved(page)).stock, 9);
  await context.close();
  results.push({
    width,
    animated: true,
    skipAnimation: true,
    doubleClickGuard: true,
    keyboard: true,
    interruptionSafe: true,
  });
}
// An old result may contain out-of-order reveals; switching modes must not lose them.
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 1100 },
    reducedMotion: "reduce",
  });
  const seed = {
    version: 1,
    counts: { "mona-lisa": 3 },
    favorites: [],
    exhibited: [],
    stock: 0,
    rechargedAt: Date.now(),
    opened: 1,
    latest: {
      catalog: "all",
      date: Date.now(),
      cards: [true, false, false].map((isNew) => ({ id: "mona-lisa", isNew })),
      revealed: [2],
    },
  };
  await context.addInitScript((seed) => {
    if (!localStorage.getItem("muse-collection-v1"))
      localStorage.setItem("muse-collection-v1", JSON.stringify(seed));
  }, seed);
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin);
  await page
    .getByRole("button", { name: "Choisir la collection universelle" })
    .click();
  assert.equal(
    await page
      .getByRole("button", { name: /Prochaine pochette dans/ })
      .isDisabled(),
    true,
  );
  assert.deepEqual((await saved(page)).counts, seed.counts);
  await page.getByRole("button", { name: "Fermer", exact: true }).click();
  await page
    .getByRole("button", { name: /Reprendre ma dernière ouverture/ })
    .click();
  await page
    .getByRole("button", { name: "Révéler la carte 1 / 3", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Révéler la carte 2 / 3", exact: true })
    .click();
  assert.deepEqual([...(await saved(page)).latest.revealed].sort(), [0, 1, 2]);
  assert.deepEqual((await saved(page)).counts, seed.counts);
  assert.equal((await saved(page)).stock, 0);
  await context.close();
  results.push({
    outOfOrderLegacyReveal: true,
    emptyStockGuard: true,
    noAdditionalAcquisitions: true,
  });
}
// The first paint stays dark even before React runs or when scripts are disabled.
{
  const context = await browser.newContext({
    javaScriptEnabled: false,
    colorScheme: "light",
    viewport: { width: 390, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(origin);
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  assert.equal(
    await page.locator("html").evaluate((n) => getComputedStyle(n).colorScheme),
    "dark",
  );
  assert.equal(
    await page.locator('meta[name="theme-color"]').getAttribute("content"),
    "#210a12",
  );
  await context.close();
  results.push({ darkWithoutJavaScript: true, systemLightIgnored: true });
}
await browser.close();
await writeFile(
  `${dir}/${label}-browser.json`,
  JSON.stringify({ origin, results, errors, accessibility }, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    {
      label,
      configurations: results.length,
      errors,
      violations: accessibility.filter((a) => a.violations.length),
    },
    null,
    2,
  ),
);
assert.deepEqual(errors, []);
assert.ok(
  accessibility.every((a) => a.violations.length === 0),
  "Accessibilité : voir le rapport.",
);
