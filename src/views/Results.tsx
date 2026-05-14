"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowRight, RotateCcw, CheckCircle2, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import { getSessionAnalysis, type AnalysisPayload } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";

function getScoreColor(score: number) {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function getRobotMessage(score: number): string {
  if (score >= 85) return "Outstanding! You're on fire —\nkeep up the great work! 🔥";
  if (score >= 75) return "Nice work! Let's make\nit even better next time. 🚀";
  if (score >= 60) return "Good effort! A bit more practice\nand you'll nail it. 💪";
  return "Keep going — every session\nmakes you stronger. 🎤";
}

function getFeedback(analysis: AnalysisPayload): string {
  const top = [...analysis.skills].sort((a, b) => b.value - a.value)[0];
  const bottom = [...analysis.skills].sort((a, b) => a.value - b.value)[0];
  return `Your strongest area was ${top?.skill ?? "delivery"} (${top?.value ?? 0}%). Focus on improving ${bottom?.skill ?? "pacing"} next — ${bottom?.tip ?? "keep practicing!"}`;
}

function getHighlights(analysis: AnalysisPayload): { label: string; positive: boolean }[] {
  return analysis.insights.slice(0, 3).map((i) => ({
    label: i.text.length > 80 ? i.text.slice(0, 77) + "…" : i.text,
    positive: i.type === "strength",
  }));
}

function useAnimatedScore(target: number) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let frame: number;
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * target));
      if (t < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return display;
}

