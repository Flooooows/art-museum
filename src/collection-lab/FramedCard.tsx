import { useLayoutEffect, useRef, type CSSProperties, type Ref } from "react";
import { Diamond } from "lucide-react";
import { type Artwork, getCatalog, rarities } from "../data";
import { cardFrameFor, commonCardAperture } from "../card-lab/frames";
import { frameImage, frameWindowImage } from "../card-lab/frameImages";

/**
 * Read-only framed card for the Collection Lab: same layout as the game's compact
 * card, drawn at 320 px and scaled to its column, with the lab's current frames.
 */
export default function FramedCard({
  art,
  eager = false,
  onOpen,
  openRef,
}: {
  art: Artwork;
  eager?: boolean;
  onOpen: () => void;
  openRef?: Ref<HTMLButtonElement>;
}) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const resize = () => {
      const width = element.clientWidth;
      if (!width) return;
      element.style.setProperty("--compact-scale", String(width / 320));
      element.style.setProperty("--compact-inverse-scale", String(320 / width));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const rarity = rarities[art.rarity];
  const frame = cardFrameFor(art);
  const a = frame.asset
    ? commonCardAperture
    : { left: 4, top: 4, width: 92, height: 92 };
  const titleSize =
    art.title.length > 80 ? "long" : art.title.length > 40 ? "medium" : "short";
  const mask = frame.asset ? `url("${frameWindowImage(frame.asset)}")` : undefined;
  return (
    <div className="compact-card" ref={root}>
      <div className="compact-card__surface">
        <article
          className={`museum-card museum-card--${titleSize}${!frame.asset ? " museum-card--unframed" : ""}${art.title.length + art.artist.length > 210 ? " museum-card--dense" : ""}`}
          data-artwork-id={art.id}
          data-frame-family={frame.family}
          style={
            {
              "--card-panel-left": `${a.left}%`,
              "--card-panel-top": `${a.top}%`,
              "--card-panel-width": `${a.width}%`,
              "--card-panel-height": `${a.height}%`,
              "--card-accent": rarity.darkInk,
              "--card-rarity-surface": rarity.color,
              "--card-rarity-ink": rarity.badgeInk,
            } as CSSProperties
          }
        >
          <span
            className="museum-card__velvet"
            aria-hidden="true"
            style={{ maskImage: mask, WebkitMaskImage: mask }}
          />
          <div className="museum-card__panel">
            <figure className="museum-card__image">
              <img
                src={art.image}
                alt=""
                loading={eager ? "eager" : "lazy"}
                decoding="async"
              />
            </figure>
            <div className="museum-card__caption">
              <h2>{art.title}</h2>
              <p
                className={
                  art.artist.length > 90
                    ? "museum-card__artist museum-card__artist--long"
                    : "museum-card__artist"
                }
              >
                {art.artist}
              </p>
            </div>
            <div className="museum-card__rarity-line">
              <span className="museum-card__rarity">
                <Diamond size={14} aria-hidden="true" />
                {rarity.name}
              </span>
              <span className="museum-card__number">
                N° {art.id === "mona-lisa" ? "001" : art.id.slice(-3)}
              </span>
            </div>
            <footer className="museum-card__footer">
              <div className="museum-card__identity">
                <span className="museum-card__brand" aria-hidden="true">
                  MUSE
                </span>
                <span className="museum-card__category">
                  {getCatalog(art.catalog)?.title}
                </span>
              </div>
            </footer>
          </div>
          <button
            ref={openRef}
            type="button"
            className="museum-card__open"
            onClick={onOpen}
            aria-label={`Découvrir ${art.title} — ${art.artist}, ${rarity.name}`}
          />
          {frame.asset && (
            <img
              className="museum-card__frame"
              src={frameImage(frame.asset)}
              alt=""
              aria-hidden="true"
            />
          )}
        </article>
      </div>
    </div>
  );
}
