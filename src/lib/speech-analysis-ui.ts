import type { TimelineSegment } from "@/lib/api";

export function timelineColorForType(type: string): string {
  switch (type) {
    case "strong":
    case "slow":
      return "hsl(var(--success))";
    case "fast":
      return "hsl(var(--warning))";
    case "filler":
      return "hsl(var(--destructive))";
    case "pause":
      return "hsl(var(--primary))";
    default:
      return "hsl(var(--muted-foreground))";
  }
}

/** Ensure timeline segments have a color for the chart bar. */
export function withTimelineColors(segments: TimelineSegment[]): (TimelineSegment & { color: string })[] {
  return segments.map((s) => ({
    ...s,
    color: s.color?.trim() ? s.color : timelineColorForType(s.type),
  }));
}

export function formatDurationSeconds(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m} min ${r.toString().padStart(2, "0")} sec`;
}

export function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
