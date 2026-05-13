import { ReactNode, useState, useEffect, useRef } from "react";
import DashboardSidebar from "./DashboardSidebar";
import ProfilePopover from "./ProfilePopover";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useDisplayName } from "@/hooks/useDisplayName";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
  children: ReactNode;
}

const SIDEBAR_W = 248;

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [scrolled, setScrolled] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const { data: user } = useAuthUser();
  const { displayName } = useDisplayName(user?.email, user?.display_name);
  const pathname = usePathname();

  const isDashboardHome = pathname === "/dashboard";
  const stickyGreeting = displayName ? `Hi, ${displayName.split(" ")[0]} 👋` : "Hi there 👋";

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => setScrolled(el.scrollTop > 72);
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const showStickyGreeting = scrolled && isDashboardHome;

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex h-screen flex-col" style={{ marginLeft: SIDEBAR_W }}>
        <header
          className="sticky top-0 z-30 flex items-center justify-between border-b transition-all duration-200 ease-out"
          style={{
            height: 72,
            padding: "0 32px",
            borderColor: scrolled ? "hsl(var(--border))" : "transparent",
            background: scrolled ? "hsl(var(--card) / 0.92)" : "hsl(var(--background))",
            backdropFilter: scrolled ? "blur(12px)" : "none",
            boxShadow: scrolled ? "0 1px 3px 0 hsl(var(--foreground) / 0.04)" : "none",
          }}
        >
          {/* Left — greeting only on dashboard home when scrolled */}
          <div
            className="transition-all duration-200 ease-out"
            style={{
              opacity: showStickyGreeting ? 1 : 0,
              transform: showStickyGreeting ? "translateY(0)" : "translateY(4px)",
              pointerEvents: showStickyGreeting ? "auto" : "none",
            }}
          >
            <span className="text-sm font-semibold text-foreground">{stickyGreeting}</span>
          </div>

          {/* Right — theme toggle + avatar only */}
          <div className="ml-auto flex items-center" style={{ gap: 12 }}>
            <ThemeToggle />
            <ProfilePopover />
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 32px 48px" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
