// Lumi: un cubo de gelatina que te acompaña. El backend devuelve el estado de ánimo y aquí se dibuja la cara.
// Con el nivel del alumno le van saliendo burbujitas de luz dentro (de 1 a 5).
import type { Mood } from '@/shared/contract'

const W = '#fff'
const EYES: Record<Mood, React.ReactNode> = {
  HAPPY: <path d="M15 21q3-4 6 0M27 21q3-4 6 0" stroke={W} strokeWidth="2.6" fill="none" strokeLinecap="round" />,
  CELEBRATE: <path d="M18 16l1.4 3 3.2.4-2.3 2.2.6 3.2-2.9-1.6-2.9 1.6.6-3.2-2.3-2.2 3.2-.4zM30 16l1.4 3 3.2.4-2.3 2.2.6 3.2-2.9-1.6-2.9 1.6.6-3.2-2.3-2.2 3.2-.4z" fill={W} />,
  WORRIED: (
    <>
      <path d="M14 15l6 3M34 15l-6 3" stroke={W} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="18" cy="22" r="3" fill={W} />
      <circle cx="30" cy="22" r="3" fill={W} />
    </>
  ),
  CALM: <path d="M15 21h6M27 21h6" stroke={W} strokeWidth="2.6" strokeLinecap="round" />,
  SAD: (
    <>
      <circle cx="18" cy="21" r="3" fill={W} />
      <circle cx="30" cy="21" r="3" fill={W} />
      <path d="M14 16l5-2M34 16l-5-2" stroke={W} strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  SLEEPY: <path d="M15 21q3 3 6 0M27 21q3 3 6 0" stroke={W} strokeWidth="2.4" fill="none" strokeLinecap="round" />,
  THINKING: (
    <>
      <circle cx="18" cy="21" r="3" fill={W} />
      <circle cx="31" cy="19" r="3" fill={W} />
    </>
  ),
}

const MOUTH: Record<Mood, React.ReactNode> = {
  HAPPY: <path d="M19 30q5 5 10 0" stroke={W} strokeWidth="2.6" fill="none" strokeLinecap="round" />,
  CELEBRATE: <path d="M18 29q6 8 12 0z" fill={W} />,
  WORRIED: <path d="M19 32q5-4 10 0" stroke={W} strokeWidth="2.4" fill="none" strokeLinecap="round" />,
  CALM: <path d="M20 31h8" stroke={W} strokeWidth="2.4" strokeLinecap="round" />,
  SAD: <path d="M19 33q5-5 10 0" stroke={W} strokeWidth="2.4" fill="none" strokeLinecap="round" />,
  SLEEPY: <circle cx="24" cy="31" r="2.4" fill={W} />,
  THINKING: <path d="M20 31q4 2 8-1" stroke={W} strokeWidth="2.4" fill="none" strokeLinecap="round" />,
}

export const SKINS: { id: string; color: string; unlockLevel: number }[] = [
  { id: 'azul', color: 'var(--brand)', unlockLevel: 1 },
  { id: 'grafito', color: '#3A3A3C', unlockLevel: 1 },
  { id: 'plata', color: '#8E8E93', unlockLevel: 1 },
  { id: 'hielo', color: '#64D2FF', unlockLevel: 5 },
]

/** Etapa según el nivel: de 1 a 5 burbujitas de luz dentro de la gelatina */
export const stageOf = (level: number) => (level >= 8 ? 5 : level >= 6 ? 4 : level >= 4 ? 3 : level >= 2 ? 2 : 1)
const BUBBLES: [number, number, number][] = [
  [38, 37, 1.6],
  [9, 36, 1.3],
  [39, 11, 1.2],
  [10, 12, 1.1],
  [24, 41, 1.4],
]

export function Lumi({ mood = 'HAPPY', size = 44, skin = 'azul', stage = 1, label = 'Lumi', className, animated = true }: { mood?: Mood; size?: number; skin?: string; stage?: number; label?: string; className?: string; animated?: boolean }) {
  const fill = SKINS.find(s => s.id === skin)?.color ?? 'var(--brand)'
  const st = Math.min(5, Math.max(1, stage))
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={label} className={`lumi ${animated ? 'lumi-anim' : ''} lumi-${mood.toLowerCase()} ${className ?? ''}`} style={{ flex: 'none', overflow: 'visible' }}>
      <defs>
        <linearGradient id="lumi-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={W} stopOpacity="0.28" />
          <stop offset="0.45" stopColor={W} stopOpacity="0.04" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <ellipse cx="24" cy="47" rx="15" ry="1.6" fill="#000" opacity="0.12" />
      <g className="lumi-body">
        {/* El cubo de gelatina: color, brillo de arriba y reflejo */}
        <rect x="2" y="2" width="44" height="44" rx="16" fill={fill} />
        <rect x="2" y="2" width="44" height="44" rx="16" fill="url(#lumi-gloss)" />
        <path d="M10 9q6-4 13-3" stroke={W} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.55" />
        {/* Burbujitas de luz (crecen con el nivel) */}
        {BUBBLES.slice(0, st).map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={W} opacity="0.45" className="lumi-bubble" />
        ))}
        <g className="lumi-eyes">{EYES[mood]}</g>
        {MOUTH[mood]}
      </g>
      {mood === 'SLEEPY' && (
        <text x="40" y="5" fill="currentColor" opacity="0.6" fontSize="9" fontWeight="800" fontFamily="var(--font-sans), system-ui">
          z
        </text>
      )}
    </svg>
  )
}

/** Burbuja de Lumi con su mensaje */
export function LumiSays({ mood, message, size = 40, skin, stage }: { mood: Mood; message: React.ReactNode; size?: number; skin?: string; stage?: number }) {
  return (
    <div className="card flex items-start gap-3">
      <Lumi mood={mood} size={size} skin={skin} stage={stage} />
      <p className="t-foot m-0 self-center" style={{ color: 'var(--ink)' }}>
        {message}
      </p>
    </div>
  )
}
