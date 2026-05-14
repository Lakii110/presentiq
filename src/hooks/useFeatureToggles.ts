import { useQuery } from "@tanstack/react-query";
import { getFeatureToggles, type FeatureToggles } from "@/lib/api";

/**
 * Hook to fetch and use feature toggles from admin settings
 * Returns the current feature toggle state
 */
export function useFeatureToggles() {
  const { data: toggles, isLoading } = useQuery({
    queryKey: ["feature-toggles"],
    queryFn: getFeatureToggles,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
    // Return default values if fetch fails (all features enabled)
    placeholderData: {
      practice_mode: true,
      exam_mode: true,
      ai_coaching_tips: true,
      session_recording: true,
      email_notifications: true,
    } as FeatureToggles,
  });

  return {
    toggles: toggles || {
      practice_mode: true,
      exam_mode: true,
      ai_coaching_tips: true,
      session_recording: true,
      email_notifications: true,
    },
    isLoading,
  };
}
