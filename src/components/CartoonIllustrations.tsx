import React from 'react';
import { IllustrationPropType } from '../data/ruchitvaData';

// 1. CARTOON SUN WITH SUNGLASSES MASCOT
// Changes face: sleepy in morning (<35% or early), cool at noon, happy when tasks are done!
interface SunMascotProps {
  mood: 'sleepy' | 'cool' | 'happy';
  size?: number;
}

export const SunMascotSVG: React.FC<SunMascotProps> = ({
  mood,
  size = 110,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      className="animate-float select-none overflow-visible"
    >
      {/* Thick Outlined Sun Rays */}
      <g stroke="#111827" strokeWidth="4" strokeLinejoin="round">
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
          (deg) => (
            <polygon
              key={deg}
              points="70,4 61,24 79,24"
              fill={mood === 'happy' ? '#FBBF24' : '#FDE047'}
              transform={`rotate(${deg} 70 70)`}
            />
          )
        )}
      </g>

      {/* Main Sun Body */}
      <circle
        cx="70"
        cy="70"
        r="44"
        fill="#FACC15"
        stroke="#111827"
        strokeWidth="4.5"
      />
      {/* Cheek Blush */}
      <ellipse cx="44" cy="80" rx="6" ry="3.5" fill="#FB7185" />
      <ellipse cx="96" cy="80" rx="6" ry="3.5" fill="#FB7185" />

      {/* Sunglasses */}
      <g
        transform={
          mood === 'sleepy' ? 'translate(0, -8) rotate(-6 70 60)' : 'translate(0, 0)'
        }
      >
        {/* Bridge & Strap */}
        <line
          x1="28"
          y1="58"
          x2="112"
          y2="58"
          stroke="#111827"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Left Lens */}
        <rect
          x="36"
          y="50"
          width="28"
          height="19"
          rx="5"
          fill="#111827"
          stroke="#111827"
          strokeWidth="3"
        />
        {/* Right Lens */}
        <rect
          x="76"
          y="50"
          width="28"
          height="19"
          rx="5"
          fill="#111827"
          stroke="#111827"
          strokeWidth="3"
        />
        {/* White Glint on Lenses */}
        <line
          x1="41"
          y1="54"
          x2="48"
          y2="63"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="81"
          y1="54"
          x2="88"
          y2="63"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* Expression Mouth */}
      {mood === 'sleepy' && (
        <>
          {/* Sleepy Yawn Circle + Zzz */}
          <circle
            cx="70"
            cy="86"
            r="7"
            fill="#FB7185"
            stroke="#111827"
            strokeWidth="4"
          />
          <text
            x="105"
            y="32"
            fill="#111827"
            fontWeight="900"
            fontSize="16"
            fontFamily="Anton, sans-serif"
          >
            ZZZ
          </text>
        </>
      )}

      {mood === 'cool' && (
        /* Cool Confident Smirk */
        <path
          d="M 54 84 Q 70 95 88 82"
          fill="none"
          stroke="#111827"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      )}

      {mood === 'happy' && (
        /* Big Happy Laughing Mouth + Crown Sparkle */
        <>
          <path
            d="M 50 80 Q 70 104 90 80 Z"
            fill="#EF4444"
            stroke="#111827"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <polygon
            points="52,22 60,8 70,18 80,8 88,22"
            fill="#F59E0B"
            stroke="#111827"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
};

// 2. ORIGINAL PLAYFUL CARTOON INDIAN MAN & WOMAN WITH SUNGLASSES
// Holding a Phone, a Big Gold Coin, or a Cake!
interface IndianCoupleIllustrationProps {
  propType: IllustrationPropType;
  customImageUrl?: string;
}

export const IndianCoupleIllustration: React.FC<
  IndianCoupleIllustrationProps
> = ({ propType, customImageUrl }) => {
  if (customImageUrl) {
    return (
      <div className="w-48 h-40 mx-auto rounded-3xl overflow-hidden chunky-card bg-white flex items-center justify-center">
        <img
          src={customImageUrl}
          alt="Custom Illustration"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 280 185"
      className="w-60 h-40 sm:w-68 sm:h-44 mx-auto select-none overflow-visible"
    >
      {/* Background Decorative Pill */}
      <rect
        x="20"
        y="25"
        width="240"
        height="145"
        rx="36"
        fill="#FFFFFF"
        stroke="#111827"
        strokeWidth="4.5"
      />

      {/* LEFT CHARACTER: INDIAN MAN (Srinivas) WITH SUNGLASSES */}
      <g transform="translate(32, 32)">
        {/* Shoulders / Kurta Jacket */}
        <path
          d="M 12 138 C 12 100 76 100 76 138 Z"
          fill="#2563EB"
          stroke="#111827"
          strokeWidth="4"
        />
        {/* Gold Collar Trim */}
        <path
          d="M 34 108 L 44 126 L 54 108"
          fill="none"
          stroke="#FACC15"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Head */}
        <circle
          cx="44"
          cy="70"
          r="28"
          fill="#D97742"
          stroke="#111827"
          strokeWidth="4"
        />
        {/* Stylish Hair */}
        <path
          d="M 16 66 C 14 38 40 32 66 40 C 76 44 74 60 72 65 C 62 50 30 50 16 66 Z"
          fill="#111827"
          stroke="#111827"
          strokeWidth="2"
        />
        {/* Cool Sunglasses */}
        <rect
          x="23"
          y="58"
          width="19"
          height="13"
          rx="3"
          fill="#111827"
          stroke="#111827"
          strokeWidth="2"
        />
        <rect
          x="47"
          y="58"
          width="19"
          height="13"
          rx="3"
          fill="#111827"
          stroke="#111827"
          strokeWidth="2"
        />
        <line x1="42" y1="63" x2="47" y2="63" stroke="#111827" strokeWidth="3.5" />
        <line x1="26" y1="61" x2="31" y2="67" stroke="#FFFFFF" strokeWidth="2.5" />
        <line x1="50" y1="61" x2="55" y2="67" stroke="#FFFFFF" strokeWidth="2.5" />
        {/* Mustache & Big Smile */}
        <path
          d="M 32 80 Q 44 75 56 80"
          fill="none"
          stroke="#111827"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 36 84 Q 44 92 52 84"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </g>

      {/* RIGHT CHARACTER: INDIAN WOMAN (Wife) WITH SUNGLASSES */}
      <g transform="translate(158, 32)">
        {/* Saree / Kurta Shoulders */}
        <path
          d="M 12 138 C 12 100 76 100 76 138 Z"
          fill="#EC4899"
          stroke="#111827"
          strokeWidth="4"
        />
        <path
          d="M 22 112 L 58 138"
          stroke="#FACC15"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Hair Bun */}
        <circle
          cx="70"
          cy="56"
          r="13"
          fill="#111827"
          stroke="#111827"
          strokeWidth="3"
        />
        {/* Gold Jhumka Earrings */}
        <circle
          cx="15"
          cy="78"
          r="5"
          fill="#FACC15"
          stroke="#111827"
          strokeWidth="3"
        />
        <circle
          cx="73"
          cy="78"
          r="5"
          fill="#FACC15"
          stroke="#111827"
          strokeWidth="3"
        />
        {/* Head */}
        <circle
          cx="44"
          cy="70"
          r="27"
          fill="#E08250"
          stroke="#111827"
          strokeWidth="4"
        />
        {/* Hair Front */}
        <path
          d="M 17 68 C 17 38 71 38 71 68 C 58 52 30 52 17 68 Z"
          fill="#111827"
        />
        {/* Red Bindi */}
        <circle cx="44" cy="54" r="3" fill="#EF4444" />
        {/* Cool Cat-Eye Sunglasses */}
        <rect
          x="23"
          y="58"
          width="18"
          height="12"
          rx="4"
          fill="#111827"
          stroke="#FACC15"
          strokeWidth="2"
        />
        <rect
          x="47"
          y="58"
          width="18"
          height="12"
          rx="4"
          fill="#111827"
          stroke="#FACC15"
          strokeWidth="2"
        />
        <line x1="41" y1="63" x2="47" y2="63" stroke="#111827" strokeWidth="3" />
        {/* Happy Smile */}
        <path
          d="M 36 82 Q 44 91 52 82"
          fill="none"
          stroke="#111827"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </g>

      {/* CENTER PROP HELD BETWEEN THEM: COIN, PHONE, OR CAKE */}
      {propType === 'coin' && (
        <g transform="translate(112, 82)">
          <circle
            cx="28"
            cy="28"
            r="26"
            fill="#FACC15"
            stroke="#111827"
            strokeWidth="4.5"
          />
          <circle
            cx="28"
            cy="28"
            r="19"
            fill="#FDE047"
            stroke="#111827"
            strokeWidth="2.5"
          />
          <text
            x="28"
            y="36"
            textAnchor="middle"
            fill="#111827"
            fontWeight="900"
            fontSize="24"
            fontFamily="Anton, sans-serif"
          >
            ₹
          </text>
        </g>
      )}

      {propType === 'phone' && (
        <g transform="translate(118, 76)">
          <rect
            x="4"
            y="2"
            width="36"
            height="56"
            rx="8"
            fill="#38BDF8"
            stroke="#111827"
            strokeWidth="4.5"
          />
          <circle cx="22" cy="49" r="3" fill="#111827" />
          <path
            d="M 14 28 L 20 34 L 30 20"
            fill="none"
            stroke="#111827"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}

      {propType === 'cake' && (
        <g transform="translate(110, 78)">
          {/* Bottom Cake Layer */}
          <rect
            x="6"
            y="32"
            width="48"
            height="22"
            rx="5"
            fill="#F472B6"
            stroke="#111827"
            strokeWidth="4"
          />
          {/* Top Cake Layer */}
          <rect
            x="14"
            y="16"
            width="32"
            height="16"
            rx="4"
            fill="#FDE047"
            stroke="#111827"
            strokeWidth="4"
          />
          {/* Candle + Flame */}
          <rect
            x="27"
            y="4"
            width="6"
            height="12"
            fill="#38BDF8"
            stroke="#111827"
            strokeWidth="3"
          />
          <circle
            cx="30"
            cy="1"
            r="4.5"
            fill="#FB923C"
            stroke="#111827"
            strokeWidth="2.5"
          />
        </g>
      )}
    </svg>
  );
};

// 3. CAKE PROGRESS BAR (Fills layer by layer from 0 to 100 points)
interface CakeProgressHeaderProps {
  points: number;
}

export const CakeProgressHeader: React.FC<CakeProgressHeaderProps> = ({
  points,
}) => {
  const clamped = Math.min(100, Math.max(0, points));
  const layers = [
    { threshold: 20, label: 'Base', color: '#FDE047' },
    { threshold: 40, label: 'Cream', color: '#FB7185' },
    { threshold: 60, label: 'Choco', color: '#A855F7' },
    { threshold: 80, label: 'Icing', color: '#38BDF8' },
    { threshold: 100, label: 'Cherry', color: '#4ADE80' },
  ];

  return (
    <div className="flex items-center gap-3 bg-white px-3.5 py-1.5 rounded-2xl chunky-card">
      {/* Big Coin Counter: "37 / 100" */}
      <div className="flex items-center gap-1.5">
        <span className="text-xl">🪙</span>
        <span className="font-poster text-xl sm:text-2xl text-[#111827] tracking-wider">
          {clamped} / 100
        </span>
      </div>

      {/* 5-Layer Cake Progress Indicator */}
      <div className="flex items-center gap-1" title="Cake Progress Bar">
        {layers.map((layer, i) => {
          const active = clamped >= layer.threshold || (i === 0 && clamped > 0);
          return (
            <div
              key={layer.label}
              style={{
                backgroundColor: active ? layer.color : '#E5E7EB',
              }}
              className="w-3.5 h-5 rounded-sm border-2 border-[#111827] transition-all duration-300"
            />
          );
        })}
        <span className="text-lg ml-0.5">{clamped >= 100 ? '🎂' : '🍰'}</span>
      </div>
    </div>
  );
};
