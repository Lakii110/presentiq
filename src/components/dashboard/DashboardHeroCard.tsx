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
    ? `You've completed ${analyzed} analyzed session${analyzed !== 1 ? "s" : ""}. Keep up the great work!`
    : "Upload a recording to get your first AI-powered speech analysis.";

  const bubbleText = streak > 0
    ? `You're on a ${streak}-day streak!\nKeep it up! 🔥`
    : "Ready for your first session?\nLet's go! 🎤";

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 sm:p-8 min-h-[200px] sm:min-h-[240px]"
      style={{
        background: "linear-gradient(135deg, hsl(235, 50%, 30%) 0%, hsl(260, 55%, 40%) 50%, hsl(250, 60%, 35%) 100%)",
      }}
    >
      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-15">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white/25" style={{ width: 4 + i * 2, height: 4 + i * 2, top: `${15 + i * 14}%`, left: `${8 + i * 18}%`, animation: `float ${3 + i}s ease-in-out infinite alternate` }} />
        ))}
      </div>

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8">
        {/* Left */}
        <div className="max-w-full md:max-w-[480px]">
          <h2 className="font-bold text-white text-lg sm:text-xl md:text-[22px] leading-tight mb-2">
            {greeting}
          </h2>
          <p className="text-white/65 leading-relaxed text-xs sm:text-sm mb-4 sm:mb-6">
            {subText}
          </p>
          <Link href="/dashboard/upload">
            <Button className="gap-2 bg-white font-semibold text-gray-900 shadow-lg hover:bg-white/90 hover:shadow-xl transition-all duration-200 rounded-xl h-11 sm:h-12 px-5 sm:px-6 w-full sm:w-auto">
              <Play className="h-4 w-4" /> Start Practice
            </Button>
          </Link>
        </div>

        {/* Right — bubble + robot */}
        <div className="hidden lg:flex items-center gap-4 mr-6">
          <div className="text-white rounded-2xl px-4 py-3 text-xs sm:text-[13px] leading-relaxed max-w-[200px] relative whitespace-pre-line" style={{ background: "rgba(30, 30, 60, 0.55)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {bubbleText}
            <div className="absolute right-[-6px] top-1/2 -mt-1.5 w-3 h-3 rotate-45" style={{ background: "rgba(30, 30, 60, 0.55)", borderRight: "1px solid rgba(255,255,255,0.1)", borderTop: "1px solid rgba(255,255,255,0.1)" }} />
          </div>

          {/* Robot */}
          <div className="flex items-center justify-center animate-float w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0" style={{ background: "linear-gradient(145deg, #F5F7FA, #EDEFF2)", boxShadow: "8px 8px 20px rgba(0,0,0,0.08), -4px -4px 12px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.7)" }}>
            <div className="relative">
              <div className="flex items-center justify-center w-14 h-12 sm:w-16 sm:h-14 rounded-xl sm:rounded-2xl" style={{ background: "linear-gradient(145deg, #1F2A37, #0F172A)", boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)" }}>
                <div className="absolute top-0.5 left-1/2 -ml-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "#38BDF8", boxShadow: "0 0 6px #38BDF8, 0 0 12px rgba(56,189,248,0.4)" }} />
                <div className="flex gap-3">
                  <div className="rounded-full animate-blink w-2 h-5" style={{ background: "#22D3EE", boxShadow: "0 0 8px #22D3EE, 0 0 18px #67E8F9" }} />
                  <div className="rounded-full animate-blink w-2 h-5" style={{ animationDelay: "0.1s", background: "#22D3EE", boxShadow: "0 0 8px #22D3EE, 0 0 18px #67E8F9" }} />
                </div>
              </div>
              <div className="absolute rounded-full w-1.5 h-1.5 bottom-1 left-1.5" style={{ background: "#F472B6", opacity: 0.28, filter: "blur(1.5px)" }} />
              <div className="absolute rounded-full w-1.5 h-1.5 bottom-1 right-1.5" style={{ background: "#F472B6", opacity: 0.28, filter: "blur(1.5px)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeroCard;
