import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertProtectedInputs } from "./integrity";
import { runSimulation } from "./run";
import { sha256 } from "./http";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const paths = ["results.json", "results.csv", "REPORT.md", "latest.json"];
const hashes = async () =>
  Object.fromEntries(
    await Promise.all(
      paths.map(async (file) => [
        file,
        sha256(await readFile(path.join(root, "catalog/rarity-v2", file))),
      ]),
    ),
  );
await assertProtectedInputs(root);
const at = process.argv.indexOf("--config");
const configFile = at < 0 ? undefined : process.argv[at + 1];
if (at >= 0 && !configFile) throw new Error("Chemin --config requis.");
const first = await runSimulation(root, configFile);
const before = await hashes();
const second = await runSimulation(root, configFile);
const after = await hashes();
if (
  first.runId !== second.runId ||
  JSON.stringify(before) !== JSON.stringify(after)
)
  throw new Error("Simulation non reproductible.");
const manifest = JSON.parse(
  await readFile(
    path.join(root, "catalog/rarity-v2/runs", first.runId, "manifest.json"),
    "utf8",
  ),
) as {
  artifacts: Record<string, string>;
  evidenceHashes: Record<string, string>;
};
for (const [file, expected] of Object.entries(manifest.artifacts))
  if (
    sha256(
      await readFile(
        path.join(root, "catalog/rarity-v2/runs", first.runId, file),
      ),
    ) !== expected
  )
    throw new Error(`Artefact altéré : ${file}`);
for (const [file, expected] of Object.entries(manifest.evidenceHashes))
  if (sha256(await readFile(path.join(root, file))) !== expected)
    throw new Error(`Preuve altérée : ${file}`);
await assertProtectedInputs(root);
await writeFile(
  path.join(root, "catalog/rarity-v2/verification.json"),
  JSON.stringify(
    {
      runId: first.runId,
      reproducible: true,
      protectedInputsUnchanged: true,
      outputHashes: after,
      summary: second,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Exécution ${first.runId} identique sur deux calculs hors réseau ; artefacts, preuves et entrées protégées vérifiés.`,
);
