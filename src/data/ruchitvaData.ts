export type DayPlanType = 'weekday' | 'saturday' | 'sunday';
export type DayMode = DayPlanType;
export type TaskState = 'not_started' | 'processing' | 'completed' | 'cancelled';
export type TaskStatus = TaskState;
export type TimeThemeMode = 'morning' | 'evening' | 'night';

export type DreamFilterCategory =
  | 'All'
  | 'Car'
  | 'Trip'
  | 'Home'
  | 'Gold'
  | 'Film'
  | 'Business';

export type DreamItemCategory = Exclude<DreamFilterCategory, 'All'>;

export interface DailyTask {
  id: string;
  dayType: DayPlanType;
  time: string;
  startMins: number;
  icon: string;
  title: string;
  benefit: string;
  pastelTone: 'peach' | 'mint' | 'lavender' | 'sky';
  illustrationVariant: 'calm' | 'sun' | 'moon' | 'coin' | 'sprout';
  status: TaskState;
  startedAt?: number;
  minutesTaken?: number;
  rescheduledTo?: string;
}

export interface MustDoBoxItem {
  id: string;
  boxNumber: 1 | 2 | 3;
  text: string;
  done: boolean;
  pastelTone: 'peach' | 'lavender' | 'sky';
  reminderAtMs?: number;
  reminderLabel?: string;
  reminderTriggered?: boolean;
  carryOverText?: string;
}

export interface DreamCardItem {
  id: string;
  title: string;
  category: DreamItemCategory;
  targetDate: string; // YYYY-MM-DD
  progressPct: number;
  achieved: boolean;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface MoneyStateData {
  loansLeft: number;
  saved: number;
  profit: number;
  ordersToday?: number;
  ordersWeek?: number;
  ordersMonth?: number;
  weeklyBars: { day: string; pct: number; color: string }[];
}

export interface MonthlyOrderPlan {
  monthName: string;
  dailyTarget: number;
  weeklyTarget: number;
  monthlyTarget: number;
  monthlySaveTarget: number;
  monthlySaveLabel: string;
}

// 8 NEON MANIFESTATION COLOURS (by card order, then repeat)
export const NEON_MANIFESTATION_COLOURS: string[] = [
  '#FF2EC4', // 1. Neon pink
  '#39FF14', // 2. Neon green
  '#00F0FF', // 3. Neon cyan
  '#FFF200', // 4. Neon yellow
  '#FF6A00', // 5. Neon orange
  '#B026FF', // 6. Neon purple
  '#CCFF00', // 7. Neon lime
  '#1F51FF', // 8. Neon blue
];

export function getMonthlyOrderPlan(date: Date = new Date()): MonthlyOrderPlan {
  const m = date.getMonth();
  switch (m) {
    case 0:
      return {
        monthName: 'Jan',
        dailyTarget: 35,
        weeklyTarget: 210,
        monthlyTarget: 910,
        monthlySaveTarget: 30000,
        monthlySaveLabel: 'save 30k',
      };
    case 1:
      return {
        monthName: 'Feb',
        dailyTarget: 45,
        weeklyTarget: 270,
        monthlyTarget: 1170,
        monthlySaveTarget: 51000,
        monthlySaveLabel: 'save 51k',
      };
    case 2:
      return {
        monthName: 'Mar',
        dailyTarget: 55,
        weeklyTarget: 330,
        monthlyTarget: 1430,
        monthlySaveTarget: 72000,
        monthlySaveLabel: 'save 72k',
      };
    case 3:
      return {
        monthName: 'Apr',
        dailyTarget: 65,
        weeklyTarget: 390,
        monthlyTarget: 1690,
        monthlySaveTarget: 94000,
        monthlySaveLabel: 'save 94k',
      };
    case 4:
      return {
        monthName: 'May',
        dailyTarget: 75,
        weeklyTarget: 450,
        monthlyTarget: 1950,
        monthlySaveTarget: 115000,
        monthlySaveLabel: 'save 1.15L',
      };
    case 5:
      return {
        monthName: 'Jun',
        dailyTarget: 85,
        weeklyTarget: 510,
        monthlyTarget: 2210,
        monthlySaveTarget: 136000,
        monthlySaveLabel: 'save 1.36L',
      };
    default:
      return {
        monthName: 'Dec',
        dailyTarget: 25,
        weeklyTarget: 150,
        monthlyTarget: 650,
        monthlySaveTarget: 8000,
        monthlySaveLabel: 'save 8k',
      };
  }
}

export function getDaysLeftToJune2027(now: Date = new Date()): number {
  const target = new Date('2027-06-30T23:59:59');
  const diffMs = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / 86400000));
}

