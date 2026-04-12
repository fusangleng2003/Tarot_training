import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { drawRandomCard } from "../hooks/useDailyCard";
import { useProgressContext } from "../context/ProgressContext";
import { tarotCards } from "../data/cards";
import type { TarotCard, CardOrientation } from "../types/tarot";

export function LearnPage() {
  const navigate = useNavigate();
  const { getNote, saveNote } = useProgressContext();

  const [revealed, setRevealed] = useState(false);
  const [card, setCard] = useState<TarotCard>(tarotCards[0]);
  const [orientation, setOrientation] = useState<CardOrientation>("upright");
  const [note, setNote] = useState(() => getNote(tarotCards[0].id));

  const handleDraw = () => {
    const { card: newCard, orientation: newOrientation } = drawRandomCard();
    setCard(newCard);
    setOrientation(newOrientation);
    setNote(getNote(newCard.id));
    setRevealed(true);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {!revealed ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <h1 className="text-3xl font-heading text-mystic-gold mb-1">学习</h1>
            <p className="text-mystic-star/60 text-sm">随机抽一张牌，深入学习它的含义</p>
          </div>

          <div
            onClick={handleDraw}
            className="w-56 h-96 rounded-2xl border-2 border-mystic-gold/40 bg-gradient-to-b from-mystic-deep to-mystic-veil flex flex-col items-center justify-center cursor-pointer hover:border-mystic-gold/80 hover:shadow-[0_0_40px_rgba(212,175,55,0.15)] transition-all duration-300 group"
          >
            <div className="text-6xl text-mystic-gold mb-4 group-hover:scale-110 transition-transform duration-300">⊕</div>
            <div className="text-mystic-star text-lg font-heading">点击抽牌</div>
            <div className="text-mystic-star/40 text-sm mt-2">开始今日学习</div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden px-8 py-5 animate-fade-in">
          {/* 顶部操作栏 */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/daily")}
              className="text-mystic-star/50 hover:text-mystic-star text-sm transition-colors"
            >
              ← 返回
            </button>
            <button
              onClick={handleDraw}
              className="px-4 py-1.5 rounded-full border border-mystic-gold/40 text-mystic-gold/80 text-sm hover:border-mystic-gold hover:text-mystic-gold transition-colors"
            >
              换一张
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 h-[calc(100%-3rem)]">
            {/* 左列：正位 */}
            <div className="flex flex-col gap-3 h-full">
              <div className="flex-shrink-0 flex justify-center">
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={`${card.name} 正位`}
                    className="h-56 w-auto rounded-xl border-2 border-mystic-gold/40 shadow-lg"
                  />
                ) : (
                  <div className="h-56 w-36 rounded-xl border-2 border-mystic-gold/30 bg-gradient-to-b from-mystic-deep to-mystic-veil flex items-center justify-center">
                    <span className="text-mystic-gold text-4xl">✦</span>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 text-center">
                <span className="text-mystic-gold font-heading text-xl">{card.name}</span>
                <span className="ml-2 text-mystic-star/50 text-base">{card.nameEn}</span>
                <span className="ml-2 px-3 py-0.5 rounded-full bg-mystic-veil text-mystic-star text-sm">正位</span>
              </div>
              <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil flex-1">
                <h3 className="text-base font-heading text-mystic-gold mb-2">正位含义</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {card.keywords.upright.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 bg-mystic-glow/20 text-mystic-star rounded text-sm">{kw}</span>
                  ))}
                </div>
                <p className="text-mystic-star text-base leading-relaxed">{card.meanings.upright}</p>
              </div>
              <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil flex-1">
                <h3 className="text-base font-heading text-mystic-gold mb-2">生活场景</h3>
                <ul className="space-y-1.5">
                  {card.lifeScenes.upright.map((scene, i) => (
                    <li key={i} className="text-mystic-star text-base flex items-start gap-2">
                      <span className="text-mystic-gold/40 mt-0.5">·</span>{scene}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 右列：逆位 + 笔记 */}
            <div className="flex flex-col gap-3 h-full">
              <div className="flex-shrink-0 flex justify-center">
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={`${card.name} 逆位`}
                    className="h-56 w-auto rounded-xl border-2 border-mystic-rose/40 shadow-lg rotate-180"
                  />
                ) : (
                  <div className="h-56 w-36 rounded-xl border-2 border-mystic-rose/30 bg-gradient-to-b from-mystic-deep to-mystic-veil flex items-center justify-center rotate-180">
                    <span className="text-mystic-rose text-4xl">✦</span>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 text-center">
                <span className="text-mystic-rose font-heading text-xl">{card.name}</span>
                <span className="ml-2 text-mystic-star/50 text-base">{card.nameEn}</span>
                <span className="ml-2 px-3 py-0.5 rounded-full bg-mystic-rose/20 text-mystic-rose text-sm">逆位</span>
              </div>
              <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-rose/20 flex-1">
                <h3 className="text-base font-heading text-mystic-rose mb-2">逆位含义</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {card.keywords.reversed.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 bg-mystic-rose/20 text-mystic-rose rounded text-sm">{kw}</span>
                  ))}
                </div>
                <p className="text-mystic-star text-base leading-relaxed">{card.meanings.reversed}</p>
              </div>
              <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-rose/20 flex-1">
                <h3 className="text-base font-heading text-mystic-rose mb-2">生活场景</h3>
                <ul className="space-y-1.5">
                  {card.lifeScenes.reversed.map((scene, i) => (
                    <li key={i} className="text-mystic-star text-base flex items-start gap-2">
                      <span className="text-mystic-rose/40 mt-0.5">·</span>{scene}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil flex-1">
                <h3 className="text-base font-heading text-mystic-gold mb-2">我的笔记</h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onBlur={() => saveNote(card.id, note)}
                  placeholder="写下你对这张牌的长期理解和联想..."
                  className="w-full h-24 bg-mystic-void/50 border border-mystic-veil rounded p-3 text-mystic-moon text-base resize-none focus:outline-none focus:border-mystic-glow placeholder:text-mystic-star/30"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
