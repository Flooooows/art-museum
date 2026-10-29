import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  ImageOff,
  Landmark,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  Upload,
} from "lucide-react";
import { useTheme } from "../useTheme";
import { CRITERIA, type Criterion } from "../rarity-engine/types";
import {
  decide,
  filterReviewWorks,
  makeExport,
  mergeDecisions,
  parseReviewCatalog,
  parseReviewExport,
  REVIEW_STORAGE_KEY,
  reviewCsv,
  type ReviewFilters,
} from "./model";
import {
  REVIEW_RARITIES,
  type ReviewArtwork,
  type ReviewCatalog,
  type ReviewDecisions,
  type ReviewExport,
  type ReviewLevel,
} from "./types";

const PAGE_SIZE = 24;
const initialFilters: ReviewFilters = {
  query: "",
  family: "all",
  proposed: "all",
  state: "all",
  sort: "score-desc",
};
const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const percent = (n: number) => `${Math.round(n * 100)} %`;
const criterionNames: Record<Criterion, string> = {
  P: "Popularité de l’œuvre",
  A: "Artiste ou contexte",
  H: "Importance historique",
  M: "Reconnaissance institutionnelle",
  C: "Présence culturelle",
};
const typeNames = {
  observed: "Observé",
  derived: "Dérivé",
  estimated: "Estimé",
};

