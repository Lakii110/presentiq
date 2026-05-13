"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth-token";
import { getMe } from "@/lib/api";

export function useRequireAdmin(): { checking: boolean } {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    getMe()
      .then((user) => {
        if (!user.is_admin) {
          router.replace("/admin/login");
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        router.replace("/admin/login");
      });
  }, [router]);

  return { checking };
}
