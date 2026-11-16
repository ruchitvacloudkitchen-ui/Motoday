export type DayPlanType = 'weekday' | 'saturday' | 'sunday';
export type TaskState = 'not_started' | 'processing' | 'completed' | 'cancelled';
export type TimeThemeMode = 'morning' | 'evening' | 'night';
export type IllustrationPropType = 'coin' | 'phone' | 'cake';

export interface DailyTask {
  id: string;
  dayType: DayPlanType;
  time: string;
  startMins: number;
  icon: string;
  emoji?: string;
  title: string;
  posterHeadline: string;
  benefit: string;
  propType: IllustrationPropType;
  cardBg: string;
  status: TaskState;
  startedAtMs?: number;
  startedAt?: number;
  minutesTaken?: number;
  rescheduledTo?: string;
}

export interface DreamCardItem {
  id: string;
  emoji: string;
  title: string;
  daysLeft: number;
  progressPct: number;
  progress?: number;
  achieved: boolean;
  tapCount: number;
  imageUrl: string;
  affirmation: string;
}

export interface LoanMountainItem {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  stepPayAmount: number;
  emoji: string;
}

export interface WeeklyFinanceEntry {
  branch1Sales: number;
  branch2Sales: number;
  costs: number;
  loanPaid: number;
  saved: number;
}

export interface BadgeItem {
  id: string;
  emoji: string;
  title: string;
  unlocked: boolean;
}

