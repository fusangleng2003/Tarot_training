import { useState, useEffect, useRef, useCallback } from "react";
import type {
  TarotCard as TarotCardType,
  CardOrientation,
} from "../../types/tarot";

/* ─── types ─── */

interface Props {
  availableCards: TarotCardType[];
  reversalMode: "upright-only" | "light" | "balanced";
  positionLabel: string;
  onCardDrawn: (card: TarotCardType, orientation: CardOrientation) => void;
  onClose: () => void;
}

type Phase = "scatter" | "ready" | "revealing";

interface Landmark {
  x: number;
  y: number;
  z: number;
}

/* ─── helpers ─── */

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function orientationByMode(
  mode: "upright-only" | "light" | "balanced"
): CardOrientation {
  if (mode === "upright-only") return "upright";
  if (mode === "light") return Math.random() < 0.25 ? "reversed" : "upright";
  return Math.random() < 0.5 ? "reversed" : "upright";
}

function loadCDN(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(el);
  });
}

function isPinch(lm: Landmark[]): boolean {
  const thumb = lm[4];
  const index = lm[8];
  return Math.hypot(thumb.x - index.x, thumb.y - index.y) < 0.05;
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

export function GestureCardDrawer({
  availableCards,
  reversalMode,
  positionLabel,
  onCardDrawn,
  onClose,
}: Props) {
  const [shuffledCards] = useState(() => shuffleArr([...availableCards]));
  const totalCards = shuffledCards.length;

  // animation phases
  const [phase, setPhase] = useState<Phase>("scatter");
  const [scatterPos, setScatterPos] = useState(() => makeScatter(totalCards));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [resultOrientation, setResultOrientation] =
    useState<CardOrientation>("upright");

  // gesture tracking
  const [gestureStatus, setGestureStatus] = useState<
    "off" | "loading" | "active" | "failed"
  >("off");
  const [cursorPos, setCursorPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cameraRef = useRef<any>(null);
  const selectingRef = useRef(false);

  // keep latest selectCard in a ref for gesture callback
  const selectCardRef = useRef<(i: number) => void>();

  /* ── phase animation: scatter(×3) → ready ── */
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

  /* ── cleanup camera ── */
  useEffect(() => {
    return () => {
      cameraRef.current?.stop?.();
    };
  }, []);

  /* ── select a card ── */
  const selectCard = useCallback(
    (index: number) => {
      if (phase !== "ready" || selectingRef.current) return;
      selectingRef.current = true;
      const ori = orientationByMode(reversalMode);
      setResultOrientation(ori);
      setSelectedIndex(index);
      setPhase("revealing");
      setTimeout(() => setIsFlipped(true), 700);
      setTimeout(() => onCardDrawn(shuffledCards[index], ori), 2200);
    },
    [phase, shuffledCards, reversalMode, onCardDrawn]
  );
  selectCardRef.current = selectCard;

  /* ── enable hand tracking ── */
  const enableGesture = useCallback(async () => {
    if (!videoRef.current) return;
    setGestureStatus("loading");
    try {
      await loadCDN(
        "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"
      );
      await loadCDN(
        "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const W = window as any;
      const hands = new W.Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.75,
        minTrackingConfidence: 0.75,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hands.onResults((results: any) => {
        const lm = results.multiHandLandmarks?.[0] as
          | Landmark[]
          | undefined;
        if (lm) {
          const tip = lm[8];
          const sx = (1 - tip.x) * window.innerWidth;
          const sy = tip.y * window.innerHeight;
          setCursorPos({ x: sx, y: sy });

          const el = document
            .elementFromPoint(sx, sy)
            ?.closest("[data-gesture-card]");
          if (el) {
            const idx = parseInt(el.getAttribute("data-gesture-card")!);
            setHoveredIndex(idx);
            if (isPinch(lm)) selectCardRef.current?.(idx);
          }
        } else {
          setCursorPos(null);
        }
      });

      const camera = new W.Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current! });
        },
        width: 640,
        height: 480,
      });
      await camera.start();
      cameraRef.current = camera;
      setGestureStatus("active");
    } catch {
      setGestureStatus("failed");
    }
  }, []);

  /* ── compute card position ── */
  const getCardTransform = (index: number): React.CSSProperties => {
    const isSelected = selectedIndex === index;
    const isHovered = hoveredIndex === index;
    const isDimmed = selectedIndex !== null && !isSelected;

    // selected → zoom to center
    if (isSelected) {
      return {
        transform: `translate(${window.innerWidth / 2 - CARD_W / 2}px, ${window.innerHeight * 0.35 - CARD_H / 2}px) scale(2.8)`,
        zIndex: 1000,
        opacity: 1,
      };
    }

    let tx: number, ty: number, rot: number;

    if (phase === "scatter") {
      const sp = scatterPos[index] ?? { x: 0, y: 0, rot: 0 };
      // offset from center of viewport
      tx = window.innerWidth / 2 + sp.x - CARD_W / 2;
      ty = window.innerHeight * 0.45 + sp.y - CARD_H / 2;
      rot = sp.rot;
    } else {
      // fan arc
      const spreadAngle = 140;
      const radius = Math.min(window.innerHeight * 0.45, 450);
      const maxAngleRad = (spreadAngle / 2) * Math.PI / 180;
      const angle =
        ((index / Math.max(totalCards - 1, 1)) - 0.5) * spreadAngle;
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
      opacity: isDimmed ? 0.06 : 1,
      pointerEvents: isDimmed ? "none" : "auto",
    };
  };

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
          为「{positionLabel}」抽取一张牌
        </div>
        <div className="text-mystic-star/40 text-xs mt-1.5 tracking-wide">
          {phase === "scatter"
            ? "洗牌中..."
            : phase === "ready"
              ? gestureStatus === "active"
                ? "移动手指并捏合选牌，或直接点击"
                : "点击一张牌进行选择"
              : ""}
        </div>
      </div>

      {/* ── card fan ── */}
      <div className="absolute inset-0">
        {shuffledCards.map((card, i) => (
          <div
            key={card.id}
            data-gesture-card={i}
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
              selectedIndex === null &&
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
                  selectedIndex === i && isFlipped
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
                      selectedIndex === i &&
                      resultOrientation === "reversed"
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
      {isFlipped && selectedIndex !== null && (
        <div className="absolute left-1/2 -translate-x-1/2 z-[1001] text-center" style={{ top: "62%" }}>
          <div className="text-mystic-gold text-xl font-heading tracking-wider">
            {shuffledCards[selectedIndex].name}
          </div>
          <div className="text-mystic-star/60 text-xs mt-1">
            {shuffledCards[selectedIndex].nameEn}
            {" · "}
            {resultOrientation === "upright" ? "正位" : "逆位"}
          </div>
        </div>
      )}

      {/* ── bottom controls ── */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center items-center gap-3 z-10">
        {gestureStatus === "off" && (
          <button
            onClick={enableGesture}
            className="px-4 py-2 border border-mystic-gold/40 text-mystic-gold/70 rounded-lg text-xs hover:bg-mystic-gold/10 transition-colors"
          >
            开启手势追踪
          </button>
        )}
        {gestureStatus === "loading" && (
          <span className="px-4 py-2 text-mystic-gold/50 text-xs animate-pulse">
            正在加载手势识别模型...
          </span>
        )}
        {gestureStatus === "active" && (
          <span className="px-4 py-2 text-emerald-400/70 text-xs">
            手势追踪已开启
          </span>
        )}
        {gestureStatus === "failed" && (
          <span className="px-4 py-2 text-red-400/70 text-xs">
            手势加载失败，请用鼠标点击选牌
          </span>
        )}
        <button
          onClick={onClose}
          className="px-4 py-2 border border-mystic-star/20 text-mystic-star/50 rounded-lg text-xs hover:bg-mystic-star/10 transition-colors"
        >
          取消
        </button>
      </div>

      {/* ── webcam preview ── */}
      <div
        className={`fixed bottom-14 left-4 rounded-lg border border-mystic-gold/30 overflow-hidden z-20 transition-all duration-500 ${
          gestureStatus === "active"
            ? "w-36 h-28 opacity-60"
            : "w-0 h-0 opacity-0"
        }`}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
      </div>

      {/* ── virtual cursor ── */}
      {cursorPos && (
        <div
          className="fixed w-5 h-5 rounded-full border-2 border-mystic-gold pointer-events-none z-[9999]"
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(212, 168, 67, 0.3)",
            boxShadow: "0 0 15px rgba(212, 168, 67, 0.5)",
          }}
        />
      )}
    </div>
  );
}
