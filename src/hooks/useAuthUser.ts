import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-token";

export function useAuthUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    enabled: !!getAccessToken(),
    staleTime: 5 * 60 * 1000,
  });
}
