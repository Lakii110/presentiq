import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { User, Flame, LogOut } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useDisplayName } from "@/hooks/useDisplayName";
import { logout } from "@/lib/logout";
import { useDashboardData } from "@/hooks/useDashboardData";
import { calcStreak } from "@/hooks/useStreak";
import { useMemo } from "react";
import UserAvatar from "@/components/UserAvatar";

const menuItems = [
  { icon: User, label: "View Profile", path: "/dashboard/profile" },
];

const ProfilePopover = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useAuthUser();
  const { sessions } = useDashboardData();
  const { displayName, initials } = useDisplayName(user?.email, user?.display_name);
  const email = user?.email ?? "…";

  const streak = useMemo(() => calcStreak(sessions), [sessions]);

  const handleLogout = () => {
    logout(queryClient);
    router.replace("/");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 rounded-full"
          aria-label="Account menu"
        >
          <UserAvatar initials={isLoading ? "…" : initials} src={user?.avatar_url} size={36} rounded="full" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[300px] rounded-2xl border border-border bg-card p-0 shadow-xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
      >
        <div className="flex items-center gap-3 p-4">
          <UserAvatar initials={isLoading ? "…" : initials} src={user?.avatar_url} size={40} rounded="full" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </div>

        <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl bg-secondary/70 px-3 py-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-xs font-medium text-foreground">
            {streak > 0 ? `${streak}-day streak` : "No streak yet"}
          </span>
        </div>

        <Separator />

        <div className="p-2">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors duration-200 hover:bg-secondary"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              {item.label}
            </Link>
          ))}
        </div>

        <Separator />

        <div className="p-2">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-destructive transition-colors duration-200 hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ProfilePopover;
