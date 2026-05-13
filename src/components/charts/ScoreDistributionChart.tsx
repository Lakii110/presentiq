"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  type ChartData,
} from "chart.js";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

type Props = {
  distribution: { range: string; count: number }[];
};

const COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#6366f1"];

export default function ScoreDistributionChart({ distribution }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();

    const data: ChartData<"doughnut"> = {
      labels: distribution.map((d) => d.range),
      datasets: [
        {
          data: distribution.map((d) => d.count),
          backgroundColor: COLORS.slice(0, distribution.length),
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data,
      options: {
        cutout: "65%",
        plugins: {
          legend: {
            position: "bottom",
            labels: { font: { size: 11 }, padding: 12, color: "#888", boxWidth: 10, borderRadius: 5 },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed} sessions`,
            },
          },
        },
        animation: { animateRotate: true, duration: 900 },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [distribution]);

  return <canvas ref={canvasRef} />;
}
