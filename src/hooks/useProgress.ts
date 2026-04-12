import { useState, useCallback, useEffect } from "react";
import type { UserProgress, DailyCardEntry, QuizSession, CardNote } from "../types/tarot";

const PROGRESS_KEY = "tarot_progress";
const NOTES_KEY = "tarot_notes";

function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    learnedCards: [],
    quizHistory: [],
    dailyCardHistory: [],
    streakCount: 0,
    lastActiveDate: "",
  };
}

function saveProgress(p: UserProgress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const markLearned = useCallback((cardId: string) => {
    setProgress((prev) => {
      if (prev.learnedCards.includes(cardId)) return prev;
      return { ...prev, learnedCards: [...prev.learnedCards, cardId] };
    });
  }, []);

  const markUnlearned = useCallback((cardId: string) => {
    setProgress((prev) => ({
      ...prev,
      learnedCards: prev.learnedCards.filter((id) => id !== cardId),
    }));
  }, []);

  const isLearned = useCallback(
    (cardId: string) => progress.learnedCards.includes(cardId),
    [progress.learnedCards]
  );

  const addDailyCard = useCallback((entry: DailyCardEntry) => {
    setProgress((prev) => ({
      ...prev,
      dailyCardHistory: [...prev.dailyCardHistory, entry],
    }));
  }, []);

  const updateDailyJournal = useCallback((date: string, note: string, mode?: string) => {
    setProgress((prev) => ({
      ...prev,
      dailyCardHistory: prev.dailyCardHistory.map((e) => {
        if (e.date !== date) return e;
        if (mode !== undefined && (e.mode ?? "single") !== mode) return e;
        return { ...e, journalNote: note };
      }),
    }));
  }, []);

  const addQuizSession = useCallback((session: QuizSession) => {
    setProgress((prev) => ({
      ...prev,
      quizHistory: [...prev.quizHistory.slice(-49), session],
    }));
  }, []);

  const recordDailyVisit = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    setProgress((prev) => {
      if (prev.lastActiveDate === today) return prev;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const newStreak = prev.lastActiveDate === yesterday ? prev.streakCount + 1 : 1;
      return { ...prev, lastActiveDate: today, streakCount: newStreak };
    });
  }, []);

  const learnedCount = progress.learnedCards.length;
  const learningPercentage = Math.round((learnedCount / 78) * 100);

  return {
    progress,
    markLearned,
    markUnlearned,
    isLearned,
    addDailyCard,
    updateDailyJournal,
    addQuizSession,
    recordDailyVisit,
    learnedCount,
    learningPercentage,
  };
}

// 卡牌个人笔记
export function useCardNotes() {
  const [notes, setNotes] = useState<CardNote[]>(() => {
    try {
      const raw = localStorage.getItem(NOTES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);

  const getNote = useCallback(
    (cardId: string) => notes.find((n) => n.cardId === cardId)?.content ?? "",
    [notes]
  );

  const saveNote = useCallback((cardId: string, content: string) => {
    setNotes((prev) => {
      const existing = prev.findIndex((n) => n.cardId === cardId);
      const entry: CardNote = { cardId, content, updatedAt: Date.now() };
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = entry;
        return next;
      }
      return [...prev, entry];
    });
  }, []);

  return { getNote, saveNote };
}
