import { useState, useCallback, useMemo } from "react";
import { tarotCards } from "../data/cards";
import type { TarotCard, QuizMode, QuizSession, QuizResult } from "../types/tarot";

interface QuizState {
  phase: "setup" | "question" | "revealed" | "complete";
  mode: QuizMode;
  cards: TarotCard[];
  currentIndex: number;
  results: QuizResult[];
  startedAt: number;
  questionStartedAt: number;
  options: string[];
  correctAnswer: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateOptions(
  correctCard: TarotCard,
  mode: QuizMode,
  allCards: TarotCard[]
): { options: string[]; correctAnswer: string } {
  let correctAnswer: string;
  let pool: string[];

  switch (mode) {
    case "image-to-name":
      correctAnswer = correctCard.name;
      pool = allCards.map((c) => c.name);
      break;
    case "name-to-keywords":
      correctAnswer = correctCard.keywords.upright.slice(0, 2).join("、");
      pool = allCards.map((c) => c.keywords.upright.slice(0, 2).join("、"));
      break;
    case "keywords-to-name":
      correctAnswer = correctCard.name;
      pool = allCards.map((c) => c.name);
      break;
  }

  const wrongOptions = shuffle(pool.filter((p) => p !== correctAnswer)).slice(0, 3);
  const options = shuffle([correctAnswer, ...wrongOptions]);
  return { options, correctAnswer };
}

export function useQuiz() {
  const [state, setState] = useState<QuizState>({
    phase: "setup",
    mode: "image-to-name",
    cards: [],
    currentIndex: 0,
    results: [],
    startedAt: 0,
    questionStartedAt: 0,
    options: [],
    correctAnswer: "",
  });

  const startQuiz = useCallback(
    (mode: QuizMode, filter?: { arcana?: "major" | "minor"; suit?: string }) => {
      let pool = [...tarotCards];
      if (filter?.arcana) pool = pool.filter((c) => c.arcana === filter.arcana);
      if (filter?.suit) pool = pool.filter((c) => c.suit === filter.suit);

      const cards = shuffle(pool).slice(0, 10);
      const { options, correctAnswer } = generateOptions(cards[0], mode, pool);

      setState({
        phase: "question",
        mode,
        cards,
        currentIndex: 0,
        results: [],
        startedAt: Date.now(),
        questionStartedAt: Date.now(),
        options,
        correctAnswer,
      });
    },
    []
  );

  const answer = useCallback(
    (choice: string) => {
      const correct = choice === state.correctAnswer;
      const timeSpentMs = Date.now() - state.questionStartedAt;
      const result: QuizResult = {
        cardId: state.cards[state.currentIndex].id,
        correct,
        timeSpentMs,
      };

      setState((prev) => ({
        ...prev,
        phase: "revealed",
        results: [...prev.results, result],
      }));
    },
    [state.correctAnswer, state.questionStartedAt, state.cards, state.currentIndex]
  );

  const next = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= prev.cards.length) {
        return { ...prev, phase: "complete" };
      }
      const pool =
        prev.cards[0].arcana === "major"
          ? tarotCards.filter((c) => c.arcana === "major")
          : prev.cards[0].suit
            ? tarotCards.filter((c) => c.suit === prev.cards[0].suit)
            : tarotCards;
      const { options, correctAnswer } = generateOptions(prev.cards[nextIndex], prev.mode, pool);
      return {
        ...prev,
        phase: "question",
        currentIndex: nextIndex,
        questionStartedAt: Date.now(),
        options,
        correctAnswer,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "setup" }));
  }, []);

  const currentCard = state.cards[state.currentIndex] ?? null;
  const score = useMemo(
    () => ({
      correct: state.results.filter((r) => r.correct).length,
      total: state.results.length,
    }),
    [state.results]
  );

  const session: QuizSession | null =
    state.phase === "complete"
      ? {
          sessionId: `quiz_${state.startedAt}`,
          startedAt: state.startedAt,
          completedAt: Date.now(),
          mode: state.mode,
          results: state.results,
        }
      : null;

  return {
    phase: state.phase,
    mode: state.mode,
    currentCard,
    options: state.options,
    correctAnswer: state.correctAnswer,
    currentIndex: state.currentIndex,
    totalCards: state.cards.length,
    score,
    session,
    startQuiz,
    answer,
    next,
    reset,
  };
}
