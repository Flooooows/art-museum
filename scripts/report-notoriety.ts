import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  calculateNotoriety,
  normalizeDailyViews,
  NOTORIETY_THRESHOLDS,
  NOTORIETY_WEIGHTS,
  type NotorietyCriterion,
  type NotorietyScores,
} from "../src/catalog/notoriety";
import { parseCatalog, activeAssessment } from "../src/catalog/model";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const directory = path.join(root, "catalog/notoriety");
const seedBytes = await readFile(path.join(root, "src/catalog/seed.json"));
const seed = parseCatalog(JSON.parse(seedBytes.toString()));
const seedSha256 = createHash("sha256").update(seedBytes).digest("hex");
interface Audience {
  qid: string;
  identityAvailable: boolean;
  identityEvidence: string;
  pages: {
    status: string;
    views: number | null;
    url?: string;
    evidence: string[];
  }[];
}
interface Observation {
  id: string;
  objectQid: string | null;
  sourceUrl: string;
  institutionEvidence: string;
  audienceScope: string;
  workAudience: Audience | null;
  creatorStatus: string;
  artistAudiences: Audience[];
  institutionSignals: Record<string, unknown>;
}
const observations: {
  seedSha256: string;
  period: { start: string; end: string; days: number };
  works: Observation[];
} = JSON.parse(
  await readFile(path.join(directory, "observations.json"), "utf8"),
);
const reviews: {
  rubricVersion: string;
  assessedAt: string;
  institutionBaseline: { score: number; reason: string };
  works: Record<
    string,
    Partial<
      Record<
        NotorietyCriterion,
        { score: number; reason: string; sources: string[] }
      >
    >
  >;
} = JSON.parse(
  await readFile(path.join(directory, "editorial-review.json"), "utf8"),
);
if (observations.seedSha256 !== seedSha256)
  throw new Error("Le catalogue a changé depuis la collecte.");
if (
  observations.works.length !== seed.works.length ||
  new Set(observations.works.map((w) => w.id)).size !== seed.works.length ||
  observations.works.some((o) => !seed.works.some((w) => w.id === o.id))
)
  throw new Error(
    "La collecte doit couvrir exactement les cent identifiants uniques.",
  );
for (const [id, review] of Object.entries(reviews.works)) {
  if (!seed.works.some((w) => w.id === id))
    throw new Error(`Revue inconnue : ${id}`);
  for (const [criterion, item] of Object.entries(review)) {
    if (
      !["H", "M", "C"].includes(criterion) ||
      !item.sources.length ||
      !item.reason.trim() ||
      !item.sources.every((url) => new URL(url).protocol === "https:")
    )
      throw new Error(
        `Revue non sourcée ou critère non éditorial : ${id}/${criterion}`,
      );
  }
}

