import { useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { artworks, getCatalog, rarities, typeCatalogs } from "../data";
import LabNavigation from "../muse-lab/LabNavigation";
import {
  exploreArtworks,
  initialExploration,
  type Exploration,
  type SortOrder,
} from "./exploration";
import ArtworkImage from "./ArtworkImage";
import ArtworkViewer from "./ArtworkViewer";
import FilterPanel from "./FilterPanel";

const batchSize = 24;

export default function CollectionLab() {
  const [filters, setFilters] = useState<Exploration>(initialExploration);
  const [limit, setLimit] = useState(batchSize);
  const [showFilters, setShowFilters] = useState(false);
  const [viewed, setViewed] = useState<number | null>(null);
  const firstNewCard = useRef<HTMLButtonElement>(null);
  const results = useMemo(() => exploreArtworks(artworks, filters), [filters]);
  const visible = results.slice(0, limit);
  const advancedCount =
    Number(filters.theme !== "all") + Number(filters.rarity !== "all");
  const chips = [
    ...(filters.query.trim()
      ? [
          {
            key: "query" as const,
            label: `« ${filters.query.trim()} »`,
            reset: "",
          },
        ]
      : []),
    ...(filters.category !== "all"
      ? [
          {
            key: "category" as const,
            label: getCatalog(filters.category)!.title,
            reset: "all",
          },
        ]
      : []),
    ...(filters.theme !== "all"
      ? [
          {
            key: "theme" as const,
            label: getCatalog(filters.theme)!.title,
            reset: "all",
          },
        ]
      : []),
    ...(filters.rarity !== "all"
      ? [
          {
            key: "rarity" as const,
            label: rarities[Number(filters.rarity)].name,
            reset: "all",
          },
        ]
      : []),
  ];
  const update = (patch: Partial<Exploration>) => {
    setFilters((value) => ({ ...value, ...patch }));
    setLimit(batchSize);
  };
  const reset = () => {
    setFilters({ ...initialExploration, sort: filters.sort });
    setLimit(batchSize);
  };
  return (
    <div className="collection-lab">
      <a className="cl-skip" href="#cl-gallery">
        Aller aux œuvres
      </a>
      <LabNavigation current="collection" />
      <main className="cl-main">
        <header className="cl-heading">
          <div>
            <p className="cl-eyebrow">
              <span className="cl-edition-mark" />
              Le plaisir de regarder · MUSE Lab
            </p>
            <h1>
              La Collection<span className="cl-title-dot">.</span>
            </h1>
          </div>
          <div className="cl-heading__aside">
            <p>
              Des œuvres, des époques, des regards. <br />
              Entrez par ce qui vous attire.
            </p>
            <span>
              {artworks.length.toLocaleString("fr-FR")} œuvres à explorer
            </span>
          </div>
        </header>
        <section className="cl-exploration" aria-label="Explorer la collection">
          <div className="cl-controls">
            <label className="cl-search">
              <Search size={19} aria-hidden="true" />
              <span className="cl-sr-only">
                Rechercher une œuvre, un artiste ou un mot-clé
              </span>
              <input
                type="search"
                placeholder="Une œuvre, un artiste, un mot-clé…"
                value={filters.query}
                onChange={(event) => update({ query: event.target.value })}
              />
            </label>
            <div className="cl-controls__actions">
              <button
                className={`cl-button ${advancedCount ? "cl-button--active" : ""}`}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={showFilters}
                onClick={() => setShowFilters(true)}
              >
                <SlidersHorizontal size={16} aria-hidden="true" />
                Filtres
                {advancedCount > 0 && (
                  <span className="cl-filter-count">{advancedCount}</span>
                )}
              </button>
              <label className="cl-sort">
                <span>Trier par</span>
                <select
                  aria-label="Trier les œuvres"
                  value={filters.sort}
                  onChange={(event) =>
                    update({ sort: event.target.value as SortOrder })
                  }
                >
                  <option value="collection">Parcours MUSE</option>
                  <option value="title">Titre · A–Z</option>
                  <option value="artist">Artiste · A–Z</option>
                  <option value="rarity">Rareté décroissante</option>
                </select>
              </label>
            </div>
          </div>
          <nav className="cl-categories" aria-label="Types d’œuvres">
            {[{ id: "all", title: "Tout voir" }, ...typeCatalogs].map(
              (category) => (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={filters.category === category.id}
                  onClick={(event) => {
                    update({ category: category.id });
                    event.currentTarget.scrollIntoView({
                      block: "nearest",
                      inline: "nearest",
                    });
                  }}
                >
                  {category.title}
                </button>
              ),
            )}
          </nav>
        </section>
        <div className="cl-results-bar">
          <p role="status" aria-live="polite" aria-atomic="true">
            {results.length.toLocaleString("fr-FR")} œuvre
            {results.length > 1 ? "s" : ""}
            {chips.length > 0
              ? ` sur ${artworks.length.toLocaleString("fr-FR")}`
              : " · À votre regard"}
          </p>
          {chips.length > 0 && (
            <div className="cl-active-filters" aria-label="Filtres actifs">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  className="cl-chip"
                  type="button"
                  aria-label={`Retirer le filtre ${chip.label}`}
                  onClick={() => update({ [chip.key]: chip.reset })}
                >
                  {chip.label}
                  <X size={13} aria-hidden="true" />
                </button>
              ))}
              <button className="cl-text-button" type="button" onClick={reset}>
                Tout effacer
              </button>
            </div>
          )}
        </div>
        <section
          id="cl-gallery"
          className="cl-gallery-region"
          tabIndex={-1}
          aria-label="Galerie des œuvres"
        >
          {results.length > 0 ? (
            <>
              <div className="cl-gallery">
                {visible.map((art, index) => (
                  <article className="cl-artwork" key={art.id}>
                    <button
                      type="button"
                      ref={
                        index === limit - batchSize ? firstNewCard : undefined
                      }
                      aria-label={`Découvrir ${art.title} — ${art.artist}`}
                      onClick={() => setViewed(index)}
                    >
                      <span className="cl-artwork__visual">
                        <ArtworkImage art={art} eager={index < 4} />
                        <span className="cl-artwork__open" aria-hidden="true">
                          <ArrowUpRight size={20} />
                        </span>
                      </span>
                      <span className="cl-artwork__caption">
                        <span className="cl-artwork__category">
                          {getCatalog(art.catalog)?.title}
                        </span>
                        <span className="cl-artwork__title">{art.title}</span>
                        <span className="cl-artwork__artist">{art.artist}</span>
                      </span>
                    </button>
                  </article>
                ))}
              </div>
              <div className="cl-gallery-end">
                <p>
                  {visible.length.toLocaleString("fr-FR")} /{" "}
                  {results.length.toLocaleString("fr-FR")} œuvres
                </p>
                {limit < results.length ? (
                  <button
                    type="button"
                    className="cl-button"
                    onClick={() => {
                      setLimit((value) => value + batchSize);
                      requestAnimationFrame(() =>
                        firstNewCard.current?.focus({ preventScroll: true }),
                      );
                    }}
                  >
                    Voir {Math.min(batchSize, results.length - limit)} œuvres de
                    plus
                    <ArrowDown size={16} aria-hidden="true" />
                  </button>
                ) : (
                  <p>Vous avez parcouru cette sélection.</p>
                )}
              </div>
            </>
          ) : (
            <div className="cl-empty">
              <Search size={28} strokeWidth={1} aria-hidden="true" />
              <h2>Un autre regard ?</h2>
              <p>
                Aucune œuvre ne correspond à cette recherche.
                <br />
                Essayez un autre mot-clé ou retirez un filtre.
              </p>
              <button
                className="cl-button cl-button--primary"
                type="button"
                onClick={reset}
              >
                Retrouver toutes les œuvres
              </button>
            </div>
          )}
        </section>
        <footer className="cl-footer">
          <span>
            MUSE <span className="cl-footer__serif">/</span> L’art, à votre
            rythme.
          </span>
          <p>
            Collection expérimentale · Lecture seule
            <br />
            Aucune acquisition ni sauvegarde du jeu utilisée.
          </p>
        </footer>
      </main>
      {showFilters && (
        <FilterPanel
          filters={filters}
          onClose={() => setShowFilters(false)}
          onApply={(next) => {
            update(next);
            setShowFilters(false);
          }}
        />
      )}
      {viewed !== null && (
        <ArtworkViewer
          items={results}
          index={viewed}
          onNavigate={setViewed}
          onClose={() => setViewed(null)}
        />
      )}
    </div>
  );
}
