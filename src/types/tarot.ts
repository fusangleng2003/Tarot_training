export type Arcana = "major" | "minor";
export type Suit = "wands" | "cups" | "swords" | "pentacles";
export type Element = "fire" | "water" | "air" | "earth" | "spirit";
export type CardOrientation = "upright" | "reversed";

export interface TarotCard {
  id: string;
  name: string;
  nameEn: string;
  arcana: Arcana;
  suit: Suit | null;
  number: number;
  element: Element;
  planet?: string;
  zodiac?: string;
  imageUrl: string;

  keywords: {
    upright: string[];
    reversed: string[];
  };

  meanings: {
    upright: string;
    reversed: string;
  };

  description: string;
  symbolism: string[];
  lifeScenes: {
    upright: string[];
    reversed: string[];
  };
  affirmation: string;
  numerology?: string;
}

export interface SpreadLayout {
  id: string;
  name: string;
  description: string;
  positions: SpreadPosition[];
}

export interface SpreadPosition {
  index: number;
  label: string;
  description: string;
  x: number;
  y: number;
}

export interface DrawnSpread {
  layoutId: string;
  drawnAt: number;
  positions: Array<{
    positionIndex: number;
    cardId: string;
    orientation: CardOrientation;
  }>;
  notes?: string;
}

export interface UserProgress {
  learnedCards: string[];
  quizHistory: QuizSession[];
  dailyCardHistory: DailyCardEntry[];
  streakCount: number;
  lastActiveDate: string;
}

export interface QuizSession {
  sessionId: string;
  startedAt: number;
  completedAt?: number;
  mode: QuizMode;
  results: QuizResult[];
}

export type QuizMode = "image-to-name" | "name-to-keywords" | "keywords-to-name";

export interface QuizResult {
  cardId: string;
  correct: boolean;
  timeSpentMs: number;
}

export type DailyMode = "single" | "body-mind-spirit" | "gazing" | "imagination";

export interface DailyCardEntry {
  date: string;
  cardId: string;
  orientation: CardOrientation;
  journalNote?: string;
  mode?: DailyMode;
  // 身心灵模式的额外两张牌
  extraCards?: Array<{ cardId: string; orientation: CardOrientation }>;
}

export interface CardNote {
  cardId: string;
  content: string;
  updatedAt: number;
}

export type LearningStage = 1 | 2 | 3 | 4;
