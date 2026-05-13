import { Flame, TrendingUp, AlertTriangle, Zap, CheckCircle2 } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";

const FALLBACK_TIPS = [
  { icon: Flame, title: "Reduce filler words", desc: "Try pausing instead of saying 'um' or 'uh' — silence is powerful.", color: "hsl(var(--destructive))" },
  { icon: TrendingUp, title: "Keep practicing", desc: "Consistency is key. Even 5 minutes a day builds lasting habits.", color: "hsl(var(--success))" },
  { icon: Zap, title: "Vary your pace", desc: "Slow down on key points, speed up slightly on transitions to keep listeners engaged.", color: "hsl(var(--primary))" },
];

function iconForType(type: string) {
  if (type === "strength") return CheckCircle2;
  if (type === "weakness") return AlertTriangle;
  return Zap;
}

function colorForType(type: string) {
  if (type === "strength") return "hsl(var(--success))";
  if (type === "weakness") return "hsl(var(--destructive))";
  return "hsl(var(--primary))";
}

const DashboardCoachTips = () => {
  const { latestReady } = useDashboardData();

  const tips = latestReady
    ? latestReady.insights.slice(0, 3).map((insight) => ({
        icon: iconForType(insight.type),
        title: insight.type === "strength" ? "Strength" : insight.type === "weakness" ? "Needs Work" : "Suggestion",
        desc: insight.text,
        color: colorForType(insight.type),
      }))
    : FALLBACK_TIPS;

  return (
    <div className="border border-border bg-card" style={{ borderRadius: 20, padding: 24 }}>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 20 }}>
        {/* Mini robot */}
        <div className="flex shrink-0 items-center justify-center" style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(145deg, #e2e6ec, #c8ccd4)" }}>
          <div className="flex items-center justify-center" style={{ width: 20, height: 16, borderRadius: 4, background: "#1F2A37" }}>
            <div className="flex" style={{ gap: 4 }}>
              <div className="rounded-full" style={{ width: 4, height: 8, background: "#22D3EE" }} />
              <div className="rounded-full" style={{ width: 4, height: 8, background: "#22D3EE" }} />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">AI Coach Tips</h3>
          <p className="text-muted-foreground" style={{ fontSize: 11 }}>
            {latestReady ? "From your latest session" : "Personalized feedback for you"}
          </p>
        </div>
      </div>

      <div className="flex flex-col" style={{ gap: 12 }}>
        {tips.map((tip, i) => (
          <div key={i} className="flex bg-secondary/40 transition-colors duration-150 hover:bg-secondary/65" style={{ gap: 12, borderRadius: 12, padding: 14 }}>
            <div className="flex shrink-0 items-center justify-center rounded-full" style={{ width: 32, height: 32, backgroundColor: `${tip.color}15` }}>
              <tip.icon style={{ width: 16, height: 16, color: tip.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{tip.title}</p>
              <p className="text-xs leading-relaxed text-muted-foreground" style={{ marginTop: 2 }}>{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardCoachTips;
