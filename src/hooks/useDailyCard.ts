import { useMemo } from "react";
import { tarotCards } from "../data/cards";
import type { CardOrientation } from "../types/tarot";

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function useDailyCard() {
  const today = new Date().toISOString().split("T")[0];

  const { card, orientation } = useMemo(() => {
    const seed = dateToSeed(today);
    const cardIndex = Math.floor(seededRandom(seed) * tarotCards.length);
    const orientationRand = seededRandom(seed + 1);
    return {
      card: tarotCards[cardIndex],
      orientation: (orientationRand > 0.7 ? "reversed" : "upright") as CardOrientation,
    };
  }, [today]);

  return { card, orientation, today };
}
