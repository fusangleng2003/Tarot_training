import { useQuiz } from "../hooks/useQuiz";
import { useProgressContext } from "../context/ProgressContext";
import { TarotCard } from "../components/card/TarotCard";
import type { QuizMode } from "../types/tarot";

const modeLabels: Record<QuizMode, { name: string; desc: string }> = {
  "image-to-name": { name: "看图猜牌名", desc: "看到牌面，选出正确的牌名" },
  "name-to-keywords": { name: "看牌名选关键词", desc: "看到牌名，选出正确的关键词" },
  "keywords-to-name": { name: "看关键词猜牌", desc: "看到关键词，猜出是哪张牌" },
};

export function QuizPage() {
  const quiz = useQuiz();
  const { addQuizSession } = useProgressContext();

  // Setup Phase
  if (quiz.phase === "setup") {
    return (
      <div className="max-w-lg mx-auto px-6 py-10">
        <h1 className="text-2xl font-heading text-mystic-gold mb-2">闪卡测验</h1>
        <p className="text-mystic-star/60 text-sm mb-8">选择测验模式，检验你的学习成果</p>

        <div className="space-y-3">
          {(Object.entries(modeLabels) as [QuizMode, { name: string; desc: string }][]).map(
            ([mode, { name, desc }]) => (
              <button
                key={mode}
                onClick={() => quiz.startQuiz(mode)}
                className="w-full bg-mystic-deep hover:bg-mystic-veil/50 border border-mystic-veil rounded-lg p-4 text-left transition-colors group"
              >
                <div className="text-mystic-moon text-sm font-body group-hover:text-mystic-gold transition-colors">
                  {name}
                </div>
                <div className="text-mystic-star/50 text-xs mt-1">{desc}</div>
              </button>
            )
          )}
        </div>

        <div className="mt-8 space-y-2">
          <p className="text-mystic-star/40 text-xs">快速开始（指定范围）：</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => quiz.startQuiz("image-to-name", { arcana: "major" })}
              className="px-3 py-1 bg-mystic-deep border border-mystic-veil rounded text-xs text-mystic-star hover:border-mystic-glow"
            >
              仅大阿卡纳
            </button>
            {["wands", "cups", "swords", "pentacles"].map((suit) => (
              <button
                key={suit}
                onClick={() => quiz.startQuiz("image-to-name", { suit })}
                className="px-3 py-1 bg-mystic-deep border border-mystic-veil rounded text-xs text-mystic-star hover:border-mystic-glow"
              >
                仅{suitName(suit)}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Complete Phase
  if (quiz.phase === "complete") {
    if (quiz.session) {
      addQuizSession(quiz.session);
    }
    const pct = quiz.score.total > 0 ? Math.round((quiz.score.correct / quiz.score.total) * 100) : 0;
    return (
      <div className="max-w-lg mx-auto px-6 py-10 text-center">
        <h2 className="text-2xl font-heading text-mystic-gold mb-4">测验完成！</h2>
        <div className="bg-mystic-deep rounded-lg p-8 border border-mystic-veil mb-6">
          <div className="text-5xl font-heading text-mystic-gold mb-2">{pct}%</div>
          <div className="text-mystic-star text-sm">
            {quiz.score.correct} / {quiz.score.total} 正确
          </div>
          <div className="mt-4 text-mystic-star/60 text-sm">
            {pct >= 80 ? "太棒了！你对这些牌已经很熟悉了 ✨" : pct >= 50 ? "不错！继续加油 💪" : "还需要多加练习，别灰心 🌱"}
          </div>
        </div>
        <button
          onClick={quiz.reset}
          className="px-6 py-2 bg-mystic-glow text-white rounded-lg text-sm hover:bg-mystic-glow/80"
        >
          再来一轮
        </button>
      </div>
    );
  }

  // Question / Revealed Phase
  if (!quiz.currentCard) return null;

  const questionText =
    quiz.mode === "image-to-name"
      ? "这是哪张牌？"
      : quiz.mode === "name-to-keywords"
        ? `「${quiz.currentCard.name}」的关键词是？`
        : `关键词「${quiz.currentCard.keywords.upright.slice(0, 2).join("、")}」对应哪张牌？`;

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-mystic-star/60 text-xs">
          {quiz.currentIndex + 1} / {quiz.totalCards}
        </span>
        <span className="text-mystic-gold text-xs">
          {quiz.score.correct} 正确
        </span>
      </div>
      <div className="w-full h-1 bg-mystic-veil rounded-full mb-8">
        <div
          className="h-full bg-mystic-gold rounded-full transition-all"
          style={{ width: `${((quiz.currentIndex + 1) / quiz.totalCards) * 100}%` }}
        />
      </div>

      {/* Card / Question */}
      {quiz.mode === "image-to-name" && (
        <div className="flex justify-center mb-6">
          <TarotCard card={quiz.currentCard} size="md" showName={false} />
        </div>
      )}

      <h2 className="text-lg font-body text-mystic-moon text-center mb-6">{questionText}</h2>

      {/* Options */}
      <div className="space-y-3">
        {quiz.options.map((opt) => {
          let style = "bg-mystic-deep border-mystic-veil hover:border-mystic-glow text-mystic-star";
          if (quiz.phase === "revealed") {
            if (opt === quiz.correctAnswer) {
              style = "bg-green-900/30 border-green-500 text-green-300";
            } else {
              style = "bg-mystic-deep border-mystic-veil text-mystic-star/40";
            }
          }
          return (
            <button
              key={opt}
              onClick={() => quiz.phase === "question" && quiz.answer(opt)}
              disabled={quiz.phase === "revealed"}
              className={`w-full p-3 rounded-lg border text-sm text-left transition-colors ${style}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Next */}
      {quiz.phase === "revealed" && (
        <div className="mt-6 text-center">
          <button
            onClick={quiz.next}
            className="px-6 py-2 bg-mystic-glow text-white rounded-lg text-sm hover:bg-mystic-glow/80"
          >
            {quiz.currentIndex + 1 < quiz.totalCards ? "下一题" : "查看结果"}
          </button>
        </div>
      )}
    </div>
  );
}

function suitName(suit: string): string {
  const map: Record<string, string> = { wands: "权杖", cups: "圣杯", swords: "宝剑", pentacles: "星币" };
  return map[suit] ?? suit;
}
