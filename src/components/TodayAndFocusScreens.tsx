import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Check,
  Clock,
  Music,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  DailyTask,
  DayMode,
  FocusRuleTask,
} from '../data/ruchitvaData';
import {
  playCoinSound,
  playStepChime,
  playGentleTaskAlert,
  setCalmMusicPlaying,
} from '../utils/soundAndVoice';
import {
  SunMascotSVG,
  IndianCoupleIllustration,
} from './CartoonIllustrations';

interface TodayScreenProps {
  dayMode: DayMode;
  setDayMode: (mode: DayMode) => void;
  tasks: DailyTask[];
  onUpdateTask: (id: string, updates: Partial<DailyTask>) => void;
  streak: number;
  points: number;
  focusMinutesToday: number;
  isNight: boolean;
  onTriggerConfetti: (pointsText?: string) => void;
  onAwardPoints: (pts: number, label: string) => void;
  customIllustration?: string;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  dayMode,
  setDayMode,
  tasks,
  onUpdateTask,
  streak,
  points,
  focusMinutesToday,
  isNight,
  onTriggerConfetti,
  onAwardPoints,
  customIllustration,
}) => {
  const [nowTick, setNowTick] = useState<number>(() => Date.now());
  const [currentTimeDate, setCurrentTimeDate] = useState<Date>(() => new Date());

  // Full-screen Story Card Modal state (tap any story circle or bento card to open)
  const [storyTaskIndex, setStoryTaskIndex] = useState<number | null>(null);
  const [showLaterPicker, setShowLaterPicker] = useState<boolean>(false);
  const [funPopPoints, setFunPopPoints] = useState<boolean>(false);
  const touchStartXRef = useRef<number | null>(null);
  const lastAlertedTaskIdRef = useRef<string | null>(null);

  // Live timer every second for processing tasks
  useEffect(() => {
    const hasProcessing = tasks.some((t) => t.status === 'processing');
    if (!hasProcessing) return;
    const interval = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  // Check phone clock every 15 seconds
  useEffect(() => {
    const checkClock = () => setCurrentTimeDate(new Date());
    checkClock();
    const interval = setInterval(checkClock, 15000);
    return () => clearInterval(interval);
  }, []);

  const currentTotalMins =
    currentTimeDate.getHours() * 60 + currentTimeDate.getMinutes();

  // Determine Current Task index based on phone clock (or first incomplete task)
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
    const firstPending = tasks.findIndex((t) => t.status !== 'completed');
    currentTaskIndex = firstPending !== -1 ? firstPending : 0;
  }

  const currentTask = tasks[currentTaskIndex] || tasks[0];

  // Gentle sound and vibration when a new task window starts
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

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalCount = tasks.length || 13;
  const donePct = Math.min(100, Math.round((completedCount / totalCount) * 100));
  const pointsClamped = Math.min(100, Math.max(0, points));

  const formatLiveTimer = (startedAt?: number) => {
    if (!startedAt) return '00:00';
    const secs = Math.max(0, Math.floor((nowTick - startedAt) / 1000));
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Start or complete a task
  const handleStartTask = (task: DailyTask, e?: React.MouseEvent) => {
    e?.stopPropagation();
    playStepChime();
    onUpdateTask(task.id, {
      status: 'processing',
      startedAt: Date.now(),
      rescheduledTo: undefined,
    });
    setShowLaterPicker(false);
  };

  const handleDoneTask = (task: DailyTask, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (task.status !== 'completed') {
      const elapsedMins = task.startedAt
        ? Math.max(1, Math.round((Date.now() - task.startedAt) / 60000))
        : 15;
      playCoinSound();
      onTriggerConfetti('+10 POINTS');
      onAwardPoints(10, 'Task Done');
      onUpdateTask(task.id, {
        status: 'completed',
        minutesTaken: elapsedMins,
      });
      setFunPopPoints(true);
      setTimeout(() => setFunPopPoints(false), 1200);
    }
    setShowLaterPicker(false);
  };

  const handleLaterTask = (task: DailyTask, whenLabel: string) => {
    playStepChime();
    onUpdateTask(task.id, {
      status: 'cancelled',
      rescheduledTo: whenLabel,
    });
    setShowLaterPicker(false);
  };

  const activeStoryTask =
    storyTaskIndex !== null ? tasks[storyTaskIndex] : null;

  return (
    <div className="space-y-4 pb-32">
      {/* ====================================================================
          FULL-SCREEN STORY CARD MODAL (Tap any Story Circle or Bento Card)
          Big Start, Done, and Later buttons
          ==================================================================== */}
      {activeStoryTask && storyTaskIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex flex-col items-center justify-center p-4">
          <div
            onTouchStart={(e) => {
              touchStartXRef.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchStartXRef.current === null) return;
              const diff = e.changedTouches[0].clientX - touchStartXRef.current;
              if (diff < -45) {
                setStoryTaskIndex((prev) =>
                  prev !== null ? (prev + 1) % tasks.length : 0
                );
                setShowLaterPicker(false);
              } else if (diff > 45) {
                setStoryTaskIndex((prev) =>
                  prev !== null ? (prev - 1 + tasks.length) % tasks.length : 0
                );
                setShowLaterPicker(false);
              }
              touchStartXRef.current = null;
            }}
            className="relative w-full max-w-md min-h-[84vh] rounded-[2.5rem] bg-white text-slate-900 shadow-2xl p-6 flex flex-col justify-between overflow-hidden"
          >
            {/* Story Progress Bars at Top */}
            <div>
              <div className="flex gap-1.5 mb-4">
                {tasks.map((t, idx) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setStoryTaskIndex(idx);
                      setShowLaterPicker(false);
                    }}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      idx === storyTaskIndex
                        ? 'bg-amber-500 scale-y-125'
                        : t.status === 'completed'
                        ? 'bg-emerald-500'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shadow-sm">
                    {activeStoryTask.icon}
                  </span>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {activeStoryTask.time}
                    </div>
                    <div className="text-sm font-extrabold text-slate-800">
                      {activeStoryTask.title}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setStoryTaskIndex(null);
                    setShowLaterPicker(false);
                  }}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* +10 POINTS POP BURST */}
            {funPopPoints && (
              <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
                <div className="px-7 py-4 rounded-3xl bento-gold font-poster text-4xl shadow-2xl animate-pop-points">
                  🪙 +10 POINTS!
                </div>
              </div>
            )}

            {/* Center Visual & Headline */}
            <div className="text-center my-2 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-black uppercase tracking-widest text-slate-600">
                <span>{activeStoryTask.time}</span>
                {activeStoryTask.status === 'processing' && (
                  <span className="text-sky-600">
                    · ⏱ {formatLiveTimer(activeStoryTask.startedAt)}
                  </span>
                )}
              </div>

              <h2 className="font-poster text-4xl sm:text-5xl text-slate-900 leading-none">
                {activeStoryTask.posterHeadline}
              </h2>

              <div className="py-1 flex justify-center relative">
                <div className="absolute -top-3 right-4">
                  <SunMascotSVG
                    mood={
                      activeStoryTask.status === 'completed' ? 'happy' : 'cool'
                    }
                    size={68}
                  />
                </div>
                <IndianCoupleIllustration
                  propType={activeStoryTask.propType}
                  customImageUrl={customIllustration}
                />
              </div>

              {/* 5-Word Benefit Card */}
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                  BENEFIT
                </div>
                <p className="text-lg font-extrabold text-slate-800">
                  “{activeStoryTask.benefit}”
                </p>
              </div>
            </div>

            {/* Big Start, Done, and Later Buttons */}
            <div className="space-y-2.5">
              {showLaterPicker ? (
                <div className="p-3.5 rounded-3xl bg-slate-100 space-y-2">
                  <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 text-center">
                    WHEN WILL YOU DO IT?
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() =>
                        handleLaterTask(activeStoryTask, 'Later today')
                      }
                      className="py-3 rounded-2xl bg-amber-400 text-slate-950 font-poster text-base shadow-sm"
                    >
                      LATER TODAY
                    </button>
                    <button
                      onClick={() =>
                        handleLaterTask(activeStoryTask, 'Tomorrow')
                      }
                      className="py-3 rounded-2xl bg-sky-500 text-white font-poster text-base shadow-sm"
                    >
                      TOMORROW
                    </button>
                    <button
                      onClick={() => setShowLaterPicker(false)}
                      className="py-3 rounded-2xl bg-white text-slate-700 font-poster text-base shadow-sm"
                    >
                      BACK
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={(e) => handleStartTask(activeStoryTask, e)}
                    className="py-4 rounded-2xl bento-blue font-poster text-2xl tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>START</span>
                  </button>

                  <button
                    onClick={(e) => handleDoneTask(activeStoryTask, e)}
                    className="py-4 rounded-2xl bento-green font-poster text-2xl tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>DONE</span>
                  </button>

                  <button
                    onClick={() => setShowLaterPicker(true)}
                    className="py-4 rounded-2xl bento-coral font-poster text-2xl tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <Clock className="w-5 h-5" />
                    <span>LATER</span>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() =>
                    setStoryTaskIndex(
                      (storyTaskIndex - 1 + tasks.length) % tasks.length
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-extrabold flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <span className="text-[11px] font-bold text-slate-400">
                  {storyTaskIndex + 1} / {tasks.length}
                </span>
                <button
                  onClick={() =>
                    setStoryTaskIndex((storyTaskIndex + 1) % tasks.length)
                  }
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-extrabold flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          ROW 1: STORY CIRCLES FOR ALL TASKS
          Gold ring = current task, Green ring = done, Grey ring = later
          ==================================================================== */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2 px-1">
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${
              isNight ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            DAILY STORIES · TAP TO OPEN
          </span>
          <div className="flex gap-1.5">
            {(
              [
                { id: 'weekday', label: 'WEEKDAY' },
                { id: 'saturday', label: 'SAT' },
                { id: 'sunday', label: 'SUN' },
              ] as { id: DayMode; label: string }[]
            ).map((d) => (
              <button
                key={d.id}
                onClick={() => setDayMode(d.id)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                  dayMode === d.id
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : isNight
                    ? 'bg-white/10 text-slate-300'
                    : 'bg-white/70 text-slate-600'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1.5 px-1">
          {tasks.map((task, idx) => {
            const isCurrent = idx === currentTaskIndex;
            const isDone = task.status === 'completed';

            // Gold ring = current task, Green ring = done, Grey ring = later
            const ringStyle = isCurrent
              ? 'ring-[3px] ring-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.75)] scale-105'
              : isDone
              ? 'ring-[3px] ring-emerald-500'
              : isNight
              ? 'ring-2 ring-slate-600 opacity-80'
              : 'ring-2 ring-slate-300 opacity-85';

            return (
              <button
                key={task.id}
                onClick={() => {
                  playStepChime();
                  setStoryTaskIndex(idx);
                }}
                className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all ${
                    isNight ? 'bg-slate-800/90' : 'bg-white/95'
                  } ${ringStyle}`}
                >
                  <span>{task.icon}</span>
                </div>
                <span
                  className={`text-[10px] font-extrabold tracking-tight max-w-[58px] truncate ${
                    isCurrent
                      ? 'text-amber-500 font-black'
                      : isNight
                      ? 'text-slate-300'
                      : 'text-slate-600'
                  }`}
                >
                  {task.time.replace(' AM', 'a').replace(' PM', 'p')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
          ROW 2: BIG WHITE CARD "NOW" (with protruding top-left app-icon badge)
          + DEEP NAVY CARD "POINTS 37/100" NEXT TO IT
          ==================================================================== */}
      <div className="grid grid-cols-12 gap-3.5 pt-2">
        {/* BIG WHITE CARD "NOW" (7 columns) */}
        <div
          onClick={() => setStoryTaskIndex(currentTaskIndex)}
          className="col-span-7 relative rounded-[1.85rem] bento-white p-4 pt-6 flex flex-col justify-between cursor-pointer active:scale-[0.99] transition-transform"
        >
          {/* Protruding Big Square App-Icon Badge on Top-Left Corner */}
          <div className="absolute -top-3.5 -left-2.5 w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg border-2 border-white flex items-center justify-center text-2xl">
            {currentTask?.icon || '🌅'}
          </div>

          <div className="pl-10 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
              NOW · {currentTask?.time}
            </span>
            <span className="text-[11px] font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
              {currentTask?.status === 'processing'
                ? formatLiveTimer(currentTask.startedAt)
                : 'LIVE'}
            </span>
          </div>

          <div className="my-2.5">
            <div className="font-poster text-2xl sm:text-3xl text-slate-900 leading-tight truncate">
              {currentTask?.title}
            </div>
            {/* 5-Word Benefit */}
            <p className="text-xs font-bold text-slate-500 mt-0.5 line-clamp-1">
              {currentTask?.benefit}
            </p>
          </div>

          {currentTask?.status === 'processing' ? (
            <button
              onClick={(e) => handleDoneTask(currentTask, e)}
              className="w-full py-2.5 rounded-2xl bento-green font-poster text-lg tracking-wider flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>DONE</span>
            </button>
          ) : (
            <button
              onClick={(e) => currentTask && handleStartTask(currentTask, e)}
              className="w-full py-2.5 rounded-2xl bento-blue font-poster text-lg tracking-wider flex items-center justify-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START</span>
            </button>
          )}
        </div>

        {/* DEEP NAVY CARD "POINTS 37/100" (5 columns) */}
        <div className="col-span-5 rounded-[1.85rem] bento-navy p-4 flex flex-col justify-between">
          <div>
            <div className="text-xl mb-1">🪙</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              POINTS
            </div>
            {/* Thin coloured progress line under the label */}
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden mt-1.5">
              <div
                style={{ width: `${pointsClamped}%` }}
                className="h-full bg-gradient-to-r from-amber-400 to-rose-400 transition-all duration-500"
              />
            </div>
          </div>

          <div className="font-poster text-3xl sm:text-4xl text-white tracking-wider mt-3">
            {pointsClamped}/100
          </div>
        </div>
      </div>

      {/* ====================================================================
          ROW 3: BLUE CARD "FOCUS MIN", CORAL CARD "STREAK", GREEN CARD "DONE 5/13"
          Each has: small icon on top, tiny ALL-CAPS label, thin progress line, ONE big number
          ==================================================================== */}
      <div className="grid grid-cols-3 gap-3">
        {/* Bright Blue Card: FOCUS MIN */}
        <div className="rounded-[1.65rem] bento-blue p-3.5 flex flex-col justify-between">
          <div>
            <div className="text-lg mb-0.5">🎯</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/80">
              FOCUS MIN
            </div>
            <div className="h-1 w-full rounded-full bg-white/25 overflow-hidden mt-1">
              <div
                style={{
                  width: `${Math.min(100, Math.round((focusMinutesToday / 90) * 100))}%`,
                }}
                className="h-full bg-white"
              />
            </div>
          </div>
          <div className="font-poster text-3xl text-white mt-2.5">
            {focusMinutesToday}M
          </div>
        </div>

        {/* Coral Red Card: STREAK */}
        <div className="rounded-[1.65rem] bento-coral p-3.5 flex flex-col justify-between">
          <div>
            <div className="text-lg mb-0.5">🔥</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/80">
              STREAK
            </div>
            <div className="h-1 w-full rounded-full bg-white/25 overflow-hidden mt-1">
              <div style={{ width: '80%' }} className="h-full bg-amber-300" />
            </div>
          </div>
          <div className="font-poster text-3xl text-white mt-2.5">
            {streak}D
          </div>
        </div>

        {/* Green Card: DONE 5/13 */}
        <div className="rounded-[1.65rem] bento-green p-3.5 flex flex-col justify-between">
          <div>
            <div className="text-lg mb-0.5">✅</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/80">
              DONE
            </div>
            <div className="h-1 w-full rounded-full bg-white/25 overflow-hidden mt-1">
              <div
                style={{ width: `${donePct}%` }}
                className="h-full bg-amber-300 transition-all duration-500"
              />
            </div>
          </div>
          <div className="font-poster text-3xl text-white mt-2.5">
            {completedCount}/{totalCount}
          </div>
        </div>
      </div>

      {/* ====================================================================
          BELOW: 2-COLUMN BENTO GRID OF EVERY TASK
          Small bento card with time, icon, title, status dot (grey/blue/green/red) & 5-word benefit
          Tap any card to open it full screen!
          ==================================================================== */}
      <div className="grid grid-cols-2 gap-3.5 pt-1">
        {tasks.map((task, idx) => {
          const isDone = task.status === 'completed';
          const isProc = task.status === 'processing';
          const isCanc = task.status === 'cancelled';
          const isPastMissed =
            !isDone &&
            !isProc &&
            !isCanc &&
            idx < currentTaskIndex;

          // Status dot: grey = not started, blue = processing, green = completed, red = missed/cancelled
          const dotColor = isDone
            ? 'bg-emerald-500'
            : isProc
            ? 'bg-sky-500 animate-ping'
            : isCanc || isPastMissed
            ? 'bg-rose-500'
            : 'bg-slate-400';

          const cardSurface = isDone
            ? 'bento-green'
            : isProc
            ? 'bento-blue'
            : isNight
            ? 'bento-glass-dark'
            : 'bento-glass';

          return (
            <button
              key={task.id}
              onClick={() => {
                playStepChime();
                setStoryTaskIndex(idx);
              }}
              className={`rounded-[1.75rem] p-4 text-left flex flex-col justify-between transition-all active:scale-95 ${cardSurface}`}
            >
              {/* Top Row: Small Icon + Time + Status Dot */}
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-2xl">{task.icon}</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider ${
                      isDone || isProc
                        ? 'text-white/90'
                        : isNight
                        ? 'text-slate-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {task.time}
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                </div>
              </div>

              {/* Title + Thin Progress Line + 5-Word Benefit */}
              <div>
                <div
                  className={`font-poster text-xl leading-tight truncate ${
                    isDone || isProc
                      ? 'text-white'
                      : isNight
                      ? 'text-white'
                      : 'text-slate-900'
                  }`}
                >
                  {task.title}
                </div>

                <div
                  className={`h-1 w-10 rounded-full my-1.5 ${
                    isDone
                      ? 'bg-white/70'
                      : isProc
                      ? 'bg-amber-300'
                      : 'bg-amber-400/70'
                  }`}
                />

                <p
                  className={`text-[11px] font-bold leading-snug line-clamp-2 ${
                    isDone || isProc
                      ? 'text-white/90'
                      : isNight
                      ? 'text-slate-300'
                      : 'text-slate-600'
                  }`}
                >
                  {task.benefit}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// SCREEN 2: FOCUS (🎯) — BENTO BOX 2-COLUMN GRID
// ============================================================================
interface FocusScreenProps {
  focusRules: FocusRuleTask[];
  onToggleFocusRule: (id: string) => void;
  noReelsStreak: number;
  noReelsShieldOn: boolean;
  isNight: boolean;
  onToggleShield: () => void;
  onTriggerConfetti: (pointsText?: string) => void;
  onAwardPoints: (pts: number, label: string) => void;
}

export const FocusScreen: React.FC<FocusScreenProps> = ({
  focusRules,
  onToggleFocusRule,
  noReelsStreak,
  noReelsShieldOn,
  isNight,
  onToggleShield,
  onTriggerConfetti,
  onAwardPoints,
}) => {
  const [presetMinutes, setPresetMinutes] = useState<25 | 45>(25);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [running, setRunning] = useState<boolean>(false);
  const [musicOn, setMusicOn] = useState<boolean>(false);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          playCoinSound();
          onTriggerConfetti('+20 POINTS');
          onAwardPoints(20, 'Focus Session');
          return presetMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running, presetMinutes, onTriggerConfetti, onAwardPoints]);

  useEffect(() => {
    setCalmMusicPlaying(musicOn);
    return () => setCalmMusicPlaying(false);
  }, [musicOn]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const pct = Math.min(
    100,
    Math.round(((presetMinutes * 60 - secondsLeft) / (presetMinutes * 60)) * 100)
  );

  return (
    <div className="space-y-4 pb-32 pt-2">
      {/* Main Bento Row: White Timer Card (with app-icon badge) + Bright Blue Preset Card */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="col-span-2 relative rounded-[1.85rem] bento-white p-5 pt-7 flex items-center justify-between">
          <div className="absolute -top-3.5 -left-2.5 w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 shadow-lg border-2 border-white flex items-center justify-center text-2xl">
            🎯
          </div>

          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              FOCUS TIMER · +20 PTS
            </div>
            <div className="h-1.5 w-28 rounded-full bg-slate-200 overflow-hidden mt-1">
              <div
                style={{ width: `${pct}%` }}
                className="h-full bg-blue-600 transition-all"
              />
            </div>
            <div className="font-poster text-5xl text-slate-900 mt-2">
              {mm}:{ss}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                playStepChime();
                setRunning(!running);
              }}
              className="px-5 py-3 rounded-2xl bento-blue font-poster text-xl tracking-wider"
            >
              {running ? 'PAUSE' : 'START'}
            </button>
            <button
              onClick={() => {
                setRunning(false);
                playCoinSound();
                onTriggerConfetti('+20 POINTS');
                onAwardPoints(20, 'Focus Session');
                setSecondsLeft(presetMinutes * 60);
              }}
              className="px-5 py-2.5 rounded-2xl bento-green font-poster text-lg tracking-wider"
            >
              DONE
            </button>
          </div>
        </div>

        {/* 2-Column Stat Bento Cards */}
        <button
          onClick={() => {
            const next = presetMinutes === 25 ? 45 : 25;
            setRunning(false);
            setPresetMinutes(next);
            setSecondsLeft(next * 60);
          }}
          className="rounded-[1.75rem] bento-blue p-4 text-left flex flex-col justify-between"
        >
          <div>
            <div className="text-xl mb-1">⏱️</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/80">
              FOCUS MIN
            </div>
            <div className="h-1 w-full rounded-full bg-white/25 mt-1.5">
              <div className="h-full w-3/4 bg-white rounded-full" />
            </div>
          </div>
          <div className="font-poster text-4xl text-white mt-3">
            {presetMinutes}M
          </div>
        </button>

        <button
          onClick={() => {
            playCoinSound();
            onTriggerConfetti('+15 POINTS');
            onAwardPoints(15, 'No-Reels Day');
            onToggleShield();
          }}
          className="rounded-[1.75rem] bento-coral p-4 text-left flex flex-col justify-between"
        >
          <div>
            <div className="text-xl mb-1">📵</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/80">
              NO REELS SHIELD
            </div>
            <div className="h-1 w-full rounded-full bg-white/25 mt-1.5">
              <div
                style={{ width: noReelsShieldOn ? '100%' : '35%' }}
                className="h-full bg-amber-300 rounded-full"
              />
            </div>
          </div>
          <div className="font-poster text-4xl text-white mt-3">
            {noReelsStreak}D
          </div>
        </button>

        <button
          onClick={() => setMusicOn(!musicOn)}
          className="rounded-[1.75rem] bento-navy p-4 text-left flex flex-col justify-between"
        >
          <div>
            <div className="text-xl mb-1">
              {musicOn ? (
                <Music className="w-5 h-5 text-amber-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              CALM AUDIO
            </div>
          </div>
          <div className="font-poster text-3xl text-white mt-3">
            {musicOn ? 'ON' : 'OFF'}
          </div>
        </button>

        <div className="rounded-[1.75rem] bento-gold p-4 text-left flex flex-col justify-between">
          <div>
            <div className="text-xl mb-1">📋</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-800">
              1-3-5 PLAN
            </div>
          </div>
          <div className="font-poster text-3xl text-slate-950 mt-3">
            {focusRules.filter((r) => r.done).length}/{focusRules.length}
          </div>
        </div>
      </div>

      {/* 2-Column Bento Cards for 1-3-5 Tasks */}
      <div className="grid grid-cols-2 gap-3.5">
        {focusRules.map((rule) => (
          <button
            key={rule.id}
            onClick={() => {
              if (!rule.done) {
                playCoinSound();
                onTriggerConfetti('+10 POINTS');
                onAwardPoints(10, 'Focus Task');
              }
              onToggleFocusRule(rule.id);
            }}
            className={`rounded-[1.75rem] p-4 text-left flex flex-col justify-between transition-all active:scale-95 ${
              rule.done
                ? 'bento-green'
                : isNight
                ? 'bento-glass-dark'
                : 'bento-glass'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{rule.done ? '✅' : '⚡'}</span>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-75">
                {rule.tier.toUpperCase()}
              </span>
            </div>
            <div className="font-poster text-xl leading-tight line-clamp-2">
              {rule.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
