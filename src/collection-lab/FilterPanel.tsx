import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { artworks, themeCatalogs, rarities } from "../data";
import { exploreArtworks, type Exploration } from "./exploration";
import Modal from "./Modal";

export default function FilterPanel({
  filters,
  onApply,
  onClose,
}: {
  filters: Exploration;
  onApply: (filters: Exploration) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(filters);
  const count = useMemo(() => exploreArtworks(artworks, draft).length, [draft]);
  return (
    <Modal
      className="cl-filters"
      labelledBy="cl-filters-title"
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onApply(draft);
        }}
      >
        <header className="cl-modal-header">
          <div>
            <p className="cl-eyebrow">Affiner le regard</p>
            <h2 id="cl-filters-title">Les filtres</h2>
          </div>
          <button
            type="button"
            className="cl-icon-button"
            aria-label="Fermer les filtres sans appliquer"
            onClick={onClose}
            autoFocus
          >
            <X aria-hidden="true" />
          </button>
        </header>
        <div className="cl-filters__body">
          <p>
            Croisez un thème et un niveau de rareté. Votre recherche et le type
            d’œuvre restent conservés.
          </p>
          <fieldset>
            <legend>Thème</legend>
            {[{ id: "all", title: "Tous les thèmes" }, ...themeCatalogs].map(
              (theme) => (
                <label className="cl-radio" key={theme.id}>
                  <input
                    type="radio"
                    name="theme"
                    value={theme.id}
                    checked={draft.theme === theme.id}
                    onChange={() => setDraft({ ...draft, theme: theme.id })}
                  />
                  <span>{theme.title}</span>
                </label>
              ),
            )}
          </fieldset>
          <label className="cl-field" htmlFor="cl-rarity">
            Rareté dans MUSE
            <select
              id="cl-rarity"
              value={draft.rarity}
              onChange={(event) =>
                setDraft({ ...draft, rarity: event.target.value })
              }
            >
              <option value="all">Tous les niveaux</option>
              {rarities.map((rarity, level) => (
                <option key={level} value={level}>
                  {rarity.name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="cl-text-button"
            type="button"
            onClick={() => setDraft({ ...draft, theme: "all", rarity: "all" })}
          >
            Effacer ces filtres
          </button>
        </div>
        <footer className="cl-filters__footer">
          <p role="status">
            {count.toLocaleString("fr-FR")} œuvre{count > 1 ? "s" : ""}{" "}
            correspondante{count > 1 ? "s" : ""}
          </p>
          <button className="cl-button cl-button--primary" type="submit">
            Afficher les résultats
          </button>
          <button className="cl-text-button" type="button" onClick={onClose}>
            Annuler
          </button>
        </footer>
      </form>
    </Modal>
  );
}
