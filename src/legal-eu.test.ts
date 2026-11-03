import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  evaluateLegalEU,
  publicDomainDate,
  parseLegalInput,
  type LegalInput,
  type LegalSource,
} from "./legal-eu/model";
import {
  assertLegalBindings,
  matchingLegalDataset,
  parseLegalReport,
} from "./legal-eu/report";
import { generateLegalReport } from "../scripts/legal-eu/build";
import { historicalIllustration } from "./legal-eu/publication";
import { certainInstitutionalDeathYear } from "./legal-eu/author";

const date = "2026-10-30";
test("UE — période d’activité et décès approximatif ne deviennent pas un décès certain", () => {
  assert.equal(
    certainInstitutionalDeathYear("1455", "Italian, c. 1395–1455"),
    1455,
  );
  assert.equal(
    certainInstitutionalDeathYear("1455", "Italian, 1395–c. 1455"),
    null,
  );
  assert.equal(
    certainInstitutionalDeathYear("1455", "Italian, active 1440–1455"),
    null,
  );
  assert.equal(
    certainInstitutionalDeathYear("1455", "Italian, 1395–1455?"),
    null,
  );
  assert.equal(certainInstitutionalDeathYear("c. 1455", "Italian"), null);
});
test("UE — une réédition récente ne prouve pas une communication ancienne", () => {
  assert.equal(
    historicalIllustration("Auteur, Catalogue, Paris, 1985, p. 22, ill.", date),
    true,
  );
  assert.equal(
    historicalIllustration("1898 Auteur, Catalogue, fig. 12", date),
    true,
  );
  assert.equal(
    historicalIllustration(
      "Auteur, Répertoire, 1898, édition illustrée de 2025, p. 12",
      date,
    ),
    false,
  );
  assert.equal(
    historicalIllustration(
      "Auteur, Répertoire 1810–1815, édition illustrée de 2025",
      date,
    ),
    false,
  );
  assert.equal(
    historicalIllustration(
      "Auteur, Catalogue, 1985, p. 22 (mention seulement)",
      date,
    ),
    false,
  );
  assert.equal(
    historicalIllustration("Auteur, Catalogue, 2001, p. 22, ill.", date),
    false,
  );
});
const src: LegalSource = {
  url: "https://www.clevelandart.org/art/1915.534",
  label: "Institution",
  kind: "institution",
  locator: "Exact object, author, death, publication and file metadata",
};
function fixture(year = 1890): LegalInput {
  const clear = {
    state: "clear" as const,
    explanation: "Établi par la preuve de test.",
    sources: [src],
  };
  return {
    artworkId: "fixture",
    title: "Œuvre",
    creator: "Auteur",
    sourceUrl: src.url,
    imageUrl: "/assets/work-fixture.jpg",
    identity: clear,
    authorship: "identified_single",
    authors: [
      { id: "author", name: "Auteur", deathEvidence: [{ year, source: src }] },
    ],
    artworkPermission: null,
    checks: {
      nationalTerms: clear,
      publication: clear,
      creativeContributions: clear,
      contracts: clear,
      otherRights: clear,
    },
    exceptions: [],
    image: {
      kind: "faithful_non_original",
      basis: "ARTICLE_14",
      sourceUrl: "https://museum.example/original.jpg",
      licenseUrl: "https://eur-lex.europa.eu/eli/dir/2019/790/oj",
      evidence: [src],
      credit: "Auteur, musée, fichier.",
      commercialUse: "permitted",
    },
  };
}
test("UE — règle décès + 70 ans, changement au 1er janvier, exemples demandés", () => {
  for (const [death, expected] of [
    [1863, "1934-01-01"],
    [1890, "1961-01-01"],
    [1926, "1997-01-01"],
    [1918, "1989-01-01"],
    [1954, "2025-01-01"],
    [1955, "2026-01-01"],
    [1973, "2044-01-01"],
  ] as const)
    assert.equal(publicDomainDate(death), expected);
  assert.equal(evaluateLegalEU(fixture(1955), "2025-12-31").status, "BLOCKED");
  assert.equal(
    evaluateLegalEU(fixture(1955), "2026-01-01").generalPublicDomainDate,
    "2026-01-01",
  );
  assert.equal(
    evaluateLegalEU(fixture(1945), "2026-01-01").status,
    "AUTO_APPROVED_EU",
  );
});
test("UE — expiration générale ne vaut pas feu vert toute UE (Kahlo / Espagne)", () => {
  const d = evaluateLegalEU(fixture(1954), date);
  assert.equal(d.status, "REVIEW_REQUIRED");
  assert.equal(d.generalPublicDomainDate, "2025-01-01");
  assert.ok(d.reasons.some((r) => r.includes("espagnole")));
});
test("UE — approbation explicable et déterministe, sans publication ni mutation", () => {
  const f = fixture();
  const before = structuredClone(f);
  const d = evaluateLegalEU(f, date);
  assert.deepEqual(d, evaluateLegalEU(f, date));
  assert.deepEqual(f, before);
  assert.equal(d.status, "AUTO_APPROVED_EU");
  assert.equal(d.publicationAuthorized, false);
  assert.equal(d.territory, "European Union");
  assert.equal(d.verifiedAt, date);
  assert.ok(d.rules.some((r) => r.id.includes("14")));
  assert.ok(d.obligations.some((o) => o.includes("moraux")));
});
test("UE — une licence CC0 de photographie ne libère pas un Picasso", () => {
  const f = fixture(1973);
  f.image.basis = "CC0";
  f.image.licenseUrl = "https://creativecommons.org/publicdomain/zero/1.0/";
  assert.equal(evaluateLegalEU(f, date).status, "BLOCKED");
  f.artworkPermission = f.identity;
  assert.equal(evaluateLegalEU(f, date).status, "REVIEW_REQUIRED");
});
for (const mode of ["anonymous", "pseudonymous", "unknown", "joint"] as const)
  test(`UE — ${mode} : pas d’approbation sur l’ancienneté`, () => {
    const f = fixture();
    f.authorship = mode;
    assert.equal(evaluateLegalEU(f, date).status, "REVIEW_REQUIRED");
  });