export function getThemeByHour(hour: number): TimeThemeMode {
  if (hour >= 5 && hour < 17) return 'morning';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

export const DAILY_MANIFESTATIONS: string[] = [
  'I AM ATTRACTING 6 BRANCHES!',
  'MY LOANS MELT AWAY FAST!',
  'CUSTOMERS LOVE RUCHITVA DAILY!',
  'WE OWN OUR DREAM HOME!',
  'GOLD AND WEALTH FLOW IN!',
  'MY FILM SHINES ON SCREEN!',
];

export const LUCKY_QUOTES: string[] = [
  'Small daily wins build a big empire.',
  'Zero reels today equals more profit tomorrow.',
  'Your calm focus attracts royal wealth.',
  'Every loan payment buys your freedom.',
  'Srinivas rises brighter like the sun.',
];

export const MONEY_QUOTES: { quote: string; author: string }[] = [
  {
    quote: 'Do not save what is left after spending.',
    author: 'Warren Buffett',
  },
  {
    quote: 'The big money is in the waiting.',
    author: 'Charlie Munger',
  },
  {
    quote: 'Live like no one else now, win later.',
    author: 'Dave Ramsey',
  },
  {
    quote: 'An investment in knowledge pays best interest.',
    author: 'Benjamin Franklin',
  },
  {
    quote: 'Wealth is what you do not spend.',
    author: 'Morgan Housel',
  },
  {
    quote: 'Stay the course and let time compound.',
    author: 'John Bogle',
  },
  {
    quote: 'Know what you own and why you own it.',
    author: 'Peter Lynch',
  },
];

export const INITIAL_TASKS: DailyTask[] = [
  // WEEKDAY (13 tasks with ALL-CAPS poster headlines & 5-word benefits)
  {
    id: 'wd_1',
    dayType: 'weekday',
    time: '5:30 AM',
    startMins: 5 * 60 + 30,
    icon: '🪥',
    title: 'Brush and shave',
    posterHeadline: 'RISE AND SHINE!',
    benefit: 'Fresh start, sharp mind',
    propType: 'coin',
    cardBg: '#38BDF8',
    status: 'completed',
    minutesTaken: 15,
  },
  {
    id: 'wd_2',
    dayType: 'weekday',
    time: '6:00 AM',
    startMins: 6 * 60,
    icon: '🚶',
    title: 'Walk',
    posterHeadline: 'STEP INTO POWER!',
    benefit: 'Energy for the whole day',
    propType: 'coin',
    cardBg: '#FB7185',
    status: 'completed',
    minutesTaken: 25,
  },
  {
    id: 'wd_3',
    dayType: 'weekday',
    time: '6:30 AM',
    startMins: 6 * 60 + 30,
    icon: '💪',
    title: 'Gym',
    posterHeadline: 'SWEAT NOW, SHINE LATER!',
    benefit: 'Strong body, strong business',
    propType: 'coin',
    cardBg: '#FACC15',
    status: 'completed',
    minutesTaken: 45,
  },
  {
    id: 'wd_4',
    dayType: 'weekday',
    time: '7:30 AM',
    startMins: 7 * 60 + 30,
    icon: '🚿',
    title: 'Bath and breakfast',
    posterHeadline: 'FRESH AND READY!',
    benefit: 'Clean body, calm mind',
    propType: 'cake',
    cardBg: '#38BDF8',
    status: 'not_started',
  },
  {
    id: 'wd_5',
    dayType: 'weekday',
    time: '8:00 AM',
    startMins: 8 * 60,
    icon: '👨‍👩‍👧',
    title: 'Family time',
    posterHeadline: 'LOVE FUELS EMPIRE!',
    benefit: 'Love gives you strength',
    propType: 'cake',
    cardBg: '#FB7185',
    status: 'not_started',
  },
  {
    id: 'wd_6',
    dayType: 'weekday',
    time: '8:30 AM',
    startMins: 8 * 60 + 30,
    icon: '🚌',
    title: 'Bus plan (1-3-5)',
    posterHeadline: 'WIN THE DAY EARLY!',
    benefit: 'Clear plan saves hours',
    propType: 'phone',
    cardBg: '#FACC15',
    status: 'not_started',
  },
  {
    id: 'wd_7',
    dayType: 'weekday',
    time: '10:00 AM',
    startMins: 10 * 60,
    icon: '💬',
    title: 'Bus customer replies',
    posterHeadline: 'HAPPY CUSTOMERS PAY!',
    benefit: 'Happy customers bring repeat orders',
    propType: 'phone',
    cardBg: '#38BDF8',
    status: 'not_started',
  },
  {
    id: 'wd_8',
    dayType: 'weekday',
    time: '1:00 PM',
    startMins: 13 * 60,
    icon: '🍱',
    title: 'Lunch check orders',
    posterHeadline: 'RUCHITVA BOSS CHECK!',
    benefit: 'Catch problems before they grow',
    propType: 'cake',
    cardBg: '#FB7185',
    status: 'not_started',
  },
  {
    id: 'wd_9',
    dayType: 'weekday',
    time: '5:30 PM',
    startMins: 17 * 60 + 30,
    icon: '🚫',
    title: 'Bus back no reels',
    posterHeadline: 'PHONE DOWN, MONEY UP!',
    benefit: 'Protect your focus and time',
    propType: 'phone',
    cardBg: '#FACC15',
    status: 'not_started',
  },
  {
    id: 'wd_10',
    dayType: 'weekday',
    time: '8:15 PM',
    startMins: 20 * 60 + 15,
    icon: '📊',
    title: "Write today's numbers",
    posterHeadline: 'COUNT YOUR COINS!',
    benefit: 'Numbers show the real picture',
    propType: 'coin',
    cardBg: '#38BDF8',
    status: 'not_started',
  },
  {
    id: 'wd_11',
    dayType: 'weekday',
    time: '9:15 PM',
    startMins: 21 * 60 + 15,
    icon: '🍽️',
    title: 'Dinner with family',
    posterHeadline: 'FAMILY IS REAL WEALTH!',
    benefit: 'Family is your real wealth',
    propType: 'cake',
    cardBg: '#FB7185',
    status: 'not_started',
  },
  {
    id: 'wd_12',
    dayType: 'weekday',
    time: '10:00 PM',
    startMins: 22 * 60,
    icon: '📵',
    title: 'Phone away',
    posterHeadline: 'GOODBYE SCREEN TIME!',
    benefit: 'Calm mind sleeps deeper',
    propType: 'phone',
    cardBg: '#FACC15',
    status: 'not_started',
  },
  {
    id: 'wd_13',
    dayType: 'weekday',
    time: '10:30 PM',
    startMins: 22 * 60 + 30,
    icon: '😴',
    title: 'Sleep',
    posterHeadline: 'SLEEP LIKE A KING!',
    benefit: "Rest builds tomorrow's success",
    propType: 'coin',
    cardBg: '#38BDF8',
    status: 'not_started',
  },

  // SATURDAY
  {
    id: 'sat_1',
    dayType: 'saturday',
    time: '6:00 AM',
    startMins: 6 * 60,
    icon: '💪',
    title: 'Walk and gym',
    posterHeadline: 'SWEAT NOW, SHINE LATER!',
    benefit: 'Strong body builds strong empire',
    propType: 'coin',
    cardBg: '#FACC15',
    status: 'completed',
    minutesTaken: 45,
  },
  {
    id: 'sat_2',
    dayType: 'saturday',
    time: '8:00 AM',
    startMins: 8 * 60,
    icon: '👨‍👩‍👧',
    title: 'Family breakfast',
    posterHeadline: 'MORNING SMILES WIN!',
    benefit: 'Morning smiles start great weekends',
    propType: 'cake',
    cardBg: '#FB7185',
    status: 'completed',
    minutesTaken: 30,
  },
  {
    id: 'sat_3',
    dayType: 'saturday',
    time: '9:30 AM',
    startMins: 9 * 60 + 30,
    icon: '🏪',
    title: 'Shutter work',
    posterHeadline: 'OPEN MORE BRANCHES!',
    benefit: 'New branches grow your wealth',
    propType: 'coin',
    cardBg: '#38BDF8',
    status: 'not_started',
  },
  {
    id: 'sat_4',
    dayType: 'saturday',
    time: '12:30 PM',
    startMins: 12 * 60 + 30,
    icon: '🍲',
    title: 'Kitchen quality check',
    posterHeadline: 'TASTE IS KING!',
    benefit: 'Great taste wins loyal customers',
    propType: 'cake',
    cardBg: '#FACC15',
    status: 'not_started',
  },
  {
    id: 'sat_5',
    dayType: 'saturday',
    time: '4:00 PM',
    startMins: 16 * 60,
    icon: '📦',
    title: 'Stock and vendors',
    posterHeadline: 'SMART BUY, BIG PROFIT!',
    benefit: 'Smart buying increases weekly profit',
    propType: 'coin',
    cardBg: '#FB7185',
    status: 'not_started',
  },
  {
    id: 'sat_6',
    dayType: 'saturday',
    time: '7:30 PM',
    startMins: 19 * 60 + 30,
    icon: '🚀',
    title: 'Next branch plan',
    posterHeadline: 'SIX BRANCH EMPIRE!',
    benefit: 'Big vision creates six branches',
    propType: 'phone',
    cardBg: '#38BDF8',
    status: 'not_started',
  },
  {
    id: 'sat_7',
    dayType: 'saturday',
    time: '9:15 PM',
    startMins: 21 * 60 + 15,
    icon: '🍽️',
    title: 'Dinner with family',
    posterHeadline: 'FAMILY IS REAL WEALTH!',
    benefit: 'Family is your real wealth',
    propType: 'cake',
    cardBg: '#FB7185',
    status: 'not_started',
  },
  {
    id: 'sat_8',
    dayType: 'saturday',
    time: '10:00 PM',
    startMins: 22 * 60,
    icon: '📵',
    title: 'Phone away',
    posterHeadline: 'PHONE DOWN, MONEY UP!',
    benefit: 'Calm mind sleeps deeper',
    propType: 'phone',
    cardBg: '#FACC15',
    status: 'not_started',
  },

  // SUNDAY
  {
    id: 'sun_1',
    dayType: 'sunday',
    time: '7:00 AM',
    startMins: 7 * 60,
    icon: '🌅',
    title: 'Slow morning walk',
    posterHeadline: 'RISE AND SHINE!',
    benefit: 'Peaceful mornings recharge your soul',
    propType: 'coin',
    cardBg: '#38BDF8',
    status: 'completed',
    minutesTaken: 40,
  },
  {
    id: 'sun_2',
    dayType: 'sunday',
    time: '9:30 AM',
    startMins: 9 * 60 + 30,
    icon: '👨‍👩‍👧',
    title: 'Family fun time',
    posterHeadline: 'HAPPY HOME WINS!',
    benefit: 'Happy home fuels every dream',
    propType: 'cake',
    cardBg: '#FB7185',
    status: 'not_started',
  },
  {
    id: 'sun_3',
    dayType: 'sunday',
    time: '1:00 PM',
    startMins: 13 * 60,
    icon: '🍛',
    title: 'Special family lunch',
    posterHeadline: 'SUNDAY ROYAL FEAST!',
    benefit: 'Good food brings hearts together',
    propType: 'cake',
    cardBg: '#FACC15',
    status: 'not_started',
  },
  {
    id: 'sun_4',
    dayType: 'sunday',
    time: '5:00 PM',
    startMins: 17 * 60,
    icon: '📈',
    title: 'Weekly review',
    posterHeadline: 'COUNT YOUR COINS!',
    benefit: 'Weekly review makes next week',
    propType: 'coin',
    cardBg: '#38BDF8',
    status: 'not_started',
  },
  {
    id: 'sun_5',
    dayType: 'sunday',
    time: '7:30 PM',
    startMins: 19 * 60 + 30,
    icon: '🎬',
    title: 'Film and rest',
    posterHeadline: 'CINEMA DREAM ALIVE!',
    benefit: 'Great stories inspire your film',
    propType: 'phone',
    cardBg: '#FB7185',
    status: 'not_started',
  },
  {
    id: 'sun_6',
    dayType: 'sunday',
    time: '9:30 PM',
    startMins: 21 * 60 + 30,
    icon: '🙏',
    title: 'Gratitude time',
    posterHeadline: 'COUNT YOUR BLESSINGS!',
    benefit: 'Grateful hearts attract more blessings',
    propType: 'coin',
    cardBg: '#FACC15',
    status: 'not_started',
  },
  {
    id: 'sun_7',
    dayType: 'sunday',
    time: '10:00 PM',
    startMins: 22 * 60,
    icon: '📵',
    title: 'Phone away',
    posterHeadline: 'PHONE DOWN, MONEY UP!',
    benefit: 'Calm mind sleeps deeper',
    propType: 'phone',
    cardBg: '#38BDF8',
    status: 'not_started',
  },
];

export const INITIAL_DREAMS: DreamCardItem[] = [
  {
    id: 'dream_branches',
    emoji: '🏪',
    title: '6 Branches',
    daysLeft: 240,
    progressPct: 35,
    achieved: false,
    tapCount: 4,
    imageUrl: '/src/assets/images/dream_cloud_kitchen_1794797321463.jpg',
    affirmation: '6 Ruchitva branches are thriving!',
  },
  {
    id: 'dream_loans',
    emoji: '💳',
    title: 'Loan Free',
    daysLeft: 180,
    progressPct: 55,
    achieved: false,
    tapCount: 5,
    imageUrl: '/src/assets/images/dream_wealth_portfolio_1794797321389.jpg',
    affirmation: 'I am 100% debt free!',
  },
  {
    id: 'dream_home',
    emoji: '🏠',
    title: 'Home or Plot',
    daysLeft: 365,
    progressPct: 60,
    achieved: false,
    tapCount: 6,
    imageUrl: '/src/assets/images/dream_luxury_house_1794797319148.jpg',
    affirmation: 'We own our family home!',
  },
  {
    id: 'dream_car',
    emoji: '🚗',
    title: 'Dream Car',
    daysLeft: 300,
    progressPct: 45,
    achieved: false,
    tapCount: 3,
    imageUrl: '',
    affirmation: 'We drive our new car!',
  },
  {
    id: 'dream_gold',
    emoji: '🪙',
    title: 'Gold',
    daysLeft: 120,
    progressPct: 70,
    achieved: false,
    tapCount: 7,
    imageUrl: '',
    affirmation: 'Gold blesses our happy home!',
  },
  {
    id: 'dream_trip',
    emoji: '✈️',
    title: 'Foreign Trip',
    daysLeft: 420,
    progressPct: 30,
    achieved: false,
    tapCount: 2,
    imageUrl: '',
    affirmation: 'We travel the world happily!',
  },
  {
    id: 'dream_film',
    emoji: '🎬',
    title: 'My Film',
    daysLeft: 500,
    progressPct: 25,
    achieved: false,
    tapCount: 5,
    imageUrl: '',
    affirmation: 'My film shines on screen!',
  },
];

export const INITIAL_LOANS: LoanMountainItem[] = [
  {
    id: 'loan_moneyview',
    name: 'MoneyView',
    totalAmount: 200000,
    remainingAmount: 95000,
    stepPayAmount: 10000,
    emoji: '🏔️',
  },
  {
    id: 'loan_lt',
    name: 'L&T',
    totalAmount: 180000,
    remainingAmount: 80000,
    stepPayAmount: 10000,
    emoji: '⛰️',
  },
  {
    id: 'loan_personal',
    name: 'Personal',
    totalAmount: 250000,
    remainingAmount: 110000,
    stepPayAmount: 15000,
    emoji: '🗻',
  },
  {
    id: 'loan_chit',
    name: 'Chit',
    totalAmount: 300000,
    remainingAmount: 120000,
    stepPayAmount: 15000,
    emoji: '🌋',
  },
];

export const INITIAL_BADGES: BadgeItem[] = [
  { id: 'b_sunrise', emoji: '🌅', title: '5:30 Hero', unlocked: true },
  { id: 'b_noreels', emoji: '🚫', title: 'No Reels', unlocked: true },
  { id: 'b_kitchen', emoji: '🍱', title: 'Chef King', unlocked: true },
  { id: 'b_loan', emoji: '⛏️', title: 'Loan Crusher', unlocked: true },
  { id: 'b_focus', emoji: '🎯', title: 'Laser Focus', unlocked: false },
  { id: 'b_empire', emoji: '👑', title: '6 Branches', unlocked: false },
];

export function getLevelDetails(xp: number): {
  level: number;
  name: string;
  emoji: string;
  progressPct: number;
  nextXp: number;
} {
  const levels = [
    { level: 1, name: 'Seed', emoji: '🌱', min: 0, max: 200 },
    { level: 2, name: 'Sprout', emoji: '🌿', min: 200, max: 500 },
    { level: 3, name: 'Tree', emoji: '🌳', min: 500, max: 900 },
    { level: 4, name: 'Forest', emoji: '🌲', min: 900, max: 1500 },
    { level: 5, name: 'Empire', emoji: '👑', min: 1500, max: 5000 },
  ];

  const found =
    levels.find((l) => xp >= l.min && xp < l.max) || levels[levels.length - 1];
  const span = Math.max(1, found.max - found.min);
  const progressPct = Math.min(
    100,
    Math.max(5, Math.round(((xp - found.min) / span) * 100))
  );

  return {
    level: found.level,
    name: found.name,
    emoji: found.emoji,
    progressPct,
    nextXp: found.max,
  };
}

export function formatShortINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
}

