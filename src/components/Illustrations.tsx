// Tuna Supply — Clean, simple kawaii illustrations
// Thick plum outlines, flat fills, minimal detail, round everything

const O = '#4A3040'
const R = 'round' as const

// ─── BLOB CAT ────────────────────────────────────────────

export function TunaCat({ size = 80, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" strokeLinecap={R} strokeLinejoin={R} className={className}>
      {/* Body */}
      <ellipse cx="40" cy="52" rx="24" ry="20" fill="white" stroke={O} strokeWidth="3" />
      {/* Head */}
      <circle cx="40" cy="30" r="20" fill="white" stroke={O} strokeWidth="3" />
      {/* Ears */}
      <path d="M24 16 L27 4 L34 14" fill="white" stroke={O} strokeWidth="2.5" />
      <path d="M28 14 L29 7 L33 13" fill="#FFADA8" />
      <path d="M56 16 L53 4 L46 14" fill="white" stroke={O} strokeWidth="2.5" />
      <path d="M52 14 L51 7 L47 13" fill="#FFADA8" />
      {/* Gray patch */}
      <path d="M46 12 Q54 16 56 24 Q50 18 44 14 Z" fill="#D1D5DB" />
      {/* Eyes */}
      <circle cx="34" cy="28" r="2.5" fill={O} />
      <circle cx="46" cy="28" r="2.5" fill={O} />
      <circle cx="35" cy="27" r="1" fill="white" />
      <circle cx="47" cy="27" r="1" fill="white" />
      {/* Nose */}
      <path d="M38 33 L40 35 L42 33" fill="#FFADA8" stroke={O} strokeWidth="1" />
      {/* Mouth */}
      <path d="M37 36 Q38.5 38 40 36 Q41.5 38 43 36" stroke={O} strokeWidth="1.2" fill="none" />
      {/* Whiskers */}
      <line x1="22" y1="32" x2="30" y2="33" stroke={O} strokeWidth="1" />
      <line x1="22" y1="36" x2="30" y2="35" stroke={O} strokeWidth="1" />
      <line x1="50" y1="33" x2="58" y2="32" stroke={O} strokeWidth="1" />
      <line x1="50" y1="35" x2="58" y2="36" stroke={O} strokeWidth="1" />
      {/* Collar */}
      <path d="M28 44 Q40 50 52 44" stroke="#6B7F5E" strokeWidth="3" fill="none" />
      <circle cx="40" cy="48" r="2.5" fill="#FFD166" stroke={O} strokeWidth="1" />
      {/* Paws */}
      <ellipse cx="30" cy="68" rx="8" ry="5" fill="white" stroke={O} strokeWidth="2" />
      <ellipse cx="50" cy="68" rx="8" ry="5" fill="white" stroke={O} strokeWidth="2" />
      {/* Tail */}
      <path d="M62 48 Q72 38 68 28" stroke={O} strokeWidth="3.5" fill="none" />
    </svg>
  )
}

// ─── SMALL CAT HEAD ──────────────────────────────────────

export function TunaCatSmall({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" strokeLinecap={R} strokeLinejoin={R} className={className}>
      <circle cx="20" cy="22" r="14" fill="white" stroke={O} strokeWidth="2.5" />
      <path d="M9 12 L11 3 L17 11" fill="white" stroke={O} strokeWidth="2" />
      <path d="M11.5 11 L12.5 5.5 L15.5 10.5" fill="#FFADA8" />
      <path d="M31 12 L29 3 L23 11" fill="white" stroke={O} strokeWidth="2" />
      <path d="M28.5 11 L27.5 5.5 L24.5 10.5" fill="#FFADA8" />
      <circle cx="16" cy="20" r="2" fill={O} />
      <circle cx="24" cy="20" r="2" fill={O} />
      <circle cx="16.6" cy="19.4" r="0.8" fill="white" />
      <circle cx="24.6" cy="19.4" r="0.8" fill="white" />
      <path d="M19 25 L20 26.5 L21 25" fill="#FFADA8" stroke={O} strokeWidth="0.8" />
      <path d="M18 27.5 Q19 29 20 27.5 Q21 29 22 27.5" stroke={O} strokeWidth="1" fill="none" />
    </svg>
  )
}

