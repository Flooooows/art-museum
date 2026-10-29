import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Download,
  Gift,
  HardDrive,
  Info,
  Moon,
  Search,
  Sun,
  Upload,
  X,
} from "lucide-react";
import { type Artwork } from "./data";
import {
  initialState,
  openPack,
  parseState,
  refreshStock,
  revealCards,
  REFILL_MS,
  STORAGE_KEY,
  uniqueCount,
  type CollectionState,
} from "./collection";
import { ArtworkDetail, Brand, Button, Modal } from "./components";
import Home from "./Home";
import { PackOpening } from "./Opening";
import Collection from "./Collection";
import Market from "./Market";
import Profile from "./Profile";
import { navigation, resolvePage, type Page } from "./navigation";
import { useTheme } from "./useTheme";

function loadCollection() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return { state: saved ? parseState(saved) : initialState(), error: "" };
  } catch {
    return {
      state: initialState(),
      error:
        "La sauvegarde locale est inaccessible ou invalide. Votre ancienne sauvegarde n’a pas été écrasée. La session continue en mémoire ; exportez-la pour la conserver.",
    };
  }
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [boot] = useState(loadCollection);
  const [state, setState] = useState(boot.state);
  const [persistence, setPersistence] = useState(!boot.error);
  const [warning, setWarning] = useState(boot.error);
  const [page, setPage] = useState<Page>(() =>
    resolvePage(window.location.hash),
  );
  const [opening, setOpening] = useState<{
    selected: string;
    revealed: boolean;
  } | null>(null);
  const [detail, setDetail] = useState<Artwork | null>(null);
  const [imported, setImported] = useState<CollectionState | null>(null);
  const [importError, setImportError] = useState("");
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(Date.now());
  const [searchFocus, setSearchFocus] = useState(false);
  const [museum, setMuseum] = useState(() => window.location.hash === "#musee");

  useEffect(() => {
    const onHash = () => {
      const isMuseum = window.location.hash === "#musee";
      const next = resolvePage(window.location.hash);
      if (window.location.hash !== `#${next}`)
        window.history.replaceState(null, "", `#${next}`);
      setPage(next);
      setOpening(null);
      setDetail(null);
      setImported(null);
      setSearchFocus(false);
      setMuseum(isMuseum);
    };
    const initial = resolvePage(window.location.hash);
    if (window.location.hash !== `#${initial}`)
      window.history.replaceState(null, "", `#${initial}`);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const time = Date.now();
      setNow(time);
      setState((previous) => refreshStock(previous, time));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!persistence) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      setPersistence(false);
      setWarning(
        "Le navigateur ne peut pas enregistrer votre progression. Elle reste disponible pour cette session : exportez une sauvegarde depuis votre profil.",
      );
    }
  }, [state, persistence]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setState(parseState(event.newValue));
        setOpening(null);
        setMessage("Collection actualisée depuis un autre onglet.");
      } catch {
        setWarning("Une modification invalide de la sauvegarde a été ignorée.");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = `MUSE — ${navigation.find((item) => item.id === page)?.label}`;
    if (!(page === "collection" && searchFocus)) {
      document.getElementById("contenu")?.focus({ preventScroll: true });
    }
  }, [page, searchFocus]);

  const go = (next: Page) => {
    setOpening(null);
    setDetail(null);
    setImported(null);
    if (next !== "collection") setSearchFocus(false);
    if (window.location.hash !== `#${next}`)
      window.history.pushState(null, "", `#${next}`);
    setPage(next);
  };
  const choose = (selected: string) =>
    setOpening({ selected, revealed: false });
  const countdownMs = Math.max(0, state.rechargedAt + REFILL_MS - now);
  const countdown = `${String(Math.floor(countdownMs / 60000)).padStart(2, "0")}:${String(Math.floor((countdownMs % 60000) / 1000)).padStart(2, "0")}`;
  const toggleFavorite = (id: string) =>
    setState((previous) => ({
      ...previous,
      favorites: previous.favorites.includes(id)
        ? previous.favorites.filter((item) => item !== id)
        : [...previous.favorites, id],
    }));
  const toggleExhibit = (id: string) => {
    if (!state.counts[id]) return;
    const removing = state.exhibited.includes(id);
    setState((previous) => ({
      ...previous,
      exhibited: removing
        ? previous.exhibited.filter((item) => item !== id)
        : [...previous.exhibited, id],
    }));
    setMessage(
      removing
        ? "Œuvre retirée de votre salle d’exposition."
        : "L’œuvre est exposée dans votre musée personnel.",
    );
  };
  const handleOpen = (quick: boolean) => {
    if (!opening || opening.revealed) return;
    try {
      const draw = openPack(state, opening.selected);
      const next = quick ? revealCards(draw) : draw;
      setState(next);
      setOpening({ ...opening, revealed: true });
    } catch (error) {
      setMessage((error as Error).message);
    }
  };
  const reveal = (index?: number) =>
    setState((previous) => revealCards(previous, index));
  const exportCollection = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `muse-collection-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(
      "Votre fichier de sauvegarde a été préparé. Gardez-le en lieu sûr.",
    );
  };
  const importFile = async (file?: File) => {
    if (!file) return;
    setImportError("");
    if (file.size > 1_000_000) {
      setImportError(
        "Ce fichier est trop volumineux. Choisissez un export MUSE au format JSON.",
      );
      return;
    }
    try {
      setImported(parseState(await file.text()));
    } catch {
      setImportError(
        "Import impossible : ce fichier n’est pas une sauvegarde MUSE valide. Votre collection est inchangée.",
      );
    }
  };

  return (
    <>
      <a
        href="#contenu"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("contenu")?.focus();
        }}
      >
        Aller au contenu
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a
            href="#pochettes"
            className="brand-link"
            aria-label="MUSE, accueil"
            onClick={(event) => {
              event.preventDefault();
              go("pochettes");
            }}
          >
            <Brand />
          </a>
          <nav aria-label="Navigation principale">
            {navigation.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={page === item.id ? "active" : ""}
                aria-current={page === item.id ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  setSearchFocus(false);
                  setMuseum(false);
                  go(item.id);
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="header-tools">
            <button
              className="stock-badge"
              onClick={() => go("pochettes")}
              aria-label={`${state.stock} / 10 pochettes disponibles`}
            >
              <Gift size={17} />
              <span>
                {state.stock} <span className="stock-limit">/ 10</span>
              </span>
            </button>
            <button
              type="button"
              className="icon-button theme-toggle"
              aria-label={
                theme === "dark"
                  ? "Activer le thème clair"
                  : "Activer le thème sombre"
              }
              aria-pressed={theme === "dark"}
              title={
                theme === "dark"
                  ? "Passer au thème clair"
                  : "Passer au thème sombre"
              }
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun size={21} /> : <Moon size={21} />}
            </button>
            <button
              className="icon-button search-header"
              aria-label="Rechercher dans la collection"
              onClick={() => {
                setSearchFocus(true);
                setMuseum(false);
                go("collection");
              }}
            >
              <Search size={19} />
            </button>
            <button
              className="profile-button"
              onClick={() => go("profil")}
              aria-label="Voir mon profil"
            >
              <img src="/assets/renaissance-art.jpg" alt="" />
            </button>
          </div>
        </div>
      </header>
      {warning && (
        <div className="storage-warning" role="alert">
          <Info size={18} />
          <p>{warning}</p>
          <button onClick={() => go("profil")}>Sauvegarder</button>
        </div>
      )}
      <main id="contenu" tabIndex={-1}>
        {page === "pochettes" && (
          <Home
            state={state}
            countdown={countdown}
            onChoose={choose}
            onResume={() => {
              if (state.latest)
                setOpening({ selected: state.latest.catalog, revealed: true });
            }}
          />
        )}
        {page === "marche" && (
          <Market
            state={state}
            onDetail={setDetail}
            onOpen={() => go("pochettes")}
          />
        )}
        {page === "collection" && (
          <Collection
            state={state}
            onDetail={setDetail}
            onFavorite={toggleFavorite}
            onOpen={() => go("pochettes")}
            museum={museum}
            searchFocus={searchFocus}
          />
        )}
        {page === "profil" && (
          <Profile
            state={state}
            persistence={persistence}
            theme={theme}
            onToggleTheme={toggleTheme}
            onExport={exportCollection}
            onImport={(file) => {
              void importFile(file);
            }}
            importError={importError}
            onMuseum={() => {
              setMuseum(true);
              go("collection");
            }}
          />
        )}
      </main>
      <footer className="site-footer">
        <p>« MUSE — L’art ne meurt jamais, il circule »</p>
        <div>
          <button onClick={() => go("profil")}>
            <HardDrive size={14} />
            {persistence
              ? "Progression locale enregistrée"
              : "Session non sauvegardée"}
          </button>
        </div>
      </footer>
      {message && (
        <div className="toast" role="status">
          <Check size={18} />
          <span>{message}</span>
          <button
            className="icon-button"
            aria-label="Fermer le message"
            onClick={() => setMessage("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {opening && (
        <PackOpening
          selected={opening.selected}
          state={state}
          countdown={countdown}
          revealed={opening.revealed}
          onOpen={handleOpen}
          onReveal={reveal}
          onClose={() => setOpening(null)}
          onDetail={setDetail}
          onCollection={() => {
            setMuseum(false);
            setSearchFocus(false);
            go("collection");
          }}
        />
      )}
      {detail && (
        <ArtworkDetail
          art={detail}
          count={state.counts[detail.id] || 0}
          favorite={state.favorites.includes(detail.id)}
          exhibited={state.exhibited.includes(detail.id)}
          onFavorite={() => toggleFavorite(detail.id)}
          onExhibit={() => toggleExhibit(detail.id)}
          onClose={() => setDetail(null)}
        />
      )}
      {imported && (
        <Modal
          title="Remplacer votre collection ?"
          onClose={() => setImported(null)}
          className="settings-modal"
        >
          <div className="import-confirmation">
            <Upload size={35} />
            <p>
              Le fichier contient{" "}
              <strong>{uniqueCount(imported)} œuvres uniques</strong> et{" "}
              {imported.opened} pochettes ouvertes. Son importation remplacera
              votre progression actuelle sur cet appareil.
            </p>
            <p>
              Nous vous conseillons d’exporter votre collection actuelle avant
              de continuer.
            </p>
            <Button variant="ghost" onClick={exportCollection}>
              <Download size={16} />
              Exporter la collection actuelle
            </Button>
            <div className="import-actions">
              <Button variant="ghost" onClick={() => setImported(null)}>
                Annuler
              </Button>
              <Button
                onClick={() => {
                  setState(refreshStock(imported, Date.now()));
                  setPersistence(true);
                  setWarning("");
                  setImported(null);
                  setImportError("");
                  setMessage("Votre collection a été importée.");
                }}
              >
                Remplacer et importer
                <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
