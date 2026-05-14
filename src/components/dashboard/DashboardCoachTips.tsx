import { Flame, TrendingUp, AlertTriangle, Zap, CheckCircle2, Target } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useMemo } from "react";

const FALLBACK_TIPS = [
  { icon: Flame, title: "Reduce filler words", desc: "Try pausing instead of saying 'um' or 'uh' — silence is powerful.", color: "hsl(var(--destructive))" },
  { icon: TrendingUp, title: "Keep practicing", desc: "Consistency is key. Even 5 minutes a day builds lasting habits.", color: "hsl(var(--success))" },
  { icon: Zap, title: "Vary your pace", desc: "Slow down on key points, speed up slightly on transitions to keep listeners engaged.", color: "hsl(var(--primary))" },
];

function iconForType(type: string) {
  if (type === "strength") return CheckCircle2;
  if (type === "weakness") return AlertTriangle;
  return Target;
}

function colorForType(type: string) {
  if (type === "strength") return "hsl(var(--success))";
  if (type === "weakness") return "hsl(var(--destructive))";
  return "hsl(var(--primary))";
}

const DashboardCoachTips = () => {
  const { sessions } = useDashboardData();

  // Calculate overall statistics from ALL sessions
  const overallStats = useMemo(() => {
    const readySessions = sessions.filter(s => s.status === "ready" && s.analysis);
    
    if (readySessions.length === 0) return null;

    // Aggregate all skills across all sessions
    const skillAverages: { [key: string]: number[] } = {};
    
    readySessions.forEach(session => {
      if (!session.analysis?.skills) return;
      
      session.analysis.skills.forEach((skill: any) => {
        if (!skillAverages[skill.skill]) {
          skillAverages[skill.skill] = [];
        }
        skillAverages[skill.skill].push(skill.value);
      });
    });

    // Calculate average for each skill
    const skills = Object.entries(skillAverages).map(([name, values]) => ({
      skill: name,
      average: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      count: values.length,
    }));

    // Sort by average (lowest first for weaknesses)
    skills.sort((a, b) => a.average - b.average);

    const weakestSkill = skills[0];
    const strongestSkill = skills[skills.length - 1];
    
    // Calculate overall score average
    const overallScores = readySessions.map(s => s.analysis?.overall_score || 0);
    const avgScore = Math.round(overallScores.reduce((a, b) => a + b, 0) / overallScores.length);

    // Calculate improvement trend (compare first half vs second half)
    const halfPoint = Math.floor(overallScores.length / 2);
    const firstHalfAvg = overallScores.slice(0, halfPoint).reduce((a, b) => a + b, 0) / halfPoint;
    const secondHalfAvg = overallScores.slice(halfPoint).reduce((a, b) => a + b, 0) / (overallScores.length - halfPoint);
    const improvement = overallScores.length >= 4 ? secondHalfAvg - firstHalfAvg : 0;

    return {
      totalSessions: readySessions.length,
      avgScore,
      weakestSkill,
      strongestSkill,
      improvement,
      skills,
    };
  }, [sessions]);

  // Generate personalized tips based on overall activity
  const tips = useMemo(() => {
    if (!overallStats) return FALLBACK_TIPS;

    const generatedTips = [];

    // Tip 1: Weakest skill across all sessions
    if (overallStats.weakestSkill) {
      const skill = overallStats.weakestSkill;
      let desc = "";
      
      if (skill.skill === "Filler Words") {
        desc = `Your filler word control averages ${skill.average}% across ${skill.count} sessions. Replace 'um' and 'like' with brief pauses to sound more confident.`;
      } else if (skill.skill === "Pacing") {
        desc = `Your pacing averages ${skill.average}% across ${skill.count} sessions. Aim for 130-160 words per minute and pause after key points.`;
      } else if (skill.skill === "Clarity") {
        desc = `Your clarity averages ${skill.average}% across ${skill.count} sessions. Keep sentences short and define technical terms clearly.`;
      } else if (skill.skill === "Confidence") {
        desc = `Your confidence averages ${skill.average}% across ${skill.count} sessions. Practice maintaining steady energy throughout your presentations.`;
      } else if (skill.skill === "Tone") {
        desc = `Your tone variation averages ${skill.average}% across ${skill.count} sessions. Emphasize key words and vary your pitch to keep listeners engaged.`;
      } else if (skill.skill === "Fluency") {
        desc = `Your fluency averages ${skill.average}% across ${skill.count} sessions. Reduce long pauses and keep transitions smooth between ideas.`;
      } else {
        desc = `Your ${skill.skill.toLowerCase()} averages ${skill.average}% across ${skill.count} sessions. Focus on improving this area in your next practice.`;
      }

      generatedTips.push({
        icon: AlertTriangle,
        title: `Focus Area: ${skill.skill}`,
        desc,
        color: "hsl(var(--destructive))",
      });
    }

    // Tip 2: Overall progress or strongest skill
    if (overallStats.improvement > 5) {
      generatedTips.push({
        icon: TrendingUp,
        title: "Great Progress!",
        desc: `You've improved by ${Math.round(overallStats.improvement)} points across your ${overallStats.totalSessions} sessions. Keep up the momentum!`,
        color: "hsl(var(--success))",
      });
    } else if (overallStats.strongestSkill) {
      const skill = overallStats.strongestSkill;
      generatedTips.push({
        icon: CheckCircle2,
        title: `Strength: ${skill.skill}`,
        desc: `Your ${skill.skill.toLowerCase()} consistently scores ${skill.average}% across ${skill.count} sessions. This is a solid foundation to build on!`,
        color: "hsl(var(--success))",
      });
    }

    // Tip 3: Personalized recommendation based on overall score
    if (overallStats.avgScore < 60) {
      generatedTips.push({
        icon: Target,
        title: "Practice Consistently",
        desc: `Your average score is ${overallStats.avgScore}%. Focus on one skill at a time and practice daily for 5-10 minutes to see steady improvement.`,
        color: "hsl(var(--primary))",
      });
    } else if (overallStats.avgScore < 75) {
      generatedTips.push({
        icon: Zap,
        title: "You're Building Momentum",
        desc: `Your average score is ${overallStats.avgScore}%. You're on the right track! Focus on your weakest skill to push past 75%.`,
        color: "hsl(var(--primary))",
      });
    } else if (overallStats.avgScore < 85) {
      generatedTips.push({
        icon: Flame,
        title: "Almost There!",
        desc: `Your average score is ${overallStats.avgScore}%. You're doing great! Polish your delivery by recording yourself and listening back.`,
        color: "hsl(var(--primary))",
      });
    } else {
      generatedTips.push({
        icon: CheckCircle2,
        title: "Excellent Performance",
        desc: `Your average score is ${overallStats.avgScore}%! Maintain this level by practicing regularly and challenging yourself with longer presentations.`,
        color: "hsl(var(--success))",
      });
    }

    return generatedTips.slice(0, 3);
  }, [overallStats]);

  return (
    <div className="border border-border bg-card" style={{ borderRadius: 20, padding: 24 }}>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 20 }}>
        {/* Mini robot */}
        <div className="flex shrink-0 items-center justify-center" style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(145deg, #e2e6ec, #c8ccd4)" }}>
          <div className="flex items-center justify-center" style={{ width: 20, height: 16, borderRadius: 4, background: "#1F2A37" }}>
            <div className="flex" style={{ gap: 4 }}>
              <div className="rounded-full" style={{ width: 4, height: 8, background: "#22D3EE" }} />
              <div className="rounded-full" style={{ width: 4, height: 8, background: "#22D3EE" }} />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">AI Coach Tips</h3>
          <p className="text-muted-foreground" style={{ fontSize: 11 }}>
            {overallStats ? `Based on your ${overallStats.totalSessions} sessions` : "Personalized feedback for you"}
          </p>
        </div>
      </div>

      <div className="flex flex-col" style={{ gap: 12 }}>
        {tips.map((tip, i) => (
          <div key={i} className="flex bg-secondary/40 transition-colors duration-150 hover:bg-secondary/65" style={{ gap: 12, borderRadius: 12, padding: 14 }}>
            <div className="flex shrink-0 items-center justify-center rounded-full" style={{ width: 32, height: 32, backgroundColor: `${tip.color}15` }}>
              <tip.icon style={{ width: 16, height: 16, color: tip.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{tip.title}</p>
              <p className="text-xs leading-relaxed text-muted-foreground" style={{ marginTop: 2 }}>{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardCoachTips;
