import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { artworks } from "./data";

test("MUSE Lab — quatre entrées et hébergement distincts du jeu et de l’atelier", async () => {
  const config = JSON.parse(await readFile("firebase.lab.json", "utf8"));
  assert.equal(config.hosting.site, "muse-lab-6f2d");
  assert.equal(config.hosting.public, "dist-muse-lab");
  for (const file of ["firebase.json", "firebase.muse.json"]) {
    const other = JSON.parse(await readFile(file, "utf8"));
    assert.notEqual(other.hosting.site, config.hosting.site);
    assert.notEqual(other.hosting.public, config.hosting.public);
  }
  const vite = await readFile("vite.muse-lab.config.ts", "utf8");
  for (const page of [
    "muse-lab.html",
    "card-lab.html",
    "booster-lab.html",
    "opening-lab.html",
  ]) {
    assert.ok(vite.includes(page));
    assert.match(await readFile(page, "utf8"), /noindex,nofollow/);
  }
  assert.doesNotMatch(vite, /review\.html|input:.*index\.html/);
  assert.ok(
    config.hosting.headers.some(
      (rule: { headers: { key: string; value: string }[] }) =>
        rule.headers.some(
          (h) => h.key === "X-Robots-Tag" && h.value.includes("noindex"),
        ),
    ),
  );
});
test("MUSE Lab — navigation relative commune aux trois essais, sans adresse locale", async () => {
  const nav = await readFile("src/muse-lab/LabNavigation.tsx", "utf8");
  assert.doesNotMatch(nav, /127\.0\.0\.1|localhost|https?:\/\//);
  for (const page of [
    "card-lab.html",
    "booster-lab.html",
    "opening-lab.html",
  ]) {
    assert.ok(nav.includes(`/${page}`));
  }
  for (const file of [
    "src/card-lab/main.tsx",
    "src/booster-lab/main.tsx",
    "src/opening-lab/main.tsx",
  ]) {
    const source = await readFile(file, "utf8");
    assert.match(source, /LabNavigation/);
    assert.doesNotMatch(source, /127\.0\.0\.1|localhost/);
  }
  const root = await readFile("src/muse-lab/main.tsx", "utf8");
  assert.doesNotMatch(root, /localStorage|sessionStorage|openPack/);
});
test("MUSE Lab — seules les ressources publiques nécessaires sont préparées", async () => {
  const manifest = JSON.parse(
    await readFile("catalog/muse-lab/hosting-manifest.json", "utf8"),
  );
  assert.equal(manifest.works, artworks.length);
  assert.equal(manifest.fileCount, Object.keys(manifest.files).length);
  for (const art of artworks)
    assert.ok(manifest.files[art.image.slice(1)], art.id);
  for (const name of Object.keys(manifest.files))
    assert.doesNotMatch(
      name,
      /review|masterpieces|enrichment|legal-eu|generated-sources|provenance|service-account|assets\/collections/,
    );
  for (const page of [
    "index.html",
    "muse-lab.html",
    "card-lab.html",
    "booster-lab.html",
    "opening-lab.html",
    "robots.txt",
  ]) {
    assert.match(manifest.files[page], /^[a-f0-9]{64}$/);
  }
  assert.equal(
    manifest.files["robots.txt"],
    createHash("sha256").update("User-agent: *\nDisallow: /\n").digest("hex"),
  );
});
