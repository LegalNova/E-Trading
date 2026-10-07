'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useMe } from '@/components/shell/MeProvider'
import { usePortfolio, PortfolioData } from '@/hooks/usePortfolio'
import { useQuotes } from '@/hooks/useQuotes'
import { ASSET_BY_SYMBOL, ASSETS } from '@/data/assets'
import { syntheticSeries, Period, PERIOD_KEYS } from '@/lib/sim'
import { fe, fes, fpct, fcountdown } from '@/lib/format'
import { NavBar } from '@/components/ui/NavBar'
import { Icon, ICONS } from '@/components/ui/Icon'
import { Seg } from '@/components/ui/Seg'
import { AreaChart } from '@/components/ui/AreaChart'
import { Help, HelpSheet } from '@/components/ui/Help'
import { ThemeSheet } from '@/components/ui/ThemeSheet'
import { AssetRow } from '@/components/market/AssetRow'
import { card, btnPrimary, h1, h2, bar, btnText } from '@/components/ui/styles'

const DAY = 86_400_000
const SPAN: Record<Period, number> = { '1D': DAY, '1S': 7 * DAY, '1M': 30 * DAY, '3M': 90 * DAY, '1A': 365 * DAY, Todo: Infinity }
const PERIOD_LABEL: Record<Period, string> = { '1D': 'hoy', '1S': 'esta semana', '1M': 'este mes', '3M': 'en 3 meses', '1A': 'este año', Todo: 'desde el inicio' }

/** Serie del valor del portafolio para el periodo elegido */
function portfolioSeries(p: PortfolioData, period: Period): number[] {
  if (period === '1D') {
    if (p.positions.length === 0) return [p.total, p.total]
    const n = 48
    const out = new Array<number>(n).fill(p.cash)
    for (const pos of p.positions) {
      const a = ASSET_BY_SYMBOL[pos.symbol]
      if (!a || pos.price <= 0) continue
      const prev = pos.price / (1 + pos.changePct / 100)
      const s = syntheticSeries(pos.symbol, a.basePrice, DAY, n, pos.price, prev)
      const eurPerUnit = pos.valueEur / pos.price
      s.forEach((v, i) => { out[i] += v * eurPerUnit })
    }
    return out
  }
  const from = Date.now() - SPAN[period]
  const pts = p.history.filter(h => new Date(h.date).getTime() >= from).map(h => h.value)
  const before = p.history.filter(h => new Date(h.date).getTime() < from).pop()
  const series = [...(before ? [before.value] : []), ...pts]
  series[series.length - 1] = p.total
  return series.length >= 2 ? series : [series[0] ?? p.total, p.total]
}

