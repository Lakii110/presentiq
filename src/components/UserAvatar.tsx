"use client";

import { useAvatar } from "@/hooks/useAvatar";
import { useEffect, useState } from "react";

interface UserAvatarProps {
  initials: string;
  /** Backend avatar_url from the user object (e.g. "/avatars/1_abc.jpg") */
  src?: string | null;
  size?: number;
  rounded?: "full" | "xl" | "2xl";
  className?: string;
  style?: React.CSSProperties;
}

// Get the backend URL for static files (avatars)
// In development, this is the direct backend URL
// In production, this would be configured via environment variable
const getBackendStaticUrl = () => {
  if (typeof window === "undefined") return "";
  // Check if we have a custom backend URL
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  return backendUrl;
};

const UserAvatar = ({ initials, src, size = 36, rounded = "full", className = "", style }: UserAvatarProps) => {
  const { avatar: cachedUrl } = useAvatar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Priority: backend URL passed as prop > cached URL from localStorage > initials
  // Avatar URLs from backend are like "/avatars/filename.jpg"
  // We need to access them through the backend directly for static files
  const backendUrl = getBackendStaticUrl();
  const resolvedSrc = src
    ? src.startsWith("http") 
      ? src 
      : `${backendUrl}${src}` // Direct backend URL for static files
    : mounted && cachedUrl
      ? cachedUrl.startsWith("http")
        ? cachedUrl
        : `${backendUrl}${cachedUrl}`
      : null;

  const borderRadius =
    rounded === "full" ? "9999px" : rounded === "2xl" ? "16px" : "12px";

  const base: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius,
    flexShrink: 0,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...style,
  };

  if (resolvedSrc) {
    return (
      <div className={className} style={base}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolvedSrc}
          alt="Profile"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            // If image fails to load, hide it and show initials instead
            console.error("Failed to load avatar:", resolvedSrc);
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`bg-primary text-primary-foreground font-bold ${className}`}
      style={{ ...base, fontSize: Math.round(size * 0.35) }}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;
