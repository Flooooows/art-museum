import { readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const browser = await chromium.launch({
  headless: true,
  ...(process.env.MUSE_CHROMIUM
    ? { executablePath: process.env.MUSE_CHROMIUM }
    : {}),
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }),
  results = [];
const origin = process.env.MUSE_ORIGIN || "http://127.0.0.1:4182";
const compact = process.env.MUSE_COMPACT === "true";
for (const width of compact
  ? [200, 220, 240, 260]
  : [260, 290, 320, 360, 440]) {
  await page.goto(
    `${origin}/tests/browser/game-presentation.html?width=${width}${compact ? "&compact=1" : ""}`,
  );
  await page.locator(".museum-card").nth(1010).waitFor();
  await page.evaluate(() => document.fonts.ready);
  const metrics = await page.locator(".museum-card").evaluateAll((nodes) =>
    nodes.map((el) => {
      const panel = el
          .querySelector(".museum-card__panel")
          .getBoundingClientRect(),
        footer = el
          .querySelector(".museum-card__footer")
          .getBoundingClientRect(),
        artist = el
          .querySelector(".museum-card__artist")
          .getBoundingClientRect();
      return {
        id: el.dataset.artworkId,
        imageHeight: el
          .querySelector(".museum-card__image")
          .getBoundingClientRect().height,
        overlap: artist.bottom > footer.top + 1,
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
        clipped: [
          ...el.querySelectorAll(
            "h2,.museum-card__artist,.museum-card__category",
          ),
        ]
          .filter((n) => {
            const s = getComputedStyle(n);
            return (
              s.textOverflow === "ellipsis" ||
              s.webkitLineClamp !== "none" ||
              (n.scrollHeight > n.clientHeight + 1 &&
                ["hidden", "clip"].includes(s.overflow))
            );
          })
          .map((n) => n.className),
      };
    }),
  );
  const issues = metrics.filter(
    (m) => m.overlap || m.out.length || m.clipped.length || m.imageHeight < 25,
  );
  results.push({
    width,
    cards: metrics.length,
    minImageHeight: Math.min(...metrics.map((m) => m.imageHeight)),
    issues,
  });
}
await browser.close();
await writeFile(
  `${process.env.MUSE_TEST_DIR || "/tmp/opencode/muse-main-integration"}/${compact ? "compact-cards" : "all-cards"}.json`,
  JSON.stringify(results, null, 2) + "\n",
);
assert.ok(results.every((r) => r.cards === 1011 && !r.issues.length));
console.log(
  compact
    ? "Les 1011 cartes compactes restent entières dans quatre largeurs (4044 compositions)."
    : "Les 1011 cartes restent entières dans cinq largeurs (5055 compositions).",
);
