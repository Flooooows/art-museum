import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { sha256, payloadHash } from "../rarity-v2/http";
import { createScorer } from "../masterpieces/score";
import type {
  ArtworkInput,
  MonthlyAudience,
  Evidence,
} from "../../src/rarity-engine/types";
import { REVIEW_RARITIES, type ReviewArtwork } from "../../src/review/types";
import { parseCandidateCatalog } from "../../src/masterpieces/model";

const dir = "catalog/enrichment-351",
  json = async (file: string) => JSON.parse(await readFile(file, "utf8"));
const prepared = await json(`${dir}/prepared.json`),
  audiences = await json(`${dir}/audiences.json`),
  manifest = await json(`${dir}/image-manifest.json`),
  audit = await json(`${dir}/audit.json`),
  approval = await json(`${dir}/approvals.json`);
for (const [file, hash] of Object.entries(audit.protectedInputs.files))
  if (sha256(await readFile(file)) !== hash)
    throw Error(`Entrée protégée modifiée : ${file}`);
for (const [file, hash] of Object.entries(prepared.evidenceHashes))
  if (sha256(await readFile(file)) !== hash)
    throw Error(`Preuve modifiée : ${file}`);
const manualReference = await json(
  "catalog/masterpieces/manual-reference.local.json",
);
if (
  sha256(await readFile(manualReference.path)) !==
  audit.protectedInputs.manualDecisionsSha256
)
  throw Error("L’export humain a changé");
const evidenceHashes: Record<string, string> = { ...prepared.evidenceHashes };
for (const name of ["prepared.json", "audiences.json", "image-manifest.json"]) {
  const file = `${dir}/${name}`;
  evidenceHashes[file] = sha256(await readFile(file));
}
const expectedMonths = Array.from(
  { length: 12 },
  (_, i) =>
    new Date(Date.UTC(2025, 9 + i, 1))
      .toISOString()
      .slice(0, 7)
      .replace("-", "") + "0100",
);
async function pages(
  qid: string | null,
  scope: Evidence["scope"],
): Promise<MonthlyAudience[]> {
  const result: MonthlyAudience[] = [];
  for (const item of audiences.records.filter(
    (r: any) => r.qid === qid && r.status === "available",
  )) {
    const bytes = await readFile(item.evidenceFile),
      c = JSON.parse(bytes.toString());
    evidenceHashes[item.evidenceFile] = sha256(bytes);
    if (
      c.status !== "available" ||
      c.payloadSha256 !== payloadHash(c.payload) ||
      !Array.isArray(c.payload.items) ||
      c.payload.items.some((m: any) => !expectedMonths.includes(m.timestamp))
    )
      throw Error("Capture d’audience corrompue ou période différente");
    result.push({
      title: item.title,
      language: item.language,
      months: c.payload.items.map((m: any) => ({
        timestamp: m.timestamp,
        views: m.views,
      })),
      expectedMonths,
      evidence: [
        {
          id: sha256(c.url).slice(0, 24),
          provider: "wikimedia",
          independentGroup: "wikimedia",
          url: c.url,
          retrievedAt: c.retrievedAt,
          file: item.evidenceFile,
          sha256: sha256(bytes),
          tier: 1,
          scope,
        },
      ],
    });
  }
  return result;
}
const score = await createScorer();
Object.assign(evidenceHashes, score.referenceFiles);
const observations = structuredClone(prepared.observations),
  cards: ReviewArtwork[] = [],
  results: any[] = [];
