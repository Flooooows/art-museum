import assets from "./frame-assets.json";
import { getCatalog, rarities, type Artwork } from "./data";

export interface FrameAsset {
  src: string;
  original: string;
  matte: string;
  width: number;
  height: number;
  aperture: { left: number; top: number; width: number; height: number };
  fingerprint: string;
}

export const frameAssets: Record<string, FrameAsset> = assets;

export function findFrame(
  family: string | undefined,
  rarity: number,
): FrameAsset | null {
  const finish = rarities[rarity]?.finish;
  return family && finish ? (frameAssets[`${family}-${finish}`] ?? null) : null;
}

export function getFrame(art: Artwork): FrameAsset | null {
  const catalog = getCatalog(art.catalog);
  return findFrame(catalog?.frameFamily ?? catalog?.id, art.rarity);
}
