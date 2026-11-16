import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  UserProfile,
  GoalItem,
  MissionItem,
  HabitLog,
  FinanceItem,
  DailyReviewItem,
  AchievementItem,
  AIChatMessage,
  calculateLevelFromXP,
} from '../types/lifeos';

// Blueprint validation constants
const ID_REGEX = /^[a-zA-Z0-9_-]+$/;

function sanitizeId(rawId?: string): string {
  if (rawId && ID_REGEX.test(rawId) && rawId.length <= 128) {
    return rawId;
  }
  return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function clampStr(val: string | undefined | null, min: number, max: number, fallback = ''): string {
  const clean = (val ?? fallback).trim();
  if (clean.length < min) {
    return fallback.slice(0, max);
  }
  return clean.slice(0, max);
}

function clampInt(val: number | undefined | null, min: number, max: number): number {
  const num = Math.round(Number(val) || 0);
  return Math.max(min, Math.min(max, num));
}

function clampNum(val: number | undefined | null, min: number, max: number): number {
  const num = Number(val) || 0;
  return Math.max(min, Math.min(max, num));
}

export function getInitialSeedData(uid: string, displayName: string) {
  const todayStr = new Date().toISOString().split('T')[0];

  const userProfile: UserProfile = {
    uid,
    displayName: clampStr(displayName, 1, 100, 'Founder'),
    xp: 1350,
    level: 6,
    levelTitle: 'Builder',
    lifeScore: 82,
    healthScore: 78,
    focusScore: 86,
    streakDays: 12,
    mainDream: 'Grow Ruchitva Kitchen into multiple branches & achieve complete financial freedom',
  };

  const goals: GoalItem[] = [
    {
      id: 'goal_ruchitva_branches',
      userId: uid,
      title: 'Business Expansion: Ruchitva Kitchen',
      category: 'Business',
      targetLabel: '5 Profitable Cloud Kitchen Branches',
      targetValue: 5000000,
      currentValue: 1750000,
      progressPct: 35,
      timeline: 'Dec 2027',
      notes: 'Standardize signature menu SOPs, unit economics, and high-margin festive catering.',
    },
    {
      id: 'goal_dream_house',
      userId: uid,
      title: 'Dream House Residence',
      category: 'House',
      targetLabel: '₹1.5 Cr Modern Debt-Free Home',
      targetValue: 15000000,
      currentValue: 9000000,
      progressPct: 60,
      timeline: 'Jun 2028',
      notes: 'Dedicated capital reserve growing via business profits and index equity SIPs.',
    },
    {
      id: 'goal_wealth_portfolio',
      userId: uid,
      title: 'Financial Freedom Corpus',
      category: 'Investment',
      targetLabel: '₹1 Cr Compounding Investment Portfolio',
      targetValue: 10000000,
      currentValue: 4200000,
      progressPct: 42,
      timeline: 'Dec 2029',
      notes: 'Equity index funds, commercial kitchen equipment equity, and sovereign gold bonds.',
    },
    {
      id: 'goal_peak_vitality',
      userId: uid,
      title: 'Executive Stamina & Strength',
      category: 'Health',
      targetLabel: '14% Body Fat & 7.5h Restorative Sleep',
      targetValue: 100,
      currentValue: 78,
      progressPct: 78,
      timeline: 'Ongoing Daily',
      notes: '45 mins morning strength training before opening kitchen operations.',
    },
    {
      id: 'goal_family_legacy',
      userId: uid,
      title: 'Family Security & Quality Time',
      category: 'Family',
      targetLabel: 'Unplugged Sunday Dinners & Education Fund',
      targetValue: 2500000,
      currentValue: 1625000,
      progressPct: 65,
      timeline: 'Dec 2027',
      notes: 'Zero phone distractions during family hours from 8:00 PM to 9:30 PM.',
    },
  ];

  const missions: MissionItem[] = [
    {
      id: 'mission_ruchitva_poster',
      userId: uid,
      title: 'Create Ruchitva food poster & weekend combo campaign',
      description: 'Design high-converting visual menu poster for signature combos and broadcast to top 150 repeat customers.',
      category: 'Business',
      status: 'Started',
      priority: 'Critical',
      connectedDream: 'Grow Ruchitva Kitchen into multiple branches',
      moneyImpact: 'High',
      dreamImpact: 90,
      estimatedMinutes: 45,
      actualMinutes: 15,
      startTime: '09:00 AM',
      completionTime: '',
      notes: 'Highlight festive family combo margins and direct ordering link.',
      aiSuggestion: 'Focus on high-margin signature dishes and send direct WhatsApp VIP broadcast before 11:30 AM lunch peak.',
    },
    {
      id: 'mission_customer_outreach',
      userId: uid,
      title: 'Contact 15 corporate & bulk catering clients',
      description: 'Follow up with local offices for recurring weekly lunch box subscriptions.',
      category: 'Business',
      status: 'Not Started',
      priority: 'High',
      connectedDream: 'Grow Ruchitva Kitchen into multiple branches',
      moneyImpact: 'High',
      dreamImpact: 85,
      estimatedMinutes: 40,
      actualMinutes: 0,
      startTime: '11:00 AM',
      completionTime: '',
      notes: 'Offer 10% trial discount on first 20-plate corporate order.',
      aiSuggestion: 'Pitch predictable monthly billing and punctual delivery guarantees to office managers.',
    },
    {
      id: 'mission_review_expenses',
      userId: uid,
      title: 'Audit raw material & packaging vendor margins',
      description: 'Compare wholesale spice, oil, and eco-packaging invoices to cut unit food cost by 4%.',
      category: 'Money',
      status: 'Processing',
      priority: 'High',
      connectedDream: 'Financial Freedom Corpus',
      moneyImpact: 'High',
      dreamImpact: 80,
      estimatedMinutes: 30,
      actualMinutes: 10,
      startTime: '02:30 PM',
      completionTime: '',
      notes: 'Lock in quarterly bulk rate with primary packaging supplier.',
      aiSuggestion: 'Saving 4% on packaging and oil directly adds ₹12,000+ monthly net profit.',
    },
    {
      id: 'mission_morning_workout',
      userId: uid,
      title: '45-Min Morning Strength & Mobility Protocol',
      description: 'Compound lifts, core conditioning, and hydration before checking phone.',
      category: 'Health',
      status: 'Completed',
      priority: 'Medium',
      connectedDream: 'Executive Stamina & Strength',
      moneyImpact: 'Medium',
      dreamImpact: 75,
      estimatedMinutes: 45,
      actualMinutes: 45,
      startTime: '06:30 AM',
      completionTime: '07:15 AM',
      notes: 'High energy throughout morning prep.',
      aiSuggestion: 'Consistent morning training boosts afternoon decision clarity by 35%.',
    },
  ];

  const habit: HabitLog = {
    id: `habit_${todayStr.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
    userId: uid,
    dateKey: todayStr,
    instagramMinutes: 25,
    facebookMinutes: 10,
    youtubeMinutes: 35,
    otherSocialMinutes: 10,
    futureBuildingMinutes: 280,
    sleepHours: 7,
    workoutMinutes: 45,
    waterGlasses: 8,
    aiTip: 'You kept total social media under 80 mins today while logging 4.6 hours of Future Building. Convert 20 mins of YouTube tonight into menu SOP planning.',
  };

  const finances: FinanceItem[] = [
    {
      id: 'fin_kitchen_revenue',
      userId: uid,
      title: 'Ruchitva Kitchen Monthly Net Revenue',
      type: 'Income',
      category: 'Business Operations',
      amount: 185000,
      monthlyTarget: 225000,
      notes: 'Direct orders + catering + delivery platforms',
      dateStr: todayStr,
    },
    {
      id: 'fin_catering_income',
      userId: uid,
      title: 'Corporate & Event Catering Contracts',
      type: 'Income',
      category: 'B2B Catering',
      amount: 55000,
      monthlyTarget: 80000,
      notes: 'High-margin bulk orders',
      dateStr: todayStr,
    },
    {
      id: 'fin_operating_expenses',
      userId: uid,
      title: 'Household & Kitchen Fixed Overheads',
      type: 'Expense',
      category: 'Fixed Operations',
      amount: 72000,
      monthlyTarget: 68000,
      notes: 'Rent, utilities, logistics, and household essentials',
      dateStr: todayStr,
    },
    {
      id: 'fin_equipment_loan',
      userId: uid,
      title: 'Commercial Kitchen Expansion Loan',
      type: 'Loan',
      category: 'Business Debt',
      amount: 320000,
      monthlyTarget: 25000,
      notes: 'Accelerated prepayment active to clear 8 months early',
      dateStr: todayStr,
    },
    {
      id: 'fin_equity_investments',
      userId: uid,
      title: 'Index Equity & Branch Expansion Fund',
      type: 'Investment',
      category: 'Wealth Compounding',
      amount: 1450000,
      monthlyTarget: 65000,
      notes: 'Nifty 50 Index + Branch 2 Capital Reserve',
      dateStr: todayStr,
    },
    {
      id: 'fin_emergency_savings',
      userId: uid,
      title: 'High-Liquidity Emergency Treasury',
      type: 'Saving',
      category: 'Liquid Reserve',
      amount: 480000,
      monthlyTarget: 30000,
      notes: '6 months of complete operational runway',
      dateStr: todayStr,
    },
  ];

  const reviews: DailyReviewItem[] = [
    {
      id: `review_${todayStr.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
      userId: uid,
      dateStr: todayStr,
      completedMissionsCount: 4,
      missedMissionsCount: 1,
      moneyCreated: 14500,
      focusMinutes: 240,
      distractionMinutes: 80,
      missReason: 'Unexpected work',
      reflectionNotes: 'Strong morning execution on Ruchitva marketing and vendor audit; afternoon supplier call ran 25 minutes over.',
      aiSummary: 'Pattern Detected: You complete 92% of revenue missions when started before 11:00 AM. Tomorrow, lock your top B2B catering outreach into the 09:30 AM focus block.',
    },
  ];

  const achievements: AchievementItem[] = [
    {
      id: 'ach_first_sprint',
      userId: uid,
      code: 'DEEP_WORK_INITIATE',
      title: 'Deep Focus Architect',
      description: 'Completed 10+ distraction-free Focus Mode sprints connected to core business dreams.',
      xpReward: 250,
      category: 'Focus',
      unlockedAtStr: todayStr,
    },
    {
      id: 'ach_revenue_builder',
      userId: uid,
      code: 'REVENUE_MOMENTUM',
      title: 'Ruchitva Growth Engine',
      description: 'Executed high-impact marketing and vendor margin missions in consecutive weeks.',
      xpReward: 500,
      category: 'Business',
      unlockedAtStr: todayStr,
    },
    {
      id: 'ach_discipline_shield',
      userId: uid,
      code: 'SCROLL_BREAKER',
      title: 'Anti-Distraction Shield',
      description: 'Maintained Future Building Time at 3x+ higher than total social media entertainment time.',
      xpReward: 300,
      category: 'Discipline',
      unlockedAtStr: todayStr,
    },
  ];

  const aiChats: AIChatMessage[] = [
    {
      id: 'chat_welcome_ceo',
      userId: uid,
      role: 'assistant',
      promptCategory: 'Daily Focus',
      content: `Good morning, ${userProfile.displayName}. As your AI CEO, I have aligned today's operating plan around your #1 Dream: **Grow Ruchitva Kitchen into multiple branches**.\n\n1. **Primary Revenue Lever**: Complete the *Ruchitva food poster & weekend combo campaign* (90% Dream Impact, 45 mins).\n2. **B2B Cashflow**: Contact 15 corporate offices for recurring lunch subscriptions to add ₹25,000+ in predictable monthly revenue.\n3. **Margin Defense**: Lock in the 4% packaging cost reduction to accelerate your Branch #2 expansion reserve.`,
    },
  ];

  return {
    userProfile,
    goals,
    missions,
    habit,
    finances,
    reviews,
    achievements,
    aiChats,
  };
}

export async function ensureUserAndSeedFirestore(
  uid: string,
  displayName: string
): Promise<void> {
  const userPath = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      const seed = getInitialSeedData(uid, displayName);
      // 1. Create /users/{uid} FIRST so relational exists() checks pass on child collections
      await setDoc(userRef, {
        ...seed.userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2. Seed child collections
      await Promise.all([
        ...seed.goals.map(({ id, ...data }) =>
          setDoc(doc(db, 'goals', id), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        ),
        ...seed.missions.map(({ id, ...data }) =>
          setDoc(doc(db, 'missions', id), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        ),
        setDoc(doc(db, 'habits', seed.habit.id), {
          userId: seed.habit.userId,
          dateKey: seed.habit.dateKey,
          instagramMinutes: seed.habit.instagramMinutes,
          facebookMinutes: seed.habit.facebookMinutes,
          youtubeMinutes: seed.habit.youtubeMinutes,
          otherSocialMinutes: seed.habit.otherSocialMinutes,
          futureBuildingMinutes: seed.habit.futureBuildingMinutes,
          sleepHours: seed.habit.sleepHours,
          workoutMinutes: seed.habit.workoutMinutes,
          waterGlasses: seed.habit.waterGlasses,
          aiTip: seed.habit.aiTip,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
        ...seed.finances.map(({ id, ...data }) =>
          setDoc(doc(db, 'finance', id), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        ),
        ...seed.reviews.map(({ id, ...data }) =>
          setDoc(doc(db, 'dailyReviews', id), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        ),
        ...seed.achievements.map(({ id, ...data }) =>
          setDoc(doc(db, 'achievements', id), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        ),
        ...seed.aiChats.map(({ id, ...data }) =>
          setDoc(doc(db, 'aiChats', id), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        ),
      ]);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export function subscribeToLifeOSData(
  uid: string,
  callbacks: {
    onUser: (u: UserProfile) => void;
    onGoals: (g: GoalItem[]) => void;
    onMissions: (m: MissionItem[]) => void;
    onHabits: (h: HabitLog[]) => void;
    onFinance: (f: FinanceItem[]) => void;
    onReviews: (r: DailyReviewItem[]) => void;
    onAchievements: (a: AchievementItem[]) => void;
    onChats: (c: AIChatMessage[]) => void;
  }
): Unsubscribe {
  const unsubs: Unsubscribe[] = [];

  unsubs.push(
    onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          callbacks.onUser({
            uid: d.uid,
            displayName: d.displayName,
            xp: d.xp,
            level: d.level,
            levelTitle: d.levelTitle,
            lifeScore: d.lifeScore,
            healthScore: d.healthScore,
            focusScore: d.focusScore,
            streakDays: d.streakDays,
            mainDream: d.mainDream,
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `users/${uid}`)
    )
  );

  const attachCollection = <T>(
    colName: string,
    mapper: (id: string, data: Record<string, any>) => T,
    cb: (items: T[]) => void
  ) => {
    const q = query(collection(db, colName), where('userId', '==', uid));
    unsubs.push(
      onSnapshot(
        q,
        (snap) => {
          const list: T[] = [];
          snap.forEach((docSnap) => {
            list.push(mapper(docSnap.id, docSnap.data()));
          });
          cb(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, colName)
      )
    );
  };

  attachCollection<GoalItem>(
    'goals',
    (id, d) => ({
      id,
      userId: d.userId,
      title: d.title,
      category: d.category,
      targetLabel: d.targetLabel,
      targetValue: d.targetValue,
      currentValue: d.currentValue,
      progressPct: d.progressPct,
      timeline: d.timeline,
      notes: d.notes,
    }),
    callbacks.onGoals
  );

  attachCollection<MissionItem>(
    'missions',
    (id, d) => ({
      id,
      userId: d.userId,
      title: d.title,
      description: d.description,
      category: d.category,
      status: d.status,
      priority: d.priority,
      connectedDream: d.connectedDream,
      moneyImpact: d.moneyImpact,
      dreamImpact: d.dreamImpact,
      estimatedMinutes: d.estimatedMinutes,
      actualMinutes: d.actualMinutes,
      startTime: d.startTime,
      completionTime: d.completionTime,
      notes: d.notes,
      aiSuggestion: d.aiSuggestion,
    }),
    callbacks.onMissions
  );

  attachCollection<HabitLog>(
    'habits',
    (id, d) => ({
      id,
      userId: d.userId,
      dateKey: d.dateKey,
      instagramMinutes: d.instagramMinutes,
      facebookMinutes: d.facebookMinutes,
      youtubeMinutes: d.youtubeMinutes,
      otherSocialMinutes: d.otherSocialMinutes,
      futureBuildingMinutes: d.futureBuildingMinutes,
      sleepHours: d.sleepHours,
      workoutMinutes: d.workoutMinutes,
      waterGlasses: d.waterGlasses,
      aiTip: d.aiTip,
    }),
    callbacks.onHabits
  );

  attachCollection<FinanceItem>(
    'finance',
    (id, d) => ({
      id,
      userId: d.userId,
      title: d.title,
      type: d.type,
      category: d.category,
      amount: d.amount,
      monthlyTarget: d.monthlyTarget,
      notes: d.notes,
      dateStr: d.dateStr,
    }),
    callbacks.onFinance
  );

  attachCollection<DailyReviewItem>(
    'dailyReviews',
    (id, d) => ({
      id,
      userId: d.userId,
      dateStr: d.dateStr,
      completedMissionsCount: d.completedMissionsCount,
      missedMissionsCount: d.missedMissionsCount,
      moneyCreated: d.moneyCreated,
      focusMinutes: d.focusMinutes,
      distractionMinutes: d.distractionMinutes,
      missReason: d.missReason,
      reflectionNotes: d.reflectionNotes,
      aiSummary: d.aiSummary,
    }),
    callbacks.onReviews
  );

  attachCollection<AchievementItem>(
    'achievements',
    (id, d) => ({
      id,
      userId: d.userId,
      code: d.code,
      title: d.title,
      description: d.description,
      xpReward: d.xpReward,
      category: d.category,
      unlockedAtStr: d.unlockedAtStr,
    }),
    callbacks.onAchievements
  );

  attachCollection<AIChatMessage>(
    'aiChats',
    (id, d) => ({
      id,
      userId: d.userId,
      role: d.role,
      promptCategory: d.promptCategory,
      content: d.content,
    }),
    callbacks.onChats
  );

  return () => {
    unsubs.forEach((u) => u());
  };
}

// CRUD Mutations with strict schema compliance
export async function updateUserProfileInDb(
  uid: string,
  updates: Partial<Omit<UserProfile, 'uid'>>
): Promise<void> {
  const path = `users/${uid}`;
  try {
    const payload: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };
    if (updates.displayName !== undefined) {
      payload.displayName = clampStr(updates.displayName, 1, 100, 'Founder');
    }
    if (updates.xp !== undefined) {
      const safeXp = clampInt(updates.xp, 0, 10000000);
      const { level, levelTitle } = calculateLevelFromXP(safeXp);
      payload.xp = safeXp;
      payload.level = level;
      payload.levelTitle = levelTitle;
    }
    if (updates.lifeScore !== undefined) payload.lifeScore = clampInt(updates.lifeScore, 0, 100);
    if (updates.healthScore !== undefined) payload.healthScore = clampInt(updates.healthScore, 0, 100);
    if (updates.focusScore !== undefined) payload.focusScore = clampInt(updates.focusScore, 0, 100);
    if (updates.streakDays !== undefined) payload.streakDays = clampInt(updates.streakDays, 0, 10000);
    if (updates.mainDream !== undefined) payload.mainDream = clampStr(updates.mainDream, 1, 200, 'Build my future');

    await updateDoc(doc(db, 'users', uid), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createMissionInDb(mission: Omit<MissionItem, 'id'> & { id?: string }): Promise<string> {
  const id = sanitizeId(mission.id);
  const path = `missions/${id}`;
  try {
    await setDoc(doc(db, 'missions', id), {
      userId: mission.userId,
      title: clampStr(mission.title, 1, 140, 'New Mission'),
      description: clampStr(mission.description, 0, 600, ''),
      category: mission.category,
      status: mission.status,
      priority: mission.priority,
      connectedDream: clampStr(mission.connectedDream, 1, 160, 'Core Life Dream'),
      moneyImpact: mission.moneyImpact,
      dreamImpact: clampInt(mission.dreamImpact, 0, 100),
      estimatedMinutes: clampInt(mission.estimatedMinutes, 1, 1440),
      actualMinutes: clampInt(mission.actualMinutes, 0, 1440),
      startTime: clampStr(mission.startTime, 0, 40, ''),
      completionTime: clampStr(mission.completionTime, 0, 40, ''),
      notes: clampStr(mission.notes, 0, 600, ''),
      aiSuggestion: clampStr(mission.aiSuggestion, 0, 600, ''),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateMissionInDb(
  id: string,
  updates: Partial<Omit<MissionItem, 'id' | 'userId'>>
): Promise<void> {
  const path = `missions/${id}`;
  try {
    const payload: Record<string, any> = { updatedAt: serverTimestamp() };
    if (updates.title !== undefined) payload.title = clampStr(updates.title, 1, 140, 'Mission');
    if (updates.description !== undefined) payload.description = clampStr(updates.description, 0, 600, '');
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.connectedDream !== undefined) payload.connectedDream = clampStr(updates.connectedDream, 1, 160, 'Dream');
    if (updates.moneyImpact !== undefined) payload.moneyImpact = updates.moneyImpact;
    if (updates.dreamImpact !== undefined) payload.dreamImpact = clampInt(updates.dreamImpact, 0, 100);
    if (updates.estimatedMinutes !== undefined) payload.estimatedMinutes = clampInt(updates.estimatedMinutes, 1, 1440);
    if (updates.actualMinutes !== undefined) payload.actualMinutes = clampInt(updates.actualMinutes, 0, 1440);
    if (updates.startTime !== undefined) payload.startTime = clampStr(updates.startTime, 0, 40, '');
    if (updates.completionTime !== undefined) payload.completionTime = clampStr(updates.completionTime, 0, 40, '');
    if (updates.notes !== undefined) payload.notes = clampStr(updates.notes, 0, 600, '');
    if (updates.aiSuggestion !== undefined) payload.aiSuggestion = clampStr(updates.aiSuggestion, 0, 600, '');

    await updateDoc(doc(db, 'missions', id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteMissionInDb(id: string): Promise<void> {
  const path = `missions/${id}`;
  try {
    await deleteDoc(doc(db, 'missions', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function createGoalInDb(goal: Omit<GoalItem, 'id'> & { id?: string }): Promise<string> {
  const id = sanitizeId(goal.id);
  const path = `goals/${id}`;
  try {
    const targetVal = clampNum(goal.targetValue, 0, 100000000000);
    const currentVal = clampNum(goal.currentValue, 0, 100000000000);
    const pct = targetVal > 0 ? clampInt((currentVal / targetVal) * 100, 0, 100) : clampInt(goal.progressPct, 0, 100);

    await setDoc(doc(db, 'goals', id), {
      userId: goal.userId,
      title: clampStr(goal.title, 1, 120, 'Dream Goal'),
      category: goal.category,
      targetLabel: clampStr(goal.targetLabel, 1, 120, 'Target Milestone'),
      targetValue: targetVal,
      currentValue: currentVal,
      progressPct: pct,
      timeline: clampStr(goal.timeline, 1, 60, 'Dec 2027'),
      notes: clampStr(goal.notes, 0, 500, ''),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateGoalInDb(
  id: string,
  updates: Partial<Omit<GoalItem, 'id' | 'userId'>>
): Promise<void> {
  const path = `goals/${id}`;
  try {
    const payload: Record<string, any> = { updatedAt: serverTimestamp() };
    if (updates.title !== undefined) payload.title = clampStr(updates.title, 1, 120, 'Dream Goal');
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.targetLabel !== undefined) payload.targetLabel = clampStr(updates.targetLabel, 1, 120, 'Target');
    if (updates.targetValue !== undefined) payload.targetValue = clampNum(updates.targetValue, 0, 100000000000);
    if (updates.currentValue !== undefined) payload.currentValue = clampNum(updates.currentValue, 0, 100000000000);
    if (updates.progressPct !== undefined) payload.progressPct = clampInt(updates.progressPct, 0, 100);
    if (updates.timeline !== undefined) payload.timeline = clampStr(updates.timeline, 1, 60, 'Dec 2027');
    if (updates.notes !== undefined) payload.notes = clampStr(updates.notes, 0, 500, '');

    await updateDoc(doc(db, 'goals', id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteGoalInDb(id: string): Promise<void> {
  const path = `goals/${id}`;
  try {
    await deleteDoc(doc(db, 'goals', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function createFinanceInDb(fin: Omit<FinanceItem, 'id'> & { id?: string }): Promise<string> {
  const id = sanitizeId(fin.id);
  const path = `finance/${id}`;
  try {
    await setDoc(doc(db, 'finance', id), {
      userId: fin.userId,
      title: clampStr(fin.title, 1, 120, 'Finance Entry'),
      type: fin.type,
      category: clampStr(fin.category, 1, 80, 'General'),
      amount: clampNum(fin.amount, 0, 100000000000),
      monthlyTarget: clampNum(fin.monthlyTarget, 0, 100000000000),
      notes: clampStr(fin.notes, 0, 400, ''),
      dateStr: clampStr(fin.dateStr, 1, 30, new Date().toISOString().split('T')[0]),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateFinanceInDb(
  id: string,
  updates: Partial<Omit<FinanceItem, 'id' | 'userId'>>
): Promise<void> {
  const path = `finance/${id}`;
  try {
    const payload: Record<string, any> = { updatedAt: serverTimestamp() };
    if (updates.title !== undefined) payload.title = clampStr(updates.title, 1, 120, 'Entry');
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.category !== undefined) payload.category = clampStr(updates.category, 1, 80, 'General');
    if (updates.amount !== undefined) payload.amount = clampNum(updates.amount, 0, 100000000000);
    if (updates.monthlyTarget !== undefined) payload.monthlyTarget = clampNum(updates.monthlyTarget, 0, 100000000000);
    if (updates.notes !== undefined) payload.notes = clampStr(updates.notes, 0, 400, '');
    if (updates.dateStr !== undefined) payload.dateStr = clampStr(updates.dateStr, 1, 30, '2026-11-15');

    await updateDoc(doc(db, 'finance', id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteFinanceInDb(id: string): Promise<void> {
  const path = `finance/${id}`;
  try {
    await deleteDoc(doc(db, 'finance', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateHabitInDb(
  id: string,
  updates: Partial<Omit<HabitLog, 'id' | 'userId' | 'dateKey'>>
): Promise<void> {
  const path = `habits/${id}`;
  try {
    const payload: Record<string, any> = { updatedAt: serverTimestamp() };
    if (updates.instagramMinutes !== undefined) payload.instagramMinutes = clampInt(updates.instagramMinutes, 0, 1440);
    if (updates.facebookMinutes !== undefined) payload.facebookMinutes = clampInt(updates.facebookMinutes, 0, 1440);
    if (updates.youtubeMinutes !== undefined) payload.youtubeMinutes = clampInt(updates.youtubeMinutes, 0, 1440);
    if (updates.otherSocialMinutes !== undefined) payload.otherSocialMinutes = clampInt(updates.otherSocialMinutes, 0, 1440);
    if (updates.futureBuildingMinutes !== undefined) payload.futureBuildingMinutes = clampInt(updates.futureBuildingMinutes, 0, 1440);
    if (updates.sleepHours !== undefined) payload.sleepHours = clampInt(updates.sleepHours, 0, 24);
    if (updates.workoutMinutes !== undefined) payload.workoutMinutes = clampInt(updates.workoutMinutes, 0, 600);
    if (updates.waterGlasses !== undefined) payload.waterGlasses = clampInt(updates.waterGlasses, 0, 30);
    if (updates.aiTip !== undefined) payload.aiTip = clampStr(updates.aiTip, 0, 500, '');

    await updateDoc(doc(db, 'habits', id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createDailyReviewInDb(
  review: Omit<DailyReviewItem, 'id'> & { id?: string }
): Promise<string> {
  const id = sanitizeId(review.id);
  const path = `dailyReviews/${id}`;
  try {
    await setDoc(doc(db, 'dailyReviews', id), {
      userId: review.userId,
      dateStr: clampStr(review.dateStr, 1, 30, new Date().toISOString().split('T')[0]),
      completedMissionsCount: clampInt(review.completedMissionsCount, 0, 200),
      missedMissionsCount: clampInt(review.missedMissionsCount, 0, 200),
      moneyCreated: clampNum(review.moneyCreated, 0, 1000000000),
      focusMinutes: clampInt(review.focusMinutes, 0, 1440),
      distractionMinutes: clampInt(review.distractionMinutes, 0, 1440),
      missReason: review.missReason,
      reflectionNotes: clampStr(review.reflectionNotes, 0, 800, ''),
      aiSummary: clampStr(review.aiSummary, 0, 1500, ''),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function createAchievementInDb(
  ach: Omit<AchievementItem, 'id'> & { id?: string }
): Promise<string> {
  const id = sanitizeId(ach.id);
  const path = `achievements/${id}`;
  try {
    await setDoc(doc(db, 'achievements', id), {
      userId: ach.userId,
      code: clampStr(ach.code, 1, 80, 'ACHIEVEMENT'),
      title: clampStr(ach.title, 1, 120, 'Milestone Unlocked'),
      description: clampStr(ach.description, 1, 300, 'Completed high-impact objective.'),
      xpReward: clampInt(ach.xpReward, 0, 100000),
      category: ach.category,
      unlockedAtStr: clampStr(ach.unlockedAtStr, 1, 40, new Date().toISOString().split('T')[0]),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function createAIChatInDb(
  chat: Omit<AIChatMessage, 'id'> & { id?: string }
): Promise<string> {
  const id = sanitizeId(chat.id);
  const path = `aiChats/${id}`;
  try {
    await setDoc(doc(db, 'aiChats', id), {
      userId: chat.userId,
      role: chat.role,
      promptCategory: chat.promptCategory,
      content: clampStr(chat.content, 1, 4000, 'Message'),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