// Type and Data Exports for Today, Focus, Dreams, Money, and Me screens
export type DayMode = DayPlanType;
export type TaskStatus = TaskState;

export interface FocusRuleTask {
  id: string;
  tier: '1-big' | '3-medium' | '5-small';
  title: string;
  done: boolean;
}

export interface LoanMountain {
  id: string;
  emoji: string;
  title: string;
  totalSteps: number;
  paidSteps: number;
}

export interface WeeklyMoneyRecord {
  id: string;
  weekLabel: string;
  sales: number;
  expenses: number;
}

export interface GratitudeEntry {
  id: string;
  text: string;
  date: string;
}

export const MANIFESTATION_LINES = DAILY_MANIFESTATIONS;

export const WEEKDAY_TASKS: DailyTask[] = INITIAL_TASKS.filter(
  (t) => t.dayType === 'weekday'
);
export const SATURDAY_TASKS: DailyTask[] = INITIAL_TASKS.filter(
  (t) => t.dayType === 'saturday'
);
export const SUNDAY_TASKS: DailyTask[] = INITIAL_TASKS.filter(
  (t) => t.dayType === 'sunday'
);

export const INITIAL_FOCUS_RULES: FocusRuleTask[] = [
  {
    id: 'fr_1',
    tier: '1-big',
    title: 'Finalize Branch #3 Kitchen Lease',
    done: false,
  },
  {
    id: 'fr_2',
    tier: '3-medium',
    title: 'Review Ruchitva Swiggy & Zomato Ratings',
    done: true,
  },
  {
    id: 'fr_3',
    tier: '3-medium',
    title: 'Check Daily Packaging & Spice Stock',
    done: false,
  },
  {
    id: 'fr_4',
    tier: '5-small',
    title: 'Reply to 5 VIP Customer Messages',
    done: false,
  },
];