// ─── FISH ────────────────────────────────────────────────

export function FishIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap={R} strokeLinejoin={R} className={className}>
      <ellipse cx="10" cy="12" rx="8" ry="5.5" fill="#E8EDE4" stroke={O} strokeWidth="2" />
      <polygon points="16,8 22,12 16,16" fill="#E8EDE4" stroke={O} strokeWidth="2" />
      <circle cx="7" cy="11" r="1.5" fill={O} />
      <circle cx="7.5" cy="10.5" r="0.6" fill="white" />
      <path d="M10 8 Q11.5 5 13 8" fill="#9BB08E" stroke={O} strokeWidth="1.5" />
    </svg>
  )
}

// ─── LEAF ────────────────────────────────────────────────

export function LeafSprig({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" strokeLinecap={R} strokeLinejoin={R} className={className}>
      <path d="M9 16 L9 8" stroke="#4A5A3E" strokeWidth="1.5" />
      <path d="M9 12 Q4 10 4 5 Q8 6 9 10" fill="#9BB08E" stroke="#4A5A3E" strokeWidth="1.5" />
      <path d="M9 9 Q14 7 14 2 Q10 3 9 7" fill="#9BB08E" stroke="#4A5A3E" strokeWidth="1.5" />
    </svg>
  )
}

// ─── SPARKLE ─────────────────────────────────────────────

export function Sparkle({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M7 1 L8.2 5.2 L13 7 L8.2 8.8 L7 13 L5.8 8.8 L1 7 L5.8 5.2 Z" fill="#FFD166" stroke={O} strokeWidth="0.8" strokeLinecap={R} strokeLinejoin={R} />
    </svg>
  )
}

// ─── BIRTHDAY CAKE (for header — replaces "Born" text) ──

export function IconCake({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" strokeLinecap={R} strokeLinejoin={R} className={className}>
      {/* Plate */}
      <line x1="2" y1="18" x2="18" y2="18" stroke={O} strokeWidth="2" />
      {/* Cake body */}
      <rect x="4" y="10" width="12" height="8" rx="1.5" fill="#E8EDE4" stroke={O} strokeWidth="1.8" />
      {/* Icing wave */}
      <path d="M4 12 Q6 14 8 12 Q10 10 12 12 Q14 14 16 12" stroke={O} strokeWidth="1.5" fill="none" />
      {/* Candle */}
      <rect x="9" y="5" width="2" height="5" rx="0.5" fill="#6B7F5E" stroke={O} strokeWidth="1" />
      {/* Flame */}
      <path d="M10 5 Q9 3 10 1 Q11 3 10 5" fill="#FFD166" stroke={O} strokeWidth="0.8" />
    </svg>
  )
}

// ─── STRIPE ──────────────────────────────────────────────

export function StoreStripe({ className = '' }: { className?: string }) {
  return (
    <div className={`flex h-1.5 w-full ${className}`}>
      <div className="flex-1 bg-[#4A5A3E]" />
      <div className="flex-1 bg-white" />
      <div className="flex-1 bg-[#6B7F5E]" />
    </div>
  )
}

// ─── EMPTY STATES (simple single-subject drawings) ───────

export function FoodBowlIllustration({ size = 80, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size * 0.85 }}>
      <svg width={size} height={size * 0.75} viewBox="0 0 80 60" fill="none" strokeLinecap={R} strokeLinejoin={R} style={{ position: 'absolute', bottom: 0 }}>
        {/* Bowl */}
        <path d="M15 32 Q15 52 40 52 Q65 52 65 32 Z" fill="#6B7F5E" stroke={O} strokeWidth="2.5" />
        <ellipse cx="40" cy="32" rx="25" ry="7" fill="#E8EDE4" stroke={O} strokeWidth="2.5" />
        {/* Steam */}
        <path d="M32 18 Q34 12 32 6" stroke={O} strokeWidth="1.2" opacity="0.2" fill="none" />
        <path d="M42 16 Q44 10 42 4" stroke={O} strokeWidth="1.2" opacity="0.2" fill="none" />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/shrimp.png" alt="shrimp" width={size * 0.4} height={size * 0.4} style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }} />
    </div>
  )
}

