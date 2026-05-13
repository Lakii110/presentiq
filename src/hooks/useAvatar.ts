"use client";

import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { uploadAvatar, deleteAvatar } from "@/lib/api";

const STORAGE_KEY = "presentiq_avatar_url";

export function useAvatar() {
  // Local cache of the URL so components re-render immediately after upload
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Seed from localStorage on mount (avoids flash before query resolves)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setAvatarUrl(stored);
  }, []);

  // Listen for cross-component updates (e.g. upload from Profile page)
  useEffect(() => {
    const handler = (e: Event) => {
      const url = (e as CustomEvent<string | null>).detail;
      setAvatarUrl(url);
      if (url) localStorage.setItem(STORAGE_KEY, url);
      else localStorage.removeItem(STORAGE_KEY);
    };
    window.addEventListener("presentiq:avatar-changed", handler);
    return () => window.removeEventListener("presentiq:avatar-changed", handler);
  }, []);

  const saveAvatar = useCallback(async (file: File): Promise<string> => {
    const result = await uploadAvatar(file);
    const url = result.avatar_url;
    localStorage.setItem(STORAGE_KEY, url);
    setAvatarUrl(url);
    // Invalidate the auth query so all components using useAuthUser refresh
    queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    window.dispatchEvent(new CustomEvent("presentiq:avatar-changed", { detail: url }));
    return url;
  }, [queryClient]);

  const removeAvatar = useCallback(async () => {
    await deleteAvatar();
    localStorage.removeItem(STORAGE_KEY);
    setAvatarUrl(null);
    queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    window.dispatchEvent(new CustomEvent("presentiq:avatar-changed", { detail: null }));
  }, [queryClient]);

  return { avatar: avatarUrl, saveAvatar, removeAvatar };
}
