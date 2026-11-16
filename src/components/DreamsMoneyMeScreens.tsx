import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';
import {
  DreamCardItem,
  LoanMountain,
  WeeklyMoneyRecord,
  GratitudeEntry,
  INITIAL_BADGES,
  getLevelDetails,
} from '../data/ruchitvaData';
import {
  playCoinSound,
  playMountainShrinkSound,
  playStepChime,
  speakTextAloud,
} from '../utils/soundAndVoice';

// Circular SVG Progress Ring for Dream Bento Cards
const ProgressRing: React.FC<{ pct: number }> = ({ pct }) => {
  const radius = 18;
  const stroke = 4;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, pct)) / 100) * circumference;

  return (
    <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          stroke="rgba(148, 163, 184, 0.28)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#10B981"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <span className="absolute text-[9px] font-black text-emerald-500">
        {pct}%
      </span>
    </div>
  );
};

// ============================================================================
// SCREEN 3: DREAMS (🌟)
// One bento card per dream with a photo, a days-left number and a progress ring
// ============================================================================
interface DreamBoardScreenProps {
  dreams: DreamCardItem[];
  onStepDream: (id: string) => void;
  onUpdateDreamPhoto: (id: string, imageUrl: string) => void;
  branchesOpened: number;
  isNight: boolean;
  onToggleBranch: (index: number) => void;
  onTriggerConfetti: (pointsText?: string) => void;
  onAwardPoints: (pts: number, label: string) => void;
}