test("UE — coauteurs : le dernier décès compte, aucune approbation automatique de ce parcours", () => {
  const f = fixture();
  f.authorship = "joint";
  f.authors.push({
    id: "coauthor",
    name: "Coauteur",
    deathEvidence: [{ year: 1973, source: src }],
  });
  assert.equal(evaluateLegalEU(f, date).generalPublicDomainDate, "2044-01-01");
  assert.equal(evaluateLegalEU(f, date).status, "BLOCKED");
});
test("UE — une attribution incertaine ou un anonyme ne devient pas définitivement bloqué par un calcul de vie inapplicable", () => {
  const anonymous = fixture(1973);
  anonymous.authorship = "anonymous";
  assert.equal(evaluateLegalEU(anonymous, date).status, "REVIEW_REQUIRED");
  assert.equal(evaluateLegalEU(anonymous, date).generalPublicDomainDate, null);
  const uncertain = fixture(1973);
  uncertain.identity = {
    state: "uncertain",
    explanation: "Attribution à confirmer.",
    sources: [src],
  };
  assert.equal(evaluateLegalEU(uncertain, date).status, "REVIEW_REQUIRED");
});
test("UE — date absente, contradictoire, future ou sans source fiable reste à revoir", () => {
  for (const evidence of [
    [],
    [
      { year: 1890, source: src },
      { year: 1891, source: src },
    ],
    [{ year: 2030, source: src }],
    [{ year: 1890, source: { ...src, kind: "file" as const } }],
  ]) {
    const f = fixture();
    f.authors[0].deathEvidence = evidence;
    assert.equal(evaluateLegalEU(f, date).status, "REVIEW_REQUIRED");
  }
});
for (const key of [
  "nationalTerms",
  "publication",
  "creativeContributions",
  "contracts",
  "otherRights",
] as const)
  test(`UE — contrôle explicite nécessaire : ${key}`, () => {
    const f = fixture();
    f.checks[key] = {
      state: "uncertain",
      explanation: "Information manquante.",
      sources: [],
    };
    assert.equal(evaluateLegalEU(f, date).status, "REVIEW_REQUIRED");
    f.checks[key] = {
      state: "blocked",
      explanation: "Restriction incompatible établie.",
      sources: [src],
    };
    assert.equal(evaluateLegalEU(f, date).status, "BLOCKED");
  });
