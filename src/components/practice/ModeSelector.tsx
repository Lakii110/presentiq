import { Mic, GraduationCap } from "lucide-react";
import type { Mode } from "./PracticeStage";

interface ModeSelectorProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

const modeConfig: Record<Mode, { icon: typeof Mic; desc: string }> = {
  Practice: { icon: Mic,           desc: "Guided feedback as you go" },
  Exam:     { icon: GraduationCap, desc: "Strict scoring, no hints"  },
};

const ModeSelector = ({ mode, onModeChange }: ModeSelectorProps) => (
  <div
    className="relative flex items-center"
    style={{
      background: "hsl(var(--card))",
      border: "1px solid hsl(var(--border))",
      borderRadius: 16,
      padding: 4,
      boxShadow: "0 2px 12px hsl(var(--foreground) / 0.04)",
    }}
  >
    {(["Practice", "Exam"] as const).map((m) => {
      const active = mode === m;
      const Icon = modeConfig[m].icon;
      return (
        <button
          key={m}
          onClick={() => onModeChange(m)}
          className="relative z-10 flex items-center gap-2.5 transition-all duration-200"
          style={{
            height: 44,
            padding: "0 24px",
            borderRadius: 12,
            background: active ? "hsl(var(--primary))" : "transparent",
            boxShadow: active ? "0 2px 12px hsl(var(--primary) / 0.3)" : "none",
          }}
        >
          <Icon
            style={{
              width: 15,
              height: 15,
              color: active ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
            }}
          />
          <div className="flex flex-col items-start" style={{ gap: 1 }}>
            <span
              className="text-sm font-semibold leading-tight"
              style={{ color: active ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))" }}
            >
              {m}
            </span>
            <span
              className="leading-tight"
              style={{
                fontSize: 10,
                color: active ? "hsl(var(--primary-foreground) / 0.7)" : "hsl(var(--muted-foreground))",
              }}
            >
              {modeConfig[m].desc}
            </span>
          </div>
        </button>
      );
    })}
  </div>
);

export default ModeSelector;
