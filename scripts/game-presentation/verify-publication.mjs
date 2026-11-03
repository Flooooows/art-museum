import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
const dir = process.env.MUSE_TEST_DIR || "/tmp/opencode/muse-main-integration";
const origin = "https://muse-collection-6f2d.web.app";
const read = async (file) => JSON.parse(await readFile(file, "utf8"));
const channel = async (file) =>
  (await read(`${dir}/${file}`)).result.channels.find((c) =>
    c.name.endsWith("/live"),
  );
const before = await channel("game-before.json"),
  after = await channel("game-after.json"),
  labBefore = await channel("lab-before.json"),
  labAfter = await channel("lab-after.json");
assert.equal(
  labBefore.release.name,
  labAfter.release.name,
  "Le lab ne doit pas être redéployé.",
);
const deployed = (await read(`${dir}/deploy.json`)).result.hosting;
assert.equal(deployed, after.release.version.name);
assert.notEqual(before.release.version.name, after.release.version.name);
const manifest = await read("catalog/game-presentation/hosting-manifest.json"),
  entries = Object.entries(manifest.files),
  checks = [],
  failures = [];
let cursor = 0;
async function verify(file, expected) {
  let last;
  for (let attempt = 1; attempt <= 4; attempt++)
    try {
      const response = await fetch(new URL(file, origin + "/"), {
        signal: AbortSignal.timeout(30000),
      });
      assert.equal(response.status, 200, `${file} HTTP`);
      const bytes = Buffer.from(await response.arrayBuffer());
      assert.equal(
        createHash("sha256").update(bytes).digest("hex"),
        expected,
        `${file} SHA-256`,
      );
      return { file, bytes: bytes.length, attempt };
    } catch (error) {
      last = String(error);
    }
  throw Error(`${file}: ${last}`);
}
async function worker() {
  while (cursor < entries.length) {
    const [file, sha] = entries[cursor++];
    try {
      checks.push(await verify(file, sha));
    } catch (error) {
      failures.push({ file, error: String(error) });
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
await writeFile(
  `${dir}/file-verification.json`,
  JSON.stringify({ checks, failures }, null, 2) + "\n",
);
assert.deepEqual(failures, []);
assert.equal(checks.length, entries.length);
const headers = [];
for (const path of ["/", "/index.html"]) {
  const r = await fetch(origin + path, { method: "HEAD" });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("cache-control"), "no-cache");
  headers.push({
    path,
    status: r.status,
    cache: r.headers.get("cache-control"),
  });
}
const excluded = [];
for (const path of [
  "/review.html",
  "/masterpieces.html",
  "/card-lab.html",
  "/opening-lab.html",
  "/booster-lab.html",
  "/muse-lab.html",
  "/assets/collections/beaux-arts-lapis-lazuli.png",
  "/src/card-lab/assets/generated-sources/peinture-detail-v2.png",
  "/tests/browser/game-presentation.html",
]) {
  const r = await fetch(origin + path, { method: "HEAD" });
  assert.equal(r.status, 404, path);
  excluded.push({ path, status: r.status });
}
const report = {
  projectId: "muse-collection-6f2d",
  origin,
  version: after.release.version.name.split("/").at(-1),
  releaseTime: after.release.releaseTime,
  previousVersion: before.release.version.name.split("/").at(-1),
  sourceLabVersion: "3b5f3172d4865a5a",
  change:
    process.env.MUSE_CHANGE ||
    "Intégration des cartes et cadres détaillés, des sept pochettes et des animations validées ; acquisitions réelles et sauvegardes conservées.",
  expectedFiles: entries.length,
  checkedFiles: checks.length,
  verification: {
    method:
      "Tous les fichiers publiés téléchargés et vérifiés par SHA-256 contre le build local.",
    byteVerifiedFiles: checks.length,
    downloadedBytes: checks.reduce((n, c) => n + c.bytes, 0),
    retriedFiles: checks.filter((c) => c.attempt > 1).length,
  },
  failures,
  headers,
  excluded,
  labIsolation: {
    projectId: "muse-lab-6f2d",
    beforeVersion: labBefore.release.version.name.split("/").at(-1),
    afterVersion: labAfter.release.version.name.split("/").at(-1),
    sameRelease: true,
  },
  storage: {
    key: "muse-collection-v1",
    version: 1,
    legacyThreeCardResultsSupported: true,
    reset: false,
  },
};
await mkdir("catalog/game-presentation/publications", { recursive: true });
for (const path of [
  "catalog/game-presentation/publication.json",
  `catalog/game-presentation/publications/${report.version}.json`,
])
  await writeFile(path, JSON.stringify(report, null, 2) + "\n");
await writeFile(
  `catalog/game-presentation/publications/${report.version}-manifest.json`,
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
