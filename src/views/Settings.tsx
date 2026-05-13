"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { logout } from "@/lib/logout";
import {
  Lock, Bell, BellRing, Mail, Sun, Moon, Monitor,
  Trash2, Eye, EyeOff, AlertTriangle, Database,
} from "lucide-react";
import { changePassword, deleteAllSessions, deleteAccount } from "@/lib/api";

function Row({ icon: Icon, title, desc, action }: {
  icon: React.ElementType; title: string; desc: string; action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

function Divider() { return <div className="border-t border-border" />; }

function SectionCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card" style={{ padding: "4px 24px" }}>{children}</div>;
}

function SectionHeader({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function ChangePasswordForm({ onDone }: { onDone: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) { toast.error("New passwords don't match."); return; }
    if (next.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    setBusy(true);
    try {
      await changePassword(current, next);
      toast.success("Password changed successfully.");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password.");
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-border bg-secondary/30 p-4 flex flex-col gap-3">
      {[
        { label: "Current password", value: current, set: setCurrent, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
        { label: "New password", value: next, set: setNext, show: showNext, toggle: () => setShowNext(v => !v) },
        { label: "Confirm new password", value: confirm, set: setConfirm, show: showNext, toggle: () => setShowNext(v => !v) },
      ].map((f) => (
        <div key={f.label}>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</label>
          <div className="relative">
            <input type={f.show ? "text" : "password"} value={f.value} onChange={(e) => f.set(e.target.value)} required
              className="h-9 w-full rounded-lg border border-border bg-background px-3 pr-9 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button type="button" onClick={f.toggle} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {f.show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={busy}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60 hover:opacity-90 transition-opacity">
          {busy ? "Saving..." : "Save password"}
        </button>
        <button type="button" onClick={onDone}
          className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

function ConfirmBox({ message, confirmLabel, onConfirm, onCancel, busy }: {
  message: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void; busy: boolean;
}) {
  return (
    <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex items-start gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
        <p className="text-xs text-foreground">{message}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={onConfirm} disabled={busy}
          className="rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 hover:opacity-90 transition-opacity">
          {busy ? "Please wait..." : confirmLabel}
        </button>
        <button onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

const Settings = () => {
  const { data: user } = useAuthUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [notif, setNotif] = useState({ reminders: true, email: false, weekly: true });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [confirmSessions, setConfirmSessions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busySessions, setBusySessions] = useState(false);
  const [busyDelete, setBusyDelete] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("presentiq_notif");
      if (stored) setNotif(JSON.parse(stored) as typeof notif);
    } catch { /* ignore */ }
  }, []);

  const saveNotif = (key: keyof typeof notif, val: boolean) => {
    const next = { ...notif, [key]: val };
    setNotif(next);
    localStorage.setItem("presentiq_notif", JSON.stringify(next));
    toast.success("Notification preference saved.");
  };

  const handleDeleteSessions = async () => {
    setBusySessions(true);
    try {
      await deleteAllSessions();
      toast.success("All sessions deleted.");
      setConfirmSessions(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete sessions.");
    } finally { setBusySessions(false); }
  };

  const handleDeleteAccount = async () => {
    setBusyDelete(true);
    try {
      await deleteAccount();
      logout(queryClient);
      router.replace("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account.");
      setBusyDelete(false);
    }
  };

  const themeOptions = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <DashboardLayout>
      <div style={{ paddingTop: 40, paddingBottom: 8 }}>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account, appearance, and notifications.</p>
      </div>

      <section style={{ marginTop: 36 }}>
        <SectionHeader icon={Lock} title="Security" desc="Password and account access" />
        <SectionCard>
          <Row icon={Lock} title="Change Password" desc="Update your login password"
            action={!showPasswordForm && (
              <button onClick={() => setShowPasswordForm(true)}
                className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors">
                Change
              </button>
            )}
          />
          {showPasswordForm && <div className="pb-4"><ChangePasswordForm onDone={() => setShowPasswordForm(false)} /></div>}
        </SectionCard>
      </section>

      <section style={{ marginTop: 36 }}>
        <SectionHeader icon={Sun} title="Appearance" desc="Choose how PresentIQ looks" />
        <SectionCard>
          <Row icon={Sun} title="Theme" desc="Switch between light, dark, or system default"
            action={mounted ? (
              <div className="flex rounded-xl border border-border bg-secondary/40 p-1 gap-1">
                {themeOptions.map((t) => (
                  <button key={t.value} onClick={() => { setTheme(t.value); toast.success(`Theme set to ${t.label}.`); }}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200"
                    style={{ background: theme === t.value ? "hsl(var(--primary))" : "transparent", color: theme === t.value ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" }}>
                    <t.icon className="h-3.5 w-3.5" />{t.label}
                  </button>
                ))}
              </div>
            ) : null}
          />
        </SectionCard>
      </section>

      <section style={{ marginTop: 36 }}>
        <SectionHeader icon={Bell} title="Notifications" desc="Control when and how you get updates" />
        <SectionCard>
          {[
            { key: "reminders" as const, icon: BellRing, title: "Practice Reminders", desc: "Get reminded to practice regularly" },
            { key: "email" as const, icon: Mail, title: "Email Notifications", desc: "Receive session summaries via email" },
            { key: "weekly" as const, icon: Bell, title: "Weekly Progress Reports", desc: "A weekly summary of your improvement" },
          ].map((item, i) => (
            <div key={item.key}>
              {i > 0 && <Divider />}
              <Row icon={item.icon} title={item.title} desc={item.desc}
                action={<Switch checked={notif[item.key]} onCheckedChange={(v) => saveNotif(item.key, v)} />}
              />
            </div>
          ))}
        </SectionCard>
      </section>

      <section style={{ marginTop: 36 }}>
        <SectionHeader icon={Database} title="Your Data" desc="Manage your sessions and recordings" />
        <SectionCard>
          <Row icon={Trash2} title="Delete All Sessions" desc="Remove all your practice sessions and recordings"
            action={!confirmSessions && (
              <button onClick={() => setConfirmSessions(true)}
                className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                Delete sessions
              </button>
            )}
          />
          {confirmSessions && (
            <div className="pb-4">
              <ConfirmBox message="This will permanently delete all your sessions and analysis data. This cannot be undone."
                confirmLabel="Yes, delete all" onConfirm={handleDeleteSessions} onCancel={() => setConfirmSessions(false)} busy={busySessions} />
            </div>
          )}
        </SectionCard>
      </section>

      <section style={{ marginTop: 36, marginBottom: 56 }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
            <p className="text-xs text-muted-foreground">Irreversible actions - proceed with caution</p>
          </div>
        </div>
        <div className="rounded-2xl border border-destructive/30 bg-card" style={{ padding: "4px 24px" }}>
          <Row icon={Trash2} title="Delete Account" desc={`Permanently delete your account and all data for ${user?.email ?? "your account"}`}
            action={!confirmDelete && (
              <button onClick={() => setConfirmDelete(true)}
                className="rounded-lg border border-destructive/40 px-4 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
                Delete account
              </button>
            )}
          />
          {confirmDelete && (
            <div className="pb-4">
              <ConfirmBox message="Your account, all sessions, and all data will be permanently deleted. You will be signed out immediately. This cannot be undone."
                confirmLabel="Yes, delete my account" onConfirm={handleDeleteAccount} onCancel={() => setConfirmDelete(false)} busy={busyDelete} />
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
};

export default Settings;
