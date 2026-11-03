/** Colors and relief density are shared; each rail has literal, category-specific motifs. */
export const friezePalette = [
  ["#192e69", "#b89a55"],
  ["#a8bac8", "#d9dfe3"],
  ["#5e221d", "#c58b62"],
  ["#27313b", "#89939c"],
] as const;
export const friezeBrief =
  "Recommencer sans reprendre les mêmes motifs. Arts décoratifs sert seulement aux couleurs et au niveau de détail ; Paléolithique et Égypte ancienne servent d’exemples de motifs immédiatement liés au thème, suffisamment détaillés mais espacés. Frises figuratives gravées dans une vraie moulure, jamais un cadre constitué d’objets ni de rubans communs.";

export interface FriezeSpec {
  source: string;
  job: string;
  motifs: readonly string[];
  forbidden: string;
}
// Entries are recorded only after the actual generation call has returned its job ID.
export const friezeSpecs: Partial<Record<string, FriezeSpec>> = {
  "peinture-neutre": {
    source: "peinture-frieze-v7.png",
    job: "image_19e94c5e2002qQr3SY8V4SyGl1",
    motifs: [
      "palette à pigments",
      "pinceaux gravés",
      "chevalet",
      "touches et pots de pigment",
    ],
    forbidden:
      "Pinceaux constituant les rails, rubans abstraits et décor floral commun.",
  },
  sculpture: {
    source: "sculpture-frieze-v7.png",
    job: "image_19e94c636001Yrf4ndBnvOyqDu",
    motifs: [
      "buste sculpté",
      "main modelée",
      "tête partiellement taillée",
      "maillet et ciseau gravés",
    ],
    forbidden:
      "Colonnes structurelles, statues débordantes et volutes communes.",
  },
  estampes: {
    source: "estampes-frieze-v7.png",
    job: "image_19e94c634001DKGf3vd7045F9i",
    motifs: [
      "presse en profil",
      "plaque hachurée",
      "burins",
      "rouleau encreur et empreinte de feuille",
    ],
    forbidden:
      "Rails en rouleaux ou outils, guillochés et rubans décoratifs communs.",
  },
  dessins: {
    source: "dessins-frieze-v7.png",
    job: "image_19e94c636003yiFyFxUZPRzHi1",
    motifs: [
      "crayons taillés",
      "étude de profil",
      "fusain et gomme",
      "hachures et étude de perspective",
    ],
    forbidden: "Crayons structurels, arabesques et rubans abstraits.",
  },
  "arts-metal": {
    source: "arts-metal-frieze-v7.png",
    job: "image_19e94c636005HIux29n6MB5wUv",
    motifs: [
      "enclume et marteau",
      "coupe ciselée",
      "tenaille et lopin",
      "plat repoussé",
    ],
    forbidden:
      "Chaînes, rivets ou outils constituant le cadre, rubans forgés communs.",
  },
  verre: {
    source: "verre-frieze-v7.png",
    job: "image_19e94c636007B50CI2UtfgE2VT",
    motifs: [
      "verre à pied",
      "carafe à bouchon",
      "coupe en cristal taillé",
      "panneau de vitrail",
    ],
    forbidden:
      "Prismes ou récipients structurels et volutes opalescentes communes.",
  },
  mobilier: {
    source: "mobilier-frieze-v7.png",
    job: "image_19e94c63a001pmsoWoqqOudsDP",
    motifs: [
      "chaise en profil",
      "armoire",
      "table à pied central",
      "panneau de marqueterie et assemblage",
    ],
    forbidden:
      "Rails en pieds de meuble ou poignées et rubans de marqueterie communs.",
  },
  manuscrits: {
    source: "manuscrits-frieze-v7.png",
    job: "image_19e94c63a003UbtRVXW51yvBsB",
    motifs: [
      "codex ouvert",
      "plume et encrier",
      "page enluminée",
      "parchemin scellé",
    ],
    forbidden:
      "Cadre-livre, texte lisible, fausse écriture et entrelacs communs.",
  },
  archeologie: {
    source: "archeologie-frieze-v7.png",
    job: "image_19e94c692001ac9U1ytiiJK5Hr",
    motifs: [
      "bol restauré",
      "disque bi",
      "fibule",
      "tessons et coupe stratigraphique",
    ],
    forbidden:
      "Glyphes inventés, animaux paléolithiques, outils structurels et rubans minéraux.",
  },
  japon: {
    source: "japon-frieze-v7.png",
    job: "image_19e94c69e001FY94oprfVkcW2T",
    motifs: [
      "grue",
      "éventail pliant",
      "branche de cerisier",
      "panneau seigaiha",
    ],
    forbidden:
      "Volutes occidentales, rubans de vagues omniprésents, kanji et objets structurels.",
  },
  photographie: {
    source: "photographie-frieze-v7.png",
    job: "image_19e91a919001EtCIi4w6gROP24",
    motifs: [
      "appareil à soufflet gravé",
      "pellicule perforée",
      "diaphragme",
      "plaque photographique",
    ],
    forbidden:
      "Objectifs ou appareils constituant le cadre, ondes et rubans décoratifs communs.",
  },
  textiles: {
    source: "textiles-frieze-v7.png",
    job: "image_19e91a923001v6ouOMccXRnWTx",
    motifs: [
      "métier à tisser gravé",
      "bobine de fil",
      "aiguilles",
      "échantillon chaîne/trame",
    ],
    forbidden: "Cadre en tresses, glands, navettes ou objets rapportés.",
  },
  ceramique: {
    source: "ceramique-frieze-v7.png",
    job: "image_19e91a92a001yPeBNKSiZyNi6O",
    motifs: [
      "amphore en bas-relief",
      "bol tourné",
      "vase à col étroit",
      "pot à couvercle",
    ],
    forbidden:
      "Rails formés de vases, anses ou fragments, rubans et volutes végétales.",
  },
};
