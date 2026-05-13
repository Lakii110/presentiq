import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getAccessToken } from "@/lib/auth-token";

/** Redirects to login when `enabled` and no API token is stored. */
export function useRequireAuth(enabled = true): void {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!enabled) return;
    if (!getAccessToken()) {
      const from = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
      router.replace(`/login?from=${encodeURIComponent(from)}`);
    }
  }, [enabled, router, pathname, searchParams]);
}
