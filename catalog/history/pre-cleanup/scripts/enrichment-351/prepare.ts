import { readFile, writeFile } from "node:fs/promises";
import { sha256, payloadHash } from "../rarity-v2/http";
import { loadResearch, values, label, norm } from "./research";
import type { ArtworkInput, Evidence } from "../../src/rarity-engine/types";

const dir = "catalog/enrichment-351";
const json = async (path: string) => JSON.parse(await readFile(path, "utf8"));
const audit = await json(`${dir}/audit.json`),
  research = await loadResearch(),
  approvals = await json(`${dir}/approvals.json`);
for (const [file, hash] of Object.entries(audit.protectedInputs.files))
  if (sha256(await readFile(file)) !== hash)
    throw Error(`Entrée protégée modifiée : ${file}`);
const official = await json(`${dir}/official.json`),
  institutions = await json(`${dir}/institutions.json`),
  met = await json(`${dir}/met-searches.json`),
  metSelection = await json(`${dir}/met-selection.json`),
  moma = await json(`${dir}/moma-records.json`),
  specific = await json(`${dir}/specific-files.json`);
const images = {
  ...research.images,
  ...Object.fromEntries(
    specific.records
      .filter((p: any) => p.imageinfo?.length)
      .map((p: any) => [p.title, p]),
  ),
};
const evidenceHashes: Record<string, string> = {};
for (const policy of (await json(`${dir}/policies.json`)).records) {
  evidenceHashes[policy.file] = sha256(await readFile(policy.file));
}
for (const file of [
  "audit.json",
  "protected-inputs.json",
  "identities.json",
  "supplement.json",
  "approvals.json",
  "official-selection.json",
  "official.json",
  "institutions.json",
  "met-searches.json",
  "met-selection.json",
  "moma-records.json",
  "specific-files.json",
  "policies.json",
]) {
  const path = `${dir}/${file}`;
  evidenceHashes[path] = sha256(await readFile(path));
}
const decode = (s: string) =>
  s
    .replace(/&#x([a-f0-9]+);/gi, (_, n) =>
      String.fromCodePoint(parseInt(n, 16)),
    )
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(
      /&(amp|nbsp|quot|apos|rsquo|eacute|egrave);/g,
      (_, n) =>
        ({
          amp: "&",
          nbsp: " ",
          quot: '"',
          apos: "'",
          rsquo: "’",
          eacute: "é",
          egrave: "è",
        })[n as string] ?? " ",
    );
const plain = (s: string) =>
  decode(
    s
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]*>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
async function evidence(
  file: string,
  scope: Evidence["scope"] = "artwork",
): Promise<{ source: any; evidence: Evidence }> {
  const bytes = await readFile(file);
  evidenceHashes[file] = sha256(bytes);
  const c = JSON.parse(bytes.toString());
  if (
    "payload" in c &&
    (c.status !== "available" || c.payloadSha256 !== payloadHash(c.payload))
  )
    throw Error(`Capture corrompue : ${file}`);
  if ("httpStatus" in c && !c.payload && c.httpStatus !== 200)
    throw Error(`Notice inaccessible : ${file}`);
  return {
    source: c,
    evidence: {
      id: sha256(file).slice(0, 24),
      provider: c.provider ?? new URL(c.url).hostname,
      independentGroup:
        (c.url ?? "").includes("wikimedia") ||
        (c.url ?? "").includes("wikidata")
          ? "wikimedia"
          : new URL(c.url).hostname,
      url: c.url,
      retrievedAt: c.retrievedAt,
      file,
      sha256: sha256(bytes),
      tier: 1,
      scope,
    },
  };
}
const textOf = (value: any): string =>
  typeof value === "string"
    ? value
    : Array.isArray(value)
      ? value.map(textOf).join(" ; ")
      : value && typeof value === "object"
        ? Object.values(value).map(textOf).join(" ; ")
        : "";
const metadataValue = (m: any, k: string) =>
  textOf(
    (m.metadata ?? []).find((i: any) =>
      Object.values(i.label ?? {})
        .flat()
        .some((v: any) => norm(String(v)) === norm(k)),
    )?.value,
  );
const approved: any[] = [],
  observations: any[] = [];
