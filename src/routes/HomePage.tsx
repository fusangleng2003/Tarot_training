import { useState } from "react";
import { useDailyCard } from "../hooks/useDailyCard";
import { useProgressContext } from "../context/ProgressContext";

export function HomePage() {
  const { card, orientation, today } = useDailyCard();
  const { progress, learnedCount, addDailyCard, updateDailyJournal, getNote, saveNote } = useProgressContext();
  const [revealed, setRevealed] = useState(false);
  const [journal, setJournal] = useState(() => {
    const existing = progress.dailyCardHistory.find((e) => e.date === today);
    return existing?.journalNote ?? "";
  });
  const [note, setNote] = useState(() => getNote(card.id));

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
        /* 翻牌后：两列布局，左正位右逆位 */
        <div className="flex-1 overflow-y-auto px-8 py-6 animate-fade-in">
          <div className="grid grid-cols-2 gap-6 h-full">

            {/* 左列：正位 */}
            <div className="flex flex-col gap-4">
              {/* 正位图片 */}
              <div className="flex justify-center">
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={`${card.name} 正位`}
                    className="h-72 w-auto rounded-xl border-2 border-mystic-gold/40 shadow-lg"
                  />
                ) : (
                  <div className="h-72 w-48 rounded-xl border-2 border-mystic-gold/30 bg-gradient-to-b from-mystic-deep to-mystic-veil flex items-center justify-center">
                    <span className="text-mystic-gold text-4xl">✦</span>
                  </div>
                )}
              </div>
              <div className="text-center">
                <span className="text-mystic-gold font-heading text-lg">{card.name}</span>
                <span className="ml-2 text-mystic-star/50 text-sm">{card.nameEn}</span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-mystic-veil text-mystic-star text-xs">正位</span>
              </div>
              {/* 正位含义 */}
              <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil">
                <h3 className="text-sm font-heading text-mystic-gold mb-2">正位含义</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {card.keywords.upright.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 bg-mystic-glow/20 text-mystic-star rounded text-xs">{kw}</span>
                  ))}
                </div>
                <p className="text-mystic-star text-sm leading-relaxed">{card.meanings.upright}</p>
              </div>
              {/* 正位生活场景 */}
              <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil">
                <h3 className="text-sm font-heading text-mystic-gold mb-2">生活场景</h3>
                <ul className="space-y-1">
                  {card.lifeScenes.upright.map((scene, i) => (
                    <li key={i} className="text-mystic-star text-sm flex items-start gap-2">
                      <span className="text-mystic-gold/40 mt-0.5">·</span>{scene}
                    </li>
                  ))}
                </ul>
              </div>
              {/* 今日感想 */}
              <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil">
                <h3 className="text-sm font-heading text-mystic-gold mb-2">今日感想</h3>
                <textarea
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)}
                  onBlur={handleSaveJournal}
                  placeholder="写下今天这张牌带给你的感受..."
                  className="w-full h-24 bg-mystic-void/50 border border-mystic-veil rounded p-3 text-mystic-moon text-sm resize-none focus:outline-none focus:border-mystic-glow placeholder:text-mystic-star/30"
                />
              </div>
            </div>

            {/* 右列：逆位 */}
            <div className="flex flex-col gap-4">
              {/* 逆位图片（倒置180度） */}
              <div className="flex justify-center">
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={`${card.name} 逆位`}
                    className="h-72 w-auto rounded-xl border-2 border-mystic-rose/40 shadow-lg rotate-180"
                  />
                ) : (
                  <div className="h-72 w-48 rounded-xl border-2 border-mystic-rose/30 bg-gradient-to-b from-mystic-deep to-mystic-veil flex items-center justify-center rotate-180">
                    <span className="text-mystic-rose text-4xl">✦</span>
                  </div>
                )}
              </div>
              <div className="text-center">
                <span className="text-mystic-rose font-heading text-lg">{card.name}</span>
                <span className="ml-2 text-mystic-star/50 text-sm">{card.nameEn}</span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-mystic-rose/20 text-mystic-rose text-xs">逆位</span>
              </div>
              {/* 逆位含义 */}
              <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-rose/20">
                <h3 className="text-sm font-heading text-mystic-rose mb-2">逆位含义</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {card.keywords.reversed.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 bg-mystic-rose/20 text-mystic-rose rounded text-xs">{kw}</span>
                  ))}
                </div>
                <p className="text-mystic-star text-sm leading-relaxed">{card.meanings.reversed}</p>
              </div>
              {/* 逆位生活场景 */}
              <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-rose/20">
                <h3 className="text-sm font-heading text-mystic-rose mb-2">生活场景</h3>
                <ul className="space-y-1">
                  {card.lifeScenes.reversed.map((scene, i) => (
                    <li key={i} className="text-mystic-star text-sm flex items-start gap-2">
                      <span className="text-mystic-rose/40 mt-0.5">·</span>{scene}
                    </li>
                  ))}
                </ul>
              </div>
              {/* 我的笔记 */}
              <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil">
                <h3 className="text-sm font-heading text-mystic-gold mb-2">我的笔记</h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onBlur={() => saveNote(card.id, note)}
                  placeholder="写下你对这张牌的长期理解和联想..."
                  className="w-full h-24 bg-mystic-void/50 border border-mystic-veil rounded p-3 text-mystic-moon text-sm resize-none focus:outline-none focus:border-mystic-glow placeholder:text-mystic-star/30"
                />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