export function getDaysLeftForDate(targetDateStr: string): number {
  if (!targetDateStr) return 180;
  const target = new Date(`${targetDateStr}T23:59:59`);
  if (isNaN(target.getTime())) return 180;
  const diffMs = target.getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / 86400000));
}

// Morning: 5 am to 5 pm, Evening: 5 pm to 8 pm, Night: 8 pm to 5 am
export function getThemeByHour(hour: number): TimeThemeMode {
  if (hour >= 5 && hour < 17) return 'morning';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

export interface ManifestationCardItem {
  id: string;
  category: 'Business' | 'Money' | 'Home and family' | 'Dreams' | 'Self';
  line: string;
  symbol: 'sun' | 'star' | 'lotus';
}

export const MANIFESTATION_CARDS: ManifestationCardItem[] = [
  // Business
  {
    id: 'm_1',
    category: 'Business',
    line: 'Ruchitva grows every single day.',
    symbol: 'sun',
  },
  {
    id: 'm_2',
    category: 'Business',
    line: 'Branch 2 is full of happy customers.',
    symbol: 'star',
  },
  {
    id: 'm_3',
    category: 'Business',
    line: 'I open Ruchitva branch after branch.',
    symbol: 'lotus',
  },
  {
    id: 'm_4',
    category: 'Business',
    line: 'Ruchitva reaches 6 branches.',
    symbol: 'sun',
  },
  {
    id: 'm_5',
    category: 'Business',
    line: 'Customers love my food and return.',
    symbol: 'lotus',
  },
  {
    id: 'm_6',
    category: 'Business',
    line: 'My team works with pride and joy.',
    symbol: 'star',
  },
  // Money
  {
    id: 'm_7',
    category: 'Money',
    line: 'Money flows to me easily.',
    symbol: 'sun',
  },
  {
    id: 'm_8',
    category: 'Money',
    line: 'I am free from every loan.',
    symbol: 'lotus',
  },
  {
    id: 'm_9',
    category: 'Money',
    line: 'My savings grow every month.',
    symbol: 'star',
  },
  {
    id: 'm_10',
    category: 'Money',
    line: 'I make smart money decisions.',
    symbol: 'sun',
  },
  {
    id: 'm_11',
    category: 'Money',
    line: 'I am becoming wealthy and free.',
    symbol: 'star',
  },
  // Home and family
  {
    id: 'm_12',
    category: 'Home and family',
    line: 'I own my beautiful home.',
    symbol: 'lotus',
  },
  {
    id: 'm_13',
    category: 'Home and family',
    line: 'My family is safe and happy.',
    symbol: 'sun',
  },
  {
    id: 'm_14',
    category: 'Home and family',
    line: 'I give my son a great future.',
    symbol: 'star',
  },
  // Dreams
  {
    id: 'm_15',
    category: 'Dreams',
    line: 'I drive my dream car.',
    symbol: 'star',
  },
  {
    id: 'm_16',
    category: 'Dreams',
    line: 'I travel the world with my family.',
    symbol: 'sun',
  },
  {
    id: 'm_17',
    category: 'Dreams',
    line: 'My own film is shining on screen.',
    symbol: 'star',
  },
  {
    id: 'm_18',
    category: 'Dreams',
    line: 'My second brand is a big success.',
    symbol: 'lotus',
  },
  // Self
  {
    id: 'm_19',
    category: 'Self',
    line: 'I am disciplined, strong and focused.',
    symbol: 'sun',
  },
  {
    id: 'm_20',
    category: 'Self',
    line: 'Every day I move closer to my goals.',
    symbol: 'star',
  },
  {
    id: 'm_21',
    category: 'Self',
    line: 'I choose focus over distraction.',
    symbol: 'lotus',
  },
  {
    id: 'm_22',
    category: 'Self',
    line: 'I am grateful for everything I have.',
    symbol: 'lotus',
  },
  {
    id: 'm_23',
    category: 'Self',
    line: 'I am already receiving this.',
    symbol: 'sun',
  },
];

export const FOCUS_QUOTES: string[] = [
  'Calm focus builds your empire.',
  'One quiet step at a time.',
  'Breathe deeply and stay present.',
  'Peaceful mind creates lasting wealth.',
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
    quote: 'Wealth is what you do not spend.',
    author: 'Morgan Housel',
  },
  {
    quote: 'Stay the course and let time compound.',
    author: 'John Bogle',
  },
];

