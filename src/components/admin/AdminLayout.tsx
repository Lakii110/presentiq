import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminProfilePopover from "./AdminProfilePopover";
import ThemeToggle from "@/components/ThemeToggle";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const SIDEBAR_W = 248;

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { checking } = useRequireAdmin();
  if (checking) return null;
  return (
    <div className="min-h-screen bg-secondary">
      <AdminSidebar />
      <div className="flex h-screen flex-col" style={{ marginLeft: SIDEBAR_W }}>
        {/* Header */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between border-b border-border"
          style={{
            height: 64,
            padding: "0 32px",
            background: "hsl(var(--card) / 0.85)",
            backdropFilter: "blur(12px)",
          }}
        >
          <h1 className="text-base font-semibold text-foreground">{title}</h1>
          <div className="flex items-center" style={{ gap: 8 }}>
            <ThemeToggle />
            <AdminProfilePopover />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto" style={{ maxWidth: 1280, padding: "24px 32px 48px" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
