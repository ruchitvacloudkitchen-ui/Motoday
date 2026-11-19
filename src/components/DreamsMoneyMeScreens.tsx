import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Check,
  Trash2,
  Pencil,
  Camera,
  ZoomIn,
  X,
} from 'lucide-react';
import {
  DreamCardItem,
  DreamFilterCategory,
  DreamItemCategory,
  MoneyStateData,
  MONEY_QUOTES,
  formatShortINR,
  getMonthlyOrderPlan,
  getDaysLeftToJune2027,
  getDaysLeftForDate,
} from '../data/ruchitvaData';
import {
  playCoinSound,
  playSoftPopSound,
  playStepChime,
  setCalmMusicPlaying,
} from '../utils/soundAndVoice';
import {
  getAllDreamPhotosFromDb,
  saveDreamPhotoToDb,
  removeDreamPhotoFromDb,
  resizeImageToMax1200,
} from '../utils/dreamPhotoDb';
import { PastelCardIllustration } from './CartoonIllustrations';

const FILTER_CHIPS: DreamFilterCategory[] = [
  'All',
  'Car',
  'Trip',
  'Home',
  'Gold',
  'Film',
  'Business',
];

const DREAM_CATEGORIES: DreamItemCategory[] = [
  'Car',
  'Trip',
  'Home',
  'Gold',
  'Film',
  'Business',
];

