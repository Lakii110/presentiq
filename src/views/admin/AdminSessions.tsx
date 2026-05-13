"use client";

import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getAdminSessions } from "@/lib/api";
import { useState } from "react";

const scoreColor = (s: number) =>
  s >= 80 ? "text-emerald-600 dark:text-emerald-400" : s >= 70 ? "text-amber-600 dark:text-amber-400" : "text-destructive";

const AdminSessions = () => {
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("All");
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["admin", "sessions"],
    queryFn: () => getAdminSessions(0, 100),
    staleTime: 60_000,
  });

  const filtered = sessions.filter((s) => {
    const q = search.toLowerCase();
    if (q && !s.user_email.toLowerCase().includes(q)) return false;
    if (modeFilter !== "All" && s.mode !== modeFilter.toLowerCase()) return false;
    return true;
  });

  return (
    <AdminLayout title="Sessions">
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Search by email…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-8 rounded-md border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            style={{ width: 240, paddingLeft: 30, paddingRight: 10 }} />
        </div>
        <div className="flex items-center" style={{ gap: 8 }}>
          {(["All", "Practice", "Exam"] as const).map((m) => (
            <button key={m} onClick={() => setModeFilter(m)}
              className="flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium transition-colors"
              style={{ background: modeFilter === m ? "hsl(var(--primary))" : "transparent", color: modeFilter === m ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">User</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Mode</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">No sessions found</TableCell></TableRow>
            ) : filtered.map((s) => (
              <TableRow key={s.id} className="transition-colors duration-150 hover:bg-secondary/50 cursor-pointer">
                <TableCell className="text-xs text-muted-foreground">{s.user_email}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.mode === "practice" ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                    {s.mode === "practice" ? "Practice" : "Exam"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.status === "ready" ? "bg-emerald-500/10 text-emerald-600" : s.status === "failed" ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground"}`}>
                    {s.status}
                  </span>
                </TableCell>
                <TableCell className={`text-right text-sm font-bold ${s.overall_score !== null ? scoreColor(s.overall_score) : "text-muted-foreground"}`}>
                  {s.overall_score !== null ? `${s.overall_score}%` : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-[11px] text-muted-foreground">{filtered.length} session{filtered.length !== 1 ? "s" : ""}</p>
      </div>
    </AdminLayout>
  );
};

export default AdminSessions;