const priorityOrder = [
  "0111",
  "0114",
  "0029",
  "0067",
  "0073",
  "0045",
  "0148",
  "0173",
  "0157",
  "0158",
  "0098",
  "0100",
  "0195",
  "0196",
  "0274",
  "0275",
];
for (const approved of prepared.approved) {
  const observation = observations.find(
      (o: any) => o.inputId === approved.inputId,
    ),
    raster = manifest.images.find((i: any) => i.workId === approved.workId);
  if (!raster) {
    observation.group = "not_usable_with_current_files";
    observation.proposeNewCard = false;
    observation.reason = `Identité et licence documentées, mais fichier non prêt : ${manifest.failures.find((f: any) => f.workId === approved.workId)?.error ?? "fichier local non vérifié"}.`;
    continue;
  }
  if (
    raster.output !== `public/enrichment-351-images/${approved.workId}.webp` ||
    sha256(await readFile(raster.output)) !== raster.outputSha256 ||
    raster.objectKey !== approved.objectKey ||
    raster.downloadUrl !== approved.image.downloadUrl ||
    raster.approvalSha256 !==
      sha256(
        JSON.stringify({
          object: approved.objectKey,
          rights: approved.rights,
          image: approved.image,
        }),
      )
  )
    throw Error(`Raster modifié : ${approved.workId}`);
  const input: ArtworkInput = structuredClone(approved.input),
    scope = audiences.scopes.find((s: any) => s.workId === approved.workId);
  input.workAudience = await pages(scope?.workQid ?? null, "artwork");
  input.artistAudiences = [];
  for (const artistQid of scope?.artistQids ?? []) {
    const available = await pages(artistQid, "creator");
    if (available.length) input.artistAudiences.push(available);
  }
  input.audienceScope = scope?.audienceScope ?? "exact_object";
  const proposal = score(input);
  const rights = {
    ...approved.rights,
    image: `${approved.rights.image} Crédit exact : ${approved.image.credit}`,
  };
  const work: ReviewArtwork = {
    id: approved.workId,
    title: input.title,
    creator: input.creator,
    date: input.displayDate,
    medium: input.medium,
    context: input.context,
    family:
      input.category === "antiquity"
        ? "Antiquité"
        : input.category === "sculpture"
          ? "Sculpture"
          : input.category === "photography"
            ? "Photographie"
            : ["0043", "0254", "0260", "0261"].includes(approved.suffix)
              ? "Estampes"
              : "Peinture",
    institution: approved.institution,
    sourceUrl: approved.sourceUrl,
    imageUrl: `/enrichment-351-images/${approved.workId}.webp`,
    license: `${rights.license} · ${approved.image.credit}`,
    origin: "new",
    activeLevel: null,
    proposal,
  };
  cards.push(work);
  observation.proposal = proposal;
  observation.rights = rights;
  observation.image = {
    filePageUrl: approved.image.filePageUrl,
    originalUrl: approved.image.originalUrl,
    downloadUrl: raster.downloadUrl,
    localUrl: work.imageUrl,
    originalWidth: approved.image.originalWidth ?? raster.downloadWidth,
    originalHeight: approved.image.originalHeight ?? raster.downloadHeight,
    localWidth: raster.width,
    localHeight: raster.height,
    outputSha256: raster.outputSha256,
    license: approved.image.license,
    licenseUrl: approved.image.licenseUrl,
    credit: approved.image.credit,
    status: "verified_raster_metadata_and_documented_scope",
  };
  observation.sources = [
    { url: approved.sourceUrl, scope: "exact_institution_record" },
    { url: approved.image.filePageUrl, scope: "exact_image_rights" },
    { url: approved.image.licenseUrl, scope: "licence" },
  ];
  observation.identity.selectedInventory = approved.inventoryNumber;
  observation.identity.selectedInstitution = approved.institution;
  observation.culturalPriorityNotAlgorithmOverride =
    approved.priority === "iconic_masterpiece_research";
  const result = {
    ...approved,
    rights,
    input,
    rasterVerified: true,
    raster,
    proposal,
    audienceScopeNote: scope?.reason ?? "Pas d’audience exacte exploitable.",
  };
  results.push(result);
}
cards.sort((a, b) => {
  const aa = results.find((r) => r.workId === a.id),
    bb = results.find((r) => r.workId === b.id);
  const rank = (r: any) =>
    priorityOrder.includes(r.suffix) ? priorityOrder.indexOf(r.suffix) : 100;
  return (
    rank(aa) - rank(bb) ||
    b.proposal.score - a.proposal.score ||
    a.id.localeCompare(b.id)
  );
});
const oldCatalog = await json("public/review-data/catalog.json"),
  previous = await json("masterpieces-candidates.json"),
  manual = await json(manualReference.path);
