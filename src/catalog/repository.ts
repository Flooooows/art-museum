import seed from "./seed.json";
import { parseCatalog, activeAssessment } from "./model";

/** Local editorial source. No hosted database or automatic publication is implied. */
export const catalogDataset = parseCatalog(seed);
export const workById = Object.fromEntries(
  catalogDataset.works.map((work) => [work.id, work]),
);
export const primaryImageFor = (id: string) =>
  catalogDataset.images.find((image) => image.workId === id && image.primary);
export const assessmentFor = (id: string) =>
  activeAssessment(catalogDataset, id);
export const catalogsFor = (id: string) =>
  catalogDataset.memberships
    .filter((item) => item.workId === id)
    .map((item) => item.catalogId);
