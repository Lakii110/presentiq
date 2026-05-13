"use client";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Camera, Check, Pencil, Trash2, Star, MessageSquare, Loader2, X, Lock, Shield } from "lucide-react";
import { getMe, updateProfile, deleteAccount, submitFeedback, getMyFeedback, type FeedbackOut } from "@/lib/api";
import { useDisplayName } from "@/hooks/useDisplayName";
import { useAvatar } from "@/hooks/useAvatar";
import { toast } from "sonner";
import UserAvatar from "@/components/UserAvatar";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";

const JOB_TITLES = ["Student","Professional","Teacher / Professor","Manager / Director","Engineer","Designer","Entrepreneur","Other"];

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)} className="transition-transform hover:scale-110 focus:outline-none">
          <Star
            style={{
              width: 28,
              height: 28,
              fill: s <= active ? "#f59e0b" : "#e2e8f0",
              color: s <= active ? "#d97706" : "#cbd5e1",
              transition: "fill 0.15s, color 0.15s",
            }}
          />
        </button>
      ))}
    </div>
  );
}

function RemovePhotoDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Remove profile photo?</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-5">Your profile photo will be removed and replaced with your initials.</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            No, keep it
          </button>
          <button onClick={onConfirm} className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 transition-opacity">
            Yes, remove
          </button>
        </div>
      </div>
    </div>
  );
}