const allExisting = [...oldCatalog.works, ...previous.candidates];
for (const observation of observations) {
  if (observation.group === "ready_for_review" && !observation.proposeNewCard) {
    const found = allExisting.find(
      (w) => w.id === observation.existingMatch?.id,
    );
    if (!found) throw Error("Correspondance existante perdue");
    observation.proposal = found.proposal;
    observation.proposalOrigin =
      "previously_frozen_v2_not_recomputed_or_applied";
    observation.existingHumanDecision =
      manual.decisions.find((d: any) => d.artworkId === found.id)?.finalLevel ??
      null;
    observation.sources = [
      { url: found.sourceUrl, scope: "existing_preserved_record" },
    ];
    observation.existingRecord = {
      id: found.id,
      title: found.title,
      creator: found.creator,
      imageUrl: found.imageUrl ?? null,
      licence: found.rights?.license ?? found.license ?? null,
      rightsScope: "existing_preserved_not_reassessed_by_this_batch",
    };
    observation.territories = {
      France_Belgium_EU: "existing_documented_rights_reused_no_new_publication",
      United_States: "existing_documented_rights_reused_no_new_publication",
      otherTerritories: "not_assessed",
    };
  }
  if (
    ![
      "ready_for_review",
      "legal_review_required",
      "not_usable_with_current_files",
    ].includes(observation.group)
  )
    throw Error("Groupe inconnu");
}
if (
  observations.length !== 351 ||
  new Set(observations.map((r: any) => r.inputId)).size !== 351
)
  throw Error("Résultat non exhaustif");
const distribution = (levels: number[]) =>
  REVIEW_RARITIES.map((rarity, level) => ({
    rarity,
    count: levels.filter((v) => v === level).length,
  }));
const groups = Object.fromEntries(
  [
    "ready_for_review",
    "legal_review_required",
    "not_usable_with_current_files",
  ].map((g) => [g, observations.filter((r: any) => r.group === g).length]),
);
const summary = {
  inputEntries: 351,
  groups,
  newReady: cards.length,
  alreadyRepresented: observations.filter(
    (r: any) => r.presence === "already_represented",
  ).length,
  partiallyRepresented: observations.filter(
    (r: any) => r.presence === "partially_represented",
  ).length,
  internalDuplicateTopics: observations.filter(
    (r: any) => r.presence === "duplicate_input_topic",
  ).length,
  curatorialMasterpieceResearchCandidates: results.filter(
    (r) => r.priority === "iconic_masterpiece_research",
  ).length,
  newAlgorithmMasterpieces: cards.filter((w) => w.proposal.level === 4).length,
  allNewProposalsProvisional: cards.every(
    (w) => w.proposal.status === "provisional",
  ),
  proposedAdditions: distribution(cards.map((w) => w.proposal.level)),
  before1000: distribution(oldCatalog.works.map((w: any) => w.proposal.level)),
  afterHypotheticalReviewOnly: distribution(
    [...oldCatalog.works, ...cards].map((w: any) => w.proposal.level),
  ),
  activeGameUnchanged: [43, 39, 14, 3, 1],
  humanReference: audit.humanReference,
  licences: Object.fromEntries(
    [...new Set(results.map((r) => r.image.license))].map((license) => [
      license,
      results.filter((r) => r.image.license === license).length,
    ]),
  ),
  imageFailures: manifest.failures.length,
};
const implementationHashes: Record<string, string> = {};
for (const folder of ["scripts/enrichment-351", "src/rarity-engine"]) {
  for (const name of (await readdir(folder))
    .filter((f) => f.endsWith(".ts"))
    .sort()) {
    const file = `${folder}/${name}`;
    implementationHashes[file] = sha256(await readFile(file));
  }
}
for (const file of [
  "scripts/masterpieces/score.ts",
  "scripts/rarity-v2/inputs.ts",
  "src/masterpieces/model.ts",
  "src/masterpieces/CandidateApp.tsx",
  "src/masterpieces/main.tsx",
  "src/masterpieces/batches.ts",
  "src/masterpieces/masterpieces.css",
  "src/enrichment-351/main.tsx",
  "review-351.html",
  "vite.enrichment.config.ts",
]) {
  implementationHashes[file] = sha256(await readFile(file));
}
const version = `masterpieces-${sha256(JSON.stringify({ cards, metadata: results.map((r) => ({ id: r.workId, rights: r.rights, inventory: r.inventoryNumber })) })).slice(0, 16)}`;
const preview = {
  schemaVersion: 1,
  version,
  algorithmVersion: score.algorithmVersion,
  configurationVersion: score.configurationVersion,
  publicationGate:
    "blocked_pending_human_selection_and_territories_confirmation",
  method:
    "V2 inchangé, 25/20/25/20/10, seuils 40/60/75/90 ; pairs historiques directs figés, langues et scopes d’audience explicites ; aucune rareté finale humaine précochée.",
  works: cards,
};
const review = {
  ...preview,
  candidates: results.map((r) => ({
    id: r.workId,
    title: r.input.title,
    creator: r.input.creator,
    region: r.region,
    sourceUrl: r.sourceUrl,
    inventoryNumber: r.inventoryNumber,
    rationale: `${r.versionNote} ${approval.notes[r.suffix] ?? ""}${r.priority === "iconic_masterpiece_research" ? " Priorité éditoriale de recherche pour Pièce maîtresse, distincte du niveau effectivement calculé par V2." : ""}`,
    recommended: true,
    rights: r.rights,
  })),
  summary: {
    researchedExactObjects: results.length,
    recommended: cards.length,
    rightsReviewRequired: 0,
    eligibleNotSelected: 0,
  },
};
parseCandidateCatalog(review, "/enrichment-351-images");
await mkdir("public/enrichment-351-data", { recursive: true });
await writeFile(
  "enrichment-351-review.json",
  JSON.stringify(preview, null, 2) + "\n",
);
await writeFile(
  "public/enrichment-351-data/catalog.json",
  JSON.stringify(review, null, 2) + "\n",
);
await writeFile(
  "enrichment-351-results.json",
  JSON.stringify(
    {
      schemaVersion: 1,
      version,
      scope: approval.scope,
      summary,
      protectedInputs: audit.protectedInputs,
      evidenceHashes,
      implementationHashes,
      observations,
      scoredNewWorks: results,
      publication: "review_prepared_game_not_activated",
      inputFlagsAreNotLegalAuthority: true,
    },
    null,
    2,
  ) + "\n",
);
const cell = (s: any) =>
  String(s ?? "—")
    .replaceAll("|", "/")
    .replaceAll("\n", " ");
