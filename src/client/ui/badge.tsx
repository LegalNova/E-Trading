// Insignias: medallas vectoriales. La forma dice el tipo (hexágono = aprendizaje, moneda = mercado, escudo = constancia),
// el color dice la rareza (bronce, azul, morado, oro) y el dibujo del centro, lo que se ha conseguido.
import { useId } from 'react'

export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
type Category = 'LEARNING' | 'TRADING' | 'STREAK'

/** Dibujos en una cuadrícula de 24×24 (trazo blanco) */
const G = {
  book: 'M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5v13',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  target: 'M4 12a8 8 0 1 0 16 0a8 8 0 1 0-16 0M8 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0M12 12h.01',
  cap: 'M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6',
  compass: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0M15.5 8.5l-2 5-5 2 2-5z',
  review: 'M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4',
  bolt: 'M13 2L5 13h6l-1 9 8-11h-6z',
  candles: 'M7 3v3M7 14v7M5 6h4v8H5zM17 2v5M17 15v5M15 7h4v8h-4z',
  shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6zM9 12l2 2 4-4',
  sprout: 'M12 21v-8M12 13C12 8 8.5 6 4 6c0 4.5 3 7 8 7zM12 11c0-4 3-6 7-6 0 4-2.5 6-7 6',
  coin: 'M4 12a8 8 0 1 0 16 0a8 8 0 1 0-16 0M12 6.5v11M14.5 9h-3.5a1.75 1.75 0 0 0 0 3.5h2a1.75 1.75 0 0 1 0 3.5H9.5',
  bars: 'M5 20v-8M10 20V6M15 20v-10M20 20V4',
  pie: 'M11 4a8 8 0 1 0 9 9h-9zM14 3a7.5 7.5 0 0 1 7 7h-7z',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  stop: 'M3 5l6 6 4-4 7 7M3 19h18M20 14v-4',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  limit: 'M3 16h18M12 3v9M8 8l4 4 4-4',
  up: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  calm: 'M10 14V5a2 2 0 1 1 4 0v9a4 4 0 1 1-4 0zM12 9v7',
  bell: 'M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0',
  btc: 'M8 5v14M8 5h6a3 3 0 0 1 0 6H8M8 11h7a3.5 3.5 0 0 1 0 7H8M10 3v2M13 3v2M10 19v2M13 19v2',
  basket: 'M3 9h18l-2 11H5zM8 9l4-6 4 6M9 13v4M12 13v4M15 13v4',
  flame: 'M12 21c-4 0-7-2.8-7-6.5 0-3.8 3-5.5 4-9.5 2 1.5 3 3.5 3 5.5 1-1 1.5-2 1.5-3.5 2.5 2 4.5 4.6 4.5 7.5 0 3.7-3 6.5-6 6.5z',
  snow: 'M12 2v20M4 7l16 10M20 7L4 17M9 3l3 3 3-3M9 21l3-3 3 3',
  checks: 'M4 6l2 2 3-3M4 13l2 2 3-3M12 7h8M12 14h8M4 20h16',
  chevrons: 'M6 13l6-6 6 6M6 19l6-6 6 6',
  podium: 'M9 21V10h6v11M3 21v-7h6M15 21v-5h6M3 21h18M12 3l.9 1.8 2 .3-1.5 1.4.4 2L12 7.6l-1.8.9.4-2-1.5-1.4 2-.3z',
} as const