export default function HomePage() {
  const { me } = useMe()
  const { data: pf } = usePortfolio()
  const { quotes } = useQuotes()
  const [period, setPeriod] = useState<Period>('1M')
  const [themeOpen, setThemeOpen] = useState(false)
  const [help, setHelp] = useState<string | null>(null)

  const series = useMemo(() => (pf ? portfolioSeries(pf, period) : []), [pf, period])
  const chg = series.length ? series[series.length - 1] - series[0] : 0
  const chgPct = series.length && series[0] ? (chg / series[0]) * 100 : 0

  const movers = useMemo(() => {
    const qs = Object.values(quotes)
    const real = qs.filter(q => !q.simulated)
    return (real.length >= 5 ? real : qs)
      .filter(q => ASSET_BY_SYMBOL[q.symbol])
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, 5)
  }, [quotes])

  const name = me?.user.name?.split(' ')[0]
  const xpMax = me?.level.xpMax

  return (
    <div className="et-page" style={{ paddingBottom: 32 }}>
      <NavBar
        title="Inicio"
        left={
          <button
            onClick={() => setHelp('racha')}
            aria-label={`Racha de ${me?.user.racha ?? 0} días`}
            style={{ height: 44, padding: '0 12px', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: 6, font: '600 13px var(--font)', color: 'var(--amber)', cursor: 'pointer' }}
          >
            <Icon d={ICONS.flame} size={16} />
            {me?.user.racha ?? ''}
          </button>
        }
        right={
          <button onClick={() => setThemeOpen(true)} aria-label="Apariencia" style={{ width: 44, height: 44, border: 'none', background: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={ICONS.moon} size={20} />
          </button>
        }
      />

      <div style={{ padding: '4px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h1 style={h1}>{name ? `Hola, ${name}` : 'Hola'}</h1>
        {me && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', font: '500 13px var(--font)' }}>
              <span>Nivel {me.level.n} · {me.level.nombre}</span>
              <span style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center', gap: 4 }}>
                {me.user.xp.toLocaleString('es-ES')}{xpMax ? ` / ${xpMax.toLocaleString('es-ES')}` : ''} XP <Help k="xp" />
              </span>
            </div>
            <div style={bar(me.level.progress).track}><i style={bar(me.level.progress).fill} /></div>
          </div>
        )}
      </div>

      {/* Valor del portafolio */}
      <div style={{ padding: '32px 16px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)' }}>Valor del portafolio</span>
        {pf ? (
          <>
            <span style={{ font: '600 44px/52px var(--font)', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{fe(pf.total)}</span>
            <span style={{ font: '500 15px var(--font)', color: chg >= 0 ? 'var(--green)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>
              {fes(chg)} · {fpct(chgPct)} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{PERIOD_LABEL[period]}</span>
            </span>
          </>
        ) : (
          <>
            <span className="skeleton" style={{ width: 220, height: 48 }} />
            <span className="skeleton" style={{ width: 180, height: 18 }} />
          </>
        )}
      </div>
      <div style={{ padding: '16px 16px 0' }}>
        {pf ? (
          <AreaChart values={series} up={chg >= 0} label={`Gráfico del valor del portafolio ${PERIOD_LABEL[period]}`} />
        ) : (
          <div className="skeleton" style={{ height: 150 }} />
        )}
        <div style={{ marginTop: 12 }}>
          <Seg label="Periodo" options={PERIOD_KEYS} value={period} onChange={setPeriod} />
        </div>
      </div>

      {/* Siguiente paso */}
      <div style={{ padding: '32px 16px 0' }}>
        <div style={{ ...card, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {me?.nextClase ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ font: '500 12px var(--font)', color: 'var(--green)' }}>Siguiente paso</span>
                <span style={{ font: '600 22px/28px var(--font)' }}>Clase {me.nextClase.numero} · {me.nextClase.titulo}</span>
                <span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)' }}>
                  Módulo {me.nextClase.modulo}{me.nextClase.duracion ? ` · ${me.nextClase.duracion}` : ''}{me.nextClase.xp ? ` · +${me.nextClase.xp} XP` : ''}
                </span>
              </div>
              <Link href={`/clases/${me.nextClase.id}`} style={{ ...btnPrimary, height: 44, textDecoration: 'none' }}>Continuar</Link>
            </>
          ) : me ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ font: '500 12px var(--font)', color: 'var(--green)' }}>Siguiente paso</span>
                <span style={{ font: '600 22px/28px var(--font)' }}>Has terminado las clases disponibles</span>
                <span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)' }}>Sigue practicando con los retos mientras publicamos nuevas.</span>
              </div>
              <Link href="/retos" style={{ ...btnPrimary, height: 44, textDecoration: 'none' }}>Ver retos</Link>
            </>
          ) : (
            <div className="skeleton" style={{ height: 120 }} />
          )}
        </div>
      </div>

      {/* Objetivos de hoy */}
      <div style={{ padding: '32px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h2 style={h2}>Objetivos de hoy</h2>
        <div style={card}>
          {(me?.daily ?? [{ id: 'a', titulo: ' ', hecho: 0, meta: 1 }, { id: 'b', titulo: ' ', hecho: 0, meta: 1 }, { id: 'c', titulo: ' ', hecho: 0, meta: 1 }]).map((d, i, arr) => {
            const pct = (d.hecho / d.meta) * 100
            const done = d.hecho >= d.meta
            return (
              <div key={d.id} style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', font: '400 15px var(--font)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {done ? <Icon d={ICONS.check} size={14} color="var(--green)" stroke={2} /> : <i style={{ width: 8, height: 8, margin: 3, background: 'var(--green)', display: 'block' }} />}
                    {d.titulo}
                  </span>
                  <span style={{ font: '500 13px var(--font)', color: done ? 'var(--green)' : 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{d.hecho}/{d.meta}</span>
                </div>
                <div style={bar(pct).track}><i style={bar(pct).fill} /></div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Alerta anti-sesgo */}
      {me?.alerta && (
        <div style={{ padding: '32px 16px 0' }}>
          <div style={{ border: '1px solid color-mix(in srgb, var(--amber) 50%, transparent)', borderRadius: 6, background: 'color-mix(in srgb, var(--amber) 8%, var(--surface-1))', padding: 16, display: 'flex', gap: 12 }}>
            <Icon d={ICONS.warn} size={20} color="var(--amber)" style={{ marginTop: 1 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ font: '400 15px/20px var(--font)' }}>{me.alerta.texto}</span>
              <button onClick={() => setHelp('aversion')} style={{ ...btnText, alignSelf: 'flex-start', padding: 0, color: 'var(--amber)', fontWeight: 600 }}>Ver por qué</button>
            </div>
          </div>
        </div>
      )}

      {/* Mayores movimientos */}
      <div style={{ padding: '32px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 style={h2}>Mayores movimientos</h2>
          <Link href="/mercado" style={{ ...btnText, textDecoration: 'none' }}>Ver mercado</Link>
        </div>
        <div style={card}>
          {movers.length
            ? movers.map((q, i) => <AssetRow key={q.symbol} asset={ASSET_BY_SYMBOL[q.symbol]} q={q} last={i === movers.length - 1} />)
            : ASSETS.slice(0, 5).map((a, i) => <AssetRow key={a.symbol} asset={a} last={i === 4} />)}
        </div>
      </div>

      {/* Liga */}
      {me?.liga && (
        <div style={{ padding: '32px 16px 0' }}>
          <Link href="/liga" style={{ ...card, padding: 16, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-primary)', textDecoration: 'none' }}>
            <span style={{ width: 40, height: 40, flex: 'none', border: `1px solid ${me.liga.zone === 'down' ? 'var(--red)' : 'var(--green)'}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 17px var(--font)', color: me.liga.zone === 'down' ? 'var(--red)' : 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>
              {me.liga.pos}
            </span>
            <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ font: '600 15px var(--font)' }}>Liga {me.liga.nombre} · puesto {me.liga.pos} de {me.liga.total}</span>
              <span style={{ font: '400 13px var(--font)', color: me.liga.zone === 'up' ? 'var(--green)' : me.liga.zone === 'down' ? 'var(--red)' : 'var(--text-secondary)' }}>
                {me.liga.zone === 'up' ? '▲ Zona de ascenso' : me.liga.zone === 'down' ? '▼ Zona de descenso' : 'Zona segura'} · quedan {fcountdown(me.liga.endsAt)}
              </span>
            </span>
            <Icon d={ICONS.chevron} size={18} color="var(--text-tertiary)" />
          </Link>
        </div>
      )}

      <p style={{ margin: '24px 16px 0', font: '400 12px/16px var(--font)', color: 'var(--text-tertiary)', textAlign: 'center' }}>
        Simulación educativa · No es asesoramiento financiero
      </p>

      <ThemeSheet open={themeOpen} onClose={() => setThemeOpen(false)} />
      <HelpSheet k={help} onClose={() => setHelp(null)} />
    </div>
  )
}
