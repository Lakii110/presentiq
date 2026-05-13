import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Mic,
  BarChart3,
  Settings,
  Shield,
  ChevronDown,
  ChevronUp,
  Mail,
  AlertCircle,
  BookOpen,
  Lightbulb,
  FileText,
  Sparkles,
  ExternalLink,
  X,
} from "lucide-react";

/* ── data ── */
const categories = [
  {
    icon: Mic,
    title: "Practice & Recording",
    desc: "Recording, modes, microphone setup",
    color: "hsl(var(--primary))",
    content: [
      { heading: "How to start a practice session", body: "Click 'New Practice' in the sidebar. Choose between Practice mode (guided feedback) or Exam mode (strict scoring). Then click 'Start Speaking' to record using your microphone, or click 'Upload Recording' to upload an existing audio file." },
      { heading: "Microphone not working?", body: "Make sure your browser has microphone permission. In Chrome, click the lock icon in the address bar → Site settings → Microphone → Allow. Then refresh the page and try again." },
      { heading: "Supported audio formats", body: "You can upload .mp3, .wav, .webm, .m4a, .ogg, .flac, and .mp4 files. For best results, use a clear recording with minimal background noise. Maximum file size is 1 GB — suitable for speeches over 1 hour." },
      { heading: "Practice vs Exam mode", body: "Practice mode gives you guided, encouraging feedback focused on improvement. Exam mode simulates a real presentation scenario with stricter scoring — ideal for testing yourself before an important speech." },
    ],
  },
  {
    icon: BarChart3,
    title: "Analysis & Scores",
    desc: "Understanding your speech results",
    color: "hsl(263 70% 58%)",
    content: [
      { heading: "How is my overall score calculated?", body: "Your score is a weighted average of 5 key skills: Clarity, Confidence, Pacing, Filler Words, and Tone. Each skill is scored 0–100 based on AI analysis of your speech patterns, and combined into a single overall score." },
      { heading: "What do the skill scores mean?", body: "80–100: Excellent — you're performing at a high level in this area. 65–79: Good — solid performance with room to grow. Below 65: Needs Work — this is your priority area to focus on in your next session." },
      { heading: "Understanding the speech timeline", body: "The timeline shows your speech broken into color-coded segments: Green = clear delivery, Amber = fast pacing, Red = filler words detected, Blue = strategic pause. Hover over any segment to see details." },
      { heading: "Why does analysis take time?", body: "Your audio is transcribed using Whisper AI and then scored across multiple dimensions. This typically takes 30–60 seconds. The first run may take longer as the AI model loads. Keep the page open while it processes." },
    ],
  },
  {
    icon: Settings,
    title: "Account & Settings",
    desc: "Profile, preferences, appearance",
    color: "hsl(200 70% 50%)",
    content: [
      { heading: "How do I update my profile?", body: "Go to Profile in the sidebar. Click 'Edit Profile' to update your name and email address. Your changes are saved locally — note that email changes do not update your login credentials." },
      { heading: "Changing your password", body: "Go to Settings → Profile & Account → Password → Change Password. You'll need to enter your current password to set a new one. Use a strong password with at least 8 characters." },
      { heading: "Switching between light and dark mode", body: "Go to Settings → Appearance → Theme. Click 'Light' or 'Dark' to switch instantly. Your preference is saved and will persist across sessions." },
      { heading: "Setting your default practice mode", body: "Go to Profile → Practice Preferences → Default Mode. Choose Practice or Exam. This mode will be pre-selected every time you open the New Practice page." },
    ],
  },
  {
    icon: Shield,
    title: "Privacy & Data",
    desc: "Security, recordings, data control",
    color: "hsl(150 60% 42%)",
    content: [
      { heading: "How is my data stored?", body: "Your recordings and analysis results are stored securely on the backend server. Audio files are kept on the server after analysis. We never share your data with third parties." },
      { heading: "Can I delete my recordings?", body: "Yes. Go to Settings → Privacy & Data → Delete Account Data to permanently remove all your recordings and analysis history. This action cannot be undone." },
      { heading: "Is my speech data used to train AI?", body: "No. Your recordings are only used to generate your personal analysis. They are not used to train or improve any AI models. Your speech data is private to your account only." },
      { heading: "How do I delete my account?", body: "Go to Settings → Privacy & Data → Delete Account Data. This will permanently remove your account, all sessions, recordings, and analysis history. You will be signed out immediately." },
    ],
  },
];

