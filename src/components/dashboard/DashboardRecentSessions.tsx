import Link from "next/link";
import { Play, Clock, ChevronRight } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatDurationSeconds } from "@/lib/speech-analysis-ui";

function prettyDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const getScoreColor = (score: number) => {
  if (score >= 85) return "text-success bg-success/10";
  if (score >= 70) return "text-warning bg-warning/10";
  return "text-destructive bg-destructive/10";
};

const DashboardRecentSessions = () => {
  const { sessions, sessionsQuery } = useDashboardData();
  const rows = sessions.slice(0, 4);

  return (
    <div className="border border-border bg-card" style={{ borderRadius: 20, padding: 24 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <h3 className="text-base font-semibold text-foreground">Recent Sessions</h3>
        <Link href="/dashboard/history" className="text-xs font-medium text-primary hover:underline">
          View All
        </Link>
      </div>

      {sessionsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : sessionsQuery.isError ? (
        <p className="text-sm text-destructive">
          {sessionsQuery.error instanceof Error ? sessionsQuery.error.message : "Failed to load sessions."}
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No sessions yet. Start a practice to see it here.</p>
      ) : (
        <div className="flex flex-col" style={{ gap: 4 }}>
          {rows.map((s) => {
            const score = s.analysis?.overall_score ?? null;
            const duration = s.analysis ? formatDurationSeconds(s.analysis.total_duration_sec) : "—";
            return (
              <Link
                key={s.id}
                href={`/dashboard/analysis?session=${s.id}`}
                className="group flex items-center rounded-xl transition-colors duration-150 hover:bg-secondary/50"
                style={{ padding: "12px 12px", gap: 16 }}
              >
                <div className="flex shrink-0 items-center justify-center rounded-xl bg-primary/10" style={{ width: 40, height: 40 }}>
                  <Play className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {s.mode === "exam" ? "Exam" : "Practice"} session #{s.id}
                  </p>
                  <p className="flex items-center text-xs text-muted-foreground" style={{ gap: 8, marginTop: 2 }}>
                    {prettyDate(s.created_at)}
                    <span className="inline-flex items-center" style={{ gap: 3 }}>
                      <Clock style={{ width: 12, height: 12 }} />
                      {duration}
                    </span>
                  </p>
                </div>
                {score !== null ? (
                  <span className={`text-xs font-semibold ${getScoreColor(score)}`} style={{ borderRadius: 99, padding: "4px 10px" }}>
                    {score}%
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-muted-foreground bg-secondary" style={{ borderRadius: 99, padding: "4px 10px" }}>
                    {s.status === "processing" ? "Analyzing…" : "No score"}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardRecentSessions;
