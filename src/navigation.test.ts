import { test } from "node:test";
import assert from "node:assert/strict";
import { navigation, resolvePage } from "./navigation";

test("la navigation expose les quatre destinations demandées", () => {
  assert.deepEqual(
    navigation.map((item) => item.label),
    ["Pochettes", "Marché", "Collection", "Profil"],
  );
  for (const item of navigation)
    assert.equal(resolvePage(`#${item.id}`), item.id);
});

test("les anciens écrans d’ouverture reviennent aux pochettes", () => {
  for (const hash of ["", "#", "#atelier", "#revelation", "#inconnu"])
    assert.equal(resolvePage(hash), "pochettes");
  assert.equal(resolvePage("#musee"), "collection");
});