export const INITIAL_MUST_DOS: MustDoBoxItem[] = [
  {
    id: 'md_1',
    boxNumber: 1,
    text: 'Check Branch 2 kitchen stock',
    done: false,
    pastelTone: 'peach',
  },
  {
    id: 'md_2',
    boxNumber: 2,
    text: 'Reply to top customer reviews',
    done: false,
    pastelTone: 'lavender',
  },
  {
    id: 'md_3',
    boxNumber: 3,
    text: 'Save daily kitchen profit',
    done: false,
    pastelTone: 'sky',
    carryOverText: 'Call packaging vendor today',
  },
];

export const INITIAL_TASKS: DailyTask[] = [
  // WEEKDAY (13 tasks with exact titles & 5-word benefits)
  {
    id: 'wd_1',
    dayType: 'weekday',
    time: '5:30 AM',
    startMins: 5 * 60 + 30,
    icon: '🪥',
    title: 'Brush and shave',
    benefit: 'Fresh start, sharp mind',
    pastelTone: 'peach',
    illustrationVariant: 'sun',
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
    benefit: 'Energy for the whole day',
    pastelTone: 'mint',
    illustrationVariant: 'sprout',
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
    benefit: 'Strong body, strong business',
    pastelTone: 'lavender',
    illustrationVariant: 'calm',
    status: 'completed',
    minutesTaken: 40,
  },
  {
    id: 'wd_4',
    dayType: 'weekday',
    time: '7:30 AM',
    startMins: 7 * 60 + 30,
    icon: '🚿',
    title: 'Bath and breakfast',
    benefit: 'Clean body, calm mind',
    pastelTone: 'sky',
    illustrationVariant: 'sun',
    status: 'not_started',
  },
  {
    id: 'wd_5',
    dayType: 'weekday',
    time: '8:00 AM',
    startMins: 8 * 60,
    icon: '👨‍👩‍👧',
    title: 'Family time',
    benefit: 'Love gives you strength',
    pastelTone: 'peach',
    illustrationVariant: 'calm',
    status: 'not_started',
  },
  {
    id: 'wd_6',
    dayType: 'weekday',
    time: '8:30 AM',
    startMins: 8 * 60 + 30,
    icon: '🚌',
    title: 'Bus plan',
    benefit: 'Clear plan saves hours',
    pastelTone: 'mint',
    illustrationVariant: 'sprout',
    status: 'not_started',
  },
  {
    id: 'wd_7',
    dayType: 'weekday',
    time: '10:00 AM',
    startMins: 10 * 60,
    icon: '💬',
    title: 'Customer replies',
    benefit: 'Happy customers bring repeat orders',
    pastelTone: 'lavender',
    illustrationVariant: 'coin',
    status: 'not_started',
  },
  {
    id: 'wd_8',
    dayType: 'weekday',
    time: '1:00 PM',
    startMins: 13 * 60,
    icon: '🍱',
    title: 'Lunch, check orders',
    benefit: 'Catch problems before they grow',
    pastelTone: 'peach',
    illustrationVariant: 'sun',
    status: 'not_started',
  },
  {
    id: 'wd_9',
    dayType: 'weekday',
    time: '5:30 PM',
    startMins: 17 * 60 + 30,
    icon: '🚫',
    title: 'Bus back, no reels',
    benefit: 'Protect your focus and time',
    pastelTone: 'sky',
    illustrationVariant: 'calm',
    status: 'not_started',
  },
  {
    id: 'wd_10',
    dayType: 'weekday',
    time: '8:15 PM',
    startMins: 20 * 60 + 15,
    icon: '📊',
    title: 'Write numbers',
    benefit: 'Numbers show the real picture',
    pastelTone: 'mint',
    illustrationVariant: 'coin',
    status: 'not_started',
  },
  {
    id: 'wd_11',
    dayType: 'weekday',
    time: '9:15 PM',
    startMins: 21 * 60 + 15,
    icon: '🍽️',
    title: 'Dinner with family',
    benefit: 'Family is your real wealth',
    pastelTone: 'peach',
    illustrationVariant: 'calm',
    status: 'not_started',
  },
  {
    id: 'wd_12',
    dayType: 'weekday',
    time: '10:00 PM',
    startMins: 22 * 60,
    icon: '📵',
    title: 'Phone away',
    benefit: 'Calm mind sleeps deeper',
    pastelTone: 'lavender',
    illustrationVariant: 'moon',
    status: 'not_started',
  },
  {
    id: 'wd_13',
    dayType: 'weekday',
    time: '10:30 PM',
    startMins: 22 * 60 + 30,
    icon: '😴',
    title: 'Sleep',
    benefit: "Rest builds tomorrow's success",
    pastelTone: 'sky',
    illustrationVariant: 'moon',
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
    benefit: 'Strong body builds strong empire',
    pastelTone: 'mint',
    illustrationVariant: 'sun',
    status: 'completed',
    minutesTaken: 40,
  },
  {
    id: 'sat_2',
    dayType: 'saturday',
    time: '8:00 AM',
    startMins: 8 * 60,
    icon: '👨‍👩‍👧',
    title: 'Family breakfast',
    benefit: 'Morning smiles start great weekends',
    pastelTone: 'peach',
    illustrationVariant: 'calm',
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
    benefit: 'New branches grow your wealth',
    pastelTone: 'lavender',
    illustrationVariant: 'coin',
    status: 'not_started',
  },
  {
    id: 'sat_4',
    dayType: 'saturday',
    time: '12:30 PM',
    startMins: 12 * 60 + 30,
    icon: '🍲',
    title: 'Kitchen quality check',
    benefit: 'Great taste wins loyal customers',
    pastelTone: 'sky',
    illustrationVariant: 'sprout',
    status: 'not_started',
  },
  {
    id: 'sat_5',
    dayType: 'saturday',
    time: '4:00 PM',
    startMins: 16 * 60,
    icon: '📦',
    title: 'Vendor stock check',
    benefit: 'Smart buying increases weekly profit',
    pastelTone: 'mint',
    illustrationVariant: 'coin',
    status: 'not_started',
  },
  {
    id: 'sat_6',
    dayType: 'saturday',
    time: '9:00 PM',
    startMins: 21 * 60,
    icon: '🍽️',
    title: 'Dinner with family',
    benefit: 'Family is your real wealth',
    pastelTone: 'peach',
    illustrationVariant: 'moon',
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
    benefit: 'Peaceful mornings recharge your soul',
    pastelTone: 'mint',
    illustrationVariant: 'sun',
    status: 'completed',
    minutesTaken: 35,
  },
  {
    id: 'sun_2',
    dayType: 'sunday',
    time: '9:30 AM',
    startMins: 9 * 60 + 30,
    icon: '👨‍👩‍👧',
    title: 'Family fun time',
    benefit: 'Happy home fuels every dream',
    pastelTone: 'peach',
    illustrationVariant: 'calm',
    status: 'not_started',
  },
  {
    id: 'sun_3',
    dayType: 'sunday',
    time: '1:00 PM',
    startMins: 13 * 60,
    icon: '🍛',
    title: 'Special family lunch',
    benefit: 'Good food brings hearts together',
    pastelTone: 'lavender',
    illustrationVariant: 'sprout',
    status: 'not_started',
  },
  {
    id: 'sun_4',
    dayType: 'sunday',
    time: '5:00 PM',
    startMins: 17 * 60,
    icon: '📈',
    title: 'Weekly review',
    benefit: 'Weekly review makes next week',
    pastelTone: 'sky',
    illustrationVariant: 'coin',
    status: 'not_started',
  },
  {
    id: 'sun_5',
    dayType: 'sunday',
    time: '9:30 PM',
    startMins: 21 * 60 + 30,
    icon: '😴',
    title: 'Early rest',
    benefit: "Rest builds tomorrow's success",
    pastelTone: 'lavender',
    illustrationVariant: 'moon',
    status: 'not_started',
  },
];

