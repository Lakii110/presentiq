"use client";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Camera, Shield, Lock, Check, Pencil, Key, Clock, Activity, Trash2, Loader2 } from "lucide-react";
import { getAdminStats, updateProfile } from "@/lib/api";
import { useAdminUser } from "@/hooks/useAdminUser";
import { useAvatar } from "@/hooks/useAvatar";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import UserAvatar from "@/components/UserAvatar";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";

const AdminProfile = () => {
  const [animate, setAnimate] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: user } = useAdminUser();
  const { avatar, saveAvatar, removeAvatar } = useAvatar();
  const { data: stats } = useQuery({ queryKey: ["admin", "stats"], queryFn: getAdminStats, staleTime: 60000 });

  const [name, setName] = useState("");
  useEffect(() => {
    if (user?.display_name) setName(user.display_name);
    else if (user?.email) setName(user.email.split("@")[0]);
  }, [user]);

  // Seed avatar from user data on first load
  useEffect(() => {
    if (user?.avatar_url && !avatar) {
      window.dispatchEvent(new CustomEvent("presentiq:avatar-changed", { detail: user.avatar_url }));
    }
  }, [user]);

  useEffect(() => { const t = setTimeout(() => setAnimate(true), 80); return () => clearTimeout(t); }, []);

  const anim = (i: number) => ({
    opacity: animate ? 1 : 0,
    transform: animate ? "translateY(0)" : "translateY(16px)",
    transition: `all 500ms cubic-bezier(0.4,0,0.2,1) ${120 + i * 80}ms`,
  });

  const email = user?.email ?? "—";
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "AD";
  const displayName = user?.display_name || user?.email?.split("@")[0] || "Admin";

  const handleSaveName = async () => {
    setSaving(true);
    try {
      await updateProfile(name);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Profile updated.");
      setEditingPersonal(false);
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await saveAvatar(file);
      toast.success("Avatar updated.");
    } catch {
      toast.error("Failed to upload avatar.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setUploading(true);
    try {
      await removeAvatar();
      toast.success("Avatar removed.");
    } catch {
      toast.error("Failed to remove avatar.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout title="Profile">
      {showPasswordDialog && (
        <ChangePasswordDialog onClose={() => setShowPasswordDialog(false)} />
      )}

      {/* Hero card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card" style={{ ...anim(0), padding: 32 }}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ background: "radial-gradient(ellipse 60% 50% at 80% 20%, hsl(var(--primary)), transparent)" }} />
        <div className="relative flex items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <UserAvatar initials={initials} src={user?.avatar_url} size={80} rounded="2xl" />
            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{email}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Shield className="h-3 w-3" /> Administrator
              </span>
              {user?.created_at && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3 w-3" /> Active since {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {avatar && (
              <Button variant="outline" size="sm" className="rounded-xl text-xs text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleRemoveAvatar} disabled={uploading}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove Photo
              </Button>
            )}
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Camera className="mr-1.5 h-3.5 w-3.5" /> {avatar ? "Change Photo" : "Upload Photo"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 24 }}>
        {/* Personal info */}
        <div className="rounded-2xl border border-border bg-card" style={{ ...anim(1), padding: 24 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><User className="h-4 w-4 text-primary" /></div>
              <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
            </div>
            <button
              onClick={() => editingPersonal ? handleSaveName() : setEditingPersonal(true)}
              disabled={saving}
              className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : editingPersonal ? <Check className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
              {saving ? "Saving…" : editingPersonal ? "Save" : "Edit"}
            </button>
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Display Name</label>
              {editingPersonal
                ? <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
                : <p className="rounded-xl border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground">{displayName}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email Address</label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />{email}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Role</label>
              <p className="rounded-xl border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground">Super Administrator</p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-2xl border border-border bg-card" style={{ ...anim(2), padding: 24 }}>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><Shield className="h-4 w-4 text-primary" /></div>
            <h3 className="text-sm font-semibold text-foreground">Account Security</h3>
          </div>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <div><p className="text-sm font-medium text-foreground">Password</p><p className="text-xs text-muted-foreground">Change your account password</p></div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => setShowPasswordDialog(true)}>Change</Button>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Two-Factor Auth</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.two_factor_enabled 
                      ? `Enabled via ${user.two_factor_method || "authenticator app"}`
                      : "Not enabled"}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                user?.two_factor_enabled 
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-secondary text-muted-foreground"
              }`}>
                {user?.two_factor_enabled ? (
                  <><Check className="h-3 w-3" /> Active</>
                ) : (
                  "Not Enabled"
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform overview */}
      <div className="rounded-2xl border border-border bg-card" style={{ ...anim(3), marginTop: 24, padding: 24 }}>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><Activity className="h-4 w-4 text-primary" /></div>
          <h3 className="text-sm font-semibold text-foreground">Platform Overview</h3>
        </div>
        <div className="mt-5 grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
          {[
            { label: "Total Users",    value: stats?.total_users != null ? String(stats.total_users) : "—" },
            { label: "Total Sessions", value: stats?.total_sessions != null ? String(stats.total_sessions) : "—" },
            { label: "Avg Score",      value: stats?.avg_score != null ? `${stats.avg_score}%` : "—" },
            { label: "Active Today",   value: stats?.active_today != null ? String(stats.active_today) : "—" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-secondary/30 px-4 py-3 text-center">
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-destructive/30 bg-card" style={{ ...anim(4), marginTop: 24, marginBottom: 48, padding: 24 }}>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10"><Shield className="h-4 w-4 text-destructive" /></div>
          <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">These actions are permanent and cannot be undone.</p>
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <div><p className="text-sm font-medium text-foreground">Delete Admin Account</p><p className="text-xs text-muted-foreground">Permanently remove this admin account.</p></div>
          <Button variant="destructive" size="sm" className="rounded-xl text-xs">Delete Account</Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
