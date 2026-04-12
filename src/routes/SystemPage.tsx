import { useState } from "react";
import { elements, numberMeanings, courtRoles } from "../data/system";

type Tab = "elements" | "numbers" | "court";

export function SystemPage() {
  const [tab, setTab] = useState<Tab>("elements");

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-heading text-mystic-gold mb-2">知识体系</h1>
      <p className="text-mystic-star/60 text-sm mb-6">
        发现牌意背后的共同规律，做到举一反三
      </p>

      {/* Tabs */}
      <div className="flex border-b border-mystic-veil mb-8">
        {([
          ["elements", "四大元素"],
          ["numbers", "数字学"],
          ["court", "宫廷牌"],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              tab === key
                ? "border-mystic-gold text-mystic-gold"
                : "border-transparent text-mystic-star/60 hover:text-mystic-star"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Elements */}
      {tab === "elements" && (
        <div className="space-y-6">
          {elements.map((el) => (
            <div
              key={el.id}
              className="bg-mystic-deep/50 rounded-lg p-5 border border-mystic-veil"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: el.color + "20", color: el.color }}
                >
                  {el.name === "火" ? "🔥" : el.name === "水" ? "💧" : el.name === "风" ? "💨" : "🌍"}
                </div>
                <div>
                  <h3 className="font-heading text-mystic-gold">
                    {el.name} · {el.nameEn}
                  </h3>
                  <p className="text-xs text-mystic-star/60">
                    对应花色：{el.suitName}
                  </p>
                </div>
              </div>
              <p className="text-mystic-star text-sm leading-relaxed mb-3">{el.description}</p>
              <div className="flex flex-wrap gap-2">
                {el.traits.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded text-xs"
                    style={{ backgroundColor: el.color + "15", color: el.color }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Numbers */}
      {tab === "numbers" && (
        <div className="space-y-4">
          {numberMeanings.map((nm) => (
            <div
              key={nm.number}
              className="bg-mystic-deep/50 rounded-lg p-5 border border-mystic-veil"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-mystic-glow/20 flex items-center justify-center text-mystic-gold font-heading text-lg flex-shrink-0">
                  {nm.number}
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-mystic-gold text-sm">{nm.name}</h3>
                  <p className="text-mystic-star/70 text-xs mb-2">{nm.theme}</p>
                  <p className="text-mystic-star text-sm mb-3">{nm.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <MiniSuitCard suit="权杖" color="#e85d3a" text={nm.suits.wands} />
                    <MiniSuitCard suit="圣杯" color="#4a90d9" text={nm.suits.cups} />
                    <MiniSuitCard suit="宝剑" color="#f0d85c" text={nm.suits.swords} />
                    <MiniSuitCard suit="星币" color="#5daa68" text={nm.suits.pentacles} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Court */}
      {tab === "court" && (
        <div className="space-y-4">
          <p className="text-mystic-star/70 text-sm mb-4">
            宫廷牌代表了四种不同成熟度的人物原型。从侍从到国王，展现了一个人在某个领域从初学者到大师的成长历程。
          </p>
          {courtRoles.map((role) => (
            <div
              key={role.rank}
              className="bg-mystic-deep/50 rounded-lg p-5 border border-mystic-veil"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-mystic-gold/10 flex items-center justify-center text-mystic-gold font-heading text-sm flex-shrink-0">
                  {role.rank[0]}
                </div>
                <div>
                  <h3 className="font-heading text-mystic-gold text-sm">
                    {role.rank} · {role.rankEn}
                  </h3>
                  <p className="text-mystic-star/60 text-xs mb-2">{role.maturity}</p>
                  <p className="text-mystic-star text-sm mb-2">{role.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {role.traits.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 bg-mystic-glow/10 text-mystic-star rounded text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniSuitCard({ suit, color, text }: { suit: string; color: string; text: string }) {
  return (
    <div
      className="rounded p-2 text-xs"
      style={{ backgroundColor: color + "10" }}
    >
      <span style={{ color }} className="font-bold">{suit}：</span>
      <span className="text-mystic-star/70">{text}</span>
    </div>
  );
}
