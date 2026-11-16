import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  ShieldAlert,
  Clock,
  CheckCircle2,
  FileBarChart2,
  RefreshCw,
} from 'lucide-react';
import {
  UserProfile,
  GoalItem,
  MissionItem,
  FinanceItem,
  HabitLog,
  DailyReviewItem,
  MissReason,
  AIChatMessage,
  PromptCategory,
  WeeklyReportData,
  formatINR,
} from '../types/lifeos';

// 1. SOCIAL MEDIA CONTROL & HABIT TRACKER
interface SocialControlProps {
  habit: HabitLog;
  onUpdateHabit: (updates: Partial<Omit<HabitLog, 'id' | 'userId' | 'dateKey'>>) => Promise<void>;
}

export const SocialMediaControlView: React.FC<SocialControlProps> = ({
  habit,
  onUpdateHabit,
}) => {
  const [ig, setIg] = useState(habit.instagramMinutes);
  const [fb, setFb] = useState(habit.facebookMinutes);
  const [yt, setYt] = useState(habit.youtubeMinutes);
  const [futureMins, setFutureMins] = useState(habit.futureBuildingMinutes);
  const [sleepHours, setSleepHours] = useState(habit.sleepHours);
  const [workoutMins, setWorkoutMins] = useState(habit.workoutMinutes);
  const [saving, setSaving] = useState(false);

  const dailyEntertainmentMins = ig + fb + yt + habit.otherSocialMinutes;
  const weeklyEntertainmentHours = Math.round((dailyEntertainmentMins * 7) / 60);
  const weeklyFutureHours = Math.round((futureMins * 7) / 60);

  const handleSave = async () => {
    setSaving(true);
    try {
      const tip =
        dailyEntertainmentMins > futureMins
          ? 'Alert: Your entertainment scrolling exceeded your Future Building time today. Reclaim 45 minutes from Instagram/YouTube tomorrow morning for your #1 Business Mission.'
          : `Strong discipline: You invested ${(futureMins / 60).toFixed(1)}h building your future vs ${(dailyEntertainmentMins / 60).toFixed(1)}h on social feeds.`;
      await onUpdateHabit({
        instagramMinutes: ig,
        facebookMinutes: fb,
        youtubeMinutes: yt,
        futureBuildingMinutes: futureMins,
        sleepHours,
        workoutMinutes: workoutMins,
        aiTip: tip,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6 space-y-1">
        <h1 className="text-2xl font-bold text-[#F3F5F4]">
          Social Media Control & Attention Sovereignty
        </h1>
        <p className="text-xs text-[#8A9D93]">
          &ldquo;I don&apos;t want to waste my time scrolling. I want to build my future.&rdquo;
        </p>
      </div>

      {/* Weekly Comparison Spotlight (Entertainment Time vs Future Building Time) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#8A9D93]">
            <span>Weekly Entertainment & Scrolling Time</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono tabular-nums flex items-baseline justify-between">
            <span className="text-4xl font-bold text-amber-400">
              {weeklyEntertainmentHours} hours
            </span>
            <span className="text-xs text-[#8A9D93]">
              Today: {dailyEntertainmentMins} mins
            </span>
          </div>
          <div className="h-2.5 w-full bg-[#070A09] rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    (weeklyEntertainmentHours /
                      Math.max(1, weeklyEntertainmentHours + weeklyFutureHours)) *
                      100
                  )
                )}%`,
              }}
            />
          </div>
          <p className="text-xs text-[#9CAEA4]">
            Combined Instagram ({ig}m/day), Facebook ({fb}m/day), and YouTube ({yt}m/day).
          </p>
        </div>

        <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#8A9D93]">
            <span>Weekly Future Building Time</span>
            <Clock className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="font-mono tabular-nums flex items-baseline justify-between">
            <span className="text-4xl font-bold text-[#10B981]">
              {weeklyFutureHours} hours
            </span>
            <span className="text-xs text-[#D4AF37]">
              Today: {futureMins} mins ({(futureMins / 60).toFixed(1)}h)
            </span>
          </div>
          <div className="h-2.5 w-full bg-[#070A09] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#10B981] to-[#D4AF37] transition-all duration-300"
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    (weeklyFutureHours /
                      Math.max(1, weeklyEntertainmentHours + weeklyFutureHours)) *
                      100
                  )
                )}%`,
              }}
            />
          </div>
          <p className="text-xs text-[#9CAEA4]">
            Deep work on Ruchitva Kitchen growth, customer acquisition, and wealth systems.
          </p>
        </div>
      </div>

      {/* Interactive Time Allocation Controls */}
      <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1C2B24] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#F3F5F4]">
              Log Today&apos;s Screen & Vitality Metrics
            </h2>
            <p className="text-xs text-[#8A9D93]">
              Adjust sliders to audit your daily habits and generate AI recovery protocols
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-[#070A09] font-semibold text-xs rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {saving ? 'Saving Ledger...' : 'Update Habit Log'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#9CAEA4]">Instagram Time</span>
              <span className="font-mono tabular-nums text-amber-400 font-semibold">
                {ig} mins
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={240}
              step={5}
              value={ig}
              onChange={(e) => setIg(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#9CAEA4]">Facebook Time</span>
              <span className="font-mono tabular-nums text-amber-400 font-semibold">
                {fb} mins
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={240}
              step={5}
              value={fb}
              onChange={(e) => setFb(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#9CAEA4]">YouTube Entertainment Time</span>
              <span className="font-mono tabular-nums text-amber-400 font-semibold">
                {yt} mins
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={240}
              step={5}
              value={yt}
              onChange={(e) => setYt(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#9CAEA4]">Future Building Deep Work</span>
              <span className="font-mono tabular-nums text-[#10B981] font-semibold">
                {futureMins} mins
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={600}
              step={15}
              value={futureMins}
              onChange={(e) => setFutureMins(Number(e.target.value))}
              className="w-full accent-[#10B981]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#9CAEA4]">Restorative Sleep</span>
              <span className="font-mono tabular-nums text-[#10B981] font-semibold">
                {sleepHours} hrs
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={10}
              step={1}
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              className="w-full accent-[#10B981]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#9CAEA4]">Morning Exercise & Mobility</span>
              <span className="font-mono tabular-nums text-[#D4AF37] font-semibold">
                {workoutMins} mins
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={120}
              step={5}
              value={workoutMins}
              onChange={(e) => setWorkoutMins(Number(e.target.value))}
              className="w-full accent-[#D4AF37]"
            />
          </div>
        </div>

        <div className="p-4 bg-[#070A09] border border-[#1C2B24] rounded-xl text-xs text-[#9CAEA4] leading-relaxed">
          <span className="text-[#D4AF37] font-semibold">AI Anti-Distraction Protocol: </span>
          {habit.aiTip}
        </div>
      </div>
    </div>
  );
};

// 2. DAILY REVIEW & WEEKLY AI REPORT
interface ReviewViewProps {
  user: UserProfile;
  missions: MissionItem[];
  goals: GoalItem[];
  finances: FinanceItem[];
  todayHabit: HabitLog;
  reviews: DailyReviewItem[];
  onCreateDailyReview: (review: Omit<DailyReviewItem, 'id' | 'userId'>) => Promise<void>;
}

const MISS_REASONS: MissReason[] = [
  'None',
  'No time',
  'Low energy',
  'Distraction',
  'Unexpected work',
];

const INITIAL_WEEKLY_REPORT: WeeklyReportData = {
  achievements: [
    'Launched Ruchitva weekend combo poster campaign and contacted corporate lunch leads.',
    'Maintained 3.5x ratio of Future Building Time (20+ hrs) over Social Media Entertainment.',
    'Completed morning strength and mobility sessions to sustain high executive energy.',
  ],
  moneyProgress:
    'Net cashflow surplus on track; 4% packaging vendor cost optimization identified to add ₹12,000/month toward loan prepayment.',
  businessProgress:
    'Ruchitva Kitchen Branch #1 standardization at 35% completion; B2B recurring corporate lunch pipeline initiated.',
  healthProgress:
    'Averaged 7 hours restorative sleep and 45 minutes morning training across active weekdays.',
  mistakes: [
    'Allowed 35 minutes of late-evening YouTube scrolling to delay evening reflection twice.',
    'Afternoon supplier calls occasionally ran into scheduled B2B outreach blocks.',
  ],
  nextWeekStrategy: [
    'Complete top revenue mission before 11:00 AM every day before opening social apps.',
    'Close 3 recurring corporate lunch contracts (₹25,000+ monthly revenue addition).',
    'Automate ₹15,000 extra prepayment on the commercial kitchen loan on the 5th of the month.',
  ],
  ceoVerdict:
    'Strong builder trajectory. Eliminating late-night scrolling and locking morning B2B outreach will accelerate your multi-branch dream by 6 months.',
};

export const DailyAndWeeklyReviewView: React.FC<ReviewViewProps> = ({
  user,
  missions,
  goals,
  finances,
  todayHabit,
  reviews,
  onCreateDailyReview,
}) => {
  const completedCount = missions.filter((m) => m.status === 'Completed').length;
  const missedCount = missions.filter(
    (m) => m.status !== 'Completed' && m.status !== 'Cancelled'
  ).length;
  const socialMins =
    todayHabit.instagramMinutes +
    todayHabit.facebookMinutes +
    todayHabit.youtubeMinutes +
    todayHabit.otherSocialMinutes;

  const [moneyCreated, setMoneyCreated] = useState<number>(8500);
  const [missReason, setMissReason] = useState<MissReason>('Unexpected work');
  const [reflectionNotes, setReflectionNotes] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [weeklyReport, setWeeklyReport] = useState<WeeklyReportData>(
    INITIAL_WEEKLY_REPORT
  );
  const [loadingWeekly, setLoadingWeekly] = useState(false);

  const handleSubmitNightlyReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const draftReview = {
        dateStr: todayStr,
        completedMissionsCount: completedCount,
        missedMissionsCount: missedCount,
        moneyCreated: Number(moneyCreated) || 0,
        focusMinutes: todayHabit.futureBuildingMinutes,
        distractionMinutes: socialMins,
        missReason,
        reflectionNotes:
          reflectionNotes.trim() || 'Evening executive accountability check-in.',
      };

      let aiSummary =
        'Pattern Analysis: Protect your first 90 minutes tomorrow morning for high-impact revenue missions to prevent unexpected work from derailing execution.';

      try {
        const res = await fetch('/api/ai/daily-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviewData: draftReview,
            recentReviews: reviews.slice(0, 5),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.aiSummary) aiSummary = data.aiSummary;
        }
      } catch {
        // Fallback summary already set
      }

      await onCreateDailyReview({
        ...draftReview,
        aiSummary,
      });
      setReflectionNotes('');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleGenerateWeeklyReport = async () => {
    setLoadingWeekly(true);
    try {
      const res = await fetch('/api/ai/weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            user,
            goals,
            missions,
            finances,
            todayHabit,
            reviews,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.achievements && data.nextWeekStrategy) {
          setWeeklyReport(data);
        }
      }
    } finally {
      setLoadingWeekly(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Nightly Daily Review Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6 space-y-5">
          <div>
            <div className="text-xs text-[#D4AF37] font-semibold">
              EVENING ACCOUNTABILITY PROTOCOL
            </div>
            <h2 className="text-xl font-bold text-[#F3F5F4] mt-0.5">
              Tonight&apos;s Daily Review Report
            </h2>
            <p className="text-xs text-[#8A9D93]">
              Audit today&apos;s mission execution so your AI CEO learns your behavioral patterns.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-[#070A09] border border-[#1C2B24] rounded-lg">
              <div className="text-[#8A9D93]">Completed</div>
              <div className="text-lg font-bold font-mono tabular-nums text-[#10B981] mt-0.5">
                {completedCount}
              </div>
            </div>
            <div className="p-3 bg-[#070A09] border border-[#1C2B24] rounded-lg">
              <div className="text-[#8A9D93]">Pending / Missed</div>
              <div className="text-lg font-bold font-mono tabular-nums text-amber-400 mt-0.5">
                {missedCount}
              </div>
            </div>
            <div className="p-3 bg-[#070A09] border border-[#1C2B24] rounded-lg">
              <div className="text-[#8A9D93]">Focus Time</div>
              <div className="text-lg font-bold font-mono tabular-nums text-[#10B981] mt-0.5">
                {todayHabit.futureBuildingMinutes}m
              </div>
            </div>
            <div className="p-3 bg-[#070A09] border border-[#1C2B24] rounded-lg">
              <div className="text-[#8A9D93]">Distraction</div>
              <div className="text-lg font-bold font-mono tabular-nums text-amber-400 mt-0.5">
                {socialMins}m
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitNightlyReview} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#8A9D93] mb-1">
                  Money Created / Value Generated Today (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={moneyCreated}
                  onChange={(e) => setMoneyCreated(Number(e.target.value))}
                  className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4] font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8A9D93] mb-1">
                  Why did you miss tasks today?
                </label>
                <select
                  value={missReason}
                  onChange={(e) => setMissReason(e.target.value as MissReason)}
                  className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4]"
                >
                  {MISS_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#8A9D93] mb-1">
                Evening Reflection & Key Win
              </label>
              <textarea
                rows={2}
                maxLength={800}
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                placeholder="What went well today? What obstacle slowed you down?"
                className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4]"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full py-2.5 px-4 bg-[#10B981] hover:bg-[#059669] text-[#070A09] font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {submittingReview
                  ? 'Analyzing Evening Pattern with Gemini...'
                  : 'Complete Nightly Review & Generate AI Pattern Analysis'}
              </span>
            </button>
          </form>
        </div>

        {/* Historical Daily Reviews & AI Pattern Diagnostics */}
        <div className="lg:col-span-6 bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[#F3F5F4]">
              AI Behavioral Pattern Log
            </h3>
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl bg-[#070A09] border border-[#1C2B24] space-y-2 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[#8A9D93] font-mono tabular-nums">
                    <span className="text-[#D4AF37] font-semibold">{rev.dateStr}</span>
                    <span>
                      Completed: {rev.completedMissionsCount} · Missed: {rev.missedMissionsCount} · Created: {formatINR(rev.moneyCreated)}
                    </span>
                  </div>
                  <div className="text-[#9CAEA4]">
                    Primary Bottleneck: <span className="text-[#F3F5F4] font-medium">{rev.missReason}</span>
                    {rev.reflectionNotes && ` — "${rev.reflectionNotes}"`}
                  </div>
                  <div className="pt-2 border-t border-[#1C2B24] text-[#10B981] leading-relaxed">
                    <span className="font-semibold">AI Pattern Insight: </span>
                    {rev.aiSummary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly AI Life Performance Report */}
      <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1C2B24] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-semibold">
              <FileBarChart2 className="w-4 h-4" />
              <span>EXECUTIVE WEEKLY INTELLIGENCE</span>
            </div>
            <h2 className="text-2xl font-bold text-[#F3F5F4]">
              Weekly AI Life Performance Report
            </h2>
          </div>
          <button
            onClick={handleGenerateWeeklyReport}
            disabled={loadingWeekly}
            className="px-4 py-2.5 bg-[#121E19] border border-[#D4AF37]/60 hover:bg-[#D4AF37] hover:text-[#070A09] text-[#D4AF37] font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingWeekly ? 'animate-spin' : ''}`} />
            <span>
              {loadingWeekly
                ? 'Synthesizing Weekly Report...'
                : 'Generate Fresh Weekly AI Report'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#070A09] border border-[#1C2B24] rounded-xl space-y-1.5">
            <div className="text-xs text-[#D4AF37] font-semibold">Money Progress</div>
            <p className="text-xs text-[#F3F5F4] leading-relaxed">
              {weeklyReport.moneyProgress}
            </p>
          </div>
          <div className="p-4 bg-[#070A09] border border-[#1C2B24] rounded-xl space-y-1.5">
            <div className="text-xs text-[#10B981] font-semibold">Business Progress</div>
            <p className="text-xs text-[#F3F5F4] leading-relaxed">
              {weeklyReport.businessProgress}
            </p>
          </div>
          <div className="p-4 bg-[#070A09] border border-[#1C2B24] rounded-xl space-y-1.5">
            <div className="text-xs text-[#10B981] font-semibold">Health Progress</div>
            <p className="text-xs text-[#F3F5F4] leading-relaxed">
              {weeklyReport.healthProgress}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-[#10B981]">Key Achievements</h4>
            <ul className="space-y-2 text-xs text-[#9CAEA4]">
              {weeklyReport.achievements.map((item, i) => (
                <li key={i} className="p-3 bg-[#070A09] border border-[#1C2B24] rounded-lg">
                  0{i + 1}. {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-amber-400">Mistakes & Leaks Detected</h4>
            <ul className="space-y-2 text-xs text-[#9CAEA4]">
              {weeklyReport.mistakes.map((item, i) => (
                <li key={i} className="p-3 bg-[#070A09] border border-[#1C2B24] rounded-lg">
                  0{i + 1}. {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-[#D4AF37]">Next Week CEO Strategy</h4>
            <ul className="space-y-2 text-xs text-[#F3F5F4]">
              {weeklyReport.nextWeekStrategy.map((item, i) => (
                <li key={i} className="p-3 bg-[#070A09] border border-[#1C2B24] rounded-lg">
                  0{i + 1}. {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-[#1C2B24] text-xs text-[#9CAEA4]">
          <span className="text-[#D4AF37] font-semibold">Executive Verdict: </span>
          {weeklyReport.ceoVerdict}
        </div>
      </div>
    </div>
  );
};

// 3. AI LIFE COACH & PERSONAL CEO ADVISOR
interface AICoachProps {
  user: UserProfile;
  goals: GoalItem[];
  missions: MissionItem[];
  finances: FinanceItem[];
  todayHabit: HabitLog;
  chats: AIChatMessage[];
  onSendCoachMessage: (
    userText: string,
    category: PromptCategory,
    aiReply: string
  ) => Promise<void>;
}

const QUICK_PROMPTS: { label: string; category: PromptCategory }[] = [
  { label: 'What should I focus on today?', category: 'Daily Focus' },
  { label: 'How can I increase income?', category: 'Income Strategy' },
  { label: 'Why am I losing motivation?', category: 'Motivation' },
  { label: 'Review my week.', category: 'Weekly Review' },
];

export const AILifeCoachView: React.FC<AICoachProps> = ({
  user,
  goals,
  missions,
  finances,
  todayHabit,
  chats,
  onSendCoachMessage,
}) => {
  const [input, setInput] = useState('');
  const [selectedCat, setSelectedCat] = useState<PromptCategory>('Daily Focus');
  const [sending, setSending] = useState(false);

  const handleAsk = async (questionText: string, category: PromptCategory) => {
    const trimmed = questionText.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setInput('');

    try {
      let reply =
        'Execute your #1 revenue mission first thing this morning, protect a 45-minute distraction-free block, and channel new cashflow into your core dream goals.';

      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          promptCategory: category,
          context: {
            user,
            goals: goals.map((g) => ({
              title: g.title,
              category: g.category,
              progressPct: g.progressPct,
              targetLabel: g.targetLabel,
            })),
            activeMissions: missions
              .filter((m) => m.status !== 'Completed')
              .map((m) => ({
                title: m.title,
                category: m.category,
                priority: m.priority,
                moneyImpact: m.moneyImpact,
                dreamImpact: m.dreamImpact,
              })),
            completedMissions: missions
              .filter((m) => m.status === 'Completed')
              .map((m) => m.title),
            finances: finances.map((f) => ({
              title: f.title,
              type: f.type,
              amount: f.amount,
            })),
            todayHabit,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) reply = data.reply;
      }

      await onSendCoachMessage(trimmed, category, reply);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>PERSONAL AI CEO · FINANCIAL ADVISOR · ACCOUNTABILITY COACH</span>
            </div>
            <h1 className="text-2xl font-bold text-[#F3F5F4] mt-1">
              AI Life Coach Advisory Room
            </h1>
          </div>
        </div>

        {/* One-Click Executive Questions */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q.label}
              onClick={() => {
                setSelectedCat(q.category);
                handleAsk(q.label, q.category);
              }}
              disabled={sending}
              className="px-3.5 py-2 bg-[#070A09] border border-[#1C2B24] hover:border-[#D4AF37] text-xs font-medium text-[#F3F5F4] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              &ldquo;{q.label}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Stream */}
      <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6 space-y-4">
        <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
          {chats.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 rounded-xl border text-xs leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-[#121E19] border-[#10B981]/40 text-[#F3F5F4] ml-8'
                  : 'bg-[#070A09] border-[#1C2B24] text-[#E2EAE6] mr-4'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-[#8A9D93] mb-1.5">
                <span className="font-semibold text-[#D4AF37]">
                  {msg.role === 'user' ? 'YOU (FOUNDER)' : 'LIFEOS AI CEO'}
                </span>
                <span>{msg.promptCategory}</span>
              </div>
              <div>{msg.content}</div>
            </div>
          ))}
          {sending && (
            <div className="p-4 rounded-xl bg-[#070A09] border border-[#1C2B24] text-xs text-[#D4AF37]">
              AI CEO is analyzing your goals, missions, finances, and habits...
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(input, selectedCat);
          }}
          className="pt-4 border-t border-[#1C2B24] flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI CEO anything about your missions, Ruchitva growth, debt, or focus..."
            className="flex-1 bg-[#070A09] border border-[#1C2B24] rounded-xl px-4 py-3 text-xs text-[#F3F5F4] placeholder-[#6B7E74] focus:outline-none focus:border-[#10B981]"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="py-3 px-5 bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-[#070A09] font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask AI CEO</span>
          </button>
        </form>
      </div>
    </div>
  );
};
