import type { Criterion, DataType } from "../rarity-engine/types";

export const REVIEW_RARITIES = [
  "Esquisse",
  "Étude",
  "Composition",
  "Œuvre",
  "Pièce maîtresse",
] as const;
export type ReviewLevel = 0 | 1 | 2 | 3 | 4;
export interface ReviewArtwork {
  id: string;
  title: string;
  creator: string;
  date: string;
  medium: string;
  context: string;
  family: string;
  institution: string;
  sourceUrl: string;
  imageUrl: string;
  license: string;
  origin: "existing" | "new";
  activeLevel: ReviewLevel | null;
  proposal: {
    score: number;
    level: ReviewLevel;
    confidence: number;
    interval: { lower: number; upper: number };
    status: "confirmed" | "provisional";
    stable: boolean;
    reasons: string[];
    criteria: Record<
      Criterion,
      {
        score: number;
        lower: number;
        upper: number;
        type: DataType;
        method: string;
        notes: string[];
        sourceUrls: string[];
        comparableIds: string[];
      }
    >;
  };
}
export interface ReviewCatalog {
  schemaVersion: 1;
  version: string;
  algorithmVersion: string;
  configurationVersion: string;
  method: string;
  works: ReviewArtwork[];
}
export interface ReviewDecision {
  artworkId: string;
  finalLevel: ReviewLevel;
  decidedAt: string;
}
export type ReviewDecisions = Record<string, ReviewDecision>;
export interface ReviewExport {
  format: "muse-rarity-review";
  schemaVersion: 1;
  catalogVersion: string;
  algorithmVersion: string;
  exportedAt: string;
  decisions: ReviewDecision[];
}
