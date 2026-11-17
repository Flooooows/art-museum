import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Award,
  BookOpen,
  Heart,
  Landmark,
  Search,
  X,
} from "lucide-react";
import { artworks, rarities, typeCatalogs, type Artwork } from "./data";
import {
  duplicateCount,
  uniqueCount,
  type CollectionState,
} from "./collection";
import { ArtworkCard, Button } from "./components";
import { epochs } from "./epochs";
import {
  exploreArtworks,
  facetCounts,
  initialExploration,
  type Exploration,
  type SortOrder,
} from "./exploration";

const batchSize = 24;
const fr = (value: number) => value.toLocaleString("fr-FR");
const typeIds = ["all", ...typeCatalogs.map((c) => c.id)];
const epochIds = ["all", ...epochs.map((e) => e.id)];
const rarityIds = ["all", ...rarities.map((_, level) => String(level))];
const startFilters: Exploration = { ...initialExploration, sort: "rarity" };

export default function Collection({
  state,
  onDetail,
  onFavorite,
  onOpen,
  museum = false,
  searchFocus = false,
  browseAll = false,
}: {
  state: CollectionState;
  onDetail: (art: Artwork) => void;
  onFavorite: (id: string) => void;
  onOpen: () => void;
  museum?: boolean;
  searchFocus?: boolean;
  browseAll?: boolean;
}) {
  const [view, setView] = useState(museum ? "museum" : "inventory");
  const [filters, setFilters] = useState<Exploration>(startFilters);
  const [possession, setPossession] = useState("all");
  const [limit, setLimit] = useState(batchSize);
  const searchRef = useRef<HTMLInputElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setView(museum ? "museum" : browseAll ? "catalogs" : "inventory");
  }, [museum, browseAll]);
  useEffect(() => {
    if (searchFocus) {
      setView("catalogs");
      searchRef.current?.focus();
    }
  }, [searchFocus]);
  useEffect(() => {
    setLimit(batchSize);
  }, [filters, possession, view]);
  const unique = uniqueCount(state);
  const collectionPercent = Math.round((unique / artworks.length) * 100);
  // View and possession depend on the save; search, type, epoch, rarity and sort are shared with the Lab.
  const inView = useMemo(
    () =>
      artworks.filter(
        (art) =>
          (view !== "inventory" || !!state.counts[art.id]) &&
          (view !== "favorites" || state.favorites.includes(art.id)) &&
          (view !== "museum" || state.exhibited.includes(art.id)),
      ),
    [state, view],
  );
  const source = useMemo(
    () =>
      inView.filter((art) => {
        const owned = !!state.counts[art.id];
        return (
          possession === "all" ||
          (possession === "owned" && owned) ||
          (possession === "missing" && !owned) ||
          (possession === "duplicates" && state.counts[art.id] > 1)
        );
      }),
    [inView, state, possession],
  );
  const filtered = useMemo(
    () => exploreArtworks(source, filters),
    [source, filters],
  );
  const counts = useMemo(
    () => ({
      category: facetCounts(source, filters, "category", typeIds),
      epoch: facetCounts(source, filters, "epoch", epochIds),
      rarity: facetCounts(source, filters, "rarity", rarityIds),
    }),
    [source, filters],
  );
  const update = (patch: Partial<Exploration>) =>
    setFilters((value) => ({ ...value, ...patch }));
  const reset = () => {
    setFilters({ ...startFilters, sort: filters.sort });
    setPossession("all");
  };
  const hasFilters =
    filters.query.trim() !== "" ||
    filters.category !== "all" ||
    filters.epoch !== "all" ||
    filters.rarity !== "all" ||
    possession !== "all";
  const visible = filtered.slice(0, limit);
  return (
    <section className="collection-page page-width">
      <div className="collection-intro">
        <div className="collection-portrait">
          <img src="/assets/renaissance-art.jpg" alt="" />
          <span>
            <Award size={15} />
          </span>
        </div>
        <div className="collection-intro-copy">
          <h1>
            {view === "museum"
              ? "Mon Musée Personnel"
              : "Ma Collection & Découvertes"}
          </h1>
          <p>
            {view === "museum"
              ? "Une salle à votre image. Exposez les œuvres qui vous touchent."
              : `${unique} œuvre${unique > 1 ? "s" : ""} découverte${unique > 1 ? "s" : ""}, autant d’histoires à explorer. Votre musée prend vie, carte après carte.`}
          </p>
        </div>
        <div className="collection-stats">
          <div className="completion-stat">
            <span>Votre progression</span>
            <strong>
              {collectionPercent}
              <small> %</small>
            </strong>
            <progress
              value={unique}
              max={artworks.length}
              aria-label="Progression globale de la collection"
            />
          </div>
          <div>
            <strong>{unique}</strong>
            <span>Œuvres</span>
          </div>
          <div>
            <strong className="blue-text">
              {
                artworks.filter(
                  (art) => art.rarity >= 2 && state.counts[art.id],
                ).length
              }
            </strong>
            <span>Rares & +</span>
          </div>
          <div className="duplicates-stat">
            <strong>{duplicateCount(state)}</strong>
            <span>En plus</span>
          </div>
        </div>
      </div>
      <div className="collection-workspace">
        <div className="view-tabs" aria-label="Vues de la collection">
          {[
            { id: "inventory", label: `Inventaire (${unique})` },
            { id: "catalogs", label: "Toutes les œuvres" },
            { id: "favorites", label: "Coups de cœur" },
            { id: "museum", label: "Mon musée" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={view === tab.id ? "active" : ""}
              aria-pressed={view === tab.id}
            >
              {tab.id === "favorites" && <Heart size={12} />}
              {tab.id === "museum" && <Landmark size={12} />}
              {tab.label}
            </button>
          ))}
        </div>
        <label className="search-field">
          <Search size={17} />
          <input
            ref={searchRef}
            type="search"
            placeholder="Œuvre, artiste, mot-clé…"
            aria-label="Rechercher une œuvre, un artiste ou un mot-clé"
            value={filters.query}
            onChange={(event) => update({ query: event.target.value })}
          />
          {filters.query && (
            <button
              type="button"
              className="search-clear"
              aria-label="Effacer la recherche"
              onClick={() => update({ query: "" })}
            >
              <X size={16} />
            </button>
          )}
        </label>
        <nav className="type-pills" aria-label="Types d’œuvres">
          {[{ id: "all", title: "Tout voir" }, ...typeCatalogs].map((type) => (
            <button
              key={type.id}
              type="button"
              aria-pressed={filters.category === type.id}
              disabled={
                counts.category[type.id] === 0 && filters.category !== type.id
              }
              onClick={(event) => {
                update({ category: type.id });
                event.currentTarget.scrollIntoView({
                  block: "nearest",
                  inline: "nearest",
                });
              }}
            >
              {type.title} <span>{fr(counts.category[type.id])}</span>
            </button>
          ))}
        </nav>
        <div className="explore-selects">
          <label>
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
          <label>
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
          <label>
            <span>Possession</span>
            <select
              value={possession}
              onChange={(event) => setPossession(event.target.value)}
            >
              <option value="all">Toutes</option>
              <option value="owned">Possédées</option>
              <option value="missing">Manquantes</option>
              <option value="duplicates">En plusieurs exemplaires</option>
            </select>
          </label>
          <label>
            <span>Trier par</span>
            <select
              value={filters.sort}
              onChange={(event) =>
                update({ sort: event.target.value as SortOrder })
              }
            >
              <option value="rarity">Plus rares d’abord</option>
              <option value="title">Titre (A–Z)</option>
              <option value="artist">Artiste (A–Z)</option>
              <option value="collection">Parcours MUSE</option>
            </select>
          </label>
        </div>
        <div className="results-bar">
          <p role="status" aria-live="polite" aria-atomic="true">
            <strong>{fr(filtered.length)}</strong> œuvre
            {filtered.length > 1 ? "s" : ""}
            {hasFilters ? ` sur ${fr(inView.length)}` : ""}
          </p>
          {hasFilters && (
            <button className="text-link" type="button" onClick={reset}>
              <X size={13} />
              Effacer les filtres
            </button>
          )}
        </div>
        {view === "museum" && (
          <div className="museum-caption">
            <Landmark size={23} />
            <div>
              <h2>Votre salle d’exposition</h2>
              <p>
                Choisissez « Exposer au musée » sur la fiche d’une œuvre
                possédée.
              </p>
            </div>
            <span>
              {state.exhibited.length} œuvre
              {state.exhibited.length > 1 ? "s" : ""} exposée
              {state.exhibited.length > 1 ? "s" : ""}
            </span>
          </div>
        )}
        {filtered.length ? (
          <>
            <div
              ref={grid}
              className={`artwork-grid ${view === "museum" ? "museum-grid" : ""}`}
            >
              {visible.map((art) => (
                <ArtworkCard
                  key={art.id}
                  art={art}
                  count={state.counts[art.id] || 0}
                  missing={!state.counts[art.id]}
                  favorite={state.favorites.includes(art.id)}
                  onOpen={() => onDetail(art)}
                  onFavorite={() => onFavorite(art.id)}
                />
              ))}
            </div>
            <div className="collection-more">
              <p>
                {fr(visible.length)} / {fr(filtered.length)} œuvres
              </p>
              {limit < filtered.length && (
                <Button
                  variant="blue"
                  onClick={() => {
                    const first = limit;
                    setLimit((value) => value + batchSize);
                    requestAnimationFrame(() =>
                      grid.current?.children[first]
                        ?.querySelector<HTMLButtonElement>(".museum-card__open")
                        ?.focus({ preventScroll: true }),
                    );
                  }}
                >
                  Voir {Math.min(batchSize, filtered.length - limit)} œuvres de
                  plus
                  <ArrowDown size={16} />
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="empty-collection">
            {view === "favorites" ? (
              <Heart size={38} />
            ) : view === "museum" ? (
              <Landmark size={38} />
            ) : (
              <BookOpen size={38} />
            )}
            <h2>
              {hasFilters
                ? "Aucune œuvre ne correspond."
                : view === "favorites"
                  ? "Les œuvres qui vous touchent, réunies ici."
                  : view === "museum"
                    ? "Votre musée attend ses premières œuvres."
                    : "Chaque collection commence par une découverte."}
            </h2>
            <p>
              {hasFilters
                ? "Essayez une autre recherche ou effacez vos filtres."
                : view === "museum"
                  ? "Ouvrez une fiche de votre inventaire, puis choisissez « Exposer au musée »."
                  : view === "favorites"
                    ? "Ajoutez un coup de cœur avec le symbole cœur sur une carte."
                    : "Ouvrez votre première pochette gratuite et donnez vie à votre inventaire."}
            </p>
            <Button
              variant="blue"
              onClick={
                hasFilters
                  ? reset
                  : view === "inventory"
                    ? onOpen
                    : () => setView("catalogs")
              }
            >
              {hasFilters
                ? "Effacer les filtres"
                : view === "inventory"
                  ? "Ouvrir ma première pochette"
                  : "Explorer les œuvres"}
              <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </div>
      <div className="collection-closing">
        <Award size={25} />
        <p>« Chaque œuvre découverte ouvre une fenêtre sur le monde. »</p>
        <span>
          Collection invitée · Sauvegarde dans ce navigateur uniquement
        </span>
      </div>
    </section>
  );
}
