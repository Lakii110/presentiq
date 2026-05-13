"use client";

import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Users, AudioWaveform, Target, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { getAdminStats, getAdminSessions, getAdminAnalytics } from "@/lib/api";
import { useMemo } from "react";

const AdminDashboard = () => {
  const { data: stats } = useQuery({ queryKey: ["admin", "stats"], queryFn: getAdminStats, staleTime: 60_000 });
  const { data: sessions = [] } = useQuery({ queryKey: ["admin", "sessions"], queryFn: () => getAdminSessions(0, 100), staleTime: 60_000 });
  const { data: analytics } = useQuery({ queryKey: ["admin", "analytics"], queryFn: getAdminAnalytics, staleTime: 60_000 });

  // Activity chart — sessions grouped by day of week (last 7 days)
  const activityData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const now = new Date();
    sessions.forEach((s) => {
      const d = new Date(s.created_at);
      const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < 7) {
        const dayName = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
        counts[dayName] = (counts[dayName] || 0) + 1;
      }
    });
    return days.map((day) => ({ day, sessions: counts[day] }));
  }, [sessions]);

  const statCards = [
    { icon: Users,         label: "Total Users",    value: stats ? String(stats.total_users)    : "—" },
    { icon: AudioWaveform, label: "Total Sessions", value: stats ? String(stats.total_sessions) : "—" },
    { icon: Target,        label: "Average Score",  value: stats?.avg_score != null ? `${stats.avg_score}%` : "—" },
    { icon: Activity,      label: "Active Today",   value: stats ? String(stats.active_today)   : "—" },
  ];

  // Real skill insights from analytics
  const skillInsights = useMemo(() => {
    if (!analytics) return [];
    const items = [];
    if (analytics.top_skill) items.push({ icon: TrendingUp, title: "Top Skill", desc: `Users perform best in ${analytics.top_skill}`, color: "hsl(142 71% 45%)" });
    if (analytics.weakest_skill) items.push({ icon: TrendingDown, title: "Needs Work", desc: `${analytics.weakest_skill} is the most common weak area`, color: "hsl(0 84% 60%)" });
    if (analytics.avg_score != null) items.push({ icon: Target, title: "Avg Score", desc: `Platform average is ${analytics.avg_score}% across ${analytics.total_analyzed} sessions`, color: "hsl(var(--primary))" });
    return items;
  }, [analytics]);

  return (
    <AdminLayout title="Dashboard">
      {/* Stat cards */}
      <div className="grid grid-cols-4" style={{ gap: 16 }}>
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card" style={{ padding: 20 }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary" style={{ marginBottom: 12 }}>
              <s.icon className="text-muted-foreground" style={{ width: 15, height: 15 }} />
            </div>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-[11px] mt-1 text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Activity chart */}
      <div className="rounded-xl border border-border bg-card" style={{ marginTop: 24, padding: 24 }}>
        <h2 className="text-sm font-semibold mb-1 text-foreground">Session Activity</h2>
        <p className="text-[11px] mb-4 text-muted-foreground">Sessions over the last 7 days</p>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="adminFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(245 60% 55%)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(245 60% 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
              <Area type="monotone" dataKey="sessions" stroke="hsl(245 60% 55%)" strokeWidth={2} fill="url(#adminFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real skill insights */}
      {skillInsights.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2 className="text-sm font-semibold mb-3 text-foreground">Platform Insights</h2>
          <div className="grid grid-cols-3" style={{ gap: 16 }}>
            {/* Donut: session status breakdown */}
            <div className="rounded-xl border border-border bg-card" style={{ padding: 20 }}>
              <p className="text-xs font-semibold mb-3 text-foreground">Session Status</p>
              {(() => {
                const ready = sessions.filter(s => s.status === "ready").length;
                const pending = sessions.filter(s => s.status === "pending").length;
                const failed = sessions.filter(s => s.status === "failed").length;
                const donutData = [
                  { name: "Ready", value: ready, color: "hsl(142 71% 45%)" },
                  { name: "Pending", value: pending, color: "hsl(38 92% 50%)" },
                  { name: "Failed", value: failed, color: "hsl(0 84% 60%)" },
                ].filter(d => d.value > 0);
                const total = donutData.reduce((s, d) => s + d.value, 0);
                if (!total) return <p className="text-xs text-muted-foreground">No sessions yet</p>;
                return (
                  <div className="flex items-center gap-3">
                    <div style={{ width: 100, height: 100, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={donutData} cx="50%" cy="50%" innerRadius={30} outerRadius={46} dataKey="value" paddingAngle={3} strokeWidth={0}>
                            {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} formatter={(v: number) => [v, "sessions"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {donutData.map(d => (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: d.color }} />
                          <span className="text-[11px] text-muted-foreground">{d.name}</span>
                          <span className="text-[11px] font-bold text-foreground ml-auto">{Math.round(d.value / total * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {skillInsights.map((i) => (
              <div key={i.title} className="rounded-xl border border-border bg-card hover:shadow-md transition-shadow" style={{ padding: 20 }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg mb-3" style={{ background: `${i.color}18` }}>
                  <i.icon style={{ width: 15, height: 15, color: i.color }} />
                </div>
                <p className="text-sm font-semibold mb-1 text-foreground">{i.title}</p>
                <p className="text-[12px] leading-relaxed text-muted-foreground">{i.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No data state */}
      {skillInsights.length === 0 && (
        <div className="rounded-xl border border-border bg-card mt-6 p-8 text-center">
          <p className="text-sm text-muted-foreground">No analyzed sessions yet — insights will appear once users complete sessions.</p>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
