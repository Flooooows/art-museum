import { catalogDataset } from "../src/catalog/repository";
import { activeAssessment, publicationIssues } from "../src/catalog/model";
import plan from "../catalog/initial-collections.json";
import { CARDS_PER_PACK } from "../src/packRules";

const blocked = catalogDataset.works
  .map((work) => ({
    id: work.id,
    title: work.title,
    issues: publicationIssues(catalogDataset, work.id),
  }))
  .filter((work) => work.issues.length);
const report = {
  works: catalogDataset.works.length,
  demoCatalogs: catalogDataset.catalogs.filter(
    (catalog) => catalog.status === "demo",
  ).length,
  memberships: catalogDataset.memberships.length,
  publishedWorks: catalogDataset.works.filter(
    (work) => work.status === "published",
  ).length,
  verifiedImages: catalogDataset.images.filter(
    (image) =>
      image.rights.reviewStatus === "verified" && image.rights.verification,
  ).length,
  validatedRarities: catalogDataset.works.filter(
    (work) => activeAssessment(catalogDataset, work.id)?.status === "validated",
  ).length,
  proposedUniqueWorks: plan.uniqueWorksTarget,
  proposedCollections: plan.collections.length,
  existingCandidates: plan.collections.flatMap((item) => item.candidateIds)
    .length,
  existingReserve: plan.reserveExistingIds.length,
  cardsPerNewPack: CARDS_PER_PACK,
  blocked,
};
if (
  plan.collections.reduce((sum, item) => sum + item.target, 0) +
    plan.reserveExistingIds.length !==
  plan.uniqueWorksTarget
)
  throw new Error("Total du plan de catalogue incohérent.");
const candidates = [
  ...plan.collections.flatMap((item) => item.candidateIds),
  ...plan.reserveExistingIds,
];
if (
  new Set(candidates).size !== candidates.length ||
  candidates.some((id) => !catalogDataset.works.some((work) => work.id === id))
)
  throw new Error("Candidats inconnus ou comptés deux fois dans le plan.");
if (process.argv.includes("--json"))
  console.log(JSON.stringify(report, null, 2));
else {
  console.log(
    `Catalogue valide : ${report.works} œuvres, ${report.demoCatalogs} catalogues de démonstration, ${report.memberships} appartenances.`,
  );
  console.log(
    `Publication : ${report.publishedWorks} œuvres publiées ; ${report.validatedRarities} raretés validées. ${blocked.length} fiches encore à vérifier.`,
  );
  console.log(
    `Sélection : ${report.proposedCollections} ensembles, ${report.works} œuvres importées et ${report.verifiedImages} images aux droits vérifiés.`,
  );
  console.log(
    `Répartition : ${report.existingCandidates} fiches affectées à ces ensembles ; ${report.existingReserve} conservée hors de ces ensembles, sans reclassement artificiel.`,
  );
  console.log(`Nouvelles pochettes : ${CARDS_PER_PACK} cartes.`);
  for (const work of blocked.slice(0, 10))
    console.log(`- ${work.title} : ${work.issues.join(" ; ")}`);
  if (blocked.length > 10)
    console.log(
      `… et ${blocked.length - 10} autres fiches ; rapport complet avec --json.`,
    );
}
if (process.argv.includes("--require-ready") && blocked.length)
  process.exitCode = 1;
