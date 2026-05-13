"use client";

import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { TrendingUp, TrendingDown } from "lucide-react";
import { getAdminAnalytics, getAdminStats, getAdminSessions } from "@/lib/api";
import ScoreDistributionChart from "@/components/charts/ScoreDistributionChart";
import UserGrowthChart from "@/components/charts/UserGrowthChart";

const AdminReports = () => {
  const { data: analytics } = useQuery({ queryKey: ["admin", "analytics"], queryFn: getAdminAnalytics, staleTime: 60_000 });
  const { data: stats } = useQuery({ queryKey: ["admin", "stats"], queryFn: getAdminStats, staleTime: 60_000 });
  const { data: sessions = [] } = useQuery({ queryKey: ["admin", "sessions"], queryFn: () => getAdminSessions(0, 200), staleTime: 60_000 });

  const kpis = [
    { label: "Overall Avg Score",    value: analytics?.avg_score != null ? `${analytics.avg_score}%` : "—", up: true },
    { label: "Sessions Analyzed",    value: analytics?.total_analyzed != null ? String(analytics.total_analyzed) : "—", up: true },
    { label: "Top Skill",            value: analytics?.top_skill ?? "—", up: true },
    { label: "Needs Most Work",      value: analytics?.weakest_skill ?? "—", up: false },
  ];

  return (
    <AdminLayout title="Reports">
      {/* KPIs */}
      <div className="grid grid-cols-4" style={{ gap: 16 }}>
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card" style={{ padding: 20 }}>
            <p className="text-[11px] font-medium mb-2 text-muted-foreground">{k.label}</p>
            <p className="text-xl font-bold text-foreground">{k.value}</p>
            <div className="flex items-center mt-1" style={{ gap: 4 }}>
              {k.up
                ? <TrendingUp className="text-emerald-500" style={{ width: 12, height: 12 }} />
                : <TrendingDown className="text-destructive" style={{ width: 12, height: 12 }} />}
            </div>
          </div>
        ))}
      </div>

      {/* Chart.js Charts — Score Doughnut + Session Growth Line */}
      <div className="grid grid-cols-2" style={{ gap: 16, marginTop: 24 }}>
        {/* Chart 1 (Admin): Score Distribution Doughnut — Chart.js */}
        <div className="rounded-xl border border-border bg-card" style={{ padding: 24 }}>
          <h2 className="text-sm font-semibold mb-1 text-foreground">Score Distribution</h2>
          <p className="text-[11px] text-muted-foreground mb-4">Breakdown of session score ranges</p>
          {analytics?.score_distribution?.length ? (
            <div style={{ maxWidth: 260, margin: "0 auto" }}>
              <ScoreDistributionChart distribution={analytics.score_distribution} />
            </div>
          ) : (
            <div className="flex items-center justify-center" style={{ height: 200 }}>
              <p className="text-sm text-muted-foreground">No data yet</p>
            </div>
          )}
        </div>

        {/* Chart 2 (Admin): Session Activity Line — Chart.js */}
        <div className="rounded-xl border border-border bg-card" style={{ padding: 24 }}>
          <h2 className="text-sm font-semibold mb-1 text-foreground">Session Activity (Last 7 Days)</h2>
          <p className="text-[11px] text-muted-foreground mb-4">Daily session volume this week</p>
          <UserGrowthChart sessions={sessions} />
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-border bg-card" style={{ marginTop: 24, padding: 24 }}>
        <h2 className="text-sm font-semibold mb-4 text-foreground">Platform Summary</h2>
        <div className="grid grid-cols-4" style={{ gap: 12 }}>
          {[
            { label: "Total Users",    value: stats?.total_users != null ? String(stats.total_users) : "—" },
            { label: "Total Sessions", value: stats?.total_sessions != null ? String(stats.total_sessions) : "—" },
            { label: "Active Today",   value: stats?.active_today != null ? String(stats.active_today) : "—" },
            { label: "Avg Score",      value: stats?.avg_score != null ? `${stats.avg_score}%` : "—" },
          ].map((r) => (
            <div key={r.label} className="rounded-xl bg-secondary/50 px-4 py-3 text-center">
              <p className="text-xl font-bold text-foreground">{r.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{r.label}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
