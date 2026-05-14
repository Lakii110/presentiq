import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Search, CheckCircle2, AlertTriangle,
  Calendar, Clock, ChevronRight, ChevronDown, Trash2,
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getSessionAnalysis, listSessions, deleteSession, type AnalysisPayload, type SessionOut } from "@/lib/api";
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
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [modeFilter, setModeFilter] = useState<"All" | "Practice" | "Exam">("All");
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [analysisById, setAnalysisById] = useState<Record<number, AnalysisPayload | null>>({});
  const [analysisErrorById, setAnalysisErrorById] = useState<Record<number, string | null>>({});
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

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

  const handleDeleteClick = (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setConfirmDeleteId(sessionId);
  };

  const handleConfirmDelete = async (sessionId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setConfirmDeleteId(null);
    setDeletingId(sessionId);
    try {
      await deleteSession(sessionId);
      // Successfully deleted - refresh the list
      await queryClient.invalidateQueries({ queryKey: ["sessions"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (error) {
      // If session not found (404), it was already deleted - just refresh silently
      if (error instanceof Error && (error.message.includes("not found") || error.message.includes("404"))) {
        await queryClient.invalidateQueries({ queryKey: ["sessions"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      }
      // Silently handle all errors - no alerts
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setConfirmDeleteId(null);
  };


  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4 sm:mt-6">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 sm:h-10 rounded-xl border border-border bg-secondary/50 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors w-full sm:w-[260px]"
            style={{ paddingLeft: 36 }}
          />
        </div>
        <div className="flex items-center rounded-xl border border-border overflow-hidden w-full sm:w-auto" style={{ height: 40 }}>
          {(["All", "Practice", "Exam"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setModeFilter(mode)}
              className="h-full px-3 sm:px-4 text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-initial"
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

      <div className="mt-6 sm:mt-8 pb-8 sm:pb-12">
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
          <div key={dateLabel} className="mb-6 sm:mb-10">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex h-6 sm:h-7 items-center rounded-full border border-border px-2 sm:px-3">
                <Calendar className="w-3 h-3 sm:w-3 sm:h-3 mr-1.5 sm:mr-2 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">{dateLabel}</span>
              </div>
              <div className="flex-1 border-t border-border" />
            </div>

            <div className="relative pl-4 sm:pl-6">
              <div className="absolute left-[7px] top-2 bottom-2 border-l-2" style={{ borderColor: "hsl(var(--border))" }} />

              <div className="flex flex-col gap-3 sm:gap-4">
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
                        className="rounded-2xl border border-border bg-card cursor-pointer transition-all duration-200 p-4 sm:p-6"
                        style={{
                          boxShadow: isExpanded ? "0 8px 32px -8px hsl(var(--foreground) / 0.08)" : "0 1px 3px 0 hsl(var(--foreground) / 0.03)",
                        }}
                        onClick={async () => {
                          // Don't expand if we're showing delete confirmation
                          if (confirmDeleteId !== null) return;
                          
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
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div
                              className="flex items-center justify-center rounded-2xl text-base sm:text-lg font-bold shrink-0"
                              style={{
                                width: 48,
                                height: 48,
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
                              <div className="flex flex-wrap items-center text-xs text-muted-foreground gap-2 sm:gap-3 mt-1">
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
                                  <Clock className="w-3 h-3" />
                                  {duration ?? "—"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button
                              onClick={(e) => handleDeleteClick(session.id, e)}
                              disabled={deletingId === session.id}
                              className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-destructive/10 disabled:opacity-50"
                              title="Delete session"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-border mt-4 sm:mt-5 pt-4 sm:pt-5">
                            {analysis ? (
                              <>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                  {analysis.insights[0]?.text ?? "Analysis ready."}
                                </p>
                                <div className="flex flex-col gap-2 mt-3 sm:mt-4">
                                  {(analysis.insights.slice(0, 3) ?? []).map((h, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                                      {h.type === "strength" ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0 mt-0.5" />
                                      ) : (
                                        <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0 mt-0.5" />
                                      )}
                                      <span className="text-foreground">{h.text}</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                {analysisErr ?? "Loading analysis…"}
                              </p>
                            )}
                            <Link
                              href={`/dashboard/analysis?session=${session.id}`}
                              className="mt-4 sm:mt-5 inline-flex items-center gap-2 rounded-xl px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 w-full sm:w-auto justify-center"
                              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(262, 80%, 50%))" }}
                            >
                              View Full Analysis
                              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 sm:p-16">
            <Search className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mt-4">
              No sessions found
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmDeleteId !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleCancelDelete}
        >
          <div 
            className="bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: "28px 32px" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Delete Session?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this session? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-secondary text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
              >
                No
              </button>
              <button
                onClick={(e) => handleConfirmDelete(confirmDeleteId, e)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-destructive text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default History;
