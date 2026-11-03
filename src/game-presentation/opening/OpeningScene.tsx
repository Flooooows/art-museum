import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import CompactCard from "../cards/CompactCard";
import { rarities, type Artwork } from "../../data";
import { ArrowRight, Landmark, Sparkles } from "lucide-react";
import BoosterVisual from "../boosters/BoosterVisual";
import { type BoosterGroup } from "../boosters/groups";
import "./styles.css";
import { ambienceForCards, nextRevealIndex } from "./rules";

type Phase = "ready" | "opening" | "cards";
type Mood = "museum" | "magic";
export type RevealMode = "sequential" | "board";

export default function OpeningScene({
  group,
  works,
  mood = "museum",
  speed = 1,
  reduced,
  mode,
  initialVisible = [],
  onReveal,
  onRevealAll,
  instant = false,
}: {
  group: BoosterGroup;
  works: Artwork[];
  mood?: Mood;
  speed?: number;
  reduced: boolean;
  mode: RevealMode;
  initialVisible?: number[];
  onReveal: (index?: number) => void;
  onRevealAll: () => void;
  instant?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const revealTimeline = useRef<gsap.core.Timeline | null>(null);
  const revealLock = useRef(false);
  const revealedIndices = useRef(new Set(initialVisible));
  const primaryAction = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<Element | null | undefined>(undefined);
  const pendingCopyFocus = useRef<number | null>(null);
  const [phase, setPhase] = useState<Phase>(
    instant || initialVisible.length ? "cards" : "ready",
  );
  const [visible, setVisible] = useState<number[]>(initialVisible);
  const [active, setActive] = useState(initialVisible.at(-1) ?? 0);
  const [revealing, setRevealing] = useState(false);
  const ambience = ambienceForCards(works);
  const sequential = mode === "sequential";
  const complete = visible.length === works.length;
  const nextIndex = works.findIndex((_, index) => !visible.includes(index));

  useLayoutEffect(() => {
    setVisible(initialVisible);
    revealedIndices.current = new Set(initialVisible);
  }, [initialVisible]);

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
      if (instant || initialVisible.length) {
        gsap.set(".study-pack", { autoAlpha: 0 });
        gsap.set(".study-cards", { zIndex: 5 });
        const cards = gsap.utils.toArray<HTMLElement>(".study-card");
        cards.forEach((card, index) => {
          gsap.set(card, {
            autoAlpha: !sequential || index === active ? 1 : 0,
            y: 0,
            rotation: 0,
          });
          if (initialVisible.includes(index))
            gsap.set(card.querySelector(".study-card-turn"), {
              rotationY: 180,
            });
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
    if (!instant && !initialVisible.length) open();
  }, []);

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
        `[data-card-index="${pendingCopyFocus.current}"] .study-card-front`,
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
    onReveal(index);
  }

  function revealNext() {
    if (phase !== "cards" || !root.current) return;
    const index = nextRevealIndex(
      works.findIndex((_, i) => !revealedIndices.current.has(i)) < 0
        ? works.length
        : works.findIndex((_, i) => !revealedIndices.current.has(i)),
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
      revealedIndices.current.add(index);
      setVisible([...revealedIndices.current].sort((a, b) => a - b));
      onReveal(index);
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
    if (index > 0 || revealedIndices.current.size > 0) {
      tl.to(cards[active], {
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
      data-opening-speed={speed}
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
          aria-label={`Les ${works.length} cartes de votre pochette`}
          aria-description={
            sequential
              ? undefined
              : "Cartes sur une ligne. Faites défiler horizontalement si nécessaire."
          }
          tabIndex={sequential ? undefined : 0}
        >
          {works.map((art, index) => (
            <div
              key={`${art.id}-${index}`}
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
              <div className="study-card-turn">
                <span className="study-card-back" aria-hidden="true">
                  <Landmark size={30} />
                  <strong>MUSE</strong>
                  <span>L’ART SE DÉVOILE</span>
                  <small>0{index + 1}</small>
                </span>
                <div
                  className="study-card-front"
                  aria-hidden={!visible.includes(index)}
                  tabIndex={
                    visible.includes(index) && (!sequential || index === active)
                      ? 0
                      : -1
                  }
                >
                  <CompactCard art={art} eager />
                </div>
              </div>
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
                key={`${art.id}-${index}`}
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
            ? "Vos œuvres attendent leur première lumière."
            : phase === "opening"
              ? "La pochette s’ouvre…"
              : revealing
                ? "La carte se dévoile…"
                : complete
                  ? "Toutes les œuvres sont dévoilées."
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
            else {
              setVisible(works.map((_, index) => index));
              onReveal();
            }
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
          ) : sequential || complete ? (
            <>
              {complete
                ? "Toutes les cartes sont dévoilées"
                : revealing
                  ? "La carte se dévoile…"
                  : `Révéler la carte ${nextIndex + 1} / ${works.length}`}{" "}
              <ArrowRight size={16} />
            </>
          ) : (
            <>
              <Sparkles size={17} /> Tout révéler
            </>
          )}
        </button>
        {!complete && (
          <button
            type="button"
            className="study-secondary study-reveal-all"
            onClick={onRevealAll}
          >
            <Sparkles size={17} /> Tout révéler
          </button>
        )}
        <span>Votre tirage est sauvegardé dans votre collection.</span>
      </div>
    </div>
  );
}
