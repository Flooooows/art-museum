import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, PackageOpen, RotateCcw } from "lucide-react";
import { byId, type Artwork } from "./data";
import { type CollectionState } from "./collection";
import { Button, Modal, Rates } from "./components";
import { CARDS_PER_PACK } from "./packRules";
import { packTitle, packVisualGroup, packWorks } from "./packSelection";
import BoosterVisual from "./game-presentation/boosters/BoosterVisual";
import OpeningScene from "./game-presentation/opening/OpeningScene";

export function PackOpening({
  selected,
  state,
  countdown,
  revealed,
  onOpen,
  onReveal,
  onClose,
  onDetail,
  onCollection,
}: {
  selected: string;
  state: CollectionState;
  countdown: string;
  revealed: boolean;
  onOpen: (quick: boolean) => boolean;
  onReveal: (index?: number) => void;
  onClose: () => void;
  onDetail: (art: Artwork) => void;
  onCollection: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const mode = showAll ? "board" : "sequential";
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const started = useRef(false);
  const result = revealed ? state.latest : null;
  const group = packVisualGroup(selected);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  return (
    <Modal
      title={
        result ? `Vos ${result.cards.length} découvertes` : packTitle(selected)
      }
      className={`pack-opening published-opening ${result ? "pack-opening-results" : ""}`}
      onClose={onClose}
    >
      {result ? (
        <>
          <p className="opening-introduction">
            Votre tirage est sauvegardé. Découvrez les cartes une par une, ou
            utilisez « Tout révéler » sous les cartes.
          </p>
          <OpeningScene
            key={`${result.date}-${mode}-${reduced}`}
            group={group}
            works={result.cards.map((c) => byId[c.id])}
            mood="museum"
            speed={1.6}
            reduced={reduced}
            mode={mode}
            initialVisible={result.revealed}
            onReveal={onReveal}
            onRevealAll={() => {
              onReveal();
              setShowAll(true);
            }}
            instant={showAll}
          />
          <div className="opening-result-actions">
            <Button onClick={onCollection}>
              Voir ma collection <ArrowRight size={17} />
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <RotateCcw size={16} />
              Retour aux pochettes
            </Button>
          </div>
          <ul className="published-discoveries" aria-label="Œuvres dévoilées">
            {result.cards.map(
              (card, index) =>
                result.revealed.includes(index) && (
                  <li key={`${card.id}-${index}`}>
                    <button
                      type="button"
                      onClick={() => onDetail(byId[card.id])}
                    >
                      {byId[card.id].title}
                      <span>
                        {card.isNew
                          ? "Nouvelle découverte"
                          : "Exemplaire supplémentaire"}{" "}
                        · Lire son histoire <ArrowRight size={14} />
                      </span>
                    </button>
                  </li>
                ),
            )}
          </ul>
          <p className="opening-saved">
            <Check size={16} />
            Les {result.cards.length} cartes sont déjà dans votre collection,
            même si vous fermez cette fenêtre.
          </p>
        </>
      ) : (
        <div className="opening-preview">
          <div className="published-opening__pack">
            <BoosterVisual group={group} />
          </div>
          <div className="opening-preview-copy">
            <p className="pocket-family">{packTitle(selected)}</p>
            <p>{group.description}</p>
            <p>{packWorks(selected).length} œuvres possibles.</p>
            <p className="opening-cost">
              <PackageOpen size={18} />
              {CARDS_PER_PACK} cartes · 1 pochette de votre stock
            </p>
            <Button
              variant="blue"
              disabled={!state.stock}
              onClick={() => {
                if (started.current) return;
                started.current = true;
                if (!onOpen(false)) started.current = false;
              }}
            >
              {state.stock
                ? "Ouvrir la pochette"
                : `Prochaine pochette dans ${countdown}`}
              <ArrowRight size={18} />
            </Button>
            <p className="opening-stock-note">
              {state.stock} pochette{state.stock > 1 ? "s" : ""} disponible
              {state.stock > 1 ? "s" : ""} · gratuit
            </p>
            <details className="opening-probabilities">
              <summary>Contenu et probabilités</summary>
              <Rates catalog={selected} />
            </details>
          </div>
        </div>
      )}
    </Modal>
  );
}
