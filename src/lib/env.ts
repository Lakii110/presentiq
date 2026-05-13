/** Backend API origin (no trailing slash). */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL as string | undefined;
  const base = (raw?.trim() || "/api/proxy").replace(/\/$/, "");
  
  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('[ENV DEBUG] NEXT_PUBLIC_API_URL:', raw);
    console.log('[ENV DEBUG] Final API URL:', base);
  }
  
  return base;
}
