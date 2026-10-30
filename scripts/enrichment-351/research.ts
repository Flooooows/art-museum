import { readFile } from "node:fs/promises";
export const values = (entity: any, property: string): any[] =>
  (entity?.claims?.[property] ?? [])
    .map((c: any) => c.mainsnak?.datavalue?.value)
    .filter((v: any) => v !== undefined);
export const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
export const label = (entity: any) =>
  entity?.labels?.fr?.value ?? entity?.labels?.en?.value ?? "";
export async function loadResearch() {
  const primary = JSON.parse(
    await readFile("catalog/enrichment-351/identities.json", "utf8"),
  );
  const supplement = JSON.parse(
    await readFile("catalog/enrichment-351/supplement.json", "utf8"),
  );
  const entities = { ...primary.entities, ...supplement.entities },
    images = { ...primary.images, ...supplement.images },
    entityFiles = { ...primary.entityFiles, ...supplement.entityFiles };
  const entries = JSON.parse(
    await readFile("muse_oeuvres_candidates.json", "utf8"),
  ).artworks;
  const records = entries.map((entry: any) => {
    const suffix = entry.id.slice(-4),
      enPage = supplement.pages[supplement.titles[suffix]],
      frPage = primary.pages[primary.overrides[suffix] ?? entry.title];
    const enQid = enPage?.pageprops?.wikibase_item,
      frQid = frPage?.pageprops?.wikibase_item;
    const qid = enQid ?? frQid ?? null;
    const expectedArtist =
      supplement.pages[supplement.artistTitles[entry.artist]]?.pageprops
        ?.wikibase_item ??
      primary.pages[entry.artist]?.pageprops?.wikibase_item;
    const entity = entities[qid];
    const creatorIds = values(entity, "P170")
      .map((c) => c.id)
      .filter(Boolean);
    const artistMatched =
      !!expectedArtist && creatorIds.includes(expectedArtist);
    return {
      ...entry,
      suffix,
      qid,
      entity,
      creatorIds,
      artistMatched,
      expectedArtist,
      page: enQid ? enPage : frPage,
      alternativeQid: enQid && frQid && enQid !== frQid ? frQid : null,
    };
  });
  return { records, entities, images, entityFiles, primary, supplement };
}
