"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

type Skill = { skill: string; value: number };

type Props = { skills: Skill[] };

const COLORS = [
  "rgba(99,102,241,0.85)",
  "rgba(34,197,94,0.85)",
  "rgba(245,158,11,0.85)",
  "rgba(239,68,68,0.85)",
  "rgba(14,165,233,0.85)",
];

export default function SkillPolarChart({ skills }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !skills.length) return;
    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: skills.map((s) => s.skill),
        datasets: [
          {
            data: skills.map((s) => s.value),
            backgroundColor: COLORS.slice(0, skills.length),
            borderWidth: 3,
            borderColor: "transparent",
            hoverOffset: 6,
          },
        ],
      },
      options: {
        cutout: "55%",
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              font: { size: 11 },
              padding: 12,
              color: "#888",
              boxWidth: 10,
              borderRadius: 5,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}/100`,
            },
          },
        },
        animation: { animateRotate: true, duration: 900 },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [skills]);

  return <canvas ref={canvasRef} />;
}
