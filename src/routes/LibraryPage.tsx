import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { tarotCards } from "../data/cards";
import { useProgressContext } from "../context/ProgressContext";
import { CardGrid } from "../components/card/CardGrid";
import type { TarotCard } from "../types/tarot";

type Filter = "all" | "major" | "minor" | "wands" | "cups" | "swords" | "pentacles" | "unlearned";

const DESCRIPTIONS: Record<Filter, { title: string; lines: string[] }> = {
  all: {
    title: "全部 78 张塔罗牌",
    lines: [
      "塔罗牌共 78 张，分为大阿卡纳（22 张）和小阿卡纳（56 张）两大部分。",
      "大阿卡纳代表人生重大主题与命运转折；小阿卡纳涵盖日常生活中的具体事件与情境。",
    ],
  },
  major: {
    title: "大阿卡纳（Major Arcana）· 22 张",
    lines: [
      "编号 0～21，每张都有独立名字：愚者（0）、魔术师（1）、女祭司（2）……直至世界（21）。",
      "抽到大阿卡纳通常意味着重大主题、命运转折或人生课题，解读时权重更高。",
    ],
  },
  minor: {
    title: "小阿卡纳（Minor Arcana）· 56 张",
    lines: [
      "小阿卡纳分为四个花色，每个花色 14 张（数字牌 A～10 共 10 张 + 宫廷牌侍从、骑士、皇后、国王共 4 张）。",
      "权杖（行动与热情）、圣杯（情感与关系）、宝剑（思维与冲突）、星币（金钱与现实）。",
    ],
  },
  wands: {
    title: "权杖（Wands）· 14 张",
    lines: [
      "对应元素：火。",
      "主题：行动、热情、创造力、事业与志向。",
      "包含权杖 A～10（数字牌）以及权杖侍从、骑士、皇后、国王（宫廷牌）。",
    ],
  },
  cups: {
    title: "圣杯（Cups）· 14 张",
    lines: [
      "对应元素：水。",
      "主题：情感、关系、直觉、内心世界。",
      "包含圣杯 A～10（数字牌）以及圣杯侍从、骑士、皇后、国王（宫廷牌）。",
    ],
  },
  swords: {
    title: "宝剑（Swords）· 14 张",
    lines: [
      "对应元素：风。",
      "主题：思维、语言、冲突、决策与真相。",
      "包含宝剑 A～10（数字牌）以及宝剑侍从、骑士、皇后、国王（宫廷牌）。",
    ],
  },
  pentacles: {
    title: "星币（Pentacles）· 14 张",
    lines: [
      "对应元素：土。",
      "主题：金钱、物质、现实、身体与工作。",
      "包含星币 A～10（数字牌）以及星币侍从、骑士、皇后、国王（宫廷牌）。",
    ],
  },
  unlearned: {
    title: "未掌握的卡牌",
    lines: [
      "这里列出了你尚未标记为掌握的卡牌。",
      "重点复习这些牌，帮助你更快完成全套塔罗牌的学习。",
    ],
  },
};

const suitFilters: { key: Filter; label: string }[] = [
  { key: "wands", label: "权杖" },
  { key: "cups", label: "圣杯" },
  { key: "swords", label: "宝剑" },
  { key: "pentacles", label: "星币" },
];