export function ShieldIllustration({ size = 80, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" strokeLinecap={R} strokeLinejoin={R} className={className}>
      {/* Shield */}
      <path d="M40 6 L64 18 V38 Q64 60 40 70 Q16 60 16 38 V18 Z" fill="#E8EDE4" stroke={O} strokeWidth="2.5" />
      <path d="M40 14 L58 24 V38 Q58 54 40 62 Q22 54 22 38 V24 Z" fill="white" stroke="#6B7F5E" strokeWidth="1.5" />
      {/* Checkmark */}
      <path d="M30 38 L37 46 L52 28" stroke="#4A5A3E" strokeWidth="4" fill="none" />
    </svg>
  )
}

export function ClipboardIllustration({ size = 80, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" strokeLinecap={R} strokeLinejoin={R} className={className}>
      {/* Board */}
      <rect x="14" y="14" width="44" height="58" rx="5" fill="#FFF5E6" stroke={O} strokeWidth="2.5" />
      {/* Clip */}
      <rect x="26" y="6" width="20" height="14" rx="4" fill="#6B7F5E" stroke={O} strokeWidth="2.5" />
      <circle cx="36" cy="13" r="3" fill="white" stroke={O} strokeWidth="1.5" />
      {/* Lines */}
      <line x1="24" y1="32" x2="48" y2="32" stroke="#E8D5B5" strokeWidth="2" />
      <line x1="24" y1="42" x2="48" y2="42" stroke="#E8D5B5" strokeWidth="2" />
      <line x1="24" y1="52" x2="40" y2="52" stroke="#E8D5B5" strokeWidth="2" />
      {/* Checks */}
      <path d="M22 31 L25 34 L30 28" stroke="#4A5A3E" strokeWidth="2" fill="none" />
      <path d="M22 41 L25 44 L30 38" stroke="#4A5A3E" strokeWidth="2" fill="none" />
      {/* Small heart */}
      <path d="M42 56 Q42 52 45 52 Q48 52 48 56 Q48 60 45 62 Q42 60 42 56 Z" fill="#FFADA8" stroke={O} strokeWidth="1" />
    </svg>
  )
}

export function NotebookIllustration({ size = 80, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" strokeLinecap={R} strokeLinejoin={R} className={className}>
      {/* Cover */}
      <rect x="12" y="10" width="48" height="60" rx="4" fill="#6B7F5E" stroke={O} strokeWidth="2.5" />
      {/* Spine */}
      <rect x="12" y="10" width="8" height="60" rx="2" fill="#5A6E4E" stroke={O} strokeWidth="2" />
      {/* Pages */}
      <rect x="22" y="14" width="34" height="52" rx="2" fill="#FFF5E6" stroke={O} strokeWidth="1.5" />
      {/* Lines */}
      <line x1="26" y1="24" x2="52" y2="24" stroke="#E8D5B5" strokeWidth="1.5" />
      <line x1="26" y1="32" x2="52" y2="32" stroke="#E8D5B5" strokeWidth="1.5" />
      <line x1="26" y1="40" x2="52" y2="40" stroke="#E8D5B5" strokeWidth="1.5" />
      <line x1="26" y1="48" x2="40" y2="48" stroke="#E8D5B5" strokeWidth="1.5" />
      {/* Ribbon bookmark */}
      <rect x="44" y="10" width="6" height="14" rx="1" fill="#FFADA8" stroke={O} strokeWidth="1" />
      <path d="M44 24 L47 21 L50 24" fill="#FFADA8" stroke={O} strokeWidth="1" />
    </svg>
  )
}

// ─── SMALL ICONS ─────────────────────────────────────────

