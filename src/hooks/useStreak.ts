/**
 * Calculates consecutive-day streak from a list of sessions.
 * Counts backwards from today. If today has no session, still checks yesterday
 * (grace period of 1 day so the streak doesn't reset at midnight).
 */
export function calcStreak(sessions: { created_at: string }[]): number {
  if (!sessions.length) return 0;
  const days = new Set(sessions.map((s) => s.created_at.slice(0, 10)));
  let count = 0;
  const today = new Date();

  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) {
      count++;
    } else if (i === 0) {
      // today has no session — check if yesterday does before giving up
      continue;
    } else {
      break;
    }
  }
  return count;
}
