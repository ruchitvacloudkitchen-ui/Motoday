/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  LayoutDashboard,
  Target,
  Flame,
  Compass,
  Wallet,
  ShieldAlert,
  CalendarCheck,
  Sparkles,
  LogIn,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { auth, googleProvider } from './firebase';
import {
  UserProfile,
  GoalItem,
  MissionItem,
  HabitLog,
  FinanceItem,
  DailyReviewItem,
  AchievementItem,
  AIChatMessage,
  PromptCategory,
  calculateLevelFromXP,
} from './types/lifeos';
import {
  getInitialSeedData,
  ensureUserAndSeedFirestore,
  subscribeToLifeOSData,
  updateUserProfileInDb,
  createMissionInDb,
  updateMissionInDb,
  deleteMissionInDb,
  createGoalInDb,
  updateGoalInDb,
  deleteGoalInDb,
  createFinanceInDb,
  deleteFinanceInDb,
  updateHabitInDb,
  createDailyReviewInDb,
  createAchievementInDb,
  createAIChatInDb,
} from './services/firestoreService';
import { HomeDashboard } from './components/HomeDashboard';
import { MissionManager } from './components/MissionManager';
import { FocusModeView } from './components/FocusModeView';
import { DreamBoardView } from './components/DreamBoardView';
import { MoneyDashboardView } from './components/MoneyDashboardView';
import {
  SocialMediaControlView,
  DailyAndWeeklyReviewView,
  AILifeCoachView,
} from './components/CoachAndReviewsView';

type NavTab =
  | 'dashboard'
  | 'missions'
  | 'focus'
  | 'dreams'
  | 'money'
  | 'social'
  | 'review'
  | 'coach';

const NAV_ITEMS: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
  { id: 'missions', label: 'Missions', icon: Target },
  { id: 'focus', label: 'Focus Mode', icon: Flame },
  { id: 'dreams', label: 'Dream Board', icon: Compass },
  { id: 'money', label: 'Money & Wealth', icon: Wallet },
  { id: 'social', label: 'Social Control', icon: ShieldAlert },
  { id: 'review', label: 'Daily & Weekly Review', icon: CalendarCheck },
  { id: 'coach', label: 'AI Life Coach', icon: Sparkles },
];

