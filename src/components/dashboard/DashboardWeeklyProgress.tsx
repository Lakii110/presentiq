import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useMemo } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";

function dayName(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

const DashboardWeeklyProgress = () => {
  const { sessions } = useDashboardData();
  const weeklyData = useMemo(() => {
    const days: { key: string; name: string; scores: number[] }[] = [];
    // Use a fixed reference date computed once inside useMemo (safe — runs client-side only)
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ key, name: dayName(d), scores: [] });
    }
    for (const s of sessions) {
      if (!s.analysis) continue;
      const key = s.created_at.slice(0, 10);
      const day = days.find((x) => x.key === key);
      if (day) day.scores.push(s.analysis.overall_score);
    }
    return days.map((d) => ({
      name: d.name,
      score: d.scores.length ? Math.round(d.scores.reduce((a, x) => a + x, 0) / d.scores.length) : null,
    }));
  }, [sessions]);

  const hasAny = weeklyData.some((d) => typeof d.score === "number");

  return (
    <div className="border border-border bg-card" style={{ borderRadius: 20, padding: 24 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <div>
          <h3 className="text-base font-semibold text-foreground">Weekly Progress</h3>
          <p className="text-xs text-muted-foreground" style={{ marginTop: 4 }}>
            Overall score trend over the last 7 days
          </p>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-secondary" style={{ borderRadius: 99, padding: "4px 14px" }}>
          This Week
        </span>
      </div>

      {!hasAny ? (
        <p className="text-sm text-muted-foreground">No analyzed sessions yet for this week.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weeklyData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} axisLine={false} tickLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} axisLine={false} tickLine={false} domain={[50, 100]} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          dot={{ fill: "hsl(var(--primary))", r: 3 }}
          activeDot={{ r: 5 }}
        />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DashboardWeeklyProgress;
