import { NavLink } from "react-router-dom";
import { useProgressContext } from "../../context/ProgressContext";

interface NavItem {
  to: string;
  label: string;
  icon: string;
  stage: 1 | 2 | 3 | 4;
}

const navItems: NavItem[] = [
  { to: "/daily", label: "每日训练", icon: "☀", stage: 1 },
  { to: "/library", label: "卡牌图书馆", icon: "📚", stage: 1 },
  { to: "/quiz", label: "闪卡测验", icon: "🎯", stage: 1 },
  { to: "/progress", label: "学习进度", icon: "📊", stage: 1 },
  { to: "/spreads", label: "牌阵练习", icon: "🔮", stage: 1 },
  { to: "/system", label: "知识体系", icon: "🌟", stage: 3 },
  { to: "/journal", label: "个人日志", icon: "📝", stage: 4 },
];

export function Sidebar() {
  const { isStageUnlocked, learnedCount, progress } = useProgressContext();

  return (
    <aside className="w-72 min-h-screen bg-mystic-deep border-r border-mystic-veil flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-mystic-veil">
        <h1 className="font-heading text-mystic-gold text-2xl tracking-wider">
          塔罗学院
        </h1>
        <p className="text-xs text-mystic-star mt-1">Tarot Academy</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {navItems.map((item) => {
          const unlocked = isStageUnlocked(item.stage);
          return (
            <NavLink
              key={item.to}
              to={unlocked ? item.to : "#"}
              onClick={(e) => !unlocked && e.preventDefault()}
              className={({ isActive }) =>
                `flex items-center gap-4 px-6 py-3 text-base transition-colors ${
                  !unlocked
                    ? "opacity-40 cursor-not-allowed"
                    : isActive
                      ? "bg-mystic-glow/20 text-mystic-gold border-r-2 border-mystic-gold"
                      : "text-mystic-star hover:bg-mystic-veil/30 hover:text-mystic-moon"
                }`
              }
            >
              <span className="text-xl">{unlocked ? item.icon : "🔒"}</span>
              <span className="font-body">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Stats */}
      <div className="px-6 py-5 border-t border-mystic-veil space-y-3">
        <div className="text-xs text-mystic-star/60">学习进度</div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-mystic-veil rounded-full overflow-hidden">
            <div
              className="h-full bg-mystic-gold rounded-full transition-all duration-500"
              style={{ width: `${(learnedCount / 78) * 100}%` }}
            />
          </div>
          <span className="text-xs text-mystic-gold font-bold">{learnedCount}/78</span>
        </div>
        {progress.streakCount > 0 && (
          <div className="text-xs text-mystic-gold/80">
            🔥 连续学习 {progress.streakCount} 天
          </div>
        )}
      </div>
    </aside>
  );
}
