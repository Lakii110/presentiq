import { Mic, Target, Flame, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { calcStreak } from "@/hooks/useStreak";

function calcImprovement(sessions: { analysis?: { overall_score: number } }[]): number | null {
  const scored = sessions.filter((s) => s.analysis).map((s) => s.analysis!.overall_score);
  if (scored.length < 2) return null;
  // Calculate: latest - first (positive = improvement, negative = decline)
  return scored[scored.length - 1] - scored[0];
}

const DashboardStatsRow = () => {
  const { sessions, analyzedCount, avgScore } = useDashboardData();

  const streak = useMemo(() => calcStreak(sessions), [sessions]);
  const improvement = useMemo(() => calcImprovement(sessions), [sessions]);

  const total = sessions.length;
  const avgLabel = avgScore === null ? "—" : `${avgScore}%`;
  const streakLabel = streak > 0 ? `${streak} day${streak !== 1 ? "s" : ""}` : "—";
  const improvLabel = improvement === null ? "—" : improvement >= 0 ? `+${improvement}%` : `${improvement}%`;
  const improvBadge = improvement === null ? "Need 2+ sessions" : improvement >= 0 ? "vs first session" : "vs first session";

  const statsCards = [
    { icon: Mic,       label: "Total Sessions",  value: String(total),  badge: "From database",                          color: "hsl(var(--primary))" },
    { icon: Target,    label: "Average Score",   value: avgLabel,       badge: analyzedCount ? `${analyzedCount} analyzed` : "No analysis yet", color: "hsl(var(--success))" },
    { icon: Flame,     label: "Current Streak",  value: streakLabel,    badge: streak > 0 ? "🔥 Keep it up!" : "Start practicing", color: "hsl(var(--warning))" },
    { icon: TrendingUp,label: "Improvement",     value: improvLabel,    badge: improvBadge,                              color: "hsl(var(--accent))" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statsCards.map((stat) => (
        <div key={stat.label} className="border border-border bg-card transition-all duration-200 hover:shadow-md rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl" style={{ backgroundColor: `${stat.color}15` }}>
              <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: stat.color }} />
            </div>
            <span className="font-medium text-muted-foreground bg-secondary text-[10px] sm:text-[11px] rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1">
              {stat.badge}
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStatsRow;
