import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useMemo } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";

function dayName(d: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[d.getDay()];
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
  
  // Calculate dynamic Y-axis range based on actual scores
  const scores = weeklyData.filter((d) => typeof d.score === "number").map((d) => d.score as number);
  const minScore = scores.length > 0 ? Math.min(...scores) : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 100;
  
  // Add padding to the range for better visualization
  const yMin = Math.max(0, Math.floor(minScore / 10) * 10 - 10);
  const yMax = Math.min(100, Math.ceil(maxScore / 10) * 10 + 10);

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
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              axisLine={false} 
              tickLine={false} 
              domain={[yMin, yMax]}
              ticks={[yMin, Math.round((yMin + yMax) / 2), yMax]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number) => [`Score: ${value}`, ""]}
              labelFormatter={(label: string) => label}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DashboardWeeklyProgress;