export default function App() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const initialSeed = getInitialSeedData('local_founder', 'Ruchitva Founder');
  const [userProfile, setUserProfile] = useState<UserProfile>(initialSeed.userProfile);
  const [goals, setGoals] = useState<GoalItem[]>(initialSeed.goals);
  const [missions, setMissions] = useState<MissionItem[]>(initialSeed.missions);
  const [habits, setHabits] = useState<HabitLog[]>([initialSeed.habit]);
  const [finances, setFinances] = useState<FinanceItem[]>(initialSeed.finances);
  const [reviews, setReviews] = useState<DailyReviewItem[]>(initialSeed.reviews);
  const [achievements, setAchievements] = useState<AchievementItem[]>(initialSeed.achievements);
  const [chats, setChats] = useState<AIChatMessage[]>(initialSeed.aiChats);

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [focusMission, setFocusMission] = useState<MissionItem | null>(
    initialSeed.missions[0] || null
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Firebase Auth listener + Firestore live subscription
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setAuthUser(currentUser);
      setAuthReady(true);

      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      if (currentUser) {
        try {
          await ensureUserAndSeedFirestore(
            currentUser.uid,
            currentUser.displayName || 'Founder'
          );
          unsubscribeFirestore = subscribeToLifeOSData(currentUser.uid, {
            onUser: (u) => setUserProfile(u),
            onGoals: (g) => {
              if (g.length > 0) setGoals(g);
            },
            onMissions: (m) => {
              if (m.length > 0) setMissions(m);
            },
            onHabits: (h) => {
              if (h.length > 0) setHabits(h);
            },
            onFinance: (f) => {
              if (f.length > 0) setFinances(f);
            },
            onReviews: (r) => {
              if (r.length > 0) setReviews(r);
            },
            onAchievements: (a) => {
              if (a.length > 0) setAchievements(a);
            },
            onChats: (c) => {
              if (c.length > 0) setChats(c);
            },
          });
        } catch (err: unknown) {
          console.error('Error initializing cloud workspace:', err);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const todayHabit = habits[0] || initialSeed.habit;

  // Award XP helper (updates both local and Firestore if signed in)
  const awardXP = async (xpDelta: number) => {
    const nextXp = userProfile.xp + xpDelta;
    const { level, levelTitle } = calculateLevelFromXP(nextXp);
    const nextLifeScore = Math.min(100, userProfile.lifeScore + 1);
    setUserProfile((prev) => ({
      ...prev,
      xp: nextXp,
      level,
      levelTitle,
      lifeScore: nextLifeScore,
    }));
    if (authUser) {
      await updateUserProfileInDb(authUser.uid, {
        xp: nextXp,
        lifeScore: nextLifeScore,
      });
    }
  };

  // Mission handlers
  const handleCreateMission = async (newM: Omit<MissionItem, 'id' | 'userId'>) => {
    const tempId = `mission_${Date.now()}`;
    const fullItem: MissionItem = {
      ...newM,
      id: tempId,
      userId: authUser?.uid || userProfile.uid,
    };
    setMissions((prev) => [fullItem, ...prev]);
    if (authUser) {
      await createMissionInDb({ ...fullItem, id: tempId });
    }
  };

  const handleUpdateMission = async (
    id: string,
    updates: Partial<Omit<MissionItem, 'id' | 'userId'>>
  ) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    if (authUser) {
      await updateMissionInDb(id, updates);
    }
    if (updates.status === 'Completed') {
      await awardXP(100);
    }
  };

  const handleDeleteMission = async (id: string) => {
    setMissions((prev) => prev.filter((m) => m.id !== id));
    if (authUser) {
      await deleteMissionInDb(id);
    }
  };

  const handleStartFocusMission = (mission: MissionItem) => {
    setFocusMission(mission);
    setActiveTab('focus');
  };

  const handleCompleteMissionQuick = async (mission: MissionItem) => {
    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    await handleUpdateMission(mission.id, {
      status: 'Completed',
      completionTime: nowTime,
      actualMinutes: mission.actualMinutes || mission.estimatedMinutes,
    });
  };

  const handleCompleteFocusSprint = async (
    mission: MissionItem,
    focusedMinutes: number
  ) => {
    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const nextActual = mission.actualMinutes + focusedMinutes;
    const isNowDone = nextActual >= mission.estimatedMinutes;

    if (mission.status !== 'Completed' && mission.status !== 'Cancelled') {
      await handleUpdateMission(mission.id, {
        actualMinutes: nextActual,
        status: isNowDone ? 'Completed' : 'Processing',
        completionTime: isNowDone ? nowTime : mission.completionTime,
      });
    }

    // Increment Future Building Time
    const nextFutureMins = todayHabit.futureBuildingMinutes + focusedMinutes;
    setHabits((prev) =>
      prev.map((h, i) =>
        i === 0 ? { ...h, futureBuildingMinutes: nextFutureMins } : h
      )
    );
    if (authUser) {
      await updateHabitInDb(todayHabit.id, {
        futureBuildingMinutes: nextFutureMins,
      });
    }

    // Award 150 XP & Achievement
    await awardXP(150);

    const achId = `ach_sprint_${Date.now()}`;
    const newAch: AchievementItem = {
      id: achId,
      userId: authUser?.uid || userProfile.uid,
      code: 'FOCUS_SPRINT_WIN',
      title: `Completed ${focusedMinutes}m Focus Sprint`,
      description: `Executed deep work on "${mission.title}"`,
      xpReward: 150,
      category: 'Focus',
      unlockedAtStr: new Date().toISOString().split('T')[0],
    };
    setAchievements((prev) => [newAch, ...prev]);
    if (authUser) {
      await createAchievementInDb(newAch);
    }
  };

  // Goal handlers
  const handleCreateGoal = async (newG: Omit<GoalItem, 'id' | 'userId'>) => {
    const tempId = `goal_${Date.now()}`;
    const fullGoal: GoalItem = {
      ...newG,
      id: tempId,
      userId: authUser?.uid || userProfile.uid,
    };
    setGoals((prev) => [fullGoal, ...prev]);
    if (authUser) {
      await createGoalInDb(fullGoal);
    }
  };

  const handleUpdateGoal = async (
    id: string,
    updates: Partial<Omit<GoalItem, 'id' | 'userId'>>
  ) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
    if (authUser) {
      await updateGoalInDb(id, updates);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (authUser) {
      await deleteGoalInDb(id);
    }
  };

  // Finance handlers
  const handleCreateFinance = async (newF: Omit<FinanceItem, 'id' | 'userId'>) => {
    const tempId = `fin_${Date.now()}`;
    const fullFin: FinanceItem = {
      ...newF,
      id: tempId,
      userId: authUser?.uid || userProfile.uid,
    };
    setFinances((prev) => [fullFin, ...prev]);
    if (authUser) {
      await createFinanceInDb(fullFin);
    }
  };

  const handleDeleteFinance = async (id: string) => {
    setFinances((prev) => prev.filter((f) => f.id !== id));
    if (authUser) {
      await deleteFinanceInDb(id);
    }
  };

  // Habit handler
  const handleUpdateHabit = async (
    updates: Partial<Omit<HabitLog, 'id' | 'userId' | 'dateKey'>>
  ) => {
    setHabits((prev) =>
      prev.map((h, i) => (i === 0 ? { ...h, ...updates } : h))
    );
    if (authUser) {
      await updateHabitInDb(todayHabit.id, updates);
    }
  };

  // Daily Review handler
  const handleCreateDailyReview = async (
    newR: Omit<DailyReviewItem, 'id' | 'userId'>
  ) => {
    const tempId = `review_${Date.now()}`;
    const fullRev: DailyReviewItem = {
      ...newR,
      id: tempId,
      userId: authUser?.uid || userProfile.uid,
    };
    setReviews((prev) => [fullRev, ...prev]);
    if (authUser) {
      await createDailyReviewInDb(fullRev);
    }
    await awardXP(100);
  };

  // AI Coach Chat handler
  const handleSendCoachMessage = async (
    userText: string,
    category: PromptCategory,
    aiReply: string
  ) => {
    const userMsgId = `chat_u_${Date.now()}`;
    const aiMsgId = `chat_a_${Date.now() + 1}`;
    const uid = authUser?.uid || userProfile.uid;

    const uMsg: AIChatMessage = {
      id: userMsgId,
      userId: uid,
      role: 'user',
      promptCategory: category,
      content: userText,
    };
    const aMsg: AIChatMessage = {
      id: aiMsgId,
      userId: uid,
      role: 'assistant',
      promptCategory: category,
      content: aiReply,
    };

    setChats((prev) => [...prev, uMsg, aMsg]);
    if (authUser) {
      await createAIChatInDb(uMsg);
      await createAIChatInDb(aMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A09] text-[#F3F5F4] flex flex-col">
      {/* Top Bar Contract: 3 Zones Separated by gap-8 */}
      <header className="sticky top-0 z-40 h-16 bg-[#070A09]/95 backdrop-blur border-b border-[#1C2B24] px-4 sm:px-8 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden text-[#9CAEA4] hover:text-[#F3F5F4] p-1"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('dashboard');
            }}
            className="text-lg font-extrabold tracking-tight text-[#F3F5F4] whitespace-nowrap shrink-0"
          >
            LifeOS
          </a>
        </div>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#8A9D93]">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`hover:text-[#F3F5F4] transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard' ? 'text-[#10B981] font-semibold underline underline-offset-8' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('missions')}
            className={`hover:text-[#F3F5F4] transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'missions' ? 'text-[#10B981] font-semibold underline underline-offset-8' : ''
            }`}
          >
            Missions
          </button>
          <button
            onClick={() => setActiveTab('dreams')}
            className={`hover:text-[#F3F5F4] transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dreams' ? 'text-[#10B981] font-semibold underline underline-offset-8' : ''
            }`}
          >
            Dream Board
          </button>
          <button
            onClick={() => setActiveTab('money')}
            className={`hover:text-[#F3F5F4] transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'money' ? 'text-[#10B981] font-semibold underline underline-offset-8' : ''
            }`}
          >
            Money
          </button>
          <button
            onClick={() => setActiveTab('coach')}
            className={`hover:text-[#F3F5F4] transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'coach' ? 'text-[#10B981] font-semibold underline underline-offset-8' : ''
            }`}
          >
            AI Coach
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {authReady && authUser ? (
            <button
              onClick={handleSignOut}
              className="px-3.5 py-2 text-xs font-medium bg-[#0D1512] border border-[#1C2B24] hover:border-[#D4AF37] text-[#F3F5F4] rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Sign Out ({userProfile.displayName.split(' ')[0]})</span>
            </button>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              className="px-4 py-2 text-xs font-semibold bg-[#10B981] hover:bg-[#059669] text-[#070A09] rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign in with Google</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Layout: Sidebar + Content Viewport */}
      <div className="flex-1 flex">
        {/* Desktop & Mobile Sidebar */}
        <aside
          className={`${
            mobileMenuOpen ? 'fixed inset-y-16 left-0 z-30 block' : 'hidden'
          } lg:block w-64 shrink-0 bg-[#0A100D] border-r border-[#1C2B24] p-4 flex flex-col justify-between`}
        >
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#121E19] text-[#10B981] border border-[#10B981]/30 font-semibold'
                      : 'text-[#8A9D93] hover:text-[#F3F5F4] hover:bg-[#0D1512]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#D4AF37]' : 'text-[#8A9D93]'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Founder Status Summary Card in Sidebar Footer */}
          <div className="mt-8 pt-4 border-t border-[#1C2B24] space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono tabular-nums">
              <span className="text-[#8A9D93]">Level {userProfile.level}</span>
              <span className="text-[#D4AF37] font-bold">{userProfile.xp} XP</span>
            </div>
            <div className="text-[#F3F5F4] font-semibold truncate">
              {userProfile.levelTitle}
            </div>
            <div className="text-[11px] text-[#8A9D93]">
              {authUser
                ? 'Cloud Synced via Firebase Firestore'
                : 'Preview Mode · Sign in to sync across devices'}
            </div>
            {authError && (
              <div className="text-[11px] text-amber-400 break-words">
                Auth note: {authError}
              </div>
            )}
          </div>
        </aside>

        {/* Main Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <HomeDashboard
              user={userProfile}
              goals={goals}
              missions={missions}
              finances={finances}
              todayHabit={todayHabit}
              achievements={achievements}
              onStartFocusMission={handleStartFocusMission}
              onCompleteMissionQuick={handleCompleteMissionQuick}
              onNavigate={(tab) => setActiveTab(tab as NavTab)}
            />
          )}

          {activeTab === 'missions' && (
            <MissionManager
              missions={missions}
              goals={goals}
              onCreateMission={handleCreateMission}
              onUpdateMission={handleUpdateMission}
              onDeleteMission={handleDeleteMission}
              onStartFocusMission={handleStartFocusMission}
            />
          )}

          {activeTab === 'focus' && (
            <FocusModeView
              missions={missions}
              activeMission={focusMission}
              onSelectMission={(m) => setFocusMission(m)}
              onCompleteSprint={handleCompleteFocusSprint}
            />
          )}

          {activeTab === 'dreams' && (
            <DreamBoardView
              goals={goals}
              missions={missions}
              onCreateGoal={handleCreateGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {activeTab === 'money' && (
            <MoneyDashboardView
              finances={finances}
              goals={goals}
              onCreateFinance={handleCreateFinance}
              onDeleteFinance={handleDeleteFinance}
            />
          )}

          {activeTab === 'social' && (
            <SocialMediaControlView
              habit={todayHabit}
              onUpdateHabit={handleUpdateHabit}
            />
          )}

          {activeTab === 'review' && (
            <DailyAndWeeklyReviewView
              user={userProfile}
              missions={missions}
              goals={goals}
              finances={finances}
              todayHabit={todayHabit}
              reviews={reviews}
              onCreateDailyReview={handleCreateDailyReview}
            />
          )}

          {activeTab === 'coach' && (
            <AILifeCoachView
              user={userProfile}
              goals={goals}
              missions={missions}
              finances={finances}
              todayHabit={todayHabit}
              chats={chats}
              onSendCoachMessage={handleSendCoachMessage}
            />
          )}
        </main>
      </div>
    </div>
  );
}
