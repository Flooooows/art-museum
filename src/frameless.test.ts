import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import FramedArtwork from "./FramedArtwork";
import { artworks } from "./data";

test("sans cadres — les 1011 œuvres affichent uniquement leur reproduction, quelle que soit la rareté", () => {
  for (const art of artworks) {
    const html = renderToStaticMarkup(createElement(FramedArtwork, { art }));
    assert.match(html, /artwork-unframed/);
    assert.equal((html.match(/<img\b/g) ?? []).length, 1);
    assert.ok(html.includes(`src="${art.image}"`));
    assert.doesNotMatch(
      html,
      /framed-art-(overlay|matte|fallback|supplied)|assets\/collections|--frame-|mask-image/,
    );
  }
});
test("sans cadres — les œuvres manquantes et les images prioritaires gardent leur comportement", () => {
  const html = renderToStaticMarkup(
    createElement(FramedArtwork, {
      art: artworks[0],
      missing: true,
      eager: true,
    }),
  );
  assert.match(html, /framed-art-missing/);
  assert.match(html, /loading="eager"/);
  assert.doesNotMatch(html, /framed-art-overlay|framed-art-matte/);
});
test("sans cadres — ni préparation automatique ni publication des anciens fichiers", async () => {
  const pkg = JSON.parse(await readFile("package.json", "utf8"));
  for (const hook of ["predev", "pretest", "build"])
    assert.ok(!pkg.scripts[hook]?.includes("prepare:frames"));
  const config = JSON.parse(await readFile("firebase.muse.json", "utf8"));
  assert.ok(config.hosting.ignore.includes("assets/collections/**"));
  const css = await readFile("src/frames.css", "utf8");
  assert.doesNotMatch(
    css,
    /ridge|framed-art-fallback|framed-art-overlay|mask-image|--frame-/,
  );
});
