import { useRef } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { getCatalog, museumName, rarities, type Artwork } from "../data";
import Modal from "./Modal";
import ArtworkImage from "./ArtworkImage";

export default function ArtworkViewer({
  items,
  index,
  onNavigate,
  onClose,
}: {
  items: Artwork[];
  index: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}) {
  const art = items[index];
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = (next: number) => {
    if (next < 0 || next >= items.length) return;
    onNavigate(next);
    scrollRef.current?.scrollTo({ top: 0 });
  };
  return (
    <Modal className="cl-viewer" labelledBy="cl-art-title" onClose={onClose}>
      <div
        className="cl-viewer__inner"
        onKeyDown={(event) => {
          if (
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.target instanceof HTMLInputElement
          )
            return;
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            navigate(index - 1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            navigate(index + 1);
          }
        }}
      >
        <header className="cl-viewer__toolbar">
          <button
            type="button"
            className="cl-button cl-viewer__back"
            onClick={onClose}
            autoFocus
          >
            <X size={18} aria-hidden="true" />
            <span>Retour à la galerie</span>
          </button>
          <div className="cl-viewer__navigation">
            <span aria-live="polite" aria-atomic="true">
              {index + 1} / {items.length.toLocaleString("fr-FR")}
              <span className="cl-sr-only"> — {art.title}</span>
            </span>
            <button
              type="button"
              className="cl-icon-button"
              aria-label="Œuvre précédente"
              disabled={index === 0}
              onClick={() => navigate(index - 1)}
            >
              <ArrowLeft size={19} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="cl-icon-button"
              aria-label="Œuvre suivante"
              disabled={index === items.length - 1}
              onClick={() => navigate(index + 1)}
            >
              <ArrowRight size={19} aria-hidden="true" />
            </button>
          </div>
        </header>
        <div className="cl-viewer__content" ref={scrollRef}>
          <figure className="cl-viewer__figure">
            <ArtworkImage key={art.id} art={art} eager detailed />
            <figcaption>Reproduction entière · {art.imageCredit}</figcaption>
          </figure>
          <section className="cl-viewer__details" key={art.id}>
            <p className="cl-eyebrow">{getCatalog(art.catalog)?.title}</p>
            <h2 id="cl-art-title">{art.title}</h2>
            <p className="cl-viewer__artist">{art.artist}</p>
            <p className="cl-viewer__date">{art.date}</p>
            {art.anecdote && <p className="cl-viewer__intro">{art.anecdote}</p>}
            <dl className="cl-facts">
              <div>
                <dt>Technique & matière</dt>
                <dd>{art.material || "Non renseignée"}</dd>
              </div>
              <div>
                <dt>Conservation</dt>
                <dd>{museumName(art)}</dd>
              </div>
              {art.origin && (
                <div>
                  <dt>Origine</dt>
                  <dd>{art.origin}</dd>
                </div>
              )}
            </dl>
            {art.story && (
              <details className="cl-disclosure">
                <summary>L’histoire de l’œuvre</summary>
                <p>{art.story}</p>
              </details>
            )}
            <details className="cl-disclosure">
              <summary>Notice & crédits</summary>
              <dl className="cl-facts">
                <div>
                  <dt>Identifiant MUSE</dt>
                  <dd>{art.id}</dd>
                </div>
                {art.inventoryNumber && (
                  <div>
                    <dt>Inventaire</dt>
                    <dd>{art.inventoryNumber}</dd>
                  </div>
                )}
                <div>
                  <dt>Rareté MUSE</dt>
                  <dd>{rarities[art.rarity].name}</dd>
                </div>
                <div>
                  <dt>Catalogues</dt>
                  <dd>
                    {art.catalogIds
                      .map((id) => getCatalog(id)?.title)
                      .filter(Boolean)
                      .join(" · ")}
                  </dd>
                </div>
                <div>
                  <dt>Crédit image</dt>
                  <dd>{art.imageCredit}</dd>
                </div>
              </dl>
              {art.institutionalNote && <p>{art.institutionalNote}</p>}
              <p>
                <a href={art.source} target="_blank" rel="noreferrer">
                  Notice de l’institution{" "}
                  <ArrowUpRight size={14} aria-hidden="true" />
                  <span className="cl-sr-only"> (nouvel onglet)</span>
                </a>
              </p>
              {art.reuseUrl && (
                <p>
                  <a href={art.reuseUrl} target="_blank" rel="noreferrer">
                    {art.reuseLabel || "Conditions de réutilisation"}
                    <span className="cl-sr-only"> (nouvel onglet)</span>
                  </a>
                </p>
              )}
              {art.reuseObligations?.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </details>
          </section>
        </div>
      </div>
    </Modal>
  );
}
