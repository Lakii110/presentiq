"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

type Props = {
  /** Pass sessions array; we'll bucket by day-of-week */
  sessions: { created_at: string }[];
};

export default function UserGrowthChart({ sessions }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts = Object.fromEntries(days.map((d) => [d, 0]));
    const now = new Date();
    sessions.forEach((s) => {
      const d = new Date(s.created_at);
      if ((now.getTime() - d.getTime()) / 86400000 < 7) {
        const key = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
        counts[key]++;
      }
    });

    const ctx = canvasRef.current.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, "rgba(99,102,241,0.25)");
    gradient.addColorStop(1, "rgba(99,102,241,0)");

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: days,
        datasets: [
          {
            label: "Sessions",
            data: days.map((d) => counts[d]),
            borderColor: "#6366f1",
            borderWidth: 2.5,
            pointBackgroundColor: "#6366f1",
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            backgroundColor: gradient,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y} sessions` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: "#888" } },
          y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 }, color: "#888" }, grid: { color: "rgba(0,0,0,0.05)" } },
        },
        animation: { duration: 900 },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [sessions]);

  return <canvas ref={canvasRef} />;
}
