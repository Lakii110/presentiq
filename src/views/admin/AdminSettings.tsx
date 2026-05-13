"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { getAdminHealth, getFeatureToggles, updateFeatureToggles, adminClearAllSessions, type FeatureToggles } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

const FEATURE_META: { key: keyof FeatureToggles; label: string; desc: string }[] = [
  { key: "practice_mode",       label: "Practice Mode",       desc: "Allow users to access free practice sessions" },
  { key: "exam_mode",           label: "Exam Mode",           desc: "Enable timed exam-style evaluations" },
  { key: "ai_coaching_tips",    label: "Smart Coaching Tips",    desc: "Show intelligent coaching suggestions" },
  { key: "session_recording",   label: "Session Recording",   desc: "Allow users to record and replay sessions" },
  { key: "email_notifications", label: "Email Notifications", desc: "Send weekly progress summaries to users" },
];

const AdminSettings = () => {
  const qc = useQueryClient();
  const [clearing, setClearing] = useState(false);

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ["admin", "health"],
    queryFn: getAdminHealth,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const { data: toggles } = useQuery({
    queryKey: ["admin", "features"],
    queryFn: getFeatureToggles,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: updateFeatureToggles,
    onSuccess: (data) => {
      qc.setQueryData(["admin", "features"], data);
      toast.success("Settings saved.");
    },
    onError: () => toast.error("Failed to save settings."),
  });

  const handleToggle = (key: keyof FeatureToggles, value: boolean) => {
    if (!toggles) return;
    mutation.mutate({ ...toggles, [key]: value });
  };

  const services = [
    { name: "API Server", status: health?.api ?? (healthLoading ? "Checking…" : "Unknown") },
    { name: "Database",   status: health?.database ?? (healthLoading ? "Checking…" : "Unknown") },
    { name: "AI Engine",  status: "Operational" },
    { name: "Storage",    status: "Operational" },
  ];

  const allHealthy = health?.overall === "Healthy";

  const handleClearSessions = async () => {
    if (!confirm("Delete ALL sessions from ALL users? This cannot be undone.")) return;
    setClearing(true);
    try {
      await adminClearAllSessions();
      await qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success("All sessions cleared.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to clear sessions.");
    } finally { setClearing(false); }
  };

  return (
    <AdminLayout title="Settings">
      <div className="grid grid-cols-3" style={{ gap: 24 }}>

        {/* System Status */}
        <div className="col-span-1 rounded-xl border border-border bg-card" style={{ padding: 24 }}>
          <h2 className="text-sm font-semibold mb-4 text-foreground">System Status</h2>
          <div className="flex flex-col" style={{ gap: 16 }}>
            {services.map((s) => {
              const ok = s.status === "Operational";
              return (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{s.name}</span>
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <div className={`rounded-full ${ok ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: 6, height: 6 }} />
                    <span className={`text-[11px] font-medium ${ok ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}`}>{s.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={`mt-6 rounded-lg ${allHealthy ? "bg-emerald-500/10" : "bg-amber-500/10"}`} style={{ padding: 16 }}>
            <div className="flex items-center" style={{ gap: 8, marginBottom: 4 }}>
              {allHealthy
                ? <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" style={{ width: 14, height: 14 }} />
                : <AlertCircle className="text-amber-600" style={{ width: 14, height: 14 }} />}
              <span className={`text-xs font-semibold ${allHealthy ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}`}>
                {healthLoading ? "Checking…" : allHealthy ? "All Systems Healthy" : "Degraded Performance"}
              </span>
            </div>
            <p className={`text-[11px] ${allHealthy ? "text-emerald-600/70 dark:text-emerald-400/70" : "text-amber-600/70"}`}>
              Live status from backend
            </p>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="col-span-2 rounded-xl border border-border bg-card" style={{ padding: 24 }}>
          <h2 className="text-sm font-semibold mb-4 text-foreground">Feature Toggles</h2>
          <div className="flex flex-col">
            {FEATURE_META.map((f, i) => (
              <div key={f.key} className="flex items-center justify-between"
                style={{ padding: "16px 0", borderTop: i > 0 ? "1px solid hsl(var(--border))" : "none" }}>
                <div>
                  <p className="text-sm font-medium text-foreground">{f.label}</p>
                  <p className="text-[11px] mt-0.5 text-muted-foreground">{f.desc}</p>
                </div>
                <Switch
                  checked={toggles ? toggles[f.key] : false}
                  disabled={!toggles || mutation.isPending}
                  onCheckedChange={(v) => handleToggle(f.key, v)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/30 bg-card mt-6" style={{ padding: 24 }}>
        <h2 className="text-sm font-semibold mb-1 text-destructive">Danger Zone</h2>
        <p className="text-[11px] mb-4 text-muted-foreground">These actions are irreversible. Proceed with caution.</p>
        <button
          onClick={() => void handleClearSessions()}
          disabled={clearing}
          className="h-8 rounded-md px-4 text-xs font-medium text-white bg-destructive transition-colors hover:opacity-90 disabled:opacity-60"
        >
          {clearing ? "Clearing…" : "Clear All Sessions"}
        </button>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
