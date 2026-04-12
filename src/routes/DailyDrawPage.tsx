import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { drawRandomCard, useDailyCard } from "../hooks/useDailyCard";
import { useProgressContext } from "../context/ProgressContext";
import { tarotCards } from "../data/cards";
import type { TarotCard, CardOrientation } from "../types/tarot";

export function DailyDrawPage() {
  const navigate = useNavigate();
  const { today } = useDailyCard();
  const { progress, addDailyCard, updateDailyJournal, getNote, saveNote } = useProgressContext();

  const todayEntry = useMemo(
    () => progress.dailyCardHistory.find((e) => e.date === today && (e.mode === "single" || !e.mode)),
    [progress.dailyCardHistory, today]
  );

  const [revealed, setRevealed] = useState(() => !!todayEntry);
  const [card, setCard] = useState<TarotCard | null>(() =>
    todayEntry ? (tarotCards.find((c) => c.id === todayEntry.cardId) ?? null) : null
  );
  const [orientation, setOrientation] = useState<CardOrientation>(
    () => todayEntry?.orientation ?? "upright"
  );
  const [journal, setJournal] = useState(() => todayEntry?.journalNote ?? "");
  const [note, setNote] = useState(() => getNote(todayEntry?.cardId ?? ""));

  const handleReveal = () => {
    const { card: newCard, orientation: newOrientation } = drawRandomCard();
    setCard(newCard);
    setOrientation(newOrientation);
    setNote(getNote(newCard.id));
    setRevealed(true);
    addDailyCard({ date: today, cardId: newCard.id, orientation: newOrientation, mode: "single" });
  };

  const handleSaveJournal = () => {
    updateDailyJournal(today, journal);
  };

  const displayCard = card ?? tarotCards[0];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {!revealed ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <h1 className="text-3xl font-heading text-mystic-gold mb-1">每日一抽</h1>
            <p className="text-mystic-star/60 text-sm">{today}</p>
            <p className="text-mystic-star/40 text-xs mt-2">抽一张牌，留意今天生活中是否出现相关的事件</p>
          </div>

          <div
            onClick={handleReveal}
            className="w-56 h-96 rounded-2xl border-2 border-mystic-gold/40 bg-gradient-to-b from-mystic-deep to-mystic-veil flex flex-col items-center justify-center cursor-pointer hover:border-mystic-gold/80 hover:shadow-[0_0_40px_rgba(212,175,55,0.15)] transition-all duration-300 group"
          >
            <div className="text-6xl text-mystic-gold mb-4 group-hover:scale-110 transition-transform duration-300">✦</div>
            <div className="text-mystic-star text-lg font-heading">点击翻牌</div>
            <div className="text-mystic-star/40 text-sm mt-2">发现今日指引</div>
          </div>

          <button
            onClick={() => navigate("/daily")}
            className="text-mystic-star/40 hover:text-mystic-star text-sm transition-colors"
          >
            ← 返回
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden px-8 py-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/daily")}
              className="text-mystic-star/50 hover:text-mystic-star text-sm transition-colors"
            >
              ← 返回
            </button>
            <span className="text-mystic-star/40 text-xs">{today} · 每日一抽</span>
          </div>

          <div className="grid grid-cols-2 gap-6 h-[calc(100%-3rem)]">
            {/* 左列：正位 */}
            <div className="flex flex-col gap-3 h-full">
              <div className="flex-shrink-0 flex justify-center">
                {displayCard.imageUrl ? (
                  <img
                    src={displayCard.imageUrl}
                    alt={`${displayCard.name} 正位`}
                    className="h-56 w-auto rounded-xl border-2 border-mystic-gold/40 shadow-lg"
                  />
                ) : (
                  <div className="h-56 w-36 rounded-xl border-2 border-mystic-gold/30 bg-gradient-to-b from-mystic-deep to-mystic-veil flex items-center justify-center">
                    <span className="text-mystic-gold text-4xl">✦</span>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 text-center">
                <span className="text-mystic-gold font-heading text-xl">{displayCard.name}</span>
                <span className="ml-2 text-mystic-star/50 text-base">{displayCard.nameEn}</span>
                <span className="ml-2 px-3 py-0.5 rounded-full bg-mystic-veil text-mystic-star text-sm">正位</span>
              </div>
              <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil flex-1">
                <h3 className="text-base font-heading text-mystic-gold mb-2">正位含义</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {displayCard.keywords.upright.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 bg-mystic-glow/20 text-mystic-star rounded text-sm">{kw}</span>
                  ))}
                </div>
                <p className="text-mystic-star text-base leading-relaxed">{displayCard.meanings.upright}</p>
              </div>
              <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil flex-1">
                <h3 className="text-base font-heading text-mystic-gold mb-2">生活场景</h3>
                <ul className="space-y-1.5">
                  {displayCard.lifeScenes.upright.map((scene, i) => (
                    <li key={i} className="text-mystic-star text-base flex items-start gap-2">
                      <span className="text-mystic-gold/40 mt-0.5">·</span>{scene}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil flex-1">
                <h3 className="text-base font-heading text-mystic-gold mb-2">今日感想</h3>
                <textarea
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)}
                  onBlur={handleSaveJournal}
                  placeholder="今天遇到了符合这张牌的事件吗？写下来..."
                  className="w-full h-24 bg-mystic-void/50 border border-mystic-veil rounded p-3 text-mystic-moon text-base resize-none focus:outline-none focus:border-mystic-glow placeholder:text-mystic-star/30"
                />
              </div>
            </div>

            {/* 右列：逆位 + 笔记 */}
            <div className="flex flex-col gap-3 h-full">
              <div className="flex-shrink-0 flex justify-center">
                {displayCard.imageUrl ? (
                  <img
                    src={displayCard.imageUrl}
                    alt={`${displayCard.name} 逆位`}
                    className="h-56 w-auto rounded-xl border-2 border-mystic-rose/40 shadow-lg rotate-180"
                  />
                ) : (
                  <div className="h-56 w-36 rounded-xl border-2 border-mystic-rose/30 bg-gradient-to-b from-mystic-deep to-mystic-veil flex items-center justify-center rotate-180">
                    <span className="text-mystic-rose text-4xl">✦</span>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 text-center">
                <span className="text-mystic-rose font-heading text-xl">{displayCard.name}</span>
                <span className="ml-2 text-mystic-star/50 text-base">{displayCard.nameEn}</span>
                <span className="ml-2 px-3 py-0.5 rounded-full bg-mystic-rose/20 text-mystic-rose text-sm">逆位</span>
              </div>
              <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-rose/20 flex-1">
                <h3 className="text-base font-heading text-mystic-rose mb-2">逆位含义</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {displayCard.keywords.reversed.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 bg-mystic-rose/20 text-mystic-rose rounded text-sm">{kw}</span>
                  ))}
                </div>
                <p className="text-mystic-star text-base leading-relaxed">{displayCard.meanings.reversed}</p>
              </div>
              <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-rose/20 flex-1">
                <h3 className="text-base font-heading text-mystic-rose mb-2">生活场景</h3>
                <ul className="space-y-1.5">
                  {displayCard.lifeScenes.reversed.map((scene, i) => (
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
                  onBlur={() => saveNote(displayCard.id, note)}
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
