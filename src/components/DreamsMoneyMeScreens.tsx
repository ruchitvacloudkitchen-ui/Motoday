import React, { useState, useEffect } from 'react';
import {
  DreamCardItem,
  MoneyStateData,
  MONEY_QUOTES,
  formatShortINR,
  getMonthlyOrderPlan,
  getDaysLeftToJune2027,
} from '../data/ruchitvaData';
import {
  playCoinSound,
  playSoftPopSound,
  playStepChime,
  setCalmMusicPlaying,
} from '../utils/soundAndVoice';
import { PastelCardIllustration } from './CartoonIllustrations';

// Small Flat Illustration of a Money Jar with Sparkles (SVG)
const MoneyJarSparklesSVG: React.FC = () => (
  <svg
    width="54"
    height="54"
    viewBox="0 0 64 64"
    className="shrink-0 select-none overflow-visible"
  >
    {/* Soft Gold Aura */}
    <circle cx="32" cy="34" r="26" fill="#FDE68A" opacity="0.65" />
    {/* Sparkles */}
    <path
      d="M12 14 L14 19 L19 21 L14 23 L12 28 L10 23 L5 21 L10 19 Z"
      fill="#F59E0B"
    />
    <path
      d="M53 10 L54.5 14 L58.5 15.5 L54.5 17 L53 21 L51.5 17 L47.5 15.5 L51.5 14 Z"
      fill="#F59E0B"
    />
    {/* Jar Lid */}
    <rect x="21" y="14" width="22" height="6" rx="3" fill="#B45309" />
    {/* Glass Jar Body */}
    <rect
      x="17"
      y="20"
      width="30"
      height="34"
      rx="10"
      fill="#FFFBEB"
      stroke="#D97706"
      strokeWidth="2.5"
    />
    {/* Gold Coins Inside Jar */}
    <circle cx="26" cy="44" r="6" fill="#FBBF24" />
    <circle cx="37" cy="45" r="6" fill="#F59E0B" />
    <circle cx="32" cy="38" r="6.5" fill="#FCD34D" />
    <text
      x="32"
      y="41"
      textAnchor="middle"
      fill="#78350F"
      fontSize="9"
      fontWeight="900"
    >
      ₹
    </text>
  </svg>
);

// ============================================================================
// SAVINGS GOAL BANNER (Top of Dreams Tab)
// 4 Looping Cards:
// 1. "₹5 LAKH BY 30 JUN 2027" (progress + 3 short stats)
// 2. "THIS MONTH: [target] ORDERS" (orders done / target, with a bar)
// 3. "THIS WEEK: [target] ORDERS" (done / target, with a bar)
// 4. "STRETCH DREAM: ₹10 LAKH" (locked card that unlocks when saved passes ₹5 lakh)
// ============================================================================
interface SavingsGoalBannerProps {
  money: MoneyStateData;
  isNight: boolean;
}

