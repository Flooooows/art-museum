import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("jeu — sombre dès le HTML, sans préférence locale ou système", async () => {
  const html = await readFile("index.html", "utf8");
  assert.match(html, /<html[^>]*data-theme="dark"/);
  assert.match(html, /<meta name="theme-color" content="#210a12"/);
  assert.doesNotMatch(html, /localStorage|prefers-color-scheme|"light"/);
});
test("jeu — aucun sélecteur de thème dans la navigation ou le profil", async () => {
  for (const file of ["src/App.tsx", "src/Profile.tsx"]) {
    assert.doesNotMatch(
      await readFile(file, "utf8"),
      /useTheme|toggleTheme|onToggleTheme|theme-toggle|Activer le thème|Passer au thème/,
    );
  }
  const css = await readFile("src/appearance.css", "utf8");
  assert.match(css, /:root\s*\{[^}]*color-scheme: dark;/);
  assert.doesNotMatch(css, /color-scheme: light/);
});
test("atelier — le choix de thème partagé reste indépendant du jeu", async () => {
  for (const file of [
    "src/review/ReviewApp.tsx",
    "src/masterpieces/CandidateApp.tsx",
  ])
    assert.match(await readFile(file, "utf8"), /useTheme/);
});
