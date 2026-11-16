import React, { useState, useEffect, useCallback } from 'react';
import { Mic, Plus, X } from 'lucide-react';
import {
  DayMode,
  DailyTask,
  FocusRuleTask,
  DreamCardItem,
  LoanMountain,
  WeeklyMoneyRecord,
  GratitudeEntry,
  WEEKDAY_TASKS,
  SATURDAY_TASKS,
  SUNDAY_TASKS,
  INITIAL_FOCUS_RULES,
  INITIAL_DREAMS,
  INITIAL_LOAN_MOUNTAINS,
  INITIAL_WEEKLY_MONEY,
  INITIAL_GRATITUDE,
} from './data/ruchitvaData';
import { TodayScreen, FocusScreen } from './components/TodayAndFocusScreens';
import {
  DreamBoardScreen,
  MoneyScreen,
  MeScreen,
} from './components/DreamsMoneyMeScreens';
import { IndianCoupleIllustration } from './components/CartoonIllustrations';
import {
  playCoinSound,
  playHappyCakeFanfare,
  playStepChime,
} from './utils/soundAndVoice';

type TabId = 'today' | 'focus' | 'dreams' | 'money' | 'me';
type TimeTheme = 'morning' | 'evening' | 'night';

const STORAGE_KEY = 'ruchitva_rising_bento_v4';

interface PersistedState {
  weekdayTasks: DailyTask[];
  saturdayTasks: DailyTask[];
  sundayTasks: DailyTask[];
  focusRules: FocusRuleTask[];
  dreams: DreamCardItem[];
  branchesOpened: number;
  loans: LoanMountain[];
  jarAmount: number;
  jarGoal: number;
  weeklyRecords: WeeklyMoneyRecord[];
  gratitudes: GratitudeEntry[];
  streak: number;
  noReelsStreak: number;
  noReelsShieldOn: boolean;
  points: number;
  cakesEaten: number;
  customIllustration?: string;
}

const getAutoDayMode = (): DayMode => {
  const day = new Date().getDay();
  if (day === 6) return 'saturday';
  if (day === 0) return 'sunday';
  return 'weekday';
};