export const WEEKDAY_TASKS: DailyTask[] = INITIAL_TASKS.filter(
  (t) => t.dayType === 'weekday'
);
export const SATURDAY_TASKS: DailyTask[] = INITIAL_TASKS.filter(
  (t) => t.dayType === 'saturday'
);
export const SUNDAY_TASKS: DailyTask[] = INITIAL_TASKS.filter(
  (t) => t.dayType === 'sunday'
);

// START WITH THESE 7 EMPTY DREAM CARDS (NO stock or AI images — user uploads manually!)
// Car, Foreign Trip, Home or Plot, Gold, My Film, 6 Branches, Loan Free
export const INITIAL_DREAMS: DreamCardItem[] = [
  {
    id: 'dream_car',
    title: 'Car',
    category: 'Car',
    targetDate: '2027-08-15',
    progressPct: 35,
    achieved: false,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  },
  {
    id: 'dream_trip',
    title: 'Foreign Trip',
    category: 'Trip',
    targetDate: '2027-12-20',
    progressPct: 25,
    achieved: false,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  },
  {
    id: 'dream_home',
    title: 'Home or Plot',
    category: 'Home',
    targetDate: '2027-10-10',
    progressPct: 50,
    achieved: false,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  },
  {
    id: 'dream_gold',
    title: 'Gold',
    category: 'Gold',
    targetDate: '2027-05-01',
    progressPct: 65,
    achieved: false,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  },
  {
    id: 'dream_film',
    title: 'My Film',
    category: 'Film',
    targetDate: '2028-01-15',
    progressPct: 20,
    achieved: false,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  },
  {
    id: 'dream_branches',
    title: '6 Branches',
    category: 'Business',
    targetDate: '2027-06-30',
    progressPct: 45,
    achieved: false,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  },
  {
    id: 'dream_loan_free',
    title: 'Loan Free',
    category: 'Business',
    targetDate: '2027-04-30',
    progressPct: 60,
    achieved: false,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  },
];

export const INITIAL_MONEY_STATE: MoneyStateData = {
  loansLeft: 405000,
  saved: 0,
  profit: 34000,
  ordersToday: 25,
  ordersWeek: 110,
  ordersMonth: 420,
  weeklyBars: [
    { day: 'M', pct: 55, color: '#FDECE4' },
    { day: 'T', pct: 68, color: '#E3F6EE' },
    { day: 'W', pct: 62, color: '#EEEAFB' },
    { day: 'T', pct: 78, color: '#E6F4FE' },
    { day: 'F', pct: 85, color: '#D9F2F0' },
    { day: 'S', pct: 94, color: '#FDECE4' },
    { day: 'S', pct: 88, color: '#E3F6EE' },
  ],
};

export function formatShortINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
}
