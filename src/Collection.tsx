import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Heart,
  Landmark,
  Layers,
  PackageOpen,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  artworks,
  catalogs,
  rarities,
  families,
  artworkInCatalog,
  catalogSize,
  type Artwork,
} from "./data";
import {
  catalogProgress,
  duplicateCount,
  uniqueCount,
  type CollectionState,
} from "./collection";
import { ArtworkCard, Button } from "./components";

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
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState("all");
  const [catalog, setCatalog] = useState("all");
  const [family, setFamily] = useState("all");
  const [possession, setPossession] = useState("all");
  const [sort, setSort] = useState("rarity");
  const [page, setPage] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);
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
    setPage(1);
  }, [query, rarity, catalog, family, possession, view, sort]);
  const unique = uniqueCount(state);
  const collectionPercent = Math.round((unique / artworks.length) * 100);
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("fr");
  const filtered = artworks
    .filter((art) => {
      const owned = !!state.counts[art.id];
      return (
        (view !== "inventory" || owned) &&
        (view !== "favorites" || state.favorites.includes(art.id)) &&
        (view !== "museum" || state.exhibited.includes(art.id)) &&
        (rarity === "all" || art.rarity === Number(rarity)) &&
        artworkInCatalog(art, catalog) &&
        (family === "all" || art.familyId === family) &&
        (possession === "all" ||
          (possession === "owned" && owned) ||
          (possession === "missing" && !owned) ||
          (possession === "duplicates" && state.counts[art.id] > 1)) &&
        normalize(`${art.title} ${art.artist} ${art.date}`).includes(
          normalize(query.trim()),
        )
      );
    })
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title, "fr")
        : sort === "artist"
          ? a.artist.localeCompare(b.artist, "fr")
          : b.rarity - a.rarity,
    );
  const pageCount = Math.max(1, Math.ceil(filtered.length / 6));
  const currentPage = Math.min(page, pageCount);
  const reset = () => {
    setQuery("");
    setRarity("all");
    setCatalog("all");
    setFamily("all");
    setPossession("all");
  };
  const hasFilters =
    query ||
    rarity !== "all" ||
    catalog !== "all" ||
    family !== "all" ||
    possession !== "all";
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
      <div className="collection-layout">
        <aside className="collection-sidebar">
          <section className="sidebar-panel">
            <h2>
              <BookOpen size={17} />
              Mes séries & complétion<span>{catalogs.length}</span>
            </h2>
            <button
              className={`sidebar-all ${catalog === "all" ? "selected" : ""}`}
              onClick={() => setCatalog("all")}
            >
              Tous les catalogues
              <ArrowRight size={13} />
            </button>
            {catalogs.map((cat) => (
              <button
                className={`sidebar-catalog ${catalog === cat.id ? "selected" : ""}`}
                key={cat.id}
                onClick={() => {
                  setCatalog(cat.id);
                  setFamily("all");
                }}
              >
                <img src={`/assets/${cat.image}.jpg`} alt="" />
                <div>
                  <div>
                    <strong>{cat.title}</strong>
                    <span>
                      {catalogProgress(state, cat.id)}/{catalogSize(cat.id)}
                    </span>
                  </div>
                  <progress
                    max={catalogSize(cat.id)}
                    value={catalogProgress(state, cat.id)}
                    aria-label={cat.title}
                  />
                </div>
              </button>
            ))}
          </section>
          <section className="sidebar-panel family-panel">
            <h2>
              <Layers size={17} />
              Les familles
            </h2>
            <label className={family === "all" ? "selected" : ""}>
              <input
                type="radio"
                name="family"
                checked={family === "all"}
                onChange={() => setFamily("all")}
              />
              Toutes les familles
            </label>
            {families.map((item) => (
              <label
                key={item.id}
                className={family === item.id ? "selected" : ""}
              >
                <input
                  type="radio"
                  name="family"
                  checked={family === item.id}
                  onChange={() => {
                    setFamily(item.id);
                    setCatalog("all");
                  }}
                />
                {item.name}
              </label>
            ))}
          </section>
          <section className="sidebar-panel recent-panel">
            <h2>
              <PackageOpen size={17} />
              Dernière découverte
            </h2>
            {state.latest ? (
              <>
                <p>
                  {state.latest.catalog === "all"
                    ? "Écho de Silence"
                    : catalogs.find((cat) => cat.id === state.latest?.catalog)
                        ?.title}
                </p>
                <span>
                  {new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "medium",
                  }).format(state.latest.date)}{" "}
                  · {state.latest.cards.length} cartes
                </span>
                <div className="recent-thumbs">
                  {state.latest.cards.map((card, index) => (
                    <img
                      key={index}
                      src={artworks.find((art) => art.id === card.id)?.image}
                      alt=""
                    />
                  ))}
                </div>
              </>
            ) : (
              <p>Votre première découverte vous attend.</p>
            )}
            <button className="text-link" onClick={onOpen}>
              <PackageOpen size={13} />
              Ouvrir une pochette
              <ArrowRight size={13} />
            </button>
          </section>
          <section className="sidebar-panel badges-panel">
            <h2>
              <Award size={17} />
              Insignes de collection
            </h2>
            <div>
              {[25, 50, 75, 100].map((value) => (
                <span
                  key={value}
                  className={collectionPercent >= value ? "unlocked" : ""}
                  title={`${value} % de la collection ${collectionPercent >= value ? "atteints" : "à atteindre"}`}
                >
                  <Award size={23} />
                  <small>{value} %</small>
                </span>
              ))}
            </div>
          </section>
        </aside>
        <div className="collection-workspace">
          <div className="collection-toolbar">
            <div className="view-tabs" aria-label="Vues de la collection">
              {[
                { id: "inventory", label: `Inventaire (${unique})` },
                { id: "catalogs", label: "Tous les catalogues" },
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
            <label className="sort-control">
              Trier par
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="rarity">Rareté décroissante</option>
                <option value="title">Titre de l’œuvre</option>
                <option value="artist">Artiste / civilisation</option>
              </select>
            </label>
          </div>
          <div className="search-filters">
            <label className="search-field">
              <Search size={17} />
              <input
                ref={searchRef}
                type="search"
                placeholder="Rechercher une œuvre, un artiste…"
                aria-label="Rechercher une œuvre ou un artiste"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label className="possession-filter">
              <SlidersHorizontal size={15} />
              <span className="sr-only">Possession</span>
              <select
                value={possession}
                onChange={(event) => setPossession(event.target.value)}
              >
                <option value="all">Toutes les possessions</option>
                <option value="owned">Œuvres possédées</option>
                <option value="missing">Œuvres manquantes</option>
                <option value="duplicates">Exemplaires supplémentaires</option>
              </select>
            </label>
          </div>
          <div className="rarity-filters" aria-label="Filtrer par rareté">
            <button
              className={rarity === "all" ? "active" : ""}
              onClick={() => setRarity("all")}
            >
              Toutes raretés
            </button>
            {rarities.map((item, index) => (
              <button
                className={rarity === String(index) ? "active" : ""}
                key={item.name}
                onClick={() => setRarity(String(index))}
              >
                <i style={{ background: item.color }} />
                {item.name}
              </button>
            ))}
          </div>
          {hasFilters && (
            <button className="clear-filters text-link" onClick={reset}>
              <X size={13} />
              Réinitialiser les filtres
            </button>
          )}
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
          {view === "catalogs" && !hasFilters && (
            <div
              className="catalog-overview"
              aria-label="Vue d’ensemble des catalogues"
            >
              {catalogs.map((item) => (
                <button
                  key={item.id}
                  className="catalog-album"
                  onClick={() => setCatalog(item.id)}
                >
                  <img src={`/assets/${item.image}.jpg`} alt="" />
                  <div>
                    <h2>{item.title}</h2>
                    <p>{item.family}</p>
                    <progress
                      value={catalogProgress(state, item.id)}
                      max={catalogSize(item.id)}
                      aria-label={`Complétion ${item.title}`}
                    />
                    <span>
                      {catalogProgress(state, item.id)} sur{" "}
                      {catalogSize(item.id)} œuvres découvertes
                    </span>
                  </div>
                  <ChevronRight size={17} />
                </button>
              ))}
            </div>
          )}
          {filtered.length ? (
            <div
              className={`artwork-grid ${view === "museum" ? "museum-grid" : ""}`}
            >
              {filtered
                .slice((currentPage - 1) * 6, currentPage * 6)
                .map((art) => (
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
                  ? "Essayez une autre recherche ou réinitialisez vos filtres."
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
          <div className="collection-pagination">
            <span>
              <i className="live-dot" />
              {filtered.length
                ? `${(currentPage - 1) * 6 + 1}–${Math.min(currentPage * 6, filtered.length)} sur ${filtered.length} œuvres`
                : "Aucune œuvre affichée"}
            </span>
            <div>
              <button
                className="icon-button"
                aria-label="Page précédente"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={i}
                  className={currentPage === i + 1 ? "active" : ""}
                  aria-label={`Page ${i + 1}`}
                  aria-current={currentPage === i + 1 ? "page" : undefined}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="icon-button"
                aria-label="Page suivante"
                disabled={currentPage === pageCount}
                onClick={() => setPage(currentPage + 1)}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
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