// Morning (5 am to 5 pm), Evening (5 pm to 8 pm), Night (8 pm to 5 am)
const getTimeThemeByHour = (hour: number): TimeTheme => {
  if (hour >= 5 && hour < 17) return 'morning';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
};

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [dayMode, setDayMode] = useState<DayMode>(getAutoDayMode);
  const [confettiPieces, setConfettiPieces] = useState<
    { id: number; left: number; emoji: string; delay: number }[]
  >([]);
  const [pointsToast, setPointsToast] = useState<string | null>(null);
  const [celebratingCake, setCelebratingCake] = useState<boolean>(false);
  const [timeTheme, setTimeTheme] = useState<TimeTheme>(() =>
    getTimeThemeByHour(new Date().getHours())
  );

  // Voice Microphone "Add task" state
  const [micListening, setMicListening] = useState<boolean>(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');

  useEffect(() => {
    const updateTheme = () => {
      setTimeTheme(getTimeThemeByHour(new Date().getHours()));
    };
    updateTheme();
    const interval = setInterval(updateTheme, 30000);
    return () => clearInterval(interval);
  }, []);

  const [state, setState] = useState<PersistedState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore storage errors
    }
    return {
      weekdayTasks: WEEKDAY_TASKS,
      saturdayTasks: SATURDAY_TASKS,
      sundayTasks: SUNDAY_TASKS,
      focusRules: INITIAL_FOCUS_RULES,
      dreams: INITIAL_DREAMS,
      branchesOpened: 2,
      loans: INITIAL_LOAN_MOUNTAINS,
      jarAmount: 185000,
      jarGoal: 500000,
      weeklyRecords: INITIAL_WEEKLY_MONEY,
      gratitudes: INITIAL_GRATITUDE,
      streak: 14,
      noReelsStreak: 9,
      noReelsShieldOn: true,
      points: 37, // Starts at 37/100 as specified
      cakesEaten: 2,
      customIllustration: '',
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [state]);

  const triggerConfetti = useCallback((pointsLabel?: string) => {
    const emojis = ['🪙', '✨', '🎉', '🌟', '💰', '🎂', '🔥'];
    const pieces = Array.from({ length: 22 }).map((_, idx) => ({
      id: Date.now() + idx,
      left: Math.random() * 92 + 4,
      emoji: emojis[idx % emojis.length],
      delay: Math.random() * 0.35,
    }));
    setConfettiPieces(pieces);
    if (pointsLabel) {
      setPointsToast(pointsLabel);
      setTimeout(() => setPointsToast(null), 1500);
    }
    setTimeout(() => setConfettiPieces([]), 2200);
  }, []);

  const handleAwardPoints = useCallback((pts: number, _label: string) => {
    setState((prev) => {
      const nextPoints = prev.points + pts;
      if (nextPoints >= 100) {
        setTimeout(() => {
          playHappyCakeFanfare();
          setCelebratingCake(true);
        }, 120);
        return {
          ...prev,
          points: 100,
        };
      }
      return {
        ...prev,
        points: nextPoints,
      };
    });
  }, []);

  const handleAteTheCake = () => {
    playStepChime();
    setCelebratingCake(false);
    setState((prev) => ({
      ...prev,
      points: 0,
      cakesEaten: prev.cakesEaten + 1,
    }));
    triggerConfetti('🎂 CAKE EATEN!');
  };

  const currentTasks =
    dayMode === 'weekday'
      ? state.weekdayTasks
      : dayMode === 'saturday'
      ? state.saturdayTasks
      : state.sundayTasks;

  const handleUpdateTask = (id: string, updates: Partial<DailyTask>) => {
    const key =
      dayMode === 'weekday'
        ? 'weekdayTasks'
        : dayMode === 'saturday'
        ? 'saturdayTasks'
        : 'sundayTasks';

    setState((prev) => ({
      ...prev,
      [key]: prev[key].map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  // Add a new task via Voice ("Add task ...") or quick input
  const addNewTaskToDay = useCallback(
    (rawTitle: string) => {
      const cleaned = rawTitle
        .replace(/^add\s+task\s*/i, '')
        .trim();
      const finalTitle = cleaned || 'New Ruchitva Task';
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const newTask: DailyTask = {
        id: `custom_${Date.now()}`,
        dayType: dayMode,
        time: timeStr,
        startMins: now.getHours() * 60 + now.getMinutes(),
        icon: '⚡',
        title: finalTitle,
        posterHeadline: finalTitle.toUpperCase() + '!',
        benefit: 'Small steps build big dreams',
        propType: 'coin',
        cardBg: '#38BDF8',
        status: 'not_started',
      };

      const key =
        dayMode === 'weekday'
          ? 'weekdayTasks'
          : dayMode === 'saturday'
          ? 'saturdayTasks'
          : 'sundayTasks';

      setState((prev) => ({
        ...prev,
        [key]: [...prev[key], newTask],
      }));
      playCoinSound();
      triggerConfetti('TASK ADDED!');
      setActiveTab('today');
    },
    [dayMode, triggerConfetti]
  );

  // Big Round Microphone Button handler ("Say 'Add task' to add one")
  const handleMicPress = () => {
    playStepChime();
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => any })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => any })
        .webkitSpeechRecognition;

    if (!SpeechRec) {
      setVoiceModalOpen(true);
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.lang = 'en-IN';
      rec.interimResults = false;
      setMicListening(true);
      setVoiceModalOpen(true);
      setVoiceTranscript('Listening... Say "Add task [name]"');

      rec.onresult = (event: any) => {
        const transcript: string =
          event.results?.[0]?.[0]?.transcript || '';
        setVoiceTranscript(transcript);
        setMicListening(false);
        if (transcript.trim()) {
          addNewTaskToDay(transcript);
          setTimeout(() => {
            setVoiceModalOpen(false);
            setVoiceTranscript('');
          }, 700);
        }
      };

      rec.onerror = () => {
        setMicListening(false);
        setVoiceTranscript('Tap below to type your task');
      };

      rec.onend = () => {
        setMicListening(false);
      };

      rec.start();
    } catch {
      setMicListening(false);
      setVoiceModalOpen(true);
    }
  };

  const handleToggleFocusRule = (id: string) => {
    setState((prev) => ({
      ...prev,
      focusRules: prev.focusRules.map((r) =>
        r.id === id ? { ...r, done: !r.done } : r
      ),
    }));
  };

  const handleToggleShield = () => {
    setState((prev) => ({
      ...prev,
      noReelsShieldOn: !prev.noReelsShieldOn,
      noReelsStreak: !prev.noReelsShieldOn
        ? prev.noReelsStreak + 1
        : prev.noReelsStreak,
    }));
  };

  const handleStepDream = (id: string) => {
    setState((prev) => ({
      ...prev,
      dreams: prev.dreams.map((d) =>
        d.id === id
          ? { ...d, progressPct: Math.min(100, d.progressPct + 5) }
          : d
      ),
    }));
  };

  const handleUpdateDreamPhoto = (id: string, imageUrl: string) => {
    setState((prev) => ({
      ...prev,
      dreams: prev.dreams.map((d) =>
        d.id === id ? { ...d, imageUrl } : d
      ),
    }));
  };

  const handleToggleBranch = (branchCount: number) => {
    setState((prev) => ({
      ...prev,
      branchesOpened: branchCount,
    }));
  };

  const handlePayLoanStep = (id: string) => {
    setState((prev) => ({
      ...prev,
      loans: prev.loans.map((l) =>
        l.id === id
          ? { ...l, paidSteps: Math.min(l.totalSteps, l.paidSteps + 1) }
          : l
      ),
    }));
  };

  const handleAddJarCoins = (amount: number) => {
    setState((prev) => ({
      ...prev,
      jarAmount: Math.min(prev.jarGoal, prev.jarAmount + amount),
    }));
  };

  const handleAddGratitude = (text: string) => {
    const entry: GratitudeEntry = {
      id: `g-${Date.now()}`,
      text,
      date: 'Today',
    };
    setState((prev) => ({
      ...prev,
      gratitudes: [entry, ...prev.gratitudes],
    }));
  };

  const completedTodayCount = currentTasks.filter(
    (t) => t.status === 'completed'
  ).length;
  const focusMinutesToday = Math.max(
    45,
    currentTasks.reduce((acc, t) => acc + (t.minutesTaken || 0), 0)
  );
  const totalHoursWorked = Math.max(
    1,
    Math.round((focusMinutesToday / 60) * 10) / 10
  );

  const isNight = timeTheme === 'night';
  const bgGradientClass =
    timeTheme === 'night'
      ? 'bg-bento-night text-white'
      : timeTheme === 'evening'
      ? 'bg-bento-evening text-slate-900'
      : 'bg-bento-morning text-slate-900';

  return (
    <div
      className={`min-h-screen transition-colors duration-700 ${bgGradientClass}`}
    >
      {/* CONFETTI & COIN RAIN OVERLAY */}
      {confettiPieces.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confettiPieces.map((p) => (
            <div
              key={p.id}
              style={{
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
              }}
              className="confetti-piece text-3xl select-none"
            >
              {p.emoji}
            </div>
          ))}
        </div>
      )}

      {/* FLOATING POINTS POP TOAST */}
      {pointsToast && !celebratingCake && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="px-6 py-3 rounded-3xl bento-gold font-poster text-3xl shadow-2xl animate-pop-points">
            🪙 {pointsToast}
          </div>
        </div>
      )}

      {/* ====================================================================
          VOICE MICROPHONE "ADD TASK" MODAL
          ==================================================================== */}
      {voiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-[2.25rem] bento-white p-6 space-y-4 text-center">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                VOICE COMMAND · “ADD TASK”
              </span>
              <button
                onClick={() => {
                  setVoiceModalOpen(false);
                  setMicListening(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                micListening
                  ? 'bento-coral animate-pulse'
                  : 'bento-blue'
              }`}
            >
              <Mic className="w-9 h-9 text-white" />
            </div>

            <div className="font-poster text-2xl text-slate-900">
              {voiceTranscript || 'SAY "ADD TASK ..."'}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTaskTitle.trim()) return;
                addNewTaskToDay(newTaskTitle);
                setNewTaskTitle('');
                setVoiceModalOpen(false);
              }}
              className="flex gap-2 pt-1"
            >
              <input
                type="text"
                placeholder="Or type task (e.g. Call vendor)"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 text-slate-900 text-sm font-bold focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-3 rounded-2xl bento-green font-poster text-lg flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> ADD
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          AT 100 POINTS: STOP EVERYTHING! FULL-SCREEN CAKE CELEBRATION
          ==================================================================== */}
      {celebratingCake && (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-amber-400 via-rose-500 to-purple-900 flex flex-col items-center justify-between p-5 text-center overflow-y-auto">
          <div className="flex items-center justify-center gap-4 text-4xl mt-2">
            <span>🎆</span>
            <span>🎉</span>
            <span>🎂</span>
            <span>✨</span>
            <span>🎆</span>
          </div>

          <div className="max-w-md w-full my-auto space-y-5 py-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-slate-950 text-amber-400 font-poster text-lg tracking-widest">
              🪙 100 / 100 POINTS!
            </div>

            <h1 className="font-poster text-6xl text-white drop-shadow-lg leading-none">
              100 POINTS! CELEBRATE!
            </h1>

            <div className="rounded-[2.25rem] bento-white p-5 space-y-3">
              <div className="text-7xl animate-bounce">🎂</div>
              <IndianCoupleIllustration
                propType="cake"
                customImageUrl={state.customIllustration}
              />
              <p className="font-poster text-3xl text-slate-900">
                Take a break. Eat the cake. 🎂
              </p>
            </div>

            <button
              onClick={handleAteTheCake}
              className="w-full py-5 rounded-[1.85rem] bento-green font-poster text-4xl tracking-wider shadow-2xl"
            >
              🎂 I ATE THE CAKE
            </button>
          </div>

          <div className="text-[10px] font-black uppercase tracking-widest text-white/80">
            RESETS POINTS TO 0 · +1 CAKES EATEN
          </div>
        </div>
      )}

      {/* MINIMAL GLASS HEADER */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/40 dark:bg-slate-950/30 border-b border-white/30 px-4 py-2.5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bento-gold flex items-center justify-center text-lg shadow-sm">
              🌅
            </div>
            <div>
              <h1 className="font-poster text-xl leading-none tracking-wider">
                RUCHITVA RISING
              </h1>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                SRINIVAS · {timeTheme.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Compact Gold Cake & Points Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bento-navy">
            <span className="text-sm">🪙</span>
            <span className="font-poster text-base tracking-wider text-amber-400">
              {state.points}/100
            </span>
            <span className="text-sm">🎂 {state.cakesEaten}</span>
          </div>
        </div>
      </header>

      {/* MAIN BENTO CONTAINER */}
      <main className="max-w-md mx-auto px-3.5 pt-3">
        {activeTab === 'today' && (
          <TodayScreen
            dayMode={dayMode}
            setDayMode={setDayMode}
            tasks={currentTasks}
            onUpdateTask={handleUpdateTask}
            streak={state.streak}
            points={state.points}
            focusMinutesToday={focusMinutesToday}
            isNight={isNight}
            onTriggerConfetti={triggerConfetti}
            onAwardPoints={handleAwardPoints}
            customIllustration={state.customIllustration}
          />
        )}

        {activeTab === 'focus' && (
          <FocusScreen
            focusRules={state.focusRules}
            onToggleFocusRule={handleToggleFocusRule}
            noReelsStreak={state.noReelsStreak}
            noReelsShieldOn={state.noReelsShieldOn}
            isNight={isNight}
            onToggleShield={handleToggleShield}
            onTriggerConfetti={triggerConfetti}
            onAwardPoints={handleAwardPoints}
          />
        )}

        {activeTab === 'dreams' && (
          <DreamBoardScreen
            dreams={state.dreams}
            onStepDream={handleStepDream}
            onUpdateDreamPhoto={handleUpdateDreamPhoto}
            branchesOpened={state.branchesOpened}
            isNight={isNight}
            onToggleBranch={handleToggleBranch}
            onTriggerConfetti={triggerConfetti}
            onAwardPoints={handleAwardPoints}
          />
        )}

        {activeTab === 'money' && (
          <MoneyScreen
            loans={state.loans}
            onPayLoanStep={handlePayLoanStep}
            jarAmount={state.jarAmount}
            jarGoal={state.jarGoal}
            onAddJarCoins={handleAddJarCoins}
            weeklyRecords={state.weeklyRecords}
            isNight={isNight}
            onTriggerConfetti={triggerConfetti}
            onAwardPoints={handleAwardPoints}
          />
        )}

        {activeTab === 'me' && (
          <MeScreen
            gratitudes={state.gratitudes}
            onAddGratitude={handleAddGratitude}
            streak={state.streak}
            noReelsStreak={state.noReelsStreak}
            completedTodayCount={completedTodayCount}
            totalHoursWorked={totalHoursWorked}
            moneySavedJar={state.jarAmount}
            cakesEaten={state.cakesEaten}
            points={state.points}
            isNight={isNight}
            onTriggerConfetti={triggerConfetti}
            onAwardPoints={handleAwardPoints}
          />
        )}
      </main>

      {/* ====================================================================
          BOTTOM NAVIGATION BAR + BIG ROUND MICROPHONE BUTTON ("Add task")
          ==================================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 pointer-events-none">
        <div className="max-w-md mx-auto flex items-end justify-between gap-2 pointer-events-auto">
          {/* 5 Bento Menu Item Cards */}
          <div
            className={`flex-1 grid grid-cols-5 gap-1.5 p-1.5 rounded-[1.75rem] ${
              isNight ? 'bento-glass-dark' : 'bento-white'
            }`}
          >
            {(
              [
                { id: 'today', emoji: '🌅', label: 'TODAY' },
                { id: 'focus', emoji: '🎯', label: 'FOCUS' },
                { id: 'dreams', emoji: '🌟', label: 'DREAMS' },
                { id: 'money', emoji: '💰', label: 'MONEY' },
                { id: 'me', emoji: '🏆', label: 'ME' },
              ] as { id: TabId; emoji: string; label: string }[]
            ).map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playStepChime();
                    setActiveTab(tab.id);
                  }}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all ${
                    active
                      ? 'bento-navy scale-105'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className="text-lg leading-none">{tab.emoji}</span>
                  <span className="text-[9px] font-black uppercase tracking-wider mt-1">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Big Round Microphone Button at the Bottom ("Say 'Add task' to add one") */}
          <button
            onClick={handleMicPress}
            title='Say "Add task" to add one'
            className={`w-14 h-14 rounded-full shrink-0 flex items-center justify-center shadow-2xl transition-transform active:scale-90 ${
              micListening ? 'bento-coral animate-pulse' : 'bento-blue'
            }`}
          >
            <Mic className="w-6 h-6 text-white" />
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
