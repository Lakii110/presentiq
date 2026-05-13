import type { QueryClient } from "@tanstack/react-query";
import { clearAccessToken } from "@/lib/auth-token";

export function logout(queryClient: QueryClient): void {
  clearAccessToken();
  queryClient.removeQueries({ queryKey: ["auth", "me"] });
}
