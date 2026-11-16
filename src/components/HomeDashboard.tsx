import React, { useState } from 'react';
import {
  Flame,
  Play,
  Sparkles,
  TrendingUp,
  Target,
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import {
  UserProfile,
  GoalItem,
  MissionItem,
  FinanceItem,
  HabitLog,
  AchievementItem,
  MotivationData,
  STATUS_SYMBOLS,
  calculateLevelFromXP,
  formatINR,
} from '../types/lifeos';

interface HomeDashboardProps {
  user: UserProfile;
  goals: GoalItem[];
  missions: MissionItem[];
  finances: FinanceItem[];
  todayHabit: HabitLog;
  achievements: AchievementItem[];
  onStartFocusMission: (mission: MissionItem) => void;
  onCompleteMissionQuick: (mission: MissionItem) => void;
  onNavigate: (tab: string) => void;
}

const LEVEL_MILESTONES = [
  { level: 1, title: 'Dreamer', xpRequired: 0 },
  { level: 5, title: 'Builder', xpRequired: 1000 },
  { level: 10, title: 'Entrepreneur', xpRequired: 2250 },
  { level: 20, title: 'Wealth Creator', xpRequired: 4750 },
  { level: 50, title: 'Freedom Achiever', xpRequired: 12250 },
];

const SITUATION_PRESETS: Record<string, MotivationData> = {
  'Business Growth & Revenue': {
    quote: 'Every rupee of recurring revenue is built by solving a customer problem with fanatical consistency today.',
    authorOrPrinciple: 'Executive Scaling Principle',
    directive: 'Prioritize your Ruchitva food poster and 15 B2B catering outreach calls before 12:00 PM.',
    challengeTag: 'Business Growth & Revenue',
  },
  'Debt Elimination Discipline': {
    quote: 'Financial freedom begins the moment you value future sovereignty over temporary consumption.',
    authorOrPrinciple: 'Capital Allocation Law',
    directive: 'Channel every 4% vendor cost saving directly into prepayment of the commercial kitchen loan.',
    challengeTag: 'Debt Elimination Discipline',
  },
  'Investment & Wealth Compounding': {
    quote: 'Compound interest rewards those who protect their cashflow surplus and invest without interruption.',
    authorOrPrinciple: 'Wealth Architecture Creed',
    directive: 'Automate your monthly equity & expansion reserve transfer before discretionary spending.',
    challengeTag: 'Investment & Wealth Compounding',
  },
  'Anti-Scrolling & Deep Focus': {
    quote: 'You cannot build a multi-branch empire on leftover attention borrowed from social media algorithms.',
    authorOrPrinciple: 'Attention Sovereignty Rule',
    directive: 'Lock your phone outside your workspace for the next 45-minute Focus Mode sprint.',
    challengeTag: 'Anti-Scrolling & Deep Focus',
  },
};

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  user,
  goals,
  missions,
  finances,
  todayHabit,
  achievements,
  onStartFocusMission,
  onCompleteMissionQuick,
  onNavigate,
}) => {
  const [selectedSituation, setSelectedSituation] = useState<string>('Business Growth & Revenue');
  const [motivation, setMotivation] = useState<MotivationData>(
    SITUATION_PRESETS['Business Growth & Revenue']
  );
  const [loadingMotivation, setLoadingMotivation] = useState(false);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Compute real metrics
  const activeMissions = missions.filter(
    (m) => m.status !== 'Completed' && m.status !== 'Cancelled'
  );
  const priorityOrder: Record<string, number> = {
    Critical: 0,
    High: 1,
    Medium: 2,
    Low: 3,
  };
  const sortedActiveMissions = [...activeMissions].sort(
    (a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4)
  );

  const mostImportantMission = sortedActiveMissions[0] || missions[0];
  const top3Actions = sortedActiveMissions.slice(0, 3);

  const businessGoal =
    goals.find((g) => g.category === 'Business') || goals[0];
  const mainDreamProgress = businessGoal ? businessGoal.progressPct : 35;

  const totalInvestmentsAndSavings = finances
    .filter((f) => f.type === 'Investment' || f.type === 'Saving')
    .reduce((acc, f) => acc + f.amount, 0);
  const totalLoans = finances
    .filter((f) => f.type === 'Loan')
    .reduce((acc, f) => acc + f.amount, 0);
  const financialFreedomProgress = Math.min(
    100,
    Math.max(12, Math.round((totalInvestmentsAndSavings / 10000000) * 100))
  );

  const totalSocialMins =
    todayHabit.instagramMinutes +
    todayHabit.facebookMinutes +
    todayHabit.youtubeMinutes +
    todayHabit.otherSocialMinutes;
  const computedFocusScore =
    todayHabit.futureBuildingMinutes + totalSocialMins > 0
      ? Math.min(
          100,
          Math.round(
            (todayHabit.futureBuildingMinutes /
              (todayHabit.futureBuildingMinutes + totalSocialMins)) *
              100
          )
        )
      : user.focusScore;

  const { level, levelTitle, nextLevelXp, currentTierProgressPct } =
    calculateLevelFromXP(user.xp);

  const handleRefreshAIMotivation = async (situationKey: string) => {
    setSelectedSituation(situationKey);
    setMotivation(SITUATION_PRESETS[situationKey] || SITUATION_PRESETS['Business Growth & Revenue']);
    setLoadingMotivation(true);
    try {
      const res = await fetch('/api/ai/motivation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: situationKey,
          context: {
            mainDream: user.mainDream,
            mostImportantMission: mostImportantMission?.title,
            totalLoans,
            totalInvestmentsAndSavings,
            futureBuildingMinutes: todayHabit.futureBuildingMinutes,
            socialMinutes: totalSocialMins,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.quote) {
          setMotivation(data);
        }
      }
    } catch {
      // Fallback preset already set
    } finally {
      setLoadingMotivation(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Executive Hero Command Strip */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#8A9D93]">
              <div className="flex items-center gap-2 font-mono tabular-nums">
                <span className="text-[#D4AF37] font-semibold">{formattedDate}</span>
                <span aria-hidden="true">·</span>
                <span>Streak: {user.streakDays} Days</span>
                <span aria-hidden="true">·</span>
                <span>Level {level} ({levelTitle})</span>
              </div>
              <button
                onClick={() => onNavigate('coach')}
                className="text-xs font-medium text-[#10B981] hover:text-[#34D399] transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <span>Ask AI CEO Advisor</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold tracking-wider text-[#10B981]">
                {greeting}, {user.displayName.toUpperCase()} 👋
              </p>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#F3F5F4] text-balance">
                Your Mission Today: Build your future.
              </h1>
              <p className="text-sm text-[#9CAEA4] max-w-2xl">
                Connected North Star: <span className="text-[#F3F5F4] font-medium">{user.mainDream}</span>
              </p>
            </div>
          </div>

          {/* Today's Focus & Top 3 Actions */}
          <div className="mt-8 pt-6 border-t border-[#1C2B24] grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5 space-y-2">
              <div className="text-xs text-[#8A9D93]">Today&apos;s Primary Focus</div>
              <div className="text-lg font-bold text-[#D4AF37] flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <span>Increase Business Revenue</span>
              </div>
              <p className="text-xs text-[#8A9D93] leading-relaxed">
                Every completed revenue mission directly accelerates your Ruchitva Kitchen multi-branch expansion and debt elimination.
              </p>
            </div>

            <div className="md:col-span-7 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#8A9D93]">
                <span>Top 3 Executive Actions Today</span>
                <button
                  onClick={() => onNavigate('missions')}
                  className="text-[#10B981] hover:underline whitespace-nowrap shrink-0"
                >
                  View All Missions
                </button>
              </div>
              <div className="space-y-2">
                {top3Actions.length > 0 ? (
                  top3Actions.map((act, idx) => (
                    <div
                      key={act.id}
                      className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-[#070A09] border border-[#1C2B24] hover:border-[#2A4237] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono tabular-nums text-xs font-bold text-[#D4AF37]">
                          0{idx + 1}.
                        </span>
                        <span className="text-sm text-[#F3F5F4] truncate font-medium">
                          {act.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-[#8A9D93] font-mono tabular-nums hidden sm:inline">
                          {act.estimatedMinutes}m
                        </span>
                        <button
                          onClick={() => onStartFocusMission(act)}
                          className="px-2.5 py-1 text-xs font-medium bg-[#10B981]/15 text-[#10B981] hover:bg-[#10B981] hover:text-[#070A09] rounded transition-colors whitespace-nowrap shrink-0"
                        >
                          Focus
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[#8A9D93] py-3">
                    All priority missions completed for today. Add a new mission to keep building momentum.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Spotlight: Today's #1 High-Impact Mission */}
        <div className="lg:col-span-4 bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6 sm:p-8 flex flex-col justify-between">
          {mostImportantMission ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#8A9D93]">
                  <span>Today&apos;s #1 Most Important Mission</span>
                  <span className="font-mono tabular-nums text-[#D4AF37]">
                    {STATUS_SYMBOLS[mostImportantMission.status]}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-[#F3F5F4] leading-snug">
                  {mostImportantMission.title}
                </h2>

                <p className="text-xs text-[#9CAEA4] leading-relaxed">
                  {mostImportantMission.description}
                </p>

                <div className="pt-3 border-t border-[#1C2B24] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8A9D93]">Connected Dream</span>
                    <span className="text-[#F3F5F4] font-medium truncate max-w-[200px]">
                      {mostImportantMission.connectedDream}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono tabular-nums">
                    <span className="text-[#8A9D93]">Money Impact · Dream Impact</span>
                    <span className="text-[#D4AF37] font-semibold">
                      {mostImportantMission.moneyImpact} · {mostImportantMission.dreamImpact}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono tabular-nums">
                    <span className="text-[#8A9D93]">Estimated Time</span>
                    <span className="text-[#10B981] font-semibold">
                      {mostImportantMission.estimatedMinutes} minutes
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#1C2B24] flex items-center gap-3">
                <button
                  onClick={() => onStartFocusMission(mostImportantMission)}
                  className="flex-1 py-2.5 px-4 bg-[#10B981] hover:bg-[#059669] text-[#070A09] font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start 25m Focus Sprint</span>
                </button>
                {mostImportantMission.status !== 'Completed' &&
                  mostImportantMission.status !== 'Cancelled' && (
                    <button
                      onClick={() => onCompleteMissionQuick(mostImportantMission)}
                      className="py-2.5 px-3 border border-[#1C2B24] hover:border-[#D4AF37] text-[#F3F5F4] text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      title="Mark Mission Completed"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Complete</span>
                    </button>
                  )}
              </div>
            </>
          ) : (
            <div className="flex flex-col justify-between h-full">
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-[#F3F5F4]">No Active Mission Selected</h2>
                <p className="text-xs text-[#8A9D93]">
                  Create your next high-leverage mission to connect daily execution with your long-term dreams.
                </p>
              </div>
              <button
                onClick={() => onNavigate('missions')}
                className="py-2.5 px-4 bg-[#10B981] text-[#070A09] font-semibold text-xs rounded-lg whitespace-nowrap shrink-0"
              >
                Create First Mission
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4 Core Operating Telemetry Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('dreams')}
          className="cursor-pointer bg-[#0D1512] border border-[#1C2B24] hover:border-[#2A4237] rounded-xl p-5 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-[#8A9D93] mb-2">
            <span>Current Life Score & Main Dream</span>
            <Target className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-3xl font-bold text-[#F3F5F4]">{user.lifeScore}/100</span>
            <span className="text-xs text-[#10B981]">Dream: {mainDreamProgress}%</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-[#070A09] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] transition-all duration-300"
              style={{ width: `${user.lifeScore}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[#8A9D93] truncate">
            {businessGoal ? businessGoal.title : 'Ruchitva Multi-Branch Expansion'}
          </p>
        </div>

        <div
          onClick={() => onNavigate('money')}
          className="cursor-pointer bg-[#0D1512] border border-[#1C2B24] hover:border-[#2A4237] rounded-xl p-5 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-[#8A9D93] mb-2">
            <span>Financial Freedom Progress</span>
            <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-3xl font-bold text-[#D4AF37]">{financialFreedomProgress}%</span>
            <span className="text-xs text-[#9CAEA4]">{formatINR(totalInvestmentsAndSavings)}</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-[#070A09] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D4AF37] transition-all duration-300"
              style={{ width: `${financialFreedomProgress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[#8A9D93]">
            Target Corpus: ₹1,00,00,000 · Debt: {formatINR(totalLoans)}
          </p>
        </div>

        <div
          onClick={() => onNavigate('dreams')}
          className="cursor-pointer bg-[#0D1512] border border-[#1C2B24] hover:border-[#2A4237] rounded-xl p-5 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-[#8A9D93] mb-2">
            <span>Business Growth & Health Score</span>
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-3xl font-bold text-[#F3F5F4]">{mainDreamProgress}%</span>
            <span className="text-xs text-[#10B981]">Health: {user.healthScore}/100</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-[#070A09] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] transition-all duration-300"
              style={{ width: `${user.healthScore}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[#8A9D93]">
            Sleep: {todayHabit.sleepHours}h · Workout: {todayHabit.workoutMinutes}m
          </p>
        </div>

        <div
          onClick={() => onNavigate('social')}
          className="cursor-pointer bg-[#0D1512] border border-[#1C2B24] hover:border-[#2A4237] rounded-xl p-5 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-[#8A9D93] mb-2">
            <span>Focus vs. Distraction Score</span>
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-3xl font-bold text-[#F3F5F4]">{computedFocusScore}%</span>
            <span className="text-xs text-[#10B981]">
              {(todayHabit.futureBuildingMinutes / 60).toFixed(1)}h Built
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-[#070A09] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] transition-all duration-300"
              style={{ width: `${computedFocusScore}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[#8A9D93]">
            Social Media Today: {totalSocialMins}m vs Future: {todayHabit.futureBuildingMinutes}m
          </p>
        </div>
      </section>

      {/* Context-Aware AI Motivational System & Gamification Ladder */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* AI Contextual Motivation */}
        <div className="lg:col-span-7 bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#F3F5F4]">
                  AI Situational Mindset & Directive
                </h3>
                <p className="text-xs text-[#8A9D93]">
                  Never random quotes — calibrated directly to your active challenge
                </p>
              </div>
              <button
                onClick={() => handleRefreshAIMotivation(selectedSituation)}
                disabled={loadingMotivation}
                className="px-3 py-1.5 text-xs font-medium bg-[#121E19] border border-[#1C2B24] hover:border-[#D4AF37] text-[#D4AF37] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingMotivation ? 'animate-spin' : ''}`} />
                <span>Generate Fresh AI Insight</span>
              </button>
            </div>

            {/* Interactive Challenge Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#070A09] border border-[#1C2B24] rounded-lg">
              {Object.keys(SITUATION_PRESETS).map((sitKey) => (
                <button
                  key={sitKey}
                  onClick={() => handleRefreshAIMotivation(sitKey)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    selectedSituation === sitKey
                      ? 'bg-[#10B981] text-[#070A09] font-semibold'
                      : 'text-[#8A9D93] hover:text-[#F3F5F4]'
                  }`}
                >
                  {sitKey}
                </button>
              ))}
            </div>

            <div className="py-4 px-5 bg-[#070A09] border border-[#1C2B24] rounded-xl space-y-3">
              <p className="text-base sm:text-lg font-medium text-[#F3F5F4] italic leading-relaxed">
                &ldquo;{motivation.quote}&rdquo;
              </p>
              <div className="text-xs text-[#D4AF37] font-medium">
                {motivation.authorOrPrinciple} · {motivation.challengeTag}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1C2B24] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-[#9CAEA4]">
              <span className="text-[#10B981] font-semibold">CEO Directive: </span>
              {motivation.directive}
            </div>
          </div>
        </div>

        {/* Gamification Level Ladder & Achievements */}
        <div className="lg:col-span-5 bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#F3F5F4]">
                  Founder Progression & XP
                </h3>
                <p className="text-xs text-[#8A9D93]">
                  Earn XP by completing Focus Mode sprints and high-impact missions
                </p>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-lg font-bold text-[#D4AF37]">{user.xp} XP</div>
                <div className="text-xs text-[#8A9D93]">Next: {nextLevelXp} XP</div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono tabular-nums">
                <span className="text-[#10B981] font-semibold">
                  Level {level}: {levelTitle}
                </span>
                <span className="text-[#8A9D93]">{currentTierProgressPct}% to Level {level + 1}</span>
              </div>
              <div className="h-2 w-full bg-[#070A09] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#10B981] to-[#D4AF37] transition-all duration-300"
                  style={{ width: `${currentTierProgressPct}%` }}
                />
              </div>
            </div>

            {/* Milestone Tiers */}
            <div className="grid grid-cols-5 gap-1.5 pt-2">
              {LEVEL_MILESTONES.map((tier) => {
                const reached = level >= tier.level;
                return (
                  <div
                    key={tier.level}
                    className={`p-2 rounded-lg border text-center ${
                      reached
                        ? 'bg-[#121E19] border-[#10B981]/50 text-[#F3F5F4]'
                        : 'bg-[#070A09] border-[#1C2B24] text-[#6B7E74]'
                    }`}
                  >
                    <div className="font-mono tabular-nums text-xs font-bold text-[#D4AF37]">
                      Lv.{tier.level}
                    </div>
                    <div className="text-[11px] font-medium truncate mt-0.5">
                      {tier.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1C2B24] space-y-2">
            <div className="text-xs font-medium text-[#8A9D93] flex items-center justify-between">
              <span>Recent Unlocked Achievements ({achievements.length})</span>
              <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
            </div>
            <div className="space-y-1.5">
              {achievements.slice(0, 2).map((ach) => (
                <div
                  key={ach.id}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-[#070A09] border border-[#1C2B24]"
                >
                  <span className="font-medium text-[#F3F5F4] truncate">{ach.title}</span>
                  <span className="font-mono tabular-nums text-[#D4AF37] shrink-0">
                    +{ach.xpReward} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