export const INITIAL_LOAN_MOUNTAINS: LoanMountain[] = [
  {
    id: 'lm_1',
    emoji: '🏔️',
    title: 'MoneyView Loan',
    totalSteps: 12,
    paidSteps: 6,
  },
  {
    id: 'lm_2',
    emoji: '⛰️',
    title: 'L&T Kitchen Loan',
    totalSteps: 10,
    paidSteps: 5,
  },
  {
    id: 'lm_3',
    emoji: '🌋',
    title: 'Personal & Chit',
    totalSteps: 15,
    paidSteps: 7,
  },
];

export const INITIAL_WEEKLY_MONEY: WeeklyMoneyRecord[] = [
  { id: 'wm_1', weekLabel: 'Week 1', sales: 54000, expenses: 31000 },
  { id: 'wm_2', weekLabel: 'Week 2', sales: 62000, expenses: 33000 },
  { id: 'wm_3', weekLabel: 'Week 3', sales: 68500, expenses: 34500 },
];

export const INITIAL_GRATITUDE: GratitudeEntry[] = [
  {
    id: 'gr_1',
    text: 'Ruchitva crossed 4.8 stars with happy customer reviews!',
    date: 'Yesterday',
  },
  {
    id: 'gr_2',
    text: 'Peaceful morning walk and healthy family breakfast.',
    date: '2 days ago',
  },
];

