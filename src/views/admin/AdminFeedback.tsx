"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Star, Check, X, Trash2 } from "lucide-react";
import { getAdminFeedback, approveFeedback, rejectFeedback, deleteAdminFeedback } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

const AdminFeedback = () => {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin", "feedback"],
    queryFn: () => getAdminFeedback(false),
    staleTime: 30_000,
  });

  const approve = useMutation({
    mutationFn: approveFeedback,
    onSuccess: () => { toast.success("Approved — will show on landing page."); void qc.invalidateQueries({ queryKey: ["admin", "feedback"] }); },
    onError: () => toast.error("Failed to approve."),
  });

  const reject = useMutation({
    mutationFn: rejectFeedback,
    onSuccess: () => { toast.success("Rejected."); void qc.invalidateQueries({ queryKey: ["admin", "feedback"] }); },
    onError: () => toast.error("Failed to reject."),
  });

  const remove = useMutation({
    mutationFn: deleteAdminFeedback,
    onSuccess: () => { toast.success("Deleted."); void qc.invalidateQueries({ queryKey: ["admin", "feedback"] }); },
    onError: () => toast.error("Failed to delete."),
  });

  const filtered = items.filter((f) => {
    if (filter === "pending") return !f.is_approved;
    if (filter === "approved") return f.is_approved;
    return true;
  });

  return (
    <AdminLayout title="Feedback">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="h-8 rounded-md border border-border px-3 text-xs font-medium capitalize transition-colors"
            style={{ background: filter === f ? "hsl(var(--primary))" : "transparent", color: filter === f ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" }}>
            {f}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No feedback yet.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((fb) => (
            <div key={fb.id} className="rounded-xl border border-border bg-card" style={{ padding: 20 }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className="h-3.5 w-3.5" style={{ fill: s <= fb.rating ? "hsl(38 92% 50%)" : "transparent", color: s <= fb.rating ? "hsl(38 92% 50%)" : "hsl(var(--border))" }} />
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-3">"{fb.message}"</p>
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {fb.display_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{fb.display_name}</p>
                      {fb.job_title && <p className="text-[11px] text-muted-foreground">{fb.job_title}</p>}
                    </div>
                    <span className={`ml-3 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${fb.is_approved ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                      {fb.is_approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!fb.is_approved && (
                    <button onClick={() => approve.mutate(fb.id)} disabled={approve.isPending}
                      className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20 transition-colors">
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                  )}
                  {fb.is_approved && (
                    <button onClick={() => reject.mutate(fb.id)} disabled={reject.isPending}
                      className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-500/20 transition-colors">
                      <X className="h-3.5 w-3.5" /> Unapprove
                    </button>
                  )}
                  <button onClick={() => remove.mutate(fb.id)} disabled={remove.isPending}
                    className="flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminFeedback;
