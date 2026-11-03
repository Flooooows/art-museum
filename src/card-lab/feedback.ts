import { frameFamilies, type FrameFamily } from "./frameRules";
import { rarities } from "../data";

export const FRAME_FEEDBACK_KEY = "muse-card-lab-frame-feedback-v1";
export const GLOBAL_COMMENT_LIMIT = 35000;
export const feedbackDecisions = ["pending", "approved", "changes"] as const;
export type FeedbackDecision = (typeof feedbackDecisions)[number];
export interface FrameOpinion {
  decision: FeedbackDecision;
  comment: string;
  updatedAt: string;
  /** Fingerprint of the reviewed image, not of a later regenerated version. */
  revision: string;
}
export interface FamilyFeedback {
  style?: FrameOpinion;
  finishes: Record<string, FrameOpinion>;
}
export interface FrameFeedback {
  version: 1;
  families: Partial<Record<FrameFamily, FamilyFeedback>>;
}
export const emptyFrameFeedback = (): FrameFeedback => ({
  version: 1,
  families: {},
});
export const emptyOpinion = (): FrameOpinion => ({
  decision: "pending",
  comment: "",
  updatedAt: "",
  revision: "",
});

/** Fill gaps only: an import must never silently replace a local opinion. */
export function mergeFrameFeedback(
  local: FrameFeedback,
  incoming: FrameFeedback,
): FrameFeedback {
  const next: FrameFeedback = { version: 1, families: { ...local.families } };
  for (const family of frameFamilies) {
    const previous = local.families[family],
      remote = incoming.families[family];
    if (remote)
      next.families[family] = {
        style: previous?.style ?? remote.style,
        finishes: { ...remote.finishes, ...previous?.finishes },
      };
  }
  return next;
}

export function updateFrameOpinion(
  state: FrameFeedback,
  family: FrameFamily,
  finish: string | null,
  patch: Partial<Pick<FrameOpinion, "decision" | "comment">>,
  revision: string,
  now = new Date().toISOString(),
): FrameFeedback {
  if (
    !frameFamilies.includes(family) ||
    (finish !== null && !rarities.some((r) => r.finish === finish))
  )
    throw Error("Cadre inconnu.");
  if (finish !== null && patch.comment !== undefined)
    throw Error("Le commentaire doit être global à la catégorie.");
  const previous = state.families[family] ?? { finishes: {} };
  const opinion = {
    ...((finish === null ? previous.style : previous.finishes[finish]) ??
      emptyOpinion()),
    ...patch,
    revision,
    updatedAt: now,
  };
  if (
    !feedbackDecisions.includes(opinion.decision) ||
    opinion.comment.length > GLOBAL_COMMENT_LIMIT
  )
    throw Error("Avis invalide.");
  return {
    version: 1,
    families: {
      ...state.families,
      [family]:
        finish === null
          ? { ...previous, style: opinion }
          : {
              ...previous,
              finishes: { ...previous.finishes, [finish]: opinion },
            },
    },
  };
}

/** Validate everything before using browser data or an exported file. */
export function parseFrameFeedback(raw: string): FrameFeedback {
  const input = JSON.parse(raw);
  if (
    !input ||
    input.version !== 1 ||
    !input.families ||
    typeof input.families !== "object" ||
    Array.isArray(input.families)
  )
    throw Error("Fichier d’avis non reconnu.");
  const result = emptyFrameFeedback();
  function opinion(value: unknown): FrameOpinion {
    if (!value || typeof value !== "object") throw Error("Avis invalide.");
    const v = value as FrameOpinion;
    if (
      !feedbackDecisions.includes(v.decision) ||
      typeof v.comment !== "string" ||
      v.comment.length > GLOBAL_COMMENT_LIMIT ||
      typeof v.revision !== "string" ||
      !/^[a-f0-9]{64}$/.test(v.revision) ||
      typeof v.updatedAt !== "string" ||
      !Number.isFinite(Date.parse(v.updatedAt))
    )
      throw Error("Avis invalide.");
    return {
      decision: v.decision,
      comment: v.comment,
      revision: v.revision,
      updatedAt: v.updatedAt,
    };
  }
  for (const [family, value] of Object.entries(input.families)) {
    if (
      !(frameFamilies as readonly string[]).includes(family) ||
      !value ||
      typeof value !== "object"
    )
      throw Error("Catégorie inconnue.");
    const v = value as FamilyFeedback;
    if (
      !v.finishes ||
      typeof v.finishes !== "object" ||
      Array.isArray(v.finishes)
    )
      throw Error("Finitions invalides.");
    const entry: FamilyFeedback = { finishes: {} };
    if (v.style !== undefined) entry.style = opinion(v.style);
    for (const [finish, item] of Object.entries(v.finishes)) {
      if (!rarities.some((r) => r.finish === finish))
        throw Error("Finition inconnue.");
      entry.finishes[finish] = opinion(item);
    }
    // Migrate old per-finish comments into the single category comment without
    // losing user text. Cleared legacy fields make the migration idempotent.
    const previousComments: string[] = [];
    for (const rarity of rarities) {
      const finish = entry.finishes[rarity.finish];
      if (finish?.comment) {
        previousComments.push(
          `[Ancien commentaire · ${rarity.name} / ${rarity.material}]\n${finish.comment}`,
        );
        if (!entry.style)
          entry.style = { ...finish, decision: "pending", comment: "" };
        finish.comment = "";
      }
    }
    if (previousComments.length && entry.style) {
      entry.style.comment = [entry.style.comment, ...previousComments]
        .filter(Boolean)
        .join("\n\n");
      if (entry.style.comment.length > GLOBAL_COMMENT_LIMIT)
        throw Error("Commentaire global trop long.");
    }
    result.families[family as FrameFamily] = entry;
  }
  return result;
}
