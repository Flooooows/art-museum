import { useMemo, useRef, useState } from "react";
import { ArrowDown, Search, X } from "lucide-react";
import {
  artworks,
  rarities,
  typeCatalogs,
} from "../data";
import LabNavigation from "../muse-lab/LabNavigation";
import {
  exploreArtworks,
  facetCounts,
  initialExploration,
  type Exploration,
  type SortOrder,
} from "../exploration";
import FramedCard from "./FramedCard";
import { epochs } from "../epochs";
import ArtworkViewer from "./ArtworkViewer";

const batchSize = 24;
const fr = (value: number) => value.toLocaleString("fr-FR");
const typeIds = ["all", ...typeCatalogs.map((c) => c.id)];
const epochIds = ["all", ...epochs.map((e) => e.id)];
const rarityIds = ["all", ...rarities.map((_, level) => String(level))];

export default function CollectionLab() {
  const [filters, setFilters] = useState<Exploration>(initialExploration);
  const [limit, setLimit] = useState(batchSize);
  const [viewed, setViewed] = useState<number | null>(null);
  const firstNewCard = useRef<HTMLButtonElement>(null);
  const results = useMemo(() => exploreArtworks(artworks, filters), [filters]);
  const counts = useMemo(
    () => ({
      category: facetCounts(artworks, filters, "category", typeIds),
      epoch: facetCounts(artworks, filters, "epoch", epochIds),
      rarity: facetCounts(artworks, filters, "rarity", rarityIds),
    }),
    [filters],
  );
  const visible = results.slice(0, limit);
  const filtered =
    filters.query.trim() !== "" ||
    filters.category !== "all" ||
    filters.epoch !== "all" ||
    filters.rarity !== "all";
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
              MUSE Lab
            </p>
            <h1>
              La Collection<span className="cl-title-dot">.</span>
            </h1>
          </div>
          <p className="cl-heading__aside">
            {fr(artworks.length)} œuvres. Cherchez un titre ou un artiste, ou
            parcourez par type, époque et rareté.
          </p>
        </header>
        <section className="cl-exploration" aria-label="Explorer la collection">
          <label className="cl-search">
            <Search size={19} aria-hidden="true" />
            <span className="cl-sr-only">
              Rechercher une œuvre, un artiste ou un mot-clé
            </span>
            <input
              type="search"
              placeholder="Œuvre, artiste, mot-clé…"
              value={filters.query}
              onChange={(event) => update({ query: event.target.value })}
            />
            {filters.query && (
              <button
                type="button"
                className="cl-search__clear"
                aria-label="Effacer la recherche"
                onClick={() => update({ query: "" })}
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </label>
          <nav className="cl-categories" aria-label="Types d’œuvres">
            {[{ id: "all", title: "Tout voir" }, ...typeCatalogs].map(
              (category) => (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={filters.category === category.id}
                  disabled={
                    counts.category[category.id] === 0 &&
                    filters.category !== category.id
                  }
                  onClick={(event) => {
                    update({ category: category.id });
                    event.currentTarget.scrollIntoView({
                      block: "nearest",
                      inline: "nearest",
                    });
                  }}
                >
                  {category.title}{" "}
                  <span className="cl-count">
                    {fr(counts.category[category.id])}
                  </span>
                </button>
              ),
            )}
          </nav>
          <div className="cl-refine">
            <label className="cl-select">
              <span>Époque</span>
              <select
                value={filters.epoch}
                onChange={(event) => update({ epoch: event.target.value })}
              >
                <option value="all">Toutes ({fr(counts.epoch.all)})</option>
                {epochs.map((epoch) => (
                  <option key={epoch.id} value={epoch.id}>
                    {epoch.title} ({fr(counts.epoch[epoch.id])})
                  </option>
                ))}
              </select>
            </label>
            <label className="cl-select">
              <span>Rareté</span>
              <select
                value={filters.rarity}
                onChange={(event) => update({ rarity: event.target.value })}
              >
                <option value="all">Toutes ({fr(counts.rarity.all)})</option>
                {rarities.map((rarity, level) => (
                  <option key={level} value={level}>
                    {rarity.name} ({fr(counts.rarity[String(level)])})
                  </option>
                ))}
              </select>
            </label>
            <label className="cl-select">
              <span>Trier par</span>
              <select
                value={filters.sort}
                onChange={(event) =>
                  update({ sort: event.target.value as SortOrder })
                }
              >
                <option value="collection">Parcours MUSE</option>
                <option value="title">Titre (A–Z)</option>
                <option value="artist">Artiste (A–Z)</option>
                <option value="rarity">Plus rares d’abord</option>
              </select>
            </label>
          </div>
        </section>
        <div className="cl-results-bar">
          <p role="status" aria-live="polite" aria-atomic="true">
            <strong>{fr(results.length)}</strong> œuvre
            {results.length > 1 ? "s" : ""}
            {filtered ? ` sur ${fr(artworks.length)}` : ""}
          </p>
          {filtered && (
            <button className="cl-text-button" type="button" onClick={reset}>
              Effacer les filtres
            </button>
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
                  <FramedCard
                    key={art.id}
                    art={art}
                    eager={index < 8}
                    openRef={
                      index === limit - batchSize ? firstNewCard : undefined
                    }
                    onOpen={() => setViewed(index)}
                  />
                ))}
              </div>
              <div className="cl-gallery-end">
                <p>
                  {fr(visible.length)} / {fr(results.length)} œuvres
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
              <h2>Aucune œuvre trouvée</h2>
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
