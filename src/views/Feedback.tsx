"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useDisplayName } from "@/hooks/useDisplayName";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { submitFeedback, getMyFeedback, type FeedbackOut } from "@/lib/api";
import { toast } from "sonner";
import { Star, CheckCircle2, Pencil, Loader2 } from "lucide-react";

const TITLES = [
  "Student", "Professional", "Teacher / Professor", "Manager / Director",
  "Engineer", "Designer", "Entrepreneur", "Other",
];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
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

const Feedback = () => {
  useRequireAuth(true);
  const { data: user } = useAuthUser();
  const { displayName } = useDisplayName(user?.email, user?.display_name);

  const [existing, setExisting] = useState<FeedbackOut | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [saving, setSaving] = useState(false);

  // Load existing submission — with timeout so it never hangs forever
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => { if (!cancelled) setExisting(null); }, 5000);
    getMyFeedback()
      .then((fb) => {
        if (cancelled) return;
        clearTimeout(timer);
        setExisting(fb);
        if (fb) {
          setRating(fb.rating);
          setMessage(fb.message);
          setName(fb.display_name);
          setJobTitle(fb.job_title ?? "");
        }
      })
      .catch(() => { if (!cancelled) { clearTimeout(timer); setExisting(null); } });
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  // Pre-fill name from profile
  useEffect(() => {
    if (!existing && displayName && displayName !== "…") {
      setName(displayName);
    }
  }, [displayName, existing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) { toast.error("Please write a message."); return; }
    if (message.trim().length < 3) { toast.error("Review must be at least 3 characters."); return; }
    if (!name.trim()) { toast.error("Please enter your name."); return; }
    setSaving(true);
    try {
      const fb = await submitFeedback({
        rating,
        message: message.trim(),
        display_name: name.trim(),
        job_title: jobTitle.trim() || undefined,
      });
      setExisting(fb);
      setEditing(false);
      toast.success("Feedback submitted! It will appear on the site once approved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit.");
    } finally { setSaving(false); }
  };

  const isLoading = existing === undefined;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 600, margin: "40px auto", paddingBottom: 64 }}>

        <div style={{ marginBottom: 28 }}>
          <h1 className="text-2xl font-bold text-foreground">Share Your Feedback</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your review may be featured on the PresentIQ landing page after approval.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        )}

        {/* Already submitted — show preview */}
        {!isLoading && existing && !editing && (
          <div className="rounded-2xl border border-border bg-card" style={{ padding: 28 }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Your submission</p>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className="h-4 w-4" style={{ fill: s <= existing.rating ? "hsl(38 92% 50%)" : "transparent", color: s <= existing.rating ? "hsl(38 92% 50%)" : "hsl(var(--border))" }} />
                  ))}
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                existing ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : ""
              }`}>
                Pending approval
              </span>
            </div>

            <p className="text-sm text-foreground leading-relaxed mb-5">"{existing.message}"</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {existing.display_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{existing.display_name}</p>
                  {existing.job_title && <p className="text-xs text-muted-foreground">{existing.job_title}</p>}
                </div>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-secondary/50 px-4 py-3 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Your feedback is under review. Once approved by an admin it will appear on the landing page.
              </p>
            </div>
          </div>
        )}

        {/* Form — new or editing */}
        {!isLoading && (!existing || editing) && (
          <form onSubmit={(e) => void handleSubmit(e)} className="rounded-2xl border border-border bg-card" style={{ padding: 28 }}>

            {/* Rating */}
            <div style={{ marginBottom: 24 }}>
              <label className="mb-2 block text-sm font-medium text-foreground">Your Rating</label>
              <StarRating value={rating} onChange={setRating} />
            </div>

            {/* Message */}
            <div style={{ marginBottom: 20 }}>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Your Review</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us how PresentIQ helped you improve your speaking skills…"
                rows={4}
                maxLength={1000}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{message.length}/1000</p>
            </div>

            {/* Name */}
            <div style={{ marginBottom: 20 }}>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Display Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name as it will appear publicly"
                maxLength={128}
                className="w-full h-10 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Job title */}
            <div style={{ marginBottom: 28 }}>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Job Title <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <select
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select your role…</option>
                {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60 hover:opacity-90 transition-opacity"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Submitting…" : editing ? "Update Feedback" : "Submit Feedback"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Feedback;
