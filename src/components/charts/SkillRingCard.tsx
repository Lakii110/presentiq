"use client";

import { useEffect, useRef } from "react";
import { Chart, DoughnutController, ArcElement, Tooltip } from "chart.js";

Chart.register(DoughnutController, ArcElement, Tooltip);

// Distinct color per skill slot — vivid, clearly different
const PALETTE = [
  { main: "#22c55e", track: "rgba(34,197,94,0.12)",   glow: "rgba(34,197,94,0.18)"   }, // green
  { main: "#6366f1", track: "rgba(99,102,241,0.12)",  glow: "rgba(99,102,241,0.18)"  }, // indigo
  { main: "#06b6d4", track: "rgba(6,182,212,0.12)",   glow: "rgba(6,182,212,0.18)"   }, // cyan
  { main: "#f59e0b", track: "rgba(245,158,11,0.12)",  glow: "rgba(245,158,11,0.18)"  }, // amber
  { main: "#ec4899", track: "rgba(236,72,153,0.12)",  glow: "rgba(236,72,153,0.18)"  }, // pink
  { main: "#8b5cf6", track: "rgba(139,92,246,0.12)",  glow: "rgba(139,92,246,0.18)"  }, // violet
];

type Props = {
  skill: string;
  value: number;
  tip?: string;
  isFocus?: boolean;
  colorIndex?: number;
};

export default function SkillRingCard({ skill, value, tip, isFocus, colorIndex = 0 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();

    const { main, track } = PALETTE[colorIndex % PALETTE.length];

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        datasets: [{
          data: [value, 100 - value],
          backgroundColor: [main, track],
          borderWidth: 0,
          hoverBackgroundColor: [main, track],
        }],
      },
      options: {
        cutout: "74%",
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        animation: { animateRotate: true, duration: 900 },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [value, colorIndex]);

  const { main, glow } = PALETTE[colorIndex % PALETTE.length];

  return (
    <div
      className="flex flex-col items-center rounded-2xl border border-border bg-card transition-all hover:shadow-lg"
      style={{ padding: "20px 12px", gap: 10, minWidth: 0 }}
    >
      {/* Ring */}
      <div style={{
        position: "relative", width: 88, height: 88,
        borderRadius: "50%",
        boxShadow: `0 0 18px ${glow}`,
      }}>
        <canvas ref={canvasRef} width={88} height={88} />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: main, lineHeight: 1 }}>{value}</span>
          <span style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", marginTop: 1 }}>/100</span>
        </div>
      </div>

      {/* Skill name */}
      <p className="text-sm font-semibold text-foreground text-center" style={{ lineHeight: 1.2 }}>{skill}</p>

      {/* Focus badge */}
      {isFocus && (
        <span className="text-[10px] font-bold rounded-full px-2 py-0.5"
          style={{ background: "hsl(0 84% 60% / 0.12)", color: "hsl(0 84% 60%)" }}>
          Focus area
        </span>
      )}

      {/* Tip */}
      {tip && (
        <p className="text-[11px] text-muted-foreground text-center" style={{ lineHeight: 1.5 }}>
          {tip}
        </p>
      )}
    </div>
  );
}
