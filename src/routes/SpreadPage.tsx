import { useNavigate } from "react-router-dom";
import { spreadLayouts } from "../data/spreads";

export function SpreadPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-heading text-mystic-gold mb-2">牌阵练习</h1>
      <p className="text-mystic-star/60 text-sm mb-8">
        选择一个牌阵，练习将多张牌串联成故事
      </p>

      <div className="space-y-4">
        {spreadLayouts.map((spread) => (
          <button
            key={spread.id}
            onClick={() => navigate(`/spreads/${spread.id}`)}
            className="w-full bg-mystic-deep hover:bg-mystic-veil/30 border border-mystic-veil rounded-lg p-5 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-heading text-mystic-moon group-hover:text-mystic-gold transition-colors">
                {spread.name}
              </h3>
              <span className="text-mystic-star/40 text-xs">
                {spread.positions.length} 张牌
              </span>
            </div>
            <p className="text-mystic-star/70 text-sm">{spread.description}</p>
            <div className="flex gap-2 mt-3">
              {spread.positions.map((pos) => (
                <span
                  key={pos.index}
                  className="px-2 py-0.5 bg-mystic-veil/50 rounded text-[10px] text-mystic-star/60"
                >
                  {pos.label}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
