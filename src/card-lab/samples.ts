import { byId } from "../data";

/** Real catalog entries, selected to exercise aspect ratios, all rarities and long copy. */
export const sampleCases = [
  { id: "cma-136510", case: "Paysage · référence Nymphéas" },
  { id: "mona-lisa", case: "Portrait vertical · titre court" },
  { id: "45434", case: "Estampe · image très horizontale" },
  { id: "cma-137128", case: "Sculpture · silhouette verticale" },
  { id: "467642", case: "Tapisserie · détails fins" },
  { id: "cma-164940", case: "Photographie · noir et blanc" },
  { id: "cma-153706", case: "Photographie · titre très long" },
  { id: "cma-132644", case: "Dessin · titre très long" },
  { id: "cma-155665", case: "Céramique · objet en volume" },
  { id: "cma-129216", case: "Orfèvrerie · titre long" },
  { id: "cma-324441", case: "Estampe · attribution multiple" },
  { id: "cma-173263", case: "Dessin · couleurs et petite étude" },
  { id: "544453", case: "Égypte ancienne · fer" },
  { id: "cma-136667", case: "Égypte ancienne · lapis-lazuli" },
  { id: "cma-130939", case: "Jade néolithique · archéologie sans bisons" },
  {
    id: "cma-113945",
    case: "Peinture chinoise · sans cadre occidental imposé",
  },
  { id: "cma-105933", case: "Manuscrit · sans symboles occultes" },
  { id: "9480", case: "Verre · sélection documentée vers 1900" },
  { id: "1085", case: "Mobilier · sélection documentée vers 1900" },
  { id: "cma-149105", case: "Fantastique occidental · sélection explicite" },
  { id: "cma-143278", case: "Abstraction géométrique · sélection explicite" },
].map((item) => {
  const art = byId[item.id];
  if (!art) throw Error(`Carte d’essai inconnue : ${item.id}`);
  return { ...item, art };
});
