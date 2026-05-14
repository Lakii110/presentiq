"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Clock, Calendar, TrendingUp, Zap, AlertTriangle, CheckCircle2,
  ArrowRight, Bot, Volume2, MessageSquare, FileText, Loader2, Mic, Play,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getSessionAnalysis, type AnalysisResponse, type InsightItem, type TimelineSegment } from "@/lib/api";
import { formatClock, formatDurationSeconds, withTimelineColors } from "@/lib/speech-analysis-ui";
import { usePreferences } from "@/hooks/usePreferences";
import { useDashboardData } from "@/hooks/useDashboardData";
import ScoreGaugeChart from "@/components/charts/ScoreGaugeChart";
import FillerWordsChart from "@/components/charts/FillerWordsChart";
import SkillRingCard from "@/components/charts/SkillRingCard";

/* ── helpers ── */
function buildFillerRegex(fillers: string[]): RegExp {
  const parts = fillers.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"));
  return new RegExp(`\\b(?:${parts.join("|")})\\b`, "gi");
}

function renderHighlightedText(text: string, fillers: string[]) {
  if (!fillers.length) return <span>{text}</span>;
  const regex = buildFillerRegex(fillers);
  const parts: { text: string; isFiller: boolean }[] = [];
  let lastIndex = 0; let match: RegExpExecArray | null;
  regex.lastIndex = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ text: text.slice(lastIndex, match.index), isFiller: false });
    parts.push({ text: match[0], isFiller: true });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), isFiller: false });
  return (
    <span>
      {parts.map((p, i) => p.isFiller ? (
        <TooltipProvider key={i} delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <mark className="rounded px-0.5 cursor-default transition-colors duration-200"
                style={{ background: "hsl(var(--warning) / 0.15)", color: "hsl(var(--warning))", fontWeight: 500 }}>
                {p.text}
              </mark>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">Filler word — try a brief pause</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : <span key={i}>{p.text}</span>)}
    </span>
  );
}

function useAnimatedCount(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(0);
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return count;
}

function overlaps(a0: number, a1: number, b0: number, b1: number) { return a0 < b1 && a1 > b0; }
function iconForType(t: InsightItem["type"]) { return t === "strength" ? CheckCircle2 : t === "weakness" ? AlertTriangle : Zap; }
type TimelineBar = TimelineSegment & { color: string };

const insightStyle: Record<string, { bg: string; border: string; badge: string; badgeText: string; label: string }> = {
  strength:   { bg: "hsl(142 71% 45% / 0.08)",  border: "hsl(142 71% 45% / 0.25)",  badge: "hsl(142 71% 45% / 0.15)",  badgeText: "hsl(142 71% 45%)",  label: "Strength"   },
  weakness:   { bg: "hsl(38 92% 50% / 0.08)",   border: "hsl(38 92% 50% / 0.25)",   badge: "hsl(38 92% 50% / 0.15)",   badgeText: "hsl(38 92% 50%)",   label: "Needs Work" },
  suggestion: { bg: "hsl(var(--primary) / 0.07)", border: "hsl(var(--primary) / 0.25)", badge: "hsl(var(--primary) / 0.15)", badgeText: "hsl(var(--primary))", label: "Suggestion" },
};

const SpeechAnalysis = () => {
  useRequireAuth(true);
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get("session");
  const sessionId = sessionParam ? parseInt(sessionParam, 10) : NaN;
  const useLive = Number.isFinite(sessionId);

  const { sessions, sessionsQuery } = useDashboardData();
  const hasAnySessions = sessions.length > 0;
  const latestReadySession = sessions.find(s => s.status === "ready");

  const [apiPayload, setApiPayload] = useState<AnalysisResponse | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const [polling, setPolling] = useState(useLive);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredTranscript, setHoveredTranscript] = useState<number | null>(null);

  useEffect(() => {
    if (!useLive) return;
    let cancelled = false;
    const run = async () => {
      setPolling(true); setPollError(null);
      try {
        while (!cancelled) {
          const r = await getSessionAnalysis(sessionId);
          if (r.kind === "ready") { setApiPayload(r.data); setPolling(false); return; }
          if (r.kind === "failed") { setPollError(r.message); setPolling(false); return; }
          await new Promise((res) => setTimeout(res, 2000));
        }
      } catch (e) {
        if (!cancelled) { setPollError(e instanceof Error ? e.message : "Request failed"); setPolling(false); }
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [useLive, sessionId]);

  const isLive = useLive && apiPayload !== null;
  const a = apiPayload?.analysis;
  const { prefs } = usePreferences();

  // All hooks must be before any early returns
  const skillsData    = a ? a.skills.filter(s => s.skill !== "Eye Contact") : [];
  const timelineRaw   = a ? a.timeline_segments : [] as TimelineSegment[];
  const timelineData  = a ? withTimelineColors(timelineRaw) : [] as TimelineBar[];
  const transcriptData= a ? a.transcript_segments : [];
  const fillers       = a ? a.filler_words : [];
  const totalDuration = a ? a.total_duration_sec : 0;
  const overallScore  = a ? a.overall_score : 0;

  const insightsDisplay = useMemo(() => {
    const raw = a
      ? a.insights.map(it => ({ type: it.type, icon: iconForType(it.type), text: it.text }))
      : [];
    if (prefs.feedbackStyle === "Strict") {
      return [...raw].sort((a, b) => {
        const order = { weakness: 0, suggestion: 1, strength: 2 };
        return (order[a.type] ?? 1) - (order[b.type] ?? 1);
      });
    }
    return [...raw].sort((a, b) => {
      const order = { strength: 0, suggestion: 1, weakness: 2 };
      return (order[a.type] ?? 1) - (order[b.type] ?? 1);
    });
  }, [a, prefs.feedbackStyle]);

  const heroQuote = useMemo(() => {
    if (a) {
      if (a.summary) return a.summary;
      const top  = [...a.skills].sort((x, y) => y.value - x.value)[0];
      const weak = [...a.skills].sort((x, y) => x.value - y.value)[0];
      const s = a.overall_score;
      if (s >= 85) return `Excellent delivery! Your ${top?.skill?.toLowerCase()} stood out at ${top?.value}%. Keep working on ${weak?.skill?.toLowerCase()} to push even higher.`;
      if (s >= 70) return `Good session! You scored ${s}/100 with strong ${top?.skill?.toLowerCase()}. Focus on ${weak?.skill?.toLowerCase()} — ${weak?.tip}`;
      return `You scored ${s}/100. Your biggest opportunity is ${weak?.skill?.toLowerCase()} — ${weak?.tip ?? "keep practicing."}`;
    }
    return "";
  }, [a]);

  const heroSub = useMemo(() => {
    if (a) {
      const s = a.overall_score;
      const tier = s >= 85 ? "Advanced Speaker" : s >= 70 ? "Developing Speaker" : "Beginner Speaker";
      const lang = a.language ? ` · ${a.language.toUpperCase()}` : "";
      return `${tier} · ${formatDurationSeconds(a.total_duration_sec)}${lang}`;
    }
    return "";
  }, [a]);

  const title = apiPayload ? `${apiPayload.session.mode === "exam" ? "Exam" : "Practice"} Session` : "Session Analysis";
  const sessionDate = apiPayload ? format(new Date(apiPayload.session.created_at), "MMM d, yyyy") : "";
  const durationLabel = a ? formatDurationSeconds(a.total_duration_sec) : "—";
  const modeLabel = apiPayload ? (apiPayload.session.mode === "exam" ? "Exam Mode" : "Practice Mode") : "";

  const actionItems = useMemo(() => {
    const sorted = [...skillsData].sort((a, b) => a.value - b.value);
    const base = [
      { icon: TrendingUp,    label: "Practice pacing control",    desc: "Slow down at key transitions — aim for 130–160 WPM", time: "5 min",  recommended: false },
      { icon: MessageSquare, label: "Reduce filler words",        desc: "Replace fillers with a 1-second silent pause",       time: "3 min",  recommended: false },
      { icon: Volume2,       label: "Improve vocal tone",         desc: "Vary your pitch to emphasize important ideas",        time: "4 min",  recommended: false },
      { icon: Zap,           label: "Try another session",        desc: "Practice makes permanent — record again today",       time: "10 min", recommended: false },
    ];
    const weakSkill = sorted[0]?.skill?.toLowerCase() ?? "";
    return base.map((a) => ({
      ...a,
      recommended:
        (weakSkill.includes("pacing") && a.label.includes("pacing")) ||
        (weakSkill.includes("filler") && a.label.includes("filler")) ||
        (weakSkill.includes("tone") && a.label.includes("tone")) ||
        (weakSkill.includes("clarity") && a.label.includes("pacing")) ||
        (weakSkill.includes("confidence") && a.label.includes("session")),
    }));
  }, [skillsData]);

  const scoreColor = overallScore >= 80 ? "hsl(var(--success))" : overallScore >= 60 ? "hsl(var(--warning))" : "hsl(var(--destructive))";
  const animatedScore = useAnimatedCount(overallScore);

  // Early returns AFTER all hooks
  if (!useLive && !sessionsQuery.isLoading && !hasAnySessions) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card"
          style={{ margin: "48px auto", maxWidth: 480, padding: 64, textAlign: "center" }}>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-5">
            <Mic className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">No analysis yet</h2>
          <p className="mt-2 text-sm text-muted-foreground" style={{ lineHeight: 1.7, maxWidth: 320 }}>
            Complete your first practice session to see a full speech analysis — skills, timeline, transcript, and AI insights.
          </p>
          <Link href="/dashboard/upload"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            <Play className="h-4 w-4" /> Start your first session
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // No session param but sessions exist — redirect to latest ready session
  if (!useLive && !sessionsQuery.isLoading && hasAnySessions) {
    if (latestReadySession) {
      return (
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card"
            style={{ margin: "48px auto", maxWidth: 480, padding: 64, textAlign: "center" }}>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-5">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Select a session to view</h2>
            <p className="mt-2 text-sm text-muted-foreground" style={{ lineHeight: 1.7, maxWidth: 320 }}>
              Open a session from your history, or view your latest analysis below.
            </p>
            <div className="flex gap-3 mt-6">
              <Link href={`/dashboard/analysis?session=${latestReadySession.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                View Latest Analysis
              </Link>
              <Link href="/dashboard/history"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                All Sessions
              </Link>
            </div>
          </div>
        </DashboardLayout>
      );
    }
    // Sessions exist but none are ready yet
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card"
          style={{ margin: "48px auto", maxWidth: 480, padding: 64, textAlign: "center" }}>
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <h2 className="text-lg font-bold text-foreground">Analysis in progress</h2>
          <p className="mt-2 text-sm text-muted-foreground">Your session is still being analyzed. Check back shortly.</p>
          <Link href="/dashboard/history" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
            View History
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const transcriptTimes = (i: number) => ({ start: transcriptData[i].start, end: transcriptData[i].end });

  const barOpacity = (idx: number) => {
    if (hoveredBar === null && hoveredTranscript === null) return 0.7;
    if (hoveredBar === idx) return 1;
    if (hoveredTranscript !== null) {
      const t = transcriptTimes(hoveredTranscript);
      return overlaps(t.start, t.end, timelineData[idx].start, timelineData[idx].end) ? 1 : 0.35;
    }
    if (hoveredBar !== null) {
      const active = timelineData[hoveredBar];
      for (let i = 0; i < transcriptData.length; i++) {
        const tt = transcriptTimes(i);
        if (overlaps(tt.start, tt.end, active.start, active.end) && overlaps(tt.start, tt.end, timelineData[idx].start, timelineData[idx].end)) return 1;
      }
      return 0.35;
    }
    return 0.7;
  };

  const transcriptBorderColor = (i: number) => {
    const tt = transcriptTimes(i);
    if (hoveredTranscript === i) {
      const hit = timelineData.find(seg => overlaps(tt.start, tt.end, seg.start, seg.end));
      return hit?.color ?? "hsl(var(--border))";
    }
    if (hoveredBar !== null && overlaps(tt.start, tt.end, timelineData[hoveredBar].start, timelineData[hoveredBar].end)) {
      return timelineData[hoveredBar].color;
    }
    return "hsl(var(--border))";
  };

  /* loading / error */
  if (useLive && pollError) return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center" style={{ marginTop: 48 }}>
        <p className="font-semibold text-foreground">Analysis failed</p>
        <p className="mt-2 text-sm text-muted-foreground">{pollError}</p>
        <Button asChild className="mt-6"><Link href="/dashboard/upload">Try again</Link></Button>
      </div>
    </DashboardLayout>
  );
  if (useLive && (polling || !apiPayload)) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm">Analyzing your recording…</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div style={{ paddingTop: 32, paddingBottom: 48 }}>

        {/* ── Session meta bar ── */}
        <div className="border border-border bg-card" style={{ borderRadius: 20, padding: 24, marginBottom: 32 }}>
          <div className="flex flex-wrap items-center justify-between" style={{ gap: 16 }}>
            <div>
              <h1 className="text-xl font-bold text-foreground">{title}</h1>
              <div className="flex flex-wrap items-center text-xs text-muted-foreground" style={{ gap: 12, marginTop: 6 }}>
                <span className="flex items-center gap-1"><Calendar style={{ width: 13, height: 13 }} />{sessionDate}</span>
                <span className="flex items-center gap-1"><Clock style={{ width: 13, height: 13 }} />{durationLabel}</span>
                <span className="rounded-full text-xs font-medium px-2.5 py-0.5" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}>{modeLabel}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-muted-foreground block mb-1">Overall Score</span>
                <ScoreGaugeChart score={overallScore} size={120} />
              </div>
            </div>
          </div>
        </div>

        {/* ── AI Coach Hero ── */}
        <div className="relative overflow-hidden" style={{ borderRadius: 20, marginBottom: 32, background: "linear-gradient(135deg, hsl(235 50% 18%) 0%, hsl(260 55% 22%) 50%, hsl(250 60% 18%) 100%)", padding: "32px 36px" }}>
          <div className="pointer-events-none absolute" style={{ width: 300, height: 300, top: -80, right: -40, borderRadius: "50%", background: "radial-gradient(circle, hsl(225 73% 57% / 0.25) 0%, transparent 70%)" }} />
          <div className="pointer-events-none absolute" style={{ width: 200, height: 200, bottom: -60, left: 40, borderRadius: "50%", background: "radial-gradient(circle, hsl(263 70% 58% / 0.2) 0%, transparent 70%)" }} />
          <div className="relative flex items-start gap-5">
            {/* Cute neumorphic robot */}
            <div className="shrink-0 flex items-center justify-center animate-float" style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(145deg, #F5F7FA, #EDEFF2)", boxShadow: "6px 6px 16px rgba(0,0,0,0.15), -3px -3px 10px rgba(255,255,255,0.08), inset 1px 1px 2px rgba(255,255,255,0.7)" }}>
              <div className="relative flex items-center justify-center" style={{ width: 44, height: 38, borderRadius: 10, background: "linear-gradient(145deg, #1F2A37, #0F172A)", boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)" }}>
                <div className="absolute" style={{ top: -4, left: "50%", marginLeft: -3, width: 5, height: 5, borderRadius: "50%", background: "#38BDF8", boxShadow: "0 0 6px #38BDF8" }} />
                <div className="flex" style={{ gap: 8 }}>
                  <div className="rounded-full animate-blink" style={{ width: 6, height: 14, background: "#22D3EE", boxShadow: "0 0 8px #22D3EE" }} />
                  <div className="rounded-full animate-blink" style={{ animationDelay: "0.1s", width: 6, height: 14, background: "#22D3EE", boxShadow: "0 0 8px #22D3EE" }} />
                </div>
                <div className="absolute rounded-full" style={{ width: 5, height: 4, background: "#F472B6", opacity: 0.35, filter: "blur(1px)", bottom: 4, left: 6 }} />
                <div className="absolute rounded-full" style={{ width: 5, height: 4, background: "#F472B6", opacity: 0.35, filter: "blur(1px)", bottom: 4, right: 6 }} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>AI Coach Summary</p>
              <p className="text-base font-medium" style={{ lineHeight: 1.8, color: "rgba(255,255,255,0.92)" }}>{heroQuote}</p>
              <p className="text-sm mt-3" style={{ color: "rgba(255,255,255,0.45)" }}>{heroSub}</p>
            </div>
          </div>
        </div>

        {/* ── Skills Breakdown — individual rings ── */}
        <div className="border border-border bg-card" style={{ borderRadius: 20, padding: 32, marginBottom: 32 }}>
          <h2 className="text-base font-semibold text-foreground">Skills Breakdown</h2>
          <p className="text-xs text-muted-foreground" style={{ marginTop: 4, marginBottom: 24 }}>Each skill scored individually from your session</p>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${skillsData.length}, 1fr)`, gap: 12 }}>
            {[...skillsData].sort((a, b) => b.value - a.value).map((s, idx) => {
              const isWeak = s.value === Math.min(...skillsData.map(x => x.value));
              return (
                <SkillRingCard
                  key={s.skill}
                  skill={s.skill}
                  value={s.value}
                  tip={s.tip}
                  isFocus={isWeak}
                  colorIndex={idx}
                />
              );
            })}
          </div>
        </div>

        {/* ── Speech Timeline ── */}
        <div className="border border-border bg-card" style={{ borderRadius: 20, padding: 32, marginBottom: 32 }}>
          <h2 className="text-base font-semibold text-foreground">Speech Timeline</h2>
          <p className="text-xs text-muted-foreground" style={{ marginTop: 4, marginBottom: 24 }}>Hover over segments to see moment-by-moment feedback</p>
          <div className="relative" style={{ height: 48, borderRadius: 12, overflow: "hidden", background: "hsl(var(--secondary))" }}>
            <div className="flex h-full">
              {timelineData.map((seg, i) => {
                const w = ((seg.end - seg.start) / totalDuration) * 100;
                const hov = hoveredBar === i;
                return (
                  <div key={i} className="relative h-full transition-all duration-200" style={{ width: `${w}%`, background: seg.color, opacity: barOpacity(i), transform: hov ? "scaleY(1.08)" : "scaleY(1)", cursor: "pointer" }}
                    onMouseEnter={() => { setHoveredBar(i); setHoveredTranscript(null); }}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {hov && (
                      <div className="absolute bottom-full left-1/2 z-10 -translate-x-1/2 rounded-lg border border-border bg-card shadow-lg" style={{ padding: "8px 14px", marginBottom: 8, whiteSpace: "nowrap" }}>
                        <p className="text-xs font-semibold text-foreground">{seg.label}</p>
                        <p className="text-[10px] text-muted-foreground">{seg.start}s – {seg.end}s</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between" style={{ marginTop: 8 }}>
            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <span key={f} className="text-[10px] text-muted-foreground">{formatClock(totalDuration * f)}</span>
            ))}
          </div>
          <div className="flex flex-wrap" style={{ gap: 16, marginTop: 16 }}>
            {[
              { color: "hsl(var(--success))",     label: "Strong / clear" },
              { color: "hsl(var(--warning))",     label: "Pacing"         },
              { color: "hsl(var(--destructive))", label: "Filler words"   },
              { color: "hsl(var(--primary))",     label: "Pause"          },
            ].map((l) => (
              <span key={l.label} className="flex items-center text-xs text-muted-foreground" style={{ gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color, display: "inline-block" }} />{l.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Transcript ── */}
        <div className="border border-border bg-card" style={{ borderRadius: 20, padding: 32, marginBottom: 32 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
            <div className="flex items-center gap-2">
              <FileText style={{ width: 16, height: 16, color: "hsl(var(--primary))" }} />
              <h2 className="text-base font-semibold text-foreground">Speech Transcript</h2>
            </div>
          </div>
          <p className="text-xs text-muted-foreground" style={{ marginBottom: 24 }}>Complete transcript with filler words highlighted</p>
          <div style={{ padding: "16px 20px", borderRadius: 12, background: "hsl(var(--secondary) / 0.3)", maxHeight: 480, overflowY: "auto" }}>
            <div className="text-sm text-foreground" style={{ lineHeight: 1.8 }}>
              {transcriptData.map((seg, i) => (
                <span key={i}>
                  {renderHighlightedText(seg.text, fillers)}
                  {i < transcriptData.length - 1 && " "}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Filler Word Frequency (Chart.js) ── */}
        {fillers.length > 0 && (
          <div className="border border-border bg-card" style={{ borderRadius: 20, padding: 32, marginBottom: 32 }}>
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare style={{ width: 16, height: 16, color: "hsl(38 92% 50%)" }} />
              <h2 className="text-base font-semibold text-foreground">Filler Word Frequency</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-5">How often each filler word appeared in your speech</p>
            <FillerWordsChart transcript={transcriptData} fillers={fillers} />
          </div>
        )}

        {/* ── AI Coach Insights ── */}
        <div style={{ marginBottom: 32 }}>
          <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
            <div className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 12, background: "hsl(var(--primary) / 0.1)" }}>
              <Bot style={{ width: 18, height: 18, color: "hsl(var(--primary))" }} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">AI Coach Insights</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Detailed personalised feedback based on your speech analysis</p>
            </div>
          </div>
          <div className="flex flex-col" style={{ gap: 12 }}>
            {insightsDisplay.map((item, i) => {
              const s = insightStyle[item.type];
              return (
                <div key={i} className="transition-all duration-200 hover:shadow-md" style={{ borderRadius: 16, padding: "22px 24px", background: s.bg, border: `1.5px solid ${s.border}` }}>
                  <div className="flex items-start gap-4">
                    <div className="flex shrink-0 items-center justify-center" style={{ width: 40, height: 40, borderRadius: 12, background: s.badge, border: `1px solid ${s.border}` }}>
                      <item.icon style={{ width: 18, height: 18, color: s.badgeText }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-widest mb-2.5 px-2.5 py-1 rounded-full" style={{ background: s.badge, color: s.badgeText }}>{s.label}</span>
                      <p className="text-sm text-foreground" style={{ lineHeight: 1.85 }}>{item.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Next Steps ── */}
        <div>
          <h2 className="text-base font-semibold text-foreground" style={{ marginBottom: 4 }}>What to Do Next</h2>
          <p className="text-xs text-muted-foreground" style={{ marginBottom: 16 }}>Recommended exercises based on your performance</p>
          <div className="grid sm:grid-cols-2" style={{ gap: 12 }}>
            {actionItems.map((action, i) => (
              <Link key={i} href="/dashboard/upload" className="group flex items-center gap-4 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ padding: "18px 20px", background: action.recommended ? "hsl(var(--primary) / 0.05)" : "hsl(var(--card))", borderColor: action.recommended ? "hsl(var(--primary) / 0.3)" : "hsl(var(--border))" }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: action.recommended ? "hsl(var(--primary) / 0.12)" : "hsl(var(--secondary))" }}>
                  <action.icon style={{ width: 18, height: 18, color: action.recommended ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{action.label}</p>
                    {action.recommended && <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))" }}>Recommended</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground">{action.time}</span>
                  <ArrowRight style={{ width: 14, height: 14, color: "hsl(var(--muted-foreground))" }} />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default SpeechAnalysis;
