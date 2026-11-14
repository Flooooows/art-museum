import { useState } from "react";
import { ImageOff, RotateCcw } from "lucide-react";
import type { Artwork } from "../data";

export default function ArtworkImage({
  art,
  eager = false,
  detailed = false,
}: {
  art: Artwork;
  eager?: boolean;
  detailed?: boolean;
}) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);
  return (
    <span
      className={`cl-image cl-image--${status}`}
      aria-busy={status === "loading"}
    >
      {status !== "error" && (
        <img
          key={attempt}
          src={art.image}
          alt={detailed ? art.title : ""}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("error")}
        />
      )}
      {status === "loading" && (
        <span className="cl-image__loading" role="status">
          <span className="cl-sr-only">Chargement de l’image</span>
        </span>
      )}
      {status === "error" && (
        <span className="cl-image__error">
          <ImageOff size={24} aria-hidden="true" />
          <span>Image indisponible</span>
          {detailed && (
            <button
              type="button"
              className="cl-button"
              onClick={() => {
                setStatus("loading");
                setAttempt((value) => value + 1);
              }}
            >
              <RotateCcw size={15} aria-hidden="true" />
              Réessayer
            </button>
          )}
        </span>
      )}
    </span>
  );
}
