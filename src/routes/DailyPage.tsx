import { useNavigate } from "react-router-dom";
import { useProgressContext } from "../context/ProgressContext";

interface ModeCard {
  to: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  tip: string;
  color: "gold" | "rose" | "blue" | "purple";
}

const studyMode: ModeCard = {
  to: "/daily/learn",
  title: "学习",
  subtitle: "Study",
  icon: "⊕",
  description: "随机抽一张牌，深入学习正位与逆位含义、关键词、生活场景，并记录你的笔记。",
  tip: "适合系统学习每一张牌",
  color: "gold",
};

const modes: ModeCard[] = [
  {
    to: "/daily/draw",
    title: "每日一抽",
    subtitle: "Single Card",
    icon: "✦",
    description: "从78张牌中随机抽取一张，记录今日感想。每天只抽一次，坚持记录。",
    tip: "推荐：早晨抽牌，观察今天是否有与牌相符的事件",
    color: "gold",
  },
  {
    to: "/daily/body-mind-spirit",
    title: "身心灵",
    subtitle: "Body · Mind · Spirit",
    icon: "◈",
    description: "一次抽三张牌，分别代表身（环境与习惯）、心（当下想法）、灵（未来指引）。",
    tip: "来自 Mary K. Greer《Tarot For Your Self》",
    color: "blue",
  },
  {
    to: "/daily/gazing",
    title: "注视仪式",
    subtitle: "Gazing Ritual",
    icon: "◉",
    description: "从大阿卡纳中抽一张牌，凝视牌面不超过3分钟，与潜意识产生共鸣。",
    tip: "仅限大阿卡纳，可排除敏感牌",
    color: "purple",
  },
  {
    to: "/daily/imagination",
    title: "想象仪式",
    subtitle: "Imagination Ritual",
    icon: "❋",
    description: "注视仪式的加强版。看一眼牌面后闭眼，想象自己身处牌中的世界，观察所见。",
    tip: "建议先练习注视仪式一段时间后再使用",
    color: "rose",
  },
];

const colorMap = {
  gold: {
    border: "border-mystic-gold/30 hover:border-mystic-gold/70",
    icon: "text-mystic-gold",
    badge: "bg-mystic-gold/10 text-mystic-gold/80",
    glow: "hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]",
  },
  rose: {
    border: "border-mystic-rose/30 hover:border-mystic-rose/70",
    icon: "text-mystic-rose",
    badge: "bg-mystic-rose/10 text-mystic-rose/80",
    glow: "hover:shadow-[0_0_30px_rgba(180,80,100,0.1)]",
  },
  blue: {
    border: "border-blue-400/30 hover:border-blue-400/70",
    icon: "text-blue-300",
    badge: "bg-blue-400/10 text-blue-300/80",
    glow: "hover:shadow-[0_0_30px_rgba(96,165,250,0.1)]",
  },
  purple: {
    border: "border-purple-400/30 hover:border-purple-400/70",
    icon: "text-purple-300",
    badge: "bg-purple-400/10 text-purple-300/80",
    glow: "hover:shadow-[0_0_30px_rgba(192,132,252,0.1)]",
  },
};

export function DailyPage() {
  const navigate = useNavigate();
  const { progress } = useProgressContext();
  const today = new Date().toISOString().split("T")[0];
  const todayEntries = progress.dailyCardHistory.filter((e) => e.date === today);

  const modeLabels: Record<string, string> = {
    single: "每日一抽",
    "body-mind-spirit": "身心灵",
    gazing: "注视仪式",
    imagination: "想象仪式",
    learn: "学习",
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden px-8 py-6">
      {/* Header */}
      <div className="mb-4 shrink-0">
        <h1 className="text-3xl font-heading text-mystic-gold">每日训练</h1>
        <p className="text-mystic-star/50 text-sm mt-1">
          {today}
          {progress.streakCount > 0 && (
            <span className="ml-3 text-mystic-gold/70">🔥 连续练习第 {progress.streakCount} 天</span>
          )}
        </p>
        {todayEntries.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {todayEntries.map((e, i) => (
              <span key={i} className="text-xs px-3 py-1 rounded-full bg-mystic-glow/20 text-mystic-gold/80">
                今日已完成：{modeLabels[e.mode ?? "single"]}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* All cards — 3 equal rows, 2 columns */}
      <div className="grid grid-cols-2 grid-rows-3 gap-3 flex-1 min-h-0">
        {/* Study card — spans full width, row 1 */}
        {(() => {
          const c = colorMap[studyMode.color];
          return (
            <button
              onClick={() => navigate(studyMode.to)}
              className={`col-span-2 text-left rounded-2xl border-2 ${c.border} ${c.glow} bg-mystic-deep/60 p-5 flex items-center gap-6 transition-all duration-300 cursor-pointer`}
            >
              <span className={`text-3xl ${c.icon}`}>{studyMode.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-heading text-mystic-moon text-lg">{studyMode.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.badge}`}>{studyMode.subtitle}</span>
                </div>
                <p className="text-mystic-star/60 text-sm mt-1 leading-relaxed">{studyMode.description}</p>
              </div>
              <div className="text-mystic-star/30 text-xs shrink-0">
                {studyMode.tip}
              </div>
            </button>
          );
        })()}

        {/* 4 mode cards — rows 2 & 3 */}
        {modes.map((mode) => {
          const c = colorMap[mode.color];
          return (
            <button
              key={mode.to}
              onClick={() => navigate(mode.to)}
              className={`text-left rounded-2xl border-2 ${c.border} ${c.glow} bg-mystic-deep/60 p-5 flex flex-col gap-3 transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-start justify-between">
                <span className={`text-3xl ${c.icon}`}>{mode.icon}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.badge}`}>{mode.subtitle}</span>
              </div>
              <div>
                <div className="font-heading text-mystic-moon text-lg">{mode.title}</div>
                <p className="text-mystic-star/60 text-sm mt-1 leading-relaxed">{mode.description}</p>
              </div>
              <div className="text-mystic-star/30 text-xs border-t border-mystic-veil/30 pt-2">
                {mode.tip}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
