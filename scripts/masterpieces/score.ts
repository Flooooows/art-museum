import { readFile } from "node:fs/promises";
import { loadInputs } from "../rarity-v2/inputs";
import { sha256 } from "../rarity-v2/http";
import { parseEngineConfig } from "../../src/rarity-engine/configuration";
import { scoreDirect } from "../../src/rarity-engine/scoring";
import { completeCriteria } from "../../src/rarity-engine/estimation";
import {
  confidenceFor,
  rarityLevel,
  validationReasons,
  weightedInterval,
} from "../../src/rarity-engine/validation";
import {
  CRITERIA,
  type ArtworkInput,
  type Evidence,
} from "../../src/rarity-engine/types";
import type { ReviewArtwork, ReviewLevel } from "../../src/review/types";

export async function createScorer() {
  const historical = await loadInputs(process.cwd());
  const file = "catalog/rarity-v2/config-2.0.0.json";
  const bytes = await readFile(file);
  const config = parseEngineConfig(JSON.parse(bytes.toString()));
  const policy: Evidence = {
    id: sha256(bytes).slice(0, 24),
    provider: "muse-editorial-policy",
    independentGroup: "muse-policy",
    url: `urn:muse:rarity:${config.configurationVersion}`,
    retrievedAt: config.issuedAt,
    file,
    sha256: sha256(bytes),
    tier: 3,
    scope: "policy",
  };
  const peers = new Map(
    config.sensitivity.normalizationScales.map((scale) => [
      scale,
      new Map(
        historical.works.map((w) => [
          w.id,
          scoreDirect(w, config, historical.days, undefined, scale),
        ]),
      ),
    ]),
  );
  const propose = (work: ArtworkInput): ReviewArtwork["proposal"] => {
    const at = (scale: number) => {
      const direct = new Map(peers.get(scale)!);
      direct.set(work.id, scoreDirect(work, config, 365, undefined, scale));
      return completeCriteria(work, historical.works, direct, config, policy);
    };
    const criteria = at(1),
      total = weightedInterval(criteria, config),
      level = rarityLevel(total.score, config);
    const stable =
      config.sensitivity.normalizationScales.every(
        (scale) =>
          rarityLevel(
            weightedInterval(scale === 1 ? criteria : at(scale), config).score,
            config,
          ) === level,
      ) &&
      Object.values(config.sensitivity.weightProfiles).every(
        (weights) =>
          rarityLevel(
            weightedInterval(criteria, { ...config, weights }).score,
            config,
          ) === level,
      );
    const confidence = confidenceFor(work, criteria, config);
    const reasons = validationReasons(
      work,
      criteria,
      total,
      total.score,
      confidence,
      stable,
      config,
    );
    return {
      score: total.score,
      level: level as ReviewLevel,
      interval: { lower: total.lower, upper: total.upper },
      confidence: confidence.score,
      stable,
      reasons,
      status: reasons.length ? "provisional" : "confirmed",
      criteria: Object.fromEntries(
        CRITERIA.map((key) => {
          const c = criteria[key];
          return [
            key,
            {
              score: c.score,
              lower: c.lower,
              upper: c.upper,
              type: c.type,
              method: c.method,
              notes: c.notes,
              sourceUrls: [
                ...new Set(
                  c.evidence
                    .filter((e) => e.url.startsWith("https://"))
                    .map((e) => e.url),
                ),
              ],
              comparableIds: c.comparableIds,
            },
          ];
        }),
      ) as ReviewArtwork["proposal"]["criteria"],
    };
  };
  return Object.assign(propose, {
    referenceFiles: { ...historical.files, [file]: sha256(bytes) },
    algorithmVersion: config.algorithmVersion,
    configurationVersion: config.configurationVersion,
  });
}
