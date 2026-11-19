import React from 'react';
import {
  TimeThemeMode,
  NEON_MANIFESTATION_COLOURS,
} from '../data/ruchitvaData';

// 1. IMAGE 2 STYLE: NATURE LANDSCAPE HEADER (Mountains, Lake, Trees, Sun/Moon)
// Sky changes with time: Morning = light blue & peach, Evening = soft orange & pink, Night = dark green-navy with moon
interface NatureLandscapeHeaderProps {
  theme: TimeThemeMode;
  streak: number;
}

export const NatureLandscapeHeader: React.FC<NatureLandscapeHeaderProps> = ({
  theme,
  streak,
}) => {
  const greeting =
    theme === 'morning'
      ? 'Good morning, Srinivas'
      : theme === 'evening'
      ? 'Good evening, Srinivas'
      : 'Good night, Srinivas';

  const skyGradientId = `sky-${theme}`;

  return (
    <div className="relative w-full rounded-[32px] overflow-hidden shadow-sm">
      <svg
        viewBox="0 0 400 185"
        className="w-full h-44 sm:h-48 block select-none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={skyGradientId} x1="0" y1="0" x2="0" y2="1">
            {theme === 'morning' && (
              <>
                <stop offset="0%" stopColor="#D6ECFA" />
                <stop offset="55%" stopColor="#F4E7DE" />
                <stop offset="100%" stopColor="#FDE2D2" />
              </>
            )}
            {theme === 'evening' && (
              <>
                <stop offset="0%" stopColor="#F9B895" />
                <stop offset="55%" stopColor="#FAD2CC" />
                <stop offset="100%" stopColor="#FCE7D8" />
              </>
            )}
            {theme === 'night' && (
              <>
                <stop offset="0%" stopColor="#0E2233" />
                <stop offset="60%" stopColor="#173747" />
                <stop offset="100%" stopColor="#234B57" />
              </>
            )}
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="400" height="185" fill={`url(#${skyGradientId})`} />

        {/* Sun or Moon */}
        {theme === 'night' ? (
          <g transform="translate(315, 38)">
            <circle cx="18" cy="18" r="16" fill="#FDE68A" opacity="0.95" />
            <circle
              cx="24"
              cy="14"
              r="14"
              fill="#11283A"
            />
            <circle cx="-40" cy="8" r="1.5" fill="#FEF3C7" opacity="0.8" />
            <circle cx="-90" cy="22" r="1.8" fill="#FEF3C7" opacity="0.6" />
            <circle cx="48" cy="30" r="1.4" fill="#FEF3C7" opacity="0.7" />
          </g>
        ) : (
          <g transform="translate(310, 44)">
            <circle
              cx="20"
              cy="20"
              r="28"
              fill={theme === 'morning' ? '#FDE68A' : '#FB923C'}
              opacity="0.28"
            />
            <circle
              cx="20"
              cy="20"
              r="19"
              fill={theme === 'morning' ? '#FCD34D' : '#F97316'}
            />
          </g>
        )}

        {/* Distant Soft Mountains */}
        <path
          d="M 0 135 Q 65 82 140 122 T 290 105 T 400 128 L 400 185 L 0 185 Z"
          fill={
            theme === 'night'
              ? '#1D4350'
              : theme === 'evening'
              ? '#E59982'
              : '#A8CFCB'
          }
          opacity="0.75"
        />

        {/* Mid Hills */}
        <path
          d="M 0 145 Q 110 102 220 138 T 400 125 L 400 185 L 0 185 Z"
          fill={
            theme === 'night'
              ? '#14333E'
              : theme === 'evening'
              ? '#C97A6E'
              : '#7FB5AE'
          }
        />

        {/* Calm Lake Reflection at Bottom */}
        <rect
          x="0"
          y="152"
          width="400"
          height="33"
          fill={
            theme === 'night'
              ? '#0D232D'
              : theme === 'evening'
              ? '#E8A598'
              : '#9AD0CA'
          }
        />
        <line
          x1="280"
          y1="164"
          x2="345"
          y2="164"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.45"
        />
        <line
          x1="295"
          y1="172"
          x2="330"
          y2="172"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* Minimal Pine Trees Silhouette */}
        <g
          fill={
            theme === 'night'
              ? '#091921'
              : theme === 'evening'
              ? '#7C3E3B'
              : '#3A746D'
          }
        >
          <polygon points="38,118 28,152 48,152" />
          <polygon points="56,126 48,152 64,152" />
          <polygon points="365,120 355,152 375,152" />
        </g>
      </svg>

      {/* Top Overlay: Serif Greeting on Left + Small Cream Flame Pill on Right */}
      <div className="absolute top-4 left-5 right-5 flex items-start justify-between gap-2">
        <div>
          <h1
            className={`font-serif-calm text-2xl sm:text-[26px] font-bold leading-tight ${
              theme === 'night' ? 'text-amber-50' : 'text-[#1F2937]'
            }`}
          >
            {greeting}
          </h1>
        </div>

        {/* Small Cream Flame Pill ("12 days") */}
        <div className="px-3.5 py-1.5 rounded-full bg-[#FFFDF9]/95 text-[#1F2937] shadow-sm flex items-center gap-1.5 shrink-0">
          <span className="text-sm">🔥</span>
          <span className="text-xs font-extrabold tracking-tight">
            {streak} days
          </span>
        </div>
      </div>
    </div>
  );
};

