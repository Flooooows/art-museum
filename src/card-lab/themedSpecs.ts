/** Theme identity precedes luxury: materials and construction are not shared floral ornament. */
export const themedSpecs = {
  "peinture-neutre": {
    source: "peinture-theme-v4.png",
    job: "image_19e41ae870014FE0vrgC8dnTvY",
    cues: ["empâtements", "brosses et viroles", "palettes à trou de pouce"],
    materials:
      "Pigments, poils de brosse et bois d’atelier ; accents minéraux et viroles précieuses.",
  },
  sculpture: {
    source: "sculpture-theme-v4.png",
    job: "image_19e41af23001rfQOeLG9MAxRDn",
    cues: [
      "marbre brut et poli",
      "traces de ciseau",
      "socles et outils de sculpture",
    ],
    materials:
      "Pierre taillée, marbre et éclats ; joints lapis et attaches discrètes.",
  },
  estampes: {
    source: "estampes-theme-v4.png",
    job: "image_19e41af33001wOUuFwwxXPoEuT",
    cues: [
      "plaques gravées",
      "hachures et tailles",
      "rouleau encreur et burins",
    ],
    materials:
      "Cuivre de plaque, linoléum gravé et encre ; incrustations dans les tailles.",
  },
  dessins: {
    source: "dessins-theme-v4.png",
    job: "image_19e41af44001GfF2sOLEPbLdQ2",
    cues: [
      "papier ivoire",
      "mines et crayons",
      "hachures et traits de construction",
    ],
    materials:
      "Papier, graphite et bois de crayon ; émail lapis et viroles fines.",
  },
  photographie: {
    source: "photographie-theme-v4.png",
    job: "image_19e41af4d001LEC8oeFDADwcEK",
    cues: [
      "perforations de pellicule",
      "diaphragmes",
      "bagues optiques et vis",
    ],
    materials:
      "Métal usiné noir, chrome et verre optique ; reflets bleus, détails mécaniques précieux.",
  },
  textiles: {
    source: "textiles-theme-v4.png",
    job: "image_19e41af59001cKADqMOFkJR7zy",
    cues: ["chaîne et trame", "ourlets et coutures", "tresses et navette"],
    materials:
      "Lin, tissage et fils indigo ; soie lapis et fil d’or réellement tissés.",
  },
  ceramique: {
    source: "ceramique-theme-v4.png",
    job: "image_19e41af61001LjUrZXWHfFrjvx",
    cues: [
      "stries de tournage",
      "glaçure craquelée",
      "terre cuite et colombins",
    ],
    materials:
      "Terre cuite et émail ; cobalt sous glaçure et joints dorés fins.",
  },
  "arts-metal": {
    source: "arts-metal-theme-v4.png",
    job: "image_19e41af860013mXoPZ1GmRMfjF",
    cues: ["plaques rivetées", "maillons forgés", "martelage et repoussé"],
    materials:
      "Acier patiné, tôles et chaînes ; canaux bleus incrustés et soudures précieuses.",
  },
  verre: {
    source: "verre-theme-v4.png",
    job: "image_19e41afe70017yh00ciJxCl7V9",
    cues: ["prismes et biseaux", "bulles", "réfractions et verre soufflé"],
    materials:
      "Verre et cristal translucides ; verre bleu fusionné et colliers de jonction fins.",
  },
  mobilier: {
    source: "mobilier-theme-v4.png",
    job: "image_19e41affb001tRcgJtUQ4UQ1qd",
    cues: ["queues d’aronde", "bois tourné", "marqueterie et charnières"],
    materials:
      "Noyer et chêne à grain visible ; marqueterie lapis et ferrures précieuses.",
  },
  manuscrits: {
    source: "manuscrits-theme-v4.png",
    job: "image_19e41b0060017t6SFq5yxREnQW",
    cues: [
      "dos cousu sur nerfs",
      "tranches de parchemin",
      "fermoirs et coins de livre",
    ],
    materials:
      "Cuir, parchemin et couture de reliure ; pigment ultramarin et feuille d’or.",
  },
  archeologie: {
    source: "archeologie-theme-v4.png",
    job: "image_19e41b011001Lg9ZJ2fayiNP63",
    cues: [
      "stratigraphie",
      "tessons et fragments",
      "truelle et brosse de conservation",
    ],
    materials:
      "Sédiments, pierre et terre cuite ; tesselles minérales et attaches de conservation.",
  },
  japon: {
    source: "japon-theme-v4.png",
    job: "image_19e41b01d001fBJK6q8uguHGcn",
    cues: ["vagues seigaiha", "réseaux asanoha et shippo", "laque et sakura"],
    materials:
      "Laque noire et rouge, motifs japonais ; incrustations bleues et poudre d’or.",
  },
} as const;

export const thematicBrief =
  "Refaire les treize familles non validées en privilégiant leur thème : matériau, technique, outils et motifs distincts. Ne pas partager les mêmes fleurs, acanthes, rosettes et cabochons. Le lapis magnifie chaque langage sans le remplacer. Les six familles validées restent intactes.";
