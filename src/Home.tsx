import { ArrowRight, Clock3, Gift, RotateCcw } from "lucide-react";
import { artworks } from "./data";
import { MAX_STOCK, type CollectionState } from "./collection";
import { Button } from "./components";
import { CARDS_PER_PACK } from "./packRules";
import BoosterVisual from "./game-presentation/boosters/BoosterVisual";
import {
  boosterGroups,
  specializedBoosterGroups,
  worksForBooster,
} from "./game-presentation/boosters/groups";

export default function Home({
  state,
  countdown,
  onChoose,
  onResume,
}: {
  state: CollectionState;
  countdown: string;
  onChoose: (id: string) => void;
  onResume: () => void;
}) {
  const universal = boosterGroups[0];
  return (
    <div className="pocket-home workspace">
      <div className="workspace-heading">
        <div>
          <h1>Pochettes</h1>
          <p>
            Un peu de curiosité. {CARDS_PER_PACK} œuvres à découvrir parmi{" "}
            {artworks.length} cartes.
          </p>
        </div>
        <div className="pocket-stock">
          <span>
            <Gift size={18} />
            <strong>
              {state.stock} / {MAX_STOCK}
            </strong>{" "}
            disponibles
          </span>
          <small>
            <Clock3 size={14} />
            {state.stock === MAX_STOCK
              ? "Stock plein · recharge toutes les 10 min"
              : `Prochaine pochette dans ${countdown}`}
          </small>
        </div>
      </div>
      {state.latest &&
        state.latest.revealed.length < state.latest.cards.length && (
          <button className="resume-opening" onClick={onResume}>
            <RotateCcw size={17} />
            Reprendre ma dernière ouverture
            <span>
              {state.latest.revealed.length} / {state.latest.cards.length}{" "}
              dévoilées
            </span>
            <ArrowRight size={17} />
          </button>
        )}
      <section
        className="pocket-feature published-universal"
        aria-labelledby="mixed-pack-title"
      >
        <div className="pocket-feature-copy">
          <p className="pocket-family">La pochette universelle</p>
          <h2 id="mixed-pack-title">
            Tout l’art.
            <br />
            <em>Toutes les découvertes.</em>
          </h2>
          <p>{universal.description}</p>
          <p>
            {artworks.length} œuvres possibles · {CARDS_PER_PACK} cartes par
            pochette
          </p>
          <Button variant="blue" onClick={() => onChoose(universal.id)}>
            Choisir la collection universelle <ArrowRight size={18} />
          </Button>
          <span className="pocket-free">Gratuite · sans inscription</span>
        </div>
        <div className="published-universal__art">
          <BoosterVisual group={universal} />
        </div>
      </section>
      <section className="pocket-universes" aria-labelledby="specialized-title">
        <div className="pocket-section-heading">
          <h2 id="specialized-title">Suivez votre curiosité.</h2>
          <p>
            Six sélections complémentaires · une seule sélection spécialisée par
            œuvre
          </p>
        </div>
        <div className="published-boosters">
          {specializedBoosterGroups.map((group) => (
            <button
              type="button"
              className="published-booster"
              key={group.id}
              onClick={() => onChoose(group.id)}
              aria-label={`Choisir ${group.title}`}
            >
              <div className="published-booster__art">
                <BoosterVisual group={group} />
              </div>
              <h3>{group.title}</h3>
              <p>{group.subtitle}</p>
              <span>
                {worksForBooster(group.id).length} œuvres possibles ·{" "}
                {CARDS_PER_PACK} cartes
              </span>
              <span className="pocket-option-action">
                Découvrir la pochette <ArrowRight size={16} />
              </span>
            </button>
          ))}
        </div>
        <p className="pocket-footnote">
          Toutes les pochettes partagent votre stock gratuit. Les probabilités
          sont consultables avant chaque ouverture. Les douze types et les
          quatre thèmes restent les filtres précis de votre collection.
        </p>
      </section>
    </div>
  );
}
