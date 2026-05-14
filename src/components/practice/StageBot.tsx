interface StageBotProps {
  isHovered?: boolean;
}

const StageBot = ({ isHovered }: StageBotProps) => (
  <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
    {/* Bot body */}
    <div
      className="relative flex items-center justify-center animate-float"
      style={{
        width: 96,
        height: 96,
        borderRadius: 26,
        background: "linear-gradient(145deg, #F5F7FA, #EDEFF2)",
        boxShadow: isHovered
          ? "0 0 60px hsl(200 100% 70% / 0.4), 0 0 30px hsl(200 100% 70% / 0.5), 0 0 40px hsl(225 73% 57% / 0.25), 8px 8px 20px rgba(0,0,0,0.08), -4px -4px 12px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.7)"
          : "0 0 50px hsl(200 100% 70% / 0.3), 0 0 25px hsl(200 100% 70% / 0.4), 8px 8px 20px rgba(0,0,0,0.08), -4px -4px 12px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.7)",
        transition: "box-shadow 0.25s ease",
        flexShrink: 0,
      }}
    >
      {/* Face screen */}
      <div
        style={{
          width: 64,
          height: 52,
          borderRadius: 14,
          background: "linear-gradient(180deg, hsl(224 25% 18%), hsl(228 30% 10%))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="flex" style={{ gap: 14 }}>
          {[0, 0.3].map((delay) => (
            <div
              key={delay}
              style={{
                width: 8,
                height: isHovered ? 12 : 20,
                borderRadius: 6,
                background: "#22D3EE",
                boxShadow: "0 0 10px #22D3EE, 0 0 20px #22D3EE50",
                animation: `pulse-glow 2s ease-in-out infinite ${delay}s`,
                transition: "height 0.2s ease",
              }}
            />
          ))}
        </div>
      </div>
      {/* Blush dots */}
      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          className="absolute rounded-full"
          style={{
            width: 8,
            height: 5,
            background: "#F472B6",
            opacity: 0.4,
            bottom: 18,
            [side]: 14,
          }}
        />
      ))}
    </div>
  </div>
);

export default StageBot;
