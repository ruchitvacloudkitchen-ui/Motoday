import React, { useState, useEffect, useRef } from 'react';
import {
  DailyTask,
  DayMode,
  TimeThemeMode,
  FOCUS_QUOTES,
  MANIFESTATION_CARDS,
} from '../data/ruchitvaData';
import {
  playCoinSound,
  playGentleTaskAlert,
  playSoftPopSound,
  playStepChime,
  setCalmMusicPlaying,
} from '../utils/soundAndVoice';
import {
  NatureLandscapeHeader,
  ManifestationBanner,
  PastelCardIllustration,
  MeditatingPersonSVG,
  CakeProgressCard,
} from './CartoonIllustrations';

interface HomeScreenProps {
  dayMode: DayMode;
  setDayMode: (mode: DayMode) => void;
  tasks: DailyTask[];
  onUpdateTask: (id: string, updates: Partial<DailyTask>) => void;
  streak: number;
  points: number;
  theme: TimeThemeMode;
  onAwardPoints: (pts: number) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  dayMode,
  setDayMode,
  tasks,
  onUpdateTask,
  streak,
  points,
  theme,
  onAwardPoints,
}) => {
  const isNight = theme === 'night';
  const [currentTimeDate, setCurrentTimeDate] = useState<Date>(() => new Date());
  const [nowTick, setNowTick] = useState<number>(() => Date.now());

  // "All tasks" sheet & "Do it when?" skip prompt state
  const [showAllTasks, setShowAllTasks] = useState<boolean>(false);
  const [skippingTaskId, setSkippingTaskId] = useState<string | null>(null);

  // Full-Screen Focus Mode state (opens when user taps "Start" on the NOW card)
  const [focusTask, setFocusTask] = useState<DailyTask | null>(null);
  const [focusSecondsLeft, setFocusSecondsLeft] = useState<number>(25 * 60);
  const [focusPaused, setFocusPaused] = useState<boolean>(false);
  const [distractionCount, setDistractionCount] = useState<number>(0);
  const [breathePhase, setBreathePhase] = useState<'Breathe In' | 'Breathe Out'>(
    'Breathe In'
  );

  const taskItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastAlertedTaskIdRef = useRef<string | null>(null);

  // Check phone clock every 15 seconds
  useEffect(() => {
    const checkClock = () => setCurrentTimeDate(new Date());
    checkClock();
    const interval = setInterval(checkClock, 15000);
    return () => clearInterval(interval);
  }, []);

  // Live timer tick for running task on Home
  useEffect(() => {
    const hasRunning = tasks.some((t) => t.status === 'processing');
    if (!hasRunning) return;
    const interval = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  // Determine current task and next task by phone clock
  const currentTotalMins =
    currentTimeDate.getHours() * 60 + currentTimeDate.getMinutes();

  let currentTaskIndex = -1;
  for (let i = 0; i < tasks.length; i++) {
    const start = tasks[i].startMins;
    const nextStart =
      i + 1 < tasks.length ? tasks[i + 1].startMins : 24 * 60 + 60;
    if (currentTotalMins >= start && currentTotalMins < nextStart) {
      currentTaskIndex = i;
      break;
    }
  }
  if (currentTaskIndex === -1 && tasks.length > 0) {
    const firstOpen = tasks.findIndex(
      (t) => t.status !== 'completed' && t.status !== 'cancelled'
    );
    currentTaskIndex = firstOpen !== -1 ? firstOpen : 0;
  }

  const currentTask = tasks[currentTaskIndex] || tasks[0];
  const nextTask =
    currentTaskIndex + 1 < tasks.length
      ? tasks[currentTaskIndex + 1]
      : tasks[0];

  // Gentle sound & small vibration when a new task window starts
  useEffect(() => {
    if (!currentTask) return;
    if (lastAlertedTaskIdRef.current === null) {
      lastAlertedTaskIdRef.current = currentTask.id;
      return;
    }
    if (lastAlertedTaskIdRef.current !== currentTask.id) {
      lastAlertedTaskIdRef.current = currentTask.id;
      playGentleTaskAlert();
    }
  }, [currentTask?.id]);

  // Auto-scroll to the current task when "All tasks" opens
  useEffect(() => {
    if (!showAllTasks || !currentTask) return;
    const timer = setTimeout(() => {
      taskItemRefs.current[currentTask.id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [showAllTasks, currentTask]);

  // Focus Mode countdown + breathing text toggle
  useEffect(() => {
    if (!focusTask || focusPaused) return;
    const interval = setInterval(() => {
      setFocusSecondsLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [focusTask, focusPaused]);

  useEffect(() => {
    if (!focusTask) return;
    const breathInterval = setInterval(() => {
      setBreathePhase((prev) =>
        prev === 'Breathe In' ? 'Breathe Out' : 'Breathe In'
      );
    }, 3500);
    return () => clearInterval(breathInterval);
  }, [focusTask]);

  // Count how many times the user leaves the app during Focus Mode
  useEffect(() => {
    if (!focusTask) return;
    const handleVisibility = () => {
      if (document.hidden) {
        setDistractionCount((c) => c + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [focusTask]);

  const formatRunningTime = (startedAt?: number) => {
    if (!startedAt) return '00:00';
    const secs = Math.max(0, Math.floor((nowTick - startedAt) / 1000));
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Start button on NOW card -> Gentle sound + vibration, marks task running, opens Focus Mode
  const handleStartNowTask = (task: DailyTask) => {
    playGentleTaskAlert();
    setCalmMusicPlaying(true);
    const startedTime = task.startedAt || Date.now();
    onUpdateTask(task.id, {
      status: 'processing',
      startedAt: startedTime,
      rescheduledTo: undefined,
    });
    setFocusTask({ ...task, status: 'processing', startedAt: startedTime });
    setFocusSecondsLeft(25 * 60);
    setFocusPaused(false);
    setDistractionCount(0);
  };

  // Done button (Task done = 10 points; if finished from Focus Mode, Focus done = 20 points)
  const handleDoneTask = (task: DailyTask, fromFocusMode: boolean = false) => {
    setCalmMusicPlaying(false);
    playCoinSound();
    const wasAlreadyDone = task.status === 'completed';
    onUpdateTask(task.id, {
      status: 'completed',
      minutesTaken: 25,
    });
    if (!wasAlreadyDone) {
      onAwardPoints(fromFocusMode ? 20 : 10);
    } else if (fromFocusMode) {
      onAwardPoints(20);
    }
    setFocusTask(null);
  };

  // Skip task -> ask once: "Do it when?" with 2 buttons: "Today night" and "Tomorrow"
  const handleConfirmSkipWhen = (
    taskId: string,
    whenLabel: 'Today night' | 'Tomorrow'
  ) => {
    playStepChime();
    onUpdateTask(taskId, {
      status: 'cancelled',
      rescheduledTo: whenLabel,
    });
    setSkippingTaskId(null);
  };

  const doneCount = tasks.filter((t) => t.status === 'completed').length;
  const focusMM = String(Math.floor(focusSecondsLeft / 60)).padStart(2, '0');
  const focusSS = String(focusSecondsLeft % 60).padStart(2, '0');
  const quoteLine = FOCUS_QUOTES[doneCount % FOCUS_QUOTES.length];

  return (
    <div className="space-y-4 pb-28">
      {/* ====================================================================
          FOCUS MODE (FULL SCREEN — Opens when user taps "Start" on NOW card)
          Soft peach-to-blue gradient, breathing white circle, meditating person,
          distraction counter ("Zero distractions"), Pause & Done buttons only.
          ==================================================================== */}
      {focusTask && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-between px-6 py-8 text-center ${
            isNight
              ? 'bg-gradient-to-b from-[#0F1E32] via-[#163247] to-[#1D404B] text-white'
              : 'bg-gradient-to-b from-[#FDECE4] via-[#F3F1FC] to-[#E6F4FE] text-[#1F2937]'
          }`}
        >
          {/* Top: Task Name & Distraction Counter */}
          <div className="space-y-1.5 pt-2">
            <div className="inline-block px-3.5 py-1 rounded-full bg-white/75 text-[#1F2937] text-xs font-extrabold tracking-wide shadow-2xs">
              {distractionCount === 0
                ? '✨ Zero distractions'
                : `${distractionCount} distraction${
                    distractionCount > 1 ? 's' : ''
                  }`}
            </div>
            <h2 className="font-serif-calm text-3xl font-bold pt-1">
              {focusTask.title}
            </h2>
            <p className="text-sm font-semibold opacity-75">{quoteLine}</p>
          </div>

          {/* Middle: One Big Glowing White Circle that Breathes In and Out */}
          <div className="my-auto flex flex-col items-center justify-center">
            <div
              className={`w-60 h-60 rounded-full bg-white text-[#1F2937] flex flex-col items-center justify-center shadow-xl ${
                focusPaused ? '' : 'animate-breathe'
              }`}
            >
              <span className="text-sm font-bold text-[#2D8A6E] tracking-wide mb-1">
                {focusPaused ? 'Paused' : breathePhase}
              </span>
              <span className="text-5xl font-black tracking-tight">
                {focusMM}:{focusSS}
              </span>
              <span className="text-xs font-bold text-slate-400 mt-1.5">
                +20 points
              </span>
            </div>
          </div>

          {/* Bottom: Small Meditating Character + 2 Buttons Only ("Pause" and "Done") */}
          <div className="w-full max-w-xs space-y-4">
            <MeditatingPersonSVG />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const nextPaused = !focusPaused;
                  setFocusPaused(nextPaused);
                  setCalmMusicPlaying(!nextPaused);
                }}
                className="py-4 rounded-full bg-white text-[#1F2937] font-extrabold text-base shadow-md active:scale-95 transition-transform"
              >
                {focusPaused ? 'Resume' : 'Pause'}
              </button>

              <button
                onClick={() => handleDoneTask(focusTask, true)}
                className="py-4 rounded-full bg-[#2D8A6E] text-white font-extrabold text-base shadow-md active:scale-95 transition-transform"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          "ALL TASKS" FULL LIST MODAL (Wide pastel cards like Image 1)
          ==================================================================== */}
      {showAllTasks && (
        <div
          className={`fixed inset-0 z-50 overflow-y-auto px-4 py-6 ${
            isNight ? 'bg-[#0F1A2C] text-white' : 'bg-[#FAF8F5] text-[#1F2937]'
          }`}
        >
          <div className="max-w-md mx-auto space-y-4 pb-16">
            {/* Top Header + Day Switcher + Back */}
            <div className="flex items-center justify-between">
              <h2 className="font-serif-calm text-2xl font-bold">
                Today&apos;s Activities
              </h2>
              <button
                onClick={() => {
                  setShowAllTasks(false);
                  setSkippingTaskId(null);
                }}
                className="px-4 py-2 rounded-full bg-white text-[#1F2937] text-sm font-extrabold shadow-xs"
              >
                Close
              </button>
            </div>

            {/* Day Plan Selector (Weekday / Saturday / Sunday) */}
            <div className="flex gap-2">
              {(
                [
                  { id: 'weekday', label: 'Weekday' },
                  { id: 'saturday', label: 'Saturday' },
                  { id: 'sunday', label: 'Sunday' },
                ] as { id: DayMode; label: string }[]
              ).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDayMode(d.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                    dayMode === d.id
                      ? 'bg-[#2D8A6E] text-white'
                      : isNight
                      ? 'bg-white/10 text-slate-300'
                      : 'bg-white text-slate-600'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Wide Pastel Cards List (Image 1 style) */}
            <div className="space-y-3">
              {tasks.map((task, idx) => {
                const isCurrent = idx === currentTaskIndex;
                // Round status dot: grey = not started, blue = running, green = done, red = cancelled
                const dotClass =
                  task.status === 'completed'
                    ? 'bg-emerald-500'
                    : task.status === 'processing'
                    ? 'bg-sky-500 animate-pulse'
                    : task.status === 'cancelled'
                    ? 'bg-rose-500'
                    : 'bg-slate-400';

                const pastelClass = isNight
                  ? 'night-card'
                  : task.pastelTone === 'peach'
                  ? 'pastel-peach'
                  : task.pastelTone === 'mint'
                  ? 'pastel-mint'
                  : task.pastelTone === 'lavender'
                  ? 'pastel-lavender'
                  : 'pastel-sky';

                return (
                  <div
                    key={task.id}
                    ref={(el) => {
                      taskItemRefs.current[task.id] = el;
                    }}
                    className={`rounded-[26px] p-4 transition-all ${pastelClass} ${
                      isCurrent ? 'ring-2 ring-[#2D8A6E]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        {/* Small Time Chip at Top-Left + Status Dot */}
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-white/80 text-[#1F2937] text-[11px] font-extrabold">
                            {task.time}
                          </span>
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${dotClass}`}
                          />
                          {task.rescheduledTo && (
                            <span className="text-[11px] font-bold opacity-75">
                              · {task.rescheduledTo}
                            </span>
                          )}
                        </div>

                        {/* Bold Title */}
                        <div className="text-lg font-extrabold leading-snug truncate pt-0.5">
                          {task.title}
                        </div>

                        {/* 5-Word Benefit Line */}
                        <p className="text-xs font-semibold opacity-70">
                          {task.benefit}
                        </p>

                        {/* Action Links: Start / Done / Skip */}
                        <div className="flex items-center gap-2 pt-2">
                          {task.status !== 'completed' ? (
                            <>
                              <button
                                onClick={() => {
                                  setShowAllTasks(false);
                                  handleStartNowTask(task);
                                }}
                                className="px-3.5 py-1.5 rounded-full bg-[#2D8A6E] text-white text-xs font-extrabold"
                              >
                                Start
                              </button>
                              <button
                                onClick={() => handleDoneTask(task, false)}
                                className="px-3.5 py-1.5 rounded-full bg-white/85 text-[#1F2937] text-xs font-extrabold"
                              >
                                Done
                              </button>
                              <button
                                onClick={() => setSkippingTaskId(task.id)}
                                className="px-3 py-1.5 rounded-full text-xs font-bold opacity-65"
                              >
                                Skip
                              </button>
                            </>
                          ) : (
                            <span className="text-xs font-extrabold text-emerald-700">
                              ✓ Completed (+10 pts)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Cute Flat Illustration on the Right Side */}
                      <PastelCardIllustration
                        variant={task.illustrationVariant}
                        size={62}
                      />
                    </div>

                    {/* If a task is skipped, ask once: "Do it when?" with 2 buttons: "Today night" and "Tomorrow" */}
                    {skippingTaskId === task.id && (
                      <div className="mt-3 pt-3 border-t border-black/10 flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold">
                          Do it when?
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleConfirmSkipWhen(task.id, 'Today night')
                            }
                            className="px-3.5 py-1.5 rounded-full bg-white text-[#1F2937] text-xs font-extrabold shadow-2xs"
                          >
                            Today night
                          </button>
                          <button
                            onClick={() =>
                              handleConfirmSkipWhen(task.id, 'Tomorrow')
                            }
                            className="px-3.5 py-1.5 rounded-full bg-[#2D8A6E] text-white text-xs font-extrabold shadow-2xs"
                          >
                            Tomorrow
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          1. TOP LANDSCAPE HEADER (Greeting + Flame Streak)
          ==================================================================== */}
      <NatureLandscapeHeader theme={theme} streak={streak} />

      {/* ====================================================================
          1B. MANIFESTATION BANNER (Right under the greeting)
          Full width, soft gradient by time theme, small illustration (sun/star/lotus),
          28px+ bold centre-aligned line, tap anywhere to slide/flip with soft pop sound,
          bottom indicator dots, remembers last shown line & picks first line by day number.
          ==================================================================== */}
      <ManifestationBanner
        theme={theme}
        cards={MANIFESTATION_CARDS}
        onPlayPop={playSoftPopSound}
      />

      {/* ====================================================================
          2. ONE BIG CARD: "NOW"
          Shows current task by phone clock, its time, 5-word benefit,
          flat illustration on right, and ONE big button: "Start" (or "Done" when running)
          ==================================================================== */}
      {currentTask && (
        <div
          className={`rounded-[30px] p-5 transition-all ${
            isNight ? 'night-card' : 'pastel-peach'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/85 text-[#1F2937] text-xs font-extrabold">
                <span>NOW · {currentTask.time}</span>
                {currentTask.status === 'processing' && (
                  <span className="text-[#2D8A6E]">
                    · {formatRunningTime(currentTask.startedAt)}
                  </span>
                )}
              </div>

              <h2 className="font-serif-calm text-2xl sm:text-[26px] font-bold leading-snug pt-1">
                {currentTask.title}
              </h2>

              <p className="text-sm font-semibold opacity-75">
                {currentTask.benefit}
              </p>
            </div>

            <PastelCardIllustration
              variant={currentTask.illustrationVariant}
              size={76}
            />
          </div>

          <div className="mt-4">
            {currentTask.status === 'processing' ? (
              <button
                onClick={() => handleDoneTask(currentTask, false)}
                className="w-full py-3.5 rounded-full bg-[#2D8A6E] text-white font-extrabold text-base shadow-sm active:scale-[0.99] transition-transform"
              >
                Done ({formatRunningTime(currentTask.startedAt)})
              </button>
            ) : (
              <button
                onClick={() => handleStartNowTask(currentTask)}
                className="w-full py-3.5 rounded-full bg-[#2D8A6E] text-white font-extrabold text-base shadow-sm active:scale-[0.99] transition-transform"
              >
                Start
              </button>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          3. SMALL CARD: "NEXT" WITH NEXT TASK NAME AND TIME
          ==================================================================== */}
      {nextTask && (
        <div
          className={`rounded-[26px] px-5 py-4 flex items-center justify-between gap-3 ${
            isNight ? 'night-card' : 'pastel-mint'
          }`}
        >
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider opacity-65">
              NEXT · {nextTask.time}
            </span>
            <div className="text-lg font-extrabold mt-0.5">
              {nextTask.title}
            </div>
          </div>

          <PastelCardIllustration
            variant={nextTask.illustrationVariant}
            size={48}
          />
        </div>
      )}

      {/* ====================================================================
          4. ONE PROGRESS CARD: "POINTS 40 / 100" WITH LAYER-BY-LAYER CAKE
          ==================================================================== */}
      <CakeProgressCard
        points={points}
        doneCount={doneCount}
        totalCount={tasks.length}
        isNight={isNight}
      />

      {/* ====================================================================
          5. SMALL LINK AT THE BOTTOM: "All tasks"
          ==================================================================== */}
      <div className="text-center pt-1">
        <button
          onClick={() => setShowAllTasks(true)}
          className={`text-sm font-extrabold underline underline-offset-4 opacity-75 hover:opacity-100 ${
            isNight ? 'text-amber-200' : 'text-[#2D8A6E]'
          }`}
        >
          All tasks
        </button>
      </div>
    </div>
  );
};
