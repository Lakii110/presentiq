import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Upload, Gauge, AlertTriangle, Timer, TrendingUp, Square } from "lucide-react";
import { toast } from "sonner";
import StageBot from "./StageBot";
import ModeSelector from "./ModeSelector";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { createSession, uploadSessionAudio, type SessionMode } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-token";
import { usePreferences } from "@/hooks/usePreferences";

const modes = ["Practice", "Exam"] as const;
export type Mode = (typeof modes)[number];

const bubbleText: Record<Mode, string> = {
  Practice: "I'm ready when you are.\nLet's improve your speech together. 🎤",
  Exam: "Deep breath. You've got this —\nlet's see what you can do. 🎯",
};

function pickMimeType(): string {
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    return "audio/webm;codecs=opus";
  }
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm")) {
    return "audio/webm";
  }
  return "audio/webm";
}

const PracticeStage = () => {
  useRequireAuth();
  const router = useRouter();
  const { prefs } = usePreferences();
  const [mode, setMode] = useState<Mode>(prefs.practiceMode);
  const [isCtaHovered, setIsCtaHovered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const apiMode: SessionMode = mode === "Exam" ? "exam" : "practice";

  const runUpload = async (file: File) => {
    if (!getAccessToken()) {
      toast.error("Please sign in first.");
      router.push("/login");
      return;
    }
    setBusy(true);
    setUploadPct(0);
    try {
      const session = await createSession(apiMode);
      await uploadSessionAudio(session.id, file, (pct) => setUploadPct(pct));
      setUploadPct(null);
      toast.success("Upload received — analyzing your speech…");
      router.push(`/dashboard/uploading?session=${session.id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      toast.error(msg);
      setUploadPct(null);
    } finally {
      setBusy(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await runUpload(file);
  };

  const startRecording = async () => {
    if (!getAccessToken()) {
      toast.error("Please sign in first.");
      router.push("/login");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Microphone recording is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mime = pickMimeType();
      const mr = new MediaRecorder(stream, { mimeType: mime });
      mr.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      mr.start(250);
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch {
      toast.error("Could not access the microphone. Check browser permissions.");
    }
  };

  const stopRecordingAndUpload = async () => {
    const mr = mediaRecorderRef.current;
    const stream = streamRef.current;
    mediaRecorderRef.current = null;
    streamRef.current = null;
    if (!mr) {
      setRecording(false);
      return;
    }
    setBusy(true);
    try {
      const blob: Blob = await new Promise((resolve, reject) => {
        mr.addEventListener(
          "error",
          () => reject(new Error("Recording failed")),
          { once: true },
        );
        mr.addEventListener(
          "stop",
          () => {
            stream?.getTracks().forEach((t) => t.stop());
            const b = new Blob(chunksRef.current, { type: mr.mimeType || pickMimeType() });
            resolve(b);
          },
          { once: true },
        );
        if (mr.state === "recording") mr.stop();
        else {
          stream?.getTracks().forEach((t) => t.stop());
          reject(new Error("Recorder was not active"));
        }
      });
      setRecording(false);
      const ext = blob.type.includes("webm") ? "webm" : "wav";
      const file = new File([blob], `recording.${ext}`, { type: blob.type || pickMimeType() });
      await runUpload(file);
    } catch (e) {
      setRecording(false);
      const msg = e instanceof Error ? e.message : "Recording failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ paddingTop: 24, paddingBottom: 48, minHeight: "calc(100vh - 72px)" }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".webm,.wav,.mp3,.m4a,.ogg,.flac,.mp4,.mpeg,.mpga,audio/*"
        className="hidden"
        onChange={onFileChange}
      />

      {/* Ambient background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, hsl(225 73% 57% / 0.05) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 55%, hsl(250 70% 55% / 0.03) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10" style={{ marginBottom: 32 }}>
        <ModeSelector mode={mode} onModeChange={setMode} />
      </div>

      <div
        className="relative z-10 flex flex-col items-center"
        style={{
          width: "100%",
          maxWidth: 520,
          padding: "44px 36px 48px",
          borderRadius: 28,
          background: "hsl(210 80% 97%)",
          border: "1px solid hsl(var(--border) / 0.5)",
          backdropFilter: "blur(20px)",
          boxShadow:
            "0 0 100px hsl(225 73% 57% / 0.05), 0 12px 40px hsl(var(--foreground) / 0.04), inset 0 1px 0 hsl(0 0% 100% / 0.6)",
        }}
      >
        <div
          className="relative animate-fade-in"
          style={{
            borderRadius: 16,
            background: "hsl(var(--background) / 0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid hsl(var(--border) / 0.6)",
            padding: "16px 24px",
            fontSize: 13.5,
            lineHeight: 1.65,
            textAlign: "center",
            color: "hsl(var(--foreground))",
            maxWidth: 300,
            marginBottom: 16,
            boxShadow: "0 4px 20px hsl(var(--foreground) / 0.03)",
          }}
        >
          <span style={{ whiteSpace: "pre-line", fontWeight: 500 }}>{bubbleText[mode]}</span>
          <div
            style={{
              position: "absolute",
              bottom: -7,
              left: "50%",
              marginLeft: -7,
              width: 14,
              height: 14,
              background: "hsl(var(--background) / 0.8)",
              border: "1px solid hsl(var(--border) / 0.6)",
              borderTop: "none",
              borderLeft: "none",
              transform: "rotate(45deg)",
            }}
          />
        </div>

        <div style={{ marginBottom: 32 }}>
          <StageBot isHovered={isCtaHovered} />
        </div>

        {!recording ? (
          <button
            type="button"
            disabled={busy}
            onMouseEnter={() => setIsCtaHovered(true)}
            onMouseLeave={() => setIsCtaHovered(false)}
            onClick={startRecording}
            className="group relative flex items-center justify-center gap-3 font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60"
            style={{
              width: "100%",
              maxWidth: 300,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, hsl(225, 73%, 57%), hsl(250, 70%, 55%))",
              color: "#fff",
              fontSize: 16,
              boxShadow:
                "0 4px 24px hsl(225 73% 57% / 0.35), 0 0 60px hsl(225 73% 57% / 0.1)",
              border: "none",
              cursor: busy ? "wait" : "pointer",
            }}
          >
            <div
              className="absolute inset-0 rounded-[16px]"
              style={{
                background: "linear-gradient(135deg, hsl(225, 73%, 57%), hsl(250, 70%, 55%))",
                animation: "pulse-glow 2.5s ease-in-out infinite",
                opacity: 0.25,
                filter: "blur(10px)",
              }}
            />
            <Mic className="relative z-10" style={{ width: 20, height: 20 }} />
            <span className="relative z-10">{busy ? "Please wait…" : "Start Speaking"}</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void stopRecordingAndUpload()}
            className="group relative flex items-center justify-center gap-3 font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              width: "100%",
              maxWidth: 300,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, hsl(0 72% 50%), hsl(350 70% 48%))",
              color: "#fff",
              fontSize: 16,
              border: "none",
              cursor: busy ? "wait" : "pointer",
            }}
          >
            <Square className="relative z-10" style={{ width: 18, height: 18 }} />
            <span className="relative z-10">{busy ? "Uploading…" : "Stop & analyze"}</span>
          </button>
        )}

        <button
          type="button"
          disabled={busy || recording}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2.5 font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:border-foreground/20 disabled:opacity-50"
          style={{
            marginTop: 14,
            height: 42,
            padding: "0 24px",
            borderRadius: 12,
            border: "1px solid hsl(var(--border))",
            background: "transparent",
            fontSize: 13,
            cursor: busy || recording ? "not-allowed" : "pointer",
          }}
        >
          <Upload style={{ width: 15, height: 15 }} />
          Upload Recording
        </button>

        {/* Upload progress bar */}
        {uploadPct !== null && (
          <div style={{ width: "100%", maxWidth: 300, marginTop: 12 }}>
            <div style={{ height: 6, borderRadius: 99, background: "hsl(var(--border))", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  borderRadius: 99,
                  background: "linear-gradient(90deg, hsl(225, 73%, 57%), hsl(250, 70%, 55%))",
                  width: `${uploadPct}%`,
                  transition: "width 0.2s ease",
                }}
              />
            </div>
            <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", textAlign: "center", marginTop: 4 }}>
              Uploading… {uploadPct}%
            </p>
          </div>
        )}
      </div>

      <div
        className="relative z-10 flex items-center justify-center flex-wrap"
        style={{ marginTop: 28, gap: 10 }}
      >
        {[
          { icon: Gauge, label: "Confidence", color: "hsl(var(--primary))" },
          { icon: Timer, label: "Pacing", color: "hsl(var(--success))" },
          { icon: AlertTriangle, label: "Filler Words", color: "hsl(var(--warning))" },
          { icon: TrendingUp, label: "Clarity", color: "hsl(var(--info))" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 rounded-full border border-border bg-card/80 text-xs font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:shadow-sm"
            style={{ padding: "6px 14px" }}
          >
            <item.icon style={{ width: 12, height: 12, color: item.color }} />
            {item.label}
          </div>
        ))}
      </div>

    </div>
  );
};

export default PracticeStage;
