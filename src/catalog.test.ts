import { test } from "node:test";
import assert from "node:assert/strict";
import { catalogDataset } from "./catalog/repository";
import {
  activeAssessment,
  latestAssessment,
  parseCatalog,
  publicationIssues,
  publishWork,
  rarityLevelForScore,
  type CatalogDataset,
} from "./catalog/model";
import { artworks, byId, catalogSize, museumName } from "./data";
import plan from "../catalog/initial-collections.json";

const copy = (): CatalogDataset => structuredClone(catalogDataset);
const legacyIds = [
  "437654",
  "436105",
  "436535",
  "45434",
  "mona-lisa",
  "544453",
  "544184",
  "544450",
  "544442",
  "544227",
  "820892",
  "20804",
  "35",
  "9480",
  "1085",
  "544864",
  "250945",
  "204759",
  "204758",
  "467642",
];

test("la banque contient cent œuvres et conserve les vingt identifiants historiques", () => {
  assert.equal(parseCatalog(catalogDataset), catalogDataset);
  assert.deepEqual(
    artworks
      .filter((work) => !work.id.startsWith("cma-"))
      .map((work) => work.id)
      .sort(),
    [...legacyIds].sort(),
  );
  assert.equal(
    byId["mona-lisa"].source,
    "https://collections.louvre.fr/ark:/53355/cl010062370",
  );
  assert.equal(museumName(byId["mona-lisa"]), "Musée du Louvre, Paris");
  assert.equal(
    museumName(byId["436105"]),
    "The Metropolitan Museum of Art, New York",
  );
  assert.equal(catalogDataset.memberships.length, 102);
  assert.equal(catalogSize("all"), 100);
  assert.equal(
    museumName(byId["cma-136510"]),
    "The Cleveland Museum of Art, Cleveland",
  );
});

test("la démonstration ne prétend pas avoir validé des raretés ou publié des fiches", () => {
  assert.equal(
    catalogDataset.works.filter((work) => work.status === "published").length,
    0,
  );
  for (const work of catalogDataset.works) {
    assert.equal(
      activeAssessment(catalogDataset, work.id)?.status,
      "provisional",
    );
    assert.deepEqual(
      Object.values(activeAssessment(catalogDataset, work.id)!.scores),
      [null, null, null, null],
    );
    assert.deepEqual(publicationIssues(catalogDataset, work.id), [
      "rareté éditoriale à valider",
    ]);
    assert.throws(
      () => publishWork(catalogDataset, work.id),
      /publication refusée/,
    );
  }
});

test("la validation refuse références, identités et appartenances incohérentes", () => {
  const changes: ((data: CatalogDataset) => void)[] = [
    (data) => data.works.push({ ...data.works[0] }),
    (data) => {
      data.works[0].museumId = "inconnu";
    },
    (data) => {
      data.works[0].familyId = "inconnu";
    },
    (data) => {
      data.works[0].rarityAssessmentId = "inconnu";
    },
    (data) => {
      data.works[0].sources = [];
    },
    (data) => {
      data.works[0].yearStart = 2000;
      data.works[0].yearEnd = 1000;
    },
    (data) => {
      data.images[0].workId = "inconnu";
    },
    (data) => data.memberships.push({ ...data.memberships[0] }),
    (data) => {
      data.memberships[0].catalogId = "inconnu";
    },
    (data) => {
      data.images[0].rights.reviewedAt = null;
    },
    (data) => {
      delete data.images[0].rights.verification;
    },
    (data) => {
      data.images[0].rights.verification!.sha256 = "empreinte-invalide";
    },
    (data) => {
      data.catalogs[0].status = "published";
    },
    (data) => {
      data.catalogs[0].status = "draft";
    },
  ];
  for (const change of changes) {
    const data = copy();
    change(data);
    assert.throws(() => parseCatalog(data), /Catalogue invalide/);
  }
  for (const invalid of [null, {}, { ...copy(), works: [null] }])
    assert.throws(() => parseCatalog(invalid), /Catalogue invalide/);
});

test("une évaluation validée exige critères, preuves, date, confiance et score cohérent", () => {
  const data = copy();
  const assessment = data.rarityAssessments[0];
  assessment.status = "validated";
  assert.throws(() => parseCatalog(data), /évaluation validée/);
  assessment.scores = {
    visualRecognition: 40,
    popularCulture: 25,
    educationalReach: 20,
    geographicReach: 15,
  };
  assessment.sources = ["https://example.org/fixture-editoriale"];
  assessment.confidence = "high";
  assessment.assessedAt = "2026-10-29";
  assert.throws(() => parseCatalog(data), /score documenté/);
  assessment.level = 4;
  assert.doesNotThrow(() => parseCatalog(data));
  (assessment.scores as unknown as Record<string, number>).extra = 100;
  assert.throws(() => parseCatalog(data), /critères/);
});

