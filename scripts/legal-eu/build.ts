import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { historicalIllustration } from "../../src/legal-eu/publication";
import { certainInstitutionalDeathYear } from "../../src/legal-eu/author";
import {
  ENGINE_VERSION,
  TERM_DIRECTIVE,
  REPRODUCTION_DIRECTIVE,
  SPAIN_TERM,
  evaluateLegalEU,
  publicDomainDate,
  validDay,
  type Finding,
  type LegalInput,
  type LegalSource,
  type LegalReport,
} from "../../src/legal-eu/model";

const sha = (s: string | Buffer) =>
  createHash("sha256").update(s).digest("hex");
const unknown = (explanation: string): Finding => ({
  state: "uncertain",
  explanation,
  sources: [],
});
const evidence = (
  url: string,
  label: string,
  locator: string,
  kind: LegalSource["kind"] = "institution",
): LegalSource => ({ url, label, locator, kind });
const clear = (explanation: string, sources: LegalSource[]): Finding => ({
  state: "clear",
  explanation,
  sources,
});
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export async function generateLegalReport(asOf: string) {
  if (!validDay(asOf)) throw Error("Utiliser --as-of=AAAA-MM-JJ.");
  const hashes: Record<string, string> = {};
  const loaded = new Map<string, any>();
  async function json(file: string): Promise<any> {
    if (!loaded.has(file)) {
      const bytes = await readFile(file);
      hashes[file] = sha(bytes);
      const value = JSON.parse(bytes.toString());
      if (
        value.payloadSha256 &&
        value.payloadSha256 !== sha(JSON.stringify(value.payload))
      )
        throw Error(`Capture altérée : ${file}`);
      loaded.set(file, value);
    }
    return loaded.get(file);
  }
  for (const file of [
    "src/legal-eu/model.ts",
    "src/legal-eu/publication.ts",
    "src/legal-eu/author.ts",
    "scripts/legal-eu/build.ts",
  ])
    hashes[file] = sha(await readFile(file));
  // Captured policy texts must exist, be nonempty, and match their original bytes.
  for (const name of [
    "term-directive",
    "dsm-directive",
    "spain-terms",
    "cma-open-access",
    "cc0",
    "commons-reuse",
  ]) {
    const meta = await json(`catalog/legal-eu/sources/${name}.json`);
    const bytes = await readFile(meta.file);
    if (
      meta.httpStatus !== 200 ||
      bytes.length < 500 ||
      sha(bytes) !== meta.sha256
    )
      throw Error(`Preuve de politique altérée : ${name}`);
    if (
      !validDay(meta.retrievedAt) ||
      Date.parse(asOf) < Date.parse(meta.retrievedAt) ||
      Date.parse(asOf) - Date.parse(meta.retrievedAt) > 365 * 86400000
    )
      throw Error(
        `Politique hors de sa période de vérification : ${name}. Actualiser les preuves avant un nouveau feu vert.`,
      );
    hashes[meta.file] = sha(bytes);
  }
  const cmaPolicy = evidence(
    "https://www.clevelandart.org/open-access",
    "Cleveland Open Access",
    "Images désignées CC0 : réutilisation sans permission ni restriction de copyright/licence.",
    "policy",
  );
  const termSource = evidence(
    TERM_DIRECTIVE,
    "Directive 2006/116/CE",
    "Articles 1, 4–10 : durée, publication tardive, droits moraux, transitions.",
    "policy",
  );
  const spainSource = evidence(
    SPAIN_TERM,
    "Espagne : disposition transitoire 4",
    "Contrôle conservateur 80 ans pour les auteurs décédés avant 1987 ; pas de réduction automatique par comparaison de délais.",
    "policy",
  );
  const related = (await json("catalog/masterpieces/collected-evidence.json"))
    .related;
  const identities = await json("catalog/enrichment-351/identities.json");
  const supplement = await json("catalog/enrichment-351/supplement.json");
  const entities = {
    ...related,
    ...identities.entities,
    ...supplement.entities,
  };
  const entityFiles = { ...identities.entityFiles, ...supplement.entityFiles };
  const prepared = new Map<string, any>(
    (await json("catalog/enrichment-351/prepared.json")).approved.map(
      (a: any) => [a.workId, a],
    ),
  );
  const legacyCandidates = new Map<string, any>(
    (await json("catalog/masterpieces/reports/candidates.json")).candidates.map(
      (c: any) => [c.id, c],
    ),
  );
  const secondary = new Map<string, { qid: string; years: number[] }[]>();
  for (const [qid, entity] of Object.entries(entities) as [string, any][]) {
    const years = (entity.claims?.P570 ?? [])
      .filter(
        (c: any) =>
          c.rank !== "deprecated" && !Object.keys(c.qualifiers ?? {}).length,
      )
      .flatMap((c: any) => {
        const date = c.mainsnak?.datavalue?.value;
        return date?.precision >= 9 &&
          date.before === 0 &&
          date.after === 0 &&
          /^\+\d{4}-/.test(date.time)
          ? [Number(date.time.slice(1, 5))]
          : [];
      });
    if (!years.length) continue;
    for (const label of Object.values(entity.labels ?? {}) as any[]) {
      const key = normalize(label.value);
      const items = secondary.get(key) ?? [];
      if (!items.some((i) => i.qid === qid)) items.push({ qid, years });
      secondary.set(key, items);
    }
  }
  const seed = await json("src/catalog/seed.json");
  const seedImages = new Map<string, any>(
    seed.images.map((i: any) => [i.workId, i]),
  );
  const selection = new Map<string, any>(
    (await json("catalog/review-1000/selection.json")).works.map((w: any) => [
      w.id,
      w,
    ]),
  );

  function base(w: any): LegalInput {
    return {
      artworkId: w.id,
      title: w.title,
      creator: w.creator,
      sourceUrl: w.sourceUrl,
      imageUrl: w.imageUrl ?? null,
      identity: unknown(
        "Identité juridique de l’objet et de tous ses auteurs à compléter depuis une notice exacte.",
      ),
      authorship: "unknown",
      authors: [],
      artworkPermission: null,
      checks: {
        nationalTerms: unknown(
          "Durées nationales/transitoires ou origine à établir pour l’ensemble de l’UE.",
        ),
        publication: unknown(
          "Première publication/communication et éventuels droits posthumes à établir (article 4).",
        ),
        creativeContributions: unknown(
          "Contributions créatives, adaptation ou restauration à vérifier.",
        ),
        contracts: unknown(
          "Conditions d’accès au fichier exact à établir ; une mention copyright seule ne prouve pas un nouveau droit.",
        ),
        otherRights: unknown(
          "Autres droits et restrictions particuliers à vérifier.",
        ),
      },
      exceptions: [],
      image: {
        kind: "unknown",
        basis: "UNKNOWN",
        sourceUrl: null,
        licenseUrl: null,
        evidence: [],
        credit: "",
        commercialUse: "unknown",
      },
    };
  }
  async function cmaInput(w: any, record: any): Promise<LegalInput> {
    const input = base(w);
    const src = evidence(
      record.url,
      "Notice exacte Cleveland",
      `Objet ${record.id} : creators, death_year, qualifiers, copyright, exhibitions, images.web.url, share_license_status.`,
    );
    const cs = record.creators ?? [];
    const authors = cs.map((c: any) => {
      const name = String(c.description ?? "").split(" (")[0];
      const deathEvidence =
        certainInstitutionalDeathYear(
          c.death_year,
          String(c.description ?? ""),
        ) !== null
          ? [
              {
                year: Number(c.death_year),
                source: {
                  ...src,
                  locator: `creators[id=${c.id}].death_year = ${c.death_year}; ${c.description}`,
                },
              },
            ]
          : [];
      const matches = secondary.get(normalize(name)) ?? [];
      if (matches.length === 1)
        for (const year of matches[0].years)
          deathEvidence.push({
            year,
            source: evidence(
              `https://www.wikidata.org/wiki/${matches[0].qid}`,
              "Wikidata — auteur",
              "P570 (rang non déprécié, précision au moins annuelle, sans intervalle)",
              "authority",
            ),
          });
      return {
        id: `cma-creator-${c.id}`,
        name: name || "Auteur inconnu",
        deathEvidence,
      };
    });
    input.authors = authors;
    input.authorship =
      cs.length === 1
        ? "identified_single"
        : cs.length > 1
          ? "joint"
          : "anonymous";
    const recordIdMatches = String(record.id) === w.id.replace(/^cma-/, "");
    // Exact record bindings, never a title-only join.
    if (
      !recordIdMatches ||
      (record.images?.web?.url !== w.imageUrl &&
        !w.imageUrl.startsWith("/assets/"))
    )
      return input;
    input.identity = clear(
      "Objet exact et liste complète des créateurs selon la notice institutionnelle, identifiant conservé.",
      [src],
    );
    if (
      cs.some(
        (c: any) =>
          c.qualifier ||
          c.extent ||
          !["artist", "maker", "painter", "photographer"].includes(c.role) ||
          /unknown|anonymous|attributed|workshop|circle of|after |school of|possibly|probably|master of|maître de|monogrammist|\?/i.test(
            c.description ?? "",
          ),
      )
    )
      input.exceptions.push(
        "Attribution, rôle, portée ou identité du créateur incertains dans la notice ; pas de validation sur la seule ancienneté.",
      );
    const years = authors.flatMap((a: any) =>
      a.deathEvidence.map((e: any) => e.year),
    );
    const last = years.length ? Math.max(...years) : null;
    if (last && publicDomainDate(last, 80) <= asOf) {
      input.checks.nationalTerms = clear(
        "Le délai ordinaire de 70 ans et le contrôle conservateur de 80 ans (transition espagnole) sont expirés. Aucun raccourcissement pour pays tiers n’est utilisé.",
        [termSource, spainSource, src],
      );
      if (
        last >= 1914 &&
        cs.some((c: any) => /French|France|français/i.test(c.description ?? ""))
      ) {
        input.checks.nationalTerms = unknown(
          "Auteur français décédé depuis 1914 : vérifier les prorogations, notamment « mort pour la France », avant approbation toute UE.",
        );
        // Artist-level documentary profile: no need to re-review every Monet painting.
        if (
          cs.length === 1 &&
          normalize(authors[0].name) === "claudemonet" &&
          last === 1926 &&
          related.Q296?.claims?.P509?.some(
            (c: any) => c.mainsnak?.datavalue?.value?.id === "Q47912",
          )
        ) {
          input.checks.nationalTerms = clear(
            "Profil Claude Monet : décès institutionnel en 1926, corroboré par Q296 ; cancer du poumon P509. Pas de cas de décès de guerre identifié pour ce profil. Délais 70 et 80 ans expirés ; contrôle réutilisé pour ses œuvres.",
            [
              src,
              spainSource,
              evidence(
                "https://www.wikidata.org/wiki/Q296",
                "Claude Monet",
                "P570=1926 ; P509=Q47912 (cancer du poumon)",
                "authority",
              ),
            ],
          );
        }
      }
    }
    const exhibitions = Object.values(record.exhibitions ?? {}).flat() as any[];
    const publicDates = exhibitions
      .map((e) => e.opening_date?.slice(0, 10))
      .filter((d): d is string => validDay(d))
      .sort();
    const oldDate = publicDates.find(
      (d) => `${Number(d.slice(0, 4)) + 26}-01-01` <= asOf,
    );
    if (oldDate)
      input.checks.publication = clear(
        `Communication publique institutionnelle attestée au plus tard le ${oldDate} : même un éventuel droit de première communication de 25 ans est expiré. Ne déduit pas une publication de la date de création.`,
        [
          { ...src, locator: `exhibitions.*.opening_date = ${oldDate}` },
          termSource,
        ],
      );
    if (
      !record.edition_of_the_work &&
      !record.conservation_statement &&
      !record.state_of_the_work
    )
      input.checks.creativeContributions = clear(
        "Aucune édition, intervention créative ou restauration signalée dans les champs institutionnels contrôlés. Ce contrôle porte sur l’objet et le fichier principal exacts, pas une adaptation future.",
        [src],
      );
    if (
      record.copyright === null &&
      record.image_credit === null &&
      record.record_type === "object" &&
      record.legal_status === "accessioned"
    )
      input.checks.otherRights = clear(
        "Notice d’un objet de collection : pas de revendication copyright ou de crédit de tiers dans les champs contrôlés ; pas de composant/couverture distinct à substituer. Respect du nom et de l’intégrité maintenu.",
        [src, cmaPolicy],
      );
    if (record.share_license_status === "CC0" && record.images?.web?.url) {
      input.checks.contracts = clear(
        "Fichier principal désigné CC0 par la notice exacte et politique Open Access : réutilisation sans permission ; aucune condition d’accès supplémentaire identifiée pour cet accès public.",
        [src, cmaPolicy],
      );
      input.image = {
        kind: "unknown",
        basis: "CC0",
        sourceUrl: record.images.web.url,
        licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
        evidence: [src, cmaPolicy],
        commercialUse: "permitted",
        credit: `${w.creator}, ${w.title}. The Cleveland Museum of Art, ${record.accession_number}. ${record.creditline ?? ""} Source : ${record.url}. CC0 ; crédit de provenance recommandé.`,
      };
    }
    return input;
  }
  async function preparedInput(w: any, a: any): Promise<LegalInput> {
    const input = base(w);
    if (
      a.workId !== w.id ||
      a.sourceUrl !== w.sourceUrl ||
      a.input?.identity?.status !== "verified"
    )
      return input;
    const src = evidence(
      a.sourceUrl,
      a.institution,
      `Objet ${a.inventoryNumber} ; identité et version rapprochées avec les preuves institutionnelles figées.`,
    );
    for (const e of a.input.institutionEvidence ?? []) {
      if (e.file) {
        const raw = await readFile(e.file);
        if (sha(raw) !== e.sha256)
          throw Error(`Preuve institutionnelle altérée : ${e.file}`);
        hashes[e.file] = sha(raw);
      }
    }
    input.identity = clear(
      a.versionNote || "Objet exact rapproché de la notice institutionnelle.",
      [src],
    );
    input.authorship =
      a.creatorIds.length > 1
        ? "joint"
        : a.input.creatorMode === "identified" && a.creatorIds.length === 1
          ? "identified_single"
          : "unknown";
    for (const qid of a.creatorIds) {
      const ent = entities[qid];
      if (entityFiles[qid]) await json(entityFiles[qid]);
      const name = ent?.labels?.fr?.value ?? ent?.labels?.en?.value ?? qid;
      const source = evidence(
        `https://www.wikidata.org/wiki/${qid}`,
        name,
        "P570 non déprécié, précision annuelle ou meilleure, sans intervalle ; auteur relié à l’objet institutionnel exact.",
        "authority",
      );
      const deathEvidence = (ent?.claims?.P570 ?? [])
        .filter(
          (c: any) =>
            c.rank !== "deprecated" && !Object.keys(c.qualifiers ?? {}).length,
        )
        .flatMap((c: any) => {
          const d = c.mainsnak?.datavalue?.value;
          return d?.precision >= 9 &&
            d.before === 0 &&
            d.after === 0 &&
            /^\+\d{4}-/.test(d.time)
            ? [{ year: Number(d.time.slice(1, 5)), source }]
            : [];
        });
      input.authors.push({ id: qid, name, deathEvidence });
    }
    const years = input.authors.flatMap((a) =>
      a.deathEvidence.map((e) => e.year),
    );
    const last = years.length ? Math.max(...years) : null;
    if (last && publicDomainDate(last, 80) <= asOf) {
      const french = a.creatorIds.some((q: string) =>
        entities[q]?.claims?.P27?.some(
          (c: any) => c.mainsnak?.datavalue?.value?.id === "Q142",
        ),
      );
      if (!(last >= 1914 && french))
        input.checks.nationalTerms = clear(
          "Délais de 70 ans et de 80 ans expirés ; aucun raccourcissement fondé sur le seul pays d’origine. Aucun signal de prorogation française de guerre pour ce profil ancien.",
          [src, termSource, spainSource],
        );
    }
    // A dated bibliography is only usable here when the exact object is explicitly illustrated.
    const citation = (a.input.institutionSignals?.citations ?? []).find(
      (c: any) => historicalIllustration(String(c.text), asOf),
    );
    if (citation)
      input.checks.publication = clear(
        `Reproduction de l’objet explicitement citée dans une publication institutionnellement référencée depuis plus de 25 ans : ${citation.text}`,
        [src, termSource],
      );
    if (
      a.input.creatorMode === "identified" &&
      a.input.category === "painting" &&
      !/posthum|restaur|adaptation|attribution incertaine/i.test(
        a.versionNote ?? "",
      )
    )
      input.checks.creativeContributions = clear(
        "Peinture identifiée et version exacte documentée dans la préparation ; aucune contribution créative distincte signalée dans cette notice/version. Une adaptation future nécessiterait un nouveau contrôle.",
        [src],
      );
    const im = a.image;
    if (im) {
      const captures = [];
      for (const file of im.evidenceFiles ?? [])
        captures.push(await json(file));
      const imageInfos = captures.flatMap((c) =>
        Object.values(
          c.payload?.query?.pages ?? c.response?.query?.pages ?? {},
        ).flatMap((p: any) => p.imageinfo ?? []),
      );
      const imageKey = (u: string) => {
        const url = new URL(u);
        return `${url.hostname}${decodeURIComponent(url.pathname)}`;
      };
      const exactInfo = imageInfos.find(
        (i: any) => i.url && imageKey(i.url) === imageKey(im.originalUrl),
      );
      const original = new URL(im.originalUrl);
      const commons =
        new URL(im.filePageUrl).hostname === "commons.wikimedia.org" &&
        original.hostname === "upload.wikimedia.org";
      const photo =
        /reproduction plane/i.test(im.photographer ?? "") &&
        a.input.category === "painting";
      const basis =
        im.license === "CC0"
          ? "CC0"
          : im.license === "CC BY 4.0"
            ? "CC-BY-4.0"
            : im.license === "CC BY 2.0"
              ? "CC-BY-2.0"
              : im.license === "Domaine public / reproduction plane" && photo
                ? "ARTICLE_14"
                : "UNKNOWN";
      const fileSource = evidence(
        im.filePageUrl,
        "Fichier image exact",
        `${im.copyrightStatement} ; ${im.photographer}`,
        "file",
      );
      const meta = await json("catalog/enrichment-351/image-manifest.json");
      const raster = meta.images.find((r: any) => r.workId === w.id);
      if (raster) {
        const bytes = await readFile(raster.output);
        if (sha(bytes) !== raster.outputSha256)
          throw Error(`Image de candidate altérée : ${w.id}`);
        hashes[raster.output] = sha(bytes);
      }
      input.image = {
        kind: photo ? "faithful_non_original" : "unknown",
        basis,
        sourceUrl: im.originalUrl,
        licenseUrl:
          basis === "CC0"
            ? "https://creativecommons.org/publicdomain/zero/1.0/"
            : basis === "CC-BY-4.0"
              ? "https://creativecommons.org/licenses/by/4.0/"
              : basis === "CC-BY-2.0"
                ? "https://creativecommons.org/licenses/by/2.0/"
                : basis === "ARTICLE_14"
                  ? REPRODUCTION_DIRECTIVE
                  : null,
        credit: im.credit ?? "",
        evidence: [fileSource],
        commercialUse: basis === "UNKNOWN" ? "unknown" : "permitted",
      };
      if (commons && basis !== "UNKNOWN" && raster) {
        const commonsPolicy = evidence(
          "https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia",
          "Commons — réutilisation",
          "Fichier obtenu sur le dépôt public ; statut du fichier exact et obligations de crédit contrôlés, pas une licence inventée pour l’œuvre.",
          "policy",
        );
        input.checks.contracts = clear(
          "Fichier exact obtenu publiquement sur Commons, sans accès contractuel au site du musée. Statut de réutilisation documenté sur la fiche du fichier ; ne reprend pas automatiquement les éventuelles conditions d’un autre téléchargement.",
          [fileSource, commonsPolicy],
        );
        input.checks.otherRights = clear(
          "Aucune réserve non liée au copyright identifiée dans la préparation documentée de ce fichier exact ; droits moraux maintenus. Les restrictions de la source originale restent à examiner si l’accès ou l’usage change.",
          [src, fileSource],
        );
        if (!exactInfo || exactInfo.extmetadata?.Restrictions?.value?.trim()) {
          input.checks.contracts = unknown(
            exactInfo
              ? `Restrictions signalées sur la fiche du fichier : ${String(exactInfo.extmetadata.Restrictions.value).replace(/<[^>]*>/g, "")}. Une simple revendication ne prouve pas un copyright : examiner le droit ou le contrat invoqué.`
              : "Métadonnées du fichier exact non retrouvées dans les captures : ne pas étendre une licence à une autre version.",
          );
        }
      }
      if (/uffizi|gallerieaccademia|beniculturali/i.test(a.sourceUrl)) {
        input.checks.otherRights = unknown(
          "Bien conservé par une institution publique italienne : vérifier les règles patrimoniales, indépendamment du copyright et de l’article 14.",
        );
      }
    }
    return input;
  }
  const report: LegalReport = {
    schemaVersion: 1,
    engineVersion: ENGINE_VERSION,
    verifiedAt: asOf,
    evidenceDigest: "",
    datasets: {},
  };
  for (const dir of [
    "review-data",
    "masterpieces-data",
    "enrichment-351-data",
  ]) {
    const catalog = await json(`public/${dir}/catalog.json`);
    const items = [
      ...catalog.works,
      ...(catalog.candidates ?? []).filter(
        (c: any) => !catalog.works.some((w: any) => w.id === c.id),
      ),
    ];
    const entries = [];
    for (const w of items) {
      let input = base(w);
      const selected = selection.get(w.id);
      const original = seedImages.get(w.id)?.rights?.verification;
      if (selected) {
        const envelope = await json(selected.evidenceFile);
        const record = envelope.payload?.data?.find(
          (r: any) => `cma-${r.id}` === w.id,
        );
        if (!record || envelope.httpStatus !== 200)
          throw Error(`Preuve Cleveland absente : ${w.id}`);
        input = await cmaInput(w, record);
      } else if (original?.provider === "cma") {
        const envelope = await json(original.evidenceFile);
        if (sha(await readFile(`public${w.imageUrl}`)) !== original.sha256)
          throw Error(`Fichier image altéré : ${w.id}`);
        hashes[`public${w.imageUrl}`] = original.sha256;
        input = await cmaInput(w, envelope.response.data);
      } else if (prepared.has(w.id)) {
        input = await preparedInput(w, prepared.get(w.id));
      } else {
        // Retain known death facts even when the remaining checks cannot yet pass.
        const legacy = legacyCandidates.get(w.id);
        if (
          legacy?.identity?.status === "verified" &&
          legacy.sourceUrl === w.sourceUrl &&
          legacy.creator === w.creator
        )
          input.identity = clear(
            "Identité de l’objet exact réutilisée depuis la recherche institutionnelle figée ; ne réutilise pas son ancienne conclusion de droits pour toute l’UE.",
            [
              evidence(
                w.sourceUrl,
                "Notice institutionnelle exacte",
                `Identifiant ${w.id}, titre et auteur rapprochés dans le rapport des candidates.`,
              ),
            ],
          );
        const matches = secondary.get(normalize(w.creator)) ?? [];
        if (matches.length === 1) {
          input.authorship = "identified_single";
          input.authors = [
            {
              id: matches[0].qid,
              name: w.creator,
              deathEvidence: matches[0].years.map((year) => ({
                year,
                source: evidence(
                  `https://www.wikidata.org/wiki/${matches[0].qid}`,
                  "Wikidata — auteur",
                  "P570 : auteur exactement nommé ; autres conditions de l’objet à établir.",
                  "authority",
                ),
              })),
            },
          ];
        }
      }
      entries.push({ input, decision: evaluateLegalEU(input, asOf) });
    }
    report.datasets[dir] = {
      catalogVersion: catalog.version,
      catalogSha256: sha(JSON.stringify(catalog)),
      entries,
    };
  }
  report.evidenceDigest = sha(
    JSON.stringify(
      Object.entries(hashes).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
    ),
  );
  return { report, hashes };
}