test("UE — article 14 ne crée pas un copyright et ne dispense pas des contrats", () => {
  const f = fixture();
  assert.equal(evaluateLegalEU(f, date).status, "AUTO_APPROVED_EU");
  f.checks.contracts = {
    state: "uncertain",
    explanation:
      "Une mention restrictive isolée : obligations contractuelles à examiner, pas preuve d’originalité.",
    sources: [src],
  };
  assert.equal(evaluateLegalEU(f, date).status, "REVIEW_REQUIRED");
  f.image.commercialUse = "prohibited";
  assert.equal(evaluateLegalEU(f, date).status, "BLOCKED");
});
test("UE — photographie originale : licence indépendante nécessaire ; crédit et SA conservés", () => {
  const f = fixture();
  f.image.kind = "original_photograph";
  assert.equal(evaluateLegalEU(f, date).status, "REVIEW_REQUIRED");
  f.image.basis = "CC-BY-SA-4.0";
  f.image.licenseUrl = "https://creativecommons.org/licenses/by-sa/4.0/";
  const d = evaluateLegalEU(f, date);
  assert.equal(d.status, "AUTO_APPROVED_EU");
  assert.ok(d.obligations.some((o) => o.includes("même licence")));
  f.image.credit = "";
  assert.equal(evaluateLegalEU(f, date).status, "REVIEW_REQUIRED");
});
test("UE — licence inventée, URL détournée et faux contrôle sans preuve refusés", () => {
  const f = fixture();
  f.image.basis = "CC0";
  f.image.licenseUrl = "https://example.org/cc0";
  assert.equal(evaluateLegalEU(f, date).status, "REVIEW_REQUIRED");
  assert.throws(() =>
    parseLegalInput({ ...f, sourceUrl: "javascript:alert(1)" }),
  );
  assert.throws(() =>
    parseLegalInput({ ...f, identity: { ...f.identity, sources: [] } }),
  );
  assert.throws(() => publicDomainDate(NaN));
  assert.throws(() => publicDomainDate(1890.5));
  assert.throws(() => evaluateLegalEU(f, "2026-02-30"));
});
test("UE — dossiers publics reproductibles depuis les preuves, sans mutation des catalogues", async () => {
  const stored = parseLegalReport(
    JSON.parse(await readFile("public/legal-eu/report.json", "utf8")),
  );
  const { report } = await generateLegalReport(stored.verifiedAt);
  assert.deepEqual(report, stored);
  let auto = 0;
  for (const [key, dataset] of Object.entries(stored.datasets)) {
    const catalog = JSON.parse(
      await readFile(`public/${key}/catalog.json`, "utf8"),
    );
    assertLegalBindings(dataset, catalog);
    const hash = createHash("sha256")
      .update(JSON.stringify(catalog))
      .digest("hex");
    assert.equal(
      matchingLegalDataset(
        stored,
        key,
        catalog.version,
        hash,
        stored.verifiedAt,
      ),
      dataset,
    );
    auto += dataset.entries.filter(
      (e) => e.decision.status === "AUTO_APPROVED_EU",
    ).length;
    assert.throws(() =>
      matchingLegalDataset(stored, key, catalog.version, "0".repeat(64), date),
    );
    assert.throws(() =>
      matchingLegalDataset(stored, key, catalog.version, hash, "2030-01-01"),
    );
    assert.throws(() =>
      matchingLegalDataset(stored, key, catalog.version, hash, "2025-01-01"),
    );
  }
  assert.ok(
    auto >= 200,
    "Les tableaux évidents ne doivent pas tous repasser en revue humaine.",
  );
  const wrong = structuredClone(stored);
  const d = Object.values(wrong.datasets)[0];
  d.entries[0].decision.status =
    d.entries[0].decision.status === "BLOCKED" ? "REVIEW_REQUIRED" : "BLOCKED";
  assert.throws(() => parseLegalReport(wrong));
  const mismatch = structuredClone(stored.datasets["review-data"]);
  mismatch.entries[0].input.imageUrl = "/assets/wrong.jpg";
  const catalog = JSON.parse(
    await readFile("public/review-data/catalog.json", "utf8"),
  );
  assert.throws(() => assertLegalBindings(mismatch, catalog));
});