function download(name: string, text: string, type = "application/json") {
  const url = URL.createObjectURL(
    new Blob([text], { type: `${type};charset=utf-8` }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function initialStorage(catalog: ReviewCatalog) {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(REVIEW_STORAGE_KEY);
    return {
      decisions: raw
        ? mergeDecisions(
            {},
            parseReviewExport(JSON.parse(raw), catalog).decisions,
          )
        : {},
      raw,
      blocked: false,
      message: raw
        ? "Choix précédents restaurés."
        : "Aucun choix enregistré pour le moment.",
    };
  } catch {
    return {
      decisions: {},
      raw,
      blocked: true,
      message:
        "Sauvegarde locale indisponible ou incompatible. Rien n’a été écrasé. Exporte tes choix pour les conserver.",
    };
  }
}

function ArtworkCard({
  work,
  decision,
  onDecide,
}: {
  work: ReviewArtwork;
  decision?: ReviewDecisions[string];
  onDecide: (id: string, level: ReviewLevel | null) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const titleId = `title-${work.id}`;
  const estimated = CRITERIA.filter(
    (key) => work.proposal.criteria[key].type === "estimated",
  );
  return (
    <article
      className={`review-work${decision ? " is-decided" : ""}`}
      aria-labelledby={titleId}
    >
      <div className="work-image">
        {imageError ? (
          <div className="image-fallback">
            <ImageOff size={28} />
            <span>Image indisponible</span>
            <a href={work.sourceUrl} target="_blank" rel="noreferrer">
              Voir la notice du musée
            </a>
          </div>
        ) : (
          <img
            src={work.imageUrl}
            alt={work.title}
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
          />
        )}
        <span className="work-family">{work.family}</span>
        {decision && (
          <span className="decision-marker">
            <Check size={14} /> Décidé
          </span>
        )}
      </div>
      <div className="work-identity">
        <h2 id={titleId}>{work.title}</h2>
        <p>{work.creator}</p>
        <span>{work.date}</span>
      </div>
      <div className="algorithm-proposal">
        <div>
          <span>Score de l’algo</span>
          <strong>
            {number.format(work.proposal.score)}
            <small> / 100</small>
          </strong>
        </div>
        <div>
          <span>Placement conseillé</span>
          <strong className={`rarity-text level-${work.proposal.level}`}>
            {REVIEW_RARITIES[work.proposal.level]}
          </strong>
        </div>
      </div>
      <div className="proposal-context">
        <span>
          {work.proposal.status === "provisional"
            ? "Provisoire"
            : "Confirmé par l’algo"}{" "}
          · confiance {percent(work.proposal.confidence)}
        </span>
        <span>{estimated.length}/5 critères estimés</span>
      </div>
      <fieldset className="rarity-options">
        <legend>
          Ma rareté finale{" "}
          <span>{decision ? "· enregistrée" : "· à choisir"}</span>
        </legend>
        {REVIEW_RARITIES.map((name, level) => (
          <label
            key={name}
            className={decision?.finalLevel === level ? "is-selected" : ""}
          >
            <input
              type="radio"
              name={`rarity-${work.id}`}
              value={level}
              checked={decision?.finalLevel === level}
              onChange={() => onDecide(work.id, level as ReviewLevel)}
            />
            <span>{name}</span>
          </label>
        ))}
      </fieldset>
      <div className="work-actions">
        <details>
          <summary>
            Données & sources <ChevronDown size={15} />
          </summary>
          <div className="work-evidence">
            <p>
              Plage de plausibilité :{" "}
              <strong>
                {number.format(work.proposal.interval.lower)}–
                {number.format(work.proposal.interval.upper)}
              </strong>
              . Ce n’est pas un intervalle statistique.
            </p>
            <p>
              {work.proposal.stable
                ? "Niveau stable dans les scénarios testés."
                : "Le niveau change dans certains scénarios de calibration."}
            </p>
            {work.activeLevel !== null && (
              <p>
                Rareté actuellement active : {REVIEW_RARITIES[work.activeLevel]}
                . Cet atelier ne la change pas.
              </p>
            )}
            <dl>
              {CRITERIA.map((key) => {
                const c = work.proposal.criteria[key];
                return (
                  <div key={key}>
                    <dt>
                      {key} — {criterionNames[key]}
                    </dt>
                    <dd>
                      <strong>{number.format(c.score)}/100</strong> ·{" "}
                      {typeNames[c.type]}
                      <p>{c.notes[0]}</p>
                      {c.notes.slice(1).map((note, i) => (
                        <p key={i}>{note}</p>
                      ))}
                      {c.comparableIds.length > 0 && (
                        <p>
                          {c.comparableIds.length} comparables historiques non
                          imputés.
                        </p>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
            <p>
              {work.medium} · {work.context}
            </p>
            <p>
              {work.institution} · {work.license}
            </p>
            <a href={work.sourceUrl} target="_blank" rel="noreferrer">
              Notice de l’institution <ExternalLink size={14} />
            </a>
            <details>
              <summary>Références des indicateurs</summary>
              <ul>
                {[
                  ...new Set(
                    CRITERIA.flatMap(
                      (k) => work.proposal.criteria[k].sourceUrls,
                    ),
                  ),
                ].map((url) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noreferrer">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
            <p className="work-id">
              Identifiant : {work.id} ·{" "}
              {work.origin === "existing"
                ? "Catalogue actuel"
                : "Nouvelle proposition"}
            </p>
          </div>
        </details>
        {decision && (
          <button
            className="text-button"
            onClick={() => onDecide(work.id, null)}
          >
            Annuler mon choix
          </button>
        )}
      </div>
    </article>
  );
}

function ImportDialog({
  incoming,
  decisions,
  onCancel,
  onConfirm,
}: {
  incoming: ReviewExport;
  decisions: ReviewDecisions;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const conflicts = incoming.decisions.filter(
    (d) =>
      decisions[d.artworkId] &&
      decisions[d.artworkId].finalLevel !== d.finalLevel,
  ).length;
  useEffect(() => {
    ref.current?.showModal();
    return () => {
      ref.current?.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="review-dialog"
      aria-labelledby="import-title"
      onCancel={onCancel}
    >
      <h2 id="import-title">
        Importer {incoming.decisions.length} décisions ?
      </h2>
      <p>
        {conflicts
          ? `${conflicts} choix existants seront remplacés par ceux du fichier.`
          : "Aucun choix existant ne sera remplacé par une autre rareté."}{" "}
        Les choix absents du fichier seront conservés.
      </p>
      <p>Cette opération ne modifie pas les cartes du jeu.</p>
      <div>
        <button onClick={onCancel}>Annuler</button>
        <button className="primary-button" onClick={onConfirm}>
          Confirmer l’import
        </button>
      </div>
    </dialog>
  );
}

function Workspace({ catalog }: { catalog: ReviewCatalog }) {
  const [initial] = useState(() => initialStorage(catalog));
  const [decisions, setDecisions] = useState<ReviewDecisions>(
    initial.decisions,
  );
  const [storageBlocked, setStorageBlocked] = useState(initial.blocked);
  const [notice, setNotice] = useState(initial.message);
  const [incoming, setIncoming] = useState<ReviewExport | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  // Freeze membership until filter changes/refresh so a checked card stays put.
  const [filterSnapshot, setFilterSnapshot] = useState<ReviewDecisions>(
    initial.decisions,
  );
  const [dirtyFilter, setDirtyFilter] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const top = useRef<HTMLElement>(null);
  const results = useRef<HTMLDivElement>(null);
  const focusAfterPageChange = useRef(false);
  const { theme, toggleTheme } = useTheme();
  useEffect(() => {
    const changedElsewhere = (event: StorageEvent) => {
      if (event.key === REVIEW_STORAGE_KEY || event.key === null) {
        setStorageBlocked(true);
        setNotice(
          "La sauvegarde a changé dans un autre onglet. Vos choix ici sont conservés pour cette session : exportez-les avant de recharger, ou confirmez leur sauvegarde.",
        );
      }
    };
    window.addEventListener("storage", changedElsewhere);
    return () => window.removeEventListener("storage", changedElsewhere);
  }, []);
  const filtered = useMemo(
    () => filterReviewWorks(catalog.works, filterSnapshot, filters),
    [catalog, filterSnapshot, filters],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  useEffect(() => {
    if (!focusAfterPageChange.current) return;
    focusAfterPageChange.current = false;
    results.current?.focus({ preventScroll: true });
    top.current?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [currentPage]);
  const count = Object.keys(decisions).length;
  const families = useMemo(
    () =>
      [...new Set(catalog.works.map((w) => w.family))].sort((a, b) =>
        a.localeCompare(b, "fr"),
      ),
    [catalog],
  );

  function save(next: ReviewDecisions) {
    setDecisions(next);
    if (filters.state !== "all") setDirtyFilter(true);
    if (storageBlocked) {
      setNotice(
        "Choix gardé pour cette session seulement. Exporte le JSON avant de fermer cette page.",
      );
      return;
    }
    try {
      localStorage.setItem(
        REVIEW_STORAGE_KEY,
        JSON.stringify(makeExport(catalog, next)),
      );
      setNotice("Choix enregistré dans ce navigateur.");
    } catch {
      setStorageBlocked(true);
      setNotice(
        "Le navigateur refuse la sauvegarde locale. Exporte tes choix avant de fermer cette page.",
      );
    }
  }
  function updateFilters(change: Partial<ReviewFilters>) {
    setFilters((current) => ({ ...current, ...change }));
    setFilterSnapshot(decisions);
    setDirtyFilter(false);
    setPage(1);
  }
  function changePage(next: number) {
    focusAfterPageChange.current = true;
    setPage(next);
  }
  async function readImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      if (file.size > 2_000_000)
        throw new Error("Fichier trop volumineux (maximum 2 Mo).");
      setIncoming(parseReviewExport(JSON.parse(await file.text()), catalog));
    } catch (error) {
      setNotice(
        error instanceof SyntaxError
          ? "Import refusé : le fichier n’est pas un JSON lisible. Aucun choix modifié."
          : error instanceof Error
            ? error.message
            : "Impossible de lire ce fichier JSON. Aucun choix modifié.",
      );
    }
  }
  function enableStorage() {
    if (
      !window.confirm(
        "Remplacer uniquement la sauvegarde de cet atelier par les choix de cette session ? Exporte d’abord l’ancienne si tu veux la conserver. Les données du jeu restent intactes.",
      )
    )
      return;
    try {
      localStorage.setItem(
        REVIEW_STORAGE_KEY,
        JSON.stringify(makeExport(catalog, decisions)),
      );
      setStorageBlocked(false);
      setNotice("Sauvegarde de l’atelier rétablie.");
    } catch {
      setNotice("Le stockage reste indisponible. Utilise l’export JSON.");
    }
  }
  return (
    <>
      <a className="skip-link" href="#review-works">
        Aller aux œuvres
      </a>
      <header className="review-header">
        <a href="/" className="review-brand" aria-label="MUSE, revenir au site">
          <Landmark size={25} />
          <span>MUSE</span>
        </a>
        <span className="header-section">Atelier des raretés</span>
        <div className="header-actions">
          <button
            className="icon-button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Activer le thème clair"
                : "Activer le thème sombre"
            }
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button onClick={() => fileInput.current?.click()}>
            <Upload size={16} />
            <span>Importer</span>
          </button>
          <button
            className="primary-button"
            disabled={!count}
            onClick={() =>
              download(
                `muse-decisions-${catalog.version}.json`,
                JSON.stringify(makeExport(catalog, decisions), null, 2),
              )
            }
          >
            <Download size={16} />
            <span>Exporter mes choix</span>
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".json,application/json"
            className="file-input"
            tabIndex={-1}
            aria-label="Importer une sauvegarde JSON"
            onChange={readImport}
          />
        </div>
      </header>
      <main className="review-main">
        <section className="review-intro" aria-labelledby="review-heading">
          <div>
            <h1 id="review-heading">Atelier des raretés</h1>
            <p>1 000 œuvres à examiner. Choisissez leur rareté finale.</p>
          </div>
          <div className="review-progress">
            <div>
              <strong>
                {count}
                <span> / 1 000</span>
              </strong>
              <span>œuvres examinées</span>
            </div>
            <progress
              value={count}
              max={1000}
              aria-label={`${count} œuvres examinées sur 1000`}
            />
            <p>
              <ShieldCheck size={15} /> Aucun changement dans le jeu
            </p>
          </div>
        </section>
        <div className="review-method">
          <p>
            Les scores restent provisoires. Chaque fiche indique la confiance et
            les critères estimés.
          </p>
          <details>
            <summary>Comment lire les scores ?</summary>
            <p>
              V2 combine popularité (25 %), artiste ou contexte (20 %), histoire
              (25 %), reconnaissance institutionnelle (20 %) et présence
              culturelle (10 %). Seuils : 40 / 60 / 75 / 90. La confiance est un
              indice heuristique, pas une probabilité de justesse.
            </p>
            <p>{catalog.method}</p>
            <p>
              900 nouvelles notices proviennent de Cleveland Open Access (CC0).
              Les titres restent dans leur langue d’origine. Ces œuvres ne
              constituent pas un échantillon représentatif mondial ; un grand
              nombre de notes P/A/C sont estimées.
            </p>
          </details>
        </div>
        <div className={`save-notice${storageBlocked ? " is-warning" : ""}`}>
          <span role="status">{notice}</span>
          {storageBlocked && (
            <div>
              {initial.raw && (
                <button
                  className="text-button"
                  onClick={() =>
                    download("muse-ancienne-sauvegarde.json", initial.raw!)
                  }
                >
                  Récupérer l’ancienne sauvegarde
                </button>
              )}
              <button className="text-button" onClick={enableStorage}>
                Réessayer la sauvegarde locale
              </button>
            </div>
          )}
        </div>
        <section
          className="review-workspace"
          ref={top}
          aria-label="Catalogue à examiner"
        >
          <div className="review-toolbar">
            <label className="review-search">
              <Search size={19} />
              <span className="sr-only">
                Rechercher une œuvre, un artiste ou un identifiant
              </span>
              <input
                type="search"
                placeholder="Une œuvre, un artiste, une époque…"
                value={filters.query}
                onChange={(e) => updateFilters({ query: e.target.value })}
              />
            </label>
            <FilterSelect
              label="Famille"
              value={filters.family}
              onChange={(v) => updateFilters({ family: v })}
            >
              <option value="all">Toutes les familles</option>
              {families.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Proposition de l’algo"
              value={filters.proposed}
              onChange={(v) => updateFilters({ proposed: v })}
            >
              <option value="all">Toutes les propositions</option>
              {REVIEW_RARITIES.map((r, i) => (
                <option key={r} value={i}>
                  {r}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Trier par"
              value={filters.sort}
              onChange={(v) =>
                updateFilters({ sort: v as ReviewFilters["sort"] })
              }
            >
              <option value="score-desc">Score décroissant</option>
              <option value="score-asc">Score croissant</option>
              <option value="title">Titre de l’œuvre</option>
              <option value="confidence">Confiance la plus faible</option>
            </FilterSelect>
          </div>
          <div className="review-list-heading">
            <div
              className="review-tabs"
              role="group"
              aria-label="État de revue"
            >
              {(
                [
                  ["all", "Toutes"],
                  ["pending", "À examiner"],
                  ["decided", "Décidées"],
                  ["different", "Écarts avec l’algo"],
                ] as const
              ).map(([state, label]) => (
                <button
                  key={state}
                  aria-pressed={filters.state === state}
                  onClick={() => updateFilters({ state })}
                >
                  {label}
                </button>
              ))}
            </div>
            <span role="status">
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
            </span>
          </div>
          {dirtyFilter && (
            <div className="filter-refresh">
              Vos choix ont changé. Les cartes restent en place pour faciliter
              la revue.
              <button
                className="text-button"
                onClick={() => {
                  setFilterSnapshot(decisions);
                  setDirtyFilter(false);
                  setPage(1);
                }}
              >
                Actualiser la liste
              </button>
            </div>
          )}
          {visible.length ? (
            <div
              id="review-works"
              className="review-grid"
              ref={results}
              tabIndex={-1}
              role="region"
              aria-label={`Œuvres de la page ${currentPage} sur ${pages}`}
            >
              {visible.map((w) => (
                <ArtworkCard
                  key={w.id}
                  work={w}
                  decision={decisions[w.id]}
                  onDecide={(id, level) => save(decide(decisions, id, level))}
                />
              ))}
            </div>
          ) : (
            <div
              id="review-works"
              className="review-empty"
              ref={results}
              tabIndex={-1}
              role="region"
              aria-label="Aucune œuvre dans la sélection"
            >
              <Search size={28} />
              <h2>Aucune œuvre dans cette sélection</h2>
              <p>
                Modifiez votre recherche ou retirez les filtres pour continuer.
              </p>
              <button
                onClick={() => {
                  setFilters(initialFilters);
                  setFilterSnapshot(decisions);
                  setDirtyFilter(false);
                  setPage(1);
                }}
              >
                Afficher les 1 000 œuvres
              </button>
            </div>
          )}
          <nav className="review-pagination" aria-label="Pages des œuvres">
            <p>
              {filtered.length
                ? `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} sur ${filtered.length} œuvres`
                : "Aucun résultat"}
            </p>
            <div>
              <button
                aria-label="Page précédente"
                disabled={currentPage <= 1}
                onClick={() => changePage(currentPage - 1)}
              >
                <ArrowLeft size={18} />
              </button>
              <label>
                Page{" "}
                <select
                  aria-label="Choisir une page"
                  value={currentPage}
                  onChange={(e) => changePage(Number(e.target.value))}
                >
                  {Array.from({ length: pages }, (_, i) => (
                    <option key={i + 1}>{i + 1}</option>
                  ))}
                </select>
                <span> / {pages}</span>
              </label>
              <button
                aria-label="Page suivante"
                disabled={currentPage >= pages}
                onClick={() => changePage(currentPage + 1)}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </nav>
        </section>
        <footer className="review-footer">
          <div>
            <strong>MUSE · atelier de validation</strong>
            <p>
              Sauvegarde dans ce navigateur uniquement. Exportez régulièrement
              vos choix.
              <br />
              Aucune synchronisation, publication ou migration automatique.
            </p>
            <span>
              Algorithme {catalog.algorithmVersion} ·{" "}
              {catalog.configurationVersion}
            </span>
          </div>
          <button
            onClick={() =>
              download(
                `muse-catalogue-${catalog.version}.csv`,
                reviewCsv(catalog, decisions),
                "text/csv",
              )
            }
          >
            <Download size={17} /> Exporter les 1 000 fiches en CSV
          </button>
        </footer>
      </main>
      {incoming && (
        <ImportDialog
          incoming={incoming}
          decisions={decisions}
          onCancel={() => setIncoming(null)}
          onConfirm={() => {
            const next = mergeDecisions(decisions, incoming.decisions);
            save(next);
            setIncoming(null);
          }}
        />
      )}
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="review-select">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </label>
  );
}

export default function ReviewApp() {
  const [catalog, setCatalog] = useState<ReviewCatalog | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    let active = true;
    const timeout = setTimeout(() => abort.abort(), 60000);
    fetch("/review-data/catalog.json", { signal: abort.signal })
      .then((response) => {
        if (!response.ok)
          throw new Error(`Catalogue indisponible (HTTP ${response.status}).`);
        return response.json();
      })
      .then(parseReviewCatalog)
      .then((value) => {
        if (active) setCatalog(value);
      })
      .catch(() => {
        if (active)
          setError(
            "Le catalogue n’a pas pu être chargé. Vérifiez votre connexion puis réessayez.",
          );
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      abort.abort();
    };
  }, [attempt]);
  if (!catalog)
    return (
      <main className="review-loading">
        <Landmark size={30} />
        <h1>Atelier des raretés</h1>
        {error ? (
          <>
            <p role="alert">{error}</p>
            <button
              onClick={() => {
                setError("");
                setAttempt((n) => n + 1);
              }}
            >
              Réessayer
            </button>
          </>
        ) : (
          <p role="status">Chargement des 1 000 œuvres…</p>
        )}
        <a href="/">Revenir à MUSE</a>
      </main>
    );
  return <Workspace catalog={catalog} />;
}
