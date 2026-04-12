import { tarotCards } from "../data/cards";
import type { TarotCard, CardOrientation } from "../types/tarot";

export function drawRandomCard(): { card: TarotCard; orientation: CardOrientation } {
  const cardIndex = Math.floor(Math.random() * tarotCards.length);
  const orientation: CardOrientation = Math.random() > 0.7 ? "reversed" : "upright";
  return { card: tarotCards[cardIndex], orientation };
}

export function useDailyCard() {
  // 开发调试：在浏览器控制台执行 localStorage.setItem('__debug_date', '2099-01-01') 可覆盖日期
  // 清除：localStorage.removeItem('__debug_date')
  const debugDate = import.meta.env.DEV ? localStorage.getItem("__debug_date") : null;
  const today = debugDate ?? new Date().toISOString().split("T")[0];
  return { today };
}
