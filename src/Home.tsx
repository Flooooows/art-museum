import { ArrowRight, Clock3, Gift, RotateCcw } from "lucide-react";
import { catalogs } from "./data";
import { MAX_STOCK, type CollectionState } from "./collection";
import { Button, Pack } from "./components";
import { CARDS_PER_PACK } from "./packRules";

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
  return (
    <div className="pocket-home workspace">
      <div className="workspace-heading">
        <div>
          <h1>Pochettes</h1>
          <p>Un peu de curiosité. {CARDS_PER_PACK} œuvres à découvrir.</p>
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
            <RotateCcw size={17} /> Reprendre ma dernière ouverture
            <span>
              {state.latest.revealed.length} / {state.latest.cards.length}{" "}
              dévoilées
            </span>
            <ArrowRight size={17} />
          </button>
        )}

      <section className="pocket-feature" aria-labelledby="mixed-pack-title">
        <div className="pocket-feature-copy">
          <h2 id="mixed-pack-title">Écho de Silence</h2>
          <p className="pocket-family">
            Tous les styles · {CARDS_PER_PACK} cartes
          </p>
          <p>
            De la peinture aux trésors de l’Antiquité, laissez toute l’histoire
            de l’art vous surprendre.
          </p>
          <Button
            variant="blue"
            onClick={() => onChoose("all")}
            disabled={!state.stock}
          >
            {state.stock
              ? "Choisir la pochette tous styles"
              : "En attente de la recharge"}
            <ArrowRight size={18} />
          </Button>
          <span className="pocket-free">Gratuite · sans inscription</span>
        </div>
        <img
          className="pocket-main-image"
          src="/assets/booster.png"
          width={1024}
          height={1536}
          alt="Pochette MUSE bordeaux et or, buste antique et bleu outremer"
        />
      </section>

      <section className="pocket-universes" aria-labelledby="universes-title">
        <div className="pocket-section-heading">
          <h2 id="universes-title">Ou explorez un univers</h2>
          <p>Une envie plus précise ?</p>
        </div>
        <div className="pocket-options">
          {catalogs.map((catalog) => (
            <button
              className="pocket-option"
              key={catalog.id}
              onClick={() => onChoose(catalog.id)}
            >
              <div className="pocket-option-art" aria-hidden="true">
                <Pack catalog={catalog} />
              </div>
              <h3>{catalog.title}</h3>
              <span className="pocket-option-family">
                {catalog.family === "Art fantastique et mystérieux"
                  ? "Imaginaire"
                  : catalog.family}
              </span>
              <span className="pocket-option-action">
                Découvrir la pochette <ArrowRight size={16} />
              </span>
            </button>
          ))}
        </div>
        <p className="pocket-footnote">
          Toutes les pochettes partagent votre stock gratuit. Les probabilités
          sont consultables avant chaque ouverture.
        </p>
      </section>
    </div>
  );
}
