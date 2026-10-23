// Lumi: el backend devuelve el estado de ánimo y el frontend dibuja la cara.
import type { Mood } from '@/shared/contract'

const EYES: Record<Mood, React.ReactNode> = {
  HAPPY: <path d="M15 21q3-4 6 0M27 21q3-4 6 0" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />,
  CELEBRATE: <path d="M18 16l1.4 3 3.2.4-2.3 2.2.6 3.2-2.9-1.6-2.9 1.6.6-3.2-2.3-2.2 3.2-.4zM30 16l1.4 3 3.2.4-2.3 2.2.6 3.2-2.9-1.6-2.9 1.6.6-3.2-2.3-2.2 3.2-.4z" fill="#fff" />,
  WORRIED: (
    <>
      <path d="M14 15l6 3M34 15l-6 3" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="18" cy="22" r="3" fill="#fff" />
      <circle cx="30" cy="22" r="3" fill="#fff" />
    </>
  ),
  CALM: <path d="M15 21h6M27 21h6" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />,
  SAD: (
    <>
      <circle cx="18" cy="21" r="3" fill="#fff" />
      <circle cx="30" cy="21" r="3" fill="#fff" />
      <path d="M14 16l5-2M34 16l-5-2" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  SLEEPY: <path d="M15 21q3 3 6 0M27 21q3 3 6 0" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />,
  THINKING: (
    <>
      <circle cx="18" cy="21" r="3" fill="#fff" />
      <circle cx="31" cy="19" r="3" fill="#fff" />
    </>
  ),
}

const MOUTH: Record<Mood, React.ReactNode> = {
  HAPPY: <path d="M19 30q5 5 10 0" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />,
  CELEBRATE: <path d="M18 29q6 8 12 0z" fill="#fff" />,
  WORRIED: <path d="M19 32q5-4 10 0" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />,
  CALM: <path d="M20 31h8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />,
  SAD: <path d="M19 33q5-5 10 0" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />,
  SLEEPY: <circle cx="24" cy="31" r="2.4" fill="#fff" />,
  THINKING: <path d="M20 31q4 2 8-1" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />,
}

export const SKINS: { id: string; color: string; unlockLevel: number }[] = [
  { id: 'azul', color: 'var(--brand)', unlockLevel: 1 },
  { id: 'grafito', color: '#3A3A3C', unlockLevel: 1 },
  { id: 'plata', color: '#8E8E93', unlockLevel: 1 },
  { id: 'hielo', color: '#64D2FF', unlockLevel: 5 },
]

export function Lumi({ mood = 'HAPPY', size = 44, skin = 'azul', label = 'Lumi', className }: { mood?: Mood; size?: number; skin?: string; label?: string; className?: string }) {
  const fill = SKINS.find(s => s.id === skin)?.color ?? 'var(--brand)'
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={label} className={className} style={{ flex: 'none' }}>
      <rect x="2" y="2" width="44" height="44" rx="16" fill={fill} />
      {EYES[mood]}
      {MOUTH[mood]}
    </svg>
  )
}

/** Burbuja de Lumi con su mensaje */
export function LumiSays({ mood, message, size = 40, skin }: { mood: Mood; message: React.ReactNode; size?: number; skin?: string }) {
  return (
    <div className="card flex items-start gap-3">
      <Lumi mood={mood} size={size} skin={skin} />
      <p className="t-foot m-0 self-center" style={{ color: 'var(--ink)' }}>
        {message}
      </p>
    </div>
  )
}
