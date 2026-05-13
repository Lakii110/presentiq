"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, AudioWaveform,
  FileBarChart, Settings, MessageSquare,
} from "lucide-react";
import BotLogo from "@/components/BotLogo";
import { useAdminUser } from "@/hooks/useAdminUser";
import { useAvatar } from "@/hooks/useAvatar";
import { clearAccessToken } from "@/lib/auth-token";
import { useQueryClient } from "@tanstack/react-query";
import UserAvatar from "@/components/UserAvatar";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",  path: "/admin" },
  { icon: Users,           label: "Users",       path: "/admin/users" },
  { icon: AudioWaveform,   label: "Sessions",    path: "/admin/sessions" },
  { icon: FileBarChart,    label: "Reports",     path: "/admin/reports" },
  { icon: MessageSquare,   label: "Feedback",    path: "/admin/feedback" },
  { icon: Settings,        label: "Settings",    path: "/admin/settings" },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useAdminUser();
  const { avatar } = useAvatar();

  const email = user?.email ?? "—";
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "AD";
  const displayName = user?.display_name || user?.email?.split("@")[0] || "Admin";

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen flex-col" style={{ width: 248, background: "hsl(220 20% 14%)" }}>
      {/* Logo */}
      <div className="flex items-center" style={{ padding: "24px 20px", gap: 10 }}>
        <BotLogo size={32} />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white leading-none">PresentIQ</span>
          <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3" style={{ marginTop: 8 }}>
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">Navigation</p>
        <div className="flex flex-col" style={{ gap: 2 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path}
                className="group flex items-center transition-all duration-200"
                style={{ height: 40, borderRadius: 8, padding: "0 12px", gap: 10, fontSize: 13, fontWeight: 500,
                  background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.5)" }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; } }}
              >
                <item.icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom — real user */}
      <div className="px-3" style={{ paddingBottom: 16 }}>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16 }}>
          <Link href="/admin/profile"
            className="flex items-center rounded-lg px-3 transition-colors duration-200 hover:bg-white/[0.06]"
            style={{ height: 44, gap: 10 }}>
            <UserAvatar initials={initials} src={user?.avatar_url} size={28} rounded="full" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">{displayName}</p>
              <p className="truncate text-white/35" style={{ fontSize: 10 }}>{email}</p>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
