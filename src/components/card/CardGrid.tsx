import { TarotCard } from "./TarotCard";
import type { TarotCard as TarotCardType } from "../../types/tarot";

interface CardGridProps {
  cards: TarotCardType[];
  learnedCardIds: string[];
  onCardClick: (card: TarotCardType) => void;
}

export function CardGrid({ cards, learnedCardIds, onCardClick }: CardGridProps) {
  return (
    <div className="grid grid-cols-6 gap-2 pb-6">
      {cards.map((card) => (
        <div key={card.id} className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => onCardClick(card)}>
          <div className="w-full aspect-[2/3] overflow-hidden rounded-lg border border-mystic-gold/20 hover:border-mystic-gold/60 transition-colors">
            <img
              src={card.imageUrl}
              alt={card.name}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-base font-bold text-mystic-moon text-center leading-tight">{card.name}</span>
        </div>
      ))}
    </div>
  );
}
