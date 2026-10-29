import { test } from "node:test";
import assert from "node:assert/strict";
import { parseTheme, resolveTheme } from "./theme";

test("le thème suit le système en l’absence de choix explicite", () => {
  assert.equal(resolveTheme(null, false), "light");
  assert.equal(resolveTheme(null, true), "dark");
});

test("le choix explicite prime sur le système", () => {
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
});

test("seules les préférences de thème connues sont acceptées", () => {
  assert.equal(parseTheme("dark"), "dark");
  assert.equal(parseTheme("light"), "light");
  for (const invalid of [null, "", "system", "invalid", "DARK"]) {
    assert.equal(parseTheme(invalid), null);
  }
});
