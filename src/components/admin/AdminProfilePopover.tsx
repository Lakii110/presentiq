"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { User, Shield, LogOut } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAdminUser } from "@/hooks/useAdminUser";
import { useAvatar } from "@/hooks/useAvatar";
import { clearAccessToken } from "@/lib/auth-token";
import UserAvatar from "@/components/UserAvatar";

const AdminProfilePopover = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useAdminUser();
  const { avatar } = useAvatar();

  const email = user?.email ?? "—";
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "AD";
  const displayName = user?.display_name || user?.email?.split("@")[0] || "Admin";

  const handleLogout = () => {
    clearAccessToken();
    queryClient.clear();
    router.push("/admin/login");
  };

  const AvatarBubble = ({ size }: { size: number }) => (
    <UserAvatar initials={initials} src={user?.avatar_url} size={size} rounded="full" />
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all hover:opacity-90">
          <AvatarBubble size={32} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8}
        className="w-[280px] rounded-xl border border-border bg-card p-0 shadow-lg animate-in fade-in-0 zoom-in-95">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <AvatarBubble size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
              <Shield className="h-3 w-3" /> Administrator
            </span>
          </div>
        </div>

        <Separator />

        <div className="p-2">
          <Link href="/admin/profile"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors duration-200 hover:bg-secondary">
            <User className="h-4 w-4 text-muted-foreground" />
            View Profile
          </Link>

          <Separator className="my-1" />

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors duration-200 hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AdminProfilePopover;
