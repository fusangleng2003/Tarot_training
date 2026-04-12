import { useProgressContext } from "../context/ProgressContext";
import { ProgressRing } from "../components/progress/ProgressRing";

export function ProgressPage() {
  const { progress, learningPercentage, learnedCount, stageInfo, currentStage } =
    useProgressContext();

  const majorLearned = progress.learnedCards.filter((id) => id.startsWith("major-")).length;
  const suitStats = [
    { suit: "wands", name: "权杖", color: "bg-red-500" },
    { suit: "cups", name: "圣杯", color: "bg-blue-500" },
    { suit: "swords", name: "宝剑", color: "bg-yellow-500" },
    { suit: "pentacles", name: "星币", color: "bg-green-500" },
  ].map((s) => ({
    ...s,
    learned: progress.learnedCards.filter((id) => id.startsWith(s.suit)).length,
    total: 14,
  }));

  const quizCount = progress.quizHistory.length;
  const avgScore =
    quizCount > 0
      ? Math.round(
          (progress.quizHistory.reduce(
            (sum, s) => sum + s.results.filter((r) => r.correct).length / s.results.length,
            0
          ) /
            quizCount) *
            100
        )
      : 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-heading text-mystic-gold mb-8">学习进度</h1>

      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="已掌握" value={`${learnedCount}/78`} />
        <StatCard label="连续天数" value={`${progress.streakCount} 天`} />
        <StatCard label="测验次数" value={`${quizCount} 次`} />
        <StatCard label="平均正确率" value={`${avgScore}%`} />
      </div>

      {/* Progress Ring */}
      <div className="flex justify-center mb-8">
        <ProgressRing percentage={learningPercentage} size={140} label="总体进度" />
      </div>

      {/* Arcana Breakdown */}
      <div className="bg-mystic-deep/50 rounded-lg p-5 border border-mystic-veil mb-6">
        <h3 className="text-sm font-heading text-mystic-gold mb-4">分类进度</h3>

        {/* Major */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-mystic-star mb-1">
            <span>大阿卡纳</span>
            <span>{majorLearned}/22</span>
          </div>
          <div className="h-2 bg-mystic-veil rounded-full">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${(majorLearned / 22) * 100}%` }}
            />
          </div>
        </div>

        {/* Minor Suits */}
        {suitStats.map((s) => (
          <div key={s.suit} className="mb-3">
            <div className="flex justify-between text-xs text-mystic-star mb-1">
              <span>{s.name}</span>
              <span>{s.learned}/{s.total}</span>
            </div>
            <div className="h-2 bg-mystic-veil rounded-full">
              <div
                className={`h-full ${s.color} rounded-full transition-all`}
                style={{ width: `${(s.learned / s.total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Learning Stages */}
      <div className="bg-mystic-deep/50 rounded-lg p-5 border border-mystic-veil">
        <h3 className="text-sm font-heading text-mystic-gold mb-4">学习阶段</h3>
        <div className="space-y-3">
          {stageInfo.map((s) => {
            const unlocked = currentStage >= s.stage;
            return (
              <div
                key={s.stage}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  unlocked ? "bg-mystic-glow/10" : "bg-mystic-void/30"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    unlocked ? "bg-mystic-gold text-mystic-void" : "bg-mystic-veil text-mystic-star/40"
                  }`}
                >
                  {unlocked ? "✓" : s.stage}
                </div>
                <div className="flex-1">
                  <div className={`text-sm ${unlocked ? "text-mystic-moon" : "text-mystic-star/40"}`}>
                    阶段{s.stage}：{s.name}
                  </div>
                  <div className="text-xs text-mystic-star/40">{s.requirement}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-mystic-deep/50 rounded-lg p-4 border border-mystic-veil text-center">
      <div className="text-lg font-heading text-mystic-gold">{value}</div>
      <div className="text-[10px] text-mystic-star/60 mt-1">{label}</div>
    </div>
  );
}
