import {
  StrictMode,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createRoot } from "react-dom/client";
import { gsap } from "gsap";
import { rarities } from "../data";
import {
  ArrowLeft,
  ArrowRight,
  Landmark,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import BoosterVisual from "../booster-lab/BoosterVisual";
import { boosterGroups, type BoosterGroupId } from "../booster-lab/groups";
import "../booster-lab/styles.css";
import "./styles.css";
import LabNavigation from "../muse-lab/LabNavigation";
import {
  ambienceForCards,
  nextRevealIndex,
  openingWorksFor,
  openingScenarioAvailable,
  type MaximumRarity,
} from "./rules";

type Phase = "ready" | "opening" | "cards";
type Mood = "museum" | "magic";
type RevealMode = "sequential" | "board";

function OpeningStudy({
  groupId,
  mood,
  speed,
  reduced,
  mode,
  maximum,
}: {
  groupId: BoosterGroupId;
  mood: Mood;
  speed: number;
  reduced: boolean;
  mode: RevealMode;
  maximum: MaximumRarity;
}) {
  const root = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const revealTimeline = useRef<gsap.core.Timeline | null>(null);
  const revealLock = useRef(false);
  const revealedCount = useRef(0);
  const primaryAction = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<Element | null | undefined>(undefined);
  const pendingCopyFocus = useRef<number | null>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [visible, setVisible] = useState<number[]>([]);
  const [active, setActive] = useState(0);
  const [revealing, setRevealing] = useState(false);
  const group = boosterGroups.find((item) => item.id === groupId)!;
  const works = openingWorksFor(groupId, maximum);
  const ambience = ambienceForCards(works);
  const sequential = mode === "sequential";
  const complete = visible.length === works.length;

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.set(".study-card", {
        autoAlpha: 0,
        x: 0,
        y: 100,
        rotation: -8,
        xPercent: sequential ? -50 : 0,
        yPercent: sequential ? -50 : 0,
      });
      gsap.set(".study-glow, .study-dust", { autoAlpha: 0 });
      if (ambience.level === 4)
        gsap.set(".study-masterpiece-burst", { autoAlpha: 0, scale: 0.35 });
      if (!reduced) {
        gsap.to(".study-pack", {
          y: -9,
          rotation: 1.2,
          duration: 2.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, root);
    const element = root.current;
    return () => {
      timeline.current?.kill();
      revealTimeline.current?.kill();
      timeline.current = null;
      if (element) gsap.killTweensOf(element.querySelectorAll("*"));
      context.revert();
    };
  }, [reduced, sequential]);

  useLayoutEffect(() => {
    if (revealing || pendingFocus.current === undefined) return;
    if (
      document.activeElement === pendingFocus.current ||
      document.activeElement === document.body
    )
      primaryAction.current?.focus({ preventScroll: true });
    pendingFocus.current = undefined;
  }, [revealing, visible]);

  useLayoutEffect(() => {
    if (pendingCopyFocus.current === null) return;
    root.current
      ?.querySelector<HTMLElement>(
        `[data-card-index="${pendingCopyFocus.current}"] .study-card-copy`,
      )
      ?.focus({ preventScroll: true });
    pendingCopyFocus.current = null;
  }, [visible]);

  function open() {
    if (phase !== "ready" || !root.current) return;
    setPhase("opening");
    const scope = gsap.utils.selector(root.current);
    const enteringCards = sequential
      ? scope(".study-card").slice(0, 1)
      : scope(".study-card");
    gsap.killTweensOf(scope(".study-pack"));
    const tl = gsap.timeline({ onComplete: () => setPhase("cards") });
    timeline.current = tl;
    tl.timeScale(speed);
    if (reduced) {
      tl.to(scope(".study-pack"), { autoAlpha: 0, duration: 0.12 })
        .set(scope(".study-cards"), { zIndex: 5 })
        .to(enteringCards, {
          autoAlpha: 1,
          y: 0,
          rotation: 0,
          duration: 0.12,
        });
      return;
    }
    if (ambience.level === 4) {
      tl.to(scope(".study-masterpiece-effects"), {
        scale: 1.06,
        duration: 0.65,
        ease: "power2.out",
      }).to(
        scope(".study-pack"),
        { y: -14, scale: 1.1, duration: 0.65, ease: "power2.inOut" },
        "<",
      );
    }
    tl.to(scope(".study-pack"), {
      y: 0,
      rotation: 0,
      scale: 1.06,
      duration: 0.45,
    })
      .to(scope(".study-pack"), {
        x: 4,
        rotation: 1.5,
        duration: 0.065,
        repeat: 9,
        yoyo: true,
      })
      .to(
        scope(".study-glow"),
        {
          autoAlpha: mood === "magic" ? 0.85 : 0.35,
          scale: 1.25,
          duration: 0.6,
        },
        "<",
      )
      .to(scope(".study-seal"), {
        x: 65,
        y: -90,
        rotation: 19,
        autoAlpha: 0,
        duration: 0.65,
        ease: "power2.in",
      })
      .to(
        scope(".study-dust"),
        { autoAlpha: 1, y: -75, scale: 1.3, duration: 0.7, stagger: 0.025 },
        "<",
      )
      .to(
        scope(".study-pack"),
        {
          y: 150,
          scale: 0.82,
          autoAlpha: 0,
          duration: 0.65,
          ease: "power2.in",
        },
        "-=0.2",
      )
      .set(scope(".study-cards"), { zIndex: 5 })
      .to(
        enteringCards,
        {
          autoAlpha: 1,
          y: 0,
          rotation: 0,
          duration: 0.8,
          stagger: 0.13,
          ease: "back.out(1.2)",
        },
        "-=0.3",
      )
      .to(
        scope(".study-glow, .study-dust"),
        { autoAlpha: 0, duration: 0.7 },
        "-=0.4",
      );
  }

  function reveal(index: number) {
    if (phase !== "cards" || visible.includes(index)) return;
    pendingCopyFocus.current = index;
    setVisible((previous) => [...previous, index]);
  }

  function revealNext() {
    if (phase !== "cards" || !root.current) return;
    const index = nextRevealIndex(
      revealedCount.current,
      works.length,
      revealLock.current,
    );
    if (index === null) return;
    revealLock.current = true;
    setRevealing(true);
    const focused = document.activeElement;
    const restoreFocus =
      focused === primaryAction.current ||
      focused?.classList.contains("study-card-activate");
    const cards = root.current.querySelectorAll<HTMLElement>(".study-card");
    const markRevealed = () => {
      revealedCount.current = index + 1;
      setVisible(Array.from({ length: index + 1 }, (_, i) => i));
    };
    const finish = () => {
      revealLock.current = false;
      if (restoreFocus) pendingFocus.current = focused;
      setRevealing(false);
    };
    if (reduced) {
      gsap.set(cards, { autoAlpha: 0 });
      gsap.set(cards[index], { autoAlpha: 1, x: 0, y: 0, rotation: 0 });
      gsap.set(cards[index].querySelector(".study-card-turn"), {
        rotationY: 180,
      });
      setActive(index);
      markRevealed();
      finish();
      return;
    }
    const tl = gsap.timeline({ onComplete: finish });
    revealTimeline.current = tl;
    tl.timeScale(speed);
    if (index > 0) {
      tl.to(cards[index - 1], {
        autoAlpha: 0,
        x: -95,
        y: -8,
        rotation: -7,
        duration: 0.22,
        ease: "power2.in",
      })
        .call(() => setActive(index))
        .fromTo(
          cards[index],
          { autoAlpha: 0, x: 85, y: 15, rotation: 6 },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.42,
            ease: "power2.out",
          },
        );
    }
    tl.call(markRevealed).fromTo(
      cards[index].querySelector(".study-card-turn"),
      { rotationY: 0 },
      { rotationY: 180, duration: 0.7, ease: "power2.inOut" },
    );
    const burst = root.current.querySelector(".study-masterpiece-burst");
    if (works[index].rarity === 4 && burst) {
      tl.fromTo(
        burst,
        { autoAlpha: 0, scale: 0.35 },
        { autoAlpha: 0.55, scale: 1.2, duration: 0.4 },
        "-=.3",
      ).to(burst, { autoAlpha: 0, scale: 1.7, duration: 0.55 });
    }
  }

  return (
    <div
      className={`opening-study ${sequential ? "opening-study--sequential" : ""} ${reduced ? "opening-study--reduced" : ""}`}
      ref={root}
      data-reveal-mode={mode}
      data-maximum-rarity={maximum}
      style={
        {
          "--ambient-base": ambience.base,
          "--ambient-mid": ambience.mid,
          "--ambient-glow": ambience.glow,
          "--ambient-light": ambience.light,
        } as CSSProperties
      }
    >
      <div
        className={`study-stage study-stage--${mood}`}
        data-rarity-level={ambience.level}
        data-finish={ambience.rarity.finish}
        data-phase={phase}
      >
        <span className="stage-caption">
          <span>{group.title}</span>
          <span>
            Ambiance {ambience.rarity.material} · {ambience.rarity.name}
          </span>
        </span>
        <div className="study-rarity-shine" aria-hidden="true" />
        {ambience.level === 4 && (
          <>
            <div className="study-masterpiece-effects" aria-hidden="true">
              <span className="study-masterpiece-halo" />
              <span className="study-masterpiece-rays" />
              <span className="study-masterpiece-corona" />
              {Array.from({ length: 18 }, (_, i) => (
                <span
                  key={i}
                  className="study-masterpiece-star"
                  style={{
                    left: `${9 + ((i * 29) % 82)}%`,
                    top: `${13 + ((i * 17) % 68)}%`,
                    animationDelay: `${i * 0.23}s`,
                  }}
                >
                  {i % 3 === 0 ? "✦" : "·"}
                </span>
              ))}
              <span className="study-masterpiece-burst" />
            </div>
            {phase !== "cards" && (
              <span className="study-masterpiece-label">PIÈCE MAÎTRESSE</span>
            )}
          </>
        )}
        <div className="study-ring" aria-hidden="true" />
        <div className="study-glow" aria-hidden="true" />
        {Array.from({ length: 16 }, (_, index) => (
          <span
            key={index}
            className="study-dust"
            aria-hidden="true"
            style={{
              left: `${20 + ((index * 17) % 60)}%`,
              top: `${30 + ((index * 13) % 35)}%`,
            }}
          >
            ✦
          </span>
        ))}
        <div className="study-pack" aria-hidden="true">
          <div className="study-pack-body">
            <BoosterVisual group={group} />
          </div>
          <div className="study-seal">
            <BoosterVisual group={group} />
          </div>
        </div>
        <div
          className="study-cards"
          role="group"
          aria-label="Les cinq cartes de démonstration"
        >
          {works.map((art, index) => (
            <div
              key={art.id}
              className={`study-card ${visible.includes(index) ? "is-revealed" : ""}`}
              data-card-index={index}
              data-card-rarity={art.rarity}
              aria-hidden={sequential && index !== active ? true : undefined}
              style={
                {
                  "--study-card-color": rarities[art.rarity].color,
                  "--study-card-ink": rarities[art.rarity].badgeInk,
                } as CSSProperties
              }
            >
              <span className="study-card-turn">
                <span className="study-card-back" aria-hidden="true">
                  <Landmark size={30} />
                  <strong>MUSE</strong>
                  <span>L’ART SE DÉVOILE</span>
                  <small>0{index + 1}</small>
                </span>
                <span
                  className="study-card-front"
                  aria-hidden={!visible.includes(index)}
                >
                  <img src={art.image} alt="" />
                  <span
                    className="study-card-copy"
                    role="group"
                    aria-label={`Informations de la carte ${index + 1}`}
                    tabIndex={
                      visible.includes(index) &&
                      (!sequential || index === active)
                        ? 0
                        : -1
                    }
                  >
                    <small>{rarities[art.rarity].name}</small>
                    <strong>{art.title}</strong>
                    <span>{art.artist}</span>
                  </span>
                </span>
              </span>
              <button
                type="button"
                className="study-card-activate"
                hidden={!sequential && visible.includes(index)}
                disabled={
                  phase !== "cards" ||
                  (sequential && (index !== active || revealing || complete))
                }
                onClick={() => (sequential ? revealNext() : reveal(index))}
                aria-label={
                  visible.includes(index)
                    ? `${art.title}, ${art.artist}${sequential && !complete ? ". Révéler la carte suivante" : ""}`
                    : `Révéler la carte ${index + 1}`
                }
                aria-pressed={visible.includes(index)}
              />
            </div>
          ))}
        </div>
        {sequential && phase === "cards" && (
          <ol
            className="study-progress"
            aria-label="Progression de la découverte"
          >
            {works.map((art, index) => (
              <li
                key={art.id}
                className={visible.includes(index) ? "is-seen" : ""}
                aria-current={index === active ? "step" : undefined}
                aria-label={`Carte ${index + 1}${visible.includes(index) ? " dévoilée" : " à découvrir"}`}
              >
                {index + 1}
              </li>
            ))}
          </ol>
        )}
        <p className="stage-hint" role="status">
          {phase === "ready"
            ? "Cinq œuvres attendent leur première lumière."
            : phase === "opening"
              ? "La pochette s’ouvre…"
              : revealing
                ? "La carte se dévoile…"
                : complete
                  ? "Les cinq œuvres sont dévoilées."
                  : sequential
                    ? visible.length
                      ? `${visible.length} / ${works.length} cartes dévoilées · Cliquez pour la suivante.`
                      : "Cliquez pour dévoiler la première carte."
                    : "Touchez une carte pour découvrir l’œuvre."}
        </p>
      </div>
      <div className="study-actions">
        <button
          ref={primaryAction}
          className={phase === "opening" ? "study-secondary" : "study-primary"}
          disabled={phase === "cards" && revealing}
          aria-disabled={phase === "cards" && complete ? true : undefined}
          onClick={() => {
            if (phase === "ready") open();
            else if (phase === "opening") timeline.current?.progress(1);
            else if (complete) return;
            else if (sequential) revealNext();
            else setVisible(works.map((_, index) => index));
          }}
        >
          {phase === "ready" ? (
            <>
              Ouvrir la pochette <ArrowRight size={18} />
            </>
          ) : phase === "opening" ? (
            <>
              Passer l’animation <ArrowRight size={16} />
            </>
          ) : sequential ? (
            <>
              {complete
                ? "Les cinq cartes sont dévoilées"
                : revealing
                  ? "La carte se dévoile…"
                  : `Révéler la carte ${visible.length + 1} / ${works.length}`}{" "}
              <ArrowRight size={16} />
            </>
          ) : (
            <>
              <Sparkles size={17} /> Tout révéler
            </>
          )}
        </button>
        <span>Essai gratuit · aucune acquisition enregistrée</span>
      </div>
    </div>
  );
}

