import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type CSSProperties,
} from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Diamond,
  Heart,
  Landmark,
  LockKeyhole,
  Sparkles,
  X,
} from "lucide-react";
import {
  type Artwork,
  type Catalog,
  catalogs,
  getCatalog,
  museumName,
  rarities,
  ratesForCatalog,
} from "./data";
import FramedArtwork from "./FramedArtwork";
import { CARDS_PER_PACK } from "./packRules";

export function Brand({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand ${small ? "brand-small" : ""}`}>
      <Landmark aria-hidden="true" />
      <span>MUSE</span>
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "blue" | "gold" | "ghost";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`button button-${variant} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function Rarity({
  level,
  plain = false,
}: {
  level: number;
  plain?: boolean;
}) {
  const rarity = rarities[level];
  return (
    <span
      className={`rarity ${plain ? "rarity-plain" : ""}`}
      data-rarity-level={level}
      title={`${rarity.name} · ${rarity.material}`}
      style={
        {
          "--rarity": rarity.color,
          "--rarity-ink": rarity.ink,
          "--rarity-dark-ink": rarity.darkInk,
          "--rarity-on-color": rarity.badgeInk,
        } as CSSProperties
      }
    >
      <Diamond size={11} aria-hidden="true" />
      {rarity.name}
    </span>
  );
}

export function Rates({
  light = false,
  catalog = "all",
}: {
  light?: boolean;
  catalog?: string;
}) {
  const rates = ratesForCatalog(catalog);
  return (
    <div className={`rates ${light ? "rates-light" : ""}`}>
      <h3>Probabilités par carte</h3>
      {rarities.map((rarity, index) => (
        <div className="rate" key={rarity.name}>
          <div>
            <span>
              {rarity.name} · {rarity.material}
            </span>
            <span>
              {rates[index].toLocaleString("fr-FR", {
                maximumFractionDigits: 2,
              })}{" "}
              %
            </span>
          </div>
          <div className="rate-track">
            <span
              style={{
                width: `${rates[index]}%`,
                background: rarity.color,
              }}
            />
          </div>
        </div>
      ))}
      <p>
        Taux provisoires, identiques pour tous. {CARDS_PER_PACK} tirages
        indépendants, sans rareté minimale garantie. Un niveau absent de ce
        catalogue a un taux de 0 %.
      </p>
    </div>
  );
}

export function Pack({
  catalog,
  featured = false,
  className = "",
}: {
  catalog?: Catalog;
  featured?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`pack ${featured ? "pack-featured" : ""} ${className}`}
      style={{ "--pack-color": catalog?.color || "#230711" } as CSSProperties}
    >
      <img
        className="pack-texture"
        src={`/assets/${catalog?.texture || "hero-texture"}.jpg`}
        alt=""
      />
      <div className="pack-inner">
        <div className="pack-top">
          <span>
            MUSE ·{" "}
            {catalog
              ? `VOL. ${catalogs.indexOf(catalog) + 1}`
              : "COLLECTION PRIVÉE"}
          </span>
          <BadgeCheck size={13} />
        </div>
        <div className="pack-center">
          <img src={`/assets/${catalog?.image || "hero-art"}.jpg`} alt="" />
          <span className="pack-name">
            {featured ? "MUSE" : catalog?.title}
          </span>
          <span className="pack-subtitle">
            {catalog?.subtitle || "ÉCHO DE SILENCE"}
          </span>
        </div>
        <div className="pack-bottom">
          <span>{CARDS_PER_PACK} CARTES À DÉCOUVRIR</span>
          <span>ÉDITION I</span>
        </div>
      </div>
    </div>
  );
}

export function ArtworkCard({
  art,
  count = 0,
  favorite = false,
  missing = false,
  onOpen,
  onFavorite,
}: {
  art: Artwork;
  count?: number;
  favorite?: boolean;
  missing?: boolean;
  onOpen: () => void;
  onFavorite?: () => void;
}) {
  return (
    <article
      className={`artwork-card ${missing ? "artwork-missing" : ""}`}
      style={{ "--rarity": rarities[art.rarity].color } as CSSProperties}
    >
      <button className="artwork-open" onClick={onOpen}>
        <div className="artwork-mat">
          <div className="artwork-card-top">
            <Rarity level={art.rarity} />
            <span>
              {missing ? <LockKeyhole size={13} /> : `N° ${artworksIndex(art)}`}
            </span>
          </div>
          <FramedArtwork art={art} missing={missing} />
          <div className="artwork-index">
            <span>MUSE</span>
            <span>
              {missing
                ? "À DÉCOUVRIR"
                : `${count} EXEMPLAIRE${count > 1 ? "S" : ""}`}
            </span>
          </div>
        </div>
        <h3>{art.title}</h3>
        <p className="artist-name">{art.artist}</p>
      </button>
      <div className="artwork-card-foot">
        <span>{getCatalog(art.catalog)?.family}</span>
        {onFavorite && (
          <button
            className={`icon-button favorite-button ${favorite ? "is-favorite" : ""}`}
            onClick={onFavorite}
            aria-label={`${favorite ? "Retirer" : "Ajouter"} ${art.title} ${favorite ? "des" : "aux"} coups de cœur`}
            aria-pressed={favorite}
          >
            <Heart size={16} fill={favorite ? "currentColor" : "none"} />
          </button>
        )}
      </div>
    </article>
  );
}

function artworksIndex(art: Artwork) {
  return art.id === "mona-lisa" ? "001" : art.id.slice(-3);
}

let openModalCount = 0;
let previousBodyOverflow = "";

export function Modal({
  title,
  children,
  onClose,
  className = "",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.showModal();
    if (openModalCount === 0)
      previousBodyOverflow = document.body.style.overflow;
    openModalCount += 1;
    document.body.style.overflow = "hidden";
    return () => {
      openModalCount -= 1;
      if (openModalCount === 0)
        document.body.style.overflow = previousBodyOverflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={`modal ${className}`}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-heading">
        <h2 id={titleId}>{title}</h2>
        <button className="icon-button" aria-label="Fermer" onClick={onClose}>
          <X size={22} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function ArtworkDetail({
  art,
  count,
  favorite,
  exhibited,
  onFavorite,
  onExhibit,
  onClose,
}: {
  art: Artwork;
  count: number;
  favorite: boolean;
  exhibited: boolean;
  onFavorite: () => void;
  onExhibit: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title="Dans le détail" className="detail-modal" onClose={onClose}>
      <div className="detail-grid">
        <div className="detail-reproduction">
          <FramedArtwork art={art} eager />
          <span>Reproduction entière · {art.imageCredit}</span>
        </div>
        <div className="detail-content">
          <Rarity level={art.rarity} />
          <h2>{art.title}</h2>
          <p className="detail-artist">{art.artist}</p>
          <p className="anecdote">
            <Sparkles size={19} />
            {art.anecdote}
          </p>
          <h3>Une œuvre, une histoire</h3>
          <p>{art.story}</p>
          <dl>
            <div>
              <dt>Époque</dt>
              <dd>{art.date}</dd>
            </div>
            <div>
              <dt>Matériaux</dt>
              <dd>{art.material}</dd>
            </div>
            <div>
              <dt>Création ou provenance</dt>
              <dd>{art.origin}</dd>
            </div>
            <div>
              <dt>Conservation</dt>
              <dd>{museumName(art)}</dd>
            </div>
            <div>
              <dt>Dans votre inventaire</dt>
              <dd>
                {count
                  ? `${count} exemplaire${count > 1 ? "s" : ""}`
                  : "Pas encore découverte"}
              </dd>
            </div>
          </dl>
          <a
            className="source-link"
            href={art.source}
            target="_blank"
            rel="noreferrer"
          >
            <BookOpen size={15} />
            Consulter la notice du musée <ArrowRight size={15} />
          </a>
          <div className="detail-actions">
            <Button onClick={onFavorite} variant="ghost">
              <Heart size={16} fill={favorite ? "currentColor" : "none"} />
              {favorite ? "Coup de cœur" : "Garder en coup de cœur"}
            </Button>
            <Button onClick={onExhibit} disabled={!count}>
              <Landmark size={16} />
              {exhibited ? "Retirer du musée" : "Exposer au musée"}
            </Button>
          </div>
          <p className="fine-print">
            {art.publicationStatus === "demo"
              ? "Rareté de démonstration : elle ne mesure ni la qualité artistique ni la valeur marchande. Classement éditorial à valider."
              : "La rareté reflète une évaluation éditoriale de notoriété, ni la qualité artistique ni la valeur marchande."}
          </p>
        </div>
      </div>
    </Modal>
  );
}
