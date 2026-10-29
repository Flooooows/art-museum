export const CRITERIA = ["P", "A", "H", "M", "C"] as const;
export type Criterion = (typeof CRITERIA)[number];
export const CATEGORIES = [
  "painting",
  "sculpture",
  "antiquity",
  "decorative",
  "photography",
  "manuscript",
  "other",
] as const;
export type Category = (typeof CATEGORIES)[number];
export type Weights = Record<Criterion, number>;
export type DataType = "observed" | "derived" | "estimated";
export interface Interval {
  lower: number;
  upper: number;
}
export interface Evidence {
  id: string;
  provider: string;
  independentGroup: string;
  url: string;
  retrievedAt: string;
  file: string;
  sha256: string;
  tier: 1 | 2 | 3;
  scope: "artwork" | "creator" | "context" | "policy";
}
export interface MonthlyAudience {
  title: string;
  language: string;
  months: { timestamp: string; views: number }[];
  expectedMonths: string[];
  evidence: Evidence[];
}
export interface EditorialValue {
  score: number;
  reason: string;
  evidence: Evidence[];
}
export interface ArtworkInput {
  id: string;
  title: string;
  creator: string;
  creatorMode: "identified" | "workshop" | "anonymous" | "uncertain";
  category: Category;
  medium: string;
  displayDate: string;
  yearStart: number | null;
  yearEnd: number | null;
  institution: string;
  context: string;
  externalIds: { provider: string; id: string }[];
  creatorIds?: string[];
  identity: {
    status: "verified" | "metadata_only" | "ambiguous" | "insufficient";
    confidence: number;
    reasons: string[];
  };
  activeLevel: number;
  exploratoryScore: number | null;
  institutionEvidence: Evidence[];
  workAudience: MonthlyAudience[];
  artistAudiences: MonthlyAudience[][];
  audienceScope: "exact_object" | "reviewed_composition";
  institutionSignals: {
    collectionVerified: boolean;
    publicRecord: boolean;
    highlight: boolean | null;
    citations: { key: string; text: string }[] | null;
    exhibitions: { key: string; title: string }[] | null;
    educationText: string | null;
  };
  editorial: Partial<Record<Criterion, EditorialValue>>;
}
export interface CriterionResult extends Interval {
  score: number;
  type: DataType;
  method: string;
  sourceTier: 1 | 2 | 3;
  sourceQuality: number;
  observedShare: number;
  consistency: number;
  evidence: Evidence[];
  rawIndicators: Record<string, number | string | boolean | null>;
  comparableIds: string[];
  notes: string[];
}
export type CriteriaResults = Record<Criterion, CriterionResult>;
export type DirectResults = Partial<CriteriaResults>;
export interface EngineConfig {
  algorithmVersion: string;
  configurationVersion: string;
  issuedAt: string;
  mode: "simulation";
  weights: Weights;
  thresholds: number[];
  rarities: string[];
  normalization: {
    mode: "provisional" | "reference-percentiles";
    referenceFile: string | null;
    minimumReferenceSize: number;
    minimumCategorySize: number;
    minimumCreatorReferenceSize: number;
    categoryBlend: number;
    dailyViewKnots: number[][];
    creatorDailyViewKnots: number[][];
    categoryDailyScale: Record<Category, number>;
    uncertaintyPoints: number;
    rationale: string;
  };
  estimation: {
    minimumPeers: number;
    minimumPopularityPeers: number;
    priorStrength: number;
    minimumPeerQuality: number;
    minimumHalfWidth: number;
    anonymousContextMaximum: number;
    maximumArtistPopularityUplift: number;
    maximumInstitutionPopularityUplift: number;
    contextSignals: {
      highlightUplift: number;
      minimumScholarlyReferences: number;
      scholarlyUplift: number;
      minimumExhibitions: number;
      exhibitionUplift: number;
      maximumUplift: number;
    };
    priors: Record<Category, Record<Criterion, number[]>>;
    rationale: string;
  };
  indicators: {
    historyCitationKnots: number[][];
    historyProxyHalfWidth: number;
    collectionPoints: number;
    publicRecordPoints: number;
    highlightPoints: number;
    exhibitionMaximum: number;
    publicationMaximum: number;
    institutionMaximum: number;
    institutionHalfWidth: number;
    missingExhibitionPoints: number;
    missingPublicationPoints: number;
    missingHighlightPoints: number;
    editorialHalfWidth: number;
    educationOnlyCultureScore: number;
    educationOnlyCultureHalfWidth: number;
    rationale: string;
  };
  confidence: {
    componentWeights: Record<
      | "coverage"
      | "sourceQuality"
      | "identification"
      | "observedShare"
      | "precision"
      | "consistency",
      number
    >;
    confirmedMinimum: number;
    minimumObservedCoverage: number;
    maximumEstimatedWeight: number;
    minimumIndependentGroups: number;
    thresholdMargin: number;
    highEstimationWeight: number;
    highEstimationConfidenceCap: number;
    priorOnlyConfidenceCap: number;
    provisionalNormalizationCap: number;
    conflictTolerance: number;
    rationale: string;
  };
  sensitivity: {
    normalizationScales: number[];
    weightProfiles: Record<string, Weights>;
  };
  providers: {
    minimumIntervalMs: number;
    timeoutMs: number;
    maximumRetryAfterMs: number;
    userAgent: string;
  };
}
export interface ReferenceCatalog {
  version: string;
  frozenAt: string;
  representative: boolean;
  provenance: string;
  period: { start: string; end: string };
  languages: string[];
  records: { id: string; category: Category; dailyViews: number }[];
  creatorRecords?: { id: string; dailyViews: number }[];
}
export interface ConfidenceDetails {
  score: number;
  components: Record<
    keyof EngineConfig["confidence"]["componentWeights"],
    number
  >;
  estimatedWeight: number;
  independentGroups: string[];
  capsApplied: string[];
}
export interface RarityResult {
  artworkId: string;
  title: string;
  category: Category;
  creatorMode: ArtworkInput["creatorMode"];
  algorithmVersion: string;
  configurationVersion: string;
  notorietyScore: number;
  rarityLevel: number;
  rarity: string;
  activeLevel: number;
  activeRarity: string;
  exploratoryScore: number | null;
  scoreInterval: Interval;
  confidenceScore: number;
  confidence: ConfidenceDetails;
  status: "confirmed" | "provisional";
  criteria: CriteriaResults;
  perspectives: {
    globalScore: number;
    categoryScore: number;
    categoryReferenceAvailable: boolean;
  };
  sensitivity: { profile: string; score: number; level: number }[];
  stableClassification: boolean;
  reviewReasons: string[];
  masterpieceCandidate: boolean;
  possibleRarities: string[];
  identity: ArtworkInput["identity"];
}
