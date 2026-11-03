import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import { X, ArrowUpRight, Moon, Sun } from "lucide-react";
import { type Artwork, museumName, rarities } from "../data";
import { sampleCases } from "./samples";
import MuseumCard from "./MuseumCard";
import { cardFrameFor, labFrames, commonCardAperture } from "./frames";
import {
  frameFamilies,
  activeFrameFamilies,
  generatedFrameFamilies,
  frameFamilyLabels,
  type FrameFamily,
} from "./frameRules";
import { frameImage, frameWindowImage } from "./frameImages";
import reference from "../../docs/Carton musée des Nymphéas.png";
import "./styles.css";
import LabNavigation from "../muse-lab/LabNavigation";
import FrameFeedbackPanel from "./FrameFeedback";

function Details({ art, onClose }: { art: Artwork; onClose: () => void }) {
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
      className="lab-details"
      aria-labelledby="lab-details-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <button
        className="lab-close"
        type="button"
        onClick={onClose}
        aria-label="Fermer la fiche"
      >
        <X />
      </button>
      <span className="lab-eyebrow">
        Fiche réelle · {rarities[art.rarity].name}
      </span>
      <h2 id="lab-details-title">{art.title}</h2>
      <p>{art.artist}</p>
      <img className="lab-details__image" src={art.image} alt={art.title} />
      <p>
        {art.date} · {art.material}
      </p>
      <p>{museumName(art)}</p>
      <p className="lab-credit">{art.imageCredit}</p>
      <a href={art.source} target="_blank" rel="noreferrer">
        Notice du musée <ArrowUpRight size={15} />
      </a>
      {art.reuseUrl && (
        <a href={art.reuseUrl} target="_blank" rel="noreferrer">
          Droits et réutilisation
        </a>
      )}
    </dialog>
  );
}
function CardLab() {
  const [favorites, setFavorites] = useState<string[]>([]),
    [detail, setDetail] = useState<Artwork | null>(null),
    [dark, setDark] = useState(false);
  const [scale, setScale] = useState("comfortable");
  const [familyFilter, setFamilyFilter] = useState("all");
  const [swatchFamily, setSwatchFamily] = useState<FrameFamily>("archeologie");
  const visibleCases = sampleCases.filter(
    (s) =>
      familyFilter === "all" || cardFrameFor(s.art).family === familyFilter,
  );
  return (
    <div
      className={`card-lab ${dark ? "card-lab--dark" : ""}`}
      data-scale={scale}
    >
      <LabNavigation current="cartes" />
      <header className="lab-header">
        <a href="#planche" className="lab-brand">
          MUSE<span>Laboratoire de cartes</span>
        </a>
        <button
          className="lab-theme"
          type="button"
          onClick={() => setDark((v) => !v)}
          aria-label={dark ? "Passer au fond clair" : "Passer au fond sombre"}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
          <span>{dark ? "Fond clair" : "Fond sombre"}</span>
        </button>
      </header>
      <main>
        <section className="lab-intro">
          <div>
            <p className="lab-eyebrow">
              Essai 09 · Des motifs qui racontent leur thème
            </p>
            <h1>
              Le cadre fait
              <br />
              <em>la carte.</em>
            </h1>
            <p className="lab-lead">
              Une seule pièce : l’œuvre, son nom et ses informations habitent le
              même cadre.
            </p>
          </div>
          <aside className="lab-intent">
            <p>
              <strong>{sampleCases.length} vraies cartes.</strong>{" "}
              {generatedFrameFamilies.length} bases par type et une nouvelle
              série Japon retravaillées. Cinq finitions : fer, cuivre, argent,
              or et lapis-lazuli.
            </p>
            <p>
              Le décor suit le type, le thème ou l’origine documentée. Sa
              finition suit la rareté finale de l’œuvre, sans changer tes choix.
              Les informations restent à l’intérieur de la carte.
            </p>
            <p>
              Archéologie ne signifie pas Préhistoire : le décor à bisons est
              conservé dans les archives, mais n’est affecté à aucune œuvre.
            </p>
            <p>
              Tes six décors de référence restent identiques : Exposition
              classique, Égypte ancienne, Arts décoratifs, Fantastique
              occidental, Abstraction géométrique et Paléolithique.
            </p>
            <p>
              Les couleurs et le niveau de détail prennent exemple sur les Arts
              décoratifs. Comme en Égypte et au Paléolithique, les motifs
              évoquent directement le thème : appareils photo, poteries, métiers
              à tisser, bustes, livres ou grues japonaises. Ces scènes sont
              gravées dans les frises, jamais utilisées pour construire le
              contour du cadre.
            </p>
            <details>
              <summary>Voir ta référence des Nymphéas</summary>
              <a href={reference} target="_blank" rel="noreferrer">
                <img
                  src={reference}
                  alt="Référence fournie : Carton musée des Nymphéas, cadre autour de toute la carte"
                />
              </a>
            </details>
          </aside>
        </section>
        <section className="lab-toolbar" aria-label="Réglages de la planche">
          <div>
            <strong>Planche d’essai</strong>
            <span>Image entière · texte réel · favori dans le cadre</span>
          </div>
          <label>
            Format
            <select
              aria-label="Format des cartes"
              value={scale}
              onChange={(e) => setScale(e.target.value)}
            >
              <option value="comfortable">Confort · grandes cartes</option>
              <option value="compact">Compact · test de lisibilité</option>
            </select>
          </label>
          <label>
            Décor
            <select
              aria-label="Famille de cadre"
              value={familyFilter}
              onChange={(e) => setFamilyFilter(e.target.value)}
            >
              <option value="all">Toutes les familles</option>
              {activeFrameFamilies.map((f) => (
                <option key={f} value={f}>
                  {frameFamilyLabels[f]}
                </option>
              ))}
            </select>
          </label>
          <p>
            <span aria-live="polite">
              {favorites.length} favori{favorites.length > 1 ? "s" : ""} dans
              cet essai
            </span>{" "}
            · aucune sauvegarde du jeu modifiée
          </p>
        </section>
        <section
          className="lab-grid"
          id="planche"
          aria-label="Cartes réelles et cadres automatiques"
        >
          {visibleCases.length === 0 && (
            <p>
              Aucun exemple de cette famille dans la planche. Sa base reste
              visible dans le nuancier ci-dessous.
            </p>
          )}
          {visibleCases.map((sample, index) => (
            <div className="lab-sample" key={sample.id}>
              <p className="lab-sample__label">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span className="lab-sample__copy">
                  {sample.case}
                  <small title={cardFrameFor(sample.art).reason}>
                    {frameFamilyLabels[cardFrameFor(sample.art).family]} ·{" "}
                    {rarities[sample.art.rarity].material}
                  </small>
                </span>
              </p>
              <MuseumCard
                art={sample.art}
                favorite={favorites.includes(sample.id)}
                onOpen={() => setDetail(sample.art)}
                onFavorite={() =>
                  setFavorites((current) =>
                    current.includes(sample.id)
                      ? current.filter((id) => id !== sample.id)
                      : [...current, sample.id],
                  )
                }
              />
              <button
                type="button"
                className="lab-theme"
                onClick={() => {
                  setSwatchFamily(cardFrameFor(sample.art).family);
                  document
                    .getElementById("avis-cadres")
                    ?.scrollIntoView({ block: "start" });
                }}
              >
                Donner mon avis sur ce cadre
              </button>
            </div>
          ))}
        </section>
        <section
          className="lab-frame-catalog"
          aria-labelledby="frame-catalog-title"
        >
          <div className="lab-frame-catalog__heading">
            <div>
              <p className="lab-eyebrow">Bases neutres et décors conservés</p>
              <h2 id="frame-catalog-title">
                {frameFamilies.length} décors × {rarities.length} finitions
              </h2>
              <p>
                Comparaison des cadres seuls. Ce nuancier ne change pas la
                rareté des œuvres. {activeFrameFamilies.length} familles
                utilisables, une archivée. Les treize nouvelles familles portent
                des motifs figuratifs propres à leur thème, espacés dans une
                frise droite. Les finitions associent métal en relief et fonds
                colorés ; le lapis conserve le master bleu et or. Les six décors
                approuvés sont inchangés.
              </p>
            </div>
            <label>
              Famille
              <select
                aria-label="Famille du nuancier"
                value={swatchFamily}
                onChange={(e) => setSwatchFamily(e.target.value as FrameFamily)}
              >
                {frameFamilies.map((f) => (
                  <option key={f} value={f}>
                    {frameFamilyLabels[f]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {swatchFamily === "prehistoire" && (
            <p role="status">
              Archive uniquement : motifs pariétaux non adaptés aux jades et
              poteries néolithiques actuels. Aucune affectation automatique.
            </p>
          )}
          <div className="lab-frame-swatches">
            {rarities.map((r) => {
              const frame = labFrames[`${swatchFamily}-${r.finish}`],
                a = commonCardAperture;
              return (
                <figure
                  className="lab-frame-swatch"
                  key={frame.key}
                  data-frame-key={frame.key}
                >
                  <div className="lab-frame-swatch__card">
                    <span
                      className="museum-card__velvet"
                      aria-hidden="true"
                      style={{
                        maskImage: `url("${frameWindowImage(frame)}")`,
                        WebkitMaskImage: `url("${frameWindowImage(frame)}")`,
                      }}
                    />
                    <img
                      src={frameImage(frame)}
                      alt={`Cadre ${frameFamilyLabels[swatchFamily]}, ${r.material}`}
                      loading="lazy"
                    />
                    <div
                      className="lab-frame-swatch__inside"
                      style={
                        {
                          left: `${a.left}%`,
                          top: `${a.top}%`,
                          width: `${a.width}%`,
                          height: `${a.height}%`,
                          "--swatch-ink": r.darkInk,
                        } as CSSProperties
                      }
                    >
                      <span>{frameFamilyLabels[swatchFamily]}</span>
                      <strong>{r.material}</strong>
                      <span>{r.name}</span>
                    </div>
                  </div>
                  <figcaption>
                    {r.name} · {r.material}
                  </figcaption>
                </figure>
              );
            })}
          </div>
          <FrameFeedbackPanel family={swatchFamily} />
        </section>
        <footer className="lab-footer">
          <p>
            Prototype du laboratoire, séparé du jeu. Les œuvres ne sont pas
            recadrées, les titres et artistes ne sont pas tronqués.
          </p>
          <p>
            Treize frises figuratives propres à leur thème et leurs finitions
            côtoient les six décors approuvés conservés. Chaque ouverture est
            mesurée pour placer l’image et tous les textes à l’intérieur, sans
            aplatissement. Les sources, les images des œuvres et leurs données
            restent intactes.
          </p>
        </footer>
      </main>
      {detail && <Details art={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<CardLab />);