/** Dibujo, rareza y cifra de cada insignia */
export const BADGES: Record<string, { g: keyof typeof G; rarity: Rarity; n?: string }> = {
  FIRST_LESSON: { g: 'book', rarity: 'COMMON' },
  LESSONS_5: { g: 'book', rarity: 'COMMON', n: '5' },
  LESSONS_20: { g: 'book', rarity: 'RARE', n: '20' },
  LESSONS_50: { g: 'book', rarity: 'EPIC', n: '50' },
  QUIZ_PERFECT: { g: 'target', rarity: 'COMMON' },
  QUIZ_PERFECT_5: { g: 'target', rarity: 'EPIC', n: '5' },
  UNIT_1: { g: 'sprout', rarity: 'RARE' },
  UNIT_2: { g: 'candles', rarity: 'EPIC' },
  UNIT_3: { g: 'shield', rarity: 'EPIC' },
  COURSE_DONE: { g: 'cap', rarity: 'LEGENDARY' },
  PLACEMENT: { g: 'compass', rarity: 'COMMON' },
  REVIEW_10: { g: 'review', rarity: 'RARE', n: '10' },
  SPEED: { g: 'bolt', rarity: 'RARE' },
  FIRST_TRADE: { g: 'coin', rarity: 'COMMON' },
  TRADES_10: { g: 'bars', rarity: 'RARE', n: '10' },
  TRADES_50: { g: 'bars', rarity: 'EPIC', n: '50' },
  DIVERSIFY_3: { g: 'pie', rarity: 'RARE', n: '3' },
  DIVERSIFY_5: { g: 'grid', rarity: 'RARE', n: '5' },
  FIRST_STOP: { g: 'stop', rarity: 'RARE' },
  FIRST_TP: { g: 'flag', rarity: 'RARE' },
  FIRST_LIMIT: { g: 'limit', rarity: 'COMMON' },
  WEEK_POSITIVE: { g: 'up', rarity: 'EPIC' },
  CALM_RISK: { g: 'calm', rarity: 'EPIC', n: '3' },
  FIRST_ALERT: { g: 'bell', rarity: 'COMMON' },
  CRYPTO_FIRST: { g: 'btc', rarity: 'COMMON' },
  ETF_FIRST: { g: 'basket', rarity: 'COMMON' },
  STREAK_3: { g: 'flame', rarity: 'COMMON', n: '3' },
  STREAK_7: { g: 'flame', rarity: 'RARE', n: '7' },
  STREAK_30: { g: 'flame', rarity: 'EPIC', n: '30' },
  STREAK_100: { g: 'flame', rarity: 'LEGENDARY', n: '100' },
  FREEZE_USED: { g: 'snow', rarity: 'RARE' },
  GOALS_7: { g: 'checks', rarity: 'EPIC', n: '7' },
  LEAGUE_UP: { g: 'chevrons', rarity: 'RARE' },
  LEAGUE_TOP3: { g: 'podium', rarity: 'EPIC' },
}

/** Colores de cada rareza: claro (arriba), oscuro (abajo) y borde */
export const RARITY: Record<Rarity, { hi: string; lo: string; edge: string }> = {
  COMMON: { hi: '#E9B07A', lo: '#B8692E', edge: '#8F4F1F' },
  RARE: { hi: '#7FB2FF', lo: '#2F6FE0', edge: '#1F4FA8' },
  EPIC: { hi: '#B48CFF', lo: '#7140E0', edge: '#5129B0' },
  LEGENDARY: { hi: '#FFE07A', lo: '#E0A100', edge: '#A87400' },
}
const LOCKED = { hi: '#D1D1D6', lo: '#AEAEB2', edge: '#8E8E93' }

const SHAPE: Record<Category, string> = {
  LEARNING: 'M32 3l25 14.5v29L32 61 7 46.5v-29z',
  TRADING: 'M32 4a28 28 0 1 1 0 56a28 28 0 1 1 0-56z',
  STREAK: 'M32 3l24 8v20c0 15-11 25-24 30C19 56 8 46 8 31V11z',
}

export function rarityOf(code: string): Rarity {
  return BADGES[code]?.rarity ?? 'COMMON'
}

export function BadgeArt({ code, category, unlocked, size = 56, label }: { code: string; category: Category; unlocked: boolean; size?: number; label?: string }) {
  const id = `${code}${unlocked ? 'u' : 'l'}${useId()}`.replace(/[^a-zA-Z0-9_]/g, '')
  const b = BADGES[code] ?? { g: 'star', rarity: 'COMMON' as Rarity }
  const c = unlocked ? RARITY[b.rarity] : LOCKED
  const shape = SHAPE[category]
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={label} style={{ flex: 'none', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`bg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.hi} />
          <stop offset="1" stopColor={c.lo} />
        </linearGradient>
        <linearGradient id={`sh${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Medalla con borde, brillo y aro interior */}
      <path d={shape} fill={`url(#bg${id})`} stroke={c.edge} strokeWidth="2.5" strokeLinejoin="round" />
      <path d={shape} fill={`url(#sh${id})`} transform="translate(32 32) scale(.86) translate(-32 -32)" />
      <path d={shape} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" strokeLinejoin="round" transform="translate(32 32) scale(.8) translate(-32 -32)" />
      <g transform={`translate(20 ${b.n ? 15 : 20}) scale(1)`} fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity={unlocked ? 1 : 0.75}>
        <path d={G[b.g]} />
      </g>
      {/* Cinta con la cifra */}
      {b.n && (
        <g>
          <rect x={32 - (b.n.length * 4 + 7)} y="44" width={b.n.length * 8 + 14} height="13" rx="6.5" fill={c.edge} stroke="#fff" strokeWidth="1.5" />
          <text x="32" y="53.6" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff" fontFamily="var(--font-sans), system-ui">
            {b.n}
          </text>
        </g>
      )}
      {!unlocked && (
        <g transform="translate(45 1)">
          <circle cx="7" cy="7" r="8" fill="var(--surface, #fff)" stroke={c.edge} strokeWidth="1.5" />
          <path d="M4.5 7V5.5a2.5 2.5 0 0 1 5 0V7M3.5 7h7v4.5h-7z" fill="none" stroke={c.edge} strokeWidth="1.5" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  )
}
