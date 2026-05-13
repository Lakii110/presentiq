import { TrendingUp, TrendingDown } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatDurationSeconds } from "@/lib/speech-analysis-ui";

const LastPerformanceCard = () => {
  const { sessions } = useDashboardData();

  const lastAnalyzed = sessions.find((s) => s.analysis);
  if (!lastAnalyzed?.analysis) return null;

  const score = lastAnalyzed.analysis.overall_score;
  const duration = formatDurationSeconds(lastAnalyzed.analysis.total_duration_sec);
  const mode = lastAnalyzed.mode === "exam" ? "Exam" : "Practice";

  // Compare with previous analyzed session
  const prev = sessions.filter((s) => s.analysis && s.id !== lastAnalyzed.id)[0];
  const diff = prev?.analysis ? score - prev.analysis.overall_score : null;
  const circumference = 2 * Math.PI * 20; // r=20

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 transition-all duration-200 hover:shadow-md">
      {/* Score ring */}
      <div className="relative flex items-center justify-center" style={{ width: 48, height: 48, flexShrink: 0 }}>
        <svg width={48} height={48} viewBox="0 0 48 48">
          <circle cx={24} cy={24} r={20} fill="none" stroke="hsl(var(--border))" strokeWidth={3} />
          <circle
            cx={24} cy={24} r={20} fill="none"
            stroke="hsl(var(--primary))" strokeWidth={3} strokeLinecap="round"
            strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
            transform="rotate(-90 24 24)"
          />
        </svg>
        <span className="absolute text-xs font-bold text-foreground">{score}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">Last Session</p>
        <p className="text-xs text-muted-foreground">{mode} · {duration}</p>
      </div>

      {diff !== null && (
        <div
          className="flex items-center gap-1 rounded-full px-2.5 py-1"
          style={{ background: diff >= 0 ? "hsl(var(--success) / 0.1)" : "hsl(var(--destructive) / 0.1)" }}
        >
          {diff >= 0
            ? <TrendingUp style={{ width: 12, height: 12, color: "hsl(var(--success))" }} />
            : <TrendingDown style={{ width: 12, height: 12, color: "hsl(var(--destructive))" }} />}
          <span className="text-xs font-semibold" style={{ color: diff >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))" }}>
            {diff >= 0 ? "+" : ""}{diff}%
          </span>
        </div>
      )}
    </div>
  );
};

export default LastPerformanceCard;
