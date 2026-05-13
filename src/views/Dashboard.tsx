import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeroCard from "@/components/dashboard/DashboardHeroCard";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useDisplayName } from "@/hooks/useDisplayName";
import DashboardStatsRow from "@/components/dashboard/DashboardStatsRow";
import DashboardRecentSessions from "@/components/dashboard/DashboardRecentSessions";
import DashboardSkillsBreakdown from "@/components/dashboard/DashboardSkillsBreakdown";
import DashboardWeeklyProgress from "@/components/dashboard/DashboardWeeklyProgress";
import DashboardCoachTips from "@/components/dashboard/DashboardCoachTips";

const Dashboard = () => {
  const { data: user } = useAuthUser();
  const { displayName } = useDisplayName(user?.email);

  const headline = displayName ? `Hi, ${displayName.split(" ")[0]}! 👋` : "Hi there! 👋";

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div style={{ paddingTop: 40, paddingBottom: 32 }}>
        <h1 className="text-2xl font-bold text-foreground" style={{ lineHeight: 1.2 }}>
          {headline}
        </h1>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>
          Let's improve your speaking skills today.
        </p>
      </div>

      {/* Hero Card */}
      <DashboardHeroCard />

      {/* Stats Cards — 24px below hero */}
      <div style={{ marginTop: 24 }}>
        <DashboardStatsRow />
      </div>

      {/* Recent Sessions + Skills Breakdown */}
      <div className="grid" style={{ gridTemplateColumns: "1.6fr 1fr", gap: 24, marginTop: 24 }}>
        <DashboardRecentSessions />
        <DashboardSkillsBreakdown />
      </div>

      {/* Weekly Progress + AI Coach Tips */}
      <div className="grid" style={{ gridTemplateColumns: "1.6fr 1fr", gap: 24, marginTop: 24 }}>
        <DashboardWeeklyProgress />
        <DashboardCoachTips />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