export const DreamBoardScreen: React.FC<DreamBoardScreenProps> = ({
  dreams,
  onStepDream,
  onUpdateDreamPhoto,
  branchesOpened,
  isNight,
  onToggleBranch,
  onTriggerConfetti,
  onAwardPoints,
}) => {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handlePhotoSelect = (
    dreamId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateDreamPhoto(dreamId, reader.result);
        playStepChime();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 pb-32 pt-2">
      {/* Main Top Row: White Main Card (Ruchitva Branches) + Gold Empire Card */}
      <div className="grid grid-cols-2 gap-3.5">
        <button
          onClick={() => {
            const next = branchesOpened >= 10 ? 2 : branchesOpened + 1;
            playCoinSound();
            onToggleBranch(next);
            onTriggerConfetti('+10 POINTS');
            onAwardPoints(10, 'Branch Step');
          }}
          className="relative rounded-[1.85rem] bento-white p-4 pt-6 text-left flex flex-col justify-between"
        >
          <div className="absolute -top-3.5 -left-2.5 w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-400 shadow-lg border-2 border-white flex items-center justify-center text-xl">
            🏪
          </div>
          <div className="pl-8">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              BRANCHES
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden mt-1">
              <div
                style={{ width: `${branchesOpened * 10}%` }}
                className="h-full bg-emerald-500 transition-all"
              />
            </div>
          </div>
          <div className="font-poster text-4xl text-slate-900 mt-3">
            {branchesOpened}/10
          </div>
        </button>

        <div className="rounded-[1.85rem] bento-gold p-4 text-left flex flex-col justify-between">
          <div>
            <div className="text-xl mb-0.5">🌟</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-800">
              DREAMS ACTIVE
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-900/15 overflow-hidden mt-1">
              <div className="h-full w-4/5 bg-slate-900 rounded-full" />
            </div>
          </div>
          <div className="font-poster text-4xl text-slate-950 mt-3">
            {dreams.length}
          </div>
        </div>
      </div>

      {/* 2-Column Bento Grid: One Bento Card per Dream with Photo, Days-Left Number & Progress Ring */}
      <div className="grid grid-cols-2 gap-3.5">
        {dreams.map((dream) => (
          <div
            key={dream.id}
            onClick={() => {
              playCoinSound();
              speakTextAloud(dream.affirmation);
              onStepDream(dream.id);
              onTriggerConfetti('+10 POINTS');
              onAwardPoints(10, 'Dream Step');
            }}
            className={`rounded-[1.85rem] overflow-hidden flex flex-col justify-between cursor-pointer active:scale-95 transition-transform ${
              isNight ? 'bento-glass-dark' : 'bento-white'
            }`}
          >
            {/* Photo Header */}
            <div className="relative h-28 w-full bg-gradient-to-br from-slate-800 via-indigo-950 to-purple-900 overflow-hidden">
              {dream.imageUrl ? (
                <img
                  src={dream.imageUrl}
                  alt={dream.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">
                  {dream.emoji}
                </div>
              )}

              {/* Small Icon Badge on Top-Left */}
              <div className="absolute top-2.5 left-2.5 w-8 h-8 rounded-xl bg-black/55 backdrop-blur-md flex items-center justify-center text-base">
                {dream.emoji}
              </div>

              {/* Photo Upload Button on Top-Right */}
              <input
                ref={(el) => {
                  fileInputRefs.current[dream.id] = el;
                }}
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoSelect(dream.id, e)}
                onClick={(e) => e.stopPropagation()}
                className="hidden"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRefs.current[dream.id]?.click();
                }}
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-white/90 text-slate-900 flex items-center justify-center shadow-sm"
                title="Upload Dream Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Info: Tiny ALL-CAPS Label, ONE Big Days-Left Number, and Progress Ring */}
            <div className="p-3.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div
                  className={`text-[10px] font-black uppercase tracking-widest truncate ${
                    isNight ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {dream.title}
                </div>
                <div className="font-poster text-3xl leading-none mt-1">
                  {dream.daysLeft}D
                </div>
              </div>

              <ProgressRing pct={dream.progressPct} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// SCREEN 4: MONEY (💰)
// Bento cards for Sales, Costs, Profit, Saved.
// Loan cards each show money left and a progress line.
// ============================================================================
interface MoneyScreenProps {
  loans: LoanMountain[];
  onPayLoanStep: (id: string) => void;
  jarAmount: number;
  jarGoal: number;
  onAddJarCoins: (amount: number) => void;
  weeklyRecords: WeeklyMoneyRecord[];
  isNight: boolean;
  onTriggerConfetti: (pointsText?: string) => void;
  onAwardPoints: (pts: number, label: string) => void;
}

export const MoneyScreen: React.FC<MoneyScreenProps> = ({
  loans,
  onPayLoanStep,
  jarAmount,
  jarGoal,
  onAddJarCoins,
  weeklyRecords,
  isNight,
  onTriggerConfetti,
  onAwardPoints,
}) => {
  const latestWeek = weeklyRecords[weeklyRecords.length - 1] || {
    sales: 68500,
    expenses: 34500,
  };
  const salesK = Math.round(latestWeek.sales / 1000);
  const costsK = Math.round(latestWeek.expenses / 1000);
  const profitK = Math.max(0, salesK - costsK);
  const savedK = Math.round(jarAmount / 1000);
  const savedPct = Math.min(100, Math.round((jarAmount / jarGoal) * 100));

  return (
    <div className="space-y-4 pb-32 pt-2">
      {/* 2x2 BENTO GRID FOR SALES, COSTS, PROFIT, SAVED */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* SALES (Deep Navy Card with Protruding App-Icon Badge) */}
        <button
          onClick={() => {
            playCoinSound();
            onTriggerConfetti('+20 POINTS');
            onAwardPoints(20, 'Money Check');
          }}
          className="relative rounded-[1.85rem] bento-navy p-4 pt-6 text-left flex flex-col justify-between active:scale-95 transition-transform"
        >
          <div className="absolute -top-3.5 -left-2.5 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg border-2 border-white flex items-center justify-center text-xl">
            📈
          </div>
          <div className="pl-8">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              SALES
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden mt-1">
              <div className="h-full w-4/5 bg-sky-400 rounded-full" />
            </div>
          </div>
          <div className="font-poster text-4xl text-white mt-3">
            ₹{salesK}K
          </div>
        </button>

        {/* COSTS (Coral Red Card) */}
        <div className="rounded-[1.85rem] bento-coral p-4 text-left flex flex-col justify-between">
          <div>
            <div className="text-xl mb-0.5">🧾</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/85">
              COSTS
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/25 overflow-hidden mt-1">
              <div className="h-full w-1/2 bg-white rounded-full" />
            </div>
          </div>
          <div className="font-poster text-4xl text-white mt-3">
            ₹{costsK}K
          </div>
        </div>

        {/* PROFIT (Green Card) */}
        <div className="rounded-[1.85rem] bento-green p-4 text-left flex flex-col justify-between">
          <div>
            <div className="text-xl mb-0.5">💹</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/85">
              PROFIT
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/25 overflow-hidden mt-1">
              <div className="h-full w-3/4 bg-amber-300 rounded-full" />
            </div>
          </div>
          <div className="font-poster text-4xl text-white mt-3">
            ₹{profitK}K
          </div>
        </div>

        {/* SAVED (Gold Card - tap to add ₹5k) */}
        <button
          onClick={() => {
            playCoinSound();
            onAddJarCoins(5000);
            onTriggerConfetti('+20 POINTS');
            onAwardPoints(20, 'Money Saved');
          }}
          className="rounded-[1.85rem] bento-gold p-4 text-left flex flex-col justify-between active:scale-95 transition-transform"
        >
          <div>
            <div className="text-xl mb-0.5">🏺</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-800">
              SAVED
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-900/15 overflow-hidden mt-1">
              <div
                style={{ width: `${savedPct}%` }}
                className="h-full bg-slate-900 rounded-full transition-all"
              />
            </div>
          </div>
          <div className="font-poster text-4xl text-slate-950 mt-3">
            ₹{savedK}K
          </div>
        </button>
      </div>

      {/* LOAN BENTO CARDS (2 Columns: Each shows small icon, tiny ALL-CAPS label, thin progress line & money left) */}
      <div className="pt-1">
        <div
          className={`text-[10px] font-black uppercase tracking-widest px-1 mb-2 ${
            isNight ? 'text-slate-300' : 'text-slate-500'
          }`}
        >
          LOANS · TAP TO PAY STEP (+20 PTS)
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {loans.map((loan) => {
            const stepsLeft = Math.max(0, loan.totalSteps - loan.paidSteps);
            const moneyLeftK = stepsLeft * 15; // e.g. ₹90K remaining
            const paidPct = Math.min(
              100,
              Math.round((loan.paidSteps / loan.totalSteps) * 100)
            );
            const isCleared = stepsLeft === 0;

            return (
              <button
                key={loan.id}
                onClick={() => {
                  if (!isCleared) {
                    playMountainShrinkSound();
                    onPayLoanStep(loan.id);
                    onTriggerConfetti('+20 POINTS');
                    onAwardPoints(20, 'Loan Step');
                  }
                }}
                className={`rounded-[1.85rem] p-4 text-left flex flex-col justify-between active:scale-95 transition-transform ${
                  isCleared
                    ? 'bento-green'
                    : isNight
                    ? 'bento-glass-dark'
                    : 'bento-white'
                }`}
              >
                <div>
                  <div className="text-xl mb-0.5">{loan.emoji}</div>
                  <div
                    className={`text-[10px] font-black uppercase tracking-widest truncate ${
                      isCleared
                        ? 'text-white/90'
                        : isNight
                        ? 'text-slate-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {loan.title}
                  </div>
                  {/* Thin Coloured Progress Line Under the Label */}
                  <div className="h-1.5 w-full rounded-full bg-slate-200/40 overflow-hidden mt-1.5">
                    <div
                      style={{ width: `${paidPct}%` }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                    />
                  </div>
                </div>

                <div className="font-poster text-4xl mt-3">
                  {isCleared ? '₹0' : `₹${moneyLeftK}K`}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SCREEN 5: ME (🏆)
// Bento cards for Level, XP, Badges and Cakes eaten.
// ============================================================================
interface MeScreenProps {
  gratitudes: GratitudeEntry[];
  onAddGratitude: (text: string) => void;
  streak: number;
  noReelsStreak: number;
  completedTodayCount: number;
  totalHoursWorked: number;
  moneySavedJar: number;
  cakesEaten: number;
  points: number;
  isNight: boolean;
  onTriggerConfetti: (pointsText?: string) => void;
  onAwardPoints: (pts: number, label: string) => void;
}

export const MeScreen: React.FC<MeScreenProps> = ({
  gratitudes,
  onAddGratitude,
  completedTodayCount,
  cakesEaten,
  points,
  isNight,
  onTriggerConfetti,
  onAwardPoints,
}) => {
  // Calculate XP & Level
  const totalXp = cakesEaten * 250 + points * 4 + completedTodayCount * 20;
  const levelInfo = getLevelDetails(totalXp);
  const unlockedBadges = INITIAL_BADGES.filter((b) => b.unlocked).length;

  // 15-Minute Break Timer
  const [breakSeconds, setBreakSeconds] = useState<number>(15 * 60);
  const [breakRunning, setBreakRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!breakRunning) return;
    const timer = setInterval(() => {
      setBreakSeconds((prev) => {
        if (prev <= 1) {
          setBreakRunning(false);
          playCoinSound();
          return 15 * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [breakRunning]);

  const breakMM = String(Math.floor(breakSeconds / 60)).padStart(2, '0');
  const breakSS = String(breakSeconds % 60).padStart(2, '0');

  return (
    <div className="space-y-4 pb-32 pt-2">
      {/* 2x2 BENTO GRID: LEVEL, XP, BADGES, CAKES EATEN */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* LEVEL (White Card with Protruding Top-Left App-Icon Badge) */}
        <div className="relative rounded-[1.85rem] bento-white p-4 pt-6 flex flex-col justify-between">
          <div className="absolute -top-3.5 -left-2.5 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg border-2 border-white flex items-center justify-center text-xl">
            {levelInfo.emoji}
          </div>
          <div className="pl-8">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              LEVEL
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden mt-1">
              <div
                style={{ width: `${levelInfo.progressPct}%` }}
                className="h-full bg-amber-500"
              />
            </div>
          </div>
          <div className="font-poster text-4xl text-slate-900 mt-3">
            {levelInfo.name}
          </div>
        </div>

        {/* XP (Deep Navy Card) */}
        <div className="rounded-[1.85rem] bento-navy p-4 flex flex-col justify-between">
          <div>
            <div className="text-xl mb-0.5">⚡</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              XP
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden mt-1">
              <div
                style={{ width: `${levelInfo.progressPct}%` }}
                className="h-full bg-sky-400"
              />
            </div>
          </div>
          <div className="font-poster text-4xl text-white mt-3">{totalXp}</div>
        </div>

        {/* BADGES (Green Card) */}
        <div className="rounded-[1.85rem] bento-green p-4 flex flex-col justify-between">
          <div>
            <div className="text-xl mb-0.5">🏅</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/85">
              BADGES
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/25 overflow-hidden mt-1">
              <div
                style={{
                  width: `${Math.round((unlockedBadges / INITIAL_BADGES.length) * 100)}%`,
                }}
                className="h-full bg-amber-300"
              />
            </div>
          </div>
          <div className="font-poster text-4xl text-white mt-3">
            {unlockedBadges}/{INITIAL_BADGES.length}
          </div>
        </div>

        {/* CAKES EATEN (Gold Card) */}
        <div className="rounded-[1.85rem] bento-gold p-4 flex flex-col justify-between">
          <div>
            <div className="text-xl mb-0.5">🎂</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-800">
              CAKES EATEN
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-900/15 overflow-hidden mt-1">
              <div className="h-full w-4/5 bg-slate-900 rounded-full" />
            </div>
          </div>
          <div className="font-poster text-4xl text-slate-950 mt-3">
            {cakesEaten}
          </div>
        </div>
      </div>

      {/* SECOND 2-COLUMN BENTO ROW: 15-MIN BREAK TIMER + GRATITUDE TAP */}
      <div className="grid grid-cols-2 gap-3.5">
        <button
          onClick={() => {
            playStepChime();
            setBreakRunning(!breakRunning);
          }}
          className="rounded-[1.85rem] bento-blue p-4 text-left flex flex-col justify-between active:scale-95 transition-transform"
        >
          <div>
            <div className="text-xl mb-0.5">☕</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/85">
              BREAK TIMER
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/25 overflow-hidden mt-1">
              <div className="h-full w-full bg-amber-300" />
            </div>
          </div>
          <div className="font-poster text-4xl text-white mt-3">
            {breakMM}:{breakSS}
          </div>
        </button>

        <button
          onClick={() => {
            playCoinSound();
            onAddGratitude('Thankful for family & Ruchitva growth!');
            onTriggerConfetti('+10 POINTS');
            onAwardPoints(10, 'Gratitude');
          }}
          className="rounded-[1.85rem] bento-coral p-4 text-left flex flex-col justify-between active:scale-95 transition-transform"
        >
          <div>
            <div className="text-xl mb-0.5">🙏</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/85">
              GRATITUDE
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/25 overflow-hidden mt-1">
              <div className="h-full w-4/5 bg-white" />
            </div>
          </div>
          <div className="font-poster text-4xl text-white mt-3">
            +{gratitudes.length}
          </div>
        </button>
      </div>

      {/* BADGE BENTO GRID (2 Columns) */}
      <div className="grid grid-cols-2 gap-3.5">
        {INITIAL_BADGES.map((badge) => (
          <div
            key={badge.id}
            className={`rounded-[1.75rem] p-4 flex flex-col justify-between ${
              badge.unlocked
                ? isNight
                  ? 'bento-glass-dark'
                  : 'bento-white'
                : 'opacity-50 bento-glass'
            }`}
          >
            <div>
              <div className="text-2xl mb-1">{badge.emoji}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                BADGE
              </div>
            </div>
            <div className="font-poster text-2xl mt-2">{badge.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
