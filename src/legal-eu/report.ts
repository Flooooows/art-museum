import {
  ENGINE_VERSION,
  evaluateLegalEU,
  parseLegalInput,
  validDay,
  type LegalReport,
  type LegalDataset,
} from "./model";

export function parseLegalReport(v: unknown): LegalReport {
  if (!v || typeof v !== "object") throw Error("Rapport juridique absent.");
  const r = v as LegalReport;
  if (
    r.schemaVersion !== 1 ||
    r.engineVersion !== ENGINE_VERSION ||
    !validDay(r.verifiedAt) ||
    !/^[a-f0-9]{64}$/.test(r.evidenceDigest) ||
    !r.datasets ||
    typeof r.datasets !== "object" ||
    Array.isArray(r.datasets)
  )
    throw Error("Rapport juridique incompatible.");
  for (const d of Object.values(r.datasets)) {
    if (
      !d ||
      typeof d.catalogVersion !== "string" ||
      !/^[a-f0-9]{64}$/.test(d.catalogSha256) ||
      !Array.isArray(d.entries) ||
      d.entries.length > 2000
    )
      throw Error("Lot juridique invalide.");
    const ids = new Set<string>();
    for (const e of d.entries) {
      const input = parseLegalInput(e?.input);
      if (
        ids.has(input.artworkId) ||
        JSON.stringify(e.decision) !==
          JSON.stringify(evaluateLegalEU(input, r.verifiedAt))
      )
        throw Error("Décision juridique incohérente ou dupliquée.");
      ids.add(input.artworkId);
    }
  }
  return r;
}

export function matchingLegalDataset(
  report: LegalReport,
  key: string,
  version: string,
  sha256: string,
  today: string,
): LegalDataset {
  const d = report.datasets[key];
  const age = Date.parse(today) - Date.parse(report.verifiedAt);
  if (
    !validDay(today) ||
    age < 0 ||
    age > 365 * 86400000 ||
    !d ||
    d.catalogVersion !== version ||
    d.catalogSha256 !== sha256
  )
    throw Error(
      "Dossier juridique périmé ou lié à un autre catalogue. Aucun feu vert réutilisé.",
    );
  return d;
}

export function assertLegalBindings(
  dataset: LegalDataset,
  catalog: {
    works: {
      id: string;
      title: string;
      creator: string;
      sourceUrl: string;
      imageUrl?: string;
    }[];
    candidates?: {
      id: string;
      title: string;
      creator: string;
      sourceUrl: string;
    }[];
  },
) {
  const items = new Map(
    [...(catalog.candidates ?? []), ...catalog.works].map((w) => [w.id, w]),
  );
  if (dataset.entries.length !== items.size)
    throw Error("Dossiers juridiques incomplets.");
  for (const { input } of dataset.entries) {
    const w = items.get(input.artworkId);
    if (
      !w ||
      w.title !== input.title ||
      w.creator !== input.creator ||
      w.sourceUrl !== input.sourceUrl ||
      ("imageUrl" in w ? w.imageUrl : null) !== input.imageUrl
    )
      throw Error("Dossier juridique lié à un autre objet ou fichier.");
  }
}