function OpeningLab() {
  const [groupId, setGroupId] = useState<BoosterGroupId>("universel");
  const [mood, setMood] = useState<Mood>("museum");
  const [mode, setMode] = useState<RevealMode>("sequential");
  const [maximum, setMaximum] = useState<MaximumRarity>("auto");
  const [speed, setSpeed] = useState(1);
  const [replay, setReplay] = useState(0);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  return (
    <div className="opening-lab">
      <LabNavigation current="ouverture" />
      <header className="opening-lab-header">
        <a className="booster-brand" href="/">
          MUSE<span>L’art à collectionner</span>
        </a>
        <a href="/booster-lab.html">
          <ArrowLeft size={15} /> Les pochettes
        </a>
        <span>LABORATOIRE · HORS DU JEU</span>
      </header>
      <main>
        <div className="opening-lab-intro">
          <p className="eyebrow">Le plaisir de la découverte</p>
          <h1>
            Un petit rituel.
            <br />
            <em>Cinq nouvelles rencontres.</em>
          </h1>
          <p>Ouvrir, attendre un instant, puis laisser l’art se dévoiler.</p>
        </div>
        <div className="opening-lab-layout">
          <OpeningStudy
            key={`${groupId}-${mood}-${speed}-${reduced}-${mode}-${maximum}-${replay}`}
            {...{ groupId, mood, speed, reduced, mode, maximum }}
          />
          <aside className="study-controls">
            <p className="eyebrow">Votre table d’essai</p>
            <h2>Composer l’ouverture</h2>
            <label>
              Pochette
              <select
                aria-label="Pochette"
                value={groupId}
                onChange={(e) => {
                  const next = e.target.value as BoosterGroupId;
                  setGroupId(next);
                  if (
                    maximum !== "auto" &&
                    !openingScenarioAvailable(next, maximum)
                  )
                    setMaximum("auto");
                }}
              >
                {boosterGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Rareté maximale du lot
              <select
                aria-label="Rareté maximale du lot"
                value={maximum}
                onChange={(e) =>
                  setMaximum(
                    e.target.value === "auto"
                      ? "auto"
                      : (Number(e.target.value) as MaximumRarity),
                  )
                }
              >
                <option value="auto">Automatique · exemples habituels</option>
                {rarities.map((rarity, level) => (
                  <option
                    key={rarity.finish}
                    value={level}
                    disabled={!openingScenarioAvailable(groupId, level)}
                  >
                    {rarity.name} · {rarity.material}
                    {!openingScenarioAvailable(groupId, level)
                      ? " — indisponible"
                      : ""}
                  </option>
                ))}
              </select>
            </label>
            <p className="study-note">
              Les choix composent un lot fixe de cinq œuvres réelles, avec la
              rareté maximale en dernière carte. Aucune rareté n’est modifiée.
              La collection universelle permet de tester les cinq finitions.
            </p>
            <fieldset className="study-mode">
              <legend>Révélation des cartes</legend>
              <div className="study-options">
                <button
                  aria-pressed={mode === "sequential"}
                  onClick={() => setMode("sequential")}
                >
                  Une par une
                </button>
                <button
                  aria-pressed={mode === "board"}
                  onClick={() => setMode("board")}
                >
                  Planche
                </button>
              </div>
              <p className="study-note">
                Une par une : chaque clic dévoile la carte suivante, en grand.
                La planche conserve l’essai précédent.
              </p>
            </fieldset>
            <fieldset>
              <legend>Ambiance</legend>
              <div className="study-options">
                <button
                  aria-pressed={mood === "museum"}
                  onClick={() => setMood("museum")}
                >
                  Muséale
                </button>
                <button
                  aria-pressed={mood === "magic"}
                  onClick={() => setMood("magic")}
                >
                  Éclat lumineux
                </button>
              </div>
            </fieldset>
            <p className="study-note study-ambience-note">
              La lumière suit la carte la plus rare du lot : fer, cuivre,
              argent, or ou lapis-lazuli brillant. La pochette conserve son
              identité de famille.
            </p>
            <label>
              Rythme
              <select
                aria-label="Rythme"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              >
                <option value={0.75}>Contemplatif</option>
                <option value={1}>Naturel</option>
                <option value={1.6}>Rapide</option>
              </select>
            </label>
            <label className="study-checkbox">
              <input
                type="checkbox"
                checked={reduced}
                onChange={(e) => setReduced(e.target.checked)}
              />{" "}
              Mouvements réduits
            </label>
            <button
              className="study-secondary"
              onClick={() => setReplay((value) => value + 1)}
            >
              <RotateCcw size={16} /> Rejouer depuis le début
            </button>
            <p className="study-note">
              Changer un réglage remet la scène à zéro. Les œuvres sont des
              exemples fixes du catalogue, pas un tirage réel.
            </p>
          </aside>
        </div>
      </main>
      <footer>
        Étude d’animation GSAP · Sans son · Votre collection reste inchangée.
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <OpeningLab />
  </StrictMode>,
);
