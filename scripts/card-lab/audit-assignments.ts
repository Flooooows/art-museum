import { mkdir, writeFile } from "node:fs/promises";
import { artworks } from "../../src/data";
import { cardFrameFor } from "../../src/card-lab/frames";
import {
  activeFrameFamilies,
  frameFamilies,
  frameFamilyLabels,
  generatedFrameFamilies,
} from "../../src/card-lab/frameRules";

const assignments = artworks.map((art) => {
  const frame = cardFrameFor(art);
  return {
    id: art.id,
    title: art.title,
    type: art.catalog,
    rarity: art.rarity,
    family: frame.family,
    key: frame.key,
    reason: frame.reason,
  };
});
const report = {
  scope: "Laboratoire uniquement ; aucune donnée de catalogue modifiée.",
  works: assignments.length,
  registeredFamilies: frameFamilies.length,
  activeFamilies: activeFrameFamilies.length,
  generatedBases: generatedFrameFamilies.length,
  variants: frameFamilies.length * 5,
  archivedFamilies: ["prehistoire"],
  counts: Object.fromEntries(
    frameFamilies.map((f) => [
      f,
      {
        label: frameFamilyLabels[f],
        works: assignments.filter((a) => a.family === f).length,
      },
    ]),
  ),
  assignments,
};
if (assignments.some((a) => a.family === "prehistoire"))
  throw Error("Un cadre archivé a été affecté.");
await mkdir("catalog/card-lab", { recursive: true });
await writeFile(
  "catalog/card-lab/frame-assignments.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  `Laboratoire : ${assignments.length} affectations vérifiées ; aucun cadre Paléolithique affecté.`,
);