export function IconStethoscope({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" strokeLinecap={R} strokeLinejoin={R} className={className}>
      <circle cx="10" cy="14" r="4" fill="#E8EDE4" stroke={O} strokeWidth="2" />
      <circle cx="10" cy="14" r="1.5" fill={O} />
      <path d="M7 11 Q5 5 3 2" stroke={O} strokeWidth="2" fill="none" />
      <path d="M13 11 Q15 5 17 2" stroke={O} strokeWidth="2" fill="none" />
      <circle cx="3" cy="2" r="1.5" fill="#6B7F5E" stroke={O} strokeWidth="1" />
      <circle cx="17" cy="2" r="1.5" fill="#6B7F5E" stroke={O} strokeWidth="1" />
    </svg>
  )
}

export function IconSyringe({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" strokeLinecap={R} strokeLinejoin={R} className={className}>
      <rect x="6" y="3" width="8" height="12" rx="2" fill="#E8EDE4" stroke={O} strokeWidth="2" />
      <line x1="6" y1="7" x2="14" y2="7" stroke={O} strokeWidth="1.2" />
      <line x1="6" y1="10.5" x2="14" y2="10.5" stroke={O} strokeWidth="1.2" />
      <rect x="8" y="0.5" width="4" height="3.5" rx="1" fill="#6B7F5E" stroke={O} strokeWidth="1.5" />
      <path d="M9 15 L10 18.5 L11 15" stroke={O} strokeWidth="1.5" fill="none" />
      <line x1="11.5" y1="5" x2="12.5" y2="4" stroke="white" strokeWidth="1.2" />
    </svg>
  )
}

export function IconPill({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/pill.png" alt="pill" width={size} height={size} className={className} style={{ mixBlendMode: 'multiply', opacity: 0.45 }} />
  )
}

export function IconNote({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" strokeLinecap={R} strokeLinejoin={R} className={className}>
      <rect x="3" y="2" width="14" height="16" rx="2.5" fill="#FFF5E6" stroke={O} strokeWidth="2" />
      <line x1="6" y1="6.5" x2="14" y2="6.5" stroke="#E8D5B5" strokeWidth="1.5" />
      <line x1="6" y1="10" x2="14" y2="10" stroke="#E8D5B5" strokeWidth="1.5" />
      <line x1="6" y1="13.5" x2="11" y2="13.5" stroke="#E8D5B5" strokeWidth="1.5" />
    </svg>
  )
}

export function IconEye({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" strokeLinecap={R} strokeLinejoin={R} className={className}>
      <path d="M1 9 Q5 3 9 3 Q13 3 17 9 Q13 15 9 15 Q5 15 1 9 Z" fill="#FFF5E6" stroke={O} strokeWidth="2" />
      <circle cx="9" cy="9" r="3" fill="#6B7F5E" stroke={O} strokeWidth="1.5" />
      <circle cx="9" cy="9" r="1.2" fill={O} />
      <circle cx="10" cy="8" r="0.8" fill="white" />
    </svg>
  )
}

export function IconPhone({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" strokeLinecap={R} strokeLinejoin={R} className={className}>
      <rect x="4" y="1" width="10" height="16" rx="2.5" fill="#E8EDE4" stroke={O} strokeWidth="2" />
      <circle cx="9" cy="14" r="1.2" fill={O} />
      <line x1="7" y1="3.5" x2="11" y2="3.5" stroke={O} strokeWidth="1.2" />
      <rect x="5.5" y="5" width="7" height="7" rx="1" fill="white" stroke={O} strokeWidth="0.8" />
    </svg>
  )
}

export function IconAlert({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" strokeLinecap={R} strokeLinejoin={R} className={className}>
      <path d="M9 1 L17 15 L1 15 Z" fill="#EF6461" stroke={O} strokeWidth="2" />
      <line x1="9" y1="6" x2="9" y2="10.5" stroke="white" strokeWidth="2.5" />
      <circle cx="9" cy="13" r="1.2" fill="white" />
    </svg>
  )
}

export function PawPrint({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" strokeLinecap={R} strokeLinejoin={R} className={className}>
      <ellipse cx="10" cy="13" rx="4.5" ry="5" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1" />
      <circle cx="5.5" cy="7.5" r="2.5" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1" />
      <circle cx="14.5" cy="7.5" r="2.5" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1" />
      <circle cx="7.5" cy="3.5" r="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1" />
      <circle cx="12.5" cy="3.5" r="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}
