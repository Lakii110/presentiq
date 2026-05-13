import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Search, CheckCircle2, AlertTriangle,
  Calendar, Clock, ChevronRight, ChevronDown,
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getSessionAnalysis, listSessions, type AnalysisPayload, type SessionOut } from "@/lib/api";
import { formatDurationSeconds } from "@/lib/speech-analysis-ui";
import { useDashboardData } from "@/hooks/useDashboardData";

const getScoreColor = (s: number) =>
  s >= 85 ? "hsl(142, 71%, 45%)" : s >= 70 ? "hsl(38, 92%, 50%)" : "hsl(0, 84%, 60%)";

const getScoreBg = (s: number) =>
  s >= 85 ? "hsl(142, 71%, 45%, 0.10)" : s >= 70 ? "hsl(38, 92%, 50%, 0.10)" : "hsl(0, 84%, 60%, 0.10)";

function dateLabelFromIso(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const y = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((y - x) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function titleFromSession(s: SessionOut): string {
  return `${s.mode === "exam" ? "Exam" : "Practice"} session #${s.id}`;
}

const History = () => {
  useRequireAuth(true);
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [modeFilter, setModeFilter] = useState<"All" | "Practice" | "Exam">("All");
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [analysisById, setAnalysisById] = useState<Record<number, AnalysisPayload | null>>({});
  const [analysisErrorById, setAnalysisErrorById] = useState<Record<number, string | null>>({});

  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ["sessions", "list"],
    queryFn: () => listSessions(0, 50),
  });

  const { sessions: sessionsWithAnalysis } = useDashboardData();

  // Build lookup maps from pre-fetched analyses
  const preloadedScores = useMemo(() => {
    const map: Record<number, number | null> = {};
    for (const s of sessionsWithAnalysis) map[s.id] = s.analysis?.overall_score ?? null;
    return map;
  }, [sessionsWithAnalysis]);

  const preloadedDurations = useMemo(() => {
    const map: Record<number, number | null> = {};
    for (const s of sessionsWithAnalysis) map[s.id] = s.analysis?.total_duration_sec ?? null;
    return map;
  }, [sessionsWithAnalysis]);
  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      const title = titleFromSession(s);
      const score = preloadedScores[s.id];
      const date = dateLabelFromIso(s.created_at);
      const q = searchQuery.toLowerCase();
      if (q && !title.toLowerCase().includes(q) && !date.toLowerCase().includes(q) && !(score !== null && String(score).includes(q))) return false;
      const modeLabel = s.mode === "exam" ? "Exam" : "Practice";
      if (modeFilter !== "All" && modeLabel !== modeFilter) return false;
      return true;
    });
  }, [sessions, searchQuery, modeFilter, preloadedScores]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, SessionOut[]>>((acc, s) => {
      const label = dateLabelFromIso(s.created_at);
      (acc[label] ??= []).push(s);
      return acc;
    }, {});
  }, [filtered]);


  return (
    <DashboardLayout>
      <div className="flex items-center" style={{ marginTop: 24, gap: 12 }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-xl border border-border bg-secondary/50 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors"
            style={{ width: 260, paddingLeft: 36 }}
          />
        </div>
        <div className="flex items-center rounded-xl border border-border" style={{ height: 40, overflow: "hidden" }}>
          {(["All", "Practice", "Exam"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setModeFilter(mode)}
              className="h-full px-4 text-sm font-medium transition-colors"
              style={{
                background: modeFilter === mode ? "hsl(var(--primary))" : "transparent",
                color: modeFilter === mode ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32, paddingBottom: 48 }}>
        {isLoading && (
          <div className="rounded-2xl border border-border bg-card" style={{ padding: 28 }}>
            <p className="text-sm font-medium text-foreground">Loading sessions…</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5" style={{ padding: 28 }}>
            <p className="text-sm font-medium text-foreground">Couldn’t load sessions</p>
            <p className="mt-1 text-xs text-muted-foreground">{error instanceof Error ? error.message : "Request failed"}</p>
          </div>
        )}

        {Object.entries(grouped).map(([dateLabel, dateSessions]) => (
          <div key={dateLabel} style={{ marginBottom: 40 }}>
            <div className="flex items-center" style={{ gap: 12, marginBottom: 16 }}>
              <div className="flex h-7 items-center rounded-full border border-border px-3">
                <Calendar style={{ width: 12, height: 12, marginRight: 6 }} className="text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">{dateLabel}</span>
              </div>
              <div className="flex-1 border-t border-border" />
            </div>

            <div className="relative" style={{ paddingLeft: 24 }}>
              <div className="absolute left-[7px] top-2 bottom-2 border-l-2" style={{ borderColor: "hsl(var(--border))" }} />

              <div className="flex flex-col" style={{ gap: 16 }}>
                {dateSessions.map((session) => {
                  const isExpanded = expandedSession === session.id;
                  const analysis = analysisById[session.id];
                  const analysisErr = analysisErrorById[session.id];
                  // Use pre-loaded score if available, otherwise fall back to expanded analysis
                  const score = preloadedScores[session.id] ?? analysis?.overall_score ?? null;
                  const rawDuration = preloadedDurations[session.id] ?? analysis?.total_duration_sec ?? null;
                  const duration = rawDuration !== null ? formatDurationSeconds(rawDuration) : null;
                  const modeLabel = session.mode === "exam" ? "Exam" : "Practice";

                  return (
                    <div key={session.id} className="relative">
                      <div
                        className="absolute rounded-full"
                        style={{
                          left: -20,
                          top: 20,
                          width: 10,
                          height: 10,
                          background: modeLabel === "Exam" ? "hsl(38 92% 50%)" : "hsl(200 80% 50%)",
                          border: "2px solid hsl(var(--card))",
                          boxShadow: modeLabel === "Exam" ? "0 0 0 2px hsl(38 92% 50% / 0.3)" : "0 0 0 2px hsl(200 80% 50% / 0.3)",
                        }}
                      />

                      <div
                        className="rounded-[16px] border border-border bg-card cursor-pointer transition-all duration-200"
                        style={{
                          padding: 24,
                          boxShadow: isExpanded ? "0 8px 32px -8px hsl(var(--foreground) / 0.08)" : "0 1px 3px 0 hsl(var(--foreground) / 0.03)",
                        }}
                        onClick={async () => {
                          setExpandedSession(isExpanded ? null : session.id);
                          if (!isExpanded && analysisById[session.id] === undefined) {
                            try {
                              const r = await getSessionAnalysis(session.id);
                              if (r.kind === "ready") {
                                setAnalysisById((m) => ({ ...m, [session.id]: r.data.analysis }));
                                setAnalysisErrorById((m) => ({ ...m, [session.id]: null }));
                              } else if (r.kind === "failed") {
                                setAnalysisById((m) => ({ ...m, [session.id]: null }));
                                setAnalysisErrorById((m) => ({ ...m, [session.id]: r.message }));
                              } else {
                                setAnalysisById((m) => ({ ...m, [session.id]: null }));
                                setAnalysisErrorById((m) => ({ ...m, [session.id]: "Analysis still processing…" }));
                              }
                            } catch (e) {
                              setAnalysisById((m) => ({ ...m, [session.id]: null }));
                              setAnalysisErrorById((m) => ({ ...m, [session.id]: e instanceof Error ? e.message : "Request failed" }));
                            }
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center" style={{ gap: 16 }}>
                            <div
                              className="flex items-center justify-center rounded-2xl text-lg font-bold"
                              style={{
                                width: 56,
                                height: 56,
                                background: score !== null
                                  ? (modeLabel === "Exam" ? "hsl(38 92% 50% / 0.12)" : "hsl(200 80% 50% / 0.12)")
                                  : "hsl(var(--secondary))",
                                color: score !== null
                                  ? (modeLabel === "Exam" ? "hsl(38 92% 50%)" : "hsl(200 80% 50%)")
                                  : "hsl(var(--muted-foreground))",
                              }}
                            >
                              {score ?? "—"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{titleFromSession(session)}</p>
                              <div className="flex items-center text-xs text-muted-foreground" style={{ gap: 12, marginTop: 4 }}>
                                <span
                                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                                  style={{
                                    background: modeLabel === "Exam" ? "hsl(38 92% 50% / 0.12)" : "hsl(200 80% 50% / 0.12)",
                                    color: modeLabel === "Exam" ? "hsl(38 92% 50%)" : "hsl(200 80% 50%)",
                                  }}
                                >
                                  {modeLabel}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock style={{ width: 11, height: 11 }} />
                                  {duration ?? "—"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center" style={{ gap: 16 }}>
                            {isExpanded ? (
                              <ChevronDown style={{ width: 16, height: 16 }} className="text-muted-foreground" />
                            ) : (
                              <ChevronRight style={{ width: 16, height: 16 }} className="text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-border" style={{ marginTop: 20, paddingTop: 20 }}>
                            {analysis ? (
                              <>
                                <p className="text-sm text-muted-foreground" style={{ lineHeight: 1.6 }}>
                                  {analysis.insights[0]?.text ?? "Analysis ready."}
                                </p>
                                <div className="flex flex-col" style={{ gap: 8, marginTop: 16 }}>
                                  {(analysis.insights.slice(0, 3) ?? []).map((h, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm">
                                      {h.type === "strength" ? (
                                        <CheckCircle2 style={{ width: 14, height: 14, color: "hsl(142, 71%, 45%)", flexShrink: 0 }} />
                                      ) : (
                                        <AlertTriangle style={{ width: 14, height: 14, color: "hsl(38, 92%, 50%)", flexShrink: 0 }} />
                                      )}
                                      <span className="text-foreground">{h.text}</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground" style={{ lineHeight: 1.6 }}>
                                {analysisErr ?? "Loading analysis…"}
                              </p>
                            )}
                            <Link
                              href={`/dashboard/analysis?session=${session.id}`}
                              className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90"
                              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(262, 80%, 50%))" }}
                            >
                              View Full Analysis
                              <ChevronRight style={{ width: 14, height: 14 }} />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card" style={{ padding: 64 }}>
            <Search style={{ width: 32, height: 32 }} className="text-muted-foreground" />
            <p className="text-sm font-medium text-foreground" style={{ marginTop: 16 }}>
              No sessions found
            </p>
            <p className="text-xs text-muted-foreground" style={{ marginTop: 4 }}>
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default History;
