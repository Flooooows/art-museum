import { type Artwork, rarities } from "../data";

export const legacyFrameFamilies = [
  "beaux-arts",
  "egypte",
  "decoratifs",
  "art-mysterieux",
  "art-moderne",
  "prehistoire",
  "japon",
] as const;
export const generatedFrameFamilies = [
  "peinture-neutre",
  "sculpture",
  "estampes",
  "dessins",
  "photographie",
  "textiles",
  "ceramique",
  "arts-metal",
  "verre",
  "mobilier",
  "manuscrits",
  "archeologie",
] as const;
export const frameFamilies = [
  ...generatedFrameFamilies,
  ...legacyFrameFamilies,
] as const;
export type FrameFamily = (typeof frameFamilies)[number];
export const activeFrameFamilies = frameFamilies.filter(
  (f) => f !== "prehistoire",
);
export const archivedFrameFamilies: readonly FrameFamily[] = ["prehistoire"];
export const frameFamilyLabels: Record<FrameFamily, string> = {
  "peinture-neutre": "Peintures · palettes et chevalets",
  sculpture: "Sculptures · bustes et taille",
  estampes: "Estampes · presse et burins",
  dessins: "Dessins · crayons et études",
  photographie: "Photographies · appareils et pellicule",
  textiles: "Textiles · métier et fil",
  ceramique: "Céramiques · amphores et poteries",
  "arts-metal": "Métaux · forge et orfèvrerie",
  verre: "Verre · carafes et cristal",
  mobilier: "Mobilier · meubles et assemblages",
  manuscrits: "Manuscrits · codex et plumes",
  archeologie: "Archéologie · objets et fouilles",
  "beaux-arts": "Exposition classique · sélection",
  egypte: "Égypte ancienne",
  decoratifs: "Arts décoratifs vers 1900 · sélection",
  "art-mysterieux": "Fantastique occidental · sélection",
  "art-moderne": "Abstraction géométrique · sélection",
  prehistoire: "Paléolithique · archivé, non affecté",
  japon: "Japon",
};
const typeFamilies: Record<string, FrameFamily> = {
  peinture: "peinture-neutre",
  sculpture: "sculpture",
  estampes: "estampes",
  dessins: "dessins",
  photographie: "photographie",
  textiles: "textiles",
  ceramique: "ceramique",
  "arts-metal": "arts-metal",
  verre: "verre",
  mobilier: "mobilier",
  manuscrits: "manuscrits",
  "objets-archeologiques": "archeologie",
};
// Reviewed subsets, never broad assumptions from a deity, material or approximate age.
export const decorative1900Ids = new Set([
  "820892",
  "20804",
  "35",
  "9480",
  "1085",
  "cma-142734",
  "cma-165186",
  "cma-150156",
  "cma-296869",
  "cma-150488",
  "cma-152818",
  "cma-160089",
  "cma-151884",
  "cma-93173",
  "cma-140001",
]);
export const westernFantasticIds = new Set([
  "cma-149105",
  "cma-149106",
  "cma-149107",
  "cma-149108",
]);
export const classicDisplayIds = new Set([
  "cma-136510",
  "mona-lisa",
  "436105",
  "437654",
  "436535",
]);

/** Current types/themes and documented origin, never the obsolete catch-all frameFamily. */
export function frameCategoryFor(
  art: Pick<Artwork, "id" | "catalog" | "catalogIds" | "origin">,
): { family: FrameFamily; reason: string } {
  if (art.catalogIds.includes("egypte"))
    return { family: "egypte", reason: "Thème documenté : Égypte ancienne." };
  if (/\b(Japon|Japan|Japanese|Edo|Kyoto|Tokyo)\b/i.test(art.origin))
    return { family: "japon", reason: `Origine documentée : ${art.origin}.` };
  if (decorative1900Ids.has(art.id))
    return {
      family: "decoratifs",
      reason:
        "Sélection documentée Matières autour de 1900 ; pas une règle pour tous les objets décoratifs.",
    };
  if (westernFantasticIds.has(art.id))
    return {
      family: "art-mysterieux",
      reason:
        "Sélection explicite : Scenes of Witchcraft de Salvator Rosa ; aucun transfert aux divinités d’autres traditions.",
    };
  if (art.id === "cma-143278")
    return {
      family: "art-moderne",
      reason:
        "Sélection explicite : Composition avec rouge, jaune et bleu de Mondrian ; pas une règle pour la photographie.",
    };
  if (
    art.catalog === "peinture" &&
    (art.catalogIds.includes("renaissance-italienne") ||
      classicDisplayIds.has(art.id))
  )
    return {
      family: "beaux-arts",
      reason:
        "Peinture de la sélection documentée pour le décor d’exposition classique.",
    };
  const family = typeFamilies[art.catalog];
  if (!family) throw Error(`Catégorie sans règle de cadre : ${art.catalog}`);
  return {
    family,
    reason: `Décor neutre du type principal : ${art.catalog}. Aucune culture ou période ajoutée par supposition.`,
  };
}
export function frameChoiceFor(
  art: Pick<Artwork, "id" | "catalog" | "catalogIds" | "origin" | "rarity">,
) {
  if (
    !Number.isInteger(art.rarity) ||
    art.rarity < 0 ||
    art.rarity >= rarities.length
  )
    throw Error("Rareté de cadre invalide.");
  const category = frameCategoryFor(art),
    finish = rarities[art.rarity].finish;
  return {
    ...category,
    finish,
    key: `${category.family}-${finish}`,
    level: art.rarity,
  };
}
