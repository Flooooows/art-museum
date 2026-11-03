/** Current art direction: supersedes archived *Specs briefs for NEW generations.
 * Visual acceptance is not permission to integrate or publish an experiment.
 */
export const acceptedFrameExperiments = [
  {
    family: "japon",
    file: "src/card-lab/experiments/japon/essai-01.png",
    imageJob: "image_19ef70976001Cw9nj40tK3VG38",
  },
  {
    family: "photographie",
    file: "src/card-lab/experiments/photographie/essai-01.png",
    imageJob: "image_19ef98344001hE0r3Bw9wNYzTj",
  },
] as const;

export const frameGenerationStyle = {
  id: "experiments-japon-photographie-01",
  status:
    "Art direction accepted by the user; reviewed palettes authorized for the lab only, not the main game.",
  guide: "docs/GENERATION_CADRES.md",
  primaryReferences: acceptedFrameExperiments.map((entry) => entry.file),
  collectionReferences: [
    "egypte",
    "prehistoire",
    "decoratifs",
    "art-moderne",
    "art-mysterieux",
    "beaux-arts",
  ].map(
    (family) =>
      `src/card-lab/assets/refined-frames/${family}-lapis-lazuli.webp`,
  ),
  principles: [
    "Les images acceptées font autorité : ne pas repartir des briefs des éditions supprimées.",
    "Moulures en couches, reliefs sculptés, gravures fines et matières tactiles ; richesse comparable aux deux essais.",
    "Motifs concrets immédiatement liés au thème et intégrés dans une composition décorative cohérente.",
    "Chaque thème invente son rythme, ses articulations et ses accents ; aucune grille de pictogrammes ou frise identique imposée.",
    "Courbes, cartouches, accents centraux et motifs figuratifs sont permis lorsqu’ils servent le thème et la composition.",
    "Équilibre entre détail et respiration ; ni rectangle minimaliste, ni surcharge d’objets ou de bijoux.",
    "Les masters de l’essai 01 restent les références de famille ; la progression active de l’essai 02 fait évoluer le dessin et le travail par rareté, pas seulement la matière.",
    "Cadre portrait de face, ouverture centrale généreuse et réellement transparente, extérieur transparent, aucun contenu incrusté.",
  ],
  archivedBriefs: [
    "generatedSpecs.ts",
    "detailedSpecs.ts",
    "prestigeSpecs.ts",
    "themedSpecs.ts",
    "museumSpecs.ts",
    "decorativeSpecs.ts",
    "friezeSpecs.ts",
  ],
} as const;

export const experimentalFrameFinishes = [
  { finish: "fer", label: "Esquisse · Fer" },
  { finish: "cuivre", label: "Étude · Cuivre" },
  { finish: "argent", label: "Composition · Argent" },
  { finish: "dore", label: "Œuvre · Or" },
  { finish: "lapis-lazuli", label: "Pièce maîtresse · Lapis-lazuli" },
] as const;
export type ExperimentalFrameFinish =
  (typeof experimentalFrameFinishes)[number]["finish"];

/** Existing approved material examples, not palettes from the rejected editions. */
export function frameFinishReference(finish: ExperimentalFrameFinish) {
  return finish === "lapis-lazuli"
    ? null
    : `src/card-lab/assets/refined-frames/egypte-${finish}.webp`;
}

/** Ready-to-use visual-first request. No fixed motif inventory or rail layout. */
export function frameGenerationRequest(theme: string) {
  const subject = theme.trim();
  if (!subject) throw Error("Le thème du cadre est obligatoire.");
  return {
    images: [
      ...frameGenerationStyle.primaryReferences,
      ...frameGenerationStyle.collectionReferences,
    ],
    prompt: `Create ONE new museum card FRAME themed: ${subject}.
The first two supplied images, Japan and Photography, define the user-accepted art direction. The remaining six are the existing approved collection. Base this new design on these visual references, not on older written frame briefs.
Match the accepted experiments' sculptural workmanship, dimensional relief, fine engraved details, layered moldings, tactile mineral lapis blue and worked gold. Keep their balance of visual richness, recognizable thematic ornament and breathing room.
Invent a distinct, cohesive ornamental composition immediately identifiable with the requested theme. Integrate its figurative motifs into the crafted frame, rather than applying an interchangeable grid of icons. Give this theme its own rhythm and decorative character; do not trace another theme's layout or copy its unrelated symbols. Curves and central or corner accents are welcome when they belong to the composition. Keep a real picture-frame structure, not a border assembled from oversized equipment.
Neither a plain generic rectangle nor an overloaded fantasy prop. One portrait frame only, straight-on front view, approximately 1024x1536, with a generous central opening.
The entire opening and the outside must have genuine transparent alpha. Do not reproduce any brown, gold, black or hazy fills that may appear in transparent reference previews. No artwork, photograph, background, lettering, title plate, logo, watermark or shadow inside the opening.`,
  };
}

/** Current workflow for a rarity-specific independently generated drawing.
 * A generation is not automatically authorized for integration/publication.
 */
export function rarityProgressionRequest(
  theme: string,
  themeReference: string,
  finish: ExperimentalFrameFinish,
) {
  if (!theme.trim() || !themeReference.trim())
    throw Error("Thème et référence visuelle obligatoires.");
  const stages: Record<ExperimentalFrameFinish, string> = {
    fer: "LOWEST IRON: raw dark aged material, shallow engraving and restrained low relief, modest molding and simple corners; theme already recognizable with breathing room.",
    cuivre:
      "SECOND COPPER: warm patina, small modeled repoussé motifs, more deliberate molding and joins than raw iron, not a royal design tinted brown.",
    argent:
      "MIDDLE SILVER: crisp fine chasing, clean precise edges and corners, controlled layered relief and dark incisions, more finesse than copper, less abundance than gold.",
    dore: "FOURTH GOLD: richer modeled relief, polished layered molding and developed coordinated corners, warm shadows and fine chasing; all-gold, no blue lapis fields.",
    "lapis-lazuli":
      "HIGHEST LAPIS/GOLD: precisely bounded mineral-blue inlay and delicate gold, exquisitely resolved thematic details and corners, quiet blue fields; mastery, not piles of larger jewels.",
  };
  return {
    images: [
      themeReference,
      "src/card-lab/experiments/japon/essai-02-cinq-raretes.png",
      "src/card-lab/experiments/verre/essai-02-cinq-raretes.png",
      `src/card-lab/assets/refined-frames/egypte-${finish}.webp`,
      `src/card-lab/assets/refined-frames/prehistoire-${finish}.webp`,
    ],
    prompt: `Create ONE ${theme.trim()} themed museum FRAME. ${stages[finish]} Image1 supplies theme identity; images2/3 show the approved five-rarity progression; last2 supply material and workmanship only, not unrelated cultural motifs. Independently design this rarity: actual engravings, relief, molding and ornament develop by grade, not recoloring one common master. Maintain family identity, coherent theme-specific composition and generous breathing room, not a fixed grid or oversized objects building the rails. Portrait1024x1536, straight-on, generous empty central opening and exterior genuine transparent alpha. No preview-derived backing/haze, artwork, readable writing, labels, logo, watermark or contact sheet.`,
  };
}