function audienceViews(audience: Audience | null): number | null {
  if (
    !audience?.identityAvailable ||
    !audience.pages.length ||
    audience.pages.some((p) => p.status !== "measured" || p.views === null)
  )
    return null;
  return audience.pages.reduce((sum, page) => sum + page.views!, 0);
}
function metrics(observation: Observation, anchor = 1000) {
  const workViews = audienceViews(observation.workAudience);
  const artists = observation.artistAudiences.map(audienceViews);
  return {
    P:
      workViews === null
        ? null
        : normalizeDailyViews(workViews, observations.period.days, anchor),
    A:
      observation.creatorStatus !== "identified" ||
      !artists.length ||
      artists.some((v) => v === null)
        ? null
        : artists.reduce<number>(
            (sum, value) =>
              sum +
              normalizeDailyViews(value!, observations.period.days, anchor),
            0,
          ) / artists.length,
  };
}
const labels = ["Esquisse", "Étude", "Composition", "Œuvre", "Pièce maîtresse"];
const works = seed.works.map((work) => {
  const observation = observations.works.find((o) => o.id === work.id)!;
  const review = reviews.works[work.id] ?? {};
  const scores: NotorietyScores = {
    ...metrics(observation),
    H: review.H?.score ?? null,
    M: review.M?.score ?? reviews.institutionBaseline.score,
    C: review.C?.score ?? null,
  };
  const baselineEvidence = seed.images.find(
    (image) => image.workId === work.id && image.primary,
  )?.rights.verification?.evidenceFile;
  if (
    baselineEvidence !== observation.institutionEvidence ||
    !seed.museums.some((museum) => museum.id === work.museumId)
  )
    throw new Error(`Notice institutionnelle non reliée : ${work.id}`);
  const calculation = calculateNotoriety(scores);
  const activeLevel = activeAssessment(seed, work.id)!.level;
  return {
    id: work.id,
    title: work.title,
    creator: work.creatorDisplayName,
    activeLevel,
    activeRarity: labels[activeLevel],
    status:
      calculation.total === null ? "incomplete" : "exploratory_not_validated",
    scores,
    calculation,
    proposedRarity:
      calculation.level === null ? null : labels[calculation.level],
    possibleRarities: calculation.possibleLevels.map((level) => labels[level]),
    missingReasons: {
      ...(scores.P === null
        ? {
            P: !observation.objectQid
              ? "Identité Wikidata de l’objet à résoudre ; aucune audience supposée."
              : !observation.workAudience?.identityAvailable
                ? "Réponse d’identité Wikidata indisponible ; aucune conclusion sur l’existence d’un article."
                : observation.workAudience.pages.length
                  ? "Audience indisponible ou incomplète sur au moins une page fr/en."
                  : "Aucune page fr/en propre à l’objet identifiée dans les liens Wikidata ; pas de transfert depuis une série.",
          }
        : {}),
      ...(scores.A === null
        ? {
            A:
              observation.creatorStatus !== "identified"
                ? "Identité de l’auteur non résolue de façon sûre ou attribution incertaine ; pas de substitution par le maître, le sujet ou la civilisation."
                : "Audience de l’auteur indisponible ou incomplète.",
          }
        : {}),
      ...(scores.H === null
        ? {
            H: "Influence historique de cet objet à apprécier avec des sources spécifiques ; non déduite de l’ancienneté.",
          }
        : {}),
      ...(scores.C === null
        ? {
            C: "Références culturelles à cet objet non évaluées ; absence de preuve ≠ absence de diffusion.",
          }
        : {}),
    },
    audienceScope: observation.audienceScope,
    objectQid: observation.objectQid,
    annualWorkViews: audienceViews(observation.workAudience),
    artistAnnualViews: observation.artistAudiences.map((a) => ({
      qid: a.qid,
      views: audienceViews(a),
    })),
    editorialEvidence: {
      M: review.M ?? {
        ...reviews.institutionBaseline,
        sources: [observation.sourceUrl],
      },
      ...review,
    },
    institutionEvidence: observation.institutionEvidence,
    institutionSignals: observation.institutionSignals,
    audienceEvidence: [observation.workAudience, ...observation.artistAudiences]
      .filter((a): a is Audience => a !== null)
      .flatMap((a) => [
        a.identityEvidence,
        ...a.pages.flatMap((p) => p.evidence),
      ])
      .filter(Boolean),
    sensitivity: [100, 1000, 10000].map((anchor) => ({
      dailyViewsFor100: anchor,
      ...calculateNotoriety({ ...scores, ...metrics(observation, anchor) }),
    })),
  };
});
const countLevels = (levels: number[]) =>
  labels.map((label, level) => ({
    label,
    count: levels.filter((value) => value === level).length,
  }));
const complete = works.filter((work) => work.calculation.level !== null);
const sensitivityTable = complete
  .map(
    (work) =>
      `| ${escapeForTable(work.title)} | ${work.sensitivity.map((s) => `${s.total!.toFixed(2)} · ${labels[s.level!]}`).join(" | ")} |`,
  )
  .join("\n");
