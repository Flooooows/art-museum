import { createRoot } from "react-dom/client";
import { ArrowUpRight } from "lucide-react";
import LabNavigation from "./LabNavigation";
import BoosterVisual from "../booster-lab/BoosterVisual";
import { boosterGroups } from "../booster-lab/groups";
import { byId, artworks } from "../data";
import frame from "../card-lab/assets/refined-frames/beaux-arts-dore.webp";
import cardWindow from "../card-lab/assets/refined-frames/beaux-arts-dore-window.webp";
import "../booster-lab/styles.css";
import "./styles.css";

function MuseLab() {
  return (
    <div className="muse-portal">
      <LabNavigation current="accueil" />
      <main>
        <header className="portal-heading">
          <p className="portal-eyebrow">MUSE · Le laboratoire</p>
          <h1>
            Trois essais.
            <br />
            <em>Une même collection.</em>
          </h1>
          <p>
            Les cartes, les pochettes et le rituel d’ouverture, réunis dans un
            espace de travail séparé du jeu.
          </p>
          <span>
            {artworks.length.toLocaleString("fr-FR")} œuvres réelles · aucune
            acquisition enregistrée
          </span>
        </header>
        <section
          className="portal-grid"
          aria-label="Les trois espaces du laboratoire"
        >
          <a className="portal-entry" href="/card-lab.html">
            <div
              className="portal-scene portal-scene--cards"
              aria-hidden="true"
            >
              <div className="portal-card">
                <span
                  className="portal-card__velvet"
                  style={{
                    maskImage: `url("${cardWindow}")`,
                    WebkitMaskImage: `url("${cardWindow}")`,
                  }}
                />
                <img
                  className="portal-card__art"
                  src={byId["cma-136510"].image}
                  alt=""
                />
                <span className="portal-card__title">
                  {byId["cma-136510"].title}
                  <small>{byId["cma-136510"].artist}</small>
                </span>
                <img className="portal-card__frame" src={frame} alt="" />
              </div>
            </div>
            <div className="portal-entry__copy">
              <span>01 · Les cartes</span>
              <h2>Le cadre fait la carte.</h2>
              <p>
                21 cas réels, 95 variantes de cadre et des affectations
                corrigées. Tout reste à l’intérieur du contour.
              </p>
              <strong>
                Explorer les cartes <ArrowUpRight size={18} />
              </strong>
            </div>
          </a>
          <a className="portal-entry" href="/booster-lab.html">
            <div
              className="portal-scene portal-scene--packs"
              aria-hidden="true"
            >
              <BoosterVisual group={boosterGroups[0]} />
            </div>
            <div className="portal-entry__copy">
              <span>02 · Les boosters</span>
              <h2>Sept portes d’entrée.</h2>
              <p>
                Une collection universelle et six sélections spécialisées,
                chacune avec son propre visuel de pochette.
              </p>
              <strong>
                Comparer les boosters <ArrowUpRight size={18} />
              </strong>
            </div>
          </a>
          <a className="portal-entry" href="/opening-lab.html">
            <div
              className="portal-scene portal-scene--opening"
              aria-hidden="true"
            >
              <div className="portal-backs">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <span className="portal-opening-label">L’ART SE DÉVOILE</span>
            </div>
            <div className="portal-entry__copy">
              <span>03 · L’ouverture</span>
              <h2>Un petit rituel.</h2>
              <p>
                Tester l’animation, les ambiances et le rythme, puis révéler
                cinq œuvres de démonstration.
              </p>
              <strong>
                Essayer l’ouverture <ArrowUpRight size={18} />
              </strong>
            </div>
          </a>
        </section>
        <aside className="portal-note">
          <strong>Un laboratoire, pas une deuxième collection.</strong>
          <p>
            Les exemples viennent du catalogue réel. Les sélections et
            animations ne consomment aucun stock et ne modifient aucune
            sauvegarde. Le jeu MUSE reste indépendant.
          </p>
        </aside>
      </main>
      <footer>
        Projet Firebase dédié · MUSE Lab · Site d’essai, non indexé
      </footer>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<MuseLab />);