// 2. FLAT ILLUSTRATION ON THE RIGHT OF PASTEL CARDS (Image 1 & Image 2 style)
// A soft circle badge with a calm character, sun, moon, sprout, or coin
interface PastelCardIllustrationProps {
  variant: 'calm' | 'sun' | 'moon' | 'coin' | 'sprout';
  size?: number;
}

export const PastelCardIllustration: React.FC<PastelCardIllustrationProps> = ({
  variant,
  size = 68,
}) => {
  const circleBg =
    variant === 'calm'
      ? '#F7A08B'
      : variant === 'sun'
      ? '#FCD34D'
      : variant === 'moon'
      ? '#A5B4FC'
      : variant === 'coin'
      ? '#86EFAC'
      : '#6EE7B7';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className="shrink-0 select-none overflow-visible"
    >
      {/* Soft Circle Backdrop */}
      <circle cx="40" cy="40" r="34" fill={circleBg} opacity="0.88" />

      {variant === 'calm' && (
        /* Person Sitting Calmly */
        <g>
          {/* Head */}
          <circle cx="40" cy="27" r="8.5" fill="#4A3531" />
          <circle cx="40" cy="29" r="7.5" fill="#D98A6C" />
          {/* Closed peaceful eyes */}
          <path
            d="M 36.5 29 Q 38 30.5 39.5 29"
            fill="none"
            stroke="#3E2723"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M 41 29 Q 42.5 30.5 44 29"
            fill="none"
            stroke="#3E2723"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {/* Calm Torso & Crossed Legs */}
          <path
            d="M 27 54 C 28 40 52 40 53 54 Z"
            fill="#FFFFFF"
          />
          <ellipse cx="40" cy="55" rx="16" ry="5" fill="#2D6A64" />
        </g>
      )}

      {variant === 'sun' && (
        <g>
          <circle cx="40" cy="40" r="16" fill="#FFFBEB" />
          <circle cx="35" cy="38" r="1.6" fill="#451A03" />
          <circle cx="45" cy="38" r="1.6" fill="#451A03" />
          <path
            d="M 36 44 Q 40 47.5 44 44"
            fill="none"
            stroke="#451A03"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </g>
      )}

      {variant === 'moon' && (
        <g>
          <circle cx="42" cy="40" r="15" fill="#FEF3C7" />
          <circle cx="48" cy="36" r="12" fill={circleBg} />
          <circle cx="28" cy="30" r="2" fill="#FFFFFF" />
          <circle cx="52" cy="50" r="1.5" fill="#FFFFFF" />
        </g>
      )}

      {variant === 'coin' && (
        <g>
          <circle cx="40" cy="40" r="18" fill="#FDE047" />
          <text
            x="40"
            y="46"
            textAnchor="middle"
            fill="#1E3A2F"
            fontSize="18"
            fontWeight="800"
          >
            ₹
          </text>
        </g>
      )}

      {variant === 'sprout' && (
        <g>
          <path
            d="M 40 56 L 40 34"
            stroke="#1B4332"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 40 42 C 28 38 26 28 38 30 C 40 31 40 38 40 42 Z"
            fill="#FFFFFF"
          />
          <path
            d="M 40 38 C 52 34 54 24 42 26 C 40 27 40 34 40 38 Z"
            fill="#D8F3DC"
          />
        </g>
      )}
    </svg>
  );
};

