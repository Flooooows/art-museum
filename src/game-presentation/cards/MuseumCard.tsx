import { Diamond, Heart } from "lucide-react";
import type { CSSProperties } from "react";
import { type Artwork, getCatalog, rarities } from "../../data";
import { cardFrameFor, commonCardAperture } from "./frames";
import { frameImage, frameWindowImage } from "./frameImages";

export default function MuseumCard({
  art,
  favorite = false,
  onFavorite,
  onOpen,
  missing = false,
  eager = false,
}: {
  art: Artwork;
  favorite?: boolean;
  onFavorite?: () => void;
  onOpen?: () => void;
  missing?: boolean;
  eager?: boolean;
}) {
  const rarity = rarities[art.rarity];
  const frame = cardFrameFor(art),
    a = commonCardAperture;
  const titleSize =
    art.title.length > 80 ? "long" : art.title.length > 40 ? "medium" : "short";
  return (
    <article
      className={`museum-card museum-card--${titleSize}${art.title.length + art.artist.length > 210 ? " museum-card--dense" : ""}${missing ? " museum-card--missing" : ""}`}
      data-artwork-id={art.id}
      data-rarity-level={art.rarity}
      data-frame-key={frame.key}
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
      aria-label={`Carte : ${art.title}`}
    >
      <span
        className="museum-card__velvet"
        aria-hidden="true"
        style={{
          maskImage: `url("${frameWindowImage(frame)}")`,
          WebkitMaskImage: `url("${frameWindowImage(frame)}")`,
        }}
      />
      <div className="museum-card__panel">
        <figure className="museum-card__image">
          <img
            src={art.image}
            alt={art.title}
            loading={eager ? "eager" : "lazy"}
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
          <span
            className="museum-card__rarity"
            title={`${rarity.name} · ${rarity.material}`}
          >
            <Diamond size={14} aria-hidden="true" />
            {rarity.name}
          </span>
          <span
            className="museum-card__number"
            title={`Identifiant complet : ${art.id}`}
          >
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
          {onFavorite && (
            <button
              className="museum-card__favorite"
              type="button"
              onClick={onFavorite}
              aria-label={`${favorite ? "Retirer" : "Ajouter"} ${art.title} ${favorite ? "des" : "aux"} coups de cœur`}
              aria-pressed={favorite}
            >
              <Heart
                size={21}
                fill={favorite ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </button>
          )}
        </footer>
      </div>
      {onOpen && (
        <button
          type="button"
          className="museum-card__open"
          onClick={onOpen}
          aria-label={`Voir les détails de ${art.title}`}
        />
      )}
      <img
        className="museum-card__frame"
        src={frameImage(frame)}
        alt=""
        aria-hidden="true"
      />
    </article>
  );
}