function escapeForTable(value: string) {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}
const report = {
  rubricVersion: reviews.rubricVersion,
  reference: "MUSE_systeme_rarete.md",
  mode: "Simulation Wikimedia seule pour P/A, appréciations éditoriales H/M/C ; pas une validation de notoriété ni un changement actif.",
  period: observations.period,
  seedSha256,
  weights: NOTORIETY_WEIGHTS,
  thresholds: NOTORIETY_THRESHOLDS,
  normalization:
    "min(100, 100 × ln(1 + vues humaines fr/en cumulées / 365) / ln(1001)) ; pour A moyenne des notes des créateurs identifiés. Ancre exploratoire fixe de 1000 vues/jour ; pas un percentile du catalogue.",
  missingPolicy:
    "Null reste inconnu. Pas de zéro imputé, renormalisation des poids ni transfert depuis une série. Bornes = notes connues + chaque critère absent dans [0,100].",
  limits: [
    "Google Trends non collecté ; P est un proxy Wikipédia, pas le P Internet complet de la référence.",
    "H/M/C sont des appréciations éditoriales, pas des mesures automatisées ni un panel représentatif.",
    "Ancre de 1000 vues/jour conventionnelle ; sensibilité 100/1000/10000 fournie, sans ajustement pour atteindre un quota.",
    "Pas d’agrégation des anciens titres Wikipédia ; les changements de page et langues absentes peuvent sous-estimer les consultations.",
    "Un auteur anonyme reste inconnu : la formule nécessite une décision éditoriale sur les objets sans auteur, pas une pénalité silencieuse.",
    "L’audience d’une maison ou firme (par exemple Tiffany & Co.) peut venir de ses activités commerciales, pas seulement de sa création artistique ; ce proxy A exige une revue avant activation.",
    "Les compteurs de citations et expositions sont des indices à examiner, pas des scores H/C automatiques.",
  ],
  summary: {
    works: works.length,
    completeExploratoryScores: complete.length,
    incomplete: works.length - complete.length,
    availableCriteria: Object.fromEntries(
      Object.keys(NOTORIETY_WEIGHTS).map((key) => [
        key,
        works.filter((w) => w.scores[key as NotorietyCriterion] !== null)
          .length,
      ]),
    ),
    activeDistribution: countLevels(works.map((work) => work.activeLevel)),
    completeSubsetDistribution: countLevels(
      complete.map((work) => work.calculation.level!),
    ),
    unchangedActiveCatalog: true,
  },
  works,
};
await writeFile(
  path.join(directory, "results.json"),
  JSON.stringify(report, null, 2) + "\n",
);
const number = (value: number | null) =>
  value === null ? "—" : value.toFixed(2);
const escape = (value: string) =>
  value.replaceAll("|", "\\|").replaceAll("\n", " ");
const table = works
  .map(
    (w) =>
      `| ${w.id} | ${escape(w.title)} | ${w.activeRarity} | ${number(w.scores.P)} | ${number(w.scores.A)} | ${number(w.scores.H)} | ${number(w.scores.M)} | ${number(w.scores.C)} | ${w.calculation.total === null ? `${number(w.calculation.minimum)}–${number(w.calculation.maximum)}` : number(w.calculation.total)} | ${w.proposedRarity ?? `Indéterminée (${w.calculation.missing.join(", ")})`} |`,
  )
  .join("\n");
const highlights = works
  .filter((w) =>
    ["mona-lisa", "45434", "436105", "544227", "cma-136510"].includes(w.id),
  )
  .map(
    (w) =>
      `- **${w.title}** : ${w.calculation.total === null ? `score incomplet, bornes ${number(w.calculation.minimum)}–${number(w.calculation.maximum)} ; manque ${w.calculation.missing.join(", ")}` : `${number(w.calculation.total)}/100 → ${w.proposedRarity}`} (actif : ${w.activeRarity}).`,
  )
  .join("\n");