// 3. IMAGE 1 STYLE: MEDITATING CHARACTER AT BOTTOM OF FOCUS SCREEN
export const MeditatingPersonSVG: React.FC = () => {
  return (
    <svg
      width="110"
      height="95"
      viewBox="0 0 120 100"
      className="mx-auto select-none"
    >
      {/* Soft Ground Shadow */}
      <ellipse cx="60" cy="88" rx="38" ry="6" fill="#CBD5E1" opacity="0.45" />
      {/* Hair & Head */}
      <circle cx="60" cy="28" r="13" fill="#2D232E" />
      <circle cx="60" cy="31" r="11" fill="#E09F83" />
      {/* Peaceful Closed Eyes */}
      <path
        d="M 54 31 Q 56.5 33 59 31"
        fill="none"
        stroke="#2D232E"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M 61 31 Q 63.5 33 66 31"
        fill="none"
        stroke="#2D232E"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Gentle Smile */}
      <path
        d="M 57 36 Q 60 38.5 63 36"
        fill="none"
        stroke="#2D232E"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Relaxed Shirt */}
      <path
        d="M 40 76 C 41 48 79 48 80 76 Z"
        fill="#FDECE4"
      />
      {/* Crossed Meditating Legs */}
      <ellipse cx="60" cy="78" rx="28" ry="8.5" fill="#3B7A6C" />
    </svg>
  );
};

// 4. PROGRESS CARD: "POINTS 40 / 100" WITH LAYER-BY-LAYER CAKE & SMALL PROGRESS RING ("5/13 TODAY")
interface CakeProgressCardProps {
  points: number;
  doneCount: number;
  totalCount: number;
  isNight: boolean;
}

