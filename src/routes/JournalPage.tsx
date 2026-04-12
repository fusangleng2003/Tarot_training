import { useProgressContext } from "../context/ProgressContext";
import { getCardById } from "../data/cards";

export function JournalPage() {
  const { progress } = useProgressContext();

  const entries = [...progress.dailyCardHistory].reverse();

  // Most drawn cards
  const cardFreq: Record<string, number> = {};
  progress.dailyCardHistory.forEach((e) => {
    cardFreq[e.cardId] = (cardFreq[e.cardId] || 0) + 1;
  });
  const topCards = Object.entries(cardFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-heading text-mystic-gold mb-2">个人日志</h1>
      <p className="text-mystic-star/60 text-sm mb-8">
        回顾你的每日一牌记录和学习历程
      </p>

      {/* Stats */}
      {topCards.length > 0 && (
        <div className="bg-mystic-deep/50 rounded-lg p-5 border border-mystic-veil mb-8">
          <h3 className="text-sm font-heading text-mystic-gold mb-3">最常抽到的牌</h3>
          <div className="space-y-2">
            {topCards.map(([cardId, count]) => {
              const card = getCardById(cardId);
              return (
                <div key={cardId} className="flex items-center justify-between">
                  <span className="text-mystic-star text-sm">{card?.name ?? cardId}</span>
                  <span className="text-mystic-star/40 text-xs">{count} 次</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline */}
      {entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => {
            const card = getCardById(entry.cardId);
            return (
              <div
                key={entry.date}
                className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-mystic-gold text-xs font-heading">{entry.date}</span>
                  <span className="text-mystic-star/40 text-[10px]">
                    {entry.orientation === "upright" ? "正位" : "逆位"}
                  </span>
                </div>
                <div className="text-mystic-moon text-sm font-body">
                  {card?.name ?? entry.cardId}
                </div>
                {entry.journalNote && (
                  <p className="text-mystic-star/70 text-sm mt-2 italic">
                    "{entry.journalNote}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-mystic-star/40">
          <p>还没有日志记录</p>
          <p className="text-xs mt-1">每天翻一张牌开始你的学习之旅吧</p>
        </div>
      )}
    </div>
  );
}
