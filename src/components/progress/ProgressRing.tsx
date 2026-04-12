interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  percentage,
  size = 100,
  strokeWidth = 8,
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-mystic-veil"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-mystic-gold transition-all duration-700"
        />
      </svg>
      <div className="text-center -mt-[calc(50%+8px)] mb-4">
        <div className="text-lg font-heading text-mystic-gold">{percentage}%</div>
      </div>
      {label && <div className="text-xs text-mystic-star mt-1">{label}</div>}
      {sublabel && <div className="text-[10px] text-mystic-star/60">{sublabel}</div>}
    </div>
  );
}
