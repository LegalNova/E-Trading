'use client'
// Gráfico profesional del Mercado, sobre Lightweight Charts™ de TradingView (licencia Apache 2.0).
// Velas reales del proveedor; indicadores calculados aquí; dibujos guardados en el navegador por activo.
import { useQuery } from '@tanstack/react-query'
import {
  AreaSeries, BarSeries, CandlestickSeries, ColorType, CrosshairMode, HistogramSeries, LineSeries, LineStyle, createChart,
  type IChartApi, type ISeriesApi, type MouseEventParams, type SeriesType, type UTCTimestamp,
} from 'lightweight-charts'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../api'
import { useLang } from '../hooks'
import { Icon } from '../ui/icons'
import { bollinger, ema, heikinAshi, macd, rsi, sma } from './indicators'

export type ChartInterval = '1m' | '5m' | '15m' | '1h' | '1d' | '1w' | '1M'
type ChartKind = 'candles' | 'heikin' | 'bars' | 'line' | 'area'
type IndicatorId = 'vol' | 'sma20' | 'sma50' | 'sma200' | 'ema21' | 'bb' | 'rsi' | 'macd'
type Tool = 'cursor' | 'trend' | 'hline' | 'vline' | 'rect' | 'fib' | 'measure'
interface Anchor { t: number; p: number }
interface Drawing { id: string; kind: Exclude<Tool, 'cursor'>; a: Anchor; b?: Anchor }

const INTERVALS: ChartInterval[] = ['1m', '5m', '15m', '1h', '1d', '1w', '1M']
const KINDS: ChartKind[] = ['candles', 'heikin', 'bars', 'line', 'area']
const INDICATORS: IndicatorId[] = ['vol', 'sma20', 'sma50', 'sma200', 'ema21', 'bb', 'rsi', 'macd']
const TOOLS: Tool[] = ['cursor', 'trend', 'hline', 'vline', 'rect', 'fib', 'measure']
const FIB = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]
const IND_COLORS: Record<string, string> = { sma20: '#F5A623', sma50: '#8E59FF', sma200: '#E5484D', ema21: '#12A594', bb: '#5B8DEF' }

const store = {
  get<T>(k: string, d: T): T {
    try {
      const v = localStorage.getItem(k)
      return v ? (JSON.parse(v) as T) : d
    } catch {
      return d
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v))
    } catch {
      // sin almacenamiento: solo dura esta visita
    }
  },
}

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'
}

