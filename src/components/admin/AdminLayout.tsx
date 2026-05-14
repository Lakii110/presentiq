import { ReactNode, useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminProfilePopover from "./AdminProfilePopover";
import ThemeToggle from "@/components/ThemeToggle";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const SIDEBAR_W = 248;

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { checking } = useRequireAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (checking) return null;

  return (
    <div className="min-h-screen bg-secondary">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
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
        <AdminSidebar />
      </div>

      <div className="flex h-screen flex-col lg:ml-[248px]">
        {/* Header */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between border-b border-border px-4 sm:px-6 lg:px-8"
          style={{
            height: 64,
            background: "hsl(var(--card) / 0.85)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Left — Mobile menu button + title */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Title */}
            <h1 className="text-sm sm:text-base font-semibold text-foreground truncate">{title}</h1>
          </div>

          {/* Right — theme toggle + profile avatar (both on right) */}
          <div className="flex items-center gap-2" style={{ marginLeft: 'auto' }}>
            <ThemeToggle />
            <AdminProfilePopover />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12" style={{ maxWidth: 1280 }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
