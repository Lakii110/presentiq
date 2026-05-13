/** Two-letter avatar from email local-part. */
export function initialsFromEmail(email: string): string {
  const local = (email.split("@")[0] || "?").replace(/[^a-zA-Z0-9]/g, "");
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  return (local + "?").slice(0, 2).toUpperCase();
}

/** First segment of local-part for greetings ("john.doe" → "John"). */
export function greetingFirstName(email: string): string {
  const local = email.split("@")[0]?.trim() || "there";
  const first = local.split(/[._-]/)[0] || local;
  if (!first) return "there";
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

/** Full-ish display name from email ("john.doe@x.com" → "John Doe"). */
export function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim() || email;
  const words = local.split(/[._-]+/).filter(Boolean);
  if (!words.length) return email;
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

export function timeGreeting(): "Good morning" | "Good afternoon" | "Good evening" {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
