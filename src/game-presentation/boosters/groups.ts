import { artworks, type Artwork } from "../../data";

/** Published snapshot of the seven lab pools. Future lab edits do not change these. */
export const boosterGroups = [
  {
    id: "universel",
    title: "Collection universelle",
    shortTitle: "Collection\nuniverselle",
    subtitle: "Tous les arts, sans choisir.",
    description:
      "Peinture, sculpture, photographie, objets et savoir-faire : toute la collection dans une même pochette.",
    types: [],
    color: "#731b31",
    ink: "#ffe1a4",
    palette: "Bordeaux & laiton",
    motif: "Pigments, relief, papier et tissage réunis.",
    job: "image_1982f6914001miRXYJi0SER8UA",
  },
  {
    id: "peintures",
    title: "Peintures",
    shortTitle: "Peintures",
    subtitle: "La couleur prend la matière.",
    description:
      "Toutes les peintures, sans imposer de période, de pays ou de mouvement.",
    types: ["peinture"],
    color: "#164fc0",
    ink: "#fff0c9",
    palette: "Cobalt & pigments",
    motif: "Empâtements, gestes et couches de couleur.",
    job: "image_1982fa056001gcNollFyPVwesD",
  },
  {
    id: "traits-pages",
    title: "Traits & pages",
    shortTitle: "Traits & pages",
    subtitle: "Le monde au bout d’un trait.",
    description:
      "Dessins, estampes, manuscrits et enluminures, réunis autour du papier et du trait.",
    types: ["dessins", "estampes", "manuscrits"],
    color: "#dfcbae",
    ink: "#38251b",
    palette: "Ivoire & cuivre",
    motif: "Feuillets, hachures et lignes gravées.",
    job: "image_1982fd064001ouz0irSTXqneAi",
  },
  {
    id: "sculptures",
    title: "Sculptures",
    shortTitle: "Sculptures",
    subtitle: "La lumière révèle le volume.",
    description:
      "Des sculptures de cultures et de matériaux variés, sans les réduire à une tradition classique.",
    types: ["sculpture"],
    color: "#4b5540",
    ink: "#fff0c9",
    palette: "Olive & pierre",
    motif: "Volumes sculptés et plis taillés.",
    job: "image_1982ffce60013T39uaMjBNMr5S",
  },
  {
    id: "photographies",
    title: "Photographies",
    shortTitle: "Photographies",
    subtitle: "Un regard, une autre lumière.",
    description:
      "Toutes les photographies, anciennes et plus récentes, dans leur propre univers.",
    types: ["photographie"],
    color: "#202e43",
    ink: "#f1eadf",
    palette: "Nuit & argent",
    motif: "Lumière, ombres et tirages photographiques.",
    job: "image_1983027cb001pXE6sUqx34mztM",
  },
  {
    id: "matieres-objets",
    title: "Matières & objets",
    shortTitle: "Matières\n& objets",
    subtitle: "L’art du geste et de la matière.",
    description:
      "Céramiques, orfèvrerie et métaux, verre et objets archéologiques. Un regroupement de types, pas une époque commune.",
    types: ["ceramique", "arts-metal", "verre", "objets-archeologiques"],
    color: "#165a60",
    ink: "#fff0d1",
    palette: "Pétrole & cuivre",
    motif: "Céramique, métal, verre et minéral.",
    job: "image_1983056bc001YPg2XRDl63XDHL",
  },
  {
    id: "textiles-interieur",
    title: "Textiles & intérieur",
    shortTitle: "Textiles\n& intérieur",
    subtitle: "Les matières qui habitent nos vies.",
    description:
      "Textiles et tapisseries, mobilier et luminaires : tissage et arts de l’intérieur.",
    types: ["textiles", "mobilier"],
    color: "#532e4b",
    ink: "#ffe4b0",
    palette: "Prune & fils dorés",
    motif: "Trame tissée et assemblages de bois.",
    job: "image_19830886b001mfcStithYg4zCh",
  },
] as const;

export type BoosterGroup = (typeof boosterGroups)[number];
export type BoosterGroupId = BoosterGroup["id"];
export const specializedBoosterGroups = boosterGroups.filter(
  (g) => g.id !== "universel",
);

export function boosterGroupFor(id: string): BoosterGroup {
  const group = boosterGroups.find((g) => g.id === id);
  if (!group) throw Error(`Pochette inconnue : ${id}`);
  return group;
}
export function artworkInBooster(art: Pick<Artwork, "catalog">, id: string) {
  const group = boosterGroupFor(id);
  return (
    group.id === "universel" ||
    (group.types as readonly string[]).includes(art.catalog)
  );
}
export function worksForBooster(id: string) {
  boosterGroupFor(id);
  return artworks.filter((art) => artworkInBooster(art, id));
}
export function specializedBoosterFor(
  art: Pick<Artwork, "catalog">,
): BoosterGroup {
  const matches = specializedBoosterGroups.filter((g) =>
    artworkInBooster(art, g.id),
  );
  if (matches.length !== 1)
    throw Error(`Type sans regroupement exclusif : ${art.catalog}`);
  return matches[0];
}
/** Representative real entries, not a random draw or a simulated acquisition. */
export function previewWorksFor(id: string) {
  const works = worksForBooster(id);
  const representative = [...new Set(works.map((a) => a.catalog))]
    .slice(0, 6)
    .map((type) => works.find((a) => a.catalog === type)!);
  return [
    ...representative,
    ...works.filter((a) => !representative.includes(a)),
  ].slice(0, 6);
}
