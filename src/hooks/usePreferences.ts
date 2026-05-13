"use client";

import { useState, useEffect, useCallback } from "react";

export type PracticeMode = "Practice" | "Exam";
export type FeedbackStyle = "Friendly" | "Strict";

export interface Preferences {
  practiceMode: PracticeMode;
  feedbackStyle: FeedbackStyle;
  focusAreas: string[];
}

const STORAGE_KEY = "presentiq_preferences";

const DEFAULT: Preferences = {
  practiceMode: "Practice",
  feedbackStyle: "Friendly",
  focusAreas: ["Clarity", "Confidence"],
};

function load(): Preferences {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

function save(prefs: Preferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT);

  // Load from localStorage on mount (client only)
  useEffect(() => {
    setPrefs(load());
  }, []);

  const update = useCallback((partial: Partial<Preferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...partial };
      save(next);
      return next;
    });
  }, []);

  return { prefs, update };
}
