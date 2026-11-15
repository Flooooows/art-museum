import { createContext, useContext, type CSSProperties } from "react";
import type { BoosterGroup } from "./groups";
import manifest from "./assets/packs.json";
import { CARDS_PER_PACK } from "../packRules";

const images = import.meta.glob<string>(
  ["./assets/prepared/*.webp", "./assets/vector/*/*.webp"],
  { eager: true, query: "?url", import: "default" },
);

/** Generated illustrations, then four vector proposals (scripts/booster-lab/vector-packs.ts). */
export const packStyles = [
  { id: "illustration", title: "Illustrations actuelles" },
  { id: "deco", title: "Art déco" },
  { id: "musee", title: "Cartel de musée" },
  { id: "sceau", title: "Sceau de cire" },
  { id: "vitrail", title: "Vitrail" },
] as const;
export type PackStyle = (typeof packStyles)[number]["id"];
export const PackStyleContext = createContext<PackStyle>("illustration");

/** Text colour printed over each style's pouch. */
function inkFor(style: PackStyle, group: BoosterGroup) {
  if (style === "musee") return "#2b1d17";
  if (style === "sceau" || style === "vitrail") return "#f6e7c8";
  return group.ink;
}

export default function BoosterVisual({ group }: { group: BoosterGroup }) {
  const style = useContext(PackStyleContext);
  const pack = manifest.packs[group.id];
  const src =
    style === "illustration"
      ? images[`./assets/prepared/${pack.file}`]
      : images[`./assets/vector/${style}/${group.id}.webp`];
  if (!src) throw Error(`Visuel de pochette manquant : ${group.id} (${style})`);
  return (
    <div
      className={`booster-visual${group.shortTitle.includes("\n") ? " booster-visual--two-lines" : ""}`}
      data-booster-id={group.id}
      data-pack-style={style}
      style={{ "--pack-ink": inkFor(style, group) } as CSSProperties}
      role="img"
      aria-label={`Pochette MUSE ${group.title}, ${group.palette.toLowerCase()}`}
    >
      <img src={src} alt="" width={768} height={1152} />
      <div className="booster-visual__brand" aria-hidden="true">
        <strong>MUSE</strong>
        <span>L’ART À COLLECTIONNER</span>
      </div>
      <div className="booster-visual__edition" aria-hidden="true">
        <span>
          {group.id === "universel" ? "TOUS LES ARTS" : "LA COLLECTION"}
        </span>
        <strong>{group.shortTitle}</strong>
        <small>{CARDS_PER_PACK} CARTES · UNE DÉCOUVERTE</small>
      </div>
    </div>
  );
}
