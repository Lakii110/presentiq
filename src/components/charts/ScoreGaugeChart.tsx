"use client";

import { useEffect, useRef } from "react";
import { Chart, DoughnutController, ArcElement, Tooltip } from "chart.js";

Chart.register(DoughnutController, ArcElement, Tooltip);

type Props = { score: number; size?: number };

export default function ScoreGaugeChart({ score, size = 140 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();

    const color =
      score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
    const track = "rgba(255,255,255,0.08)";

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [score, 100 - score],
            backgroundColor: [color, track],
            borderWidth: 0,
            hoverBackgroundColor: [color, track],
          },
        ],
      },
      options: {
        cutout: "78%",
        rotation: -90,
        circumference: 180,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        animation: { animateRotate: true, duration: 1000 },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [score]);

  const color =
    score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ position: "relative", width: size, height: size / 2 + 16 }}>
      <canvas ref={canvasRef} width={size} height={size / 2} />
      <div style={{
        position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
        textAlign: "center", lineHeight: 1,
      }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 800, color }}>{score}</span>
        <span style={{ fontSize: size * 0.1, color: "rgba(255,255,255,0.4)", marginLeft: 2 }}>/100</span>
      </div>
    </div>
  );
}
