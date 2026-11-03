export const generatedSpecs = {
  "peinture-neutre": {
    source: "peinture-master.png",
    job: "image_197f568fd001l96jbw2QFMCuse",
    intent:
      "Moulures d’atelier et stries de pinceau, sans décor culturel imposé.",
  },
  sculpture: {
    source: "sculpture-master.png",
    job: "image_197f569630016A6KJTL02Ylb1O",
    intent:
      "Volumes sculptés, facettes et traces d’outil, sans colonnes ni statue représentée.",
  },
  estampes: {
    source: "estampes-master.png",
    job: "image_197f5696b001pDBzKFS9NeF4aq",
    intent: "Taille-douce, hachures et bord de plaque, sans motifs nationaux.",
  },
  dessins: {
    source: "dessins-master.png",
    job: "image_197f56972001RoTnYLeyRnIhfe",
    intent: "Traits et fines rainures, sans décor historique ajouté.",
  },
  photographie: {
    source: "photographie-master.png",
    job: "image_197f5697a0019rHjSQv7GAl0IO",
    intent:
      "Présentation photographique de conservation, sans bande de film ni Art déco imposé.",
  },
  textiles: {
    source: "textiles-master.png",
    job: "image_197f56982001VFterDr36BMba7",
    intent:
      "Chaîne, trame et bord tressé neutres, sans motif tribal ou civilisation suggérée.",
  },
  ceramique: {
    source: "ceramique-master.png",
    job: "image_197f569c1001lrhNPdseF6SMHC",
    intent:
      "Profils tournés et émail discret, sans méandre grec ni fleurs chinoises.",
  },
  "arts-metal": {
    source: "arts-metal-master.png",
    job: "image_197f569e1001WBDDVs66tXSp7U",
    intent:
      "Ciselure, martelage et perlage neutres, sans Art nouveau généralisé.",
  },
  verre: {
    source: "verre-master.png",
    job: "image_197f84a13001uV1frtKWAYI8SF",
    intent:
      "Reflets et arêtes polies, sans fleurs Tiffany ou période supposée.",
  },
  mobilier: {
    source: "mobilier-master.png",
    job: "image_197f84a1c001nnhv8Ftys1GiCH",
    intent:
      "Assemblages et panneaux sobres, sans style national ou époque ajoutés.",
  },
  manuscrits: {
    source: "manuscrits-master.png",
    job: "image_197f56a0a001A4d7eJ3CVbwmkE",
    intent:
      "Reliure et profils de feuillets, sans faux texte ni signe religieux.",
  },
  archeologie: {
    source: "archeologie-master.png",
    job: "image_197f56a17001aKNLDpK9qVI116",
    intent:
      "Strates minérales et plateau de conservation, sans bisons, grottes, ruines ou civilisation supposée.",
  },
} as const;

/** Replacements keep their routing keys; versioned files preserve the historical copies. */
export const generatedReplacementSpecs = {
  japon: {
    source: "japon-v2-master.png",
    assetFamily: "japon-v2",
    job: "image_1980bf1a3001xojSz3BIUkT5b1",
    intent:
      "Contour isolé à ouverture nette, vagues seigaiha et feuilles de bambou sobres ; sans médaillon impérial, texte, plaque de titre ni fond rectangulaire opaque.",
  },
} as const;

export const allGeneratedSpecs = {
  ...generatedSpecs,
  ...generatedReplacementSpecs,
} as const;
