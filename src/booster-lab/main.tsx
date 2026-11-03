import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import { ArrowDown, ArrowUpRight, Moon, Sun, X } from "lucide-react";
import {
  artworks,
  getCatalog,
  themeCatalogs,
  catalogSize,
  typeCatalogs,
  museumName,
} from "../data";
import { CARDS_PER_PACK } from "../packRules";
import BoosterVisual from "./BoosterVisual";
import {
  boosterGroups,
  specializedBoosterGroups,
  worksForBooster,
  previewWorksFor,
  type BoosterGroup,
} from "./groups";
import "./styles.css";
import LabNavigation from "../muse-lab/LabNavigation";

function Selection({
  group,
  onClose,
}: {
  group: BoosterGroup;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.showModal();
    return () => {
      ref.current?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="booster-selection"
      aria-labelledby="selection-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <button
        type="button"
        className="icon-button selection-close"
        onClick={onClose}
        aria-label="Fermer la sélection"
      >
        <X size={22} />
      </button>
      <p className="eyebrow">
        Aperçu du regroupement · {worksForBooster(group.id).length} œuvres
      </p>
      <h2 id="selection-title">{group.title}</h2>
      <p>{group.description}</p>
      <p className="selection-note">
        Exemples réels de la sélection, pas un tirage. Aucune carte acquise,
        aucun stock consommé.
      </p>
      <div className="selection-works">
        {previewWorksFor(group.id).map((art) => (
          <figure key={art.id} data-work-id={art.id}>
            <div>
              <img src={art.image} alt={art.title} loading="eager" />
            </div>
            <figcaption>
              <strong>{art.title}</strong>
              <span>{art.artist}</span>
              <small>
                {getCatalog(art.catalog)?.title} · {museumName(art)}
              </small>
              <details>
                <summary>Crédit et source</summary>
                <p>{art.imageCredit}</p>
                <a href={art.source} target="_blank" rel="noreferrer">
                  Notice du musée <ArrowUpRight size={13} />
                </a>
              </details>
            </figcaption>
          </figure>
        ))}
      </div>
    </dialog>
  );
}

function BoosterLab() {
  const [dark, setDark] = useState(false),
    [selection, setSelection] = useState<BoosterGroup | null>(null);
  const universal = boosterGroups[0];
  return (
    <div className={`booster-lab${dark ? " booster-lab--dark" : ""}`}>
      <LabNavigation current="boosters" />
      <header className="booster-header">
        <a className="booster-brand" href="#collection">
          MUSE<span>Laboratoire des pochettes</span>
        </a>
        <div>
          <span className="local-badge">Site d’essai · hors du jeu</span>
          <button
            type="button"
            className="icon-button"
            onClick={() => setDark((v) => !v)}
            aria-label={dark ? "Passer au fond clair" : "Passer au fond sombre"}
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>
      <main id="collection">
        <section className="booster-intro" aria-labelledby="intro-title">
          <div>
            <p className="eyebrow">Étude 01 · Une collection, sept pochettes</p>
            <h1 id="intro-title">
              L’art se découvre.
              <br />
              <em>À chacun sa porte d’entrée.</em>
            </h1>
          </div>
          <div className="intro-aside">
            <p>
              Une pochette pour tout explorer.
              <br />
              Six pour suivre votre curiosité.
            </p>
            <span>
              {artworks.length.toLocaleString("fr-FR")} œuvres ·{" "}
              {typeCatalogs.length} types préservés
            </span>
            <a href="#specialisees">
              Voir les six sélections <ArrowDown size={16} />
            </a>
          </div>
        </section>
        <section
          className="universal-feature"
          aria-labelledby="universal-title"
          data-group-id={universal.id}
        >
          <div className="universal-copy">
            <p className="eyebrow">La pochette universelle</p>
            <h2 id="universal-title">
              Tout l’art.
              <br />
              <em>Toutes les découvertes.</em>
            </h2>
            <p>{universal.description}</p>
            <div className="group-meta">
              <span>
                {worksForBooster(universal.id).length.toLocaleString("fr-FR")}{" "}
                œuvres possibles
              </span>
              <span>{CARDS_PER_PACK} cartes par pochette</span>
            </div>
            <button
              type="button"
              className="explore-button"
              onClick={() => setSelection(universal)}
            >
              Explorer la collection universelle <ArrowUpRight size={18} />
            </button>
            <small>
              Prototype visuel : ce bouton consulte la sélection, sans ouvrir de
              pochette.
            </small>
          </div>
          <div className="universal-art">
            <span className="universal-orbit" aria-hidden="true" />
            <BoosterVisual group={universal} />
          </div>
        </section>
        <section
          className="specialized-section"
          id="specialisees"
          aria-labelledby="specialized-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">Six façons d’explorer</p>
              <h2 id="specialized-title">Suivez votre curiosité.</h2>
            </div>
            <p>
              Des regroupements complémentaires.
              <br />
              Chaque œuvre appartient à une seule sélection spécialisée.
            </p>
          </div>
          <div className="booster-grid">
            {specializedBoosterGroups.map((group, index) => (
              <article
                className="booster-tile"
                key={group.id}
                data-group-id={group.id}
                style={{ "--group-color": group.color } as CSSProperties}
              >
                <div className="tile-topline">
                  <span>ÉDITION {String(index + 1).padStart(2, "0")}</span>
                  <span>{worksForBooster(group.id).length} œuvres</span>
                </div>
                <div className="tile-art">
                  <BoosterVisual group={group} />
                </div>
                <div className="tile-copy">
                  <h3>{group.title}</h3>
                  <p className="tile-subtitle">{group.subtitle}</p>
                  <p className="tile-types">
                    {group.types
                      .map((type) => getCatalog(type)?.title)
                      .join(" · ")}
                  </p>
                  <button
                    type="button"
                    className="tile-explore"
                    onClick={() => setSelection(group)}
                    aria-label={`Explorer ${group.title}`}
                  >
                    Explorer la sélection <ArrowUpRight size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          className="booster-organization"
          aria-labelledby="organization-title"
        >
          <div>
            <p className="eyebrow">Moins de pochettes, autant de précision</p>
            <h2 id="organization-title">
              Sept visuels.
              <br />
              Pas cinquante catégories.
            </h2>
            <p>
              Les douze types restent le classement précis des œuvres. Ces six
              regroupements sont une proposition pour les pochettes, pas une
              réécriture du catalogue.
            </p>
          </div>
          <div>
            <h3>Et les thèmes ?</h3>
            <p>
              Ils restent transversaux : des sélections qui peuvent se recouper,
              pas quatre nouveaux emballages permanents.
            </p>
            <ul className="theme-list">
              {themeCatalogs.map((theme) => (
                <li key={theme.id}>
                  <span>{theme.title}</span>
                  <span>{catalogSize(theme.id)} œuvres</span>
                </li>
              ))}
            </ul>
            <p className="organization-note">
              La couleur identifie la pochette, jamais la rareté des cartes
              qu’elle contient. Aucun changement des probabilités actuelles.
            </p>
          </div>
        </section>
      </main>
      <footer className="booster-footer">
        <span>MUSE · Laboratoire des pochettes</span>
        <p>
          Sept illustrations générées distinctes. Textes et effectifs réels
          ajoutés dans l’interface. Le site publié, les tirages, les raretés et
          vos sauvegardes restent inchangés.
        </p>
        <a href="/card-lab.html">
          Revenir au lab des cartes <ArrowUpRight size={14} />
        </a>
      </footer>
      {selection && (
        <Selection group={selection} onClose={() => setSelection(null)} />
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<BoosterLab />);
