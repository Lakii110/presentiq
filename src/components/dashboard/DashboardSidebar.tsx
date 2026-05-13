import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useDisplayName } from "@/hooks/useDisplayName";
import UserAvatar from "@/components/UserAvatar";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Plus,
  AudioWaveform,
  Clock,
  TrendingUp,
  Settings,
  HelpCircle,
} from "lucide-react";
import BotLogo from "@/components/BotLogo";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",       path: "/dashboard" },
  { icon: Plus,            label: "New Practice",    path: "/dashboard/upload" },
  { icon: AudioWaveform,   label: "Speech Analysis", path: "/dashboard/analysis" },
  { icon: Clock,           label: "History",         path: "/dashboard/history" },
  { icon: TrendingUp,      label: "Progress Tracking", path: "/dashboard/progress" },
];

const bottomItems = [
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  { icon: HelpCircle, label: "Help & Support", path: "/dashboard/help" },
];

const DashboardSidebar = () => {
  const pathname = usePathname();
  const { data: user, isLoading } = useAuthUser();
  const { displayName, initials } = useDisplayName(user?.email, user?.display_name);
  const email = user?.email ?? "…";
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const safeDisplayName = mounted ? displayName : (user?.email?.split("@")[0] ?? "…");
  const safeInitials = mounted ? initials : "…";
  const safeEmail = mounted ? email : "…";

  const renderNavItem = (item: (typeof navItems)[0]) => {
    const isActive = pathname === item.path;
    return (
      <Link
        key={item.path}
        href={item.path}
        className="group flex items-center transition-all duration-200"
        style={{
          height: 44,
          borderRadius: 12,
          padding: "0 16px",
          gap: 12,
          fontSize: 13,
          fontWeight: 500,
          background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
          color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
          boxShadow: isActive ? "0 0 12px hsl(225, 73%, 57%, 0.25)" : "none",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            e.currentTarget.style.color = "rgba(255,255,255,0.85)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.55)";
          }
        }}
      >
        <item.icon style={{ width: 18, height: 18, flexShrink: 0, opacity: isActive ? 1 : 0.6 }} />
        {item.label}
      </Link>
    );
  };

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen flex-col"
      style={{
        width: 248,
        background: "linear-gradient(180deg, hsl(235, 45%, 18%) 0%, hsl(250, 40%, 14%) 100%)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center" style={{ padding: "24px 20px", gap: 12 }}>
        <BotLogo size={36} />
        <span className="text-base font-bold text-white">PresentIQ</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3" style={{ marginTop: 8 }}>
        <div className="flex flex-col" style={{ gap: 4 }}>
          {navItems.map(renderNavItem)}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="px-3" style={{ paddingBottom: 8 }}>
        <div className="flex flex-col" style={{ gap: 4, marginBottom: 16 }}>
          {bottomItems.map(renderNavItem)}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16 }}>
          <Link
            href="/dashboard/profile"
            className="flex items-center rounded-xl px-3 transition-colors duration-200 hover:bg-white/[0.06]"
            style={{ height: 48, gap: 12 }}
          >
            <UserAvatar
              initials={isLoading ? "…" : safeInitials}
              src={user?.avatar_url}
              size={32}
              rounded="full"
              style={{ border: "2px solid rgba(255,255,255,0.15)" }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{safeDisplayName}</p>
              <p className="truncate text-white/40" style={{ fontSize: 11 }}>
                {safeEmail}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
