import {
  CRITERIA,
  type ArtworkInput,
  type EngineConfig,
  type RarityResult,
} from "../../src/rarity-engine/types";

const decimal = (value: number) => value.toFixed(1).replace(".", ",");
const safe = (value: string) =>
  value.replaceAll("|", "\\|").replaceAll("\n", " ");
const csv = (value: unknown) =>
  `"${String(value ?? "").replaceAll('"', '""')}"`;

export function summarize(
  results: RarityResult[],
  rejected: { artworkId: string; reasons: string[] }[],
  config: EngineConfig,
) {
  const changed = results.filter(
    (result) => result.rarityLevel !== result.activeLevel,
  );
  return {
    analyzed: results.length + rejected.length,
    proposed: results.length,
    confirmed: results.filter((result) => result.status === "confirmed").length,
    provisional: results.filter((result) => result.status === "provisional")
      .length,
    rejected: rejected.length,
    changed: changed.length,
    stable: results.filter((result) => result.stableClassification).length,
    masterpieceCandidates: results
      .filter((result) => result.masterpieceCandidate)
      .map((result) => result.artworkId),
    averageConfidence: results.length
      ? results.reduce((sum, result) => sum + result.confidenceScore, 0) /
        results.length
      : 0,
    confidenceBands: {
      low: results.filter((result) => result.confidenceScore < 0.5).length,
      medium: results.filter(
        (result) =>
          result.confidenceScore >= 0.5 && result.confidenceScore < 0.75,
      ).length,
      high: results.filter((result) => result.confidenceScore >= 0.75).length,
    },
    criterionCoverage: Object.fromEntries(
      CRITERIA.map((key) => [
        key,
        {
          observed: results.filter(
            (result) => result.criteria[key].type === "observed",
          ).length,
          derived: results.filter(
            (result) => result.criteria[key].type === "derived",
          ).length,
          estimated: results.filter(
            (result) => result.criteria[key].type === "estimated",
          ).length,
          averageObservedShare: results.length
            ? results.reduce(
                (sum, result) => sum + result.criteria[key].observedShare,
                0,
              ) / results.length
            : 0,
        },
      ]),
    ),
    distribution: config.rarities.map((rarity, level) => ({
      rarity,
      active: results.filter((result) => result.activeLevel === level).length,
      proposed: results.filter((result) => result.rarityLevel === level).length,
    })),
    highUncertainty: results
      .filter(
        (result) =>
          result.scoreInterval.upper - result.scoreInterval.lower >= 40 ||
          result.confidenceScore < 0.5,
      )
      .map((result) => result.artworkId),
  };
}

