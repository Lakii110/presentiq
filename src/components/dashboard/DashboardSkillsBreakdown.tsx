import Link from "next/link";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useMemo } from "react";

const fallbackSkillsData = [
  { skill: "Clarity",      value: 0, tip: "Upload a session to get feedback." },
  { skill: "Confidence",   value: 0, tip: "Upload a session to get feedback." },
  { skill: "Pacing",       value: 0, tip: "Upload a session to get feedback." },
  { skill: "Filler Words", value: 0, tip: "Upload a session to get feedback." },
  { skill: "Tone",         value: 0, tip: "Upload a session to get feedback." },
  { skill: "Fluency",      value: 0, tip: "Upload a session to get feedback." },
  { skill: "Engagement",   value: 0, tip: "Upload a session to get feedback." },
];

function barColor(value: number): string {
  if (value >= 80) return "hsl(142 71% 45%)";
  if (value >= 65) return "hsl(var(--primary))";
  return "hsl(38 92% 50%)";
}

const DashboardSkillsBreakdown = () => {
  const { sessions } = useDashboardData();

  // Calculate average skills across ALL sessions
  const skillsData = useMemo(() => {
    const readySessions = sessions.filter(s => s.status === "ready" && s.analysis);
    
    if (readySessions.length === 0) return fallbackSkillsData;

    // Aggregate all skills across all sessions
    const skillAverages: { [key: string]: number[] } = {};
    
    readySessions.forEach(session => {
      if (!session.analysis?.skills) return;
      
      session.analysis.skills.forEach((skill: any) => {
        // Skip Eye Contact (audio-only proxy)
        if (skill.skill === "Eye Contact") return;
        
        if (!skillAverages[skill.skill]) {
          skillAverages[skill.skill] = [];
        }
        skillAverages[skill.skill].push(skill.value);
      });
    });

    // Calculate average for each skill
    const skills = Object.entries(skillAverages).map(([name, values]) => ({
      skill: name,
      value: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      tip: "", // Not used in display
    }));

    // Sort by skill name for consistent order
    const skillOrder = ["Clarity", "Confidence", "Pacing", "Filler Words", "Tone", "Fluency", "Engagement"];
    skills.sort((a, b) => {
      const aIndex = skillOrder.indexOf(a.skill);
      const bIndex = skillOrder.indexOf(b.skill);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    return skills;
  }, [sessions]);

  const hasData = skillsData.some(s => s.value > 0);
  const top = hasData ? [...skillsData].sort((a, b) => b.value - a.value)[0] : null;
  
  // Count total sessions
  const totalSessions = sessions.filter(s => s.status === "ready" && s.analysis).length;

  return (
    <div className="border border-border bg-card" style={{ borderRadius: 20, padding: 24 }}>
      <h3 className="text-base font-semibold text-foreground">Skills Breakdown</h3>
      <p className="text-xs text-muted-foreground" style={{ marginTop: 4, marginBottom: 20 }}>
        {hasData ? `Average across your ${totalSessions} session${totalSessions !== 1 ? 's' : ''}` : "Upload a session to see your profile"}
      </p>

      <div className="flex flex-col" style={{ gap: 12 }}>
        {skillsData.map((sk) => (
          <div key={sk.skill}>
            <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
              <span className="text-xs font-medium text-foreground">{sk.skill}</span>
              <span className="text-xs font-bold" style={{ color: hasData ? barColor(sk.value) : "hsl(var(--muted-foreground))" }}>
                {hasData ? `${sk.value}%` : "—"}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: hasData ? `${sk.value}%` : "0%",
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
