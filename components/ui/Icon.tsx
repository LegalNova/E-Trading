// Iconos de línea (trazo 1,5 px, terminaciones rectas), sacados del diseño.
export const ICONS = {
  home: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z',
  learn: 'M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z M20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z',
  market: 'M3 3v18h18 M7 14l4-4 3 3 6-6',
  portfolio: 'M3 7h18v13H3z M8 7V4h8v3 M3 12h18',
  more: 'M4 6h16 M4 12h16 M4 18h16',
  back: 'M15 5l-7 7 7 7',
  chevron: 'M9 6l6 6-6 6',
  close: 'M6 6l12 12 M18 6 6 18',
  check: 'M5 12l5 5 9-10',
  flame: 'M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5 1-8.5z',
  moon: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M20 20l-4-4',
  sort: 'M8 4v16 M4 16l4 4 4-4 M16 20V4 M12 8l4-4 4 4',
  lock: 'M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4',
  warn: 'M12 3 2 20h20z M12 10v4 M12 17v.5',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.5 2.9 1-6.1L3.2 9.5l6.1-.9z',
  play: 'M8 5v14l11-7z',
  trophy: 'M6 4h12v5a6 6 0 0 1-12 0z M9 20h6 M12 15v5',
  badge: 'M5 3h14v14l-7 4-7-4z',
  chat: 'M4 5h16v11H9l-5 4z M8 10h8',
  bank: 'M3 21h18 M5 21V10 M19 21V10 M12 3 3 8h18z M9 21v-7 M15 21v-7',
  user: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M4 21c1-4 4-6 8-6s7 2 8 6',
  bell: 'M6 16V10a6 6 0 0 1 12 0v6l2 2H4z M10 21h4',
  card: 'M3 6h18v12H3z M3 10h18',
  shield: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z',
  target: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  logout: 'M15 4h5v16h-5 M10 8l-4 4 4 4 M6 12h10',
} as const

export function Icon({
  d,
  size = 20,
  color = 'currentColor',
  stroke = 1.5,
  fill = 'none',
  style,
}: {
  d: string
  size?: number
  color?: string
  stroke?: number
  fill?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="square"
      aria-hidden="true"
      style={{ flex: 'none', ...style }}
    >
      <path d={d} />
    </svg>
  )
}
