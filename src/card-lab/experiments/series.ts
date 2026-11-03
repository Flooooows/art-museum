import { acceptedFrameExperiments } from "../generationStyle";

/** Local series requested for file review. No registry activation or publication. */
export const newFrameExperiments = [
  {
    family: "peinture-neutre",
    theme: "Peinture",
    imageJob: "image_19f123c47001sMmyMBI8NjqEMJ",
  },
  {
    family: "sculpture",
    theme: "Sculpture",
    imageJob: "image_19f157b5e0019yDdnhSnQiej8I",
  },
  {
    family: "estampes",
    theme: "Estampes",
    imageJob: "image_19f123ca9001R7CJXKY6b6ucgD",
  },
  {
    family: "dessins",
    theme: "Dessins",
    imageJob: "image_19f123c75001uGCyzp62Ay3ohi",
  },
  {
    family: "textiles",
    theme: "Textiles",
    imageJob: "image_19f12c294001fyEJMu6k6Nzj5q",
  },
  {
    family: "ceramique",
    theme: "Céramique",
    imageJob: "image_19f12c2fb001BQTbMZnlWHtJpV",
  },
  {
    family: "arts-metal",
    theme: "Arts du métal",
    imageJob: "image_19f12c33f001KThPFcBHISsmtz",
  },
  {
    family: "verre",
    theme: "Verre",
    imageJob: "image_19f12c2bf001oaIUkbHQ2dHdOF",
  },
  {
    family: "mobilier",
    theme: "Mobilier",
    imageJob: "image_19f132c170019tmkd22M902dWI",
  },
  {
    family: "manuscrits",
    theme: "Manuscrits",
    imageJob: "image_19f132be0001ixrkiBpieSBJkI",
  },
  {
    family: "archeologie",
    theme: "Archéologie",
    imageJob: "image_19f132ba50010lQqhAplkuh63h",
  },
] as const;

export const allFrameExperiments = [
  ...acceptedFrameExperiments,
  ...newFrameExperiments,
];

export const generationIncidents = [
  {
    family: "sculpture",
    failedJob: "image_19f123ce7001g97erm50mP1XzC",
    reason: "Rejet du filtre du service d’images ; aucune image produite.",
    userApprovedRetry: true,
    replacementJob: "image_19f157b5e0019yDdnhSnQiej8I",
    revisedSubject:
      "Têtes sculptées, blocs de pierre et outils ; aucun corps, torse ou buste.",
  },
] as const;
