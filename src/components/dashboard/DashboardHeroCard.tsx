"use client";
import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "@/hooks/useDashboardData";
import { calcStreak } from "@/hooks/useStreak";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useDisplayName } from "@/hooks/useDisplayName";
import { useMemo } from "react";

const DashboardHeroCard = () => {
  const { sessions } = useDashboardData();
  const { data: user } = useAuthUser();
  const { displayName } = useDisplayName(user?.email, user?.display_name);

  const streak = useMemo(() => calcStreak(sessions), [sessions]);
  const analyzed = sessions.filter((s) => s.analysis).length;
  
  const greeting = displayName && displayName !== "..." 
    ? `Hi ${displayName}, ready for your next practice session?`
    : "Ready for your next practice session?";
  
  const subText = analyzed > 0
    ? `You've completed ${analyzed} analyzed session${analyzed !== 1 ? "s" : ""}. Keep the momentum going!`
    : "Upload a recording to get your first AI-powered speech analysis.";

  const bubbleText = streak > 0
    ? `You're on a ${streak}-day streak!\nKeep it up! 🔥`
    : "Ready for your first session?\nLet's go! 🎤";

  return (
    <div
      className="relative overflow-hidden"
      style={{
        borderRadius: 24, padding: 32, minHeight: 240,
        background: "linear-gradient(135deg, hsl(235, 50%, 30%) 0%, hsl(260, 55%, 40%) 50%, hsl(250, 60%, 35%) 100%)",
      }}
    >
      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-15">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white/25" style={{ width: 4 + i * 2, height: 4 + i * 2, top: `${15 + i * 14}%`, left: `${8 + i * 18}%`, animation: `float ${3 + i}s ease-in-out infinite alternate` }} />
        ))}
      </div>

      <div className="relative flex items-center justify-between" style={{ gap: 32 }}>
        {/* Left */}
        <div style={{ maxWidth: 480 }}>
          <h2 className="font-bold text-white" style={{ fontSize: 22, lineHeight: 1.3, marginBottom: 8 }}>
            {greeting}
          </h2>
          <p className="text-white/65 leading-relaxed" style={{ fontSize: 14, marginBottom: 24 }}>
            {subText}
          </p>
          <Link href="/dashboard/upload">
            <Button className="gap-2 bg-white font-semibold text-gray-900 shadow-lg hover:bg-white/90 hover:shadow-xl transition-all duration-200" style={{ borderRadius: 12, height: 44, paddingLeft: 20, paddingRight: 20 }}>
              <Play className="h-4 w-4" /> Start Practice
            </Button>
          </Link>
        </div>

        {/* Right — bubble + robot */}
        <div className="hidden md:flex items-center" style={{ gap: 16, marginRight: 24 }}>
          <div className="text-white" style={{ borderRadius: 16, background: "rgba(30, 30, 60, 0.55)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.1)", padding: "12px 16px", fontSize: 13, lineHeight: 1.5, maxWidth: 200, position: "relative", whiteSpace: "pre-line" }}>
            {bubbleText}
            <div style={{ position: "absolute", right: -6, top: "50%", marginTop: -6, width: 12, height: 12, background: "rgba(30, 30, 60, 0.55)", transform: "rotate(45deg)", borderRight: "1px solid rgba(255,255,255,0.1)", borderTop: "1px solid rgba(255,255,255,0.1)" }} />
          </div>

          {/* Robot */}
          <div className="flex items-center justify-center animate-float" style={{ width: 96, height: 96, borderRadius: 24, background: "linear-gradient(145deg, #F5F7FA, #EDEFF2)", boxShadow: "8px 8px 20px rgba(0,0,0,0.08), -4px -4px 12px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.7)", flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <div className="flex items-center justify-center" style={{ width: 64, height: 56, borderRadius: 14, background: "linear-gradient(145deg, #1F2A37, #0F172A)", boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)" }}>
                <div className="absolute" style={{ top: 2, left: "50%", marginLeft: -3, width: 5, height: 5, borderRadius: "50%", background: "#38BDF8", boxShadow: "0 0 6px #38BDF8, 0 0 12px rgba(56,189,248,0.4)" }} />
                <div className="flex" style={{ gap: 14 }}>
                  <div className="rounded-full animate-blink" style={{ width: 9, height: 22, background: "#22D3EE", boxShadow: "0 0 8px #22D3EE, 0 0 18px #67E8F9" }} />
                  <div className="rounded-full animate-blink" style={{ animationDelay: "0.1s", width: 9, height: 22, background: "#22D3EE", boxShadow: "0 0 8px #22D3EE, 0 0 18px #67E8F9" }} />
                </div>
              </div>
              <div className="absolute rounded-full" style={{ width: 6, height: 6, background: "#F472B6", opacity: 0.28, filter: "blur(1.5px)", bottom: 4, left: 6 }} />
              <div className="absolute rounded-full" style={{ width: 6, height: 6, background: "#F472B6", opacity: 0.28, filter: "blur(1.5px)", bottom: 4, right: 6 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeroCard;
