'use client'
import { useEffect, useMemo, useState } from 'react'
import { ASSETS, AssetCategory } from '@/data/assets'
import { useQuotes } from '@/hooks/useQuotes'
import { NavBar } from '@/components/ui/NavBar'
import { Icon, ICONS } from '@/components/ui/Icon'
import { AssetRow } from '@/components/market/AssetRow'
import { card, h1, input, sectionLabel } from '@/components/ui/styles'

const FILTERS: { label: string; cats: AssetCategory[] | null }[] = [
  { label: 'Todos', cats: null },
  { label: 'Acciones', cats: ['acciones-us', 'acciones-eu'] },
  { label: 'ETFs', cats: ['etfs'] },
  { label: 'Cripto', cats: ['cripto'] },
  { label: 'Forex', cats: ['forex'] },
  { label: 'Materias primas', cats: ['materias'] },
  { label: 'Índices', cats: ['indices'] },
]

type Sort = 'name' | 'up' | 'down'
const SORT_LABEL: Record<Sort, string> = { name: 'Nombre', up: 'Mayor subida', down: 'Mayor bajada' }
const NEXT_SORT: Record<Sort, Sort> = { name: 'up', up: 'down', down: 'name' }

/** ¿Está abierta la bolsa de Nueva York? (lun-vie 9:30-16:00 hora de NY) */
function usMarketOpen(now = new Date()): boolean {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(now)
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? ''
  const wd = get('weekday')
  const mins = Number(get('hour')) * 60 + Number(get('minute'))
  return !['Sat', 'Sun'].includes(wd) && mins >= 570 && mins < 960
}

export default function MercadoPage() {
  const { quotes, loaded } = useQuotes()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Todos')
  const [sort, setSort] = useState<Sort>('name')
  const [favs, setFavs] = useState<string[]>([])
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    fetch('/api/favorites').then(r => (r.ok ? r.json() : { symbols: [] })).then(d => setFavs(d.symbols ?? [])).catch(() => {})
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  const list = useMemo(() => {
    const cats = FILTERS.find(f => f.label === filter)?.cats
    const q = query.trim().toLowerCase()
    const out = ASSETS.filter(a => (!cats || cats.includes(a.category)) && (!q || (a.name + ' ' + a.symbol).toLowerCase().includes(q)))
    if (sort === 'name') return [...out].sort((a, b) => a.name.localeCompare(b.name, 'es'))
    const chg = (s: string) => quotes[s]?.changePercent ?? 0
    return [...out].sort((a, b) => (sort === 'up' ? chg(b.symbol) - chg(a.symbol) : chg(a.symbol) - chg(b.symbol)))
  }, [filter, query, sort, quotes])

  const favAssets = ASSETS.filter(a => favs.includes(a.symbol))
  const showFavs = favAssets.length > 0 && !query && filter === 'Todos'
  const open = now ? usMarketOpen(now) : null

  return (
    <div className="et-page" style={{ paddingBottom: 24 }}>
      <NavBar title="Mercado" />
      <div style={{ padding: '4px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h1 style={h1}>Mercado</h1>
        <label style={{ position: 'relative', display: 'block' }}>
          <Icon d={ICONS.search} size={18} color="var(--text-tertiary)" style={{ position: 'absolute', left: 12, top: 13 }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Busca Apple, Bitcoin, oro…"
            aria-label="Buscar activos"
            type="search"
            style={{ ...input, paddingLeft: 38 }}
          />
        </label>
        <div className="no-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', margin: '0 -16px', padding: '0 16px' }}>
          {FILTERS.map(f => {
            const on = f.label === filter
            return (
              <button
                key={f.label}
                onClick={() => setFilter(f.label)}
                aria-pressed={on}
                style={{
                  flex: 'none', height: 32, padding: '0 12px', borderRadius: 4, cursor: 'pointer', whiteSpace: 'nowrap', font: '500 13px var(--font)',
                  border: `1px solid ${on ? 'var(--text-primary)' : 'var(--border)'}`, background: on ? 'var(--text-primary)' : 'transparent',
                  color: on ? 'var(--bg)' : 'var(--text-secondary)',
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {showFavs && (
        <div style={{ padding: '24px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={sectionLabel}>Favoritos</span>
          <div style={card}>
            {favAssets.map((a, i) => <AssetRow key={a.symbol} asset={a} q={quotes[a.symbol]} last={i === favAssets.length - 1} />)}
          </div>
        </div>
      )}

      <div style={{ padding: '24px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={sectionLabel}>{list.length} {list.length === 1 ? 'activo' : 'activos'}</span>
          <button
            onClick={() => setSort(NEXT_SORT[sort])}
            disabled={!loaded && sort === 'name'}
            style={{ height: 32, padding: '0 4px', border: 'none', background: 'none', color: 'var(--blue)', font: '500 13px var(--font)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            Ordenar: {SORT_LABEL[sort]}
            <Icon d={ICONS.sort} size={14} />
          </button>
        </div>
        {list.length === 0 ? (
          <div style={{ ...card, padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
            <Icon d={ICONS.search} size={40} color="var(--text-tertiary)" stroke={1} />
            <span style={{ font: '400 15px var(--font)', color: 'var(--text-secondary)' }}>No hay activos con ese nombre.</span>
          </div>
        ) : (
          <div style={card}>
            {list.map((a, i) => <AssetRow key={a.symbol} asset={a} q={quotes[a.symbol]} last={i === list.length - 1} />)}
          </div>
        )}
        {open !== null && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', paddingTop: 8, font: '400 12px var(--font)', color: 'var(--text-secondary)', textAlign: 'center' }}>
            <i style={{ width: 6, height: 6, background: open ? 'var(--green)' : 'var(--text-tertiary)', display: 'block', flex: 'none' }} />
            Bolsa de EE. UU. {open ? 'abierta' : 'cerrada'} · Cripto 24 h · Actualizado a las {now?.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  )
}
