import { useState, useEffect, useCallback } from "react";
import type {
  TarotCard as TarotCardType,
  CardOrientation,
} from "../../types/tarot";

/* ─── types ─── */

interface PositionInfo {
  index: number;
  label: string;
}

interface Props {
  availableCards: TarotCardType[];
  positions: PositionInfo[];
  onComplete: (
    results: {
      posIndex: number;
      card: TarotCardType;
      orientation: CardOrientation;
    }[]
  ) => void;
  onClose: () => void;
}

type Phase = "scatter" | "ready" | "revealing";

/* ─── helpers ─── */

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getRandomOrientation(): CardOrientation {
  return Math.random() < 0.5 ? "reversed" : "upright";
}

function makeScatter(count: number) {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * window.innerWidth * 0.55,
    y: (Math.random() - 0.5) * window.innerHeight * 0.35,
    rot: (Math.random() - 0.5) * 80,
  }));
}

/* ─── card dimensions ─── */
const CARD_W = 65;
const CARD_H = 108;

/* ─── component ─── */

export function CardDrawer({
  availableCards,
  positions,
  onComplete,
  onClose,
}: Props) {
  const [shuffledCards] = useState(() => shuffleArr([...availableCards]));
  const totalCards = shuffledCards.length;

  // animation phases
  const [phase, setPhase] = useState<Phase>("scatter");
  const [scatterPos, setScatterPos] = useState(() => makeScatter(totalCards));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // sequential selection state
  const [pickedResults, setPickedResults] = useState<
    { posIndex: number; card: TarotCardType; orientation: CardOrientation }[]
  >([]);
  const [revealingCardIndex, setRevealingCardIndex] = useState<number | null>(
    null
  );
  const [revealedOrientation, setRevealedOrientation] =
    useState<CardOrientation>("upright");
  const [isFlipped, setIsFlipped] = useState(false);

  const currentPickIndex = pickedResults.length;
  const allPicked = currentPickIndex >= positions.length;
  const currentPosition = allPicked ? null : positions[currentPickIndex];
  const pickedCardIndices = new Set(
    pickedResults.map((r) => shuffledCards.indexOf(r.card))
  );

  /* ── phase animation: scatter(x3) → ready ── */
  useEffect(() => {
    const timers = [
      setTimeout(() => setScatterPos(makeScatter(totalCards)), 500),
      setTimeout(() => setScatterPos(makeScatter(totalCards)), 1000),
      setTimeout(() => setPhase("ready"), 1700),
    ];
    return () => timers.forEach(clearTimeout);
  }, [totalCards]);

  /* ── escape to close ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* ── select a card ── */
  const selectCard = useCallback(
    (index: number) => {
      if (phase !== "ready" || revealingCardIndex !== null || allPicked) return;
      if (pickedCardIndices.has(index)) return;

      const ori = getRandomOrientation();
      setRevealedOrientation(ori);
      setRevealingCardIndex(index);
      setPhase("revealing");

      // flip after zoom
      setTimeout(() => setIsFlipped(true), 700);

      // after reveal, commit result and move to next
      setTimeout(() => {
        const result = {
          posIndex: currentPosition!.index,
          card: shuffledCards[index],
          orientation: ori,
        };

        setPickedResults((prev) => {
          const next = [...prev, result];

          // if this was the last card, complete
          if (next.length >= positions.length) {
            setTimeout(() => onComplete(next), 400);
          }

          return next;
        });

        // reset revealing state for next pick
        setRevealingCardIndex(null);
        setIsFlipped(false);
        setPhase("ready");
      }, 2200);
    },
    [
      phase,
      revealingCardIndex,
      allPicked,
      pickedCardIndices,
      currentPosition,
      shuffledCards,
      positions.length,
      onComplete,
    ]
  );

  /* ── compute card position ── */
  const getCardTransform = (index: number): React.CSSProperties => {
    const isRevealing = revealingCardIndex === index;
    const isPicked = pickedCardIndices.has(index);
    const isHovered = hoveredIndex === index;
    const isDimmed =
      (revealingCardIndex !== null && !isRevealing) || isPicked;

    // revealing card → zoom to center
    if (isRevealing) {
      return {
        transform: `translate(${window.innerWidth / 2 - CARD_W / 2}px, ${window.innerHeight * 0.35 - CARD_H / 2}px) scale(2.8)`,
        zIndex: 1000,
        opacity: 1,
      };
    }

    // already picked → hidden
    if (isPicked) {
      return {
        transform: `translate(${window.innerWidth / 2 - CARD_W / 2}px, ${window.innerHeight + 50}px)`,
        zIndex: 0,
        opacity: 0,
        pointerEvents: "none",
      };
    }

    let tx: number, ty: number, rot: number;

    if (phase === "scatter") {
      const sp = scatterPos[index] ?? { x: 0, y: 0, rot: 0 };
      tx = window.innerWidth / 2 + sp.x - CARD_W / 2;
      ty = window.innerHeight * 0.45 + sp.y - CARD_H / 2;
      rot = sp.rot;
    } else {
      // fan arc — exclude already picked cards from layout
      const visibleIndices = Array.from(
        { length: totalCards },
        (_, i) => i
      ).filter((i) => !pickedCardIndices.has(i));
      const visiblePos = visibleIndices.indexOf(index);
      const visibleCount = visibleIndices.length;

      const spreadAngle = 140;
      const radius = Math.min(window.innerHeight * 0.45, 450);
      const maxAngleRad = ((spreadAngle / 2) * Math.PI) / 180;
      const angle =
        (visiblePos / Math.max(visibleCount - 1, 1) - 0.5) * spreadAngle;
      const rad = (angle * Math.PI) / 180;

      const arcX = Math.sin(rad) * radius;
      const arcY = (Math.cos(rad) - Math.cos(maxAngleRad)) * radius;

      tx = window.innerWidth / 2 + arcX - CARD_W / 2;
      ty = window.innerHeight * 0.82 - arcY - CARD_H;
      rot = angle * 0.5;
    }

    const hoverY = isHovered && !isDimmed ? -22 : 0;

    return {
      transform: `translate(${tx}px, ${ty + hoverY}px) rotate(${rot}deg)`,
      zIndex: isHovered ? 999 : index,
      opacity: isDimmed ? 0.15 : 1,
      pointerEvents: isDimmed ? "none" : "auto",
    };
  };

  /* ── picked cards summary ── */
  const pickedSummary = pickedResults.map((r) => {
    const pos = positions.find((p) => p.index === r.posIndex);
    return { label: pos?.label ?? "", card: r.card, orientation: r.orientation };
  });

  return (
    <div
      className="fixed inset-0 z-[60] overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at center, #1b2735 0%, #090a0f 100%)",
        perspective: "2000px",
      }}
    >
      {/* ── header ── */}
      <div className="relative z-10 pt-5 pb-2 text-center">
        <div className="text-mystic-gold text-base font-heading tracking-widest">
          {allPicked
            ? "抽牌完成"
            : `为「${currentPosition?.label}」抽取一张牌`}
        </div>
        <div className="text-mystic-star/40 text-xs mt-1.5 tracking-wide">
          {phase === "scatter"
            ? "洗牌中..."
            : allPicked
              ? ""
              : revealingCardIndex !== null
                ? ""
                : `点击一张牌 (${currentPickIndex + 1}/${positions.length})`}
        </div>
      </div>

      {/* ── picked cards indicator ── */}
      {pickedSummary.length > 0 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 flex gap-3">
          {pickedSummary.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 bg-mystic-void/60 rounded-lg px-2.5 py-1.5 border border-mystic-gold/20"
            >
              <span className="text-[9px] text-mystic-gold/70">
                {item.label}
              </span>
              <span className="text-[10px] text-mystic-moon">
                {item.card.name}
              </span>
              <span className="text-[8px] text-mystic-star/50">
                {item.orientation === "upright" ? "正位" : "逆位"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── card fan ── */}
      <div className="absolute inset-0">
        {shuffledCards.map((card, i) => (
          <div
            key={card.id}
            className="absolute cursor-pointer"
            style={{
              width: CARD_W,
              height: CARD_H,
              transition: "all 0.7s cubic-bezier(0.25, 1, 0.5, 1)",
              transformOrigin: "center center",
              ...getCardTransform(i),
            }}
            onClick={() => selectCard(i)}
            onMouseEnter={() =>
              phase === "ready" &&
              revealingCardIndex === null &&
              !pickedCardIndices.has(i) &&
              setHoveredIndex(i)
            }
            onMouseLeave={() => hoveredIndex === i && setHoveredIndex(null)}
          >
            {/* card inner (flip container) */}
            <div
              className="relative w-full h-full"
              style={{
                transformStyle: "preserve-3d",
                transform:
                  revealingCardIndex === i && isFlipped
                    ? "rotateY(180deg)"
                    : "rotateY(0deg)",
                transition: "transform 0.6s ease-in-out",
              }}
            >
              {/* back face */}
              <div
                className="absolute inset-0 rounded-lg border border-mystic-gold/30 bg-gradient-to-b from-[#1a1a2e] to-[#2a2a4e] flex items-center justify-center"
                style={{ backfaceVisibility: "hidden" }}
              >
                <span className="text-mystic-gold text-lg select-none">
                  ✦
                </span>
              </div>

              {/* front face */}
              <div
                className="absolute inset-0 rounded-lg overflow-hidden bg-white"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className={`w-full h-full object-cover ${
                      revealingCardIndex === i &&
                      revealedOrientation === "reversed"
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                    <span className="text-xl text-gray-400">
                      {card.number}
                    </span>
                    <span className="text-[8px] text-gray-500 mt-0.5">
                      {card.name}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 py-0.5 text-center">
                  <span className="text-mystic-gold text-[9px] font-bold">
                    {card.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── revealed card info ── */}
      {isFlipped && revealingCardIndex !== null && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-[1001] text-center"
          style={{ top: "62%" }}
        >
          <div className="text-mystic-gold text-xl font-heading tracking-wider">
            {shuffledCards[revealingCardIndex].name}
          </div>
          <div className="text-mystic-star/60 text-xs mt-1">
            {shuffledCards[revealingCardIndex].nameEn}
            {" · "}
            {revealedOrientation === "upright" ? "正位" : "逆位"}
          </div>
        </div>
      )}

      {/* ── bottom controls ── */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center items-center gap-3 z-10">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-mystic-star/20 text-mystic-star/50 rounded-lg text-xs hover:bg-mystic-star/10 transition-colors"
        >
          {allPicked ? "关闭" : "取消"}
        </button>
      </div>
    </div>
  );
}
