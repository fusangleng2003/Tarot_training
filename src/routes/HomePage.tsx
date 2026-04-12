import { useState } from "react";
import { useDailyCard } from "../hooks/useDailyCard";
import { useProgressContext } from "../context/ProgressContext";
import { TarotCard } from "../components/card/TarotCard";

export function HomePage() {
  const { card, orientation, today } = useDailyCard();
  const { progress, learnedCount, addDailyCard, updateDailyJournal } = useProgressContext();
  const [revealed, setRevealed] = useState(false);
  const [journal, setJournal] = useState(() => {
    const existing = progress.dailyCardHistory.find((e) => e.date === today);
    return existing?.journalNote ?? "";
  });

  const hasRecordedToday = progress.dailyCardHistory.some((e) => e.date === today);

  const handleReveal = () => {
    setRevealed(true);
    if (!hasRecordedToday) {
      addDailyCard({ date: today, cardId: card.id, orientation });
    }
  };

  const handleSaveJournal = () => {
    updateDailyJournal(today, journal);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 未翻牌：完全居中 */}
      {!revealed ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <h1 className="text-3xl font-heading text-mystic-gold mb-1">每日一牌</h1>
            <p className="text-mystic-star/60 text-sm">{today}
              {progress.streakCount > 0 && (
                <span className="ml-3 text-mystic-gold/70">🔥 连续学习第 {progress.streakCount} 天</span>
              )}
            </p>
          </div>

          {/* 大卡片 */}
          <div
            onClick={handleReveal}
            className="w-56 h-96 rounded-2xl border-2 border-mystic-gold/40 bg-gradient-to-b from-mystic-deep to-mystic-veil flex flex-col items-center justify-center cursor-pointer hover:border-mystic-gold/80 hover:shadow-[0_0_40px_rgba(212,175,55,0.15)] transition-all duration-300 group"
          >
            <div className="text-6xl text-mystic-gold mb-4 group-hover:scale-110 transition-transform duration-300">✦</div>
            <div className="text-mystic-star text-lg font-heading">点击翻牌</div>
            <div className="text-mystic-star/40 text-sm mt-2">发现今日指引</div>
          </div>

          <div className="text-mystic-star/30 text-xs">已掌握 {learnedCount}/78 张牌</div>
        </div>
      ) : (
        /* 翻牌后：左边大卡，右边信息 */
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧卡片区 */}
          <div className="w-72 flex-shrink-0 flex flex-col items-center justify-center gap-3 border-r border-mystic-veil px-6 py-6">
            <TarotCard card={card} orientation={orientation} size="lg" isFlippable />
            <div className="text-center">
              <div className="text-base font-heading text-mystic-gold">{card.name}</div>
              <div className="text-xs text-mystic-star/60">{card.nameEn}</div>
              <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full bg-mystic-veil text-mystic-star text-xs">
                {orientation === "upright" ? "正位" : "逆位"}
              </span>
            </div>
            <div className="text-mystic-star/30 text-xs mt-2">已掌握 {learnedCount}/78 张牌</div>
          </div>

          {/* 右侧信息区 */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-3 content-start animate-fade-in">
            <div className="col-span-2 bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil">
              <h3 className="text-xs font-heading text-mystic-gold mb-2">
                {orientation === "upright" ? "正位含义" : "逆位含义"}
              </h3>
              <p className="text-mystic-star text-sm leading-relaxed">
                {orientation === "upright" ? card.meanings.upright : card.meanings.reversed}
              </p>
            </div>

            <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil">
              <h3 className="text-xs font-heading text-mystic-gold mb-2">关键词</h3>
              <div className="flex flex-wrap gap-1.5">
                {(orientation === "upright" ? card.keywords.upright : card.keywords.reversed).map((kw) => (
                  <span key={kw} className="px-2 py-0.5 bg-mystic-glow/20 text-mystic-star rounded text-xs">{kw}</span>
                ))}
              </div>
            </div>

            <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil">
              <h3 className="text-xs font-heading text-mystic-gold mb-2">生活联想</h3>
              <ul className="space-y-1">
                {card.lifeScenes.map((scene, i) => (
                  <li key={i} className="text-mystic-star text-xs flex items-start gap-1.5">
                    <span className="text-mystic-gold/60 mt-0.5">·</span>{scene}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil">
              <h3 className="text-xs font-heading text-mystic-gold mb-2">每日肯定句</h3>
              <p className="text-mystic-gold/80 text-xs italic leading-relaxed">"{card.affirmation}"</p>
            </div>

            <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil">
              <h3 className="text-xs font-heading text-mystic-gold mb-2">今日感想</h3>
              <textarea
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                onBlur={handleSaveJournal}
                placeholder="写下你的感受..."
                className="w-full h-20 bg-mystic-void/50 border border-mystic-veil rounded p-2 text-mystic-moon text-xs resize-none focus:outline-none focus:border-mystic-glow placeholder:text-mystic-star/30"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
