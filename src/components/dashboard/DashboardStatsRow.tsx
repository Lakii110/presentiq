import { Mic, Target, Flame, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { calcStreak } from "@/hooks/useStreak";

function calcImprovement(sessions: { analysis?: { overall_score: number } }[]): number | null {
  const scored = sessions.filter((s) => s.analysis).map((s) => s.analysis!.overall_score);
  if (scored.length < 2) return null;
  return scored[0] - scored[scored.length - 1]; // newest first
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
    <div className="grid grid-cols-4" style={{ gap: 24 }}>
      {statsCards.map((stat) => (
        <div key={stat.label} className="border border-border bg-card transition-all duration-200 hover:shadow-md" style={{ borderRadius: 20, padding: 24 }}>
          <div className="flex items-center" style={{ gap: 12, marginBottom: 16 }}>
            <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${stat.color}15` }}>
              <stat.icon style={{ width: 20, height: 20, color: stat.color }} />
            </div>
            <span className="font-medium text-muted-foreground bg-secondary" style={{ fontSize: 11, borderRadius: 99, padding: "2px 10px" }}>
              {stat.badge}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground" style={{ marginTop: 4 }}>{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStatsRow;
