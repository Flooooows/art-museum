import type { CSSProperties } from "react";
import type { BoosterGroup } from "./groups";
import manifest from "./assets/packs.json";
import { CARDS_PER_PACK } from "../../packRules";

const images = import.meta.glob<string>("./assets/prepared/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

export default function BoosterVisual({ group }: { group: BoosterGroup }) {
  const pack = manifest.packs[group.id];
  const src = images[`./assets/prepared/${pack.file}`];
  if (!src) throw Error(`Visuel de pochette manquant : ${group.id}`);
  return (
    <div
      className={`booster-visual${group.shortTitle.includes("\n") ? " booster-visual--two-lines" : ""}`}
      data-booster-id={group.id}
      style={{ "--pack-ink": group.ink } as CSSProperties}
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
