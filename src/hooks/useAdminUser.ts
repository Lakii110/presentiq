"use client";

import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api";

export function useAdminUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    staleTime: 60_000,
  });
}
