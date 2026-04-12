import { useState } from "react";
import { motion } from "framer-motion";
import type { TarotCard as TarotCardType, CardOrientation } from "../../types/tarot";

interface TarotCardProps {
  card: TarotCardType;
  orientation?: CardOrientation;
  size?: "sm" | "md" | "lg";
  isFlippable?: boolean;
  showName?: boolean;
  showLearnedBadge?: boolean;
  onClick?: () => void;
}

const sizeMap = {
  sm: { width: "w-16", height: "h-28", text: "text-[10px]" },
  md: { width: "w-36", height: "h-60", text: "text-xs" },
  lg: { width: "w-40", height: "h-68", text: "text-sm" },
};

const suitColors: Record<string, string> = {
  wands: "from-red-900 to-orange-800",
  cups: "from-blue-900 to-cyan-800",
  swords: "from-yellow-900 to-amber-700",
  pentacles: "from-green-900 to-emerald-800",
};

export function TarotCard({
  card,
  orientation = "upright",
  size = "md",
  isFlippable = false,
  showName = true,
  showLearnedBadge = false,
  onClick,
}: TarotCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const s = sizeMap[size];

  const handleClick = () => {
    if (isFlippable) setIsFlipped(!isFlipped);
    onClick?.();
  };

  const bgGradient = card.suit
    ? suitColors[card.suit]
    : "from-purple-900 to-indigo-800";

  return (
    <div
      className={`${s.width} ${s.height} cursor-pointer perspective-[1000px]`}
      onClick={handleClick}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Front Face */}
        <div
          className={`absolute inset-0 rounded-lg border-2 border-mystic-gold/30 overflow-hidden bg-gradient-to-b ${bgGradient} ${
            orientation === "reversed" ? "rotate-180" : ""
          }`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={card.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-2">
              <div className={`font-heading text-mystic-gold font-bold ${size === "sm" ? "text-lg" : size === "md" ? "text-2xl" : "text-4xl"}`}>
                {card.arcana === "major" ? toRoman(card.number) : card.number}
              </div>
              {size !== "sm" && (
                <div className={`text-mystic-star mt-1 ${s.text} leading-tight text-center`}>
                  {card.nameEn}
                </div>
              )}
            </div>
          )}
          {showName && (
            <div
              className={`absolute bottom-0 left-0 right-0 text-center py-1 bg-black/60 ${s.text} text-mystic-moon font-body ${
                orientation === "reversed" ? "rotate-180" : ""
              }`}
            >
              {card.name}
            </div>
          )}
          {showLearnedBadge && (
            <div className={`absolute top-1 right-1 w-4 h-4 rounded-full bg-mystic-gold flex items-center justify-center ${
              orientation === "reversed" ? "rotate-180" : ""
            }`}>
              <span className="text-[8px] text-mystic-void">✓</span>
            </div>
          )}
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 rounded-lg border-2 border-mystic-gold/30 overflow-hidden bg-gradient-to-b from-mystic-deep to-mystic-veil flex items-center justify-center"
          style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
        >
          <div className="text-center p-2">
            <div className="text-mystic-gold text-2xl mb-2">✦</div>
            <div className="text-mystic-star text-xs font-heading">TAROT</div>
            <div className="mt-2 w-12 h-12 mx-auto border border-mystic-gold/40 rounded-full flex items-center justify-center">
              <div className="text-mystic-gold text-lg">☽</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function toRoman(num: number): string {
  if (num === 0) return "0";
  const map: [number, string][] = [
    [21, "XXI"], [20, "XX"], [19, "XIX"], [18, "XVIII"], [17, "XVII"],
    [16, "XVI"], [15, "XV"], [14, "XIV"], [13, "XIII"], [12, "XII"],
    [11, "XI"], [10, "X"], [9, "IX"], [8, "VIII"], [7, "VII"],
    [6, "VI"], [5, "V"], [4, "IV"], [3, "III"], [2, "II"], [1, "I"],
  ];
  for (const [val, str] of map) {
    if (num === val) return str;
  }
  return String(num);
}
