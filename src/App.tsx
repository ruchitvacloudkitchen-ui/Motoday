import React, { useState, useEffect, useCallback } from 'react';
import { Home, Sparkles, Wallet } from 'lucide-react';
import {
  DayMode,
  DailyTask,
  DreamCardItem,
  MoneyStateData,
  TimeThemeMode,
  WEEKDAY_TASKS,
  SATURDAY_TASKS,
  SUNDAY_TASKS,
  INITIAL_DREAMS,
  INITIAL_MONEY_STATE,
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

const STORAGE_KEY = 'ruchitva_rising_calm_v5';

interface PersistedState {
  weekdayTasks: DailyTask[];
  saturdayTasks: DailyTask[];
  sundayTasks: DailyTask[];
  dreams: DreamCardItem[];
  money: MoneyStateData;
  streak: number;
  points: number;
}

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
      dreams: INITIAL_DREAMS,
      money: INITIAL_MONEY_STATE,
      streak: 12,
      points: 40, // "POINTS 40 / 100"
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [state]);

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
  const appBgClass =
    theme === 'night'
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
            streak={state.streak}
            points={state.points}
            theme={theme}
            onAwardPoints={handleAwardPoints}
          />
        )}

        {activeTab === 'dreams' && (
          <DreamsScreen
            dreams={state.dreams}
            money={state.money}
            isNight={isNight}
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
          BOTTOM TAB BAR (ONLY 3 TABS: Dreams on Left, Big Round Green Home
          Button Floating in the Middle, Money on Right)
          ==================================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 px-6 pb-4 pt-2 pointer-events-none">
        <div
          className={`max-w-sm mx-auto h-16 rounded-full px-8 flex items-center justify-between shadow-lg pointer-events-auto ${
            isNight
              ? 'bg-[#18263E]/95 border border-white/10 text-slate-300'
              : 'bg-white/95 border border-slate-100 text-slate-500'
          }`}
        >
          {/* Left Tab: Dreams */}
          <button
            onClick={() => {
              playStepChime();
              setActiveTab('dreams');
            }}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              activeTab === 'dreams'
                ? 'text-[#2D8A6E] font-extrabold'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[11px] font-bold">Dreams</span>
          </button>

          {/* Centre Tab: BIG ROUND GREEN HOME BUTTON (Floats above the bar) */}
          <button
            onClick={() => {
              playStepChime();
              setActiveTab('home');
            }}
            aria-label="Home"
            className={`-mt-7 w-16 h-16 rounded-full bg-[#2D8A6E] text-white flex flex-col items-center justify-center shadow-xl border-4 transition-transform active:scale-95 ${
              isNight ? 'border-[#0F1A2C]' : 'border-[#FAF8F5]'
            }`}
          >
            <Home className="w-6 h-6" />
          </button>

          {/* Right Tab: Money */}
          <button
            onClick={() => {
              playStepChime();
              setActiveTab('money');
            }}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              activeTab === 'money'
                ? 'text-[#2D8A6E] font-extrabold'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[11px] font-bold">Money</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
