/** User-approved themes are immutable in this study; only the other families change. */
export const preservedFrameFamilies = [
  "beaux-arts",
  "egypte",
  "decoratifs",
  "art-mysterieux",
  "art-moderne",
  "prehistoire",
] as const;
export const prestigeSpecs = {
  "peinture-neutre": {
    source: "peinture-prestige-v3.png",
    job: "image_19e273cd5001TVhMBflpYHQJc2",
    intent: "Acanthes sculptées, rosettes, moulures et cabochons.",
  },
  sculpture: {
    source: "sculpture-prestige-v3.png",
    job: "image_19e273d10001IBFrw1H5cq7k0J",
    intent: "Volutes architecturées, pilastres cannelés et palmettes.",
  },
  estampes: {
    source: "estampes-prestige-v3.png",
    job: "image_19e273e2200194KCTEA4Kax6gx",
    intent: "Arabesques gravées, hachures, cartouches et perlage.",
  },
  dessins: {
    source: "dessins-prestige-v3.png",
    job: "image_19e273de0001RWs5FuRtpK125E",
    intent: "Lignes entrelacées, rubans feuillagés et cartouches ciselés.",
  },
  photographie: {
    source: "photographie-prestige-v3.png",
    job: "image_19e273e86001J5jqeKbqQQfqvu",
    intent: "Géométrie optique Art déco, rayons, facettes et guillochage.",
  },
  textiles: {
    source: "textiles-prestige-v3.png",
    job: "image_19e273e5d001B9OtPMPOQoD1AE",
    intent: "Tressages sculptés, nœuds et entrelacs brodés.",
  },
  ceramique: {
    source: "ceramique-prestige-v3.png",
    job: "image_19e273fac001jQkB31rDKWxc7M",
    intent: "Profils tournés, rosaces émaillées et bordures festonnées.",
  },
  "arts-metal": {
    source: "arts-metal-prestige-v3.png",
    job: "image_19e273f4f001G7hFL9lzFc2Fjn",
    intent: "Repoussé, filigranes, volutes et fermoirs d’orfèvrerie.",
  },
  verre: {
    source: "verre-prestige-v3.png",
    job: "image_19e273f8a001B0hBAtY7832lES",
    intent: "Prismes taillés, transparences bleutées et sertissages végétaux.",
  },
  mobilier: {
    source: "mobilier-prestige-v3.png",
    job: "image_19e273ec7001M5J74narEEkj96",
    intent: "Bronzes d’ameublement, palmettes et marqueterie géométrique.",
  },
  manuscrits: {
    source: "manuscrits-prestige-v3.png",
    job: "image_19e273f08001BpuKqdlTHkjT55",
    intent: "Reliure précieuse, entrelacs, fermoirs et cabochons.",
  },
  archeologie: {
    source: "archeologie-prestige-v3.png",
    job: "image_19e273f27001LU4Gew6xmjwaUN",
    intent:
      "Strates minérales, spirales incisées et granulation, sans glyphes ni bisons.",
  },
  japon: {
    source: "japon-prestige-v3.png",
    job: "image_19e273ee5001WcefGhaPws5aTu",
    intent: "Vagues, nuages, chrysanthèmes et réseaux géométriques.",
  },
} as const;

export const prestigeBrief =
  "Trop simpliste de manière générale et cadre lapis pas assez exceptionnel pour la rareté la plus rare. Base toi sur les themes 'exposition classique' ou 'egypte ancienne' ou 'arts decoratifs' ou 'fantastique occidental' ou 'abstraction geometrique' ou 'paleolitique', ceux la sont bons et a garder, améliore les autres";
