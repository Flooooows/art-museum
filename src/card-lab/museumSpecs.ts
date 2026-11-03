/** Real framing typologies, not pictograms of an artistic technique. */
export const framingReferences = [
  {
    title: "National Gallery — Frames",
    url: "https://www.nationalgallery.org.uk/paintings/glossary/frames",
  },
  {
    title: "National Portrait Gallery — Framing Italian Renaissance Paintings",
    url: "https://www.npg.org.uk/collections/research/programmes/the-art-of-the-picture-frame/guides-italian-renaissance",
  },
  {
    title: "NEDCC — Matting and Framing for Works on Paper and Photographs",
    url: "https://www.nedcc.org/free-resources/preservation-leaflets/4.-storage-and-handling/4.10-matting-and-framing-for-works-on-paper-and-photographs",
  },
  {
    title: "CCI — Conservation Framing of Embroideries and Other Flat Textiles",
    url: "https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/conservation-framing-embroideries-flat-textiles.html",
  },
] as const;

export interface MuseumProfile {
  name: string;
  intent: string;
  body: string;
  liner: string;
  face: number;
  slip: number;
  bevel: number;
  depth: number;
  surface: "wood" | "metal" | "lacquer";
  linerTexture: "paper" | "linen" | "plain";
  seed: number;
}

export const museumSpecs = {
  "peinture-neutre": {
    name: "Cassetta sobre",
    intent:
      "Profil cassetta en noyer, frise plate et filet intérieur fin, sans décor sculpté.",
    body: "#65503b",
    liner: "#d9d0b9",
    face: 54,
    slip: 15,
    bevel: 10,
    depth: 12,
    surface: "wood",
    linerTexture: "plain",
    seed: 17,
  },
  sculpture: {
    name: "Caisse de présentation",
    intent:
      "Bois cendré, chanfrein large et retrait minéral discret ; pas de colonnes ni d’outils.",
    body: "#5d5850",
    liner: "#b9b5aa",
    face: 38,
    slip: 19,
    bevel: 12,
    depth: 18,
    surface: "wood",
    linerTexture: "plain",
    seed: 31,
  },
  estampes: {
    name: "Baguette d’estampe",
    intent:
      "Baguette sombre à petit profil doucine et passe-partout ivoire, inspirée de l’encadrement des œuvres sur papier.",
    body: "#453a2d",
    liner: "#ddd5c3",
    face: 28,
    slip: 28,
    bevel: 8,
    depth: 8,
    surface: "wood",
    linerTexture: "paper",
    seed: 43,
  },
  dessins: {
    name: "Frêne et carton musée",
    intent:
      "Bois clair et passe-partout ivoire à biseau net ; le thème passe par la présentation du papier, sans crayons.",
    body: "#a38c67",
    liner: "#e4ddcc",
    face: 25,
    slip: 31,
    bevel: 7,
    depth: 6,
    surface: "wood",
    linerTexture: "paper",
    seed: 59,
  },
  photographie: {
    name: "Profil galerie noir",
    intent:
      "Profil noir satiné étroit, arêtes franches et passe-partout blanc cassé, sans objectifs ni pellicule.",
    body: "#303234",
    liner: "#dddcd4",
    face: 21,
    slip: 28,
    bevel: 5,
    depth: 8,
    surface: "metal",
    linerTexture: "paper",
    seed: 71,
  },
  textiles: {
    name: "Chêne et montage lin",
    intent:
      "Caisse peu profonde en chêne avec bord intérieur gainé de lin fin, sans tresses ni glands.",
    body: "#8b7655",
    liner: "#c4b69a",
    face: 31,
    slip: 28,
    bevel: 7,
    depth: 14,
    surface: "wood",
    linerTexture: "linen",
    seed: 83,
  },
  ceramique: {
    name: "Boîte chêne et grège",
    intent:
      "Profil de présentation en chêne légèrement arrondi et bord intérieur grège, rappel discret des terres et glaçures.",
    body: "#80705a",
    liner: "#c8bdab",
    face: 33,
    slip: 21,
    bevel: 11,
    depth: 14,
    surface: "wood",
    linerTexture: "plain",
    seed: 97,
  },
  "arts-metal": {
    name: "Bronze brossé",
    intent:
      "Moulure métal brossé à double ressaut discret, sans chaînes, rivets décoratifs ou marteaux.",
    body: "#625b4e",
    liner: "#b7b0a0",
    face: 34,
    slip: 13,
    bevel: 7,
    depth: 12,
    surface: "metal",
    linerTexture: "plain",
    seed: 109,
  },
  verre: {
    name: "Nickel et gris perle",
    intent:
      "Profil mince nickel satiné et retrait gris perle ; quelques reflets doux, sans prismes géants.",
    body: "#979fa0",
    liner: "#d2d5d0",
    face: 22,
    slip: 22,
    bevel: 8,
    depth: 10,
    surface: "metal",
    linerTexture: "plain",
    seed: 127,
  },
  mobilier: {
    name: "Noyer à plate-bande",
    intent:
      "Profil d’ébénisterie en noyer poli avec une seule plate-bande et assemblages à onglet discrets.",
    body: "#66452e",
    liner: "#c3ac87",
    face: 43,
    slip: 15,
    bevel: 11,
    depth: 12,
    surface: "wood",
    linerTexture: "plain",
    seed: 139,
  },
  manuscrits: {
    name: "Bois sombre et ivoire",
    intent:
      "Encadrement de feuillet en bois sombre et passe-partout chaud, sans transformer le cadre en livre.",
    body: "#513d33",
    liner: "#d7c8aa",
    face: 27,
    slip: 29,
    bevel: 8,
    depth: 8,
    surface: "wood",
    linerTexture: "paper",
    seed: 151,
  },
  archeologie: {
    name: "Caisse de conservation",
    intent:
      "Chêne patiné mat et retrait terre clair, inspirés d’une présentation de fragments ; aucun tesson ou outil intégré.",
    body: "#756a57",
    liner: "#bcb09a",
    face: 37,
    slip: 20,
    bevel: 6,
    depth: 17,
    surface: "wood",
    linerTexture: "plain",
    seed: 167,
  },
  japon: {
    name: "Bois laqué et soie",
    intent:
      "Baguette noire laquée, mince sous-filet rouge brun et bord intérieur soyeux ; pas de motifs répétés ni de fleurs rapportées.",
    body: "#272422",
    liner: "#b4a889",
    face: 30,
    slip: 23,
    bevel: 6,
    depth: 9,
    surface: "lacquer",
    linerTexture: "linen",
    seed: 181,
  },
} as const satisfies Record<string, MuseumProfile>;

export const museumBrief =
  "Rester dans les thèmes mais réduire fortement les détails, s’inspirer de vrais cadres : profils, bois, métaux satinés et passe-partout. Aucun outil, objet ou emblème intégré au contour. Lapis sobre par un double filet bleu et or, sans bijoux. Préserver les six familles validées et publier uniquement sur le lab.";
