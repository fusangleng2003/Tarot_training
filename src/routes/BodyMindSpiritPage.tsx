import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { drawRandomCard, useDailyCard } from "../hooks/useDailyCard";
import { useProgressContext } from "../context/ProgressContext";
import { tarotCards } from "../data/cards";
import type { TarotCard, CardOrientation } from "../types/tarot";

interface DrawnSlot {
  card: TarotCard;
  orientation: CardOrientation;
}

const positions = [
  {
    key: "body" as const,
    label: "身",
    labelEn: "Body",
    description: "身体、环境、习惯，以及过去的影响",
    borderClass: "border-green-400/40",
    textClass: "text-green-300",
    badgeClass: "bg-green-400/10 text-green-300",
  },
  {
    key: "mind" as const,
    label: "心",
    labelEn: "Mind",
    description: "心智、当下的想法与态度",
    borderClass: "border-blue-400/40",
    textClass: "text-blue-300",
    badgeClass: "bg-blue-400/10 text-blue-300",
  },
  {
    key: "spirit" as const,
    label: "灵",
    labelEn: "Spirit",
    description: "灵性指引、未来的方向与希望",
    borderClass: "border-purple-400/40",
    textClass: "text-purple-300",
    badgeClass: "bg-purple-400/10 text-purple-300",
  },
];

export function BodyMindSpiritPage() {
  const navigate = useNavigate();
  const { today } = useDailyCard();
  const { progress, addDailyCard, updateDailyJournal } = useProgressContext();

  const todayEntry = useMemo(
    () => progress.dailyCardHistory.find((e) => e.date === today && e.mode === "body-mind-spirit"),
    [progress.dailyCardHistory, today]
  );

  const [slots, setSlots] = useState<Record<"body" | "mind" | "spirit", DrawnSlot | null>>(() => {
    if (todayEntry) {
      const cards = [todayEntry.cardId, ...(todayEntry.extraCards?.map((e) => e.cardId) ?? [])];
      const orientations = [todayEntry.orientation, ...(todayEntry.extraCards?.map((e) => e.orientation) ?? [])];
      return {
        body: { card: tarotCards.find((c) => c.id === cards[0])!, orientation: orientations[0] },
        mind: cards[1] ? { card: tarotCards.find((c) => c.id === cards[1])!, orientation: orientations[1] } : null,
        spirit: cards[2] ? { card: tarotCards.find((c) => c.id === cards[2])!, orientation: orientations[2] } : null,
      };
    }
    return { body: null, mind: null, spirit: null };
  });

  const [revealed, setRevealed] = useState(() => !!todayEntry);
  const [journal, setJournal] = useState(() => todayEntry?.journalNote ?? "");

  const handleDraw = () => {
    // 抽3张不重复的牌
    const drawn: DrawnSlot[] = [];
    const usedIds = new Set<string>();
    while (drawn.length < 3) {
      const { card, orientation } = drawRandomCard();
      if (!usedIds.has(card.id)) {
        usedIds.add(card.id);
        drawn.push({ card, orientation });
      }
    }
    setSlots({ body: drawn[0], mind: drawn[1], spirit: drawn[2] });
    setRevealed(true);
    addDailyCard({
      date: today,
      cardId: drawn[0].card.id,
      orientation: drawn[0].orientation,
      mode: "body-mind-spirit",
      extraCards: [
        { cardId: drawn[1].card.id, orientation: drawn[1].orientation },
        { cardId: drawn[2].card.id, orientation: drawn[2].orientation },
      ],
    });
  };

  const handleSaveJournal = () => updateDailyJournal(today, journal);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {!revealed ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <h1 className="text-3xl font-heading text-mystic-gold mb-1">身心灵</h1>
            <p className="text-mystic-star/60 text-sm">{today}</p>
            <p className="text-mystic-star/40 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
              抽三张牌，全面了解今日的身体状态、心理想法与灵性指引
            </p>
          </div>

          {/* 三格预览 */}
          <div className="flex gap-4">
            {positions.map((pos) => (
              <div
                key={pos.key}
                className={`w-28 h-48 rounded-xl border-2 ${pos.borderClass} bg-mystic-deep/60 flex flex-col items-center justify-center gap-2`}
              >
                <span className={`text-2xl font-heading ${pos.textClass}`}>{pos.label}</span>
                <span className="text-mystic-star/30 text-xs">{pos.labelEn}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleDraw}
            className="px-8 py-3 rounded-full border-2 border-mystic-gold/50 text-mystic-gold font-heading text-lg hover:border-mystic-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-300"
          >
            抽取三张牌
          </button>

          <button onClick={() => navigate("/daily")} className="text-mystic-star/40 hover:text-mystic-star text-sm transition-colors">
            ← 返回
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-8 py-5 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => navigate("/daily")} className="text-mystic-star/50 hover:text-mystic-star text-sm transition-colors">
              ← 返回
            </button>
            <span className="text-mystic-star/40 text-xs">{today} · 身心灵</span>
          </div>

          {/* 三张牌横排 */}
          <div className="grid grid-cols-3 gap-5 mb-6">
            {positions.map((pos) => {
              const slot = slots[pos.key];
              if (!slot) return null;
              const isReversed = slot.orientation === "reversed";
              return (
                <div key={pos.key} className="flex flex-col gap-3">
                  {/* 位置标题 */}
                  <div className="text-center">
                    <span className={`font-heading text-xl ${pos.textClass}`}>{pos.label}</span>
                    <span className="text-mystic-star/40 text-xs ml-2">{pos.description}</span>
                  </div>
                  {/* 牌图 */}
                  <div className="flex justify-center">
                    {slot.card.imageUrl ? (
                      <img
                        src={slot.card.imageUrl}
                        alt={slot.card.name}
                        className={`h-48 w-auto rounded-xl border-2 shadow-lg ${pos.borderClass} ${isReversed ? "rotate-180" : ""}`}
                      />
                    ) : (
                      <div className={`h-48 w-32 rounded-xl border-2 ${pos.borderClass} bg-gradient-to-b from-mystic-deep to-mystic-veil flex items-center justify-center ${isReversed ? "rotate-180" : ""}`}>
                        <span className={`text-3xl ${pos.textClass}`}>✦</span>
                      </div>
                    )}
                  </div>
                  {/* 牌名 */}
                  <div className="text-center">
                    <span className={`font-heading text-base ${pos.textClass}`}>{slot.card.name}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${pos.badgeClass}`}>
                      {isReversed ? "逆位" : "正位"}
                    </span>
                  </div>
                  {/* 含义 */}
                  <div className={`bg-mystic-deep/50 rounded-lg p-3 border ${pos.borderClass} flex-1`}>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(isReversed ? slot.card.keywords.reversed : slot.card.keywords.upright).map((kw) => (
                        <span key={kw} className={`text-xs px-1.5 py-0.5 rounded ${pos.badgeClass}`}>{kw}</span>
                      ))}
                    </div>
                    <p className="text-mystic-star text-sm leading-relaxed">
                      {isReversed ? slot.card.meanings.reversed : slot.card.meanings.upright}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 感想记录 */}
          <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil">
            <h3 className="text-base font-heading text-mystic-gold mb-2">今日感想</h3>
            <textarea
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              onBlur={handleSaveJournal}
              placeholder="身、心、灵三张牌合在一起，对你今天有什么启示？写下来..."
              className="w-full h-24 bg-mystic-void/50 border border-mystic-veil rounded p-3 text-mystic-moon text-sm resize-none focus:outline-none focus:border-mystic-glow placeholder:text-mystic-star/30"
            />
          </div>
        </div>
      )}
    </div>
  );
}