async function main() {
  const arg = process.argv.find((a) => a.startsWith("--as-of="));
  const asOf =
    arg?.slice(8) ??
    (process.argv.includes("--check")
      ? JSON.parse(await readFile("public/legal-eu/report.json", "utf8"))
          .verifiedAt
      : new Date().toISOString().slice(0, 10));
  const { report, hashes } = await generateLegalReport(asOf);
  if (
    process.argv.includes("--check") &&
    (Date.now() - Date.parse(report.verifiedAt) > 365 * 86400000 ||
      Date.parse(report.verifiedAt) > Date.now())
  )
    throw Error(
      "Rapport juridique périmé ou daté dans le futur : nouvelle vérification nécessaire.",
    );
  const bytes = JSON.stringify(report) + "\n";
  const digest = sha(bytes);
  if (process.argv.includes("--check")) {
    if ((await readFile("public/legal-eu/report.json", "utf8")) !== bytes)
      throw Error(
        "Rapport juridique absent/périmé ou preuves modifiées. Reconstruire explicitement avec legal:build après examen des différences.",
      );
  } else {
    const run = `catalog/legal-eu/runs/${digest}`;
    await mkdir(run, { recursive: true });
    for (const [name, content] of [
      ["report.json", bytes],
      ["evidence.json", JSON.stringify(hashes, null, 2) + "\n"],
    ]) {
      try {
        await writeFile(`${run}/${name}`, content, { flag: "wx" });
      } catch (e) {
        if (
          (e as NodeJS.ErrnoException).code !== "EEXIST" ||
          (await readFile(`${run}/${name}`, "utf8")) !== content
        )
          throw e;
      }
    }
    await mkdir("public/legal-eu", { recursive: true });
    await writeFile("public/legal-eu/report.json", bytes);
  }
  for (const [name, dataset] of Object.entries(report.datasets)) {
    const counts: Record<string, number> = {};
    for (const e of dataset.entries)
      counts[e.decision.status] = (counts[e.decision.status] ?? 0) + 1;
    console.log(`${name} — ${JSON.stringify(counts)}`);
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await main();