const faqs: { q: string; a: string }[] = [
  { q: "How does PresentIQ analyze my speech?", a: "PresentIQ uses advanced AI to evaluate your clarity, pacing, confidence, filler word usage, and overall structure. After each session you receive a detailed breakdown with actionable suggestions." },
  { q: "Can I practice without a microphone?", a: "A microphone is required for live practice mode. However, you can upload a pre-recorded audio file for analysis if you prefer." },
  { q: "How is my score calculated?", a: "Your score is a weighted average of multiple dimensions including clarity, pacing, confidence, structure, and filler word reduction. Each dimension is scored individually and combined into an overall rating." },
  { q: "Are my recordings stored securely?", a: "Yes. All recordings are encrypted at rest and in transit. You can delete your recordings at any time from Settings → Privacy & Data." },
  { q: "What is the difference between Practice and Exam mode?", a: "Practice mode gives you real-time hints and lets you pause. Exam mode simulates a timed presentation with no interruptions and provides feedback only after completion." },
  { q: "How can I improve my pacing?", a: "Focus on pausing between sentences. PresentIQ highlights sections where you spoke too fast. Try the Focus Mission on the Progress page for targeted exercises." },
];

const guides = [
  {
    icon: Lightbulb,
    title: "How to improve your speaking skills",
    desc: "5 practical tips backed by AI insights",
    content: [
      { heading: "1. Practice the 3-second pause", body: "Before transitioning between key points, pause for 3 seconds. This gives your audience time to absorb what you said, and makes you sound more confident and deliberate. Replace filler words like 'um' and 'uh' with this pause instead." },
      { heading: "2. Record yourself daily", body: "Even 5 minutes of daily recording builds lasting habits. You don't need a perfect speech — just speak about anything. Over time, you'll naturally reduce filler words and improve your pacing without even thinking about it." },
      { heading: "3. Focus on one skill at a time", body: "Don't try to fix everything at once. Check your Skills Breakdown after each session and pick the lowest-scoring skill. Spend 2–3 sessions focused only on that skill before moving to the next one." },
      { heading: "4. Vary your pace intentionally", body: "Slow down when making an important point, speed up slightly during transitions. This variation keeps your audience engaged and signals what matters most. Aim for 130–160 words per minute for most presentations." },
      { heading: "5. Use your Progress page", body: "Check your Progress Tracking page weekly. Look at your Growth Story chart to see if you're improving. If a skill is declining, make it your Focus Mission for the next week." },
    ],
  },
  {
    icon: FileText,
    title: "Understanding your analysis results",
    desc: "A complete guide to your score breakdown",
    content: [
      { heading: "Overall Score", body: "Your overall score (0–100) is a weighted average of all 5 skill dimensions. 80+ is excellent, 65–79 is good, below 65 means there's significant room to grow. Don't be discouraged by a low score — it's a starting point, not a judgment." },
      { heading: "Skills Breakdown", body: "Five skills are measured: Clarity (how easy your speech is to follow), Confidence (steadiness and energy), Pacing (words per minute), Filler Words (how often you say 'um', 'uh', 'like'), and Tone (pitch variation and emphasis)." },
      { heading: "Speech Timeline", body: "The colored timeline shows your speech moment by moment. Green = clear delivery, Amber = fast pacing, Red = filler words detected, Blue = strategic pause. Hover over any segment to see what happened at that exact moment." },
      { heading: "AI Coach Insights", body: "The insights section shows your top strengths and areas to improve, generated directly from your speech data. Strengths (green) are things you did well. Needs Work (amber) are your priority areas. Suggestions (blue) are actionable next steps." },
      { heading: "Transcript", body: "Your full speech transcript is shown with filler words highlighted in amber. Hover over any highlighted word to see a suggestion. You can also hover the timeline to sync it with the transcript — the relevant section will highlight." },
    ],
  },
  {
    icon: BookOpen,
    title: "Getting started with PresentIQ",
    desc: "Set up your first practice session in minutes",
    content: [
      { heading: "Step 1: Create your account", body: "Sign up with your email and a password of at least 8 characters. You'll be taken straight to your dashboard after signing up — no email verification needed." },
      { heading: "Step 2: Start your first practice", body: "Click 'New Practice' in the sidebar. Choose Practice mode for your first session — it gives you the most detailed feedback. Click 'Start Speaking' and allow microphone access when prompted." },
      { heading: "Step 3: Speak naturally", body: "Talk for at least 30 seconds for a meaningful analysis. You can speak about anything — introduce yourself, describe your day, or practice a real presentation. Click 'Stop & Analyze' when you're done." },
      { heading: "Step 4: Review your results", body: "After analysis completes (30–60 seconds), you'll see your Results page with your overall score. Click 'View Full Analysis' to see your detailed breakdown — skills, timeline, transcript, and AI insights." },
      { heading: "Step 5: Track your progress", body: "After a few sessions, visit the Progress Tracking page to see your growth chart, skill trends, and achievements. Aim to practice at least 3 times per week for the fastest improvement." },
    ],
  },
];