const groupName: Record<string, string> = {
  ready_for_review: "Prête à proposer en review",
  legal_review_required: "Vérification juridique",
  not_usable_with_current_files: "Non exploitable avec les fichiers actuels",
};
const rows = observations
  .map(
    (r: any) =>
      `| ${r.inputId.slice(-4)} | ${cell(r.inputTitle)} — ${cell(r.inputArtist)} | ${groupName[r.group]} | ${r.presence} | ${r.proposal ? `${r.proposal.score.toFixed(1)} · ${REVIEW_RARITIES[r.proposal.level]}${r.proposeNewCard ? "" : " (existant figé)"}` : "Non calculée : objet ou droits non validés"} | ${cell(r.reason)} |`,
  )
  .join("\n");
const readyTable = cards
  .map((w) => {
    const r = results.find((r) => r.workId === w.id);
    return `| ${r.suffix} | ${cell(w.title)} | ${cell(w.date)} | ${cell(w.institution)} · ${cell(r.inventoryNumber)} | ${w.proposal.score.toFixed(1)} · ${REVIEW_RARITIES[w.proposal.level]} | ${(w.proposal.confidence * 100).toFixed(0)} % | ${cell(r.image.license)} | [Fichier exact](<${r.image.filePageUrl}>) · [Master HQ](<${r.image.originalUrl}>) · [Notice](<${w.sourceUrl}>) |`;
  })
  .join("\n");