export const SavingsGoalBanner: React.FC<SavingsGoalBannerProps> = ({
  money,
  isNight,
}) => {
  const [cardIndex, setCardIndex] = useState<number>(0);

  const now = new Date();
  const plan = getMonthlyOrderPlan(now);
  const daysLeft = getDaysLeftToJune2027(now);

  const savedAmount = money.saved || 0;
  const goalFiveLakh = 500000;
  const savedPct = Math.min(
    100,
    Math.round((savedAmount / goalFiveLakh) * 100)
  );

  const ordersToday = money.ordersToday ?? 0;
  const ordersWeek = money.ordersWeek ?? 0;
  const ordersMonth = money.ordersMonth ?? 0;

  const monthPct = Math.min(
    100,
    Math.round((ordersMonth / Math.max(1, plan.monthlyTarget)) * 100)
  );
  const weekPct = Math.min(
    100,
    Math.round((ordersWeek / Math.max(1, plan.weeklyTarget)) * 100)
  );

  // Compare saved money to the plan for this month
  const isAhead = savedAmount >= plan.monthlySaveTarget;
  const unlockedStretch = savedAmount >= goalFiveLakh;
  const stretchPct = unlockedStretch
    ? Math.min(100, Math.round((savedAmount / 1000000) * 100))
    : 0;

  const handleFlipBanner = () => {
    playSoftPopSound();
    setCardIndex((prev) => (prev + 1) % 4);
  };

  const bannerStyle: React.CSSProperties = isNight
    ? {
        background:
          'linear-gradient(135deg, #16243B 0%, #24344D 52%, #2E263D 100%)',
        border: '1px solid rgba(251, 211, 141, 0.32)',
        boxShadow: '0 14px 32px -10px rgba(4, 9, 20, 0.6)',
      }
    : {
        background:
          'linear-gradient(135deg, #FFFDF7 0%, #FDECE4 52%, #FDE68A 100%)',
        border: '1px solid rgba(251, 191, 36, 0.35)',
        boxShadow: '0 12px 28px -8px rgba(217, 119, 6, 0.16)',
      };

  return (
    <div
      onClick={handleFlipBanner}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleFlipBanner();
        }
      }}
      style={bannerStyle}
      className="w-full rounded-[30px] p-5 cursor-pointer select-none transition-transform active:scale-[0.99] overflow-hidden"
    >
      {/* Top Row: AHEAD / BEHIND Tag + Money Jar with Sparkles Illustration */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wider ${
            isNight
              ? 'bg-white/10 text-amber-100'
              : 'bg-white/85 text-[#1F2937]'
          }`}
        >
          {isAhead ? 'AHEAD 🟢' : 'BEHIND 🔴'}
        </span>

        <MoneyJarSparklesSVG />
      </div>

      {/* Animated Card Body (4 looping cards) */}
      <div key={cardIndex} className="animate-manifest-card space-y-3">
        {/* CARD 1: "₹5 LAKH BY 30 JUN 2027" */}
        {cardIndex === 0 && (
          <>
            <h2
              className={`text-[28px] sm:text-[30px] font-black leading-tight tracking-tight ${
                isNight ? 'text-[#FEF3C7]' : 'text-[#1F2937]'
              }`}
            >
              ₹5 LAKH BY 30 JUN 2027
            </h2>

            {/* Thin Progress Bar */}
            <div className="h-2 w-full rounded-full bg-black/10 dark:bg-white/15 overflow-hidden">
              <div
                style={{ width: `${savedPct}%` }}
                className="h-full bg-[#2D8A6E] rounded-full transition-all duration-500"
              />
            </div>

            {/* 3 Short Stats in a Row */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-left">
              <div className="rounded-2xl bg-white/70 dark:bg-white/10 px-2.5 py-2">
                <div className="text-[10px] font-extrabold uppercase opacity-65">
                  SAVED
                </div>
                <div className="text-xs sm:text-sm font-black truncate">
                  {formatShortINR(savedAmount)}
                </div>
              </div>

              <div className="rounded-2xl bg-white/70 dark:bg-white/10 px-2.5 py-2">
                <div className="text-[10px] font-extrabold uppercase opacity-65">
                  DAYS LEFT
                </div>
                <div className="text-xs sm:text-sm font-black">{daysLeft}</div>
              </div>

              <div className="rounded-2xl bg-white/70 dark:bg-white/10 px-2.5 py-2">
                <div className="text-[10px] font-extrabold uppercase opacity-65">
                  TODAY&apos;S TARGET
                </div>
                <div className="text-xs sm:text-sm font-black">
                  {plan.dailyTarget} orders
                </div>
              </div>
            </div>
          </>
        )}

        {/* CARD 2: "THIS MONTH: [650] ORDERS" */}
        {cardIndex === 1 && (
          <>
            <h2
              className={`text-[28px] sm:text-[30px] font-black leading-tight tracking-tight ${
                isNight ? 'text-[#FEF3C7]' : 'text-[#1F2937]'
              }`}
            >
              THIS MONTH: {plan.monthlyTarget.toLocaleString('en-IN')} ORDERS
            </h2>

            <div className="h-2 w-full rounded-full bg-black/10 dark:bg-white/15 overflow-hidden">
              <div
                style={{ width: `${monthPct}%` }}
                className="h-full bg-[#2D8A6E] rounded-full transition-all duration-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-extrabold pt-1 opacity-85">
              <span>
                {ordersMonth.toLocaleString('en-IN')} /{' '}
                {plan.monthlyTarget.toLocaleString('en-IN')} DONE
              </span>
              <span className="uppercase">
                {plan.monthName} GOAL: {plan.monthlySaveLabel}
              </span>
            </div>
          </>
        )}

        {/* CARD 3: "THIS WEEK: [150] ORDERS" */}
        {cardIndex === 2 && (
          <>
            <h2
              className={`text-[28px] sm:text-[30px] font-black leading-tight tracking-tight ${
                isNight ? 'text-[#FEF3C7]' : 'text-[#1F2937]'
              }`}
            >
              THIS WEEK: {plan.weeklyTarget} ORDERS
            </h2>

            <div className="h-2 w-full rounded-full bg-black/10 dark:bg-white/15 overflow-hidden">
              <div
                style={{ width: `${weekPct}%` }}
                className="h-full bg-[#2D8A6E] rounded-full transition-all duration-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-extrabold pt-1 opacity-85">
              <span>
                {ordersWeek} / {plan.weeklyTarget} DONE
              </span>
              <span>
                TODAY: {ordersToday} / {plan.dailyTarget} ORDERS
              </span>
            </div>
          </>
        )}

        {/* CARD 4: "STRETCH DREAM: ₹10 LAKH" (Locked until saved passes ₹5 lakh) */}
        {cardIndex === 3 && (
          <>
            <h2
              className={`text-[28px] sm:text-[30px] font-black leading-tight tracking-tight ${
                isNight ? 'text-[#FEF3C7]' : 'text-[#1F2937]'
              }`}
            >
              STRETCH DREAM: ₹10 LAKH
            </h2>

            <div className="h-2 w-full rounded-full bg-black/10 dark:bg-white/15 overflow-hidden">
              <div
                style={{ width: `${stretchPct}%` }}
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-extrabold pt-1 opacity-85">
              <span>
                {unlockedStretch
                  ? '🔓 UNLOCKED! KEEP GROWING'
                  : '🔒 LOCKED · UNLOCKS AT ₹5 LAKH'}
              </span>
              <span>{formatShortINR(savedAmount)} / ₹10L</span>
            </div>
          </>
        )}
      </div>

      {/* Small Dots at the Bottom Showing Which Card is Open */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {[0, 1, 2, 3].map((idx) => (
          <span
            key={idx}
            className={`rounded-full transition-all duration-300 ${
              idx === cardIndex
                ? isNight
                  ? 'w-4 h-1.5 bg-[#FCD34D]'
                  : 'w-4 h-1.5 bg-[#2D8A6E]'
                : isNight
                ? 'w-1.5 h-1.5 bg-amber-200/35'
                : 'w-1.5 h-1.5 bg-slate-500/35'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// TAB 2: DREAMS TAB
// Top: SAVINGS GOAL BANNER
// Below: Max 6 big picture cards, 2 per row: Car, Trip, Home, Gold, Film, 6 Branches.
// ============================================================================
interface DreamsScreenProps {
  dreams: DreamCardItem[];
  money: MoneyStateData;
  isNight: boolean;
}

export const DreamsScreen: React.FC<DreamsScreenProps> = ({
  dreams,
  money,
  isNight,
}) => {
  const [selectedDream, setSelectedDream] = useState<DreamCardItem | null>(
    null
  );
  const [visualising, setVisualising] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [receivedDone, setReceivedDone] = useState<boolean>(false);

  useEffect(() => {
    if (!visualising) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setVisualising(false);
          setCalmMusicPlaying(false);
          setReceivedDone(true);
          playCoinSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [visualising]);

  const handleOpenDream = (dream: DreamCardItem) => {
    playStepChime();
    setSelectedDream(dream);
    setVisualising(false);
    setSecondsLeft(60);
    setReceivedDone(false);
  };

  const handleStartVisualise = () => {
    playStepChime();
    setReceivedDone(false);
    setSecondsLeft(60);
    setVisualising(true);
    setCalmMusicPlaying(true);
  };

  const handleCloseDream = () => {
    setCalmMusicPlaying(false);
    setVisualising(false);
    setSelectedDream(null);
    setReceivedDone(false);
  };

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* FULL-SCREEN DREAM MODAL ("Visualise 1 min" -> "I am receiving this") */}
      {selectedDream && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 text-center ${
            isNight
              ? 'bg-gradient-to-b from-[#0F1E32] to-[#1D3B47] text-white'
              : 'bg-gradient-to-b from-[#FDECE4] via-[#FAF8F5] to-[#E3F6EE] text-[#1F2937]'
          }`}
        >
          <div className="pt-2">
            <span className="text-xs font-extrabold uppercase tracking-wider opacity-65">
              {selectedDream.daysLeft} days left
            </span>
            <h2 className="font-serif-calm text-3xl font-bold mt-1">
              {selectedDream.title}
            </h2>
          </div>

          <div className="my-auto w-full max-w-xs space-y-5">
            <div
              className={`w-64 h-64 mx-auto rounded-[36px] overflow-hidden shadow-xl border-4 border-white ${
                visualising ? 'animate-breathe' : ''
              }`}
            >
              <img
                src={selectedDream.imageUrl}
                alt={selectedDream.title}
                className="w-full h-full object-cover"
              />
            </div>

            {visualising && (
              <div className="text-3xl font-black text-[#2D8A6E]">
                0:{String(secondsLeft).padStart(2, '0')}
              </div>
            )}

            {receivedDone && (
              <div className="py-3 px-5 rounded-full bg-white text-[#2D8A6E] font-serif-calm text-2xl font-bold shadow-md">
                I am receiving this
              </div>
            )}
          </div>

          <div className="w-full max-w-xs grid grid-cols-2 gap-3">
            <button
              onClick={handleCloseDream}
              className="py-4 rounded-full bg-white text-[#1F2937] font-extrabold text-sm shadow-sm"
            >
              Back
            </button>

            <button
              onClick={handleStartVisualise}
              disabled={visualising}
              className="py-4 rounded-full bg-[#2D8A6E] text-white font-extrabold text-sm shadow-md disabled:opacity-60"
            >
              {visualising ? 'Visualising...' : 'Visualise 1 min'}
            </button>
          </div>
        </div>
      )}

      {/* TOP OF DREAMS TAB: SAVINGS GOAL BANNER */}
      <SavingsGoalBanner money={money} isNight={isNight} />

      {/* 6 BIG PICTURE CARDS, 2 PER ROW (Car, Trip, Home, Gold, Film, 6 Branches) */}
      <div className="grid grid-cols-2 gap-4">
        {dreams.slice(0, 6).map((dream) => (
          <button
            key={dream.id}
            onClick={() => handleOpenDream(dream)}
            className={`rounded-[28px] p-3.5 text-left flex flex-col justify-between transition-transform active:scale-95 ${
              isNight ? 'night-card' : dream.pastelClass
            }`}
          >
            <div className="w-full h-32 rounded-[22px] overflow-hidden bg-white/80 mb-3 shadow-2xs">
              <img
                src={dream.imageUrl}
                alt={dream.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="px-1">
              <div className="font-serif-calm text-xl font-bold leading-tight">
                {dream.title}
              </div>
              <div className="text-xs font-bold opacity-65 mt-0.5">
                {dream.daysLeft} days left
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// TAB 3: MONEY TAB
// 3 big cards only: "Loans left", "Saved", "Profit".
// One button: "Add Daily" (opens number boxes: Sales, Costs, Loan paid, Saved, + "Orders today").
// One short money quote from a famous advisor at the bottom (max 12 words).
// ============================================================================
interface MoneyScreenProps {
  money: MoneyStateData;
  onSaveEntry: (
    sales: number,
    costs: number,
    loanPaid: number,
    saved: number,
    ordersToday: number
  ) => void;
  isNight: boolean;
}

export const MoneyScreen: React.FC<MoneyScreenProps> = ({
  money,
  onSaveEntry,
  isNight,
}) => {
  const [showAddSheet, setShowAddSheet] = useState<boolean>(false);
  const [salesVal, setSalesVal] = useState<string>('');
  const [costsVal, setCostsVal] = useState<string>('');
  const [loanPaidVal, setLoanPaidVal] = useState<string>('');
  const [savedVal, setSavedVal] = useState<string>('');
  const [ordersTodayVal, setOrdersTodayVal] = useState<string>('');

  const dayOfYear = Math.floor(Date.now() / 86400000);
  const advisorQuote = MONEY_QUOTES[dayOfYear % MONEY_QUOTES.length];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const s = Number(salesVal) || 0;
    const c = Number(costsVal) || 0;
    const lp = Number(loanPaidVal) || 0;
    const sv = Number(savedVal) || 0;
    const ord = Number(ordersTodayVal) || 0;
    playCoinSound();
    onSaveEntry(s, c, lp, sv, ord);
    setSalesVal('');
    setCostsVal('');
    setLoanPaidVal('');
    setSavedVal('');
    setOrdersTodayVal('');
    setShowAddSheet(false);
  };

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* ADD DAILY / WEEK SHEET: Sales, Costs, Loan paid, Saved + "Orders today" */}
      {showAddSheet && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-5 ${
            isNight
              ? 'bg-[#0F1A2C]/95 text-white'
              : 'bg-[#FAF8F5]/95 text-[#1F2937]'
          }`}
        >
          <form
            onSubmit={handleSave}
            className={`w-full max-w-sm rounded-[32px] p-6 space-y-4 ${
              isNight ? 'night-card' : 'pastel-white'
            }`}
          >
            <h2 className="font-serif-calm text-2xl font-bold text-center">
              Add Daily
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-3.5 pastel-peach">
                <label className="block text-xs font-extrabold opacity-70 mb-1">
                  Sales
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={salesVal}
                  onChange={(e) => setSalesVal(e.target.value)}
                  className="w-full bg-transparent text-2xl font-black focus:outline-none"
                />
              </div>

              <div className="rounded-2xl p-3.5 pastel-sky">
                <label className="block text-xs font-extrabold opacity-70 mb-1">
                  Costs
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={costsVal}
                  onChange={(e) => setCostsVal(e.target.value)}
                  className="w-full bg-transparent text-2xl font-black focus:outline-none"
                />
              </div>

              <div className="rounded-2xl p-3.5 pastel-lavender">
                <label className="block text-xs font-extrabold opacity-70 mb-1">
                  Loan paid
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={loanPaidVal}
                  onChange={(e) => setLoanPaidVal(e.target.value)}
                  className="w-full bg-transparent text-2xl font-black focus:outline-none"
                />
              </div>

              <div className="rounded-2xl p-3.5 pastel-mint">
                <label className="block text-xs font-extrabold opacity-70 mb-1">
                  Saved
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={savedVal}
                  onChange={(e) => setSavedVal(e.target.value)}
                  className="w-full bg-transparent text-2xl font-black focus:outline-none"
                />
              </div>

              {/* One more small box on the Add Daily sheet: "Orders today" */}
              <div className="col-span-2 rounded-2xl p-3.5 pastel-teal flex items-center justify-between gap-3">
                <label className="text-xs font-extrabold opacity-75">
                  Orders today
                </label>
                <input
                  type="number"
                  placeholder="25"
                  value={ordersTodayVal}
                  onChange={(e) => setOrdersTodayVal(e.target.value)}
                  className="w-28 text-right bg-transparent text-2xl font-black focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddSheet(false)}
                className="py-3.5 rounded-full bg-slate-100 text-[#1F2937] font-extrabold text-sm"
              >
                Back
              </button>
              <button
                type="submit"
                className="py-3.5 rounded-full bg-[#2D8A6E] text-white font-extrabold text-sm shadow-md"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TALL ROUNDED PILL BARS FOR THE WEEK (Image 1 Growth Style) */}
      <div
        className={`rounded-[28px] p-5 ${
          isNight ? 'night-card' : 'pastel-white'
        }`}
      >
        <div className="flex items-end justify-between gap-2.5 h-28 px-2">
          {money.weeklyBars.map((bar, idx) => (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
            >
              <div
                style={{
                  height: `${bar.pct}%`,
                  backgroundColor: bar.color,
                }}
                className="w-full max-w-[28px] rounded-full transition-all duration-500"
              />
              <span className="text-[11px] font-extrabold opacity-55">
                {bar.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3 BIG CARDS ONLY: "Loans left", "Saved", "Profit" */}
      <div className="space-y-3.5">
        <div
          className={`rounded-[28px] p-5 flex items-center justify-between ${
            isNight ? 'night-card' : 'pastel-peach'
          }`}
        >
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider opacity-65">
              Loans left
            </span>
            <div className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
              {formatShortINR(money.loansLeft)}
            </div>
          </div>
          <PastelCardIllustration variant="calm" size={64} />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div
            className={`rounded-[28px] p-5 ${
              isNight ? 'night-card' : 'pastel-mint'
            }`}
          >
            <span className="text-xs font-extrabold uppercase tracking-wider opacity-65">
              Saved
            </span>
            <div className="text-2xl sm:text-3xl font-black tracking-tight mt-1.5">
              {formatShortINR(money.saved)}
            </div>
          </div>

          <div
            className={`rounded-[28px] p-5 ${
              isNight ? 'night-card' : 'pastel-lavender'
            }`}
          >
            <span className="text-xs font-extrabold uppercase tracking-wider opacity-65">
              Profit
            </span>
            <div className="text-2xl sm:text-3xl font-black tracking-tight mt-1.5">
              {formatShortINR(money.profit)}
            </div>
          </div>
        </div>
      </div>

      {/* ONE BUTTON: "Add Daily" */}
      <button
        onClick={() => setShowAddSheet(true)}
        className="w-full py-4 rounded-full bg-[#2D8A6E] text-white font-extrabold text-base shadow-sm active:scale-[0.99] transition-transform"
      >
        Add Daily
      </button>

      {/* ONE SHORT MONEY QUOTE FROM A FAMOUS ADVISOR AT THE BOTTOM */}
      <p className="text-center text-xs font-bold opacity-65 pt-1">
        “{advisorQuote.quote}” — {advisorQuote.author}
      </p>
    </div>
  );
};
