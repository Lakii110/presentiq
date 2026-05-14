import { ReactNode, useState, useEffect, useRef } from "react";
import DashboardSidebar from "./DashboardSidebar";
import ProfilePopover from "./ProfilePopover";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useDisplayName } from "@/hooks/useDisplayName";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const SIDEBAR_W = 248;

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const showStickyGreeting = scrolled && isDashboardHome;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <DashboardSidebar />
      </div>

      <div className="flex h-screen flex-col lg:ml-[248px]">
        <header
          className="sticky top-0 z-30 flex items-center justify-between border-b transition-all duration-200 ease-out sm:px-6 lg:px-8 lg:h-[72px]"
          style={{
            height: 64,
            padding: "0 16px",
            borderColor: scrolled ? "hsl(var(--border))" : "transparent",
            background: scrolled ? "hsl(var(--card) / 0.92)" : "hsl(var(--background))",
            backdropFilter: scrolled ? "blur(12px)" : "none",
            boxShadow: scrolled ? "0 1px 3px 0 hsl(var(--foreground) / 0.04)" : "none",
          }}
        >
          {/* Left — Mobile menu button + greeting */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Greeting - desktop only */}
            <div
              className="hidden lg:block transition-all duration-200 ease-out"
              style={{
                opacity: showStickyGreeting ? 1 : 0,
                transform: showStickyGreeting ? "translateY(0)" : "translateY(4px)",
                pointerEvents: showStickyGreeting ? "auto" : "none",
              }}
            >
              <span className="text-sm font-semibold text-foreground">{stickyGreeting}</span>
            </div>
          </div>

          {/* Right — theme toggle + profile avatar (both on right) */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3" style={{ marginLeft: 'auto' }}>
            <ThemeToggle />
            <ProfilePopover />
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="mx-auto px-4 pb-12 sm:px-6 lg:px-8 lg:pb-12" style={{ maxWidth: 1280 }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
