import assets from "./frame-assets.json";
// Historical registry only. The site no longer imports or displays these frames.
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
  return findFrame(
    art.frameFamily ?? catalog?.frameFamily ?? catalog?.id,
    art.rarity,
  );
}