export function buildReports(data: {
  runId: string;
  config: EngineConfig;
  results: RarityResult[];
  rejected: { artworkId: string; reasons: string[] }[];
  works: ArtworkInput[];
  providers: { provider: string; status: string; note: string }[];
}) {
  const { results, config, providers } = data;
  const summary = summarize(results, data.rejected, config);
  const changed = results.filter(
    (result) => result.rarityLevel !== result.activeLevel,
  );
  const headings = [
    "artworkId",
    "title",
    "category",
    "creatorMode",
    "activeRarity",
    "v2Rarity",
    "score",
    "lower",
    "upper",
    "confidence",
    "status",
    "stable",
    "estimatedCriteria",
    ...CRITERIA.flatMap((key) => [
      `${key}_score`,
      `${key}_type`,
      `${key}_method`,
    ]),
    "reviewReasons",
  ];
  const rows = results.map((result) =>
    [
      result.artworkId,
      result.title,
      result.category,
      result.creatorMode,
      config.rarities[result.activeLevel],
      result.rarity,
      result.notorietyScore,
      result.scoreInterval.lower,
      result.scoreInterval.upper,
      result.confidenceScore,
      result.status,
      result.stableClassification,
      CRITERIA.filter((key) => result.criteria[key].type === "estimated").join(
        "/",
      ),
      ...CRITERIA.flatMap((key) => [
        result.criteria[key].score,
        result.criteria[key].type,
        result.criteria[key].method,
      ]),
      result.reviewReasons.join(" ; "),
    ]
      .map(csv)
      .join(","),
  );
  const tableRow = (result: RarityResult) =>
    `| ${result.artworkId} | ${safe(result.title)} | ${config.rarities[result.activeLevel]} → ${result.rarity} | ${decimal(result.notorietyScore)} | ${decimal(result.scoreInterval.lower)}–${decimal(result.scoreInterval.upper)} | ${decimal(result.confidenceScore * 100)} % | ${result.status} | ${CRITERIA.filter((key) => result.criteria[key].type === "estimated").join(", ")} |`;
  const interesting = [
    "mona-lisa",
    "45434",
    "436105",
    "437654",
    "544227",
    "cma-136510",
    "544453",
    "cma-93984",
    "cma-147518",
    "cma-130939",
    "cma-150156",
    "cma-93173",
  ];
  const cases = interesting
    .map((id) => results.find((result) => result.artworkId === id))
    .filter((result): result is RarityResult => !!result)
    .map((result) => {
      const input = data.works.find((work) => work.id === result.artworkId)!;
      const details = CRITERIA.map((key) => {
        const c = result.criteria[key];
        return `- **${key} ${decimal(c.score)} · ${c.type}** — ${c.method}. ${c.notes[0]} Sources : ${[...new Set(c.evidence.map((e) => e.url))].map((url) => `<${url}>`).join(" ; ")}.`;
      }).join("\n");
      return `### ${result.title}\n\n${config.rarities[result.activeLevel]} → **${result.rarity}**, score proposé ${decimal(result.notorietyScore)}, plage ${decimal(result.scoreInterval.lower)}–${decimal(result.scoreInterval.upper)}, confiance ${decimal(result.confidenceScore * 100)} %, **${result.status}**. Ancien essai : ${result.exploratoryScore === null ? "incomplet" : decimal(result.exploratoryScore)}.\n\nIdentité : ${input.identity.reasons.join(" ")} Auteur/contexte : ${input.creatorMode} — ${safe(input.context)}.\n\n${details}\n\nSensibilité : ${result.sensitivity.map((s) => `${s.profile} ${decimal(s.score)} (${config.rarities[s.level]})`).join(" ; ")}.\n\nRevue : ${result.reviewReasons.join(" ; ") || "Aucun drapeau automatique ; aucune activation pour autant."}\n`;
    })
    .join("\n");
  const markdown = `# MUSE Rarity Engine ${config.algorithmVersion} — simulation\n\nExécution **${data.runId}**, configuration **${config.configurationVersion}**. Aucune migration, aucun changement de rareté active, prix, inventaire ou taux de pochette.\n\n## Résumé\n\n- Œuvres analysées : **${summary.analyzed}** ; propositions : **${summary.proposed}** ; refus explicites : **${summary.rejected}**.\n- Classements : **${summary.confirmed} confirmed**, **${summary.provisional} provisional**. Confirmed qualifie la robustesse de la simulation, jamais une autorisation de publication.\n- Changements proposés par rapport aux niveaux actifs : **${summary.changed}** ; niveaux stables dans les scénarios : **${summary.stable}**.\n- Confiance moyenne : **${decimal(summary.averageConfidence * 100)} %**. Faible (<50 %) ${summary.confidenceBands.low}, intermédiaire (50–75 %) ${summary.confidenceBands.medium}, élevée (≥75 %) ${summary.confidenceBands.high}. Ce sont des indices heuristiques, pas probabilités d’exactitude.\n- Candidatures Pièce maîtresse à relire : **${summary.masterpieceCandidates.join(", ") || "aucune"}**.\n\n## Répartition et couverture\n\n| Rareté | Active (V1) | Proposition V2 |\n|---|---:|---:|\n${summary.distribution.map((row) => `| ${row.rarity} | ${row.active} | ${row.proposed} |`).join("\n")}\n\n| Critère | Observé | Dérivé | Estimé | Part d’entrées observées pondérée dans le critère |\n|---|---:|---:|---:|---:|\n${CRITERIA.map(
    (key) => {
      const c = summary.criterionCoverage[key];
      return `| ${key} | ${c.observed} | ${c.derived} | ${c.estimated} | ${decimal(c.averageObservedShare * 100)} % |`;
    },
  ).join(
    "\n",
  )}\n\nTous les critères ont une proposition, mais cela ne constitue pas 100 % de couverture observée. Les audiences normalisées sont dérivées de compteurs observés ; les appréciations éditoriales et imputations restent estimées.\n\n## Sources réellement exploitées\n\n| Fournisseur | État | Usage / limite |\n|---|---|---|\n${providers.map((p) => `| ${p.provider} | ${p.status} | ${safe(p.note)} |`).join("\n")}\n\nLes captures réutilisées gardent leur date originale. Les notices d’institution, identités et mesures mensuelles sont liées à leurs fichiers/empreintes dans les résultats et le manifeste. Les sources répétées ou miroirs d’une institution ne multiplient pas la confiance.\n\n## Méthode et limites\n\n**S = 0,25P + 0,20A + 0,25H + 0,20M + 0,10C** ; seuils ${config.thresholds.join("/")}. Poids, distributions, normalisation et confirmation sont configurables/versionnés. Les poids ne sont jamais renormalisés sur les seules données disponibles.\n\n${config.normalization.rationale}\n\nPerspectives globales et catégorielles présentes dans chaque résultat. Ici ${config.normalization.mode === "provisional" ? "aucun référentiel externe représentatif n’est fourni : les échelles par catégorie sont neutres, donc aucun rang catégoriel empirique n’est prétendu. Une variante de poids patrimoine et deux variantes de courbe testent néanmoins la stabilité." : "les percentiles reposent sur le référentiel figé contrôlé dans le manifeste, jamais les seules cibles."}\n\n${config.estimation.rationale}\n\n${config.indicators.rationale}\n\nPour les objets sans bibliographie structurée, l’absence d’exposition/publication n’est pas supposée : les composantes imputées de M et leur incertitude sont explicites. Les priors sont des distributions éditoriales initiales non apprises ; ils empêchent un blocage tout en abaissant la confiance. Les comparables viennent de notes non imputées de catégorie/époque proche, sont rétractés vers ces distributions, exposent leurs identifiants et excluent l’objet lui-même. Ils ne constituent pas un référentiel mondial. Les tableaux riches de Cleveland peuvent favoriser leurs indices documentaires : une comparaison inter-institutions exige une revue.\n\nL’indice H documentaire n’est pas une mesure de l’innovation ou de l’influence réelle. Une grande bibliographie ne suffit pas à confirmer un classement. C n’est pas déduit des backlinks ou d’une quantité de pages. L’audience commerciale de maisons créatrices est signalée. A contextualisé n’importe aucune popularité entière d’une civilisation ou d’un sujet représenté. Aucune popularité de série n’est transférée ; seule l’exception de composition identique déjà revue de La Grande Vague est conservée.\n\nLes bornes sont des **plages de plausibilité conditionnelles**, sommées avec les mêmes poids, sans hypothèse d’indépendance ; elles ne sont pas des intervalles de confiance statistiques. La confiance combine couverture, qualité, identité, part observée, largeur des plages et cohérence. Les estimations majoritaires la plafonnent ; une plage qui traverse un seuil ou un classement instable impose provisional.\n\n## Comparaison des cent œuvres\n\n| ID | Œuvre | Actif → V2 | Score proposé | Plage | Confiance | Statut | Critères estimés |\n|---|---|---|---:|---:|---:|---|---|\n${results.map(tableRow).join("\n")}\n\n## Changements qui demanderaient une validation explicite\n\n${changed.map((result) => `- **${result.title}** (${result.artworkId}) : ${config.rarities[result.activeLevel]} → ${result.rarity} ; ${result.status}, confiance ${decimal(result.confidenceScore * 100)} %.`).join("\n") || "Aucun changement."}\n\n## Cas étudiés\n\n${cases}\n\n## Incertitudes fortes et refus\n\nIncertitude particulièrement élevée : ${summary.highUncertainty.join(", ") || "aucune selon les seuils configurés"}.\n\n${data.rejected.map((row) => `- ${row.artworkId} : ${row.reasons.join(" ; ")}`).join("\n") || "Aucun refus d’identité dans les cent œuvres disposant déjà de notices précises. Une entrée ambiguë ou sans métadonnées minimales est refusée par le moteur, pas remplie arbitrairement."}\n\n## Reproduire\n\nCollecte avec cache : \`npm run rarity:v2:collect\` ; complément autorisé : \`npm run rarity:v2:collect -- --live\`. Calcul sans réseau : \`npm run rarity:v2\`. Configuration alternative : \`npm run rarity:v2 -- --config chemin.json\`. Vérification : \`npm run rarity:v2:verify\`.\n\nLes résultats détaillés JSON/CSV et le manifeste sont dans le même dossier d’exécution ; inputs.json et config.json permettent l’inspection. L’identifiant dépend des entrées, preuves, configuration et code. Les exécutions figées ne sont jamais écrasées avec un contenu différent. Les résultats actifs et l’ancien essai à quatre scores complets restent intégralement conservés.\n`;
  return {
    summary,
    csv: [headings.join(","), ...rows].join("\n") + "\n",
    markdown,
  };
}
