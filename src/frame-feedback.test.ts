import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  emptyFrameFeedback,
  parseFrameFeedback,
  updateFrameOpinion,
  mergeFrameFeedback,
  FRAME_FEEDBACK_KEY,
} from "./card-lab/feedback";

const revision = "a".repeat(64);
const time = "2026-11-02T12:00:00.000Z";

test("avis cadres — anciens commentaires de rareté regroupés sans perte ni duplication", () => {
  const legacy = {
    version: 1,
    families: {
      japon: {
        style: {
          decision: "changes",
          comment: "Style trop simple.",
          revision,
          updatedAt: time,
        },
        finishes: {
          fer: {
            decision: "approved",
            comment: "Fer réussi.",
            revision,
            updatedAt: time,
          },
          "lapis-lazuli": {
            decision: "changes",
            comment: "Lapis trop ordinaire.",
            revision,
            updatedAt: time,
          },
        },
      },
    },
  };
  const migrated = parseFrameFeedback(JSON.stringify(legacy));
  assert.match(migrated.families.japon!.style!.comment, /Style trop simple\./);
  assert.match(migrated.families.japon!.style!.comment, /Fer réussi\./);
  assert.match(
    migrated.families.japon!.style!.comment,
    /Lapis trop ordinaire\./,
  );
  assert.equal(migrated.families.japon!.finishes.fer.comment, "");
  assert.equal(migrated.families.japon!.finishes.fer.decision, "approved");
  assert.deepEqual(parseFrameFeedback(JSON.stringify(migrated)), migrated);
  assert.throws(() =>
    updateFrameOpinion(
      migrated,
      "japon",
      "fer",
      { comment: "Interdit" },
      revision,
    ),
  );
  const onlyFinish = structuredClone(legacy);
  delete (onlyFinish.families.japon as any).style;
  const restored = parseFrameFeedback(JSON.stringify(onlyFinish));
  assert.equal(restored.families.japon!.style!.decision, "pending");
  assert.match(restored.families.japon!.style!.comment, /Fer réussi/);
});

test("avis cadres — import complémentaire sans remplacement silencieux des avis locaux", () => {
  const local = updateFrameOpinion(
    emptyFrameFeedback(),
    "japon",
    null,
    { comment: "À garder localement." },
    revision,
    time,
  );
  let remote = updateFrameOpinion(
    emptyFrameFeedback(),
    "japon",
    null,
    { comment: "Conflit." },
    revision,
    time,
  );
  remote = updateFrameOpinion(
    remote,
    "japon",
    "dore",
    { decision: "changes" },
    revision,
    time,
  );
  const merged = mergeFrameFeedback(local, remote);
  assert.equal(merged.families.japon?.style?.comment, "À garder localement.");
  assert.equal(merged.families.japon?.finishes.dore.decision, "changes");
  assert.equal(local.families.japon?.finishes.dore, undefined);
});

test("avis cadres — style, cinq finitions et catégories indépendants, sans mutation", () => {
  const initial = emptyFrameFeedback();
  let state = updateFrameOpinion(
    initial,
    "japon",
    null,
    { decision: "changes", comment: "Alléger les motifs." },
    revision,
    time,
  );
  for (const finish of ["fer", "cuivre", "argent", "dore", "lapis-lazuli"]) {
    state = updateFrameOpinion(
      state,
      "japon",
      finish,
      { decision: "approved" },
      revision,
      time,
    );
  }
  state = updateFrameOpinion(
    state,
    "sculpture",
    null,
    { comment: "Or trop jaune." },
    revision,
    time,
  );
  assert.deepEqual(initial, emptyFrameFeedback());
  assert.equal(state.families.japon?.style?.decision, "changes");
  assert.equal(Object.keys(state.families.japon!.finishes).length, 5);
  assert.equal(state.families.sculpture?.style?.decision, "pending");
  assert.equal(state.families.japon?.finishes.dore.comment, "");
  assert.deepEqual(parseFrameFeedback(JSON.stringify(state)), state);
});

test("avis cadres — changement d’avis, commentaire et version examinée conservés", () => {
  const first = updateFrameOpinion(
    emptyFrameFeedback(),
    "japon",
    null,
    { decision: "approved", comment: "Métal lisible." },
    revision,
    time,
  );
  const second = updateFrameOpinion(
    first,
    "japon",
    null,
    { decision: "changes" },
    "b".repeat(64),
    time,
  );
  assert.equal(second.families.japon?.style?.comment, "Métal lisible.");
  assert.equal(second.families.japon?.style?.revision, "b".repeat(64));
  assert.equal(first.families.japon?.style?.decision, "approved");
  const cleared = updateFrameOpinion(
    second,
    "japon",
    null,
    { decision: "pending", comment: "" },
    revision,
    time,
  );
  assert.equal(cleared.families.japon?.style?.decision, "pending");
});

test("avis cadres — données invalides refusées avant import ou restauration", () => {
  const valid = updateFrameOpinion(
    emptyFrameFeedback(),
    "japon",
    null,
    { comment: "Texte" },
    revision,
    time,
  );
  for (const change of [
    (s: any) => {
      s.version = 2;
    },
    (s: any) => {
      s.families.inconnue = s.families.japon;
    },
    (s: any) => {
      s.families.japon.finishes.inconnue = s.families.japon.style;
    },
    (s: any) => {
      s.families.japon.style.comment = "x".repeat(35001);
    },
    (s: any) => {
      s.families.japon.style.decision = "yes";
    },
    (s: any) => {
      s.families.japon.style.updatedAt = "invalide";
    },
    (s: any) => {
      s.families.japon.style.revision = "";
    },
    (s: any) => {
      s.families.japon.finishes = [];
    },
  ]) {
    const input = structuredClone(valid);
    change(input);
    assert.throws(() => parseFrameFeedback(JSON.stringify(input)));
  }
  assert.throws(() => parseFrameFeedback("{broken"));
  assert.throws(() => parseFrameFeedback("null"));
});

test("avis cadres — stockage et export distincts des sauvegardes du jeu", async () => {
  assert.equal(FRAME_FEEDBACK_KEY, "muse-card-lab-frame-feedback-v1");
  const ui = await readFile("src/card-lab/FrameFeedback.tsx", "utf8");
  assert.doesNotMatch(
    ui,
    /from ["']\.\.\/collection|openPack|revealCards|fetch\(/,
  );
  assert.match(ui, /sourceSha256/);
  assert.match(ui, /outputSha256/);
  assert.match(ui, /application\/json/);
});
