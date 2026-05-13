import Link from "next/link";
import { useDashboardData } from "@/hooks/useDashboardData";

const fallbackSkillsData = [
  { skill: "Clarity",      value: 0, tip: "Upload a session to get feedback." },
  { skill: "Confidence",   value: 0, tip: "Upload a session to get feedback." },
  { skill: "Pacing",       value: 0, tip: "Upload a session to get feedback." },
  { skill: "Filler Words", value: 0, tip: "Upload a session to get feedback." },
  { skill: "Tone",         value: 0, tip: "Upload a session to get feedback." },
];

function barColor(value: number): string {
  if (value >= 80) return "hsl(142 71% 45%)";
  if (value >= 65) return "hsl(var(--primary))";
  return "hsl(38 92% 50%)";
}

const DashboardSkillsBreakdown = () => {
  const { latestReady } = useDashboardData();
  const skillsData = latestReady?.skills
    ? latestReady.skills.filter((s) => s.skill !== "Eye Contact")
    : fallbackSkillsData;

  const top = latestReady ? [...skillsData].sort((a, b) => b.value - a.value)[0] : null;

  return (
    <div className="border border-border bg-card" style={{ borderRadius: 20, padding: 24 }}>
      <h3 className="text-base font-semibold text-foreground">Skills Breakdown</h3>
      <p className="text-xs text-muted-foreground" style={{ marginTop: 4, marginBottom: 20 }}>
        {latestReady ? "From your latest analyzed session" : "Upload a session to see your profile"}
      </p>

      <div className="flex flex-col" style={{ gap: 12 }}>
        {skillsData.map((sk) => (
          <div key={sk.skill}>
            <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
              <span className="text-xs font-medium text-foreground">{sk.skill}</span>
              <span className="text-xs font-bold" style={{ color: latestReady ? barColor(sk.value) : "hsl(var(--muted-foreground))" }}>
                {latestReady ? `${sk.value}%` : "—"}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: latestReady ? `${sk.value}%` : "0%",
                  background: barColor(sk.value),
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between" style={{ marginTop: 16 }}>
        <span className="text-xs text-muted-foreground">
          Top Skill:{" "}
          <strong className="text-foreground">
            {top ? `${top.skill} (${top.value}%)` : "—"}
          </strong>
        </span>
        <Link href="/dashboard/history" className="text-xs font-medium text-primary hover:underline">
          View Sessions
        </Link>
      </div>
    </div>
  );
};

export default DashboardSkillsBreakdown;
