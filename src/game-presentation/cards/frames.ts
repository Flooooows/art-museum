import refined from "./assets/refined-frames.json";
import type { Artwork } from "../../data";
import { frameChoiceFor, type FrameFamily } from "./frameRules";

export interface LabFrame {
  key: string;
  family: FrameFamily;
  finish: string;
  level: number;
  file: string;
  assetDirectory: string;
  width: number;
  height: number;
  aperture: { left: number; top: number; width: number; height: number };
  sourceFile: string;
  sourceSha256: string;
  outputSha256: string;
  windowFile: string;
  windowSha256: string;
  sourceMaskFile: string | null;
  sourceMaskSha256: string | null;
  clearedRectangle: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}
export const commonCardAperture = refined.commonAperture;
export const labFrames = refined.frames as Record<string, LabFrame>;
export function cardFrameFor(
  art: Pick<Artwork, "id" | "catalog" | "catalogIds" | "origin" | "rarity">,
) {
  const choice = frameChoiceFor(art),
    frame = labFrames[choice.key];
  // Removed families remain visible without a frame or a thematic substitution.
  return { ...choice, level: art.rarity, asset: frame ?? null };
}
