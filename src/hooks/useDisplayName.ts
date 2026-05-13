"use client";

import { useState, useEffect, useCallback } from "react";
import { displayNameFromEmail, initialsFromEmail } from "@/lib/user-display";

const STORAGE_KEY = "presentiq_display_name";

/**
 * Returns the display name for the current user.
 * Priority: DB value (passed in via dbName) > localStorage > email fallback.
 * saveName persists to localStorage AND fires a custom event so all components update.
 */
export function useDisplayName(email: string | undefined, dbName?: string | null) {
  const [localName, setLocalName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setLocalName(stored);
  }, []);

  // When DB name arrives, sync it to localStorage so it persists offline too
  useEffect(() => {
    if (!dbName) return;
    localStorage.setItem(STORAGE_KEY, dbName);
    setLocalName(dbName);
  }, [dbName]);

  const saveName = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem(STORAGE_KEY, trimmed);
    setLocalName(trimmed);
    window.dispatchEvent(new CustomEvent("presentiq:name-changed", { detail: trimmed }));
  }, []);

  // Listen for cross-component updates
  useEffect(() => {
    const handler = (e: Event) => {
      setLocalName((e as CustomEvent<string>).detail);
    };
    window.addEventListener("presentiq:name-changed", handler);
    return () => window.removeEventListener("presentiq:name-changed", handler);
  }, []);

  const displayName = localName || (email ? displayNameFromEmail(email) : "…");

  const initials = localName
    ? localName.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : email ? initialsFromEmail(email) : "…";

  return { displayName, initials, saveName };
}
