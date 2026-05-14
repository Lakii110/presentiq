import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeroCard from "@/components/dashboard/DashboardHeroCard";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useDisplayName } from "@/hooks/useDisplayName";
import DashboardStatsRow from "@/components/dashboard/DashboardStatsRow";
import DashboardRecentSessions from "@/components/dashboard/DashboardRecentSessions";
import DashboardSkillsBreakdown from "@/components/dashboard/DashboardSkillsBreakdown";
import DashboardWeeklyProgress from "@/components/dashboard/DashboardWeeklyProgress";
import DashboardCoachTips from "@/components/dashboard/DashboardCoachTips";
import { useFeatureToggles } from "@/hooks/useFeatureToggles";

const Dashboard = () => {
  const { data: user } = useAuthUser();
  const { displayName } = useDisplayName(user?.email);
  const { toggles } = useFeatureToggles();

  const headline = displayName ? `Hi, ${displayName.split(" ")[0]}! 👋` : "Hi there! 👋";

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="pt-6 pb-6 sm:pt-8 sm:pb-8 md:pt-10 md:pb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground" style={{ lineHeight: 1.2 }}>
          {headline}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
          Let's improve your speaking skills today.
        </p>
      </div>

      {/* Hero Card */}
      <DashboardHeroCard />

      {/* Stats Cards — 24px below hero */}
      <div className="mt-4 sm:mt-6">
        <DashboardStatsRow />
      </div>

      {/* Recent Sessions + Skills Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 sm:gap-6 mt-4 sm:mt-6">
        <DashboardRecentSessions />
        <DashboardSkillsBreakdown />
      </div>

      {/* Weekly Progress + AI Coach Tips */}
      <div className={`grid grid-cols-1 ${toggles.ai_coaching_tips ? "lg:grid-cols-[1.6fr_1fr]" : ""} gap-4 sm:gap-6 mt-4 sm:mt-6 mb-6`}>
        <DashboardWeeklyProgress />
        {toggles.ai_coaching_tips && <DashboardCoachTips />}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