/* ── helpers ── */
const sectionAnim = (show: boolean, delay: string) => ({
  opacity: show ? 1 : 0,
  transform: show ? "translateY(0)" : "translateY(18px)",
  transition: `opacity 500ms ${delay} ease-out, transform 500ms ${delay} ease-out`,
});

/* ── component ── */
const HelpSupport = () => {
  const [show, setShow] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<{ icon: React.ElementType; title: string; desc: string; color?: string; content: { heading: string; body: string }[] } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <DashboardLayout>
      <div style={{ paddingTop: 40, paddingBottom: 64 }}>
        {/* ── Hero ── */}
        <div
          style={{
            ...sectionAnim(show, "0ms"),
            borderRadius: 20,
            padding: "40px 32px",
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.07) 0%, hsl(263 70% 58% / 0.05) 100%)",
            border: "1px solid hsl(var(--border))",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* Bot + message */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "hsl(var(--primary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Sparkles style={{ width: 24, height: 24, color: "hsl(var(--primary-foreground))" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground" style={{ lineHeight: 1.2 }}>
                Help & Support
              </h1>
              <p className="text-sm text-muted-foreground" style={{ marginTop: 4 }}>
                I'm here to help! Ask anything about your speech practice.
              </p>
            </div>
          </div>

          {/* Search removed */}
        </div>

        {/* ── Quick Help Categories ── */}
        <div style={sectionAnim(show, "80ms")}>
          <h2 className="text-base font-semibold text-foreground" style={{ marginTop: 48, marginBottom: 16 }}>
            Quick Help Categories
          </h2>
          <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {categories.map((c) => (
              <button
                key={c.title}
                onClick={() => setActiveCategory(c)}
                className="group flex flex-col items-start rounded-2xl border border-border bg-card text-left transition-all hover:shadow-md hover:border-primary/30"
                style={{ padding: 24, gap: 12, cursor: "pointer" }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `${c.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <c.icon style={{ width: 20, height: 20, color: c.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground" style={{ marginTop: 4 }}>{c.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Common Questions ── */}
        <div style={sectionAnim(show, "160ms")}>
          <h2 className="text-base font-semibold text-foreground" style={{ marginTop: 48, marginBottom: 16 }}>
            Common Questions
          </h2>
          <div
            className="rounded-2xl border border-border bg-card"
            style={{ overflow: "hidden" }}
          >
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} style={{ borderTop: i > 0 ? "1px solid hsl(var(--border))" : "none" }}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between text-left text-sm font-medium text-foreground transition-colors hover:text-primary"
                    style={{ padding: "16px 24px", gap: 12 }}
                  >
                    {f.q}
                    {isOpen ? (
                      <ChevronUp style={{ width: 16, height: 16, flexShrink: 0 }} className="text-muted-foreground" />
                    ) : (
                      <ChevronDown style={{ width: 16, height: 16, flexShrink: 0 }} className="text-muted-foreground" />
                    )}
                  </button>
                  <div
                    style={{
                      maxHeight: isOpen ? 200 : 0,
                      opacity: isOpen ? 1 : 0,
                      overflow: "hidden",
                      transition: "max-height 250ms ease, opacity 200ms ease",
                    }}
                  >
                    <p className="text-sm text-muted-foreground" style={{ padding: "0 24px 20px" }}>
                      {f.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Guides & Resources ── */}
        <div style={sectionAnim(show, "240ms")}>
          <h2 className="text-base font-semibold text-foreground" style={{ marginTop: 48, marginBottom: 16 }}>
            Guides & Resources
          </h2>
          <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {guides.map((g) => (
              <button
                key={g.title}
                onClick={() => setActiveCategory(g)}
                className="group flex items-start rounded-2xl border border-border bg-card text-left transition-all hover:shadow-md hover:border-primary/30"
                style={{ padding: 24, gap: 16, cursor: "pointer" }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "hsl(var(--primary) / 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <g.icon style={{ width: 20, height: 20 }} className="text-primary" />
                </div>
                <div style={{ flex: 1 }}>
                  <p className="text-sm font-semibold text-foreground">{g.title}</p>
                  <p className="text-xs text-muted-foreground" style={{ marginTop: 4 }}>{g.desc}</p>
                </div>
                <ExternalLink style={{ width: 14, height: 14, marginTop: 2 }} className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Contact Support ── */}
        <div style={sectionAnim(show, "320ms")}>
          <h2 className="text-base font-semibold text-foreground" style={{ marginTop: 48, marginBottom: 16 }}>
            Contact Support
          </h2>
          <div
            className="rounded-2xl border border-border bg-card"
            style={{ padding: 32, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: "hsl(var(--primary) / 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Mail style={{ width: 20, height: 20 }} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Need more help?</p>
                <p className="text-xs text-muted-foreground" style={{ marginTop: 4 }}>
                  We usually respond within 24 hours.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="flex items-center rounded-xl border border-border bg-secondary/50 text-sm font-medium text-foreground transition-all hover:bg-secondary"
                style={{ height: 40, padding: "0 20px", gap: 8 }}
                onClick={() => window.location.href = "mailto:support@presentiq.com?subject=Issue Report"}
              >
                <AlertCircle style={{ width: 15, height: 15 }} />
                Report Issue
              </button>
              <button
                className="flex items-center rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
                style={{ height: 40, padding: "0 20px", gap: 8 }}
                onClick={() => window.location.href = "mailto:support@presentiq.com"}
              >
                <Mail style={{ width: 15, height: 15 }} />
                Email Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Modal ── */}
      {activeCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setActiveCategory(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl"
            style={{ padding: 32, maxHeight: "80vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${activeCategory.color ?? "hsl(var(--primary))"}15` }}>
                  <activeCategory.icon style={{ width: 20, height: 20, color: activeCategory.color ?? "hsl(var(--primary))" }} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">{activeCategory.title}</h2>
                  <p className="text-xs text-muted-foreground">{activeCategory.desc}</p>
                </div>
              </div>
              <button onClick={() => setActiveCategory(null)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col" style={{ gap: 20 }}>
              {activeCategory.content.map((item, i) => (
                <div key={i} className="rounded-xl bg-secondary/40" style={{ padding: "16px 20px" }}>
                  <p className="text-sm font-semibold text-foreground mb-2">{item.heading}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

            <button onClick={() => setActiveCategory(null)} className="mt-6 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              Got it
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default HelpSupport;
