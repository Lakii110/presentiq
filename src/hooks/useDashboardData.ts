import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { getSessionAnalysis, listSessions, type AnalysisPayload, type SessionOut } from "@/lib/api";

export type SessionWithOptionalAnalysis = SessionOut & {
  analysis?: AnalysisPayload;
  analysisError?: string;
};

export function useDashboardData() {
  const sessionsQuery = useQuery({
    queryKey: ["sessions", "list"],
    queryFn: () => listSessions(0, 50),
  });

  const sessions = sessionsQuery.data ?? [];

  // Fetch analysis for the newest few sessions only (keeps dashboard fast)
  const newest = useMemo(() => sessions.slice(0, 12), [sessions]);

  const analysisQueries = useQueries({
    queries: newest.map((s) => ({
      queryKey: ["sessions", s.id, "analysis"],
      queryFn: async () => {
        const r = await getSessionAnalysis(s.id);
        if (r.kind === "ready") return r.data.analysis;
        return null;
      },
      enabled: s.status === "ready",
      staleTime: 5 * 60 * 1000,
      retry: 1,
    })),
  });

  const sessionsWithAnalysis: SessionWithOptionalAnalysis[] = useMemo(() => {
    return sessions.map((s) => {
      const idx = newest.findIndex((x) => x.id === s.id);
      if (idx === -1) return s;
      const q = analysisQueries[idx];
      if (!q) return s;
      if (q.data) return { ...s, analysis: q.data };
      if (q.isError) return { ...s, analysisError: q.error instanceof Error ? q.error.message : "Failed to load analysis" };
      return s;
    });
  }, [sessions, newest, analysisQueries]);

  const analyzed = sessionsWithAnalysis.filter((s) => !!s.analysis);

  const avgScore = analyzed.length
    ? Math.round(analyzed.reduce((a, s) => a + (s.analysis?.overall_score ?? 0), 0) / analyzed.length)
    : null;

  const bestScore = analyzed.length
    ? Math.max(...analyzed.map((s) => s.analysis?.overall_score ?? 0))
    : null;

  const latestReady = analyzed[0]?.analysis ?? null;

  return {
    sessionsQuery,
    sessions: sessionsWithAnalysis,
    analyzedCount: analyzed.length,
    avgScore,
    bestScore,
    latestReady,
  };
}

