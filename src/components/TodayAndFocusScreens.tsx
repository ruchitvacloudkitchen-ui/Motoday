import React, { useState, useEffect, useRef } from 'react';
import { Check, Bell, Calendar } from 'lucide-react';
import {
  DailyTask,
  DayMode,
  TimeThemeMode,
  MustDoBoxItem,
  FOCUS_QUOTES,
  MANIFESTATION_CARDS,
} from '../data/ruchitvaData';
import {
  playCoinSound,
  playGentleTaskAlert,
  playSoftPopSound,
  playStepChime,
  playLoudAlarmSound,
  downloadAlarmIcsFile,
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
  mustDos: MustDoBoxItem[];
  onUpdateMustDo: (id: string, updates: Partial<MustDoBoxItem>) => void;
  streak: number;
  points: number;
  theme: TimeThemeMode;
  onAwardPoints: (pts: number) => void;
  onTriggerConfetti: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  dayMode,
  setDayMode,
  tasks,
  onUpdateTask,
  mustDos,
  onUpdateMustDo,
  streak,
  points,
  theme,
  onAwardPoints,
  onTriggerConfetti,
}) => {
  const isNight = theme === 'night';
  const [currentTimeDate, setCurrentTimeDate] = useState<Date>(() => new Date());
  const [nowTick, setNowTick] = useState<number>(() => Date.now());

  // "All tasks" sheet & "Do it when?" skip prompt state
  const [showAllTasks, setShowAllTasks] = useState<boolean>(false);
  const [skippingTaskId, setSkippingTaskId] = useState<string | null>(null);

  // Full-Screen Focus Mode state
  const [focusTask, setFocusTask] = useState<DailyTask | null>(null);
  const [focusSecondsLeft, setFocusSecondsLeft] = useState<number>(25 * 60);
  const [focusPaused, setFocusPaused] = useState<boolean>(false);
  const [distractionCount, setDistractionCount] = useState<number>(0);
  const [breathePhase, setBreathePhase] = useState<'Breathe In' | 'Breathe Out'>(
    'Breathe In'
  );

  // 3 Must-Dos Reminder Time Picker & Active Alarm state
  const [activeRemindBoxId, setActiveRemindBoxId] = useState<string | null>(
    null
  );
  const [remindMode, setRemindMode] = useState<
    '1h' | 'evening' | 'custom'
  >('1h');
  const [customTimeVal, setCustomTimeVal] = useState<string>('18:00');
  const [notifBannerMsg, setNotifBannerMsg] = useState<string | null>(null);
  const [ringingMustDo, setRingingMustDo] = useState<MustDoBoxItem | null>(
    null
  );
  const [allThreeCelebrated, setAllThreeCelebrated] = useState<boolean>(false);

  const taskItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastAlertedTaskIdRef = useRef<string | null>(null);

  // Update phone clock every 15 seconds (checks every minute)
  useEffect(() => {
    const checkClock = () => setCurrentTimeDate(new Date());
    checkClock();
    const interval = setInterval(checkClock, 15000);
    return () => clearInterval(interval);
  }, []);

  // Live timer tick every second for running tasks AND reminder alarm check
  useEffect(() => {
    const interval = setInterval(() => {
      const nowMs = Date.now();
      setNowTick(nowMs);

      // Check if any Must-Do reminder time has arrived
      for (const item of mustDos) {
        if (
          !item.done &&
          item.reminderAtMs &&
          !item.reminderTriggered &&
          nowMs >= item.reminderAtMs
        ) {
          onUpdateMustDo(item.id, { reminderTriggered: true });
          setRingingMustDo(item);
          playLoudAlarmSound();

          // Browser notification if granted
          if (
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            try {
              new Notification('⏰ Must-Do Reminder', {
                body: item.text || `Must-Do #${item.boxNumber}`,
              });
            } catch {}
          }
          break;
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [mustDos, onUpdateMustDo]);

  // Determine 3 Task Cards: NOW, NEXT, NEXT AFTER
  // Picked by phone clock; when user taps Done on NOW, NEXT slides up to become NOW!
  const currentTotalMins =
    currentTimeDate.getHours() * 60 + currentTimeDate.getMinutes();

  let clockSlotIndex = -1;
  for (let i = 0; i < tasks.length; i++) {
    const start = tasks[i].startMins;
    const nextStart =
      i + 1 < tasks.length ? tasks[i + 1].startMins : 24 * 60 + 60;
    if (currentTotalMins >= start && currentTotalMins < nextStart) {
      clockSlotIndex = i;
      break;
    }
  }
  if (clockSlotIndex === -1 && tasks.length > 0) {
    clockSlotIndex = 0;
  }

  // If a task is currently processing, it is NOW; else if clockSlotIndex task is not completed/cancelled, it is NOW;
  // otherwise find the next uncompleted task at or after clockSlotIndex so tapping Done slides NEXT into NOW!
  let nowIndex = tasks.findIndex((t) => t.status === 'processing');
  if (nowIndex === -1) {
    const fromClock = tasks.findIndex(
      (t, idx) =>
        idx >= clockSlotIndex &&
        t.status !== 'completed' &&
        t.status !== 'cancelled'
    );
    if (fromClock !== -1) {
      nowIndex = fromClock;
    } else {
      const anyOpen = tasks.findIndex(
        (t) => t.status !== 'completed' && t.status !== 'cancelled'
      );
      nowIndex = anyOpen !== -1 ? anyOpen : clockSlotIndex;
    }
  }

  const currentTask = tasks[nowIndex] || tasks[0];
  const nextTask =
    tasks[(nowIndex + 1) % Math.max(1, tasks.length)] || tasks[0];
  const nextAfterTask =
    tasks[(nowIndex + 2) % Math.max(1, tasks.length)] || tasks[0];

  // Calculate "Next in X min" for the NEXT card
  const rawDiffMins = nextTask ? nextTask.startMins - currentTotalMins : 25;
  const minsUntilNext =
    rawDiffMins > 0 && rawDiffMins < 360 ? rawDiffMins : 25;

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

  // Auto-scroll to current task when "All tasks" opens
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
      setFocusSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
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

  // Start button on NOW card
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

  // Done button (cards slide up: NEXT becomes NOW!)
  const handleDoneTask = (task: DailyTask, fromFocusMode: boolean = false) => {
    setCalmMusicPlaying(false);
    playCoinSound();
    onTriggerConfetti();
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

  // Must-Do Box text edit (maximum 6 words, saves automatically)
  const handleMustDoTextChange = (boxId: string, rawVal: string) => {
    const words = rawVal.trim().split(/\s+/);
    if (words.length > 6 && rawVal.endsWith(' ')) {
      return;
    }
    const capped =
      words.length > 6 ? words.slice(0, 6).join(' ') : rawVal;
    onUpdateMustDo(boxId, { text: capped });
  };

  // Must-Do Checkbox tick: confetti, +10 points, box turns green. When all 3 ticked: big celebration & +20 bonus points!
  const handleToggleMustDo = (box: MustDoBoxItem) => {
    const nextDone = !box.done;
    onUpdateMustDo(box.id, { done: nextDone });

    if (nextDone) {
      playCoinSound();
      onTriggerConfetti();
      onAwardPoints(10);

      const othersDone = mustDos
        .filter((m) => m.id !== box.id)
        .every((m) => m.done);
      if (othersDone && !allThreeCelebrated) {
        setAllThreeCelebrated(true);
        setTimeout(() => {
          onTriggerConfetti();
          onAwardPoints(20); // +20 bonus points when all 3 are ticked!
        }, 350);
      }
    }
  };

  // Calculate target timestamp for Must-Do Reminder
  const computeReminderTimestamp = (): { ms: number; label: string } => {
    const now = new Date();
    if (remindMode === '1h') {
      const target = new Date(now.getTime() + 60 * 60 * 1000);
      return {
        ms: target.getTime(),
        label: target.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
      };
    }
    if (remindMode === 'evening') {
      const target = new Date();
      target.setHours(18, 0, 0, 0);
      if (target.getTime() <= now.getTime()) {
        target.setTime(now.getTime() + 2 * 60 * 60 * 1000);
      }
      return {
        ms: target.getTime(),
        label: target.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
      };
    }
    const [hh, mm] = (customTimeVal || '18:00').split(':').map(Number);
    const target = new Date();
    target.setHours(hh || 18, mm || 0, 0, 0);
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return {
      ms: target.getTime(),
      label: target.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    };
  };

  const handleSetReminder = async (box: MustDoBoxItem) => {
    playStepChime();
    // Ask browser notification permission the first time with a clear short message
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      setNotifBannerMsg(
        'Allow notifications so your Must-Do alarm rings on time.'
      );
      try {
        await Notification.requestPermission();
      } catch {}
      setTimeout(() => setNotifBannerMsg(null), 3500);
    }

    const { ms, label } = computeReminderTimestamp();
    onUpdateMustDo(box.id, {
      reminderAtMs: ms,
      reminderLabel: label,
      reminderTriggered: false,
    });
    setActiveRemindBoxId(null);
  };

  const doneCount = tasks.filter((t) => t.status === 'completed').length;
  const focusMM = String(Math.floor(focusSecondsLeft / 60)).padStart(2, '0');
  const focusSS = String(focusSecondsLeft % 60).padStart(2, '0');
  const quoteLine = FOCUS_QUOTES[doneCount % FOCUS_QUOTES.length];

  return (
    <div className="space-y-4 pb-28">
      {/* ====================================================================
          FULL-SCREEN REMINDER ALARM CARD
          When reminder time comes: loud alarm sound, vibrate, full-screen card
          with task name and 2 buttons: "Done" and "Snooze 10 min"
          ==================================================================== */}
      {ringingMustDo && (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#0B1528] via-[#132A3E] to-[#091322] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-xs rounded-[34px] bg-white/10 backdrop-blur-2xl border border-white/25 p-7 space-y-6 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-400/20 border border-amber-400 flex items-center justify-center text-3xl animate-bounce">
              ⏰
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
                MUST-DO #{ringingMustDo.boxNumber} ALARM
              </span>
              <h2 className="font-serif-calm text-3xl font-bold leading-snug">
                {ringingMustDo.text || `Must-Do #${ringingMustDo.boxNumber}`}
              </h2>
            </div>

            {/* 2 Buttons: "Done" and "Snooze 10 min" */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  playStepChime();
                  const snoozeMs = Date.now() + 10 * 60 * 1000;
                  const snoozeLabel = new Date(snoozeMs).toLocaleTimeString(
                    'en-US',
                    { hour: 'numeric', minute: '2-digit' }
                  );
                  onUpdateMustDo(ringingMustDo.id, {
                    reminderAtMs: snoozeMs,
                    reminderLabel: snoozeLabel,
                    reminderTriggered: false,
                  });
                  setRingingMustDo(null);
                }}
                className="py-4 rounded-full bg-white/15 border border-white/25 text-white font-extrabold text-sm active:scale-95 transition-transform"
              >
                Snooze 10 min
              </button>

              <button
                onClick={() => {
                  handleToggleMustDo(ringingMustDo);
                  setRingingMustDo(null);
                }}
                className="py-4 rounded-full bg-[#2D8A6E] text-white font-extrabold text-sm shadow-lg active:scale-95 transition-transform"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          FOCUS MODE (FULL SCREEN — Opens when user taps "Start" on NOW card)
          ==================================================================== */}
      {focusTask && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-between px-6 py-8 text-center ${
            isNight
              ? 'bg-gradient-to-b from-[#0F1E32] via-[#163247] to-[#1D404B] text-white'
              : 'bg-gradient-to-b from-[#FDECE4] via-[#F3F1FC] to-[#E6F4FE] text-[#1F2937]'
          }`}
        >
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
          "ALL TASKS" FULL LIST MODAL
          ==================================================================== */}
      {showAllTasks && (
        <div
          className={`fixed inset-0 z-50 overflow-y-auto px-4 py-6 ${
            isNight ? 'bg-[#0F1A2C] text-white' : 'bg-[#FAF8F5] text-[#1F2937]'
          }`}
        >
          <div className="max-w-md mx-auto space-y-4 pb-16">
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

            <div className="space-y-3">
              {tasks.map((task, idx) => {
                const isCurrent = idx === nowIndex;
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

                        <div className="text-lg font-extrabold leading-snug truncate pt-0.5">
                          {task.title}
                        </div>

                        <p className="text-xs font-semibold opacity-70">
                          {task.benefit}
                        </p>

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

                      <PastelCardIllustration
                        variant={task.illustrationVariant}
                        size={62}
                      />
                    </div>

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
          1B. NEON MANIFESTATION BANNER (Right under the greeting)
          ==================================================================== */}
      <ManifestationBanner
        theme={theme}
        cards={MANIFESTATION_CARDS}
        onPlayPop={playSoftPopSound}
      />

      {/* ====================================================================
          2. THREE TASK CARDS STACK: NOW, NEXT, NEXT AFTER
          When user taps "Done", cards slide up: NEXT becomes NOW, and so on.
          ==================================================================== */}
      <div key={currentTask?.id} className="space-y-3 animate-manifest-card">
        {/* CARD 1: "NOW" (Biggest Card — Bright glowing border + pulsing NOW tag) */}
        {currentTask && (
          <div
            className={`rounded-[30px] p-5 transition-all ring-2 ring-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.38)] ${
              isNight ? 'night-card' : 'pastel-peach'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider animate-pulse">
                    NOW
                  </span>
                  <span className="text-xs font-extrabold opacity-80">
                    {currentTask.time}
                  </span>
                  {currentTask.status === 'processing' && (
                    <span className="text-xs font-black text-[#2D8A6E]">
                      · {formatRunningTime(currentTask.startedAt)}
                    </span>
                  )}
                </div>

                <h2 className="font-serif-calm text-2xl sm:text-[26px] font-bold leading-snug pt-0.5">
                  {currentTask.title}
                </h2>

                <p className="text-sm font-semibold opacity-75">
                  {currentTask.benefit}
                </p>
              </div>

              <PastelCardIllustration
                variant={currentTask.illustrationVariant}
                size={74}
              />
            </div>

            <div className="mt-4">
              {currentTask.status === 'processing' ? (
                <button
                  onClick={() => handleDoneTask(currentTask, false)}
                  className="w-full py-3.5 rounded-full bg-[#2D8A6E] text-white font-extrabold text-base shadow-sm active:scale-[0.99] transition-transform"
                >
                  Done
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartNowTask(currentTask)}
                    className="flex-1 py-3.5 rounded-full bg-[#2D8A6E] text-white font-extrabold text-base shadow-sm active:scale-[0.99] transition-transform"
                  >
                    Start
                  </button>
                  <button
                    onClick={() => handleDoneTask(currentTask, false)}
                    className="px-5 py-3.5 rounded-full bg-white/85 text-[#1F2937] font-extrabold text-sm shadow-2xs active:scale-95 transition-transform"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CARD 2: "NEXT" (Medium Card — Blue tag + "Next in 25 min", task name and time only) */}
        {nextTask && (
          <div
            className={`rounded-[24px] px-5 py-4 flex items-center justify-between gap-3 ${
              isNight ? 'night-card' : 'pastel-mint'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-black uppercase tracking-wider">
                  NEXT
                </span>
                <span className="text-xs font-extrabold opacity-75">
                  {nextTask.time}
                </span>
                <span className="text-xs font-bold text-sky-700 dark:text-sky-300">
                  · Next in {minsUntilNext} min
                </span>
              </div>
              <div className="text-lg font-extrabold leading-tight">
                {nextTask.title}
              </div>
            </div>
          </div>
        )}

        {/* CARD 3: "NEXT AFTER" (Small Card — Grey tag, task name and time only) */}
        {nextAfterTask && (
          <div
            className={`rounded-[20px] px-4 py-3 flex items-center justify-between gap-3 ${
              isNight ? 'night-card opacity-85' : 'pastel-white'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider shrink-0">
                NEXT AFTER
              </span>
              <span className="text-sm font-extrabold truncate">
                {nextAfterTask.title}
              </span>
            </div>
            <span className="text-xs font-bold opacity-65 shrink-0">
              {nextAfterTask.time}
            </span>
          </div>
        )}
      </div>

      {/* ====================================================================
          3. THREE MUST-DO BOXES WITH AN ALARM ("TODAY'S 3 MUST-DOS")
          ==================================================================== */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-widest opacity-75">
            TODAY&apos;S 3 MUST-DOS
          </h3>
          {mustDos.every((m) => m.done) && (
            <span className="text-xs font-black text-emerald-600">
              🎉 ALL 3 DONE (+20 BONUS!)
            </span>
          )}
        </div>

        {notifBannerMsg && (
          <div className="px-4 py-2 rounded-2xl bg-amber-100 text-amber-900 text-xs font-bold">
            {notifBannerMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {mustDos.map((box) => {
            const boxPastel = box.done
              ? 'bg-[#D1FAE5] text-[#065F46] ring-2 ring-emerald-500'
              : isNight
              ? 'night-card'
              : box.pastelTone === 'peach'
              ? 'pastel-peach'
              : box.pastelTone === 'lavender'
              ? 'pastel-lavender'
              : 'pastel-sky';

            const isRemindOpen = activeRemindBoxId === box.id;

            return (
              <div
                key={box.id}
                className={`rounded-[24px] p-4 flex flex-col justify-between gap-2.5 transition-all ${boxPastel}`}
              >
                {/* Top Row: Number 1, 2, 3 on Top-Left + Round Checkbox on Top-Right */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-white/85 text-[#1F2937] font-black text-xs flex items-center justify-center shadow-2xs">
                      {box.boxNumber}
                    </span>

                    {/* Yesterday's unfinished box shows a small orange "Carry over?" button */}
                    {box.carryOverText && !box.done && (
                      <button
                        onClick={() =>
                          onUpdateMustDo(box.id, {
                            text: box.carryOverText,
                            carryOverText: undefined,
                          })
                        }
                        className="px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-black shadow-2xs"
                      >
                        Carry over?
                      </button>
                    )}
                  </div>

                  {/* Round Checkbox */}
                  <button
                    onClick={() => handleToggleMustDo(box)}
                    aria-label={`Tick Must-Do ${box.boxNumber}`}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      box.done
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white/80 border-slate-400 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>

                {/* Editable Text Input (max 6 words, saves automatically) */}
                <input
                  type="text"
                  value={box.text}
                  onChange={(e) =>
                    handleMustDoTextChange(box.id, e.target.value)
                  }
                  placeholder="Tap to type (max 6 words)..."
                  className={`w-full bg-transparent text-base font-extrabold focus:outline-none placeholder:opacity-45 ${
                    box.done ? 'line-through opacity-75' : ''
                  }`}
                />

                {/* Bottom Row: Small "⏰ Remind" Button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() =>
                      setActiveRemindBoxId(isRemindOpen ? null : box.id)
                    }
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 text-[#1F2937] text-[11px] font-extrabold shadow-2xs"
                  >
                    <Bell className="w-3 h-3" />
                    <span>
                      {box.reminderLabel
                        ? `⏰ ${box.reminderLabel}`
                        : '⏰ Remind'}
                    </span>
                  </button>

                  {box.done && (
                    <span className="text-[11px] font-black text-emerald-700">
                      +10 pts
                    </span>
                  )}
                </div>

                {/* Time Picker Popover: 3 quick buttons ("In 1 hour", "This evening", "Pick time") + "Set" + "Add to phone alarm" */}
                {isRemindOpen && (
                  <div className="mt-2 pt-2.5 border-t border-black/10 space-y-2">
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setRemindMode('1h')}
                        className={`py-1.5 px-2 rounded-xl text-[10px] font-extrabold ${
                          remindMode === '1h'
                            ? 'bg-[#2D8A6E] text-white'
                            : 'bg-white/80 text-[#1F2937]'
                        }`}
                      >
                        In 1 hour
                      </button>
                      <button
                        type="button"
                        onClick={() => setRemindMode('evening')}
                        className={`py-1.5 px-2 rounded-xl text-[10px] font-extrabold ${
                          remindMode === 'evening'
                            ? 'bg-[#2D8A6E] text-white'
                            : 'bg-white/80 text-[#1F2937]'
                        }`}
                      >
                        This evening
                      </button>
                      <button
                        type="button"
                        onClick={() => setRemindMode('custom')}
                        className={`py-1.5 px-2 rounded-xl text-[10px] font-extrabold ${
                          remindMode === 'custom'
                            ? 'bg-[#2D8A6E] text-white'
                            : 'bg-white/80 text-[#1F2937]'
                        }`}
                      >
                        Pick time
                      </button>
                    </div>

                    {remindMode === 'custom' && (
                      <input
                        type="time"
                        value={customTimeVal}
                        onChange={(e) => setCustomTimeVal(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white/90 text-[#1F2937] text-xs font-extrabold"
                      />
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetReminder(box)}
                        className="flex-1 py-1.5 rounded-xl bg-[#2D8A6E] text-white text-xs font-extrabold shadow-2xs"
                      >
                        Set
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const { ms } = computeReminderTimestamp();
                          downloadAlarmIcsFile(
                            box.text || `Must-Do #${box.boxNumber}`,
                            ms
                          );
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white/90 text-[#1F2937] text-[10px] font-extrabold flex items-center gap-1 shadow-2xs"
                        title="Downloads a .ics alarm file for your phone"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Add to phone alarm</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

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