const Profile = () => {
  const [animate, setAnimate] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const queryClient = useQueryClient();
  const { saveAvatar, removeAvatar } = useAvatar();

  const [fbExisting, setFbExisting] = useState<FeedbackOut | null | undefined>(undefined);
  const [fbEditing, setFbEditing] = useState(false);
  const [fbRating, setFbRating] = useState(0);
  const [fbMessage, setFbMessage] = useState("");
  const [fbName, setFbName] = useState("");
  const [fbTitle, setFbTitle] = useState("");
  const [fbBusy, setFbBusy] = useState(false);

  const { data: user } = useQuery({ queryKey: ["auth", "me"], queryFn: getMe, staleTime: 60000 });
  const { displayName } = useDisplayName(user?.email, user?.display_name);

  useEffect(() => { if (user) setDisplayNameInput(user.display_name ?? ""); }, [user]);
  useEffect(() => { const t = setTimeout(() => setAnimate(true), 80); return () => clearTimeout(t); }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => { if (!cancelled) setFbExisting(null); }, 5000);
    getMyFeedback()
      .then((fb) => {
        if (cancelled) return;
        clearTimeout(timer);
        setFbExisting(fb);
        if (fb) { setFbRating(fb.rating); setFbMessage(fb.message); setFbName(fb.display_name); setFbTitle(fb.job_title ?? ""); }
      })
      .catch(() => { if (!cancelled) { clearTimeout(timer); setFbExisting(null); } });
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (!fbExisting && displayName && displayName !== "…") setFbName(displayName);
  }, [displayName, fbExisting]);

  const anim = (i: number) => ({
    opacity: animate ? 1 : 0,
    transform: animate ? "translateY(0)" : "translateY(16px)",
    transition: `all 500ms cubic-bezier(0.4,0,0.2,1) ${120 + i * 80}ms`,
  });

  const initials = displayName
    ? displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : (user?.email?.[0] ?? "U").toUpperCase();

  const handleSaveName = async () => {
    await updateProfile(displayNameInput);
    queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    setEditingName(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarBusy(true);
    try {
      await saveAvatar(file);
      toast.success("Profile photo updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo.");
    } finally {
      setAvatarBusy(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await removeAvatar();
      toast.success("Profile photo removed.");
    } catch {
      toast.error("Failed to remove photo.");
    } finally {
      setShowRemoveDialog(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbMessage.trim()) { toast.error("Please write a message."); return; }
    if (fbMessage.trim().length < 3) { toast.error("Review must be at least 3 characters."); return; }
    if (!fbName.trim()) { toast.error("Please enter your name."); return; }
    setFbBusy(true);
    try {
      const fb = await submitFeedback({ rating: fbRating, message: fbMessage.trim(), display_name: fbName.trim(), job_title: fbTitle.trim() || undefined });
      setFbExisting(fb); setFbEditing(false);
      toast.success("Feedback submitted! It will appear on the site once approved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit.");
    } finally { setFbBusy(false); }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This will permanently delete your account and all data.")) return;
    setDeleteBusy(true);
    try { await deleteAccount(); window.location.href = "/"; }
    catch { setDeleteBusy(false); }
  };

  const hasPhoto = !!(user?.avatar_url);

  return (
    <DashboardLayout>
      {showRemoveDialog && (
        <RemovePhotoDialog
          onConfirm={handleRemovePhoto}
          onCancel={() => setShowRemoveDialog(false)}
        />
      )}

      {showPasswordDialog && (
        <ChangePasswordDialog onClose={() => setShowPasswordDialog(false)} />
      )}

      <div style={{ paddingTop: 40 }}>

        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card" style={{ ...anim(0), padding: 32 }}>
          <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ background: "radial-gradient(ellipse 60% 50% at 80% 20%, hsl(var(--primary)), transparent)" }} />
          <div className="relative flex items-center gap-6">
            <div className="relative shrink-0">
              <UserAvatar initials={initials} src={user?.avatar_url} size={80} rounded="2xl" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{displayName || user?.email}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {hasPhoto && (
                <Button variant="outline" size="sm" className="rounded-xl text-xs text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setShowRemoveDialog(true)} disabled={avatarBusy}>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove Photo
                </Button>
              )}
              <label className={`inline-flex items-center gap-1.5 cursor-pointer rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors ${avatarBusy ? "opacity-50 pointer-events-none" : ""}`}>
                <Camera className="h-3.5 w-3.5" /> {hasPhoto ? "Change Photo" : "Upload Photo"}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={handleAvatarChange} disabled={avatarBusy} />
              </label>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setEditingName(true)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Personal info — full width now */}
        <div className="rounded-2xl border border-border bg-card mt-6" style={{ ...anim(1), padding: 24 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><User className="h-4 w-4 text-primary" /></div>
              <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
            </div>
            <button onClick={() => editingName ? handleSaveName() : setEditingName(true)} className="text-xs font-medium text-primary hover:text-primary/80">
              {editingName ? "Save" : "Edit"}
            </button>
          </div>
          {saved && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              <Check className="h-3 w-3" /> Saved
            </span>
          )}
          <div className="mt-5 grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Display Name</label>
              {editingName
                ? <Input value={displayNameInput} onChange={(e) => setDisplayNameInput(e.target.value)} className="rounded-xl" />
                : <p className="rounded-xl border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground">{displayName || "—"}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email Address</label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />{user?.email}
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-2xl border border-border bg-card mt-6" style={{ ...anim(2), padding: 24 }}>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><Shield className="h-4 w-4 text-primary" /></div>
            <h3 className="text-sm font-semibold text-foreground">Security</h3>
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Password</p>
                  <p className="text-xs text-muted-foreground">Change your account password</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => setShowPasswordDialog(true)}>
                Change
              </Button>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="rounded-2xl border border-border bg-card" style={{ ...anim(3), marginTop: 24, padding: 24 }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><MessageSquare className="h-4 w-4 text-primary" /></div>
              <h3 className="text-sm font-semibold text-foreground">Your Feedback</h3>
            </div>
            {fbExisting && !fbEditing && (
              <button onClick={() => setFbEditing(true)} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-5">Your review may be featured on the PresentIQ landing page after approval.</p>

          {fbExisting === undefined && (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          )}

          {fbExisting && !fbEditing && (
            <div>
              <div className="flex gap-0.5 mb-3">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className="h-4 w-4" style={{ fill: s <= fbExisting.rating ? "hsl(38 92% 50%)" : "transparent", color: s <= fbExisting.rating ? "hsl(38 92% 50%)" : "hsl(var(--border))" }} />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-4">"{fbExisting.message}"</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {fbExisting.display_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{fbExisting.display_name}</p>
                  {fbExisting.job_title && <p className="text-xs text-muted-foreground">{fbExisting.job_title}</p>}
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">Pending approval</span>
            </div>
          )}

          {fbExisting !== undefined && (!fbExisting || fbEditing) && (
            <form onSubmit={(e) => void handleFeedbackSubmit(e)} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">Rating</label>
                <StarPicker value={fbRating} onChange={setFbRating} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Review</label>
                <textarea value={fbMessage} onChange={(e) => setFbMessage(e.target.value)} placeholder="Tell us how PresentIQ helped you…" rows={3} maxLength={1000} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                <p className="text-right text-xs text-muted-foreground">{fbMessage.length}/1000</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Display Name</label>
                <input value={fbName} onChange={(e) => setFbName(e.target.value)} maxLength={128} className="w-full h-10 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Job Title <span className="font-normal">(optional)</span></label>
                <select value={fbTitle} onChange={(e) => setFbTitle(e.target.value)} className="w-full h-10 rounded-xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select your role…</option>
                  {JOB_TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={fbBusy} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60 hover:opacity-90 transition-opacity">
                  {fbBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {fbBusy ? "Submitting…" : fbEditing ? "Update" : "Submit Feedback"}
                </button>                {fbEditing && (
                  <button type="button" onClick={() => setFbEditing(false)} className="rounded-xl border border-border px-5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-destructive/30 bg-card" style={{ ...anim(4), marginTop: 24, marginBottom: 48, padding: 24 }}>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></div>
            <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">These actions are permanent and cannot be undone.</p>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently remove your account and all session data.</p>
            </div>
            <Button variant="destructive" size="sm" className="rounded-xl text-xs" onClick={handleDeleteAccount} disabled={deleteBusy}>
              {deleteBusy ? "Deleting…" : "Delete Account"}
            </Button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Profile;
