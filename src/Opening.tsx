import { useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Landmark,
  PackageOpen,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { byId, getCatalog, type Artwork } from "./data";
import { type CollectionState } from "./collection";
import { Button, Modal, Rarity, Rates } from "./components";
import FramedArtwork from "./FramedArtwork";
import { CARDS_PER_PACK } from "./packRules";

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
  onOpen: (quick: boolean) => void;
  onReveal: (index?: number) => void;
  onClose: () => void;
  onDetail: (art: Artwork) => void;
  onCollection: () => void;
}) {
  const [quick, setQuick] = useState(false);
  const started = useRef(false);
  const catalog = getCatalog(selected);
  const result = revealed ? state.latest : null;
  const title = result
    ? `Vos ${result.cards.length} découvertes`
    : catalog?.title || "Écho de Silence";
  return (
    <Modal
      title={title}
      className={`pack-opening ${result ? "pack-opening-results" : ""}`}
      onClose={onClose}
    >
      {result ? (
        <>
          <p className="opening-introduction">
            Votre tirage est sauvegardé. Touchez chaque carte pour la découvrir.
          </p>
          <div className="discovery-cards">
            {result.cards.map((card, index) => {
              const art = byId[card.id];
              const visible = result.revealed.includes(index);
              return (
                <article
                  className={`discovery-card ${visible ? "discovery-visible" : ""}`}
                  key={`${card.id}-${index}`}
                >
                  <button
                    className="discovery-face"
                    onClick={() => (visible ? onDetail(art) : onReveal(index))}
                    aria-label={
                      visible
                        ? `Lire l’histoire de ${art.title}`
                        : `Révéler la carte ${index + 1}`
                    }
                  >
                    {visible ? (
                      <FramedArtwork art={art} eager />
                    ) : (
                      <span className="discovery-back">
                        <Landmark size={36} />
                        <strong>MUSE</strong>
                        <span>Une œuvre vous attend</span>
                        <Sparkles size={20} />
                        <span>Révéler la carte {index + 1}</span>
                      </span>
                    )}
                  </button>
                  {visible ? (
                    <div className="discovery-description">
                      <Rarity level={art.rarity} plain />
                      <h3>{art.title}</h3>
                      <p>{art.artist}</p>
                      <span className="discovery-new">
                        {card.isNew
                          ? "Nouvelle découverte"
                          : "Exemplaire supplémentaire"}
                      </span>
                      <button
                        className="text-link"
                        onClick={() => onDetail(art)}
                      >
                        Lire son histoire <ArrowRight size={15} />
                      </button>
                    </div>
                  ) : (
                    <p className="discovery-hidden-label">
                      Carte {index + 1} sur {result.cards.length}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
          <div className="opening-result-actions">
            {result.revealed.length < result.cards.length && (
              <Button variant="blue" onClick={() => onReveal()}>
                <Sparkles size={17} />
                Tout révéler
              </Button>
            )}
            <Button onClick={onCollection}>
              Voir ma collection <ArrowRight size={17} />
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <RotateCcw size={16} />
              Retour aux pochettes
            </Button>
          </div>
          <p className="opening-saved">
            <Check size={16} />
            Les {result.cards.length} cartes sont déjà dans votre collection,
            même si vous fermez cette fenêtre.
          </p>
        </>
      ) : (
        <div className="opening-preview">
          <img
            src="/assets/booster.png"
            width={1024}
            height={1536}
            alt="Pochette MUSE scellée, bordeaux et or"
          />
          <div className="opening-preview-copy">
            <p className="pocket-family">
              {catalog?.family || "Tous les styles"}
            </p>
            <p>
              {catalog?.description ||
                `Peinture, objets précieux, Antiquité et mythes : ${CARDS_PER_PACK} cartes choisies parmi tous les univers de MUSE.`}
            </p>
            <p className="opening-cost">
              <PackageOpen size={18} />
              {CARDS_PER_PACK} cartes · 1 pochette de votre stock
            </p>
            <label className="quick-opening">
              <input
                type="checkbox"
                checked={quick}
                onChange={(e) => setQuick(e.target.checked)}
              />
              Révéler toutes les cartes immédiatement
            </label>
            <Button
              variant="blue"
              disabled={!state.stock}
              onClick={() => {
                if (started.current) return;
                started.current = true;
                onOpen(quick);
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
