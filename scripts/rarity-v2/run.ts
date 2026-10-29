import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseEngineConfig } from "../../src/rarity-engine/configuration";
import { simulateRarities } from "../../src/rarity-engine/calibration";
import type { Evidence, ReferenceCatalog } from "../../src/rarity-engine/types";
import { loadInputs } from "./inputs";
import { assertProtectedInputs, frozenWrite } from "./integrity";
import { sha256 } from "./http";
import { buildReports } from "./report";

export async function runSimulation(
  root: string,
  configurationFile = "catalog/rarity-v2/config-2.0.0.json",
) {
  const protectedHashes = await assertProtectedInputs(root);
  const configBytes = await readFile(path.resolve(root, configurationFile));
  const config = parseEngineConfig(JSON.parse(configBytes.toString()));
  const input = await loadInputs(root);
  const inputBytes = JSON.stringify(input.works, null, 2) + "\n";
  const codeFiles = [];
  for (const folder of ["src/rarity-engine", "scripts/rarity-v2"])
    for (const file of (await readdir(path.join(root, folder))).sort())
      if (file.endsWith(".ts")) codeFiles.push(`${folder}/${file}`);
  const implementationSources = Object.fromEntries(
    await Promise.all(
      codeFiles.map(async (file): Promise<[string, string]> => [
        file,
        await readFile(path.join(root, file), "utf8"),
      ]),
    ),
  );
  const implementationHashes = Object.fromEntries(
    Object.entries(implementationSources).map(([file, source]) => [
      file,
      sha256(source),
    ]),
  );
  let reference: ReferenceCatalog | undefined;
  let referenceBytes: Buffer | undefined;
  if (config.normalization.referenceFile) {
    referenceBytes = await readFile(
      path.resolve(root, config.normalization.referenceFile),
    );
    reference = JSON.parse(referenceBytes.toString());
  }
  const manifestBase = {
    algorithmVersion: config.algorithmVersion,
    configurationVersion: config.configurationVersion,
    configSha256: sha256(configBytes),
    inputsSha256: sha256(inputBytes),
    evidenceHashes: input.files,
    implementationHashes,
    referenceSha256: referenceBytes ? sha256(referenceBytes) : null,
    protectedHashes,
    period: input.period,
    days: input.days,
    languages: input.languages,
  };
  const runId = sha256(JSON.stringify(manifestBase)).slice(0, 24);
  const policyEvidence: Evidence = {
    id: sha256(configBytes).slice(0, 24),
    provider: "muse-editorial-policy",
    independentGroup: "muse-policy",
    url: `urn:muse:rarity:${config.configurationVersion}`,
    retrievedAt: config.issuedAt,
    file: `catalog/rarity-v2/runs/${runId}/config.json`,
    sha256: sha256(configBytes),
    tier: 3,
    scope: "policy",
  };
  const simulation = simulateRarities(input.works, config, {
    days: input.days,
    period: input.period,
    languages: input.languages,
    policyEvidence,
    reference,
  });
  const providers = Array.isArray(input.supplementary.providers)
    ? (input.supplementary.providers as {
        provider: string;
        status: string;
        note: string;
      }[])
    : [
        {
          provider: "met/cma/wikidata/pageviews",
          status: "used_archived_api",
          note: "Captures existantes réutilisées ; lancer collect pour l’état détaillé des connecteurs.",
        },
        {
          provider: "smithsonian/europeana/google-trends",
          status: "not_used",
          note: "Aucune capture exploitable fournie.",
        },
      ];
  const output = buildReports({
    runId,
    config,
    ...simulation,
    works: input.works,
    providers,
  });
  const payload = {
    runId,
    ...manifestBase,
    summary: output.summary,
    providerStates: providers,
    notes: [
      "Simulation seulement, aucune activation.",
      "Scores estimés explicitement étiquetés ; confiance heuristique et plages de plausibilité non statistiques.",
    ],
    ...simulation,
  };
  const resultsBytes = JSON.stringify(payload, null, 2) + "\n";
  const runFolder = path.join(root, "catalog/rarity-v2/runs", runId);
  const artifacts = {
    "results.json": resultsBytes,
    "results.csv": output.csv,
    "REPORT.md": output.markdown,
    "inputs.json": inputBytes,
    "config.json": configBytes.toString(),
    "implementation.json":
      JSON.stringify({ files: implementationSources }, null, 2) + "\n",
    ...(referenceBytes ? { "reference.json": referenceBytes.toString() } : {}),
  };
  const manifest = {
    runId,
    ...manifestBase,
    artifacts: Object.fromEntries(
      Object.entries(artifacts).map(([file, bytes]) => [file, sha256(bytes)]),
    ),
  };
  await assertProtectedInputs(root);
  for (const [file, bytes] of Object.entries(artifacts))
    await frozenWrite(path.join(runFolder, file), bytes);
  await frozenWrite(
    path.join(runFolder, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  const directory = path.join(root, "catalog/rarity-v2");
  await mkdir(directory, { recursive: true });
  for (const file of ["results.json", "results.csv", "REPORT.md"] as const)
    await writeFile(path.join(directory, file), artifacts[file]);
  await writeFile(
    path.join(directory, "latest.json"),
    JSON.stringify(
      { runId, manifest: `catalog/rarity-v2/runs/${runId}/manifest.json` },
      null,
      2,
    ) + "\n",
  );
  await assertProtectedInputs(root);
  return { runId, ...output.summary };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const root = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
  );
  const at = process.argv.indexOf("--config");
  const configFile = at < 0 ? undefined : process.argv[at + 1];
  if (at >= 0 && !configFile) throw new Error("Chemin --config requis.");
  const summary = await runSimulation(root, configFile);
  console.log(
    JSON.stringify(
      {
        runId: summary.runId,
        analyzed: summary.analyzed,
        proposed: summary.proposed,
        confirmed: summary.confirmed,
        provisional: summary.provisional,
        changed: summary.changed,
        stable: summary.stable,
        averageConfidence: summary.averageConfidence,
        masterpieceCandidates: summary.masterpieceCandidates,
        distribution: summary.distribution,
      },
      null,
      2,
    ),
  );
  console.log(
    "Rapport : catalog/rarity-v2/REPORT.md ; aucune migration effectuée.",
  );
}
