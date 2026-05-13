"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  BarController,
  BarElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend);

type Props = {
  scoreHistory: { session: string; score: number; date: string }[];
};

export default function SessionScoreBarChart({ scoreHistory }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !scoreHistory.length) return;
    chartRef.current?.destroy();

    const ctx = canvasRef.current.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 220);
    gradient.addColorStop(0, "rgba(99,102,241,0.9)");
    gradient.addColorStop(1, "rgba(99,102,241,0.3)");

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: scoreHistory.map((s) => s.date),
        datasets: [
          {
            label: "Score",
            data: scoreHistory.map((s) => s.score),
            backgroundColor: gradient,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` Score: ${ctx.parsed.y}/100` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: "#888" } },
          y: {
            min: 0, max: 100,
            ticks: { stepSize: 25, font: { size: 11 }, color: "#888" },
            grid: { color: "rgba(0,0,0,0.05)" },
          },
        },
        animation: { duration: 900 },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [scoreHistory]);

  return <canvas ref={canvasRef} />;
}