const Results = () => {
  useRequireAuth(true);
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get("session");
  const sessionId = sessionParam ? parseInt(sessionParam, 10) : NaN;

  const [analysis, setAnalysis] = useState<AnalysisPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(sessionId)) {
      setLoading(false);
      setError("No session ID provided.");
      return;
    }
    let cancelled = false;
    const poll = async () => {
      setLoading(true);
      setError(null);
      while (!cancelled) {
        try {
          const r = await getSessionAnalysis(sessionId);
          if (r.kind === "ready") {
            if (!cancelled) { setAnalysis(r.data.analysis); setLoading(false); }
            return;
          }
          if (r.kind === "failed") {
            if (!cancelled) { setError(r.message); setLoading(false); }
            return;
          }
          // still pending — wait and retry
          await new Promise((res) => setTimeout(res, 1500));
        } catch (e) {
          if (!cancelled) {
            setError(e instanceof Error ? e.message : "Failed to load results.");
            setLoading(false);
          }
          return;
        }
      }
    };
    void poll();
    return () => { cancelled = true; };
  }, [sessionId]);

  const score = analysis?.overall_score ?? 0;
  const scoreColor = getScoreColor(score);
  const displayScore = useAnimatedScore(score);
  const robotMessage = useMemo(() => getRobotMessage(score), [score]);
  const feedback = useMemo(() => analysis ? getFeedback(analysis) : "", [analysis]);
  const highlights = useMemo(() => analysis ? getHighlights(analysis) : [], [analysis]);

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center" style={{ minHeight: "calc(100vh - 72px)", padding: "48px 0" }}>

        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute"
          style={{
            width: 600, height: 600, borderRadius: "50%",
            background: `radial-gradient(circle, ${scoreColor}12 0%, transparent 70%)`,
            top: "20%", left: "50%", transform: "translateX(-50%)", zIndex: 0,
          }}
        />

        {/* Loading */}
        {loading && (
          <div className="relative z-10 flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm">Loading your results…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="relative z-10 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center" style={{ maxWidth: 480 }}>
            <p className="font-semibold text-foreground">Could not load results</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Link href="/dashboard/upload" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
              Try again
            </Link>
          </div>
        )}

        {/* Real result card */}
        {!loading && !error && analysis && (
          <div
            className="relative z-10 flex flex-col items-center"
            style={{
              width: "100%", maxWidth: 560,
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 24, padding: "48px 40px 40px",
              boxShadow: "0 8px 32px hsl(var(--foreground) / 0.04)",
            }}
          >
            {/* Robot + speech bubble */}
            <div className="flex flex-col items-center" style={{ marginBottom: 32 }}>
              <div
                className="relative"
                style={{
                  borderRadius: 14, background: "hsl(var(--secondary))",
                  border: "1px solid hsl(var(--border))", padding: "10px 16px",
                  fontSize: 12, lineHeight: 1.5, textAlign: "center",
                  color: "hsl(var(--foreground))", marginBottom: 10, whiteSpace: "pre-line",
                }}
              >
                {robotMessage}
                <div style={{
                  position: "absolute", bottom: -5, left: "50%", marginLeft: -5,
                  width: 10, height: 10, background: "hsl(var(--secondary))",
                  border: "1px solid hsl(var(--border))", borderTop: "none",
                  borderLeft: "none", transform: "rotate(45deg)",
                }} />
              </div>

              {/* Robot face */}
              <div className="animate-float" style={{
                width: 72, height: 72, borderRadius: 20,
                background: "linear-gradient(145deg, #F5F7FA, #EDEFF2)",
                boxShadow: "8px 8px 20px rgba(0,0,0,0.08), -4px -4px 12px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.7)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  width: 48, height: 40, borderRadius: 12,
                  background: "linear-gradient(180deg, hsl(224 25% 18%), hsl(228 30% 10%))",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                }}>
                  <div className="rounded-full" style={{ width: 7, height: 16, background: "#22D3EE", boxShadow: "0 0 8px #22D3EE, 0 0 16px #22D3EE50", animation: "pulse-glow 2s ease-in-out infinite" }} />
                  <div className="rounded-full" style={{ width: 7, height: 16, background: "#22D3EE", boxShadow: "0 0 8px #22D3EE, 0 0 16px #22D3EE50", animation: "pulse-glow 2s ease-in-out infinite 0.3s" }} />
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center" style={{ gap: 8 }}>
              <span style={{ fontSize: 72, fontWeight: 800, lineHeight: 1, color: scoreColor, letterSpacing: -2 }}>
                {displayScore}%
              </span>
              <div className="flex items-center" style={{ gap: 6 }}>
                <Sparkles style={{ width: 14, height: 14, color: scoreColor }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: scoreColor }}>
                  {analysis.whisper_model} · {analysis.language ?? "auto"} language
                </span>
              </div>
            </div>

            {/* Feedback */}
            <p className="text-center text-foreground" style={{ marginTop: 24, fontSize: 15, lineHeight: 1.6, maxWidth: 420, fontWeight: 500 }}>
              {feedback}
            </p>

            {/* Highlights from real insights */}
            <div className="w-full flex flex-col" style={{ marginTop: 32, gap: 12, padding: "20px 24px", background: "hsl(var(--secondary) / 0.5)", borderRadius: 16 }}>
              {highlights.map((h, i) => (
                <div key={i} className="flex items-center" style={{ gap: 10 }}>
                  {h.positive
                    ? <CheckCircle2 style={{ width: 18, height: 18, color: "#22c55e", flexShrink: 0 }} />
                    : <AlertTriangle style={{ width: 18, height: 18, color: "#f59e0b", flexShrink: 0 }} />
                  }
                  <span className="text-foreground" style={{ fontSize: 13, fontWeight: 500 }}>{h.label}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center w-full" style={{ marginTop: 32, gap: 12 }}>
              <Link
                href={`/dashboard/analysis?session=${sessionId}`}
                className="flex-1 flex items-center justify-center gap-2 font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                style={{ height: 48, borderRadius: 14, background: "linear-gradient(135deg, hsl(225, 73%, 57%), hsl(250, 70%, 55%))", color: "#fff", fontSize: 14, boxShadow: "0 4px 16px hsl(225 73% 57% / 0.3)" }}
              >
                View Full Analysis <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
              <Link
                href="/dashboard/upload"
                className="flex items-center justify-center gap-2 font-semibold transition-all duration-200 hover:bg-secondary"
                style={{ height: 48, padding: "0 24px", borderRadius: 14, background: "hsl(var(--card))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))", fontSize: 14 }}
              >
                <RotateCcw style={{ width: 15, height: 15 }} /> Try Again
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Results;
