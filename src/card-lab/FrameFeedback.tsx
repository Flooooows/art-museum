import { useId, useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { rarities } from "../data";
import {
  frameFamilies,
  frameFamilyLabels,
  type FrameFamily,
} from "./frameRules";
import { labFrames } from "./frames";
import {
  FRAME_FEEDBACK_KEY,
  GLOBAL_COMMENT_LIMIT,
  emptyFrameFeedback,
  emptyOpinion,
  parseFrameFeedback,
  updateFrameOpinion,
  mergeFrameFeedback,
  type FrameOpinion,
  type FeedbackDecision,
  type FrameFeedback,
} from "./feedback";
import "./feedback.css";

function loadFeedback() {
  try {
    const raw = localStorage.getItem(FRAME_FEEDBACK_KEY);
    return {
      data: raw ? parseFrameFeedback(raw) : emptyFrameFeedback(),
      error: "",
    };
  } catch {
    return {
      data: emptyFrameFeedback(),
      error:
        "Les avis précédents sont inaccessibles ou invalides. Ils n’ont pas été écrasés. Les nouveaux avis restent en mémoire : exporte-les pour les conserver.",
    };
  }
}

const decisions: { value: FeedbackDecision; label: string }[] = [
  { value: "pending", label: "Sans avis" },
  { value: "approved", label: "Approuvé" },
  { value: "changes", label: "À revoir" },
];

function OpinionFields({
  title,
  value,
  revision,
  onChange,
  globalComment = false,
}: {
  title: string;
  value?: FrameOpinion;
  revision: string;
  globalComment?: boolean;
  onChange: (
    patch: Partial<Pick<FrameOpinion, "decision" | "comment">>,
  ) => void;
}) {
  const id = useId();
  const opinion = value ?? emptyOpinion();
  return (
    <fieldset className="frame-opinion">
      <legend>{title}</legend>
      <div className="frame-opinion__choices">
        {decisions.map((item) => (
          <label key={item.value}>
            <input
              type="radio"
              name={id}
              value={item.value}
              checked={opinion.decision === item.value}
              onChange={() => onChange({ decision: item.value })}
            />
            {item.label}
          </label>
        ))}
      </div>
      {globalComment && (
        <>
          <label htmlFor={`${id}-comment`}>
            Commentaire global pour cette catégorie
          </label>
          <textarea
            id={`${id}-comment`}
            rows={3}
            maxLength={GLOBAL_COMMENT_LIMIT}
            value={opinion.comment}
            placeholder="Décris ici les problèmes et changements souhaités pour le style et l’ensemble de ses raretés…"
            onChange={(event) => onChange({ comment: event.target.value })}
          />
        </>
      )}
      {opinion.revision && opinion.revision !== revision && (
        <div className="frame-opinion__outdated">
          <p>
            Cet avis concerne une ancienne version du cadre. Vérifie le nouveau
            visuel avant de le reconfirmer.
          </p>
          <button
            type="button"
            onClick={() => onChange({ decision: opinion.decision })}
          >
            Reconfirmer pour cette version
          </button>
        </div>
      )}
    </fieldset>
  );
}

export default function FrameFeedbackPanel({
  family,
}: {
  family: FrameFamily;
}) {
  const [boot] = useState(loadFeedback);
  const [feedback, setFeedback] = useState(boot.data);
  const latest = useRef(feedback);
  const [storageError, setStorageError] = useState(boot.error);
  const [message, setMessage] = useState("");
  const fileId = useId();
  const entry = feedback.families[family];
  const count = Object.values(feedback.families).filter(
    (value) => value && (value.style || Object.keys(value.finishes).length),
  ).length;

  function save(next: FrameFeedback) {
    latest.current = next;
    setFeedback(next);
    setMessage("");
    if (storageError) return;
    try {
      localStorage.setItem(FRAME_FEEDBACK_KEY, JSON.stringify(next));
    } catch {
      setStorageError(
        "L’enregistrement local a échoué. Tes avis restent en mémoire : exporte-les avant de fermer la page.",
      );
    }
  }

  function change(
    finish: string | null,
    patch: Partial<Pick<FrameOpinion, "decision" | "comment">>,
  ) {
    const frame = labFrames[`${family}-${finish ?? "argent"}`];
    save(
      updateFrameOpinion(
        latest.current,
        family,
        finish,
        patch,
        finish === null ? frame.sourceSha256 : frame.outputSha256,
      ),
    );
  }

  function exportFeedback() {
    const payload = {
      ...feedback,
      exportedAt: new Date().toISOString(),
      categoryLabels: Object.fromEntries(
        frameFamilies.map((f) => [f, frameFamilyLabels[f]]),
      ),
      rarityLabels: rarities.map((r) => ({
        finish: r.finish,
        name: r.name,
        material: r.material,
      })),
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `muse-avis-cadres-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(
      "Export préparé. Transmets ce fichier dans la conversation pour que je puisse utiliser tes retours.",
    );
  }

  async function importFeedback(file?: File) {
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw Error("Fichier trop volumineux.");
      const incoming = parseFrameFeedback(await file.text());
      save(mergeFrameFeedback(latest.current, incoming));
      setMessage(
        "Avis importés. En cas de conflit, les avis déjà présents dans ce navigateur ont été conservés.",
      );
    } catch {
      setMessage(
        "Import refusé : fichier invalide ou trop volumineux. Aucun avis n’a été modifié.",
      );
    }
  }

  return (
    <section
      className="frame-feedback"
      aria-labelledby="frame-feedback-title"
      id="avis-cadres"
    >
      <div className="frame-feedback__heading">
        <div>
          <p className="lab-eyebrow">Tes retours pour la prochaine version</p>
          <h3 id="frame-feedback-title">Avis · {frameFamilyLabels[family]}</h3>
          <p>
            Évalue le style et ses cinq finitions, avec un seul commentaire
            global pour cette catégorie. « À revoir » signifie que tu
            désapprouves le rendu actuel. Aucune approbation n’est
            présélectionnée.
          </p>
        </div>
        <span>
          {count} / {frameFamilies.length} catégories annotées
        </span>
      </div>
      <OpinionFields
        title="Style général de la catégorie"
        globalComment
        value={entry?.style}
        revision={labFrames[`${family}-argent`].sourceSha256}
        onChange={(patch) => change(null, patch)}
      />
      <div className="frame-feedback__finishes">
        {rarities.map((r) => (
          <OpinionFields
            key={`${family}-${r.finish}`}
            title={`${r.name} · ${r.material}`}
            value={entry?.finishes[r.finish]}
            revision={labFrames[`${family}-${r.finish}`].outputSha256}
            onChange={(patch) => change(r.finish, patch)}
          />
        ))}
      </div>
      <div className="frame-feedback__transfer">
        <button type="button" onClick={exportFeedback}>
          <Download size={16} /> Exporter tous mes avis
        </button>
        <label htmlFor={fileId}>
          <Upload size={16} /> Importer des avis
        </label>
        <input
          id={fileId}
          type="file"
          accept="application/json,.json"
          onChange={(event) => {
            void importFeedback(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>
      <p className="frame-feedback__storage" role="status">
        {storageError ||
          "Avis enregistrés automatiquement dans ce navigateur uniquement, séparément du jeu."}
      </p>
      <p>
        Pour que je puisse les lire et améliorer les cadres, exporte tes avis
        puis joins le fichier à la conversation. Ils ne sont pas envoyés
        automatiquement.
      </p>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
