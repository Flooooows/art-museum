import { ArrowRight, ArrowLeftRight, Layers, Search } from "lucide-react";
import { useState } from "react";
import { artworks, type Artwork } from "./data";
import { duplicateCount, type CollectionState } from "./collection";
import { Button, Rarity } from "./components";

export default function Market({
  state,
  onDetail,
  onOpen,
}: {
  state: CollectionState;
  onDetail: (art: Artwork) => void;
  onOpen: () => void;
}) {
  const [query, setQuery] = useState("");
  const duplicates = artworks.filter((art) => state.counts[art.id] > 1);
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("fr");
  const filtered = duplicates.filter((art) =>
    normalize(`${art.title} ${art.artist}`).includes(normalize(query.trim())),
  );
  return (
    <div className="workspace market-page">
      <div className="workspace-heading">
        <div>
          <h1>Marché</h1>
          <p>Les rencontres font aussi les belles collections.</p>
        </div>
        <span className="availability-note">
          <ArrowLeftRight size={17} />
          Échanges bientôt disponibles
        </span>
      </div>
      <div className="market-notice">
        <ArrowLeftRight size={30} />
        <div>
          <h2>Une seconde histoire pour vos doublons</h2>
          <p>
            Le marché accueillera les échanges entre collectionneurs. Pour le
            moment, retrouvez ici vos exemplaires supplémentaires : aucune vente
            ni aucun échange n’est encore possible.
          </p>
        </div>
      </div>
      <section aria-labelledby="duplicates-title">
        <div className="pocket-section-heading">
          <h2 id="duplicates-title">
            Vos doublons{" "}
            <span className="section-count">{duplicateCount(state)}</span>
          </h2>
          <p>Votre premier exemplaire reste dans la collection.</p>
        </div>
        {duplicates.length ? (
          <>
            <label className="market-search">
              <Search size={18} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher parmi vos doublons…"
                aria-label="Rechercher parmi vos doublons"
              />
            </label>
            <div className="duplicate-list">
              {filtered.map((art) => (
                <button
                  className="duplicate-row"
                  key={art.id}
                  onClick={() => onDetail(art)}
                >
                  <img src={art.image} alt="" />
                  <span>
                    <Rarity level={art.rarity} plain />
                    <strong>{art.title}</strong>
                    <small>{art.artist}</small>
                  </span>
                  <span className="duplicate-quantity">
                    {state.counts[art.id] - 1} en plus
                    <small>{state.counts[art.id]} au total</small>
                  </span>
                  <ArrowRight size={18} />
                </button>
              ))}
            </div>
            {!filtered.length && (
              <p className="market-no-results" role="status">
                Aucun doublon ne correspond à cette recherche.
              </p>
            )}
          </>
        ) : (
          <div className="workspace-empty">
            <Layers size={34} />
            <h3>Chaque découverte est encore unique.</h3>
            <p>
              Vos doublons apparaîtront ici au fil des ouvertures. Ils restent
              conservés dans votre inventaire.
            </p>
            <Button onClick={onOpen}>
              Découvrir les pochettes
              <ArrowRight size={17} />
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
