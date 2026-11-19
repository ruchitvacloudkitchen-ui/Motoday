import React, { useState, useEffect, useCallback } from 'react';
import { Home, Sparkles, Wallet } from 'lucide-react';
import {
  DayMode,
  DailyTask,
  DreamCardItem,
  MoneyStateData,
  MustDoBoxItem,
  TimeThemeMode,
  WEEKDAY_TASKS,
  SATURDAY_TASKS,
  SUNDAY_TASKS,
  INITIAL_DREAMS,
  INITIAL_MONEY_STATE,
  INITIAL_MUST_DOS,
  getThemeByHour,
} from './data/ruchitvaData';
import { HomeScreen } from './components/TodayAndFocusScreens';
import {
  DreamsScreen,
  MoneyScreen,
} from './components/DreamsMoneyMeScreens';
import {
  playHappyCakeFanfare,
  playStepChime,
} from './utils/soundAndVoice';

// ONLY 3 TABS: Home, Dreams, Money
type TabId = 'home' | 'dreams' | 'money';

const STORAGE_KEY = 'ruchitva_rising_darkglass_v6';

interface PersistedState {
  weekdayTasks: DailyTask[];
  saturdayTasks: DailyTask[];
  sundayTasks: DailyTask[];
  mustDos: MustDoBoxItem[];
  mustDosDate: string;
  dreams: DreamCardItem[];
  money: MoneyStateData;
  streak: number;
  points: number;
}

const getTodayDateKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(now.getDate()).padStart(2, '0')}`;
};

const getAutoDayMode = (): DayMode => {
  const day = new Date().getDay();
  if (day === 6) return 'saturday';
  if (day === 0) return 'sunday';
  return 'weekday';
};

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [dayMode, setDayMode] = useState<DayMode>(getAutoDayMode);
  const [theme, setTheme] = useState<TimeThemeMode>(() =>
    getThemeByHour(new Date().getHours())
  );
  const [celebratingCake, setCelebratingCake] = useState<boolean>(false);
  const [confettiPieces, setConfettiPieces] = useState<
    { id: number; left: number; emoji: string; delay: number }[]
  >([]);

  // Update theme automatically by phone clock
  useEffect(() => {
    const updateClockTheme = () => {
      setTheme(getThemeByHour(new Date().getHours()));
    };
    updateClockTheme();
    const interval = setInterval(updateClockTheme, 30000);
    return () => clearInterval(interval);
  }, []);

  const [state, setState] = useState<PersistedState>(() => {
    const todayKey = getTodayDateKey();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PersistedState;
        const storedMustDos = Array.isArray(parsed.mustDos)
          ? parsed.mustDos
          : INITIAL_MUST_DOS;

        // Reset the 3 Must-Do boxes each new day; if yesterday had an unfinished box, show "Carry over?"
        if (parsed.mustDosDate && parsed.mustDosDate !== todayKey) {
          const resetMustDos: MustDoBoxItem[] = storedMustDos.map((b) => ({
            ...b,
            text: '',
            done: false,
            reminderTime: undefined,
            reminderTriggered: false,
            carryOverText:
              !b.done && b.text && b.text.trim().length > 0
                ? b.text.trim()
                : b.carryOverText,
          }));
          return {
            ...parsed,
            mustDos: resetMustDos,
            mustDosDate: todayKey,
          };
        }

        return {
          ...parsed,
          mustDos: storedMustDos,
          mustDosDate: todayKey,
          dreams: Array.isArray(parsed.dreams)
            ? parsed.dreams
            : INITIAL_DREAMS,
        };
      }
    } catch {
      // Ignore storage errors
    }
    return {
      weekdayTasks: WEEKDAY_TASKS,
      saturdayTasks: SATURDAY_TASKS,
      sundayTasks: SUNDAY_TASKS,
      mustDos: INITIAL_MUST_DOS,
      mustDosDate: todayKey,
      dreams: INITIAL_DREAMS,
      money: INITIAL_MONEY_STATE,
      streak: 12,
      points: 40,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [state]);

  // Also check daily rollover if app remains open past midnight
  useEffect(() => {
    const checkDayRollover = () => {
      const todayKey = getTodayDateKey();
      setState((prev) => {
        if (prev.mustDosDate === todayKey) return prev;
        return {
          ...prev,
          mustDosDate: todayKey,
          mustDos: prev.mustDos.map((b) => ({
            ...b,
            text: '',
            done: false,
            reminderTime: undefined,
            reminderTriggered: false,
            carryOverText:
              !b.done && b.text && b.text.trim().length > 0
                ? b.text.trim()
                : b.carryOverText,
          })),
        };
      });
    };
    const interval = setInterval(checkDayRollover, 60000);
    return () => clearInterval(interval);
  }, []);

  const triggerConfetti = useCallback(() => {
    const emojis = ['🎂', '✨', '🎉', '🌸', '🌟', '🍰'];
    const pieces = Array.from({ length: 24 }).map((_, idx) => ({
      id: Date.now() + idx,
      left: Math.random() * 90 + 5,
      emoji: emojis[idx % emojis.length],
      delay: Math.random() * 0.35,
    }));
    setConfettiPieces(pieces);
    setTimeout(() => setConfettiPieces([]), 2400);
  }, []);

  // Task done = 10 points, Focus done = 20 points. At 100 points -> Cake Celebration!
  const handleAwardPoints = useCallback(
    (pts: number) => {
      setState((prev) => {
        const nextPoints = prev.points + pts;
        if (nextPoints >= 100) {
          setTimeout(() => {
            playHappyCakeFanfare();
            triggerConfetti();
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
    },
    [triggerConfetti]
  );

  // "I ate it" button resets points to 0
  const handleAteCake = () => {
    playStepChime();
    setCelebratingCake(false);
    setState((prev) => ({
      ...prev,
      points: 0,
    }));
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

  const handleUpdateMustDo = (
    id: string,
    updates: Partial<MustDoBoxItem>
  ) => {
    setState((prev) => ({
      ...prev,
      mustDos: prev.mustDos.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    }));
  };

  const handleUpdateDream = (id: string, updates: Partial<DreamCardItem>) => {
    setState((prev) => ({
      ...prev,
      dreams: prev.dreams.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    }));
  };

  const handleAddDream = (newDream: DreamCardItem) => {
    setState((prev) => ({
      ...prev,
      dreams: [newDream, ...prev.dreams],
    }));
  };

  const handleDeleteDream = (id: string) => {
    setState((prev) => ({
      ...prev,
      dreams: prev.dreams.filter((d) => d.id !== id),
    }));
  };

  const handleSaveWeekMoney = (
    sales: number,
    costs: number,
    loanPaid: number,
    saved: number,
    ordersToday: number
  ) => {
    const entryProfit = Math.max(0, sales - costs);
    setState((prev) => {
      const prevSaved = prev.money.saved || 0;
      const nextSaved = prevSaved + saved;

      // At 25% (1.25L), 50% (2.5L), 75% (3.75L), and 100% (5L) of ₹5 Lakh goal: play confetti and a happy sound
      const milestones = [125000, 250000, 375000, 500000];
      const crossedMilestone = milestones.some(
        (m) => prevSaved < m && nextSaved >= m
      );
      if (crossedMilestone) {
        setTimeout(() => {
          playHappyCakeFanfare();
          triggerConfetti();
        }, 100);
      }

      const prevOrdersWeek = prev.money.ordersWeek ?? 110;
      const prevOrdersMonth = prev.money.ordersMonth ?? 420;

      return {
        ...prev,
        money: {
          ...prev.money,
          loansLeft: Math.max(0, prev.money.loansLeft - loanPaid),
          saved: nextSaved,
          profit: entryProfit > 0 ? entryProfit : prev.money.profit,
          ordersToday:
            ordersToday > 0 ? ordersToday : (prev.money.ordersToday ?? 25),
          ordersWeek: prevOrdersWeek + ordersToday,
          ordersMonth: prevOrdersMonth + ordersToday,
        },
      };
    });
  };

  const isNight = theme === 'night';
  const isDreamsTab = activeTab === 'dreams';
  const isDarkBottomBar = isDreamsTab || isNight;

  // Deep teal-navy background with a soft glow on Dreams page
  const appBgClass = isDreamsTab
    ? 'bg-[radial-gradient(circle_at_50%_12%,#0E4D64_0%,#051C28_55%,#020A10_100%)] text-[#F8FAFC]'
    : theme === 'night'
    ? 'bg-[#0F1A2C] text-[#F8FAFC]'
    : theme === 'evening'
    ? 'bg-[#FFF6F2] text-[#1F2937]'
    : 'bg-[#FAF8F5] text-[#1F2937]';

  return (
    <div
      className={`min-h-screen transition-colors duration-700 ${appBgClass}`}
    >
      {/* CONFETTI OVERLAY */}
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

      {/* ====================================================================
          AT 100 POINTS: FULL-SCREEN CONFETTI WITH BIG CARTOON CAKE
          Text: "100 POINTS! EAT THE CAKE!" and button "I ate it" (resets to 0)
          ==================================================================== */}
      {celebratingCake && (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#FDECE4] via-[#FAF8F5] to-[#E3F6EE] text-[#1F2937] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-xs w-full space-y-6">
            {/* Big Cartoon Cake SVG */}
            <svg
              viewBox="0 0 180 160"
              className="w-44 h-40 mx-auto select-none"
            >
              <ellipse cx="90" cy="144" rx="72" ry="10" fill="#E2E8F0" />
              <rect
                x="30"
                y="98"
                width="120"
                height="42"
                rx="14"
                fill="#FBCFE8"
              />
              <rect
                x="44"
                y="62"
                width="92"
                height="36"
                rx="12"
                fill="#FDE68A"
              />
              <rect
                x="60"
                y="34"
                width="60"
                height="28"
                rx="10"
                fill="#A7F3D0"
              />
              {/* Candles */}
              {[74, 90, 106].map((cx) => (
                <g key={cx}>
                  <rect
                    x={cx - 3}
                    y="16"
                    width="6"
                    height="18"
                    rx="3"
                    fill="#FFFFFF"
                  />
                  <circle cx={cx} cy="11" r="5" fill="#FB923C" />
                </g>
              ))}
            </svg>

            <h1 className="font-serif-calm text-3xl font-bold leading-snug">
              100 POINTS! EAT THE CAKE!
            </h1>

            <button
              onClick={handleAteCake}
              className="w-full py-4 rounded-full bg-[#2D8A6E] text-white font-extrabold text-base shadow-md active:scale-95 transition-transform"
            >
              I ate it
            </button>
          </div>
        </div>
      )}

      {/* MAIN MOBILE CONTAINER */}
      <main className="max-w-md mx-auto px-4 pt-4">
        {activeTab === 'home' && (
          <HomeScreen
            dayMode={dayMode}
            setDayMode={setDayMode}
            tasks={currentTasks}
            onUpdateTask={handleUpdateTask}
            mustDos={state.mustDos}
            onUpdateMustDo={handleUpdateMustDo}
            streak={state.streak}
            points={state.points}
            theme={theme}
            onAwardPoints={handleAwardPoints}
            onTriggerConfetti={triggerConfetti}
          />
        )}

        {activeTab === 'dreams' && (
          <DreamsScreen
            dreams={state.dreams}
            money={state.money}
            onUpdateDream={handleUpdateDream}
            onAddDream={handleAddDream}
            onDeleteDream={handleDeleteDream}
            onTriggerConfetti={triggerConfetti}
          />
        )}

        {activeTab === 'money' && (
          <MoneyScreen
            money={state.money}
            onSaveEntry={handleSaveWeekMoney}
            isNight={isNight}
          />
        )}
      </main>

      {/* ====================================================================
          FLOATING GLASS BOTTOM BAR (ROUND ICONS) LIKE THE REFERENCE:
          Home, Dreams, Money. The active icon is a bright glowing circle.
          ==================================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 px-6 pb-5 pt-2 pointer-events-none">
        <div
          className={`max-w-[290px] mx-auto h-[68px] rounded-full px-3 flex items-center justify-between backdrop-blur-2xl shadow-[0_14px_36px_rgba(0,0,0,0.45)] pointer-events-auto transition-colors duration-500 ${
            isDarkBottomBar
              ? 'bg-[#082230]/80 border border-white/20 text-white'
              : 'bg-white/85 border border-slate-200/80 text-slate-700'
          }`}
        >
          {/* Home Round Icon */}
          <button
            onClick={() => {
              playStepChime();
              setActiveTab('home');
            }}
            aria-label="Home"
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all duration-300 active:scale-95 ${
              activeTab === 'home'
                ? 'bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] text-white shadow-[0_0_20px_rgba(56,189,248,0.8)] border border-sky-200/60 scale-105'
                : isDarkBottomBar
                ? 'bg-white/10 border border-white/15 text-white/75 hover:bg-white/20'
                : 'bg-slate-100/90 border border-slate-200 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-extrabold tracking-tight leading-none mt-0.5">
              Home
            </span>
          </button>

          {/* Dreams Round Icon */}
          <button
            onClick={() => {
              playStepChime();
              setActiveTab('dreams');
            }}
            aria-label="Dreams"
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all duration-300 active:scale-95 ${
              activeTab === 'dreams'
                ? 'bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] text-white shadow-[0_0_20px_rgba(56,189,248,0.8)] border border-sky-200/60 scale-105'
                : isDarkBottomBar
                ? 'bg-white/10 border border-white/15 text-white/75 hover:bg-white/20'
                : 'bg-slate-100/90 border border-slate-200 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[9px] font-extrabold tracking-tight leading-none mt-0.5">
              Dreams
            </span>
          </button>

          {/* Money Round Icon */}
          <button
            onClick={() => {
              playStepChime();
              setActiveTab('money');
            }}
            aria-label="Money"
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all duration-300 active:scale-95 ${
              activeTab === 'money'
                ? 'bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] text-white shadow-[0_0_20px_rgba(56,189,248,0.8)] border border-sky-200/60 scale-105'
                : isDarkBottomBar
                ? 'bg-white/10 border border-white/15 text-white/75 hover:bg-white/20'
                : 'bg-slate-100/90 border border-slate-200 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[9px] font-extrabold tracking-tight leading-none mt-0.5">
              Money
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
