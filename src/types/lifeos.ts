export type MissionCategory =
  | 'Business'
  | 'Money'
  | 'Health'
  | 'Family'
  | 'Learning'
  | 'Personal';

export type MissionStatus =
  | 'Not Started'
  | 'Started'
  | 'Processing'
  | 'Paused'
  | 'Cancelled'
  | 'Completed'
  | 'Delayed';

export type MissionPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type ImpactLevel = 'High' | 'Medium' | 'Low';

export type GoalCategory =
  | 'House'
  | 'Business'
  | 'Investment'
  | 'Health'
  | 'Family';

export type FinanceType =
  | 'Income'
  | 'Expense'
  | 'Loan'
  | 'Investment'
  | 'Saving';

export type MissReason =
  | 'None'
  | 'No time'
  | 'Low energy'
  | 'Distraction'
  | 'Unexpected work';

export type AchievementCategory =
  | 'Focus'
  | 'Business'
  | 'Wealth'
  | 'Health'
  | 'Discipline'
  | 'Milestone';

export type PromptCategory =
  | 'Daily Focus'
  | 'Income Strategy'
  | 'Motivation'
  | 'Weekly Review'
  | 'General Coaching';

export interface UserProfile {
  uid: string;
  displayName: string;
  xp: number;
  level: number;
  levelTitle: string;
  lifeScore: number;
  healthScore: number;
  focusScore: number;
  streakDays: number;
  mainDream: string;
}

export interface GoalItem {
  id: string;
  userId: string;
  title: string;
  category: GoalCategory;
  targetLabel: string;
  targetValue: number;
  currentValue: number;
  progressPct: number;
  timeline: string;
  notes: string;
}

export interface MissionItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: MissionCategory;
  status: MissionStatus;
  priority: MissionPriority;
  connectedDream: string;
  moneyImpact: ImpactLevel;
  dreamImpact: number;
  estimatedMinutes: number;
  actualMinutes: number;
  startTime: string;
  completionTime: string;
  notes: string;
  aiSuggestion: string;
}

export interface HabitLog {
  id: string;
  userId: string;
  dateKey: string;
  instagramMinutes: number;
  facebookMinutes: number;
  youtubeMinutes: number;
  otherSocialMinutes: number;
  futureBuildingMinutes: number;
  sleepHours: number;
  workoutMinutes: number;
  waterGlasses: number;
  aiTip: string;
}

export interface FinanceItem {
  id: string;
  userId: string;
  title: string;
  type: FinanceType;
  category: string;
  amount: number;
  monthlyTarget: number;
  notes: string;
  dateStr: string;
}

export interface DailyReviewItem {
  id: string;
  userId: string;
  dateStr: string;
  completedMissionsCount: number;
  missedMissionsCount: number;
  moneyCreated: number;
  focusMinutes: number;
  distractionMinutes: number;
  missReason: MissReason;
  reflectionNotes: string;
  aiSummary: string;
}

export interface AchievementItem {
  id: string;
  userId: string;
  code: string;
  title: string;
  description: string;
  xpReward: number;
  category: AchievementCategory;
  unlockedAtStr: string;
}

export interface AIChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  promptCategory: PromptCategory;
  content: string;
}

export interface MotivationData {
  quote: string;
  authorOrPrinciple: string;
  directive: string;
  challengeTag: string;
}

export interface FinancialAnalysisData {
  headline: string;
  recommendations: {
    title: string;
    impact: string;
    action: string;
  }[];
  wealthProjectionNote: string;
}

export interface WeeklyReportData {
  achievements: string[];
  moneyProgress: string;
  businessProgress: string;
  healthProgress: string;
  mistakes: string[];
  nextWeekStrategy: string[];
  ceoVerdict: string;
}

export const STATUS_SYMBOLS: Record<MissionStatus, string> = {
  'Not Started': '⭕ Not Started',
  Started: '🟢 Started',
  Processing: '🟡 Processing',
  Paused: '⏸ Paused',
  Cancelled: '❌ Cancelled',
  Completed: '✅ Completed',
  Delayed: '⏰ Delayed',
};

export function calculateLevelFromXP(xp: number): {
  level: number;
  levelTitle: string;
  nextLevelXp: number;
  currentTierProgressPct: number;
} {
  const safeXp = Math.max(0, Math.floor(xp));
  const level = Math.min(100, Math.max(1, Math.floor(safeXp / 250) + 1));

  let levelTitle = 'Dreamer';
  if (level >= 50) {
    levelTitle = 'Freedom Achiever';
  } else if (level >= 20) {
    levelTitle = 'Wealth Creator';
  } else if (level >= 10) {
    levelTitle = 'Entrepreneur';
  } else if (level >= 5) {
    levelTitle = 'Builder';
  }

  const currentLevelFloorXp = (level - 1) * 250;
  const nextLevelXp = level * 250;
  const currentTierProgressPct = Math.min(
    100,
    Math.round(((safeXp - currentLevelFloorXp) / 250) * 100)
  );

  return { level, levelTitle, nextLevelXp, currentTierProgressPct };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}