await writeFile(
  "enrichment-351-report.md",
  "Note de suivi : les consignes de non-déploiement ci-dessous décrivent la préparation initiale du lot. L’utilisateur a ensuite demandé explicitement son ajout à l’atelier Firebase `/masterpieces.html`. Le statut effectif de ce déploiement est consigné séparément dans `catalog/enrichment-351/deployment.json` lorsqu’il aboutit. Aucune carte ni rareté n’est pour autant activée dans le jeu.\n\n" +
    `# MUSE — Audit des 351 entrées\n\n## Résultat\n\nLes deux fichiers utilisateur concordent sur **351 entrées** et restent intacts. Les trois groupes exclusifs sont : **${groups.ready_for_review} prêtes à proposer en review**, **${groups.legal_review_required} à vérifier juridiquement**, **${groups.not_usable_with_current_files} non exploitables avec les fichiers actuellement disponibles**. Le premier groupe comprend les références déjà présentes : seulement **${cards.length} nouvelles cartes** distinctes sont préparées, avec raster contrôlé et proposition V2. « Non exploitable » décrit ce dossier à cette date, jamais une impossibilité définitive.\n\n**Aucune publication ni activation.** Le jeu conserve ses 100 fiches et sa distribution 43/39/14/3/1 ; le catalogue de 1000 et le précédent lot de 25 candidates ne sont pas remplacés. Les décisions des navigateurs restent séparées. L’export humain fourni comporte toujours **${audit.humanReference.reviewed} décisions**, avec **${audit.humanReference.unreviewed} œuvres non revues** ; ce n’est pas la preuve que toutes les décisions ultérieures des testeurs ont été récupérées.\n\n## Portée juridique\n\nAnalyse documentaire, pas avis juridique ni autorisation mondiale : **France/Belgique–UE et États-Unis**, à confirmer selon les territoires effectivement visés par MUSE. Une œuvre entrée dans le domaine public en UE n’est pas automatiquement libre aux États-Unis, au Mexique ou ailleurs. Les droits patrimoniaux de l’objet, ceux du photographe/numériseur et les restrictions non liées au copyright restent séparés. Les sources juridiques et leurs captures/échecs sont dans catalog/enrichment-351/policies.json. Les pages 403, 429 ou 202 de contrôle d’accès ne sont jamais des autorisations.\n\nRéférences : [SPF Économie, durée](https://economie.fgov.be/fr/themes/propriete-intellectuelle/droits-de-propriete/droits-dauteur-et-droits/droits-dauteur/protection-des-oeuvres/duree-du-droit-dauteur), directive 2006/116/CE (notamment art. 1 et 7), directive 2019/790 (art. 14 sur les reproductions non originales d’œuvres visuelles dans le domaine public), [Cornell, règles américaines à jour au 1er janvier 2026](https://guides.library.cornell.edu/copyright/publicdomain). **Création n’est pas publication** : la règle américaine des publications antérieures à 1931 n’est pas appliquée mécaniquement à une date de création. Les déclarations précises des musées et fichiers, leurs sources et le contexte des œuvres anciennes sont conservés. Les premières publications tardives, l’inédit, les exceptions de durée et les contributions contemporaines demandent une analyse particulière. Les prorogations françaises et le droit moral ne sont pas effacés par une licence de photographie.\n\nPriorité CC0/domaine public : **${JSON.stringify(summary.licences)}**. Les images de musées réservées aux usages personnels/éducatifs n’ont pas été assimilées à des licences commerciales. CC BY exige le vrai crédit du photographe, la source, la version de licence et la mention des transformations ; le crédit du peintre seul ne suffit pas. Les licences BY-SA peuvent être commerciales, mais ne sont pas approuvées sans leurs obligations de crédit/partage correctement documentées. Aucune image protégée ou simplement trouvée par recherche n’est téléchargée. Les rasters de review sont des réductions sans recadrage ni retouche de couleur ; chaque master HQ reste lié avec ses dimensions connues.\n\nLe statut des champs work_copyright_eu/image_license/status du fichier d’entrée n’a servi à aucune approbation. Chaque nouvelle carte requiert une sélection documentaire propre, une notice exacte, un fichier précis, une licence commerciale et un contrôle du raster.\n\n## Identités, versions et doublons\n\n**${summary.alreadyRepresented} entrées déjà représentées**, **${summary.partiallyRepresented} séries/groupes partiellement représentés**, **${summary.internalDuplicateTopics} doublons de sujet internes**. La comparaison couvre les 100 actives, les 1000 en revue et les 64 recherches antérieures. Les correspondances textuelles ne suffisent pas à certifier un objet : certaines entrées restent non rapprochées et sont étiquetées ainsi, plutôt que déclarées absentes avec certitude. Les doublons sont exclus des nouvelles propositions sans supprimer les lignes utilisateur.\n\nLa Joconde, La Grande Vague, Fuji rouge, Melencolia I, l’averse Shin-Ōhashi, The Steerage et Strawberry Thief ne sont pas réimportés. Les parties de séries, études et épreuves sont distinguées d’une composition unique. La Petite Danseuse (0208/0314) et Qingming (0265/0269) ont une ligne canonique, sans inventer une fonte ou une copie.\n\nCorrections importantes : Pluie, vapeur et vitesse **NG538**, pas NG53853 ; L’Angélus **RF 1877**, pas RF 051804048 ; Les Iris du Getty **90.PA.20**, pas l’hypothèse 89.PA.71 ; Psyché de Canova **1787–1793**, pas la valeur fautive +0174 de la piste Wikidata. La Nuit étoilée sur le Rhône (Orsay, 1888) est distincte de celle du MoMA (1889). La Classe de danse retenue ici est **Orsay RF 1976**, pas Met 1987.47.1 ; Les Joueurs de cartes sont explicitement la version Met 61.101.1, pas une image de la série entière. Les Tournesols de Londres ne sont pas validés par une photo de Munich ou Tokyo ; les fichiers inadaptés trouvés restent des pistes exclues.\n\n## Rareté et priorités artistiques\n\nV2 **${score.algorithmVersion} / ${score.configurationVersion}**, poids P/A/H/M/C **25/20/25/20/10**, seuils **40/60/75/90**, fonctions et pairs historiques directs inchangés. Les décisions manuelles n’entrent pas comme données de notoriété. Les audiences humaines portent sur octobre 2025–septembre 2026, en anglais/français lorsque les pages exactes existent ; aucune erreur de collecte ne devient zéro. Les compositions d’estampes explicitement examinées ont le scope reviewed_composition, distinct de la notoriété d’une épreuve. Les séries et autres versions ne sont pas substituées à une page d’objet. Les bibliographies/expositions des notices sont dédupliquées et utilisées comme proxies, pas comme mesures directes d’influence.\n\n**${summary.curatorialMasterpieceResearchCandidates} nouvelles œuvres ont une priorité éditoriale de recherche pour Pièce maîtresse**, mais seulement **${summary.newAlgorithmMasterpieces}** propositions atteignent effectivement 90. Aucun bonus pour un titre célèbre, aucun seuil abaissé ni note éditoriale fabriquée. Les faibles scores d’icônes doivent être lus avec leurs critères estimés et leur confiance : bibliographie non structurée, audience d’objet manquante, proxy culturel étroit et normalisation encore provisoire peuvent limiter V2. Il faut améliorer les observations et calibrer le référentiel, pas maquiller les scores. Le détail P/A/H/M/C, intervalles, types et sources est dans le JSON.\n\nAjouts proposés : **${summary.proposedAdditions.map((x) => x.count).join("/")}**. Simulation de ${1000 + cards.length} propositions (aucune importation) : **${summary.afterHypotheticalReviewOnly.map((x) => x.count).join("/")}**. Les 1000 propositions d’origine restent 161/741/94/2/2. La distribution humaine 393/213/78/34/4 concerne seulement les 722 œuvres de l’export, les 278 autres restent non revues.\n\n## Nouvelles œuvres préparées\n\n| Entrée | Œuvre | Date retenue | Institution / version | Proposition V2 | Confiance | Licence | Image et sources |\n|---|---|---|---|---|---|---|---|\n${readyTable}\n\n## Examen exhaustif des 351 lignes\n\nLes raretés ne sont pas inventées pour les entrées bloquées : elles ne sont calculées que pour des objets admissibles précis. Une proposition « existant figé » reste celle de la revue antérieure, pas une nouvelle décision ni un reclassement.\n\n| Entrée | Œuvre / auteur fourni | Groupe | Présence | Rareté proposée | Motif et suite |\n|---|---|---|---|---|---|\n${rows}\n\n## Revue locale et reproduction\n\nLes nouvelles cartes utilisent ReviewArtwork et l’interface existante, dans **/review-351.html**, avec une sauvegarde indépendante **muse:enrichment-351-review:v1**. Choix de rareté et Retenir/Écarter/Reporter/Réexaminer restent séparés et historisés. Le jeu et les deux anciennes clés ne sont jamais écrits par ce lot. Les exports d’une autre version sont refusés sans écrasement. Le JSON d’import est une prévisualisation de revue, pas CatalogDataset actif.\n\nDepuis la racine :\n\n    npx tsx scripts/enrichment-351/audit.ts\n    npx tsx scripts/enrichment-351/prepare.ts\n    npx tsx scripts/enrichment-351/images.ts\n    npx tsx scripts/enrichment-351/build.ts\n    npm test\n    npx tsc -b\n    npm run dev -- --host 0.0.0.0\n\nOuvrir ensuite /review-351.html. prepare et build sont hors réseau ; images ne récupère que les approbations documentées et réutilise les fichiers dont les empreintes correspondent. Pour actualiser les observations, les collecteurs séparés acceptent --live et conservent les réponses réussies. **Ne pas lancer Firebase pour ce lot.** Les configurations de publication excluent ces données locales, aucune commande d’activation de jeu n’existe.\n\nFichiers de livraison : enrichment-351-results.json (351 résultats, données de score, droits, sources et empreintes), enrichment-351-review.json (prévisualisation), catalog/enrichment-351/image-manifest.json (licences/crédits/qualité des rasters), et ce rapport.\n`,
);
console.log(JSON.stringify({ version, summary }, null, 2));
