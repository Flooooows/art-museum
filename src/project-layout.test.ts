import { test } from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import layout from "../catalog/history/layout-2026-10-30.json";
import {
  projectPath,
  readHistoricalFile,
  readProjectFile,
} from "../scripts/project-files";

const hash = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");

test("rangement — les neuf fichiers déplacés restent accessibles sans doublon racine", async () => {
  for (const [oldPath, newPath] of Object.entries(layout.relocations)) {
    assert.equal(projectPath(oldPath), newPath);
    assert.deepEqual(await readProjectFile(oldPath), await readFile(newPath));
    await assert.rejects(access(oldPath), { code: "ENOENT" });
  }
  assert.equal(projectPath("src/catalog/seed.json"), "src/catalog/seed.json");
});

test("rangement — les anciennes empreintes de code restent vérifiées sur les sources archivées", async () => {
  const report = JSON.parse(
    await readProjectFile("enrichment-351-results.json", "utf8"),
  );
  const previous = JSON.parse(
    await readProjectFile("masterpieces-candidates.json", "utf8"),
  );
  const implementations = {
    ...previous.implementationHashes,
    ...report.implementationHashes,
  };
  for (const [file, archive] of Object.entries(layout.sourceArchives)) {
    const expected = implementations[file];
    assert.equal(typeof expected, "string", file);
    assert.equal(hash(await readFile(archive)), expected, file);
    assert.equal(
      hash(await readHistoricalFile(file, expected)),
      expected,
      file,
    );
  }
});

test("rangement — une empreinte erronée ou invalide ne contourne pas l'intégrité", async () => {
  for (const file of [
    "masterpieces-candidates.json",
    "scripts/enrichment-351/build.ts",
  ]) {
    await assert.rejects(
      readHistoricalFile(file, "0".repeat(64)),
      /absente ou altérée/,
    );
    await assert.rejects(readHistoricalFile(file, "invalid"), /invalide/);
  }
});

test("rangement — tous les anciens cadres restent archivés localement et hors publication", async () => {
  const config = JSON.parse(await readFile("firebase.muse.json", "utf8"));
  assert.ok(config.hosting.ignore.includes("assets/collections/**"));
  const frames = JSON.parse(await readFile("src/frame-assets.json", "utf8"));
  for (const frame of Object.values(frames) as {
    original: string;
    src: string;
    matte: string;
  }[]) {
    assert.match(frame.src, /^\/assets\/collections\/display\//);
    await access(`public${frame.original}`);
    await access(`public${frame.src}`);
    await access(`public${frame.matte}`);
  }
});
