import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCardById } from "../data/cards";
import { useProgressContext } from "../context/ProgressContext";

export function CardDetailPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const card = getCardById(cardId ?? "");
  const { isLearned, markLearned, markUnlearned, getNote, saveNote } = useProgressContext();
  const [note, setNote] = useState(() => getNote(cardId ?? ""));

  if (!card) {
    return (
      <div className="p-10 text-center text-mystic-star">
        未找到该卡牌
        <button onClick={() => navigate("/library")} className="block mx-auto mt-4 text-mystic-gold text-base">
          返回图书馆
        </button>
      </div>
    );
  }

  const learned = isLearned(card.id);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-mystic-veil flex-shrink-0">
        <button
          onClick={() => navigate("/library")}
          className="text-mystic-star text-base hover:text-mystic-gold flex items-center gap-1"
        >
          ← 返回图书馆
        </button>
        <div className="flex items-center gap-3">
          <span className="text-mystic-gold text-2xl font-heading">{card.name}</span>
          <span className="text-mystic-star text-base">{card.nameEn}</span>
          {card.element && <span className="px-3 py-1 bg-mystic-veil rounded text-sm text-mystic-star">{elementName(card.element)}</span>}
          {card.zodiac && <span className="px-3 py-1 bg-mystic-veil rounded text-sm text-mystic-star">{card.zodiac}</span>}
          {card.planet && <span className="px-3 py-1 bg-mystic-veil rounded text-sm text-mystic-star">{card.planet}</span>}
        </div>
        <button
          onClick={() => (learned ? markUnlearned(card.id) : markLearned(card.id))}
          className={`px-5 py-2 rounded-full text-base transition-colors ${
            learned
              ? "bg-mystic-gold text-mystic-void font-bold"
              : "border border-mystic-gold/40 text-mystic-gold hover:bg-mystic-gold/10"
          }`}
        >
          {learned ? "✓ 已掌握" : "标记为已掌握"}
        </button>
      </div>

      {/* 主体：左图 + 右侧内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：牌面大图 */}
        <div className="w-80 flex-shrink-0 flex flex-col items-center justify-center gap-4 border-r border-mystic-veil px-6 py-6">
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={card.name}
              className="w-full rounded-xl border-2 border-mystic-gold/30 shadow-lg"
            />
          ) : (
            <div className="w-full aspect-[2/3] rounded-xl border-2 border-mystic-gold/30 bg-gradient-to-b from-mystic-deep to-mystic-veil flex items-center justify-center">
              <span className="text-mystic-gold text-4xl">✦</span>
            </div>
          )}
          <p className="text-mystic-gold/70 text-sm italic text-center">"{card.affirmation}"</p>
        </div>

        {/* 右侧：信息区 */}
        <div className="flex-1 flex flex-col overflow-hidden px-6 py-4 gap-4">

          {/* 画面解读 — 全宽顶部 */}
          <div className="shrink-0 bg-mystic-deep/50 rounded-xl p-4 border border-mystic-veil">
            <h3 className="text-sm font-heading text-mystic-gold mb-2">画面细节 · 象征符号</h3>
            <p className="text-mystic-star text-sm leading-relaxed mb-2">{card.description}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {card.symbolism.map((s, i) => (
                <span key={i} className="text-mystic-star/80 text-sm flex items-start gap-1.5">
                  <span className="text-mystic-gold/40">✦</span>{s}
                </span>
              ))}
            </div>
          </div>

          {/* 正位 + 逆位 两列 */}
          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            {/* 正位列 */}
            <div className="flex flex-col gap-3 min-h-0">
              <div className="bg-mystic-deep/50 rounded-xl p-4 border border-mystic-veil flex-1 min-h-0 overflow-y-auto">
                <h3 className="text-sm font-heading text-mystic-gold mb-2">正位含义</h3>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {card.keywords.upright.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 bg-mystic-glow/20 text-mystic-star rounded text-xs">{kw}</span>
                  ))}
                </div>
                <p className="text-mystic-star text-sm leading-relaxed">{card.meanings.upright}</p>
              </div>
              <div className="bg-mystic-deep/50 rounded-xl p-4 border border-mystic-veil flex-1 min-h-0 overflow-y-auto">
                <h3 className="text-sm font-heading text-mystic-gold mb-2">生活场景</h3>
                <ul className="space-y-1.5">
                  {card.lifeScenes.upright.map((scene, i) => (
                    <li key={i} className="text-mystic-star text-sm flex items-start gap-2">
                      <span className="text-mystic-gold/40 mt-0.5">·</span>{scene}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 逆位列 */}
            <div className="flex flex-col gap-3 min-h-0">
              <div className="bg-mystic-deep/50 rounded-xl p-4 border border-mystic-rose/20 flex-1 min-h-0 overflow-y-auto">
                <h3 className="text-sm font-heading text-mystic-rose mb-2">逆位含义</h3>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {card.keywords.reversed.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 bg-mystic-rose/20 text-mystic-rose rounded text-xs">{kw}</span>
                  ))}
                </div>
                <p className="text-mystic-star text-sm leading-relaxed">{card.meanings.reversed}</p>
              </div>
              <div className="bg-mystic-deep/50 rounded-xl p-4 border border-mystic-rose/20 flex-1 min-h-0 overflow-y-auto">
                <h3 className="text-sm font-heading text-mystic-rose mb-2">生活场景</h3>
                <ul className="space-y-1.5">
                  {card.lifeScenes.reversed.map((scene, i) => (
                    <li key={i} className="text-mystic-star text-sm flex items-start gap-2">
                      <span className="text-mystic-rose/40 mt-0.5">·</span>{scene}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 底部：数字学 + 笔记 */}
          <div className="shrink-0 grid grid-cols-2 gap-4">
            {card.numerology && (
              <div className="bg-mystic-deep/50 rounded-xl p-4 border border-mystic-veil">
                <h3 className="text-sm font-heading text-mystic-gold mb-1.5">数字学</h3>
                <p className="text-mystic-star text-sm leading-relaxed">{card.numerology}</p>
              </div>
            )}
            <div className={`bg-mystic-deep/50 rounded-xl p-4 border border-mystic-veil ${!card.numerology ? "col-span-2" : ""}`}>
              <h3 className="text-sm font-heading text-mystic-gold mb-1.5">我的笔记</h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={() => saveNote(card.id, note)}
                placeholder="写下你对这张牌的理解和联想..."
                className="w-full h-16 bg-mystic-void/50 border border-mystic-veil rounded-lg p-2 text-mystic-moon text-sm resize-none focus:outline-none focus:border-mystic-glow placeholder:text-mystic-star/30"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function elementName(element: string): string {
  const map: Record<string, string> = {
    fire: "🔥 火",
    water: "💧 水",
    air: "💨 风",
    earth: "🌍 土",
    spirit: "✨ 灵",
  };
  return map[element] ?? element;
}
