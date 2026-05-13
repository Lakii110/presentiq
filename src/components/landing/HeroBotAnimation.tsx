import { Check, Flame, AlertTriangle } from "lucide-react";

const HeroBotAnimation = () => {
  return (
    <div className="relative flex items-center justify-center w-full max-w-[460px] aspect-square px-4 sm:px-0" style={{ maxHeight: 420 }}>
      {/* Soft background glow */}
      <div className="absolute inset-0 rounded-full bg-info/10 blur-3xl scale-75" />

      {/* Top Left - Confidence Card */}
      <div className="absolute top-0 sm:top-2 left-0 sm:left-0 animate-float-card-1 z-10 scale-75 sm:scale-100">
        <div className="rounded-xl sm:rounded-2xl border border-border bg-card px-3 py-2 sm:px-5 sm:py-4 shadow-xl backdrop-blur-sm">
          <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground mb-1">Confidence</p>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-info/15">
              <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-info" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-foreground">High Energy</span>
          </div>
        </div>
      </div>

      {/* Top Right - Overall / Excellent Pitch Card */}
      <div className="absolute -top-2 sm:-top-2 right-0 sm:right-0 animate-float-card-2 z-10 scale-75 sm:scale-100">
        <div className="rounded-xl sm:rounded-2xl border border-border bg-card px-4 py-3 sm:px-6 sm:py-5 shadow-xl backdrop-blur-sm">
          <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground mb-1 sm:mb-2 text-center">Overall</p>
          <div className="flex flex-col items-center gap-1.5 sm:gap-2">
            <div className="relative h-12 w-12 sm:h-16 sm:w-16">
              <svg className="h-12 w-12 sm:h-16 sm:w-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--accent))" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${0.92 * 2 * Math.PI * 28} ${2 * Math.PI * 28}`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-base sm:text-lg font-extrabold text-accent">92</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-foreground whitespace-nowrap">Excellent Pitch</span>
          </div>
        </div>
      </div>

      {/* Bottom Left - Filler Words Card */}
      <div className="absolute bottom-8 sm:bottom-12 -left-2 sm:-left-2 animate-float-card-3 z-10 scale-75 sm:scale-100">
        <div className="rounded-xl sm:rounded-2xl border border-border bg-card px-3 py-2 sm:px-5 sm:py-4 shadow-xl backdrop-blur-sm">
          <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground mb-1">Filler Words</p>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-warning/15">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-foreground whitespace-nowrap">Only 2 detected!</span>
          </div>
        </div>
      </div>

      {/* Bottom Right - Pacing Card */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 animate-float-card-4 z-10 scale-75 sm:scale-100">
        <div className="rounded-xl sm:rounded-2xl border border-border bg-card px-3 py-2 sm:px-5 sm:py-4 shadow-xl backdrop-blur-sm">
          <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground mb-1">Pacing</p>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-success/15">
              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-foreground whitespace-nowrap">Perfect (140 wpm)</span>
          </div>
        </div>
      </div>

      {/* Bot - Neumorphic container */}
      <div className="relative animate-float z-0 mt-2">
        {/* Ambient glow */}
        <div className="absolute inset-0 rounded-[32px] bg-info/12 blur-3xl scale-150" />

        {/* Outer neumorphic shell */}
        <div
          className="relative flex h-[120px] w-[120px] sm:h-[148px] sm:w-[148px] items-center justify-center rounded-[28px] sm:rounded-[32px]"
          style={{
            background: "linear-gradient(145deg, #F5F7FA, #EDEFF2)",
            boxShadow:
              "10px 10px 24px rgba(0,0,0,0.07), -8px -8px 20px rgba(255,255,255,0.95), inset 1px 1px 3px rgba(255,255,255,0.7)",
          }}
        >
          {/* Inner dark screen */}
          <div
            className="relative flex h-[82px] w-[82px] sm:h-[102px] sm:w-[102px] items-center justify-center rounded-[18px] sm:rounded-[22px]"
            style={{
              background: "linear-gradient(145deg, #1F2A37, #0F172A)",
              boxShadow:
                "inset 0 3px 10px rgba(0,0,0,0.5), 0 0 24px rgba(15,23,42,0.25)",
            }}
          >
            {/* Top indicator light */}
            <div
              className="absolute -top-[4px] sm:-top-[5px] left-1/2 -translate-x-1/2 h-[5px] w-[5px] sm:h-[6px] sm:w-[6px] rounded-full"
              style={{
                background: "#38BDF8",
                boxShadow: "0 0 6px #38BDF8, 0 0 14px rgba(56,189,248,0.4)",
              }}
            />

            {/* Eyes */}
            <div className="flex gap-[12px] sm:gap-[14px] items-center">
              <div
                className="h-[24px] w-[12px] sm:h-[30px] sm:w-[15px] rounded-full animate-blink"
                style={{
                  background: "#22D3EE",
                  boxShadow:
                    "0 0 8px #22D3EE, 0 0 18px #67E8F9, 0 0 28px rgba(34,211,238,0.25)",
                }}
              />
              <div
                className="h-[24px] w-[12px] sm:h-[30px] sm:w-[15px] rounded-full animate-blink"
                style={{
                  animationDelay: "0.1s",
                  background: "#22D3EE",
                  boxShadow:
                    "0 0 8px #22D3EE, 0 0 18px #67E8F9, 0 0 28px rgba(34,211,238,0.25)",
                }}
              />
            </div>

            {/* Blush dots */}
            <div
              className="absolute bottom-[16px] sm:bottom-[20px] left-[14px] sm:left-[18px] h-[6px] w-[6px] sm:h-[7px] sm:w-[7px] rounded-full"
              style={{ background: "#F472B6", opacity: 0.28, filter: "blur(2px)" }}
            />
            <div
              className="absolute bottom-[16px] sm:bottom-[20px] right-[14px] sm:right-[18px] h-[6px] w-[6px] sm:h-[7px] sm:w-[7px] rounded-full"
              style={{ background: "#F472B6", opacity: 0.28, filter: "blur(2px)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBotAnimation;