const markdown = `# Recalcul exploratoire des 100 œuvres MUSE\n\n## Résultat\n\n${works.length} œuvres examinées ; **${complete.length} scores exploratoires complets**, **${works.length - complete.length} incomplets**. Le catalogue actif reste inchangé. Une fourchette n’est ni une note attribuée ni un intervalle statistique de confiance.\n\nRépartition active : ${report.summary.activeDistribution.map((x) => `${x.label} ${x.count}`).join(" · ")}. La répartition du seul sous-ensemble complet ne doit pas être présentée comme celle des cent œuvres.\n\nCouverture : ${Object.entries(
  report.summary.availableCriteria,
)
  .map(([key, count]) => `${key} ${count}/100`)
  .join(
    " · ",
  )}.\n\n${highlights}\n\n## Méthode appliquée\n\nRéférence : [MUSE_systeme_rarete.md](../../MUSE_systeme_rarete.md). Formule **S = 0,30P + 0,25A + 0,20H + 0,15M + 0,10C**. Entrées sur 100 ; seuils de simulation **40/60/75/90** ; noms MUSE conservés. L’ancienne grille active 30/50/70/90 n’est pas migrée.\n\nMesures : consultations Wikipédia humaines, fr/en, all-access, du **${observations.period.start} au ${observations.period.end}**, douze mois complets. Les identités viennent des notices muséales et de Wikidata ; La Joconde Q12418 est une correspondance explicitement identifiée. La Grande Vague utilise Q252485 (composition) à partir de l’impression du Met Q28912605 : même image gravée, pas toute la série des Trente-six vues. Aucun autre lien de série n’est utilisé pour hériter d’une audience.\n\nNormalisation : ${report.normalization}\n\n**P est ici une variante Wikimedia seule**, Google Trends n’étant pas disponible sous forme d’un export comparable ; ne pas présenter cette simulation comme la méthode Internet complète. Une page absente n’a pas un compteur de zéro. Les réponses HTTP indisponibles sont distinctes des vraies audiences nulles. Si une page existante n’a pas ses douze mois, le critère reste inconnu.\n\nH/M/C sont appréciés dans [editorial-review.json](editorial-review.json), avec raisons et sources. Pour M, le palier exploratoire commun de 50 correspond exclusivement à la présence de cet objet dans l’une des trois grandes collections et à sa notice publique ; des notes supérieures nécessitent une revue explicite. La présence au musée n’entraîne aucune note H ou C. Pour les autres H/C non revus, la valeur reste inconnue, sans estimation inventée.\n\nLes bornes sont la somme pondérée connue, puis cette somme augmentée du poids maximal des critères absents ; les poids ne sont jamais renormalisés. Une borne basse n’est pas un score « pessimiste » à activer. La sensibilité à trois ancres d’audience (100/1000/10000 par jour) figure dans results.json. Aucun classement ne doit être validé sur la seule précision arithmétique du résultat.\n\n## Les cent résultats\n\n« — » signifie inconnu ; toutes les notes numériques de H/M/C sont éditoriales. Les colonnes sont arrondies pour lecture seulement ; classement depuis les valeurs non arrondies.\n\n| Identifiant | Œuvre | Actif | P | A | H | M | C | Score ou bornes /100 | Résultat de simulation |\n|---|---|---|---:|---:|---:|---:|---:|---:|---|\n${table}\n\n## Limites et suite\n\n${report.limits.map((limit) => `- ${limit}`).join("\n")}\n\nCompléter les preuves H/C des œuvres non revues, résoudre les cas d’auteurs anonymes ou d’attribution, définir puis comparer un export Google Trends homogène et faire relire les cas proches des seuils. Ensuite seulement proposer une activation versionnée. Aucun quota de rareté n’est imposé. Les droits des images, sauvegardes, cadres et taux 56,1/25,5/15/3/0,4 restent inchangés.\n\n## Reproduire\n\nCollecte réseau : \`python3 scripts/collect-notoriety.py\` (cache réutilisé, interruptions/limitations conservées). Calcul sans réseau : \`npm run catalog:notoriety\`. Résultats détaillés : [JSON](results.json), [CSV](results.csv), [observations](observations.json) ; chaque mesure pointe vers une réponse brute datée dans evidence/. Relancer le calcul n’actualise pas les audiences et n’écrit jamais dans seed.json.\n`;
const sensitivitySection = `\n\n## Sensibilité de la calibration\n\nL’ancre indique l’audience quotidienne donnant 100 à P/A. Les autres appréciations restent identiques. Ces variantes ne sont pas trois mesures différentes : elles montrent la dépendance du classement à un choix encore à valider.\n\n| Œuvre | Ancre 100 vues/j | Ancre 1000 vues/j (simulation principale) | Ancre 10000 vues/j |\n|---|---|---|---|\n${sensitivityTable}\n\nUn résultat 100 signifie ici saturation du barème, pas reconnaissance par 100 % du public. Une bascule de niveau entre variantes impose une revue de calibration avant activation.`;
await writeFile(
  path.join(directory, "REPORT.md"),
  markdown.replace(
    "\n\n## Les cent résultats",
    `${sensitivitySection}\n\n## Les cent résultats`,
  ),
);
const columns = [
  "id",
  "title",
  "activeRarity",
  "P",
  "A",
  "H",
  "M",
  "C",
  "total",
  "minimum",
  "maximum",
  "missing",
  "proposedRarity",
  "possibleRarities",
];
const csv = (value: unknown) =>
  `"${String(value ?? "").replaceAll('"', '""')}"`;
const rows = works.map((w) =>
  [
    w.id,
    w.title,
    w.activeRarity,
    ...Object.values(w.scores),
    w.calculation.total,
    w.calculation.minimum,
    w.calculation.maximum,
    w.calculation.missing.join("/"),
    w.proposedRarity,
    w.possibleRarities.join("/"),
  ]
    .map(csv)
    .join(","),
);
await writeFile(
  path.join(directory, "results.csv"),
  [columns.join(","), ...rows].join("\n") + "\n",
);
console.log(
  `${works.length} œuvres : ${complete.length} scores exploratoires complets, ${works.length - complete.length} incomplets ; catalogue actif inchangé.`,
);
for (const w of complete)
  console.log(
    `${w.title} : ${number(w.calculation.total)}/100 → ${w.proposedRarity}`,
  );
console.log(
  "Rapport : catalog/notoriety/REPORT.md ; détails JSON/CSV et preuves locales.",
);