/** Color con transparencia en rgba(): el lienzo del gráfico no entiende color-mix() */
function alpha(color: string, a: number) {
  const c = document.createElement('canvas').getContext('2d')
  if (!c) return color
  c.fillStyle = color
  const hex = c.fillStyle
  if (!hex.startsWith('#')) return color
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

/** Cambia cuando cambia el tema (claro/oscuro) para repintar el gráfico */
function useThemeKey() {
  const [k, setK] = useState(0)
  useEffect(() => {
    const bump = () => setK(n => n + 1)
    const mo = new MutationObserver(bump)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const mq = matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', bump)
    return () => {
      mo.disconnect()
      mq.removeEventListener('change', bump)
    }
  }, [])
  return k
}

const ts = (t: number) => t as UTCTimestamp

export function ProChart({ symbol, decimals, up }: { symbol: string; decimals: number; up: boolean }) {
  const t = useTranslations('chart')
  const locale = useLang()
  const themeKey = useThemeKey()
  const [interval, setInterval_] = useState<ChartInterval>(() => store.get('et-chart-interval', '1d'))
  const [kind, setKind] = useState<ChartKind>(() => store.get('et-chart-kind', 'candles'))
  const [inds, setInds] = useState<IndicatorId[]>(() => store.get('et-chart-inds', ['vol']))
  const [tool, setTool] = useState<Tool>('cursor')
  const [drawings, setDrawings] = useState<Drawing[]>(() => store.get(`et-draw:${symbol}`, []))
  const [draft, setDraft] = useState<Drawing | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [full, setFull] = useState(false)
  const [menu, setMenu] = useState<'ind' | 'kind' | null>(null)
  const [legend, setLegend] = useState<{ o: number; h: number; l: number; c: number; v: number; chg: number } | null>(null)
  const [, setFrame] = useState(0)

  const box = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const mainRef = useRef<ISeriesApi<SeriesType> | null>(null)

  const { data: candles, isLoading, isError } = useQuery({
    queryKey: ['candles', symbol, interval],
    queryFn: () => api.candles(symbol, interval),
    refetchInterval: ['1m', '5m', '15m'].includes(interval) ? 30_000 : 120_000,
    staleTime: 20_000,
  })
  const shown = useMemo(() => (candles && kind === 'heikin' ? heikinAshi(candles) : (candles ?? [])), [candles, kind])

  useEffect(() => store.set('et-chart-interval', interval), [interval])
  useEffect(() => store.set('et-chart-kind', kind), [kind])
  useEffect(() => store.set('et-chart-inds', inds), [inds])
  useEffect(() => store.set(`et-draw:${symbol}`, drawings), [drawings, symbol])

  const fmtP = useCallback((v: number) => new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v), [locale, decimals])
  const redraw = useCallback(() => setFrame(n => (n + 1) % 1e6), [])

  // ── Crear el gráfico y sus series ──
  useEffect(() => {
    const el = box.current
    if (!el || !shown.length) return
    const upC = cssVar('--up'), downC = cssVar('--down'), ink2 = cssVar('--ink-2'), line = cssVar('--line'), brand = cssVar('--brand')
    const intraday = ['1m', '5m', '15m', '1h'].includes(interval)
    const chart = createChart(el, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: ink2, fontFamily: 'var(--font-sans), system-ui', fontSize: 11, attributionLogo: true },
      grid: { vertLines: { color: line, style: LineStyle.Dotted }, horzLines: { color: line, style: LineStyle.Dotted } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: intraday, secondsVisible: false, rightOffset: 6 },
      localization: { locale, priceFormatter: (p: number) => fmtP(p) },
    })
    chartRef.current = chart
    const data = shown.map(c => ({ time: ts(c.t), open: c.o, high: c.h, low: c.l, close: c.c }))
    let main: ISeriesApi<SeriesType>
    if (kind === 'line') {
      main = chart.addSeries(LineSeries, { color: up ? upC : downC, lineWidth: 2 })
      main.setData(shown.map(c => ({ time: ts(c.t), value: c.c })))
    } else if (kind === 'area') {
      const col = up ? upC : downC
      main = chart.addSeries(AreaSeries, { lineColor: col, topColor: alpha(col, 0.28), bottomColor: 'transparent', lineWidth: 2 })
      main.setData(shown.map(c => ({ time: ts(c.t), value: c.c })))
    } else if (kind === 'bars') {
      main = chart.addSeries(BarSeries, { upColor: upC, downColor: downC })
      main.setData(data)
    } else {
      main = chart.addSeries(CandlestickSeries, { upColor: upC, downColor: downC, wickUpColor: upC, wickDownColor: downC, borderVisible: false })
      main.setData(data)
    }
    mainRef.current = main

    if (inds.includes('vol')) {
      const vol = chart.addSeries(HistogramSeries, { priceScaleId: 'vol', priceFormat: { type: 'volume' }, lastValueVisible: false, priceLineVisible: false })
      vol.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } })
      const volUp = alpha(upC, 0.45), volDown = alpha(downC, 0.45)
      vol.setData(candles!.map(c => ({ time: ts(c.t), value: c.v, color: c.c >= c.o ? volUp : volDown })))
    }
    const lineSeries = (pts: { time: number; value: number }[], color: string, pane = 0, width: 1 | 2 = 1, style = LineStyle.Solid) => {
      const s = chart.addSeries(LineSeries, { color, lineWidth: width, lineStyle: style, lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false }, pane)
      s.setData(pts.map(p => ({ time: ts(p.time), value: p.value })))
      return s
    }
    const src = candles!
    if (inds.includes('sma20')) lineSeries(sma(src, 20), IND_COLORS.sma20)
    if (inds.includes('sma50')) lineSeries(sma(src, 50), IND_COLORS.sma50)
    if (inds.includes('sma200')) lineSeries(sma(src, 200), IND_COLORS.sma200)
    if (inds.includes('ema21')) lineSeries(ema(src, 21), IND_COLORS.ema21)
    if (inds.includes('bb')) {
      const b = bollinger(src)
      lineSeries(b.up, IND_COLORS.bb)
      lineSeries(b.mid, IND_COLORS.bb, 0, 1, LineStyle.Dashed)
      lineSeries(b.low, IND_COLORS.bb)
    }
    let pane = 1
    if (inds.includes('rsi')) {
      const r = lineSeries(rsi(src), brand, pane, 2)
      r.createPriceLine({ price: 70, color: downC, lineStyle: LineStyle.Dashed, lineWidth: 1, axisLabelVisible: false, title: '70' })
      r.createPriceLine({ price: 30, color: upC, lineStyle: LineStyle.Dashed, lineWidth: 1, axisLabelVisible: false, title: '30' })
      pane++
    }
    if (inds.includes('macd')) {
      const m = macd(src)
      const h = chart.addSeries(HistogramSeries, { lastValueVisible: false, priceLineVisible: false }, pane)
      h.setData(m.hist.map(p => ({ time: ts(p.time), value: p.value, color: p.value >= 0 ? upC : downC })))
      lineSeries(m.line, brand, pane, 2)
      lineSeries(m.signal, IND_COLORS.sma20, pane)
      pane++
    }
    const panes = chart.panes()
    if (panes.length > 1) {
      const total = el.clientHeight
      panes.slice(1).forEach(p => p.setHeight(Math.round(total * 0.2)))
    }

    // Últimos ~120 periodos a la vista
    const n = shown.length
    chart.timeScale().setVisibleLogicalRange({ from: Math.max(0, n - (intraday ? 160 : 120)), to: n + 5 })

    const last = shown[n - 1]
    const prevC = shown[n - 2]?.c ?? last.o
    setLegend({ o: last.o, h: last.h, l: last.l, c: last.c, v: last.v, chg: ((last.c - prevC) / prevC) * 100 })
    const onMove = (p: MouseEventParams) => {
      const d = p.seriesData.get(main) as { open?: number; high?: number; low?: number; close?: number; value?: number } | undefined
      if (!d || p.time === undefined) {
        setLegend({ o: last.o, h: last.h, l: last.l, c: last.c, v: last.v, chg: ((last.c - prevC) / prevC) * 100 })
      } else {
        const i = shown.findIndex(c => c.t === (p.time as number))
        const c = shown[i]
        const pc = shown[i - 1]?.c ?? c?.o
        if (c) setLegend({ o: c.o, h: c.h, l: c.l, c: c.c, v: c.v, chg: pc ? ((c.c - pc) / pc) * 100 : 0 })
      }
      redraw()
    }
    chart.subscribeCrosshairMove(onMove)
    chart.timeScale().subscribeVisibleLogicalRangeChange(redraw)
    const ro = new ResizeObserver(redraw)
    ro.observe(el)
    redraw()
    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      mainRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, kind, inds, themeKey, interval, full])

  // ── Coordenadas de los dibujos (por tiempo y precio, valen en cualquier intervalo) ──
  const xOf = useCallback(
    (time: number): number | null => {
      const chart = chartRef.current
      if (!chart || !shown.length) return null
      const arr = shown
      let lo = 0, hi = arr.length - 1
      if (time <= arr[0].t) return chart.timeScale().logicalToCoordinate(0 as never)
      const step = arr.length > 1 ? (arr[arr.length - 1].t - arr[0].t) / (arr.length - 1) : 60
      if (time >= arr[hi].t) return chart.timeScale().logicalToCoordinate((hi + (time - arr[hi].t) / step) as never)
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1
        if (arr[mid].t <= time) lo = mid
        else hi = mid
      }
      const frac = (time - arr[lo].t) / (arr[hi].t - arr[lo].t || 1)
      return chart.timeScale().logicalToCoordinate((lo + frac) as never)
    },
    [shown],
  )
  const yOf = useCallback((p: number) => mainRef.current?.priceToCoordinate(p) ?? null, [])

  const anchorAt = useCallback(
    (x: number, y: number): Anchor | null => {
      const chart = chartRef.current
      const main = mainRef.current
      if (!chart || !main || !shown.length) return null
      const logical = chart.timeScale().coordinateToLogical(x)
      const price = main.coordinateToPrice(y)
      if (logical === null || price === null) return null
      const arr = shown
      const i = Math.floor(logical)
      const step = arr.length > 1 ? (arr[arr.length - 1].t - arr[0].t) / (arr.length - 1) : 60
      let time: number
      if (i < 0) time = arr[0].t
      else if (i >= arr.length - 1) time = arr[arr.length - 1].t + (logical - (arr.length - 1)) * step
      else time = arr[i].t + (logical - i) * (arr[i + 1].t - arr[i].t)
      return { t: Math.round(time), p: price }
    },
    [shown],
  )

  const finish = (d: Drawing) => {
    setDrawings(ds => [...ds, d])
    setDraft(null)
    setTool('cursor')
  }

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (tool === 'cursor') return
    const r = e.currentTarget.getBoundingClientRect()
    const a = anchorAt(e.clientX - r.left, e.clientY - r.top)
    if (!a) return
    if (tool === 'hline' || tool === 'vline') return finish({ id: crypto.randomUUID(), kind: tool, a })
    if (!draft) setDraft({ id: crypto.randomUUID(), kind: tool, a, b: a })
    else finish({ ...draft, b: a })
  }
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draft) return
    const r = e.currentTarget.getBoundingClientRect()
    const b = anchorAt(e.clientX - r.left, e.clientY - r.top)
    if (b) setDraft({ ...draft, b })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDraft(null)
        setTool('cursor')
        setFull(false)
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected && !(e.target instanceof HTMLInputElement)) {
        setDrawings(ds => ds.filter(d => d.id !== selected))
        setSelected(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  // La capa de dibujo lee el gráfico imperativo (Lightweight Charts) al pintar; `frame` la vuelve a pintar
  // cada vez que el gráfico se mueve, cambia de tamaño o de escala.
  /* eslint-disable react-hooks/refs */
  const chart = chartRef.current
  const paneH = chart ? chart.paneSize(0).height : 0
  const plotW = chart && box.current ? box.current.clientWidth - chart.priceScale('right').width() : 0
  const brand = typeof window !== 'undefined' ? cssVar('--brand') : '#0071E3'
  /* eslint-enable react-hooks/refs */

  function renderDrawing(d: Drawing, isDraft = false) {
    const x1 = d.kind === 'hline' ? 0 : xOf(d.a.t)
    const y1 = yOf(d.a.p)
    const x2 = d.b ? xOf(d.b.t) : null
    const y2 = d.b ? yOf(d.b.p) : null
    const sel = selected === d.id
    const stroke = sel ? cssVar('--ink') : brand
    const common = { stroke, strokeWidth: sel ? 2.5 : 1.6, fill: 'none', style: { pointerEvents: (isDraft || tool !== 'cursor' ? 'none' : 'stroke') as React.CSSProperties['pointerEvents'], cursor: 'pointer' }, onPointerDown: (e: React.PointerEvent) => (e.stopPropagation(), setSelected(d.id)) }
    const label = (x: number, y: number, txt: string, anchor: 'start' | 'end' = 'start') => (
      <text x={x} y={y} fontSize={10} fill={cssVar('--ink-2')} textAnchor={anchor} style={{ pointerEvents: 'none' }}>
        {txt}
      </text>
    )
    if (d.kind === 'hline' && y1 !== null)
      return (
        <g key={d.id}>
          <line x1={0} x2={plotW} y1={y1} y2={y1} {...common} strokeDasharray="6 4" />
          <line x1={0} x2={plotW} y1={y1} y2={y1} stroke="transparent" strokeWidth={12} style={common.style} onPointerDown={common.onPointerDown} />
          {label(plotW - 4, y1 - 4, fmtP(d.a.p), 'end')}
        </g>
      )
    if (d.kind === 'vline' && x1 !== null)
      return (
        <g key={d.id}>
          <line x1={x1} x2={x1} y1={0} y2={paneH} {...common} strokeDasharray="6 4" />
          <line x1={x1} x2={x1} y1={0} y2={paneH} stroke="transparent" strokeWidth={12} style={common.style} onPointerDown={common.onPointerDown} />
        </g>
      )
    if (x1 === null || y1 === null || x2 === null || y2 === null) return null
    if (d.kind === 'trend')
      return (
        <g key={d.id}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} {...common} />
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={12} style={common.style} onPointerDown={common.onPointerDown} />
          {(sel || isDraft) && [<circle key="a" cx={x1} cy={y1} r={4} fill={stroke} />, <circle key="b" cx={x2} cy={y2} r={4} fill={stroke} />]}
        </g>
      )
    if (d.kind === 'rect')
      return (
        <g key={d.id}>
          <rect x={Math.min(x1, x2)} y={Math.min(y1, y2)} width={Math.abs(x2 - x1)} height={Math.abs(y2 - y1)} {...common} fill={`color-mix(in srgb, ${brand} 12%, transparent)`} style={{ ...common.style, pointerEvents: isDraft || tool !== 'cursor' ? 'none' : 'all' }} />
        </g>
      )
    if (d.kind === 'fib') {
      const left = Math.min(x1, x2), right = Math.max(x1, x2)
      return (
        <g key={d.id}>
          {FIB.map(f => {
            const price = d.a.p + (d.b!.p - d.a.p) * (1 - f)
            const y = yOf(price)
            if (y === null) return null
            return (
              <g key={f}>
                <line x1={left} x2={right} y1={y} y2={y} {...common} strokeWidth={f === 0.5 || f === 0.618 ? 1.6 : 1} />
                {label(right + 4, y + 3, `${f} · ${fmtP(price)}`)}
              </g>
            )
          })}
          <rect x={left} y={Math.min(y1, y2)} width={right - left} height={Math.abs(y2 - y1)} fill="transparent" style={{ ...common.style, pointerEvents: isDraft || tool !== 'cursor' ? 'none' : 'all' }} onPointerDown={common.onPointerDown} />
        </g>
      )
    }
    if (d.kind === 'measure') {
      const dp = d.b!.p - d.a.p
      const pctV = (dp / d.a.p) * 100
      const col = dp >= 0 ? cssVar('--up') : cssVar('--down')
      return (
        <g key={d.id}>
          <rect x={Math.min(x1, x2)} y={Math.min(y1, y2)} width={Math.abs(x2 - x1)} height={Math.abs(y2 - y1)} fill={`color-mix(in srgb, ${col} 16%, transparent)`} stroke={col} strokeWidth={1} style={{ ...common.style, pointerEvents: isDraft || tool !== 'cursor' ? 'none' : 'all' }} onPointerDown={common.onPointerDown} />
          <text x={(x1 + x2) / 2} y={Math.min(y1, y2) - 6} fontSize={11} fontWeight={700} fill={col} textAnchor="middle" style={{ pointerEvents: 'none' }}>
            {`${dp >= 0 ? '+' : ''}${fmtP(dp)} (${pctV >= 0 ? '+' : ''}${pctV.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %)`}
          </text>
        </g>
      )
    }
    return null
  }

  const toggleInd = (id: IndicatorId) => setInds(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]))
  const upLegend = (legend?.chg ?? 0) >= 0

  return (
    <div className={full ? 'fixed inset-0 z-50 flex flex-col p-2 md:p-4' : 'card flex flex-col gap-2 px-2 pt-2 pb-2'} style={full ? { background: 'var(--bg)' } : undefined}>
      {/* Barra superior: intervalos, tipo, indicadores, pantalla completa */}
      <div className="no-scrollbar flex items-center gap-1 overflow-x-auto">
        <div className="seg flex-none" role="group" aria-label={t('interval')}>
          {INTERVALS.map(i => (
            <button key={i} aria-pressed={interval === i} onClick={() => setInterval_(i)} className="px-2.5">
              {t(`intervals.${i}`)}
            </button>
          ))}
        </div>
        <div className="relative flex-none">
          <button className="chip h-8" style={{ background: 'var(--fill)' }} onClick={() => setMenu(menu === 'kind' ? null : 'kind')} aria-expanded={menu === 'kind'}>
            <Icon name="chart" size={16} /> {t(`kinds.${kind}`)}
          </button>
          {menu === 'kind' && (
            <div className="card absolute left-0 z-20 mt-1 flex w-44 flex-col p-1 shadow-float">
              {KINDS.map(k => (
                <button key={k} className="rounded-lg px-3 py-2 text-left text-sm font-semibold" style={kind === k ? { background: 'var(--fill)' } : undefined} onClick={() => (setKind(k), setMenu(null))}>
                  {t(`kinds.${k}`)}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative flex-none">
          <button className="chip h-8" style={{ background: 'var(--fill)' }} onClick={() => setMenu(menu === 'ind' ? null : 'ind')} aria-expanded={menu === 'ind'}>
            ƒx {t('indicators')}
            {inds.length > 0 && <span className="t-cap">· {inds.length}</span>}
          </button>
          {menu === 'ind' && (
            <div className="card absolute left-0 z-20 mt-1 flex w-60 flex-col p-1 shadow-float">
              {INDICATORS.map(id => (
                <button key={id} className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold" onClick={() => toggleInd(id)} aria-pressed={inds.includes(id)}>
                  <span className={`check ${inds.includes(id) ? 'on' : ''}`} style={{ width: 18, height: 18, borderRadius: 5 }}>
                    {inds.includes(id) && <Icon name="check" size={12} strokeWidth={2.6} />}
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: IND_COLORS[id] ?? 'var(--ink-3)' }} />
                  {t(`ind.${id}`)}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="flex-1" />
        <button className="icon-btn h-8 w-8 flex-none" onClick={() => setFull(!full)} aria-label={full ? t('exitFull') : t('full')}>
          <Icon name={full ? 'close' : 'expand'} size={18} />
        </button>
      </div>

      {/* Leyenda OHLC */}
      {legend && (
        <div className="t-cap flex flex-wrap gap-x-3 px-1 tabular-nums">
          <span>O {fmtP(legend.o)}</span>
          <span>H {fmtP(legend.h)}</span>
          <span>L {fmtP(legend.l)}</span>
          <span>C {fmtP(legend.c)}</span>
          <span className={upLegend ? 'up font-bold' : 'down font-bold'}>
            {upLegend ? '+' : ''}
            {legend.chg >= 0 ? '+' : ''}{legend.chg.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %
          </span>
          {legend.v > 0 && <span>Vol {new Intl.NumberFormat(locale, { notation: 'compact' }).format(legend.v)}</span>}
        </div>
      )}

      <div className="flex min-h-0 flex-1 gap-1">
        {/* Herramientas de dibujo */}
        <div className="flex flex-none flex-col gap-1" role="toolbar" aria-label={t('tools')}>
          {TOOLS.map(tl => (
            <button key={tl} title={t(`tool.${tl}`)} aria-label={t(`tool.${tl}`)} aria-pressed={tool === tl} onClick={() => (setTool(tl), setDraft(null), setSelected(null))} className="flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-bold" style={tool === tl ? { background: 'var(--brand)', color: 'var(--on-brand)' } : { background: 'var(--fill)', color: 'var(--ink)' }}>
              {TOOL_GLYPH[tl]}
            </button>
          ))}
          <button title={t('deleteSel')} aria-label={t('deleteSel')} disabled={!selected} onClick={() => (setDrawings(ds => ds.filter(d => d.id !== selected)), setSelected(null))} className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--fill)', opacity: selected ? 1 : 0.4 }}>
            <Icon name="trash" size={15} />
          </button>
          <button title={t('clearAll')} aria-label={t('clearAll')} disabled={!drawings.length} onClick={() => (setDrawings([]), setSelected(null))} className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-extrabold" style={{ background: 'var(--fill)', opacity: drawings.length ? 1 : 0.4 }}>
            ✕
          </button>
        </div>

        {/* Gráfico + capa de dibujo */}
        <div className="relative min-w-0 flex-1" style={{ height: full ? undefined : inds.includes('rsi') || inds.includes('macd') ? 460 : 340 }}>
          <div ref={box} className="absolute inset-0" />
          {isLoading && <div className="skel absolute inset-0" />}
          {isError && <p className="t-foot absolute inset-0 flex items-center justify-center">{t('error')}</p>}
          {!isLoading && candles && candles.length === 0 && <p className="t-foot absolute inset-0 flex items-center justify-center">{t('noData')}</p>}
          {/* eslint-disable react-hooks/refs */}
          {chart && paneH > 0 && (
            <svg className="absolute top-0 left-0 z-[3]" width={Math.max(0, plotW)} height={paneH} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onClick={() => tool === 'cursor' && setSelected(null)} style={{ pointerEvents: tool === 'cursor' ? 'none' : 'all', cursor: tool === 'cursor' ? 'default' : 'crosshair', touchAction: tool === 'cursor' ? 'auto' : 'none' }}>
              {drawings.map(d => renderDrawing(d))}
              {draft && renderDrawing(draft, true)}
            </svg>
          )}
          {/* eslint-enable react-hooks/refs */}
        </div>
      </div>
      {tool !== 'cursor' && <p className="t-cap m-0 px-1">{t(tool === 'hline' || tool === 'vline' ? 'hintOne' : 'hintTwo')}</p>}
    </div>
  )
}

const TOOL_GLYPH: Record<Tool, React.ReactNode> = {
  cursor: '↖',
  trend: '╱',
  hline: '─',
  vline: '│',
  rect: '▭',
  fib: 'F',
  measure: '⇕',
}

