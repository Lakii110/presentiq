"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Trophy, Target, Flame, Zap, Award, Star,
  Play, Sparkles, AlertTriangle, TrendingUp, MessageSquare, Volume2,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import SessionScoreBarChart from "@/components/charts/SessionScoreBarChart";
import SkillPolarChart from "@/components/charts/SkillPolarChart";
import { Progress } from "@/components/ui/progress";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { calcStreak } from "@/hooks/useStreak";
import Link from "next/link";

const DAILY_TIPS = [
  "Great speakers aren't born, they're trained every day.",
  "Try to record at least one practice every day. Small steps lead to big changes!",
  "Pause after key points — silence is a powerful tool.",
  "The best way to improve is to listen back to your own recordings.",
  "Confidence comes from preparation. Practice until it feels natural.",
];

const SKILL_ICONS: Record<string, typeof Flame> = {
  Clarity: TrendingUp,
  Confidence: Sparkles,
  Pacing: Target,
  "Filler Words": MessageSquare,
  Tone: Volume2,
};

const ProgressTracking = () => {
  useRequireAuth(true);
  const [animate, setAnimate] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimate(true), 80); return () => clearTimeout(t); }, []);

  const { sessions, analyzedCount, bestScore, sessionsQuery } = useDashboardData();
  const isLoading = sessionsQuery.isLoading;

  const streak = useMemo(() => calcStreak(sessions), [sessions]);

  // Score history oldest→newest
  const scoreHistory = useMemo(() =>
    sessions.filter(s => s.analysis).slice().reverse()
      .map((s, i) => ({ session: `S${i + 1}`, score: s.analysis!.overall_score, date: new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) })),
    [sessions]);

  const firstScore = scoreHistory[0]?.score ?? 0;
  const lastScore = scoreHistory[scoreHistory.length - 1]?.score ?? 0;
  const overallImprovement = lastScore - firstScore;

  const EXCLUDED_SKILLS = ["Eye Contact"];

  // Skill averages — split into 3 "weeks" (last 3 groups of sessions)
  const skillNames = useMemo(() => {
    const analyzed = sessions.filter(s => s.analysis);
    if (!analyzed.length) return [];
    return analyzed[0].analysis!.skills
      .map(s => s.skill)
      .filter(name => !EXCLUDED_SKILLS.includes(name));
  }, [sessions]);

  const skillGroupData = useMemo(() => {
    const analyzed = sessions.filter(s => s.analysis).slice().reverse();
    if (analyzed.length < 1) return [];
    const third = Math.ceil(analyzed.length / 3);
    const groups = [
      analyzed.slice(0, third),
      analyzed.slice(third, third * 2),
      analyzed.slice(third * 2),
    ];
    return skillNames.map(skill => {
      const entry: Record<string, string | number> = { skill };
      groups.forEach((g, i) => {
        const vals = g.map(s => s.analysis!.skills.find(sk => sk.skill === skill)?.value ?? 0).filter(v => v > 0);
        entry[`g${i}`] = vals.length ? Math.round(vals.reduce((a, v) => a + v, 0) / vals.length) : 0;
      });
      return entry;
    });
  }, [sessions, skillNames]);

  // Skill trends: compare latest session vs previous
  const skillTrends = useMemo(() => {
    const analyzed = sessions.filter(s => s.analysis);
    if (analyzed.length < 2) return {};
    const latest = analyzed[0].analysis!.skills.filter(s => !EXCLUDED_SKILLS.includes(s.skill));
    const prev = analyzed[1].analysis!.skills;
    const map: Record<string, number> = {};
    for (const sk of latest) {
      const p = prev.find(x => x.skill === sk.skill)?.value ?? sk.value;
      map[sk.skill] = sk.value - p;
    }
    return map;
  }, [sessions]);

  const latestSkills = useMemo(() =>
    (sessions.find(s => s.analysis)?.analysis?.skills ?? []).filter(s => !EXCLUDED_SKILLS.includes(s.skill)),
    [sessions]);

  // Calculate average skills across ALL sessions
  const averageSkills = useMemo(() => {
    const analyzed = sessions.filter(s => s.analysis);
    if (analyzed.length === 0) return [];

    const skillMap: Record<string, { total: number; count: number; tip: string }> = {};
    
    analyzed.forEach(session => {
      session.analysis!.skills
        .filter(s => !EXCLUDED_SKILLS.includes(s.skill))
        .forEach(skill => {
          if (!skillMap[skill.skill]) {
            skillMap[skill.skill] = { total: 0, count: 0, tip: skill.tip };
          }
          skillMap[skill.skill].total += skill.value;
          skillMap[skill.skill].count += 1;
        });
    });

    return Object.entries(skillMap).map(([skill, data]) => ({
      skill,
      value: Math.round(data.total / data.count),
      tip: data.tip,
    }));
  }, [sessions]);

  const mostImproved = useMemo(() => {
    const entries = Object.entries(skillTrends).sort((a, b) => b[1] - a[1]);
    return entries[0] ?? null;
  }, [skillTrends]);

  const needsFocus = useMemo(() => {
    if (!averageSkills.length) return null;
    return [...averageSkills].sort((a, b) => a.value - b.value)[0];
  }, [averageSkills]);

  const watchOut = useMemo(() => {
    const entries = Object.entries(skillTrends).sort((a, b) => a[1] - b[1]);
    return entries[0]?.[1] < 0 ? entries[0] : null;
  }, [skillTrends]);

  // Streak calendar (last 7 days)
  const today = new Date();
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const sessionDays = useMemo(() => new Set(sessions.map(s => s.created_at.slice(0, 10))), [sessions]);
  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return { key: d.toISOString().slice(0, 10), label: weekDays[d.getDay() === 0 ? 6 : d.getDay() - 1] };
    });
  }, [sessions]);

  // Level progress
  const nextTier = lastScore >= 85 ? "Expert Speaker" : lastScore >= 70 ? "Advanced Speaker" : "Confident Speaker";
  const currentTier = lastScore >= 85 ? "Advanced Speaker" : lastScore >= 70 ? "Developing Speaker" : "Beginner Speaker";
  const tierPct = lastScore >= 85 ? Math.min(Math.round((lastScore - 85) / 15 * 100), 100)
    : lastScore >= 70 ? Math.round((lastScore - 70) / 15 * 100)
    : Math.round(lastScore / 70 * 100);

  // Weakest for mission
  const weakestSkill = useMemo(() => needsFocus, [needsFocus]);

  // Achievements
  const milestones = useMemo(() => [
    { icon: Star,  label: "First Practice",  desc: "Completed your first session",  date: sessions[sessions.length - 1]?.created_at, achieved: sessions.length >= 1 },
    { icon: Flame, label: "3-Day Streak",     desc: "Practiced 3 days in a row",     date: null, achieved: streak >= 3 },
    { icon: TrendingUp, label: "Clarity Booster", desc: "Improved clarity by 10%",  date: null, achieved: (skillTrends["Clarity"] ?? 0) >= 10 },
    { icon: Sparkles, label: "Confident Voice", desc: "Confidence score above 75%", date: null, achieved: (latestSkills.find(s => s.skill === "Confidence")?.value ?? 0) >= 75 },
    { icon: Trophy, label: "Score 80%+",      desc: "Reached 80% overall score",    date: null, achieved: (bestScore ?? 0) >= 80 },
    { icon: Award,  label: "5-Day Streak",    desc: "Practiced 5 days in a row",    date: null, achieved: streak >= 5 },
  ], [sessions, streak, skillTrends, latestSkills, bestScore]);

  const tip = useMemo(() => DAILY_TIPS[new Date().getDay() % DAILY_TIPS.length], []);  const hasData = analyzedCount > 0;

  const show = animate;

  if (!isLoading && !hasData) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card" style={{ margin: "48px auto", maxWidth: 480, padding: 64 }}>
        <Sparkles className="text-primary" style={{ width: 32, height: 32 }} />
        <p className="text-sm font-medium text-foreground" style={{ marginTop: 16 }}>No analyzed sessions yet</p>
        <p className="text-xs text-muted-foreground" style={{ marginTop: 4 }}>Upload a recording to start tracking your progress.</p>
        <Link href="/dashboard/upload" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
          <Play style={{ width: 14, height: 14 }} /> Start Practice
        </Link>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div style={{ paddingTop: 24, paddingBottom: 64 }}>

        {/* ── HERO ── */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden" style={{ marginBottom: 24, opacity: show ? 1 : 0, transform: show ? "none" : "translateY(12px)", transition: "all 0.4s ease" }}>
          <div className="flex items-center gap-8" style={{ padding: 28 }}>
            {/* Score ring */}
            <div className="flex flex-col items-center shrink-0" style={{ minWidth: 160 }}>
              <p className="text-xs font-medium text-muted-foreground mb-3">Your Overall Score</p>
              <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
                <svg width={120} height={120} viewBox="0 0 120 120" style={{ position: "absolute" }}>
                  <circle cx={60} cy={60} r={50} fill="none" stroke="hsl(var(--secondary))" strokeWidth={8} />
                  <circle cx={60} cy={60} r={50} fill="none" stroke="hsl(var(--primary))" strokeWidth={8} strokeLinecap="round"
                    strokeDasharray={`${(lastScore / 100) * (2 * Math.PI * 50)} ${2 * Math.PI * 50}`}
                    transform="rotate(-90 60 60)"
                    style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.4))", transition: "stroke-dasharray 1s ease" }}
                  />
                </svg>
                {/* Bot face inside ring */}
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-foreground" style={{ lineHeight: 1 }}>{lastScore || "—"}</span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
              </div>
              {overallImprovement !== 0 && (
                <div className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: overallImprovement > 0 ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)" }}>
                  {overallImprovement > 0 ? "▲" : "▼"} {Math.abs(overallImprovement)}% from first session
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-24 w-px bg-border shrink-0" />

            {/* AI message */}
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: "hsl(var(--primary) / 0.1)", border: "1px solid hsl(var(--primary) / 0.2)" }}>
                  <Sparkles style={{ width: 22, height: 22, color: "hsl(var(--primary))" }} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground" style={{ marginBottom: 6 }}>
                    {hasData ? "You're becoming a more confident speaker! 🎉" : "Start practicing to track your progress"}
                  </h1>
                  <p className="text-sm text-muted-foreground" style={{ lineHeight: 1.7, maxWidth: 480 }}>
                    {hasData
                      ? overallImprovement > 0
                        ? `Great consistency! You've improved by ${overallImprovement}% across ${analyzedCount} session${analyzedCount !== 1 ? "s" : ""}. ${weakestSkill ? `Focus on ${weakestSkill.skill.toLowerCase()} to level up even more.` : ""}`
                        : `You have ${analyzedCount} analyzed session${analyzedCount !== 1 ? "s" : ""}. Keep practicing to see your growth.`
                      : "Upload a recording to get your first AI-powered speech analysis."}
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <Link href="/dashboard/analysis" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                      View Insights
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3 INSIGHT CARDS ── */}
        {hasData && (
          <div className="grid grid-cols-3 gap-4" style={{ marginBottom: 24, opacity: show ? 1 : 0, transform: show ? "none" : "translateY(12px)", transition: "all 0.4s ease 0.05s" }}>
            {/* What Improved Most */}
            <div className="rounded-2xl border bg-card" style={{ padding: 20, borderColor: "hsl(142 71% 45% / 0.2)", background: "hsl(142 71% 45% / 0.03)" }}>
              <p className="text-xs font-semibold mb-3" style={{ color: "hsl(142 71% 45%)" }}>What Improved Most</p>
              {mostImproved ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "hsl(142 71% 45% / 0.12)" }}>
                      {(() => { const Icon = SKILL_ICONS[mostImproved[0]] ?? TrendingUp; return <Icon style={{ width: 16, height: 16, color: "hsl(142 71% 45%)" }} />; })()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{mostImproved[0]}</p>
                      <p className="text-xs font-semibold" style={{ color: "hsl(142 71% 45%)" }}>▲ {mostImproved[1]}% this week</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{latestSkills.find(s => s.skill === mostImproved[0])?.tip ?? "Keep it up!"}</p>
                </>
              ) : <p className="text-xs text-muted-foreground">Complete more sessions to see trends.</p>}
            </div>

            {/* Needs More Focus */}
            <div className="rounded-2xl border bg-card" style={{ padding: 20, borderColor: "hsl(38 92% 50% / 0.2)", background: "hsl(38 92% 50% / 0.03)" }}>
              <p className="text-xs font-semibold mb-3" style={{ color: "hsl(38 92% 50%)" }}>Needs More Focus</p>
              {needsFocus ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "hsl(38 92% 50% / 0.12)" }}>
                      {(() => { const Icon = SKILL_ICONS[needsFocus.skill] ?? Target; return <Icon style={{ width: 16, height: 16, color: "hsl(38 92% 50%)" }} />; })()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{needsFocus.skill}</p>
                      <p className="text-xs font-semibold" style={{ color: "hsl(38 92% 50%)" }}>▼ {needsFocus.value}% this week</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{needsFocus.tip}</p>
                </>
              ) : <p className="text-xs text-muted-foreground">Complete more sessions to see trends.</p>}
            </div>

            {/* Watch Out For */}
            <div className="rounded-2xl border bg-card" style={{ padding: 20, borderColor: "hsl(0 84% 60% / 0.2)", background: "hsl(0 84% 60% / 0.03)" }}>
              <p className="text-xs font-semibold mb-3" style={{ color: "hsl(0 84% 60%)" }}>Watch Out For</p>
              {watchOut ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "hsl(0 84% 60% / 0.12)" }}>
                      {(() => { const Icon = SKILL_ICONS[watchOut[0]] ?? AlertTriangle; return <Icon style={{ width: 16, height: 16, color: "hsl(0 84% 60%)" }} />; })()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{watchOut[0]}</p>
                      <p className="text-xs font-semibold" style={{ color: "hsl(0 84% 60%)" }}>▼ {Math.abs(watchOut[1])}% this week</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{latestSkills.find(s => s.skill === watchOut[0])?.tip ?? "Keep an eye on this."}</p>
                </>
              ) : <p className="text-xs text-muted-foreground">No declining skills — great work!</p>}
            </div>
          </div>
        )}

        {/* ── SCORE OVER TIME CHART (Chart.js) ── */}
        {scoreHistory.length > 1 && (
          <div className="rounded-2xl border border-border bg-card" style={{ padding: 24, marginBottom: 24, opacity: show ? 1 : 0, transform: show ? "none" : "translateY(12px)", transition: "all 0.4s ease 0.1s" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-foreground">Progress Over Time</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Overall score across your {scoreHistory.length} analyzed sessions</p>
              </div>
              {overallImprovement !== 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: overallImprovement > 0 ? "hsl(142 71% 45% / 0.12)" : "hsl(0 84% 60% / 0.12)", color: overallImprovement > 0 ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)" }}>
                  {overallImprovement > 0 ? "▲" : "▼"} {Math.abs(overallImprovement)} pts overall
                </span>
              )}
            </div>
            <SessionScoreBarChart scoreHistory={scoreHistory} />
            {/* Color Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: "rgba(34, 197, 94, 0.85)" }} />
                <span className="text-xs text-muted-foreground">Excellent (80+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: "rgba(251, 146, 60, 0.85)" }} />
                <span className="text-xs text-muted-foreground">Good (60-79)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: "rgba(239, 68, 68, 0.85)" }} />
                <span className="text-xs text-muted-foreground">Needs Work (&lt;60)</span>
              </div>
            </div>
          </div>
        )}

        {/* ── SKILL BREAKDOWN (Chart.js Polar Area) ── */}
        {averageSkills.length > 0 && (
          <div className="rounded-2xl border border-border bg-card" style={{ padding: 24, marginBottom: 24, opacity: show ? 1 : 0, transform: show ? "none" : "translateY(12px)", transition: "all 0.4s ease 0.1s" }}>
            <h2 className="text-sm font-bold text-foreground mb-1">Overall Skill Breakdown</h2>
            <p className="text-xs text-muted-foreground mb-4">Average scores across all {sessions.filter(s => s.analysis).length} analyzed session{sessions.filter(s => s.analysis).length !== 1 ? 's' : ''}</p>
            <div className="flex items-center gap-8">
              <div style={{ flex: "0 0 280px" }}>
                <SkillPolarChart skills={averageSkills} />
              </div>
              {/* Skill list with scores */}
              <div className="flex-1 space-y-3">
                {averageSkills.map((s) => {
                  const Icon = SKILL_ICONS[s.skill] ?? TrendingUp;
                  const trend = skillTrends[s.skill] ?? 0;
                  return (
                    <div key={s.skill} className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon style={{ width: 13, height: 13, color: "hsl(var(--primary))" }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">{s.skill}</span>
                          <div className="flex items-center gap-1.5">
                            {trend !== 0 && (
                              <span className="text-[10px] font-semibold" style={{ color: trend > 0 ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)" }}>
                                {trend > 0 ? "▲" : "▼"}{Math.abs(trend)}
                              </span>
                            )}
                            <span className="text-xs font-bold text-foreground">{s.value}</span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${s.value}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── MISSION + STREAK + LEVEL ── */}
        <div className="grid grid-cols-2 gap-4" style={{ marginBottom: 24, opacity: show ? 1 : 0, transform: show ? "none" : "translateY(12px)", transition: "all 0.4s ease 0.15s" }}>
          {/* Next Mission */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(235 50% 18%) 0%, hsl(260 55% 24%) 100%)", padding: 28 }}>
            <p className="text-xs font-semibold mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>Your Next Mission</p>
            <h3 className="text-xl font-bold text-white mb-2">
              {weakestSkill ? `Improve ${weakestSkill.skill}` : "Keep Practicing"}
            </h3>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
              {weakestSkill?.tip ?? "Consistency is the key to becoming a confident speaker."}
            </p>
            <div className="flex items-center gap-2 mb-5">
              <Zap style={{ width: 13, height: 13, color: "rgba(255,255,255,0.4)" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>5 min practice</span>
            </div>
            <Link href="/dashboard/upload" className="flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ height: 44, background: "hsl(var(--primary))", color: "#fff" }}>
              Start Practice →
            </Link>
          </div>

          {/* Streak + Level */}
          <div className="flex flex-col gap-4">
            {/* Streak */}
            <div className="rounded-2xl border border-border bg-card flex-1" style={{ padding: 20 }}>
              <p className="text-xs font-bold text-muted-foreground mb-3">Your Streak</p>
              <div className="flex items-center gap-3 mb-4">
                <Flame style={{ width: 24, height: 24, color: "hsl(25 95% 53%)" }} />
                <div>
                  <span className="text-2xl font-extrabold text-foreground">{streak} Day{streak !== 1 ? "s" : ""}</span>
                  <p className="text-xs text-muted-foreground">{streak > 0 ? "Keep it up! 🔥" : "Start your streak today!"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                {last7.map((day) => {
                  const done = sessionDays.has(day.key);
                  return (
                    <div key={day.key} className="flex flex-col items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">{day.label}</span>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px]"
                        style={{ background: done ? "hsl(var(--primary))" : "hsl(var(--secondary))", color: done ? "#fff" : "hsl(var(--muted-foreground))" }}>
                        {done ? "✓" : "·"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Level Progress */}
            <div className="rounded-2xl border border-border bg-card" style={{ padding: 20 }}>
              <p className="text-xs font-bold text-muted-foreground mb-2">Level Progress</p>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-foreground">{currentTier}</p>
                <div className="flex items-center gap-1.5">
                  <Trophy style={{ width: 14, height: 14, color: "hsl(48 96% 53%)" }} />
                  <span className="text-sm font-bold text-foreground">{tierPct}%</span>
                </div>
              </div>
              <Progress value={tierPct} className="h-2.5 rounded-full" />
              <p className="text-[11px] text-muted-foreground mt-2">You're {tierPct}% towards {nextTier}</p>
            </div>
          </div>
        </div>

        {/* ── ACHIEVEMENTS ── */}
        <div style={{ marginBottom: 24, opacity: show ? 1 : 0, transform: show ? "none" : "translateY(12px)", transition: "all 0.4s ease 0.2s" }}>
          <div className="mb-4">
            <h2 className="text-sm font-bold text-foreground">Recent Achievements</h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {milestones.slice(0, 4).map((m, i) => {
              const colors = ["hsl(142 71% 45%)", "hsl(25 95% 53%)", "hsl(var(--primary))", "hsl(263 70% 58%)"];
              const color = m.achieved ? colors[i % colors.length] : "hsl(var(--muted-foreground))";
              return (
                <div key={m.label} className="rounded-2xl border border-border bg-card flex flex-col items-center text-center transition-all hover:shadow-md"
                  style={{ padding: "20px 16px", opacity: m.achieved ? 1 : 0.4 }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-3" style={{ background: m.achieved ? `${color}18` : "hsl(var(--muted))" }}>
                    <m.icon style={{ width: 20, height: 20, color }} />
                  </div>
                  <p className="text-xs font-bold text-foreground mb-1">{m.label}</p>
                  <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                  {m.achieved && m.date && (
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── DAILY TIP ── */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            padding: "28px 32px",
            background: "linear-gradient(135deg, hsl(235 50% 18%) 0%, hsl(260 55% 24%) 50%, hsl(250 60% 20%) 100%)",
            opacity: show ? 1 : 0,
            transform: show ? "none" : "translateY(12px)",
            transition: "all 0.4s ease 0.25s",
          }}
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute" style={{ width: 200, height: 200, top: -60, right: 60, borderRadius: "50%", background: "radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)" }} />
          <div className="pointer-events-none absolute" style={{ width: 150, height: 150, bottom: -40, right: -20, borderRadius: "50%", background: "radial-gradient(circle, hsl(263 70% 58% / 0.25) 0%, transparent 70%)" }} />

          <div className="relative flex items-center gap-6">
            {/* Bot */}
            <div className="shrink-0 flex items-center justify-center animate-float"
              style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(145deg, #F5F7FA, #EDEFF2)", boxShadow: "8px 8px 20px rgba(0,0,0,0.15), -4px -4px 12px rgba(255,255,255,0.1), inset 1px 1px 2px rgba(255,255,255,0.7)" }}>
              <div style={{ width: 48, height: 40, borderRadius: 12, background: "linear-gradient(145deg, #1F2A37, #0F172A)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <div className="rounded-full animate-blink" style={{ width: 7, height: 16, background: "#22D3EE", boxShadow: "0 0 8px #22D3EE, 0 0 16px #22D3EE50" }} />
                <div className="rounded-full animate-blink" style={{ width: 7, height: 16, background: "#22D3EE", boxShadow: "0 0 8px #22D3EE, 0 0 16px #22D3EE50", animationDelay: "0.1s" }} />
              </div>
            </div>

            {/* Text */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}>
                  Daily Tip
                </span>
              </div>
              <p className="text-base font-semibold leading-relaxed" style={{ color: "rgba(255,255,255,0.92)", maxWidth: 560 }}>
                "{tip}"
              </p>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ProgressTracking;
