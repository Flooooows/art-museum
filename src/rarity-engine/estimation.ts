import { clamp } from "./normalization";
import { criterion, median } from "./scoring";
import {
  CRITERIA,
  type ArtworkInput,
  type CriteriaResults,
  type Criterion,
  type DirectResults,
  type EngineConfig,
  type Evidence,
} from "./types";

function era(work: ArtworkInput): string {
  const year = work.yearStart;
  if (year === null) return "unknown";
  return year < 0
    ? "ancient"
    : year < 1600
      ? "pre1600"
      : year < 1850
        ? "1600-1849"
        : year < 1950
          ? "1850-1949"
          : "1950+";
}

export function completeCriteria(
  work: ArtworkInput,
  allWorks: ArtworkInput[],
  direct: Map<string, DirectResults>,
  config: EngineConfig,
  policyEvidence: Evidence,
): CriteriaResults {
  const own = direct.get(work.id) ?? {};
  const completed: Partial<CriteriaResults> = { ...own };
  for (const key of CRITERIA) {
    if (own[key]) continue;
    const prior = config.estimation.priors[work.category][key];
    let mode = prior[1];
    const additions: string[] = [];
    let indirect = false;
    const extraEvidence: Evidence[] = [];
    if (key === "A" && work.creatorMode !== "identified") {
      const contextSpecificity =
        Number(!!work.context.trim()) * 3 +
        Number(work.yearStart !== null) * 3 +
        Number(work.creatorMode === "workshop") * 2;
      const signals = config.estimation.contextSignals;
      const contextSupport = Math.min(
        signals.maximumUplift,
        (work.institutionSignals.highlight === true
          ? signals.highlightUplift
          : 0) +
          (work.institutionSignals.citations !== null &&
          new Set(work.institutionSignals.citations.map((item) => item.key))
            .size >= signals.minimumScholarlyReferences
            ? signals.scholarlyUplift
            : 0) +
          (work.institutionSignals.exhibitions !== null &&
          new Set(work.institutionSignals.exhibitions.map((item) => item.key))
            .size >= signals.minimumExhibitions
            ? signals.exhibitionUplift
            : 0),
      );
      mode = Math.min(
        config.estimation.anonymousContextMaximum,
        mode + contextSpecificity + contextSupport,
      );
      if (contextSupport > 0) {
        indirect = true;
        extraEvidence.push(...work.institutionEvidence);
      }
      additions.push(
        `Contexte précis de l’objet (+${contextSpecificity}) et indices patrimoniaux spécifiques documentés (+${contextSupport}), sans audience d’une civilisation ni renommée entière d’un maître. Aucun score H/M imputé utilisé.`,
      );
    }
    if (key === "P") {
      const artist = own.A;
      if (artist && artist.type !== "estimated") {
        const lift = clamp(
          (artist.score - 40) * 0.2,
          0,
          config.estimation.maximumArtistPopularityUplift,
        );
        mode += lift;
        extraEvidence.push(...artist.evidence);
        indirect = true;
        additions.push(
          `Notoriété du créateur utilisée comme indice indirect limité (+${lift.toFixed(2)}), pas comme popularité entière de l’œuvre.`,
        );
      }
      if (work.institutionSignals.highlight === true) {
        const lift = config.estimation.maximumInstitutionPopularityUplift;
        mode += lift;
        extraEvidence.push(...work.institutionEvidence);
        indirect = true;
        additions.push(
          `Mise en avant officielle observée utilisée comme indice indirect limité (+${lift.toFixed(2)}) ; aucun score M imputé ni audience publique supposée mesurée.`,
        );
      }
    }
    const minimum =
      key === "P"
        ? config.estimation.minimumPopularityPeers
        : config.estimation.minimumPeers;
    const eligible = allWorks.filter((peer) => {
      if (
        peer.id === work.id ||
        peer.category !== work.category ||
        peer.identity.status !== "verified"
      )
        return false;
      if (
        key === "A" &&
        (peer.creatorMode === "identified") !==
          (work.creatorMode === "identified")
      )
        return false;
      const observation = direct.get(peer.id)?.[key];
      return (
        !!observation &&
        observation.type !== "estimated" &&
        observation.sourceQuality >= config.estimation.minimumPeerQuality
      );
    });
    const close = eligible.filter(
      (peer) => era(peer) === era(work) && era(work) !== "unknown",
    );
    const candidates = (close.length >= minimum ? close : eligible).sort(
      (a, b) => (a.id < b.id ? -1 : 1),
    );
    const peers = candidates.length >= minimum ? candidates : [];
    const scores = peers.map((peer) => direct.get(peer.id)![key]!.score);
    const peerWeight =
      peers.length / (peers.length + config.estimation.priorStrength);
    const peerMedian = scores.length ? median(scores) : null;
    const score = clamp(
      peerMedian === null
        ? mode
        : peerWeight * peerMedian + (1 - peerWeight) * mode,
    );
    const dispersion = scores.length
      ? median(scores.map((value) => Math.abs(value - peerMedian!))) * 1.4826
      : 0;
    const priorWidth = (prior[2] - prior[0]) / 2;
    const halfWidth = Math.max(
      config.estimation.minimumHalfWidth,
      dispersion,
      priorWidth * (1 - peerWeight * 0.35),
    );
    const peerEvidence = peers.flatMap((peer) =>
      direct.get(peer.id)![key]!.evidence.map((e) => ({
        ...e,
        tier: 3 as const,
        scope: "context" as const,
      })),
    );
    completed[key] = criterion({
      score,
      lower: Math.min(prior[0], score - halfWidth),
      upper: Math.max(prior[2], score + halfWidth),
      type: "estimated",
      method: peers.length
        ? "comparable-median-shrunk-to-declared-prior"
        : indirect
          ? "attenuated-indirect-context-estimate"
          : "declared-contextual-prior",
      sourceTier: indirect ? 2 : 3,
      sourceQuality: peers.length
        ? Math.min(0.55, 0.3 + 0.02 * peers.length)
        : indirect
          ? 0.4
          : 0.25,
      observedShare: 0,
      evidence: [
        policyEvidence,
        ...work.institutionEvidence.map((e) => ({
          ...e,
          tier: 3 as const,
          scope: "context" as const,
        })),
        ...extraEvidence,
        ...peerEvidence,
      ],
      rawIndicators: {
        priorMode: prior[1],
        adjustedPriorMode: mode,
        peerCount: peers.length,
        eligiblePeers: candidates.length,
        peerMedian,
        medianAbsoluteDeviation: dispersion,
        priorWeight: 1 - peerWeight,
      },
      comparableIds: peers.map((peer) => peer.id),
      notes: [
        config.estimation.rationale,
        ...additions,
        peers.length
          ? `Comparables ${close.length >= minimum ? "même catégorie et époque" : "même catégorie, époque élargie"}, médiane rétractée ; exclusion de soi et des valeurs déjà estimées.`
          : `Groupe insuffisant (${candidates.length}/${minimum}) : distribution initiale explicite, pas médiane prétendument apprise.`,
        "Estimation contextualisée et bornes de plausibilité ; ni mesure réelle ni absence de popularité prouvée.",
      ],
    });
  }
  return completed as CriteriaResults;
}