test("les seuils 30, 50, 70 et 90 déterminent la rareté, bornes comprises", () => {
  for (const [score, level] of [
    [0, 0],
    [20, 0],
    [29.99, 0],
    [30, 1],
    [49.99, 1],
    [50, 2],
    [69.99, 2],
    [70, 3],
    [80, 3],
    [89.99, 3],
    [90, 4],
    [100, 4],
  ]) {
    assert.equal(rarityLevelForScore(score), level);
    const data = copy();
    const assessment = data.rarityAssessments[0];
    assessment.status = "validated";
    assessment.level = level;
    assessment.scores = {
      visualRecognition: Math.min(40, score),
      popularCulture: Math.min(25, Math.max(0, score - 40)),
      educationalReach: Math.min(20, Math.max(0, score - 65)),
      geographicReach: Math.max(0, score - 85),
    };
    assessment.sources = ["https://example.org/fixture-editoriale"];
    assessment.confidence = "high";
    assessment.assessedAt = "2026-10-29";
    assert.doesNotThrow(() => parseCatalog(data), `score ${score}`);
    assessment.level = (level + 1) % 5;
    assert.throws(() => parseCatalog(data), /score documenté/);
  }
  for (const score of [-1, 100.01, NaN, Infinity]) {
    assert.throws(() => rarityLevelForScore(score), /entre 0 et 100/);
  }
});

test("publication explicite et nouveau brouillon d’évaluation ne changent pas la rareté active", () => {
  const data = copy();
  const work = data.works[0];
  const assessment = activeAssessment(data, work.id)!;
  assessment.status = "validated";
  assessment.scores = {
    visualRecognition: 0,
    popularCulture: 0,
    educationalReach: 0,
    geographicReach: 0,
  };
  assessment.sources = ["https://example.org/fixture-editoriale"];
  assessment.confidence = "high";
  assessment.assessedAt = "2026-10-29";
  const image = data.images.find(
    (item) => item.workId === work.id && item.primary,
  )!;
  image.rights.reviewStatus = "verified";
  image.rights.reviewedAt = "2026-10-29";
  const published = publishWork(data, work.id);
  assert.equal(data.works[0].status, "demo");
  assert.equal(published.works[0].status, "published");
  const proposal = structuredClone(assessment);
  proposal.id = `${assessment.id}-next`;
  proposal.version = 2;
  proposal.status = "provisional";
  proposal.level = 4;
  published.rarityAssessments.push(proposal);
  assert.doesNotThrow(() => parseCatalog(published));
  assert.equal(latestAssessment(published, work.id)?.level, 4);
  assert.equal(activeAssessment(published, work.id)?.level, 0);
  published.works[0].rarityAssessmentId = proposal.id;
  assert.throws(() => parseCatalog(published), /publication non validée/);
});

test("la sélection couvre cent œuvres importées sans confondre appartenances et publication", () => {
  assert.equal(plan.status, "selected");
  assert.equal(plan.collections.length, 6);
  assert.equal(
    plan.collections.reduce((sum, item) => sum + item.target, 0) +
      plan.reserveExistingIds.length,
    100,
  );
  const assigned = [
    ...plan.collections.flatMap((item) => item.candidateIds),
    ...plan.reserveExistingIds,
  ];
  assert.equal(new Set(assigned).size, assigned.length);
  assert.deepEqual(
    [...assigned].sort(),
    artworks.map((work) => work.id).sort(),
  );
  assert.ok(
    plan.collections.every((item) => item.target === item.candidateIds.length),
  );
  assert.ok(
    plan.collections.every(
      (item) =>
        item.target > 0 &&
        catalogDataset.families.some((family) => family.id === item.familyId),
    ),
  );
  assert.equal(catalogDataset.catalogs.length, 6);
});

test("chaque image possède une revue de droits datée et une preuve reliée au fichier", () => {
  assert.equal(catalogDataset.images.length, 100);
  for (const image of catalogDataset.images) {
    assert.equal(image.rights.reviewStatus, "verified");
    assert.ok(image.rights.verification);
    assert.equal(
      image.rights.reviewedAt,
      image.rights.verification.retrievedAt.slice(0, 10),
    );
    assert.match(image.rights.verification.sha256, /^[a-f0-9]{64}$/);
  }
  assert.equal(
    catalogDataset.images.filter((image) => image.rights.license === "CC0")
      .length,
    80,
  );
  assert.equal(
    catalogDataset.images.filter(
      (image) => image.rights.license === "public-domain",
    ).length,
    20,
  );
});

test("les quatre-vingts fiches ajoutées gardent des attributions nuancées et des textes distincts", () => {
  const added = artworks.filter((work) => work.id.startsWith("cma-"));
  assert.equal(added.length, 80);
  assert.equal(new Set(added.map((work) => work.story)).size, 80);
  assert.ok(
    added.every(
      (work) => work.story.length >= 150 && work.anecdote.length >= 35,
    ),
  );
  assert.equal(byId["cma-97166"].artist, "Suiveur de Fra Filippo Lippi");
  assert.equal(byId["cma-127746"].artist, "Atelier de Jacopo Tintoretto");
  assert.equal(byId["cma-135517"].artist, "Attribué à Suzanne Valadon");
  assert.ok(byId["cma-296869"].artist.startsWith("Probablement"));
  assert.equal(catalogSize("renaissance-italienne"), 15);
  assert.equal(catalogSize("premiers-arts"), 10);
});
