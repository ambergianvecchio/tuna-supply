'use client'

interface TabBarProps {
  activeTab: number
  onChange: (index: number) => void
}

const tabs = [
  { label: 'Food', icon: FoodIcon },
  { label: 'Safety', icon: SafetyIcon },
  { label: 'Records', icon: RecordsIcon },
  { label: 'Journal', icon: JournalIcon },
]

export default function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <nav className="sticky bottom-0 w-full bg-white border-t border-warm-border/40 px-2 pb-2 z-50">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab, i) => {
          const isActive = activeTab === i
          const Icon = tab.icon
          return (
            <button
              key={tab.label}
              onClick={() => onChange(i)}
              className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive ? 'text-teal' : 'text-text-secondary'
              }`}
            >
              <div className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                <Icon active={isActive} />
              </div>
              <span className={`text-[10px] font-bold tracking-wide uppercase ${isActive ? 'text-teal' : ''}`}>
                {tab.label}
              </span>
              {isActive && <span className="absolute -bottom-0.5 w-5 h-1 rounded-full bg-teal" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function FoodIcon({ active }: { active: boolean }) {
  const c = active ? '#6B7F5E' : '#6B7280'
  return (
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Bowl */}
      <path d="M4 26 Q4 42 24 42 Q44 42 44 26" stroke={c} strokeWidth="3.5" fill={active ? '#E8EDE4' : 'none'} />
      {/* Bowl rim */}
      <line x1="2" y1="26" x2="46" y2="26" stroke={c} strokeWidth="3.5" />
      {/* Chopsticks sticking out top right */}
      <line x1="26" y1="24" x2="36" y2="6" stroke={c} strokeWidth="3" />
      <line x1="30" y1="24" x2="42" y2="8" stroke={c} strokeWidth="3" />
      {/* Steam */}
      <path d="M12 20 Q14 14 12 8" stroke={c} strokeWidth="2.5" fill="none" />
      <path d="M20 18 Q22 12 20 6" stroke={c} strokeWidth="2.5" fill="none" />
    </svg>
  )
}

function SafetyIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 L20 6 V12 Q20 18 12 22 Q4 18 4 12 V6 Z" fill={active ? '#4A5A3E' : 'none'} stroke={active ? '#4A5A3E' : '#6B7280'} strokeWidth="1.5" opacity={active ? 0.15 : 1} />
      <path d="M12 2 L20 6 V12 Q20 18 12 22 Q4 18 4 12 V6 Z" stroke={active ? '#4A5A3E' : '#6B7280'} strokeWidth="1.5" fill="none" />
      <path d="M8.5 12 L11 14.5 L16 9" stroke={active ? '#4A5A3E' : '#6B7280'} strokeWidth="2" fill="none" />
    </svg>
  )
}

function RecordsIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="18" rx="2.5" fill={active ? '#EDF1EA' : 'none'} stroke={active ? '#E8D5B5' : '#6B7280'} strokeWidth="1.5" />
      <rect x="8" y="2" width="8" height="5" rx="2" fill={active ? '#6B7F5E' : '#6B7280'} />
      <line x1="8" y1="11" x2="16" y2="11" stroke={active ? '#E8D5B5' : '#D1D5DB'} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="14.5" x2="16" y2="14.5" stroke={active ? '#E8D5B5' : '#D1D5DB'} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="18" x2="13" y2="18" stroke={active ? '#E8D5B5' : '#D1D5DB'} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 10.5 L8.5 12 L11 9" stroke={active ? '#4A5A3E' : '#9CA3AF'} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function JournalIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="round">
      <rect x="4" y="3" width="16" height="19" rx="2" fill={active ? '#6B7F5E' : 'none'} stroke={active ? '#6B7F5E' : '#6B7280'} strokeWidth="1.5" opacity={active ? 0.15 : 1} />
      <rect x="4" y="3" width="16" height="19" rx="2" stroke={active ? '#6B7F5E' : '#6B7280'} strokeWidth="1.5" fill="none" />
      <line x1="7" y1="3" x2="7" y2="22" stroke={active ? '#5A6E4E' : '#9CA3AF'} strokeWidth="1.5" />
      <line x1="10" y1="8" x2="17" y2="8" stroke={active ? '#6B7F5E' : '#D1D5DB'} strokeWidth="1" />
      <line x1="10" y1="11.5" x2="17" y2="11.5" stroke={active ? '#6B7F5E' : '#D1D5DB'} strokeWidth="1" />
      <line x1="10" y1="15" x2="14" y2="15" stroke={active ? '#6B7F5E' : '#D1D5DB'} strokeWidth="1" />
    </svg>
  )
}
