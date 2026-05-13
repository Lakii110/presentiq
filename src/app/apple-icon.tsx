import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, borderRadius: 50, background: "#7c87f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="110" height="110" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="2" width="6" height="12" rx="3"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" x2="12" y1="19" y2="22"/>
          <line x1="9" x2="15" y1="22" y2="22"/>
        </svg>
      </div>
    ),
    { ...size }
  );
}