// Small Flat Illustration of a Money Jar with Sparkles (SVG)
const MoneyJarSparklesSVG: React.FC = () => (
  <svg
    width="52"
    height="52"
    viewBox="0 0 64 64"
    className="shrink-0 select-none overflow-visible"
  >
    <circle cx="32" cy="34" r="26" fill="#FDE68A" opacity="0.25" />
    <path
      d="M12 14 L14 19 L19 21 L14 23 L12 28 L10 23 L5 21 L10 19 Z"
      fill="#FBBF24"
    />
    <path
      d="M53 10 L54.5 14 L58.5 15.5 L54.5 17 L53 21 L51.5 17 L47.5 15.5 L51.5 14 Z"
      fill="#FBBF24"
    />
    <rect x="21" y="14" width="22" height="6" rx="3" fill="#D97706" />
    <rect
      x="17"
      y="20"
      width="30"
      height="34"
      rx="10"
      fill="rgba(255, 251, 235, 0.92)"
      stroke="#F59E0B"
      strokeWidth="2.5"
    />
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
// SAVINGS GOAL BANNER (Top of Dreams Tab — Dark Glass + Gold-Peach Glow)
// ============================================================================
interface SavingsGoalBannerProps {
  money: MoneyStateData;
  darkGlass?: boolean;
}

export const SavingsGoalBanner: React.FC<SavingsGoalBannerProps> = ({
  money,
  darkGlass = true,
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

  const isAhead = savedAmount >= plan.monthlySaveTarget;
  const unlockedStretch = savedAmount >= goalFiveLakh;
  const stretchPct = unlockedStretch
    ? Math.min(100, Math.round((savedAmount / 1000000) * 100))
    : 0;

  const handleFlipBanner = () => {
    playSoftPopSound();
    setCardIndex((prev) => (prev + 1) % 4);
  };

  const bannerStyle: React.CSSProperties = darkGlass
    ? {
        background:
          'linear-gradient(135deg, rgba(16, 48, 66, 0.78) 0%, rgba(12, 34, 48, 0.88) 55%, rgba(45, 34, 24, 0.78) 100%)',
        border: '1px solid rgba(251, 191, 36, 0.35)',
        boxShadow:
          '0 18px 40px -12px rgba(0, 0, 0, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(20px)',
      }
    : {
        background:
          'linear-gradient(135deg, #FFFDF7 0%, #FDECE4 52%, #FDE68A 100%)',
        border: '1px solid rgba(251, 191, 36, 0.35)',
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
      className="w-full rounded-[30px] p-5 cursor-pointer select-none transition-transform active:scale-[0.99] overflow-hidden text-white"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wider bg-white/12 border border-white/20 text-amber-200">
          {isAhead ? 'AHEAD 🟢' : 'BEHIND 🔴'}
        </span>
        <MoneyJarSparklesSVG />
      </div>

      <div key={cardIndex} className="animate-manifest-card space-y-3">
        {cardIndex === 0 && (
          <>
            <h2 className="text-[28px] sm:text-[30px] font-black leading-tight tracking-tight text-[#FEF3C7]">
              ₹5 LAKH BY 30 JUN 2027
            </h2>

            <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
              <div
                style={{ width: `${Math.max(4, savedPct)}%` }}
                className="h-full bg-gradient-to-r from-amber-400 to-cyan-400 rounded-full transition-all duration-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-left">
              <div className="rounded-2xl bg-white/10 border border-white/12 px-2.5 py-2">
                <div className="text-[10px] font-extrabold uppercase text-white/60">
                  SAVED
                </div>
                <div className="text-xs sm:text-sm font-black truncate text-white">
                  {formatShortINR(savedAmount)}
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 border border-white/12 px-2.5 py-2">
                <div className="text-[10px] font-extrabold uppercase text-white/60">
                  DAYS LEFT
                </div>
                <div className="text-xs sm:text-sm font-black text-white">
                  {daysLeft}
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 border border-white/12 px-2.5 py-2">
                <div className="text-[10px] font-extrabold uppercase text-white/60">
                  TODAY&apos;S TARGET
                </div>
                <div className="text-xs sm:text-sm font-black text-white">
                  {plan.dailyTarget} orders
                </div>
              </div>
            </div>
          </>
        )}

        {cardIndex === 1 && (
          <>
            <h2 className="text-[28px] sm:text-[30px] font-black leading-tight tracking-tight text-[#FEF3C7]">
              THIS MONTH: {plan.monthlyTarget.toLocaleString('en-IN')} ORDERS
            </h2>
            <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
              <div
                style={{ width: `${monthPct}%` }}
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
              />
            </div>
            <div className="flex items-center justify-between text-xs font-extrabold pt-1 text-white/80">
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

        {cardIndex === 2 && (
          <>
            <h2 className="text-[28px] sm:text-[30px] font-black leading-tight tracking-tight text-[#FEF3C7]">
              THIS WEEK: {plan.weeklyTarget} ORDERS
            </h2>
            <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
              <div
                style={{ width: `${weekPct}%` }}
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
              />
            </div>
            <div className="flex items-center justify-between text-xs font-extrabold pt-1 text-white/80">
              <span>
                {ordersWeek} / {plan.weeklyTarget} DONE
              </span>
              <span>
                TODAY: {ordersToday} / {plan.dailyTarget} ORDERS
              </span>
            </div>
          </>
        )}

        {cardIndex === 3 && (
          <>
            <h2 className="text-[28px] sm:text-[30px] font-black leading-tight tracking-tight text-[#FEF3C7]">
              STRETCH DREAM: ₹10 LAKH
            </h2>
            <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
              <div
                style={{ width: `${stretchPct}%` }}
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
              />
            </div>
            <div className="flex items-center justify-between text-xs font-extrabold pt-1 text-white/80">
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

      <div className="flex items-center justify-center gap-1.5 mt-4">
        {[0, 1, 2, 3].map((idx) => (
          <span
            key={idx}
            className={`rounded-full transition-all duration-300 ${
              idx === cardIndex
                ? 'w-4 h-1.5 bg-amber-400'
                : 'w-1.5 h-1.5 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// TAB 2: DREAMS PAGE (Premium Dark Glass Style + Manual IndexedDB Photos)
// ============================================================================
interface DreamsScreenProps {
  dreams: DreamCardItem[];
  money: MoneyStateData;
  onUpdateDream: (id: string, updates: Partial<DreamCardItem>) => void;
  onAddDream: (dream: DreamCardItem, photoDataUrl?: string) => void;
  onDeleteDream: (id: string) => void;
  onTriggerConfetti: () => void;
}

export const DreamsScreen: React.FC<DreamsScreenProps> = ({
  dreams,
  money,
  onUpdateDream,
  onAddDream,
  onDeleteDream,
  onTriggerConfetti,
}) => {
  const [activeFilter, setActiveFilter] = useState<DreamFilterCategory>('All');
  const [photoMap, setPhotoMap] = useState<Record<string, string>>({});
  const [selectedDreamId, setSelectedDreamId] = useState<string | null>(null);

  // 1-Minute Visualise state
  const [visualising, setVisualising] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [receivedDone, setReceivedDone] = useState<boolean>(false);

  // Delete confirmation ("Sure?") inside Full-Screen View
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  // Add / Edit Dream Modal state
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editingDreamId, setEditingDreamId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<DreamItemCategory>('Car');
  const [formDate, setFormDate] = useState<string>('2027-06-30');
  const [formPhotoPreview, setFormPhotoPreview] = useState<string>('');

  // File input refs for empty cards & full-screen change photo
  const cardFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const fullScreenFileRef = useRef<HTMLInputElement | null>(null);
  const modalFileRef = useRef<HTMLInputElement | null>(null);

  // Pan (drag to move) & Pinch to zoom state for photo frame
  const dragStartRef = useRef<{
    dreamId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const pinchStartDistRef = useRef<{
    dreamId: string;
    startDist: number;
    origZoom: number;
  } | null>(null);

  // Load saved photos from IndexedDB on mount
  useEffect(() => {
    let mounted = true;
    getAllDreamPhotosFromDb().then((loaded) => {
      if (mounted) {
        setPhotoMap(loaded);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // 1-Minute Visualise countdown
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

  const selectedDream =
    dreams.find((d) => d.id === selectedDreamId) || null;

  // Handle picking a photo for a dream card -> Resize to max 1200px wide & save in IndexedDB
  const handleSelectPhotoForDream = async (
    dreamId: string,
    file?: File | null
  ) => {
    if (!file) return;
    try {
      const resizedDataUrl = await resizeImageToMax1200(file);
      await saveDreamPhotoToDb(dreamId, resizedDataUrl);
      setPhotoMap((prev) => ({ ...prev, [dreamId]: resizedDataUrl }));
      onUpdateDream(dreamId, { zoom: 1, offsetX: 0, offsetY: 0 });
      playStepChime();
    } catch {
      // ignore decode error
    }
  };

  const handleRemovePhoto = async (dreamId: string) => {
    await removeDreamPhotoFromDb(dreamId);
    setPhotoMap((prev) => {
      const next = { ...prev };
      delete next[dreamId];
      return next;
    });
    onUpdateDream(dreamId, { zoom: 1, offsetX: 0, offsetY: 0 });
    playStepChime();
  };

  // Drag to move & Pinch to zoom handlers on photo frames
  const handlePointerDown = (
    dream: DreamCardItem,
    clientX: number,
    clientY: number
  ) => {
    dragStartRef.current = {
      dreamId: dream.id,
      startX: clientX,
      startY: clientY,
      origX: dream.offsetX || 0,
      origY: dream.offsetY || 0,
    };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!dragStartRef.current) return;
    const { dreamId, startX, startY, origX, origY } = dragStartRef.current;
    const dx = Math.max(-160, Math.min(160, origX + (clientX - startX)));
    const dy = Math.max(-160, Math.min(160, origY + (clientY - startY)));
    onUpdateDream(dreamId, { offsetX: dx, offsetY: dy });
  };

  const handlePointerUp = () => {
    dragStartRef.current = null;
    pinchStartDistRef.current = null;
  };

  const handleTouchStartPhoto = (
    dream: DreamCardItem,
    e: React.TouchEvent
  ) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = {
        dreamId: dream.id,
        startDist: Math.max(10, dist),
        origZoom: dream.zoom || 1,
      };
      dragStartRef.current = null;
    } else if (e.touches.length === 1) {
      handlePointerDown(dream, e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMovePhoto = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / pinchStartDistRef.current.startDist;
      const nextZoom = Math.max(
        1,
        Math.min(3, Math.round(pinchStartDistRef.current.origZoom * ratio * 100) / 100)
      );
      onUpdateDream(pinchStartDistRef.current.dreamId, { zoom: nextZoom });
    } else if (e.touches.length === 1 && dragStartRef.current) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Enforce maximum 4 words on Dream name input
  const handleTitleInput = (val: string) => {
    const words = val.trim().split(/\s+/);
    if (words.length > 4 && val.endsWith(' ')) return;
    const capped = words.length > 4 ? words.slice(0, 4).join(' ') : val;
    setFormTitle(capped);
  };

  const openAddDreamModal = () => {
    playStepChime();
    setEditingDreamId(null);
    setFormTitle('');
    setFormCategory(activeFilter === 'All' ? 'Car' : activeFilter);
    setFormDate('2027-06-30');
    setFormPhotoPreview('');
    setFormOpen(true);
  };

  const openEditDreamModal = (dream: DreamCardItem) => {
    playStepChime();
    setEditingDreamId(dream.id);
    setFormTitle(dream.title);
    setFormCategory(dream.category);
    setFormDate(dream.targetDate || '2027-06-30');
    setFormPhotoPreview(photoMap[dream.id] || '');
    setFormOpen(true);
  };

  const handleSaveDreamForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formTitle.trim() || 'My New Dream';
    playCoinSound();

    if (editingDreamId) {
      onUpdateDream(editingDreamId, {
        title: cleanName,
        category: formCategory,
        targetDate: formDate,
      });
      if (formPhotoPreview) {
        await saveDreamPhotoToDb(editingDreamId, formPhotoPreview);
        setPhotoMap((prev) => ({
          ...prev,
          [editingDreamId]: formPhotoPreview,
        }));
      }
    } else {
      const newId = `dream_${Date.now()}`;
      const newDream: DreamCardItem = {
        id: newId,
        title: cleanName,
        category: formCategory,
        targetDate: formDate,
        progressPct: 25,
        achieved: false,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
      };
      if (formPhotoPreview) {
        await saveDreamPhotoToDb(newId, formPhotoPreview);
        setPhotoMap((prev) => ({ ...prev, [newId]: formPhotoPreview }));
      }
      onAddDream(newDream, formPhotoPreview);
    }
    setFormOpen(false);
  };

  const filteredDreams =
    activeFilter === 'All'
      ? dreams
      : dreams.filter((d) => d.category === activeFilter);

  return (
    <div className="space-y-4 pb-32 pt-1 text-white">
      {/* ====================================================================
          FULL-SCREEN DREAM VIEW (Reference Left Phone Style)
          Big photo frame (drag to move, pinch/slider to zoom), dream name,
          days left, "Visualise 1 min", "Change photo", "Remove photo", Edit & Delete
          ==================================================================== */}
      {selectedDream && (
        <div
          style={{
            background:
              'radial-gradient(circle at 50% 22%, #0E4D64 0%, #051C28 60%, #020A10 100%)',
          }}
          className="fixed inset-0 z-50 flex flex-col justify-between px-5 py-6 text-white overflow-y-auto"
        >
          {/* Top Bar: Back + Edit + Delete ("Sure?" check) */}
          <div className="max-w-md w-full mx-auto flex items-center justify-between">
            <button
              onClick={() => {
                setCalmMusicPlaying(false);
                setVisualising(false);
                setSelectedDreamId(null);
                setConfirmDelete(false);
              }}
              className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-extrabold backdrop-blur-xl"
            >
              ← Back
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditDreamModal(selectedDream)}
                className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
                title="Edit dream"
              >
                <Pencil className="w-4 h-4" />
              </button>

              {confirmDelete ? (
                <button
                  onClick={() => {
                    const idToRemove = selectedDream.id;
                    setSelectedDreamId(null);
                    setConfirmDelete(false);
                    removeDreamPhotoFromDb(idToRemove);
                    onDeleteDream(idToRemove);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-rose-500 text-white text-xs font-black shadow-lg"
                >
                  Sure?
                </button>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-rose-300"
                  title="Delete dream"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Center Tall Rounded Frosted Photo Frame (Drag to move & Pinch to zoom) */}
          <div className="max-w-md w-full mx-auto my-3 space-y-3">
            <div
              onMouseDown={(e) =>
                photoMap[selectedDream.id] &&
                handlePointerDown(selectedDream, e.clientX, e.clientY)
              }
              onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={(e) =>
                photoMap[selectedDream.id] &&
                handleTouchStartPhoto(selectedDream, e)
              }
              onTouchMove={handleTouchMovePhoto}
              onTouchEnd={handlePointerUp}
              className={`relative w-full h-[46vh] min-h-[300px] rounded-[38px] border-2 border-white/25 bg-white/[0.06] backdrop-blur-2xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.65)] select-none ${
                visualising ? 'animate-breathe' : ''
              }`}
            >
              {photoMap[selectedDream.id] ? (
                <>
                  <img
                    src={photoMap[selectedDream.id]}
                    alt={selectedDream.title}
                    draggable={false}
                    style={{
                      transform: `translate3d(${selectedDream.offsetX || 0}px, ${
                        selectedDream.offsetY || 0
                      }px, 0) scale(${selectedDream.zoom || 1})`,
                      transformOrigin: 'center center',
                    }}
                    className="w-full h-full object-cover cursor-grab active:cursor-grabbing transition-transform duration-75"
                  />
                  <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white/90 pointer-events-none">
                    Drag to move · Pinch to zoom
                  </div>
                </>
              ) : (
                <button
                  onClick={() => fullScreenFileRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/80 hover:text-white transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-white/10 border border-white/25 flex items-center justify-center text-3xl">
                    +
                  </div>
                  <span className="text-base font-extrabold tracking-wide">
                    Add photo
                  </span>
                </button>
              )}
            </div>

            {/* Smooth Zoom Control Bar + Remove Photo when photo exists */}
            {photoMap[selectedDream.id] && (
              <div className="flex items-center justify-between gap-3 px-2">
                <div className="flex items-center gap-2 flex-1">
                  <ZoomIn className="w-4 h-4 text-cyan-300 shrink-0" />
                  <input
                    type="range"
                    min="1"
                    max="2.6"
                    step="0.05"
                    value={selectedDream.zoom || 1}
                    onChange={(e) =>
                      onUpdateDream(selectedDream.id, {
                        zoom: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-cyan-400"
                  />
                </div>
                <button
                  onClick={() => handleRemovePhoto(selectedDream.id)}
                  className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-rose-200 hover:bg-rose-500/20"
                >
                  Remove photo
                </button>
              </div>
            )}

            {/* Dream Name & Days Left (Reference Left Phone Bottom Typography) */}
            <div className="pt-1 px-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-cyan-400/15 border border-cyan-300/30 text-cyan-200 text-xs font-extrabold">
                  {getDaysLeftForDate(selectedDream.targetDate)} days
                </span>
                <span className="text-xs font-bold text-white/60">
                  {selectedDream.category}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-2">
                {selectedDream.title}
              </h1>

              {visualising && (
                <div className="mt-2 text-2xl font-black text-cyan-300">
                  Visualising... 0:{String(secondsLeft).padStart(2, '0')}
                </div>
              )}

              {receivedDone && (
                <div className="mt-2 py-2.5 px-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-serif-calm text-xl font-bold">
                  I am receiving this
                </div>
              )}
            </div>
          </div>

          {/* Hidden File Input for Change Photo */}
          <input
            ref={fullScreenFileRef}
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleSelectPhotoForDream(
                selectedDream.id,
                e.target.files?.[0]
              )
            }
            className="hidden"
          />

          {/* 2 Primary Bottom Buttons: "Visualise 1 min" and "Change photo" */}
          <div className="max-w-md w-full mx-auto grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => fullScreenFileRef.current?.click()}
              className="py-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/25 text-white font-extrabold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Camera className="w-4 h-4" />
              <span>Change photo</span>
            </button>

            <button
              onClick={() => {
                playStepChime();
                setReceivedDone(false);
                setSecondsLeft(60);
                setVisualising(true);
                setCalmMusicPlaying(true);
              }}
              disabled={visualising}
              className="py-4 rounded-full bg-gradient-to-r from-[#0284C7] to-[#38BDF8] text-white font-extrabold text-sm shadow-[0_0_24px_rgba(56,189,248,0.45)] disabled:opacity-60 active:scale-95 transition-transform"
            >
              {visualising ? 'Visualising...' : 'Visualise 1 min'}
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          ADD OR EDIT A DREAM MODAL
          Name (max 4 words), Type, Target Date, and Add Photo
          ==================================================================== */}
      {formOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-center justify-center p-5">
          <form
            onSubmit={handleSaveDreamForm}
            style={{
              background:
                'linear-gradient(155deg, rgba(12, 38, 52, 0.96) 0%, rgba(5, 20, 30, 0.98) 100%)',
            }}
            className="w-full max-w-sm rounded-[32px] border border-white/25 p-6 space-y-4 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">
                {editingDreamId ? 'Edit Dream' : 'Add Dream'}
              </h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Name (maximum 4 words) */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-white/70 mb-1">
                Dream Name (max 4 words)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. My Dream Car"
                value={formTitle}
                onChange={(e) => handleTitleInput(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-extrabold focus:outline-none"
              />
            </div>

            {/* Pick a Type */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-white/70 mb-1">
                Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DREAM_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                      formCategory === cat
                        ? 'bg-white text-[#041822]'
                        : 'bg-white/10 border border-white/15 text-white/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Pick a Target Date */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-white/70 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-extrabold focus:outline-none"
              />
            </div>

            {/* Add Photo in Form */}
            <div>
              <input
                ref={modalFileRef}
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const resized = await resizeImageToMax1200(file);
                  setFormPhotoPreview(resized);
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => modalFileRef.current?.click()}
                className="w-full py-3 rounded-2xl bg-white/10 border border-dashed border-white/30 text-xs font-extrabold flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>
                  {formPhotoPreview ? 'Photo Selected ✓ (Change)' : '+ Add Photo'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="py-3.5 rounded-full bg-white/10 text-white font-extrabold text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-3.5 rounded-full bg-gradient-to-r from-[#0284C7] to-[#38BDF8] text-white font-extrabold text-sm shadow-lg"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 1. SAVINGS GOAL BANNER AT THE TOP */}
      <SavingsGoalBanner money={money} darkGlass={true} />

      {/* 2. ROW OF SMALL ROUND CHIPS TO FILTER: "All", "Car", "Trip", "Home", "Gold", "Film", "Business" */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {FILTER_CHIPS.map((chip) => {
          const active = activeFilter === chip;
          return (
            <button
              key={chip}
              onClick={() => {
                playStepChime();
                setActiveFilter(chip);
              }}
              className={`px-4 py-2 rounded-full text-xs font-extrabold shrink-0 transition-all ${
                active
                  ? 'bg-white text-[#041822] shadow-[0_4px_16px_rgba(255,255,255,0.28)]'
                  : 'bg-white/[0.07] border border-white/18 text-white/80 hover:bg-white/12'
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {/* 3. VERTICAL LIST OF BIG PHOTO CARDS, ONE PER ROW, FULL WIDTH */}
      <div className="space-y-4">
        {filteredDreams.map((dream) => {
          const photoUrl = photoMap[dream.id];
          const daysLeft = getDaysLeftForDate(dream.targetDate);
          const pct = dream.achieved ? 100 : dream.progressPct || 35;

          return (
            <div
              key={dream.id}
              onClick={() => {
                if (photoUrl) {
                  playStepChime();
                  setSelectedDreamId(dream.id);
                } else {
                  cardFileInputRefs.current[dream.id]?.click();
                }
              }}
              className={`relative w-full h-56 sm:h-64 rounded-[32px] overflow-hidden cursor-pointer select-none transition-all duration-300 border ${
                dream.achieved
                  ? 'border-amber-400 shadow-[0_0_28px_rgba(251,191,36,0.35)]'
                  : 'border-white/22 shadow-[0_18px_40px_-10px_rgba(0,0,0,0.6)]'
              }`}
              style={{
                background:
                  'linear-gradient(145deg, rgba(255, 255, 255, 0.11) 0%, rgba(14, 58, 78, 0.35) 100%)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Hidden file input for this card */}
              <input
                ref={(el) => {
                  cardFileInputRefs.current[dream.id] = el;
                }}
                type="file"
                accept="image/*"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  handleSelectPhotoForDream(dream.id, e.target.files?.[0])
                }
                className="hidden"
              />

              {/* Photo or Empty Frosted Glass Frame ("+" and "Add photo") */}
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={dream.title}
                  draggable={false}
                  style={{
                    transform: `translate3d(${dream.offsetX || 0}px, ${
                      dream.offsetY || 0
                    }px, 0) scale(${dream.zoom || 1})`,
                    transformOrigin: 'center center',
                  }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/80 hover:text-white transition-colors">
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/25 flex items-center justify-center text-3xl font-light shadow-inner">
                    +
                  </div>
                  <span className="text-sm font-extrabold tracking-wide">
                    Add photo
                  </span>
                </div>
              )}

              {/* Top-Left: Frosted Glass Tag with Days Left (example: "225 days") */}
              <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-black/35 backdrop-blur-xl border border-white/22 text-xs font-extrabold text-white tracking-wide">
                {daysLeft} days
              </div>

              {/* Top-Right: Open Full-Screen Details button even when empty */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playStepChime();
                  setSelectedDreamId(dream.id);
                }}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/35 backdrop-blur-xl border border-white/22 flex items-center justify-center text-white/85 hover:text-white"
                title="Open Dream"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>

              {/* Bottom Bar: Glass Name Bar at Bottom-Left + Round Glass "Achieved" Button at Bottom-Right */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                {/* Frosted Glass Name Pill Bar (Reference Right Phone Style) */}
                <div className="flex-1 px-4 py-2.5 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 text-sm font-extrabold text-white truncate shadow-sm">
                  {dream.title}
                </div>

                {/* Small Round Glass Button at Bottom-Right: Tap to mark "Achieved" (glows gold + confetti) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextAchieved = !dream.achieved;
                    onUpdateDream(dream.id, {
                      achieved: nextAchieved,
                      progressPct: nextAchieved ? 100 : 50,
                    });
                    if (nextAchieved) {
                      playCoinSound();
                      onTriggerConfetti();
                    }
                  }}
                  title={dream.achieved ? 'Achieved!' : 'Mark Achieved'}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    dream.achieved
                      ? 'bg-amber-400 text-slate-950 border-2 border-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.9)] scale-105'
                      : 'bg-white/18 backdrop-blur-xl border border-white/30 text-white hover:bg-white/25'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {/* Thin Progress Line Along the Bottom Edge of the Photo */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15">
                <div
                  style={{ width: `${pct}%` }}
                  className={`h-full transition-all duration-500 ${
                    dream.achieved
                      ? 'bg-amber-400'
                      : 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* FLOATING ROUND "+" BUTTON AT THE BOTTOM-RIGHT TO ADD A NEW DREAM */}
      <button
        onClick={openAddDreamModal}
        aria-label="Add new dream"
        className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] text-white border border-white/35 shadow-[0_0_25px_rgba(56,189,248,0.6)] flex items-center justify-center active:scale-90 transition-transform"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};

// ============================================================================
// TAB 3: MONEY TAB
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

      <button
        onClick={() => setShowAddSheet(true)}
        className="w-full py-4 rounded-full bg-[#2D8A6E] text-white font-extrabold text-base shadow-sm active:scale-[0.99] transition-transform"
      >
        Add Daily
      </button>

      <p className="text-center text-xs font-bold opacity-65 pt-1">
        “{advisorQuote.quote}” — {advisorQuote.author}
      </p>
    </div>
  );
};
