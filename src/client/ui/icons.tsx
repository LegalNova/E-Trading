// Iconos de línea (24×24, trazo 1.8) y pictogramas de la economía del juego.
const PATHS = {
  home: 'M4 11 12 4l8 7v9h-5v-6H9v6H4z',
  learn: 'M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z',
  market: 'M4 4v16h16M7 15l4-4 3 3 6-6',
  league: 'M7 4h10v5a5 5 0 0 1-10 0zM10 20h4M12 14v6M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3',
  user: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21c1-4 4-6 8-6s7 2 8 6',
  back: 'M15 5l-7 7 7 7',
  close: 'M6 6l12 12M18 6 6 18',
  chev: 'M9 6l6 6-6 6',
  lock: 'M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3',
  check: 'M5 12l5 5 9-10',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.5 2.9 1-6.1L3.2 9.5l6.1-.9z',
  bell: 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4',
  gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  clock: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 8v4l3 2',
  shield: 'M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z',
  wallet: 'M4 7h16v12H4zM4 7l2-3h12l2 3M16 13h2',
  chart: 'M5 20V10M12 20V4M19 20v-7',
  plus: 'M12 5v14M5 12h14',
  trash: 'M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  admin: 'M4 5h16v10H4zM9 19h6M12 15v4',
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  info: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 11v5M12 8v.01',
  expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z',
  filter: 'M4 5h16l-6 8v5l-4 2v-7z',
} as const

export type IconName = keyof typeof PATHS

export function Icon({ name, size = 22, className, strokeWidth = 1.8 }: { name: IconName; size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={{ flex: 'none' }}>
      <path d={PATHS[name]} />
    </svg>
  )
}

export function Flame({ size = 14, color = 'var(--brand)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size + 2} viewBox="0 0 12 14" aria-hidden="true" style={{ flex: 'none' }}>
      <path d="M6 0C7 4 11 5 11 9a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3C5 6 4 3 6 0z" fill={color} />
    </svg>
  )
}

export function Gem({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true" style={{ flex: 'none' }}>
      <path d="M6 0l6 4-6 8-6-8z" fill="var(--gem)" />
    </svg>
  )
}

export function Heart({ size = 13, color = 'var(--down)' }: { size?: number; color?: string }) {
  return (
    <svg width={size + 1} height={size} viewBox="0 0 13 12" aria-hidden="true" style={{ flex: 'none' }}>
      <path d="M6.5 12L1 6.5A3.3 3.3 0 016.5 2a3.3 3.3 0 015.5 4.5z" fill={color} />
    </svg>
  )
}

/** Logotipo: el cuadrado redondeado de Lumi con una línea de precio */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" style={{ flex: 'none' }}>
      <rect x="2" y="2" width="44" height="44" rx="14" fill="var(--brand)" />
      <path d="M12 31l8-8 6 5 10-11" stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
