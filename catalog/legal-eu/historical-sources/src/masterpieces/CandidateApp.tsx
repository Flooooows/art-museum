import { useEffect, useRef, useState } from "react";
import { Landmark, Moon, Sun } from "lucide-react";
import { ArtworkCard } from "../review/ReviewApp";
import { REVIEW_RARITIES } from "../review/types";
import { useTheme } from "../useTheme";
import {
  STORAGE_KEY,
  STATUSES,
  decisionsFor,
  makeExport,
  mergeEvents,
  parseCandidateCatalog,
  parseCandidateExport,
  type CandidateCatalog,
  type CandidateExport,
  type ReviewEvent,
  type SelectionStatus,
} from "./model";

function download(name: string, value: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
function initial(catalog: CandidateCatalog, storageKey: string) {
  try {
    const raw = localStorage.getItem(storageKey);
    return {
      events: raw ? parseCandidateExport(JSON.parse(raw), catalog).events : [],
      blocked: false,
      notice: raw
        ? "Choix des candidates restaurés."
        : "Choix enregistrés uniquement dans ce navigateur. Pense à les exporter.",
    };
  } catch {
    return {
      events: [],
      blocked: true,
      notice:
        "Sauvegarde inaccessible ou incompatible : elle ne sera pas écrasée. Les nouveaux choix restent en mémoire ; exporte-les avant de fermer.",
    };
  }
}
interface ReviewOptions {
  catalogUrl: string;
  storageKey: string;
  label: string;
  introduction: string;
  imageDirectory: "/masterpieces-images" | "/enrichment-351-images";
  batchLinks?: { href: string; label: string; current: boolean }[];
}
function Workspace({
  catalog,
  options,
}: {
  catalog: CandidateCatalog;
  options: ReviewOptions;
}) {
  const [loaded] = useState(() => initial(catalog, options.storageKey));
  const [events, setEvents] = useState<ReviewEvent[]>(loaded.events),
    [notice, setNotice] = useState(loaded.notice);
  const [storageBlocked, setStorageBlocked] = useState(loaded.blocked),
    [pending, setPending] = useState<CandidateExport | null>(null);
  const [query, setQuery] = useState(""),
    [region, setRegion] = useState("all"),
    [status, setStatus] = useState("all");
  const file = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { rarities, selections } = decisionsFor(events);
  const metadata = new Map(catalog.candidates.map((c) => [c.id, c]));
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const visible = catalog.works.filter((w) => {
    const c = metadata.get(w.id)!;
    return (
      (region === "all" || region === c.region) &&
      (status === "all" ||
        (status === "unreviewed"
          ? !selections[w.id]
          : selections[w.id] === status)) &&
      normalize(`${w.title} ${w.creator} ${w.institution}`).includes(
        normalize(query),
      )
    );
  });
  function save(next: ReviewEvent[]) {
    setEvents(next);
    if (storageBlocked) {
      setNotice(
        "Choix conservé en mémoire seulement. Exporte tes choix avant de quitter.",
      );
      return;
    }
    try {
      localStorage.setItem(
        options.storageKey,
        JSON.stringify(makeExport(catalog, next)),
      );
      setNotice(
        "Choix enregistré dans ce navigateur. Aucun changement dans l’atelier des 1 000 œuvres ni dans le jeu.",
      );
    } catch {
      setStorageBlocked(true);
      setNotice(
        "Sauvegarde locale impossible. Choix conservés en mémoire : utilise l’export JSON.",
      );
    }
  }
  function append(
    event: { artworkId: string } & (
      | { kind: "rarity"; level: 0 | 1 | 2 | 3 | 4 | null }
      | { kind: "selection"; status: SelectionStatus }
    ),
  ) {
    save(
      mergeEvents(events, [
        { ...event, id: crypto.randomUUID(), at: new Date().toISOString() },
      ]),
    );
  }
  async function readImport(input: HTMLInputElement) {
    const f = input.files?.[0];
    input.value = "";
    if (!f) return;
    setPending(null);
    try {
      if (f.size > 5_000_000) throw Error("Fichier trop volumineux.");
      const parsed = parseCandidateExport(JSON.parse(await f.text()), catalog);
      mergeEvents(events, parsed.events);
      setPending(parsed);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Import refusé ; aucun choix modifié.",
      );
    }
  }
  return (
    <>
      <a className="skip-link" href="#candidate-works">
        Aller aux candidates
      </a>
      <header className="review-header candidates-header">
        <a
          className="review-brand"
          href="/"
          aria-label="MUSE — atelier des 1 000 œuvres"
        >
          <Landmark size={25} />
          <span>MUSE</span>
        </a>
        <a href="/review.html">Atelier · 1 000 œuvres</a>
        <span className="header-section">{options.label}</span>
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
          <button onClick={() => file.current?.click()}>Importer</button>
          <button
            className="primary-button"
            onClick={() =>
              download(
                `muse-choix-${catalog.version}.json`,
                makeExport(catalog, events),
              )
            }
          >
            Exporter mes choix
          </button>
          <input
            className="file-input"
            ref={file}
            type="file"
            accept=".json,application/json"
            tabIndex={-1}
            aria-label="Importer les choix des candidates"
            onChange={(e) => void readImport(e.currentTarget)}
          />
        </div>
      </header>
      <main className="review-main candidates-main">
        {options.batchLinks && (
          <nav className="candidate-batches" aria-label="Lots de candidates">
            {options.batchLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={link.current ? "page" : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
        <section className="candidates-intro" aria-labelledby="candidate-title">
          <p>LE CATALOGUE S’OUVRE</p>
          <h1 id="candidate-title">
            De nouvelles œuvres.
            <br />À toi de choisir leur place.
          </h1>
          <p>
            {catalog.works.length} propositions. {options.introduction} Choisis
            leur rareté, puis indique celles que tu souhaites retenir.{" "}
            <strong>Rien n’est ajouté automatiquement au jeu.</strong>
          </p>
          <div className="candidate-counts">
            <span>
              <strong>{catalog.summary.researchedExactObjects}</strong> objets
              vérifiés
            </span>
            <span>
              <strong>{catalog.works.length}</strong> images libres retenues
            </span>
            <span>
              <strong>
                {
                  Object.values(selections).filter((v) => v === "accepted")
                    .length
                }
              </strong>{" "}
              œuvres retenues par toi
            </span>
          </div>
        </section>
        <div
          className={`save-notice${storageBlocked ? " is-warning" : ""}`}
          role="status"
        >
          {notice}
        </div>
        {pending && (
          <section className="candidate-import" aria-labelledby="import-title">
            <h2 id="import-title">
              Fusionner {pending.events.length} événements ?
            </h2>
            <p>
              L’historique existant est conservé. Pour chaque choix, l’événement
              le plus récent par date l’emporte, même s’il vient du fichier.
              Exporte d’abord tes choix pour garder une copie. Le fichier des 1
              000 œuvres n’est jamais modifié.
            </p>
            <button onClick={() => setPending(null)}>Annuler</button>{" "}
            <button
              className="primary-button"
              onClick={() => {
                try {
                  save(mergeEvents(events, pending.events));
                  setPending(null);
                } catch (e) {
                  setNotice(e instanceof Error ? e.message : "Import refusé.");
                }
              }}
            >
              Confirmer la fusion
            </button>
          </section>
        )}
        <section className="review-method" aria-label="Méthode et limites">
          <p>
            Les 1 000 œuvres et leurs décisions restent dans l’atelier
            d’origine. Ici, les choix et l’historique ont leur propre sauvegarde
            locale et leur propre export.
          </p>
          <details>
            <summary>Comment lire ces propositions ?</summary>
            <p>
              V2 inchangé : P/A/H/M/C pondérés 25/20/25/20/10 ; seuils
              40/60/75/90. Les estimations, la confiance et les sources sont
              sous chaque œuvre. Aucun score n’a été augmenté pour atteindre «
              Pièce maîtresse ».
            </p>
            <p>
              Une icône peut recevoir un score bas si les audiences exactes ou
              les références structurées manquent. Cela signale un manque de
              données, pas une preuve de faible notoriété. Les audiences de
              séries et de civilisations ne sont pas attribuées à un objet.
            </p>
            <p>
              CC0/Open Access, domaine public documenté ou licence commerciale
              explicitement indiquée pour chaque fichier. Les crédits et
              obligations des photographes restent à respecter. Ces
              vérifications ne constituent pas un avis juridique mondial ;
              droits moraux, provenance et sensibilités culturelles restent à
              respecter.
            </p>
            <a href={options.catalogUrl} download>
              Télécharger les données et sources de cette revue
            </a>
          </details>
        </section>
        <section aria-labelledby="candidate-list-title">
          <div className="review-toolbar">
            <label className="review-search">
              {" "}
              <span className="sr-only">Rechercher une candidate</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Œuvre, artiste ou musée…"
              />
            </label>
            <label className="review-select">
              Région culturelle
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="all">Toutes les régions</option>
                {[
                  ...new Set(
                    catalog.works.map((w) => metadata.get(w.id)!.region),
                  ),
                ]
                  .sort()
                  .map((r) => (
                    <option key={r}>{r}</option>
                  ))}
              </select>
            </label>
            <label className="review-select">
              Ma sélection
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">Toutes les candidates</option>
                <option value="unreviewed">Sans choix de sélection</option>
                {Object.entries(STATUSES).map(([s, label]) => (
                  <option key={s} value={s}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="review-list-heading">
            <h2 id="candidate-list-title">Les œuvres à examiner</h2>
            <span aria-live="polite">
              {visible.length} sur {catalog.works.length}
            </span>
          </div>
          <div className="review-grid" id="candidate-works">
            {visible.map((w) => {
              const c = metadata.get(w.id)!;
              const history = events.filter((e) => e.artworkId === w.id);
              return (
                <div className="candidate-item" key={w.id}>
                  <ArtworkCard
                    work={w}
                    decision={rarities[w.id]}
                    onDecide={(artworkId, level) =>
                      append({ artworkId, kind: "rarity", level })
                    }
                  />
                  <div className="candidate-selection">
                    <p>
                      {c.region} · {c.inventoryNumber}
                    </p>
                    <p>{c.rationale}</p>
                    <fieldset>
                      <legend>Ma sélection · {w.title}</legend>
                      <div className="candidate-statuses">
                        {Object.entries(STATUSES).map(([s, label]) => (
                          <label
                            key={s}
                            className={
                              selections[w.id] === s ? "is-selected" : ""
                            }
                          >
                            <input
                              type="radio"
                              name={`selection-${w.id}`}
                              checked={selections[w.id] === s}
                              onChange={() =>
                                append({
                                  artworkId: w.id,
                                  kind: "selection",
                                  status: s as SelectionStatus,
                                })
                              }
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <details>
                      <summary>Droits & historique ({history.length})</summary>
                      <p>
                        {c.rights.artwork} {c.rights.image}
                      </p>
                      <p>{c.rights.jurisdiction}</p>
                      <a
                        href={c.rights.licenseUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Déclaration de droits
                      </a>
                      {history.length ? (
                        <ol>
                          {history.map((e) => (
                            <li key={e.id}>
                              <time dateTime={e.at}>
                                {new Date(e.at).toLocaleString("fr-FR")}
                              </time>{" "}
                              ·{" "}
                              {e.kind === "selection"
                                ? STATUSES[e.status]
                                : e.level === null
                                  ? "Rareté annulée"
                                  : REVIEW_RARITIES[e.level]}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p>Aucun choix pour cette candidate.</p>
                      )}
                    </details>
                  </div>
                </div>
              );
            })}
          </div>
          {!visible.length && (
            <div className="review-empty">
              <h3>Aucune candidate pour ces filtres</h3>
              <button
                onClick={() => {
                  setQuery("");
                  setRegion("all");
                  setStatus("all");
                }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </section>
        {catalog.candidates.some((c) => !c.recommended) && (
          <section
            className="candidate-research"
            aria-labelledby="research-title"
          >
            <h2 id="research-title">Le carnet de recherche</h2>
            <p>
              {catalog.summary.rightsReviewRequired} objets exacts sans droits
              d’image établis : notices seulement, sans vignette.{" "}
              {catalog.summary.eligibleNotSelected} autres objets admissibles
              sont différés hors de ce lot de {catalog.works.length} œuvres. Tu
              peux noter ta sélection ci-dessous ; retenir une notice ne lève
              aucune restriction de droits et ne publie pas son image.
            </p>
            <details>
              <summary>
                Voir les {catalog.candidates.length - catalog.works.length}{" "}
                autres notices
              </summary>
              <ul>
                {catalog.candidates
                  .filter((c) => !c.recommended)
                  .map((c) => (
                    <li key={c.id}>
                      <a href={c.sourceUrl} target="_blank" rel="noreferrer">
                        {c.title}
                      </a>
                      <span>
                        {c.creator} · {c.inventoryNumber} ·{" "}
                        {c.rights.status === "cleared"
                          ? "Admissible, différée"
                          : "Droits à vérifier · aucune image publiée"}
                      </span>
                      <label className="review-select">
                        Ma sélection · {c.title}
                        <select
                          value={selections[c.id] ?? ""}
                          onChange={(e) => {
                            if (e.target.value)
                              append({
                                artworkId: c.id,
                                kind: "selection",
                                status: e.target.value as SelectionStatus,
                              });
                          }}
                        >
                          <option value="" disabled>
                            À choisir
                          </option>
                          {Object.entries(STATUSES).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <details>
                        <summary>
                          Historique (
                          {events.filter((e) => e.artworkId === c.id).length})
                        </summary>
                        <ol>
                          {events
                            .filter((e) => e.artworkId === c.id)
                            .map((e) => (
                              <li key={e.id}>
                                <time dateTime={e.at}>
                                  {new Date(e.at).toLocaleString("fr-FR")}
                                </time>{" "}
                                ·{" "}
                                {e.kind === "selection"
                                  ? STATUSES[e.status]
                                  : "Rareté"}
                              </li>
                            ))}
                        </ol>
                      </details>
                    </li>
                  ))}
              </ul>
            </details>
          </section>
        )}
        <footer className="review-footer">
          <p>
            Retenir une œuvre n’active ni carte, ni rareté, ni probabilité du
            jeu. Sauvegarde locale seulement : exporte tes choix pour les
            partager ou changer d’appareil.
          </p>
          <a href="/review.html">Revenir aux 1 000 œuvres</a>
        </footer>
      </main>
    </>
  );
}
export default function CandidateApp({
  catalogUrl = "/masterpieces-data/catalog.json",
  storageKey = STORAGE_KEY,
  label = "Nouvelles candidates",
  introduction = "De Van Gogh aux figures rapanui.",
  imageDirectory = "/masterpieces-images",
  batchLinks,
}: Partial<ReviewOptions> = {}) {
  const [catalog, setCatalog] = useState<CandidateCatalog | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    void fetch(catalogUrl, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error("Catalogue indisponible.");
        return r.json() as Promise<unknown>;
      })
      .then((v) => setCatalog(parseCandidateCatalog(v, imageDirectory)))
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : "Chargement impossible.");
      });
    return () => controller.abort();
  }, [catalogUrl, imageDirectory]);
  if (error)
    return (
      <main className="review-loading">
        <h1>La revue ne peut pas être chargée</h1>
        <p role="alert">{error}</p>
        <a href="/review.html">Revenir à l’atelier</a>
      </main>
    );
  return catalog ? (
    <Workspace
      key={`${storageKey}:${catalog.version}`}
      catalog={catalog}
      options={{
        catalogUrl,
        storageKey,
        label,
        introduction,
        imageDirectory,
        batchLinks,
      }}
    />
  ) : (
    <main className="review-loading">
      <h1>Nouvelles candidates</h1>
      <p role="status">Chargement des œuvres et de leurs sources…</p>
    </main>
  );
}
