const TOKEN_KEY = "presentiq_access_token";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
}
