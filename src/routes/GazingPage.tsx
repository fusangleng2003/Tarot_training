import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDailyCard } from "../hooks/useDailyCard";
import { useProgressContext } from "../context/ProgressContext";
import { tarotCards } from "../data/cards";
import type { TarotCard, CardOrientation, DailyMode } from "../types/tarot";

// 大阿卡纳牌号
const SENSITIVE_NUMBERS = new Set([6, 7, 10, 13, 15, 18]);

function getMajorArcana(excludeSensitive: boolean): TarotCard[] {
  return tarotCards.filter(
    (c) => c.arcana === "major" && (!excludeSensitive || !SENSITIVE_NUMBERS.has(c.number))
  );
}

function drawFromPool(pool: TarotCard[]): { card: TarotCard; orientation: CardOrientation } {
  const card = pool[Math.floor(Math.random() * pool.length)];
  const orientation: CardOrientation = Math.random() > 0.7 ? "reversed" : "upright";
  return { card, orientation };
}

interface GazingPageProps {
  imagination?: boolean;
}

export function GazingPage({ imagination = false }: GazingPageProps) {
  const navigate = useNavigate();
  const { today } = useDailyCard();
  const { progress, addDailyCard, updateDailyJournal } = useProgressContext();

  const mode: DailyMode = imagination ? "imagination" : "gazing";
  const modeLabel = imagination ? "想象仪式" : "注视仪式";

  const todayEntry = useMemo(
    () => progress.dailyCardHistory.find((e) => e.date === today && e.mode === mode),
    [progress.dailyCardHistory, today, mode]
  );

  const [excludeSensitive, setExcludeSensitive] = useState(true);
  const [card, setCard] = useState<TarotCard | null>(() =>
    todayEntry ? (tarotCards.find((c) => c.id === todayEntry.cardId) ?? null) : null
  );
  const [orientation, setOrientation] = useState<CardOrientation>(
    () => todayEntry?.orientation ?? "upright"
  );

  // 三个阶段：select（选项）→ gazing（计时凝视）→ done（完成，写感想）
  type Phase = "select" | "gazing" | "done";
  const [phase, setPhase] = useState<Phase>(() => (todayEntry ? "done" : "select"));

  const [journal, setJournal] = useState(() => todayEntry?.journalNote ?? "");

  // 计时器：倒计时180秒
  const [secondsLeft, setSecondsLeft] = useState(180);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === "gazing") {
      setSecondsLeft(180);
      timerRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(timerRef.current!);
            setPhase("done");
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const handleStart = () => {
    const pool = getMajorArcana(excludeSensitive);
    const { card: newCard, orientation: newOrientation } = drawFromPool(pool);
    setCard(newCard);
    setOrientation(newOrientation);
    setPhase("gazing");
    addDailyCard({ date: today, cardId: newCard.id, orientation: newOrientation, mode });
  };

  const handleSkipTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("done");
  };

  const handleSaveJournal = () => updateDailyJournal(today, journal);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercent = ((180 - secondsLeft) / 180) * 100;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 选项阶段 */}
      {phase === "select" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <div className="text-center">
            <h1 className="text-3xl font-heading text-mystic-gold mb-1">{modeLabel}</h1>
            <p className="text-mystic-star/60 text-sm">{today} · 仅限大阿卡纳</p>
          </div>

          <div className="max-w-sm text-center text-mystic-star/60 text-sm leading-relaxed bg-mystic-deep/50 rounded-xl p-5 border border-mystic-veil">
            {imagination ? (
              <>
                看一眼抽到的牌，然后<strong className="text-mystic-star">闭上眼睛</strong>，想象自己身处牌面所描绘的世界。<br />
                观察你所见到的一切，不要移动，只是观察。<br />
                <span className="text-mystic-star/40 text-xs mt-2 block">时间不超过3分钟</span>
              </>
            ) : (
              <>
                抽到牌后，<strong className="text-mystic-star">凝视牌面</strong>，让自己的潜意识与它产生共鸣。<br />
                不需要分析，只是静静地看。<br />
                <span className="text-mystic-star/40 text-xs mt-2 block">时间不超过3分钟</span>
              </>
            )}
          </div>

          {/* 排除敏感牌选项 */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => setExcludeSensitive((v) => !v)}
              className={`w-10 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 ${excludeSensitive ? "bg-mystic-gold/60" : "bg-mystic-veil"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${excludeSensitive ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            <span className="text-mystic-star/70 text-sm">排除敏感牌（恋人、战车、命运之轮、死神、恶魔、月亮）</span>
          </label>

          <button
            onClick={handleStart}
            className="px-8 py-3 rounded-full border-2 border-purple-400/50 text-purple-300 font-heading text-lg hover:border-purple-400 hover:shadow-[0_0_30px_rgba(192,132,252,0.15)] transition-all duration-300"
          >
            开始抽牌
          </button>

          <button onClick={() => navigate("/daily")} className="text-mystic-star/40 hover:text-mystic-star text-sm transition-colors">
            ← 返回
          </button>
        </div>
      )}

      {/* 凝视/想象阶段 */}
      {phase === "gazing" && card && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <div className="text-center">
            <h2 className="text-xl font-heading text-purple-300 mb-1">
              {imagination ? "闭眼想象..." : "凝视这张牌..."}
            </h2>
            <p className="text-mystic-star/50 text-sm">
              {card.name}
              <span className="ml-2 text-mystic-star/30">{orientation === "reversed" ? "逆位" : "正位"}</span>
            </p>
          </div>

          {/* 牌图 */}
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={card.name}
              className={`h-72 w-auto rounded-xl border-2 border-purple-400/40 shadow-[0_0_40px_rgba(192,132,252,0.15)] ${orientation === "reversed" ? "rotate-180" : ""}`}
            />
          ) : (
            <div className={`h-72 w-48 rounded-xl border-2 border-purple-400/40 bg-gradient-to-b from-mystic-deep to-mystic-veil flex items-center justify-center ${orientation === "reversed" ? "rotate-180" : ""}`}>
              <span className="text-purple-300 text-5xl">◉</span>
            </div>
          )}

          {/* 计时器圆环 */}
          <div className="relative flex items-center justify-center">
            <svg width="80" height="80" className="-rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(192,132,252,0.15)" strokeWidth="4" />
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke="rgba(192,132,252,0.7)"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPercent / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-purple-300 font-heading text-sm">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          </div>

          <button
            onClick={handleSkipTimer}
            className="text-mystic-star/40 hover:text-mystic-star text-sm transition-colors"
          >
            完成凝视 →
          </button>
        </div>
      )}

      {/* 完成阶段 */}
      {phase === "done" && card && (
        <div className="flex-1 overflow-y-auto px-8 py-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => navigate("/daily")} className="text-mystic-star/50 hover:text-mystic-star text-sm transition-colors">
              ← 返回
            </button>
            <span className="text-mystic-star/40 text-xs">{today} · {modeLabel}</span>
          </div>

          <div className="max-w-lg mx-auto flex flex-col gap-5">
            {/* 牌信息 */}
            <div className="flex gap-5 items-start">
              {card.imageUrl ? (
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className={`h-40 w-auto rounded-xl border-2 border-purple-400/40 shadow-lg flex-shrink-0 ${orientation === "reversed" ? "rotate-180" : ""}`}
                />
              ) : (
                <div className={`h-40 w-28 rounded-xl border-2 border-purple-400/40 bg-gradient-to-b from-mystic-deep to-mystic-veil flex items-center justify-center flex-shrink-0 ${orientation === "reversed" ? "rotate-180" : ""}`}>
                  <span className="text-purple-300 text-3xl">◉</span>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <div>
                  <span className="text-purple-300 font-heading text-2xl">{card.name}</span>
                  <span className="ml-2 text-mystic-star/50">{card.nameEn}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-400/10 text-purple-300`}>
                    {orientation === "reversed" ? "逆位" : "正位"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(orientation === "reversed" ? card.keywords.reversed : card.keywords.upright).map((kw) => (
                    <span key={kw} className="text-xs px-2 py-0.5 bg-purple-400/10 text-purple-300/80 rounded">{kw}</span>
                  ))}
                </div>
                <p className="text-mystic-star/70 text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>

            {/* 象征符号 */}
            {card.symbolism.length > 0 && (
              <div className="bg-mystic-deep/50 rounded-lg p-4 border border-purple-400/20">
                <h3 className="text-sm font-heading text-purple-300 mb-2">牌面象征</h3>
                <ul className="space-y-1">
                  {card.symbolism.map((s, i) => (
                    <li key={i} className="text-mystic-star/70 text-sm flex items-start gap-2">
                      <span className="text-purple-300/40 mt-0.5">·</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 感想 */}
            <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil">
              <h3 className="text-sm font-heading text-mystic-gold mb-2">
                {imagination ? "你在牌中的世界看到了什么？" : "凝视这张牌，你感受到了什么？"}
              </h3>
              <textarea
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                onBlur={handleSaveJournal}
                placeholder={imagination ? "描述你在冥想中看到的画面、感受到的情绪..." : "写下你凝视时浮现的想法、感受、联想..."}
                className="w-full h-28 bg-mystic-void/50 border border-mystic-veil rounded p-3 text-mystic-moon text-sm resize-none focus:outline-none focus:border-mystic-glow placeholder:text-mystic-star/30"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