const iconic = new Set([
  "0001",
  "0002",
  "0008",
  "0009",
  "0012",
  "0015",
  "0017",
  "0029",
  "0032",
  "0045",
  "0067",
  "0072",
  "0073",
  "0078",
  "0098",
  "0099",
  "0106",
  "0111",
  "0114",
  "0116",
  "0120",
  "0133",
  "0136",
  "0137",
  "0144",
  "0148",
  "0157",
  "0158",
  "0172",
  "0173",
  "0175",
  "0176",
  "0179",
  "0180",
  "0183",
  "0186",
  "0195",
  "0196",
  "0199",
  "0200",
  "0203",
  "0217",
  "0224",
  "0252",
  "0253",
  "0261",
  "0265",
  "0267",
  "0274",
  "0275",
  "0281",
  "0282",
  "0291",
  "0307",
]);
function creatorDeath(row: any) {
  const deaths = row.creatorIds
    .flatMap((id: string) => values(research.entities[id], "P570"))
    .map((v: any) => Number(v.time?.match(/^\+(\d{4})/)?.[1]))
    .filter(Number.isFinite);
  return deaths.length ? Math.max(...deaths) : null;
}
function defaultAnalysis(row: any): any {
  const e = row.entity,
    creatorDead = creatorDeath(row),
    classIds = values(e, "P31").map((v) => v.id);
  const scopeBad =
    classIds.some((id) => ["Q4167410", "Q5", "Q3305213"].includes(id)) &&
    !values(e, "P170").length;
  const series =
    /\(série\)|ensemble|identifier exemplaire|composition de Myron|type édicule|motif textile/.test(
      row.title,
    ) ||
    [
      "0154",
      "0155",
      "0156",
      "0176",
      "0177",
      "0187",
      "0206",
      "0214",
      "0226",
      "0227",
      "0228",
      "0229",
      "0239",
      "0242",
      "0258",
      "0259",
      "0263",
      "0276",
      "0290",
      "0293",
      "0294",
      "0295",
      "0297",
      "0304",
      "0305",
      "0323",
      "0334",
      "0343",
      "0344",
      "0345",
      "0346",
      "0347",
    ].includes(row.suffix);
  const file = values(e, "P18")[0],
    image = file ? images[`File:${file}`]?.imageinfo?.[0] : null;
  const originalCopyrightConcern =
    (!!creatorDead && creatorDead > 1955) ||
    (Number(row.suffix) >= 209 && Number(row.suffix) <= 251);
  let group = "not_usable_with_current_files",
    reason =
      "Identité institutionnelle exacte et fichier commercial de qualité pas encore conjointement vérifiés ; ne pas publier sur la base d’un titre ou d’une piste Wikipédia.";
  if (
    originalCopyrightConcern ||
    (Number(row.suffix) >= 274 && Number(row.suffix) <= 315) ||
    Number(row.suffix) >= 346
  ) {
    group = "legal_review_required";
    reason =
      "Œuvre, version/photographie, contributions et territoires doivent être vérifiés séparément ; aucune autorisation commerciale complète établie.";
  } else if (row.artistMatched && image) {
    group = "legal_review_required";
    reason =
      "Piste d’œuvre et de reproduction trouvée ; licence et droits territoriaux non encore approuvés avec une identité primaire complète.";
  }
  if (series || scopeBad || !row.qid) {
    if (!originalCopyrightConcern && Number(row.suffix) < 346) {
      group = "not_usable_with_current_files";
      reason =
        "Titre collectif, série, homonyme, version non choisie ou piste insuffisante : aucun fichier unique autorisé ne peut être retenu en l’état.";
    }
  }
  return {
    inputId: row.id,
    inputArtist: row.artist,
    inputTitle: row.title,
    category: row.category,
    priority: iconic.has(row.suffix) ? "iconic_masterpiece_research" : "high",
    group,
    reason: approvals.notes[row.suffix] ?? reason,
    presence: "not_matched_by_exact_identity",
    existingMatch: null,
    internalDuplicate: null,
    identity: {
      status: row.artistMatched && !series ? "metadata_only" : "unresolved",
      wikidataId: row.qid,
      alternativeQid: row.alternativeQid,
      artistMatched: row.artistMatched,
      inventoryLeads: values(e, "P217"),
      institutionLeads: values(e, "P195").map((v) => ({
        qid: v.id,
        label: label(research.entities[v.id]),
      })),
      creatorDeathYear: creatorDead,
      wikipediaUrl: row.page?.fullurl ?? null,
    },
    imageLead: image
      ? {
          fileTitle: `File:${file}`,
          originalUrl: image.url,
          filePageUrl: image.descriptionurl,
          width: image.width,
          height: image.height,
          declaredLicense: image.extmetadata?.LicenseShortName?.value ?? null,
          status: "unapproved_not_an_authorisation",
        }
      : null,
    territories: {
      France_Belgium_EU: "not_cleared",
      United_States: "not_cleared",
      otherTerritories: "not_assessed",
    },
    proposeNewCard: false,
    proposal: null,
    sources: [
      ...(row.qid
        ? [
            {
              url: `https://www.wikidata.org/wiki/${row.qid}`,
              evidenceFile: research.entityFiles[row.qid],
              scope: "identity_lead_only",
            },
          ]
        : []),
      ...(image
        ? [{ url: image.descriptionurl, scope: "image_lead_only" }]
        : []),
    ],
  };
}
for (const row of research.records) {
  const observation = defaultAnalysis(row),
    old = audit.records.find((r: any) => r.id === row.id);
  observation.existingMatch = old.existingMatch;
  observation.internalDuplicate = old.internalDuplicate;
  if (old.existingMatch) {
    observation.presence = [
      "series_part_existing",
      "study_or_fragment_existing",
    ].includes(old.existingMatch.relation)
      ? "partially_represented"
      : "already_represented";
    observation.reason = old.existingMatch.note;
  }
  if (old.internalDuplicate) {
    observation.group = "not_usable_with_current_files";
    observation.presence = "duplicate_input_topic";
    observation.reason = old.internalDuplicate.note;
    observations.push(observation);
    continue;
  }
  if (old.existingMatch && observation.presence === "already_represented") {
    observation.group = "ready_for_review";
    observation.reason =
      old.existingMatch.note +
      " Réutiliser l’existant, sans nouvelle carte et sans écraser sa rareté humaine.";
    observation.proposeNewCard = false;
    observations.push(observation);
    continue;
  }
  let input: ArtworkInput | undefined,
    primaryEvidence: Evidence | undefined,
    sourceUrl = "",
    institution = "",
    inventory = "",
    versionNote = "",
    sourceFile = "",
    qid = row.qid,
    displayDate = "",
    medium = "",
    image: any,
    creator = row.artist,
    region = "Europe",
    copyrightBasis = "",
    citationTexts: string[] | null = null,
    exhibitionTexts: string[] | null = null,
    educationText: string | null = null;
  const metChoice = metSelection.records.find(
    (c: any) =>
      c.input === row.suffix && !approvals.metExclude.includes(row.suffix),
  );
  if (metChoice) {
    const found = met.searches
      .flatMap((s: any) => s.records)
      .find((r: any) => r.id === metChoice.objectId);
    if (!found) throw Error(`Notice Met manquante : ${row.suffix}`);
    const record = await evidence(found.evidenceFile),
      m = record.source.payload;
    if (
      m.objectID !== metChoice.objectId ||
      m.title !== metChoice.expectedTitle ||
      m.accessionNumber !== metChoice.expectedAccession ||
      m.isPublicDomain !== true ||
      !m.primaryImage
    )
      throw Error(`Met non concordant : ${row.suffix}`);
    sourceFile = found.evidenceFile;
    primaryEvidence = record.evidence;
    sourceUrl = m.objectURL;
    institution = "The Metropolitan Museum of Art";
    inventory = m.accessionNumber;
    versionNote = metChoice.versionNote;
    displayDate = m.objectDate;
    medium = m.medium;
    creator = m.artistDisplayName;
    region = metChoice.region;
    qid = m.objectWikidata_URL?.match(/Q\d+$/)?.[0] ?? null;
    image = {
      originalUrl: m.primaryImage,
      downloadUrl: m.primaryImage,
      filePageUrl: m.objectURL,
      license: "CC0",
      licenseUrl:
        "https://www.metmuseum.org/about-the-met/policies-and-documents/open-access",
      credit: `${m.artistDisplayName}. ${m.title}, ${m.objectDate}. ${institution}, ${inventory}. Open Access / CC0.`,
      evidenceFiles: [sourceFile],
      originalWidth: null,
      originalHeight: null,
      photographer: "Met Open Access",
      copyrightStatement: m.isPublicDomain,
    };
    copyrightBasis = `Notice officielle : isPublicDomain=true pour l’objet exact et sa reproduction Open Access. ${metChoice.deathYear ? `Auteur mort en ${metChoice.deathYear} ; durée ordinaire vie + 70 expirée en France/Belgique-UE.` : "Auteur sous pseudonyme d’identité incertaine ; estampe publiée en 1794, œuvre ancienne déclarée domaine public par le musée, pas une attribution de date de mort inventée."} L’objet/tirage précis et la publication ancienne sont distingués.`;
    input = {
      id: `e351-met-${m.objectID}`,
      title: row.title,
      creator,
      creatorMode: metChoice.deathYear ? "identified" : "uncertain",
      category: /Photograph/.test(m.classification)
        ? "photography"
        : "painting",
      medium,
      displayDate,
      yearStart: m.objectBeginDate,
      yearEnd: m.objectEndDate,
      institution: "met",
      context: m.culture || row.category,
      externalIds: [
        { provider: "met", id: String(m.objectID) },
        ...(qid ? [{ provider: "wikidata", id: qid }] : []),
      ],
      identity: {
        status: "verified",
        confidence: 0.98,
        reasons: [
          versionNote,
          "Notice complète avec inventaire et champ de droits contrôlés ; aucune étude voisine adoptée.",
        ],
      },
      activeLevel: 0,
      exploratoryScore: null,
      institutionEvidence: [primaryEvidence],
      workAudience: [],
      artistAudiences: [],
      audienceScope: "exact_object",
      institutionSignals: {
        collectionVerified: true,
        publicRecord: true,
        highlight: m.isHighlight === true,
        citations: null,
        exhibitions: null,
        educationText: null,
      },
      editorial: {},
    };
  } else {
    const chosen = approvals.institutions.includes(row.suffix)
      ? institutions.records.find(
          (c: any) => c.input === row.suffix && c.status === "available",
        )
      : undefined;
    const page = approvals.official.includes(row.suffix)
      ? official.records.find(
          (c: any) =>
            c.input === row.suffix && c.httpStatus === 200 && c.tokensMatched,
        )
      : undefined;
    const momaRecord = approvals.moma.includes(row.suffix)
      ? moma.records.find(
          (m: any) =>
            m.Artist === "Henri Rousseau" &&
            values(row.entity, "P217").includes(m.AccessionNumber),
        )
      : undefined;
    if (!chosen && !page && !momaRecord) {
      observations.push(observation);
      continue;
    }
    const ancient = ["0274", "0275"].includes(row.suffix);
    if (!row.artistMatched && !ancient) {
      observation.reason =
        "Notice primaire trouvée, mais auteur/identité Wikidata non concordants : rapprochement à compléter plutôt qu’inventer un QID.";
      observations.push(observation);
      continue;
    }
    const fileTitle =
      approvals.fileOverrides[row.suffix] ??
      `File:${values(row.entity, "P18")[0]}`;
    const file = images[fileTitle],
      info = file?.imageinfo?.[0],
      metadata = info?.extmetadata;
    if (!info || !metadata) {
      observation.group = "not_usable_with_current_files";
      observation.reason =
        "Notice exacte retrouvée, mais fichier de reproduction non identifié avec ses droits.";
      observations.push(observation);
      continue;
    }
    const license = metadata.LicenseShortName?.value;
    if (!["Public domain", "CC0", "CC BY 2.0", "CC BY 4.0"].includes(license)) {
      observation.group = "legal_review_required";
      observation.reason =
        "Licence de fichier ou auteur de photographie hors des approbations documentées de ce lot.";
      observations.push(observation);
      continue;
    }
    if (
      license.startsWith("CC BY") &&
      !approvals.photographerCredits[row.suffix]
    )
      throw Error(`Attribution photographique non documentée : ${row.suffix}`);
    if (Math.max(info.width, info.height) < 1600) {
      observation.group = "not_usable_with_current_files";
      observation.reason = `Image identifiée mais seulement ${info.width}×${info.height} ; rechercher une reproduction de plus grande définition sans changer de version.`;
      observations.push(observation);
      continue;
    }
    const death = creatorDeath(row);
    if (!ancient && (death === null || death > 1955))
      throw Error(`Durée d’auteur non établie : ${row.suffix}`);
    if (page) {
      const record = await evidence(page.evidenceFile);
      primaryEvidence = record.evidence;
      sourceFile = page.evidenceFile;
      sourceUrl = page.url;
      inventory = page.inventory;
      versionNote = page.note;
      const html = record.source.html;
      const bibliography = html.match(
        /<ul class="bibliography-list">([\s\S]*?)<\/ul>/,
      )?.[1];
      citationTexts = bibliography
        ? [
            ...new Set(
              [...bibliography.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map(
                (m) => plain(m[1]),
              ),
            ),
          ]
        : null;
      const expo = html.match(
        /id="tabpanel-b3"([\s\S]*?)id="tabpanel-b4"/,
      )?.[1];
      exhibitionTexts = expo
        ? [
            ...new Set(
              [...expo.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) =>
                plain(m[1]),
              ),
            ),
          ]
        : null;
      const overview = html.match(
        /<h3[^>]*>Overview<\/h3>([\s\S]*?)(?:<h3|<h2)/,
      )?.[1];
      educationText = overview ? plain(overview) : null;
      institution = page.url.includes("nationalgallery.org.uk")
        ? "The National Gallery, London"
        : page.url.includes("rijksmuseum")
          ? "Rijksmuseum"
          : page.url.includes("courtauld")
            ? "The Courtauld Gallery"
            : page.url.includes("marmottan")
              ? "Musée Marmottan Monet"
              : page.url.includes("phillipscollection")
                ? "The Phillips Collection"
                : page.url.includes("krollermuller")
                  ? "Kröller-Müller Museum"
                  : page.url.includes("getty.edu")
                    ? "J. Paul Getty Museum"
                    : page.url.includes("vangoghmuseum")
                      ? "Van Gogh Museum"
                      : page.url.includes("buffaloakg")
                        ? "Buffalo AKG Art Museum"
                        : page.url.includes("nasjonalmuseet")
                          ? "Nasjonalmuseet"
                          : page.url.includes("hamburger")
                            ? "Hamburger Kunsthalle"
                            : "Institution, voir notice";
      const structured = [
        ...html.matchAll(
          /<script[^>]*type="application\/ld(?:\+|&#x2[Bb];)json"[^>]*>([\s\S]*?)<\/script>/g,
        ),
      ]
        .flatMap((m) => {
          try {
            const v = JSON.parse(m[1]);
            return Array.isArray(v) ? v : [v];
          } catch {
            return [];
          }
        })
        .find((v) => typeof v.dateCreated === "string");
      displayDate = plain(
        html.match(/<dt>Date made<\/dt>\s*<dd>([\s\S]*?)<\/dd>/)?.[1] ??
          structured?.dateCreated ??
          "",
      );
      medium = plain(
        html.match(
          /<dt>Medium and support<\/dt>\s*<dd>([\s\S]*?)<\/dd>/,
        )?.[1] ??
          structured?.material ??
          "",
      );
      if (row.suffix === "0158") {
        if (!/between\s+1880\s+and\s+1881/i.test(plain(html)))
          throw Error("Datation Phillips non retrouvée");
        displayDate = "1880–1881";
        medium = "Oil on canvas";
      }
    } else if (chosen) {
      const record = await evidence(chosen.evidenceFile);
      primaryEvidence = record.evidence;
      sourceFile = chosen.evidenceFile;
      sourceUrl = chosen.url;
      if (chosen.provider === "orsay") {
        const m = record.source.payload;
        inventory = metadataValue(m, "Accession number");
        if (!inventory) throw Error(`Inventaire Orsay absent ${row.suffix}`);
        displayDate = metadataValue(m, "Date");
        medium = metadataValue(m, "Materials and techniques");
        institution = "Musée d’Orsay";
        versionNote = `Objet d’Orsay ${inventory}, confirmé dans le manifeste officiel, titre ${metadataValue(m, "Title")}. Les variantes et autres versions ne sont pas substituées.`;
      } else {
        const html = record.source.html;
        inventory = values(row.entity, "P217")[0] ?? "";
        if (!inventory) throw Error("Inventaire Louvre absent");
        const allInventories = values(row.entity, "P217");
        if (
          !allInventories.some((s: string) =>
            norm(plain(html)).includes(norm(s)),
          )
        )
          throw Error(`Inventaire Louvre non concordant : ${row.suffix}`);
        institution = "Musée du Louvre";
        versionNote = `Objet Louvre ${inventory}, notice ark exacte, auteur et version rapprochés ; ne pas confondre détails, copies et autres musées.`;
        const visual = JSON.parse(
          html.match(
            /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/,
          )?.[1] ?? "{}",
        );
        displayDate = String(visual.dateCreated ?? "").replace(
          /^Date de création\/fabrication\s*:\s*/,
          "",
        );
        medium = String(visual.material ?? "");
        const bibliography = html
          .split('id="bibliography-panel"')[1]
          ?.split("</ul>")[0];
        citationTexts = bibliography
          ? [
              ...new Set(
                [...bibliography.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map(
                  (m) => plain(m[1]),
                ),
              ),
            ]
          : null;
        const expo = html
          .split('id="exhibition-content"')[1]
          ?.split("</ul>")[0];
        exhibitionTexts = expo
          ? [
              ...new Set(
                [...expo.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) =>
                  plain(m[1]),
                ),
              ),
            ]
          : null;
      }
    } else if (momaRecord) {
      sourceFile = `${dir}/moma-records.json`;
      const bytes = await readFile(sourceFile);
      evidenceHashes[sourceFile] = sha256(bytes);
      primaryEvidence = {
        id: sha256(sourceFile).slice(0, 24),
        provider: "moma",
        independentGroup: "moma",
        url: moma.url,
        retrievedAt: moma.retrievedAt,
        file: sourceFile,
        sha256: sha256(bytes),
        tier: 1,
        scope: "artwork",
      };
      sourceUrl = momaRecord.URL;
      inventory = momaRecord.AccessionNumber;
      institution = "The Museum of Modern Art";
      displayDate = momaRecord.Date;
      medium = momaRecord.Medium;
      versionNote = `MoMA ObjectID ${momaRecord.ObjectID}, inventaire ${inventory}, artiste Henri Rousseau confirmé dans le CSV officiel. Les homonymes de Wyatt Kahn ou Ellsworth Kelly ne sont pas adoptés.`;
    }
    const wikiYear =
      values(row.entity, "P571")
        .map((v) => v.time?.match(/^([+-])(\d{4})/))
        .filter(Boolean)
        .map((v) => Number(v[2]) * (v[1] === "-" ? -1 : 1))
        .find(Number.isFinite) ?? null;
    const primaryYears = [
      ...displayDate.matchAll(/\b(1[0-9]{3}|20[0-2][0-9])\b/g),
    ].map((m) => Number(m[1]));
    const year = primaryYears[0] ?? wikiYear;
    // Display dates are not a substitute for publication evidence; Commons' exact-file declaration is retained separately.
    if (!displayDate || displayDate.length > 180)
      displayDate = year
        ? String(year)
        : "Datation : voir notice institutionnelle";
    if (!medium)
      medium =
        values(row.entity, "P186")
          .map((v) => label(research.entities[v.id]))
          .filter(Boolean)
          .join(", ") || "Peinture — technique précise dans la notice";
    const imageEvidence = await evidence(file.evidenceFile);
    const exactFileDeclaration = `${license}. ${plain(metadata.UsageTerms?.value ?? "")}. Catégories de droit pertinentes : ${(
      metadata.Categories?.value ?? ""
    )
      .split("|")
      .filter((s: string) => /PD-|public domain|CC-Zero/i.test(s))
      .join(" ; ")}`;
    image = {
      originalUrl: info.url,
      downloadUrl: info.thumburl ?? info.url,
      filePageUrl: info.descriptionurl,
      license:
        license === "Public domain"
          ? "Domaine public / reproduction plane"
          : license,
      licenseUrl:
        metadata.LicenseUrl?.value?.replace(/^http:/, "https:") ??
        info.descriptionurl,
      credit:
        approvals.photographerCredits[row.suffix] ??
        `${row.artist}, ${row.title}. ${institution}, ${inventory}. Source du fichier : ${plain(metadata.Credit?.value ?? "Commons")}. Domaine public déclaré sur la reproduction exacte.`,
      evidenceFiles: [file.evidenceFile, sourceFile],
      originalWidth: info.width,
      originalHeight: info.height,
      photographer: approvals.photographerCredits[row.suffix]
        ? plain(metadata.Artist?.value ?? "")
        : "Reproduction plane ; source de numérisation créditée",
      copyrightStatement: exactFileDeclaration,
    };
    void imageEvidence;
    if (license === "CC BY 2.0") {
      for (const st of specific.statements.filter(
        (s: any) => s.title === fileTitle,
      )) {
        if (st.evidenceFile) {
          const proof = await evidence(st.evidenceFile);
          const text = proof.source.payload.parse.wikitext["*"];
          if (
            !text.includes("Jean-Pierre Dalbéra") ||
            !text.includes("cc-by-2.0")
          )
            throw Error("Attribution CC BY non confirmée");
          image.evidenceFiles.push(st.evidenceFile);
        }
      }
    }
    copyrightBasis = `${ancient ? "Objet grec antique identifié par inventaire et datation du musée ; aucun auteur moderne supposé ni date de décès inventée." : `Auteur mort en ${death} (entité d’auteur sourcée) ; droits patrimoniaux ordinaires expirés France/Belgique-UE.`} Le fichier exact est indépendamment déclaré ${image.license}, avec preuve de source et conditions. Pour les États-Unis : déclaration de domaine public de l’œuvre ancienne sur le fichier et son contexte de publication historique, pas déduction du seul statut d’entrée ni d’une date P571. Les œuvres du XXe siècle à première publication non établie, les contributions récentes et les cas territoriaux particuliers restent exclus de cette approbation. Droits moraux et restrictions non liées au copyright à respecter.`;
    input = {
      id: `e351-${row.qid}`,
      title: row.title,
      creator,
      creatorMode: ancient ? "anonymous" : "identified",
      category: ancient
        ? "antiquity"
        : row.suffix === "0103"
          ? "sculpture"
          : "painting",
      medium,
      displayDate,
      yearStart: year,
      yearEnd: primaryYears.at(-1) ?? year,
      institution: new URL(sourceUrl).hostname,
      context: row.category,
      externalIds: [
        { provider: "wikidata", id: row.qid },
        { provider: "institution-inventory", id: inventory },
      ],
      identity: {
        status: "verified",
        confidence: 0.97,
        reasons: [
          versionNote,
          "Institution, titre, auteur, fichier et inventaire rapprochés ; les corrections documentées de Wikidata ne sont pas masquées.",
        ],
      },
      activeLevel: 0,
      exploratoryScore: null,
      institutionEvidence: [primaryEvidence!],
      workAudience: [],
      artistAudiences: [],
      audienceScope: "exact_object",
      institutionSignals: {
        collectionVerified: true,
        publicRecord: true,
        highlight: null,
        citations:
          citationTexts?.map((text) => ({ key: norm(text), text })) ?? null,
        exhibitions:
          exhibitionTexts?.map((title) => ({ key: norm(title), title })) ??
          null,
        educationText,
      },
      editorial: {},
    };
  }
  if (!input || !image) {
    observations.push(observation);
    continue;
  }
  const objectKey = `${institution}:${norm(inventory)}`;
  if (approved.some((a) => a.objectKey === objectKey))
    throw Error(`Objet exact proposé deux fois : ${objectKey}`);
  observation.group = "ready_for_review";
  observation.presence = "missing_exact_object";
  observation.reason = versionNote;
  observation.proposeNewCard = true;
  observation.identity = {
    ...observation.identity,
    status: "verified",
    wikidataId: qid,
    selectedInventory: inventory,
    selectedInstitution: institution,
  };
  observation.territories = {
    France_Belgium_EU: "documented_review_scope_not_legal_warranty",
    United_States: "documented_review_scope_not_legal_warranty",
    otherTerritories: "not_assessed",
  };
  const record = {
    inputId: row.id,
    suffix: row.suffix,
    objectKey,
    workId: input.id,
    input,
    sourceUrl,
    institution,
    inventoryNumber: inventory,
    wikidataId: qid,
    creatorIds: row.creatorIds,
    priority: observation.priority,
    region,
    versionNote,
    rights: {
      status: "cleared",
      license: image.license,
      licenseUrl: image.licenseUrl,
      artwork: copyrightBasis,
      image:
        image.copyrightStatement ||
        "CC0 / Open Access institutionnel pour le fichier précis ; usage commercial permis.",
      jurisdiction:
        "Portée documentaire France/Belgique-UE et États-Unis uniquement ; pas d’autorisation mondiale. La validation éditoriale et les obligations de crédit restent nécessaires avant publication. Pas d’activation automatique.",
      credit: image.credit,
    },
    image,
    rasterVerified: false,
  };
  approved.push(record);
  observations.push(observation);
}
await writeFile(
  `${dir}/prepared.json`,
  JSON.stringify(
    {
      stage: "metadata_approved_pending_raster_and_v2",
      scope: approvals.scope,
      evidenceHashes,
      observations,
      approved,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `${observations.length} lignes analysées ; ${approved.length} nouveaux objets approuvés documentairement, sans activation ni téléchargement automatique.`,
);
