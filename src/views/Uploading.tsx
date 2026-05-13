import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Sparkles, FileAudio, ArrowRight } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getSessionAnalysis } from "@/lib/api";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function targetProgressFromStatus(status: string): number {
  switch (status) {
    case "pending":
      return 20;
    case "processing":
      return 65;
    case "ready":
      return 100;
    default:
      return 40;
  }
}

const Uploading = () => {
  useRequireAuth(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get("session");
  const sessionId = sessionParam ? parseInt(sessionParam, 10) : NaN;

  const [status, setStatus] = useState<string>("processing");
  const [message, setMessage] = useState<string>("Starting analysis…");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(18);

  const hasSession = Number.isFinite(sessionId);

  const subtitle = useMemo(() => {
    if (error) return "We couldn’t analyze this recording.";
    if (status === "ready") return "Analysis ready. Opening results…";
    if (status === "processing") return "Transcribing and scoring your speech…";
    return "Preparing analysis…";
  }, [status, error]);

  useEffect(() => {
    if (!hasSession) return;
    let cancelled = false;

    const poll = async () => {
      setError(null);
      let retries = 0;
      while (!cancelled) {
        try {
          const r = await getSessionAnalysis(sessionId);
          retries = 0; // reset on success
          if (r.kind === "ready") {
            setStatus("ready");
            setMessage("Done");
            setProgress(100);
            router.replace(`/dashboard/results?session=${sessionId}`);
            return;
          }
          if (r.kind === "failed") {
            setStatus("failed");
            setError(r.message);
            setMessage(r.message);
            return;
          }
          setStatus(r.status);
          setMessage(r.message || "Working…");
          // Poll every 3s for long speeches — reduces noise
          await new Promise((res) => setTimeout(res, 3000));
        } catch (e) {
          retries++;
          if (retries >= 5) {
            // Give up after 5 consecutive network failures
            if (!cancelled) {
              setStatus("failed");
              const msg = e instanceof Error ? e.message : "Request failed";
              setError(msg);
              setMessage(msg);
            }
            return;
          }
          // Transient network error — wait and retry
          await new Promise((res) => setTimeout(res, 4000 * retries));
        }
      }
    };

    void poll();

    return () => {
      cancelled = true;
    };
  }, [hasSession, router, sessionId]);

  useEffect(() => {
    if (error) return;
    const target = targetProgressFromStatus(status);
    const t = setInterval(() => {
      setProgress((p) => {
        // Ease towards target, but never reach 100 unless ready
        const next = p + Math.max(0.6, (target - p) * 0.12);
        return clamp(next, 0, status === "ready" ? 100 : 96);
      });
    }, 120);
    return () => clearInterval(t);
  }, [status, error]);

  if (!hasSession) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-xl py-20 text-center">
          <p className="text-lg font-semibold text-foreground">Missing session id</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Open this page with <code>?session=&lt;id&gt;</code>, or start a new upload.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/upload">Go to upload</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl" style={{ paddingTop: 56, paddingBottom: 56 }}>
        <div
          className="relative overflow-hidden rounded-2xl border border-border bg-card"
          style={{ padding: 28 }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 20%, hsl(var(--primary)), transparent)",
            }}
          />

          <div className="relative flex items-start gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: "hsl(var(--primary) / 0.12)" }}
            >
              {error ? (
                <FileAudio className="h-6 w-6 text-destructive" />
              ) : (
                <Sparkles className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-foreground">
                {error ? "Analysis failed" : "Analyzing your recording"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {!error && <Loader2 className="mt-1 h-5 w-5 animate-spin text-primary" />}
          </div>

          <div className="relative mt-6">
            <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-[width] duration-200"
                style={{
                  width: `${progress.toFixed(0)}%`,
                  background: "linear-gradient(90deg, hsl(var(--primary)), hsl(250 70% 55%))",
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="truncate">{message}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
          </div>

          {error ? (
            <div className="relative mt-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm text-foreground">{error}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/dashboard/upload">Try another recording</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/analysis?session=${sessionId}`}>
                    Open analysis page <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <p className="relative mt-6 text-xs text-muted-foreground">
              Long recordings (10–60 min) can take several minutes to transcribe. Please keep this page open.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Uploading;
