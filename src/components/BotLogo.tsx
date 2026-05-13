/**
 * PresentIQ brand logo mark.
 * Blue/purple rounded square with Lucide Mic icon.
 * Uses standard microphone icon from lucide-react.
 */
import { Mic } from "lucide-react";

interface BotLogoProps {
  size?: number;
  className?: string;
}

const BotLogo = ({ size = 36, className = "" }: BotLogoProps) => {
  const outerR = Math.round(size * 0.28);
  const iconSize = Math.round(size * 0.58);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: outerR,
        background: "#7c87f8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Mic size={iconSize} color="white" strokeWidth={2.2} />
    </div>
  );
};

export default BotLogo;