export const CakeProgressCard: React.FC<CakeProgressCardProps> = ({
  points,
  doneCount,
  totalCount,
  isNight,
}) => {
  const clamped = Math.min(100, Math.max(0, points));
  const donePct = Math.min(
    100,
    Math.round((doneCount / Math.max(1, totalCount)) * 100)
  );

  // SVG Ring params
  const radius = 22;
  const stroke = 4.5;
  const normRadius = radius - stroke / 2;
  const circumference = normRadius * 2 * Math.PI;
  const dashOffset = circumference - (donePct / 100) * circumference;

  // 5 Cake Layers (20 pts each)
  const cakeLayers = [
    { threshold: 20, color: '#FDE68A' }, // Sponge base
    { threshold: 40, color: '#FBCFE8' }, // Strawberry cream
    { threshold: 60, color: '#C4B5FD' }, // Lavender layer
    { threshold: 80, color: '#A7F3D0' }, // Mint icing
    { threshold: 100, color: '#FCA5A5' }, // Top cherry glaze
  ];

  return (
    <div
      className={`rounded-[28px] p-5 flex items-center justify-between gap-4 ${
        isNight ? 'night-card' : 'pastel-lavender'
      }`}
    >
      {/* Left: POINTS 40 / 100 + Layer-by-Layer Cake */}
      <div className="space-y-2.5 flex-1">
        <div className="text-xs font-extrabold uppercase tracking-wider opacity-70">
          REWARD PROGRESS
        </div>
        <div className="text-2xl sm:text-3xl font-black tracking-tight">
          POINTS {clamped} / 100
        </div>

        {/* Cake that fills layer by layer */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="flex flex-col-reverse gap-1 w-28">
            {cakeLayers.map((layer, idx) => {
              const active =
                clamped >= layer.threshold || (idx === 0 && clamped > 0);
              return (
                <div
                  key={layer.threshold}
                  style={{
                    backgroundColor: active
                      ? layer.color
                      : isNight
                      ? 'rgba(255,255,255,0.12)'
                      : 'rgba(255,255,255,0.65)',
                  }}
                  className="h-2.5 w-full rounded-full transition-all duration-500 shadow-2xs"
                />
              );
            })}
          </div>
          <span className="text-2xl">🎂</span>
        </div>
      </div>

      {/* Right: Small Round Progress Ring "5/13 TODAY" */}
      <div className="flex flex-col items-center shrink-0">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg height={radius * 2} width={radius * 2} className="-rotate-90">
            <circle
              stroke={isNight ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.75)'}
              fill="transparent"
              strokeWidth={stroke}
              r={normRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke="#2D8A6E"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset: dashOffset }}
              strokeLinecap="round"
              r={normRadius}
              cx={radius}
              cy={radius}
            />
          </svg>
          <span className="absolute text-xs font-black">
            {doneCount}/{totalCount}
          </span>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-65 mt-1">
          TODAY
        </span>
      </div>
    </div>
  );
};

// 5. MANIFESTATION BANNER (on Home, right under the greeting)
// Full width, soft gradient by time theme, small illustration (sun, star, or lotus),
// ONE manifestation line in BIG bold text (>=28px, centre aligned), tap anywhere to advance with soft pop sound,
// small dots at the bottom, remembers last shown line & picks first line of the day by day number.
interface ManifestationBannerProps {
  theme: TimeThemeMode;
  cards: {
    id: string;
    category: string;
    line: string;
    symbol: 'sun' | 'star' | 'lotus';
  }[];
  onPlayPop: () => void;
}

const MANIFEST_STORAGE_KEY = 'ruchitva_manifest_banner_v1';

