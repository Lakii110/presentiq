"use client";

import { useEffect, useRef } from "react";
import {
  Chart, BarController, BarElement,
  LinearScale, CategoryScale, Tooltip,
} from "chart.js";

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip);

type Props = {
  transcript: { text: string }[];
  fillers: string[];
};

export default function FillerWordsChart({ transcript, fillers }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  // Compute at component scope so both useEffect and render can access it
  const fullText = transcript.map((s) => s.text).join(" ").toLowerCase();
  const counts: Record<string, number> = {};
  for (const f of fillers) {
    const escaped = f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\b${escaped}\\b`, "gi");
    counts[f] = (fullText.match(re) ?? []).length;
  }
  const sorted = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  useEffect(() => {
    if (!canvasRef.current || !sorted.length) return;
    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: sorted.map(([k]) => k),
        datasets: [{
          data: sorted.map(([, v]) => v),
          backgroundColor: "rgba(245,158,11,0.75)",
          borderRadius: 5,
          borderSkipped: false,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.x} time${ctx.parsed.x !== 1 ? "s" : ""}` } },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: Math.max(...sorted.map(([, v]) => v)) + 1,
            ticks: { stepSize: 1, font: { size: 11 }, color: "#888" },
            grid: { color: "rgba(0,0,0,0.05)" },
          },
          y: {
            ticks: { font: { size: 12 }, color: "#aaa" },
            grid: { display: false },
          },
        },
        animation: { duration: 800 },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [transcript, fillers]);

  if (!sorted.length) return null;

  const height = Math.max(120, sorted.length * 44);
  return (
    <div style={{ height, position: "relative" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
