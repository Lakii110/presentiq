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

// Color-code bars based on score performance
function getBarColor(score: number): string {
  if (score >= 80) return "rgba(34, 197, 94, 0.85)"; // Green - Excellent
  if (score >= 60) return "rgba(251, 146, 60, 0.85)"; // Orange - Good
  return "rgba(239, 68, 68, 0.85)"; // Red - Needs work
}

function getBarHoverColor(score: number): string {
  if (score >= 80) return "rgba(34, 197, 94, 1)"; // Brighter green
  if (score >= 60) return "rgba(251, 146, 60, 1)"; // Brighter orange
  return "rgba(239, 68, 68, 1)"; // Brighter red
}

export default function SessionScoreBarChart({ scoreHistory }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !scoreHistory.length) return;
    chartRef.current?.destroy();

    const ctx = canvasRef.current.getContext("2d")!;

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: scoreHistory.map((s) => s.date),
        datasets: [
          {
            label: "Score",
            data: scoreHistory.map((s) => s.score),
            backgroundColor: scoreHistory.map((s) => getBarColor(s.score)),
            hoverBackgroundColor: scoreHistory.map((s) => getBarHoverColor(s.score)),
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { 
            callbacks: { 
              label: (ctx) => {
                const score = ctx.parsed.y;
                const tier = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work";
                return ` Score: ${score}/100 (${tier})`;
              }
            },
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            cornerRadius: 8,
          },
        },
        scales: {
          x: { 
            grid: { display: false }, 
            ticks: { font: { size: 11 }, color: "#888" } 
          },
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