export const ManifestationBanner: React.FC<ManifestationBannerProps> = ({
  theme,
  cards,
  onPlayPop,
}) => {
  const total = cards.length || 1;
  const todayDayNumber = Math.floor(Date.now() / 86400000);

  const [currentIndex, setCurrentIndex] = React.useState<number>(() => {
    try {
      const raw = localStorage.getItem(MANIFEST_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          parsed.dayNumber === todayDayNumber &&
          typeof parsed.index === 'number'
        ) {
          return parsed.index % total;
        }
      }
    } catch {
      // ignore storage errors
    }
    // First line of the day is chosen by the day number
    return todayDayNumber % total;
  });

  // Remember the last shown line in localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem(
        MANIFEST_STORAGE_KEY,
        JSON.stringify({
          dayNumber: todayDayNumber,
          index: currentIndex,
        })
      );
    } catch {
      // ignore storage errors
    }
  }, [currentIndex, todayDayNumber]);

  const activeCard = cards[currentIndex % total] || cards[0];
  const neonColor =
    NEON_MANIFESTATION_COLOURS[
      currentIndex % NEON_MANIFESTATION_COLOURS.length
    ];

  const handleBannerTap = () => {
    onPlayPop();
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  // Dark glass background (deep navy / black) so the card's own neon colour glows brightly
  const bannerStyle: React.CSSProperties = {
    background:
      'linear-gradient(145deg, rgba(6, 11, 23, 0.96) 0%, rgba(11, 20, 38, 0.94) 100%)',
    border: `1.5px solid ${neonColor}`,
    boxShadow: `0 12px 32px -8px rgba(0, 0, 0, 0.65), 0 0 22px -4px ${neonColor}55, inset 0 0 18px ${neonColor}1F`,
    backdropFilter: 'blur(18px)',
  };

  return (
    <div
      onClick={handleBannerTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleBannerTap();
        }
      }}
      style={bannerStyle}
      className="w-full rounded-[30px] px-6 py-6 text-center cursor-pointer select-none transition-all duration-500 active:scale-[0.99] overflow-hidden"
    >
      {/* Animated Inner Content (flips/slides smoothly on every tap) */}
      <div
        key={currentIndex}
        className="animate-manifest-card flex flex-col items-center justify-center space-y-3"
      >
        {/* Small Illustration: Sun, Star, or Lotus glowing in the card's neon colour */}
        <div
          style={{
            borderColor: `${neonColor}66`,
            boxShadow: `0 0 14px ${neonColor}44`,
          }}
          className="w-11 h-11 rounded-full bg-white/5 border flex items-center justify-center transition-all duration-500"
        >
          {activeCard.symbol === 'sun' && (
            <svg width="26" height="26" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="7" fill={neonColor} />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <line
                  key={deg}
                  x1="16"
                  y1="3"
                  x2="16"
                  y2="6.5"
                  stroke={neonColor}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  transform={`rotate(${deg} 16 16)`}
                />
              ))}
            </svg>
          )}

          {activeCard.symbol === 'star' && (
            <svg width="26" height="26" viewBox="0 0 32 32">
              <path
                d="M16 3 L19.2 11.6 L28 12.4 L21.2 18.2 L23.3 27 L16 22.2 L8.7 27 L10.8 18.2 L4 12.4 L12.8 11.6 Z"
                fill={neonColor}
              />
            </svg>
          )}

          {activeCard.symbol === 'lotus' && (
            <svg width="28" height="26" viewBox="0 0 36 32">
              <path
                d="M18 6 C22 12 22 20 18 25 C14 20 14 12 18 6 Z"
                fill={neonColor}
              />
              <path
                d="M18 25 C11 23 7 16 9 10 C13 13 16 18 18 25 Z"
                fill={neonColor}
                opacity="0.82"
              />
              <path
                d="M18 25 C25 23 29 16 27 10 C23 13 20 18 18 25 Z"
                fill={neonColor}
                opacity="0.82"
              />
              <path
                d="M18 25 C9 26 4 21 4 16 C9 17 14 20 18 25 Z"
                fill={neonColor}
                opacity="0.65"
              />
              <path
                d="M18 25 C27 26 32 21 32 16 C27 17 22 20 18 25 Z"
                fill={neonColor}
                opacity="0.65"
              />
            </svg>
          )}
        </div>

        {/* ONE Manifestation Line in BIG Bold Neon Glowing Text (at least 28px, max 10 words, centre aligned) */}
        <p
          style={{
            color: neonColor,
            textShadow: `0 0 14px ${neonColor}88, 0 0 28px ${neonColor}33`,
          }}
          className="text-[28px] sm:text-[31px] font-black leading-[1.22] tracking-tight max-w-sm mx-auto transition-colors duration-500"
        >
          “{activeCard.line}”
        </p>
      </div>

      {/* Small Dots at the Bottom Using That Card's Neon Colour */}
      <div className="flex items-center justify-center gap-1.5 mt-5 flex-wrap max-w-xs mx-auto">
        {cards.map((c, idx) => {
          const isActive = idx === currentIndex;
          return (
            <span
              key={c.id}
              style={
                isActive
                  ? {
                      backgroundColor: neonColor,
                      boxShadow: `0 0 8px ${neonColor}`,
                    }
                  : {
                      backgroundColor: `${neonColor}38`,
                    }
              }
              className={`rounded-full transition-all duration-300 ${
                isActive ? 'w-4 h-1.5' : 'w-1.5 h-1.5'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