export function LibraryPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [minorOpen, setMinorOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { progress } = useProgressContext();
  const navigate = useNavigate();

  const handleFilterClick = (f: Filter) => {
    if (f === "minor") {
      setMinorOpen((o) => !o);
      setFilter("minor");
    } else {
      if (f !== "wands" && f !== "cups" && f !== "swords" && f !== "pentacles") {
        setMinorOpen(false);
      }
      setFilter(f);
    }
  };

  const filteredCards = useMemo(() => {
    let cards = tarotCards;

    if (filter === "major") cards = cards.filter((c) => c.arcana === "major");
    else if (filter === "minor") cards = cards.filter((c) => c.arcana === "minor");
    else if (filter === "unlearned") cards = cards.filter((c) => !progress.learnedCards.includes(c.id));
    else if (filter === "wands" || filter === "cups" || filter === "swords" || filter === "pentacles")
      cards = cards.filter((c) => c.suit === filter);

    if (search.trim()) {
      const q = search.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.nameEn.toLowerCase().includes(q) ||
          c.keywords.upright.some((k) => k.includes(q)) ||
          c.keywords.reversed.some((k) => k.includes(q))
      );
    }

    return cards;
  }, [filter, search, progress.learnedCards]);

  const handleCardClick = (card: TarotCard) => {
    navigate(`/library/${card.id}`);
  };

  const desc = DESCRIPTIONS[filter as Filter] ?? DESCRIPTIONS["all"];

  return (
    <div className="h-screen flex flex-col overflow-hidden px-8 pt-6">
      {/* Header */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-heading text-mystic-gold mb-1">卡牌图书馆</h1>
          <p className="text-mystic-star/60 text-sm">
            全部 78 张塔罗牌 · 已掌握 {progress.learnedCards.length} 张
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索牌名或关键词..."
          className="bg-mystic-deep border border-mystic-veil rounded-lg px-4 py-2 text-sm text-mystic-moon placeholder:text-mystic-star/30 focus:outline-none focus:border-mystic-glow w-56"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {/* 全部 */}
        <button
          onClick={() => handleFilterClick("all")}
          className={`px-4 py-1.5 rounded-full text-sm font-body transition-colors ${
            filter === "all" ? "bg-mystic-glow text-white" : "bg-mystic-deep text-mystic-star hover:bg-mystic-veil"
          }`}
        >
          全部
        </button>

        {/* 大阿卡纳 */}
        <button
          onClick={() => handleFilterClick("major")}
          className={`px-4 py-1.5 rounded-full text-sm font-body transition-colors ${
            filter === "major" ? "bg-mystic-glow text-white" : "bg-mystic-deep text-mystic-star hover:bg-mystic-veil"
          }`}
        >
          大阿卡纳 <span className="opacity-60 text-xs">22</span>
        </button>

        {/* 小阿卡纳 + 展开的子选项 */}
        <button
          onClick={() => handleFilterClick("minor")}
          className={`px-4 py-1.5 rounded-full text-sm font-body transition-colors ${
            filter === "minor" ? "bg-mystic-glow text-white" : "bg-mystic-deep text-mystic-star hover:bg-mystic-veil"
          }`}
        >
          小阿卡纳 <span className="opacity-60 text-xs">56</span> {minorOpen ? "▴" : "▾"}
        </button>

        {minorOpen && (
          <div className="flex gap-2">
            {suitFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => handleFilterClick(f.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-body transition-colors border ${
                  filter === f.key
                    ? "bg-mystic-glow text-white border-mystic-glow"
                    : "bg-mystic-deep/60 text-mystic-star border-mystic-veil hover:bg-mystic-veil"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* 未掌握 */}
        <button
          onClick={() => handleFilterClick("unlearned")}
          className={`ml-auto px-4 py-1.5 rounded-full text-sm font-body transition-colors ${
            filter === "unlearned" ? "bg-mystic-glow text-white" : "bg-mystic-deep text-mystic-star hover:bg-mystic-veil"
          }`}
        >
          未掌握 <span className="opacity-60 text-xs">({78 - progress.learnedCards.length})</span>
        </button>
      </div>

      {/* Description bar */}
      <div className="mb-3 px-5 py-3 bg-mystic-deep/60 border border-mystic-veil rounded-lg">
        <div className="text-mystic-gold text-base font-bold mb-1.5">{desc.title}</div>
        <div className="space-y-0.5">
          {desc.lines.map((line, i) => (
            <div key={i} className="text-mystic-star/70 text-xs leading-relaxed">{line}</div>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="flex-1 overflow-y-auto">
        {filteredCards.length > 0 ? (
          <CardGrid
            cards={filteredCards}
            learnedCardIds={progress.learnedCards}
            onCardClick={handleCardClick}
          />
        ) : (
          <div className="text-center py-20 text-mystic-star/40">
            {search ? "没有找到匹配的卡牌" : "太棒了，所有卡牌都已掌握！"}
          </div>
        )}
      </div>
    </div>
  );
}
