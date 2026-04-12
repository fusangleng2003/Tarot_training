import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCardById } from "../data/cards";
import { useProgressContext } from "../context/ProgressContext";
import { TarotCard } from "../components/card/TarotCard";

export function CardDetailPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const card = getCardById(cardId ?? "");
  const { isLearned, markLearned, markUnlearned, getNote, saveNote } = useProgressContext();
  const [tab, setTab] = useState<"upright" | "reversed">("upright");
  const [note, setNote] = useState(() => getNote(cardId ?? ""));

  if (!card) {
    return (
      <div className="p-10 text-center text-mystic-star">
        未找到该卡牌
        <button onClick={() => navigate("/library")} className="block mx-auto mt-4 text-mystic-gold text-sm">
          返回图书馆
        </button>
      </div>
    );
  }

  const learned = isLearned(card.id);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Back */}
      <button
        onClick={() => navigate("/library")}
        className="text-mystic-star/60 text-sm hover:text-mystic-gold mb-6 flex items-center gap-1"
      >
        ← 返回图书馆
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-shrink-0 flex justify-center">
          <TarotCard card={card} size="lg" isFlippable />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-2xl font-heading text-mystic-gold">{card.name}</h1>
              <p className="text-mystic-star/60 text-sm">{card.nameEn}</p>
            </div>
            <button
              onClick={() => (learned ? markUnlearned(card.id) : markLearned(card.id))}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                learned
                  ? "bg-mystic-gold text-mystic-void"
                  : "border border-mystic-gold/40 text-mystic-gold hover:bg-mystic-gold/10"
              }`}
            >
              {learned ? "✓ 已掌握" : "标记为已掌握"}
            </button>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-0.5 bg-mystic-veil rounded text-xs text-mystic-star">
              {card.arcana === "major" ? "大阿卡纳" : `小阿卡纳 · ${suitName(card.suit)}`}
            </span>
            {card.element && (
              <span className="px-2 py-0.5 bg-mystic-veil rounded text-xs text-mystic-star">
                {elementName(card.element)}
              </span>
            )}
            {card.zodiac && (
              <span className="px-2 py-0.5 bg-mystic-veil rounded text-xs text-mystic-star">
                {card.zodiac}
              </span>
            )}
            {card.planet && (
              <span className="px-2 py-0.5 bg-mystic-veil rounded text-xs text-mystic-star">
                {card.planet}
              </span>
            )}
          </div>

          {/* Affirmation */}
          <p className="text-mystic-gold/70 text-sm italic">"{card.affirmation}"</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-mystic-veil mb-6">
        <button
          onClick={() => setTab("upright")}
          className={`px-4 py-2 text-sm border-b-2 transition-colors ${
            tab === "upright"
              ? "border-mystic-gold text-mystic-gold"
              : "border-transparent text-mystic-star/60 hover:text-mystic-star"
          }`}
        >
          正位
        </button>
        <button
          onClick={() => setTab("reversed")}
          className={`px-4 py-2 text-sm border-b-2 transition-colors ${
            tab === "reversed"
              ? "border-mystic-rose text-mystic-rose"
              : "border-transparent text-mystic-star/60 hover:text-mystic-star"
          }`}
        >
          逆位
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Keywords */}
        <section>
          <h3 className="text-sm font-heading text-mystic-gold mb-2">关键词</h3>
          <div className="flex flex-wrap gap-2">
            {(tab === "upright" ? card.keywords.upright : card.keywords.reversed).map((kw) => (
              <span
                key={kw}
                className={`px-2 py-0.5 rounded text-xs ${
                  tab === "upright"
                    ? "bg-mystic-glow/20 text-mystic-star"
                    : "bg-mystic-rose/20 text-mystic-rose"
                }`}
              >
                {kw}
              </span>
            ))}
          </div>
        </section>

        {/* Meaning */}
        <section className="bg-mystic-deep/50 rounded-lg p-5 border border-mystic-veil">
          <h3 className="text-sm font-heading text-mystic-gold mb-2">
            {tab === "upright" ? "正位含义" : "逆位含义"}
          </h3>
          <p className="text-mystic-star text-sm leading-relaxed">
            {tab === "upright" ? card.meanings.upright : card.meanings.reversed}
          </p>
        </section>

        {/* Description & Symbolism */}
        <section className="bg-mystic-deep/50 rounded-lg p-5 border border-mystic-veil">
          <h3 className="text-sm font-heading text-mystic-gold mb-2">画面细节观察</h3>
          <p className="text-mystic-star text-sm leading-relaxed mb-4">{card.description}</p>
          <h4 className="text-xs font-heading text-mystic-gold/80 mb-2">象征符号</h4>
          <ul className="space-y-1">
            {card.symbolism.map((s, i) => (
              <li key={i} className="text-mystic-star/80 text-sm flex items-start gap-2">
                <span className="text-mystic-gold/40 mt-0.5">✦</span>
                {s}
              </li>
            ))}
          </ul>
        </section>

        {/* Life Scenes */}
        <section className="bg-mystic-deep/50 rounded-lg p-5 border border-mystic-veil">
          <h3 className="text-sm font-heading text-mystic-gold mb-2">生活联想</h3>
          <ul className="space-y-1">
            {card.lifeScenes.map((scene, i) => (
              <li key={i} className="text-mystic-star text-sm flex items-start gap-2">
                <span className="text-mystic-gold/40 mt-0.5">·</span>
                {scene}
              </li>
            ))}
          </ul>
        </section>

        {/* Numerology */}
        {card.numerology && (
          <section className="bg-mystic-deep/50 rounded-lg p-5 border border-mystic-veil">
            <h3 className="text-sm font-heading text-mystic-gold mb-2">数字学</h3>
            <p className="text-mystic-star text-sm">{card.numerology}</p>
          </section>
        )}

        {/* Personal Notes */}
        <section className="bg-mystic-deep/50 rounded-lg p-5 border border-mystic-veil">
          <h3 className="text-sm font-heading text-mystic-gold mb-2">我的笔记</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => saveNote(card.id, note)}
            placeholder="写下你对这张牌的理解和联想..."
            className="w-full h-24 bg-mystic-void/50 border border-mystic-veil rounded p-3 text-mystic-moon text-sm resize-none focus:outline-none focus:border-mystic-glow placeholder:text-mystic-star/30"
          />
        </section>
      </div>
    </div>
  );
}

function suitName(suit: string | null): string {
  const map: Record<string, string> = {
    wands: "权杖",
    cups: "圣杯",
    swords: "宝剑",
    pentacles: "星币",
  };
  return suit ? map[suit] ?? suit : "";
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
