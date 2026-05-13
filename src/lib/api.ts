import { getApiBaseUrl } from "@/lib/env";
import { getAccessToken } from "@/lib/auth-token";
import { debugEnv } from "@/lib/debug-env";

// Debug: log environment on module load
if (typeof window !== 'undefined') {
  debugEnv();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json();
    if (typeof data === "object" && data !== null && "detail" in data) {
      const d = (data as { detail: unknown }).detail;
      if (typeof d === "string") return d;
      return JSON.stringify(d);
    }
    return res.statusText;
  } catch {
    return res.statusText;
  }
}

function authHeaders(): Headers {
  const h = new Headers();
  const t = getAccessToken();
  if (t) h.set("Authorization", `Bearer ${t}`);
  return h;
}

/** Wraps fetch so connection errors (backend not running) show a clear message. */
async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = `${getApiBaseUrl()}${path}`;
  try {
    return await fetch(url, init);
  } catch (e) {
    if (e instanceof TypeError) {
      throw new ApiError(
        0,
        `Cannot reach the API at ${getApiBaseUrl()} (connection refused or blocked). Start the FastAPI server from the backend folder: .venv\\Scripts\\activate then uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`,
      );
    }
    throw e;
  }
}

export type CurrentUser = {
  id: number;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
};

export async function getMe(): Promise<CurrentUser> {
  const res = await apiFetch("/auth/me", { headers: authHeaders() });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

export type SessionMode = "practice" | "exam";

export type SessionOut = {
  id: number;
  mode: string;
  status: string;
  audio_mime: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export async function listSessions(skip = 0, limit = 50): Promise<SessionOut[]> {
  const params = new URLSearchParams({
    skip: String(Math.max(0, skip)),
    limit: String(Math.min(100, Math.max(1, limit))),
  });
  const res = await apiFetch(`/sessions?${params.toString()}`, { headers: authHeaders() });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

export type SkillScore = { skill: string; value: number; tip: string };

export type TimelineSegment = {
  start: number;
  end: number;
  type: string;
  label: string;
  color?: string | null;
};

export type TranscriptSegment = {
  timeline_idx: number;
  text: string;
  start: number;
  end: number;
};

export type InsightItem = { type: "strength" | "weakness" | "suggestion"; text: string };

export type AnalysisPayload = {
  overall_score: number;
  total_duration_sec: number;
  skills: SkillScore[];
  timeline_segments: TimelineSegment[];
  transcript_segments: TranscriptSegment[];
  insights: InsightItem[];
  filler_words: string[];
  language?: string | null;
  whisper_model: string;
  summary?: string;
};

export type AnalysisResponse = {
  session: SessionOut;
  analysis: AnalysisPayload;
};

export async function register(email: string, password: string): Promise<{ id: number; email: string; created_at: string }> {
  const res = await apiFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

export async function login(email: string, password: string): Promise<{ access_token: string; token_type: string; is_admin: boolean }> {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

export async function createSession(mode: SessionMode = "practice"): Promise<SessionOut> {
  const h = authHeaders();
  h.set("Content-Type", "application/json");
  const res = await apiFetch("/sessions", {
    method: "POST",
    headers: h,
    body: JSON.stringify({ mode }),
  });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

export async function uploadSessionAudio(
  sessionId: number,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<SessionOut> {
  const token = getAccessToken();
  // Use XMLHttpRequest so we get upload progress events and no browser timeout
  return new Promise<SessionOut>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${getApiBaseUrl()}/sessions/${sessionId}/audio`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as SessionOut);
        } catch {
          reject(new ApiError(xhr.status, "Invalid JSON response"));
        }
      } else {
        let msg = xhr.statusText;
        try {
          const d = JSON.parse(xhr.responseText) as { detail?: string };
          if (d.detail) msg = typeof d.detail === "string" ? d.detail : JSON.stringify(d.detail);
        } catch { /* ignore */ }
        reject(new ApiError(xhr.status, msg));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new ApiError(0, `Cannot reach the API at ${getApiBaseUrl()} (connection refused or blocked). Start the FastAPI server from the backend folder: .venv\\Scripts\\activate then uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`));
    });

    xhr.addEventListener("abort", () => {
      reject(new ApiError(0, "Upload was cancelled."));
    });

    const fd = new FormData();
    fd.append("file", file);
    xhr.send(fd);
  });
}

export type AnalysisPollResult =
  | { kind: "ready"; data: AnalysisResponse }
  | { kind: "pending"; status: string; message: string }
  | { kind: "failed"; message: string };

export async function getSessionAnalysis(sessionId: number): Promise<AnalysisPollResult> {
  const res = await apiFetch(`/sessions/${sessionId}/analysis`, {
    headers: authHeaders(),
  });
  if (res.status === 202) {
    const body = (await res.json()) as { status?: string; message?: string };
    return { kind: "pending", status: body.status ?? "unknown", message: body.message ?? "" };
  }
  if (res.status === 400) {
    return { kind: "failed", message: await readErrorMessage(res) };
  }
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  const data = (await res.json()) as AnalysisResponse;
  return { kind: "ready", data };
}

/* ── Admin API ── */

export type AdminStats = {
  total_users: number;
  total_sessions: number;
  avg_score: number | null;
  active_today: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const res = await apiFetch("/admin/stats", { headers: authHeaders() });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

export type AdminUser = {
  id: number;
  email: string;
  created_at: string;
};

export async function getAdminUsers(skip = 0, limit = 50): Promise<AdminUser[]> {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  const res = await apiFetch(`/admin/users?${params}`, { headers: authHeaders() });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

export type AdminSession = {
  id: number;
  user_email: string;
  mode: string;
  status: string;
  overall_score: number | null;
  created_at: string;
};

export async function getAdminSessions(skip = 0, limit = 50): Promise<AdminSession[]> {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  const res = await apiFetch(`/admin/sessions?${params}`, { headers: authHeaders() });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

/* ── Password Reset ── */

export async function forgotPassword(email: string): Promise<{ message: string; code: string }> {
  const res = await apiFetch("/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

export async function verifyResetCode(email: string, code: string): Promise<void> {
  const res = await apiFetch("/auth/verify-reset-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<void> {
  const res = await apiFetch("/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, new_password: newPassword }),
  });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
}

export async function updateProfile(displayName: string): Promise<{ display_name: string }> {
  const h = authHeaders();
  h.set("Content-Type", "application/json");
  const res = await apiFetch("/auth/profile", {
    method: "PATCH",
    headers: h,
    body: JSON.stringify({ display_name: displayName }),
  });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const h = authHeaders();
  h.set("Content-Type", "application/json");
  const res = await apiFetch("/auth/change-password", {
    method: "POST",
    headers: h,
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
}

export async function deleteAllSessions(): Promise<void> {
  const res = await apiFetch("/sessions", { method: "DELETE", headers: authHeaders() });
  if (!res.ok && res.status !== 204) throw new ApiError(res.status, await readErrorMessage(res));
}

export async function deleteAccount(): Promise<void> {
  const res = await apiFetch("/auth/delete-account", { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
}

export async function uploadAvatar(file: File): Promise<{ avatar_url: string }> {
  const form = new FormData();
  form.append("file", file);
  const h = authHeaders();
  const res = await apiFetch("/auth/avatar", { method: "POST", headers: h, body: form });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

export async function deleteAvatar(): Promise<void> {
  const res = await apiFetch("/auth/avatar", { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
}

export type AdminAnalytics = {
  score_distribution: { range: string; count: number }[];
  avg_score: number | null;
  total_analyzed: number;
  top_skill: string | null;
  weakest_skill: string | null;
};

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const res = await apiFetch("/admin/analytics", { headers: authHeaders() });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

export type AdminHealth = { api: string; database: string; overall: string };

export async function getAdminHealth(): Promise<AdminHealth> {
  const res = await apiFetch("/admin/health", { headers: authHeaders() });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

/* ── User Feedback ── */

export type FeedbackOut = {
  id: number;
  rating: number;
  message: string;
  display_name: string;
  job_title: string | null;
  created_at: string;
};

export async function submitFeedback(data: {
  rating: number;
  message: string;
  display_name: string;
  job_title?: string;
}): Promise<FeedbackOut> {
  const h = authHeaders();
  h.set("Content-Type", "application/json");
  const res = await apiFetch("/feedback", { method: "POST", headers: h, body: JSON.stringify(data) });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

export async function getMyFeedback(): Promise<FeedbackOut | null> {
  const res = await apiFetch("/feedback/my", { headers: authHeaders() });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

export async function getPublicFeedback(): Promise<FeedbackOut[]> {
  const res = await apiFetch("/feedback/public");
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

export type AdminFeedbackOut = FeedbackOut & { user_id: number; is_approved: boolean };

export async function getAdminFeedback(approvedOnly = false): Promise<AdminFeedbackOut[]> {
  const params = new URLSearchParams({ approved_only: String(approvedOnly) });
  const res = await apiFetch(`/admin/feedback?${params}`, { headers: authHeaders() });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

export async function approveFeedback(id: number): Promise<AdminFeedbackOut> {
  const res = await apiFetch(`/admin/feedback/${id}/approve`, { method: "PATCH", headers: authHeaders() });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

export async function rejectFeedback(id: number): Promise<AdminFeedbackOut> {
  const res = await apiFetch(`/admin/feedback/${id}/reject`, { method: "PATCH", headers: authHeaders() });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

export async function deleteAdminFeedback(id: number): Promise<void> {
  const res = await apiFetch(`/admin/feedback/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok && res.status !== 204) throw new ApiError(res.status, await readErrorMessage(res));
}

export async function adminClearAllSessions(): Promise<void> {
  const res = await apiFetch("/admin/sessions/all", { method: "DELETE", headers: authHeaders() });
  if (!res.ok && res.status !== 204) throw new ApiError(res.status, await readErrorMessage(res));
}

export type FeatureToggles = {
  practice_mode: boolean;
  exam_mode: boolean;
  ai_coaching_tips: boolean;
  session_recording: boolean;
  email_notifications: boolean;
};

export async function getFeatureToggles(): Promise<FeatureToggles> {
  const res = await apiFetch("/admin/settings/features", { headers: authHeaders() });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}

export async function updateFeatureToggles(data: FeatureToggles): Promise<FeatureToggles> {
  const h = authHeaders();
  h.set("Content-Type", "application/json");
  const res = await apiFetch("/admin/settings/features", { method: "PUT", headers: h, body: JSON.stringify(data) });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return res.json();
}
