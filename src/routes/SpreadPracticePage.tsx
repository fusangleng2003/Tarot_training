import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSpreadById } from "../data/spreads";
import { tarotCards } from "../data/cards";
import { TarotCard } from "../components/card/TarotCard";
import type { CardOrientation, TarotCard as TarotCardType } from "../types/tarot";

interface DrawnCard {
  card: TarotCardType;
  orientation: CardOrientation;
  revealed: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function SpreadPracticePage() {
  const { spreadId } = useParams<{ spreadId: string }>();
  const navigate = useNavigate();
  const spread = getSpreadById(spreadId ?? "");

  const [drawnCards, setDrawnCards] = useState<(DrawnCard | null)[]>(
    () => spread?.positions.map(() => null) ?? []
  );
  const [allRevealed, setAllRevealed] = useState(false);
  const [notes, setNotes] = useState("");

  const drawCard = useCallback(
    (posIndex: number) => {
      if (drawnCards[posIndex]) return;
      const usedIds = drawnCards.filter(Boolean).map((d) => d!.card.id);
      const available = tarotCards.filter((c) => !usedIds.includes(c.id));
      const shuffled = shuffle(available);
      const card = shuffled[0];
      const orientation: CardOrientation = Math.random() > 0.7 ? "reversed" : "upright";

      setDrawnCards((prev) => {
        const next = [...prev];
        next[posIndex] = { card, orientation, revealed: false };
        return next;
      });
    },
    [drawnCards]
  );

  const revealCard = useCallback((posIndex: number) => {
    setDrawnCards((prev) => {
      const next = [...prev];
      if (next[posIndex]) {
        next[posIndex] = { ...next[posIndex]!, revealed: true };
      }
      // Check if all revealed
      if (next.every((d) => d?.revealed)) {
        setAllRevealed(true);
      }
      return next;
    });
  }, []);

  const drawAll = useCallback(() => {
    const shuffled = shuffle([...tarotCards]);
    const positions = spread?.positions ?? [];
    setDrawnCards(
      positions.map((_, i) => ({
        card: shuffled[i],
        orientation: (Math.random() > 0.7 ? "reversed" : "upright") as CardOrientation,
        revealed: true,
      }))
    );
    setAllRevealed(true);
  }, [spread]);

  const reset = () => {
    setDrawnCards(spread?.positions.map(() => null) ?? []);
    setAllRevealed(false);
    setNotes("");
  };

  if (!spread) {
    return (
      <div className="p-10 text-center text-mystic-star">
        未找到该牌阵
        <button onClick={() => navigate("/spreads")} className="block mx-auto mt-4 text-mystic-gold text-sm">
          返回牌阵列表
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate("/spreads")}
            className="text-mystic-star/60 text-sm hover:text-mystic-gold mb-2 flex items-center gap-1"
          >
            ← 返回牌阵列表
          </button>
          <h1 className="text-2xl font-heading text-mystic-gold">{spread.name}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={drawAll}
            className="px-4 py-1.5 bg-mystic-glow text-white rounded text-xs hover:bg-mystic-glow/80"
          >
            一键抽牌
          </button>
          <button
            onClick={reset}
            className="px-4 py-1.5 border border-mystic-veil text-mystic-star rounded text-xs hover:border-mystic-glow"
          >
            重新开始
          </button>
        </div>
      </div>

      {/* Spread Board */}
      <div className="bg-mystic-deep/30 rounded-xl border border-mystic-veil p-6 mb-6">
        <div className={`grid gap-4 ${spread.positions.length <= 3 ? "grid-cols-3" : "grid-cols-5"} justify-items-center`}>
          {spread.positions.map((pos) => {
            const drawn = drawnCards[pos.index];
            return (
              <div key={pos.index} className="flex flex-col items-center gap-2">
                {/* Position label */}
                <span className="text-[10px] text-mystic-gold/70 font-heading">{pos.label}</span>

                {/* Card slot */}
                {!drawn ? (
                  <button
                    onClick={() => drawCard(pos.index)}
                    className="w-20 h-32 rounded-lg border-2 border-dashed border-mystic-veil hover:border-mystic-gold/50 flex items-center justify-center transition-colors"
                  >
                    <span className="text-mystic-star/30 text-xs">点击抽牌</span>
                  </button>
                ) : !drawn.revealed ? (
                  <div onClick={() => revealCard(pos.index)} className="cursor-pointer">
                    <div className="w-20 h-32 rounded-lg border-2 border-mystic-gold/30 bg-gradient-to-b from-mystic-deep to-mystic-veil flex items-center justify-center hover:border-mystic-gold/60 transition-colors">
                      <span className="text-mystic-gold text-lg">✦</span>
                    </div>
                  </div>
                ) : (
                  <TarotCard card={drawn.card} orientation={drawn.orientation} size="sm" />
                )}

                {/* Card name */}
                {drawn?.revealed && (
                  <div className="text-center">
                    <div className="text-[10px] text-mystic-moon">{drawn.card.name}</div>
                    <div className="text-[8px] text-mystic-star/40">
                      {drawn.orientation === "upright" ? "正位" : "逆位"}
                    </div>
                  </div>
                )}

                {/* Position description */}
                <p className="text-[9px] text-mystic-star/40 text-center max-w-[100px]">
                  {pos.description.slice(0, 30)}...
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Story Guide (after all revealed) */}
      {allRevealed && (
        <div className="space-y-4">
          <div className="bg-mystic-deep/50 rounded-lg p-5 border border-mystic-veil">
            <h3 className="text-sm font-heading text-mystic-gold mb-3">故事串联练习</h3>
            <p className="text-mystic-star/70 text-sm mb-3">
              尝试将这些牌串成一个连贯的故事。每张牌在其位置上代表什么？它们之间有什么联系？
            </p>
            <div className="space-y-2">
              {spread.positions.map((pos) => {
                const drawn = drawnCards[pos.index];
                if (!drawn?.revealed) return null;
                return (
                  <div key={pos.index} className="flex items-start gap-2 text-sm">
                    <span className="text-mystic-gold/60 font-heading text-xs min-w-[60px]">
                      {pos.label}：
                    </span>
                    <span className="text-mystic-star">
                      {drawn.card.name}（{drawn.orientation === "upright" ? "正位" : "逆位"}）—{" "}
                      {(drawn.orientation === "upright"
                        ? drawn.card.keywords.upright
                        : drawn.card.keywords.reversed
                      ).join("、")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-mystic-deep/50 rounded-lg p-5 border border-mystic-veil">
            <h3 className="text-sm font-heading text-mystic-gold mb-2">我的解读</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="写下你对这次牌阵的解读..."
              className="w-full h-32 bg-mystic-void/50 border border-mystic-veil rounded p-3 text-mystic-moon text-sm resize-none focus:outline-none focus:border-mystic-glow placeholder:text-mystic-star/30"
            />
          </div>
        </div>
      )}
    </div>
  );
}
