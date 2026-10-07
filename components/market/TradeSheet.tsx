'use client'
import { useEffect, useState } from 'react'
import type { Asset } from '@/data/assets'
import type { Quote } from '@/hooks/useQuotes'
import { Sheet } from '@/components/ui/Sheet'
import { Seg } from '@/components/ui/Seg'
import { Help } from '@/components/ui/Help'
import { Icon, ICONS } from '@/components/ui/Icon'
import { btnPrimary, btnDanger, btnDisabled } from '@/components/ui/styles'
import { fe, fprice, fshares, f2 } from '@/lib/format'

export interface TradeResult {
  type: 'buy' | 'sell'
  symbol: string
  shares: number
  totalEur: number
  pnlEur?: number | null
  cash: number
  badges?: { nombre: string; emoji: string }[]
}

type Side = 'Comprar' | 'Vender'
const QUICK = [50, 100, 500, 1000]
const PCTS = [25, 50, 75, 100]

const SYM: Record<string, string> = { USD: '$', GBP: '£', JPY: '¥', CHF: 'CHF', CAD: 'C$', AUD: 'A$', HKD: 'HK$' }

export function TradeSheet({
  open,
  onClose,
  asset,
  q,
  cash,
  position,
  initialSide = 'Comprar',
  onDone,
}: {
  open: boolean
  onClose: () => void
  asset: Asset
  q: Quote | undefined
  cash: number
  position: { shares: number; valueEur: number } | null
  initialSide?: Side
  onDone: (r: TradeResult) => void
}) {
  const [side, setSide] = useState<Side>(initialSide)
  const [amount, setAmount] = useState('100')
  const [pct, setPct] = useState(50)
  const [step, setStep] = useState<0 | 1>(0)
  const [sending, setSending] = useState(false)
  const [serverErr, setServerErr] = useState('')

  useEffect(() => {
    if (open) {
      setSide(initialSide)
      setStep(0)
      setAmount('100')
      setPct(50)
      setServerErr('')
    }
  }, [open, initialSide])

  const isBuy = side === 'Comprar'
  const amt = parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0
  const priceEur = q?.priceEur ?? 0
  const buyShares = priceEur > 0 ? amt / priceEur : 0
  const sellShares = position ? (position.shares * pct) / 100 : 0
  const receive = position ? (position.valueEur * pct) / 100 : 0
  const buyErr = amt > cash ? 'No tienes suficiente saldo virtual.' : amt > 0 && amt < 1 ? 'El importe mínimo es 1 €.' : ''
  const canReview = !!q && (isBuy ? amt >= 1 && !buyErr : !!position && pct > 0)
  const forex = asset.category === 'forex'
  const fxLine = asset.currency !== 'EUR' && q && q.price > 0 ? `1 € = ${f2(q.price / q.priceEur)} ${SYM[asset.currency] ?? asset.currency}` : null

  const rows: [string, string][] = isBuy
    ? [
        ['Activo', `${asset.name} · ${asset.symbol}`],
        ['Importe', fe(amt)],
        ['Precio aprox.', q ? fprice(q.price, asset.currency, forex) : '—'],
        ...(fxLine ? [['Tipo de cambio', fxLine] as [string, string]] : []),
        ['Participaciones', '≈ ' + fshares(buyShares)],
        ['Comisión', '0,00 €'],
        ['Saldo después', fe(cash - amt)],
      ]
    : [
        ['Activo', `${asset.name} · ${asset.symbol}`],
        ['Participaciones', `${fshares(sellShares)} (${pct} %)`],
        ['Precio aprox.', q ? fprice(q.price, asset.currency, forex) : '—'],
        ['Recibirás', '≈ ' + fe(receive)],
        ['Saldo después', '≈ ' + fe(cash + receive)],
      ]

  async function confirm() {
    setSending(true)
    setServerErr('')
    try {
      const res = await fetch('/api/trade/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isBuy ? { type: 'buy', symbol: asset.symbol, amountEur: amt } : { type: 'sell', symbol: asset.symbol, percent: pct }),
      })
      const data = await res.json()
      if (!res.ok) {
        setServerErr(data.error ?? 'No se pudo ejecutar la operación')
        return
      }
      onDone(data as TradeResult)
    } catch {
      setServerErr('Sin conexión. Inténtalo de nuevo.')
    } finally {
      setSending(false)
    }
  }

  const pickBtn = (on: boolean): React.CSSProperties => ({
    height: 36, borderRadius: 4, cursor: 'pointer', font: '500 15px var(--font)', fontVariantNumeric: 'tabular-nums',
    border: `1px solid ${on ? 'var(--text-primary)' : 'var(--border)'}`, background: on ? 'var(--surface-2)' : 'transparent', color: 'var(--text-primary)',
  })
  const row = (l: string, v: string, lastRow = false, help?: string) => (
    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: lastRow ? 'none' : '1px solid var(--border)', font: '400 15px var(--font)' }}>
      <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>{l}{help && <Help k={help} />}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500, textAlign: 'right' }}>{v}</span>
    </div>
  )

  return (
    <Sheet open={open} onClose={onClose} label={isBuy ? 'Comprar' : 'Vender'}>
      {step === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <span style={{ font: '600 22px/28px var(--font)' }}>{asset.name} · {asset.symbol}</span>
            <span style={{ font: '500 15px var(--font)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{q ? fprice(q.price, asset.currency, forex) : '—'}</span>
          </div>
          <Seg label="Tipo de operación" options={['Comprar', 'Vender'] as const} value={side} onChange={s => { setSide(s); setServerErr('') }} height={36} />

          {isBuy ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ font: '500 13px var(--font)' }}>Importe</span>
                <span style={{ position: 'relative', display: 'block' }}>
                  <input
                    inputMode="decimal"
                    value={amount}
                    onChange={e => setAmount(e.target.value.replace(/[^0-9,]/g, ''))}
                    aria-invalid={!!buyErr}
                    style={{
                      width: '100%', height: 56, padding: '0 40px 0 12px', border: `1px solid ${buyErr ? 'var(--red)' : 'var(--border)'}`, borderRadius: 4,
                      background: 'var(--surface-2)', color: 'var(--text-primary)', font: '600 28px var(--font)', fontVariantNumeric: 'tabular-nums', outline: 'none',
                    }}
                  />
                  <span style={{ position: 'absolute', right: 14, top: 14, font: '600 22px var(--font)', color: 'var(--text-secondary)' }}>€</span>
                </span>
                {buyErr && <span style={{ font: '400 13px var(--font)', color: 'var(--red)' }}>{buyErr}</span>}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {QUICK.map(v => <button key={v} onClick={() => setAmount(String(v))} style={pickBtn(amt === v)}>{v} €</button>)}
              </div>
              <div style={{ borderTop: '1px solid var(--border)' }}>
                {row('Participaciones estimadas', '≈ ' + fshares(buyShares), false, 'part')}
                {row('Saldo disponible', fe(cash), true)}
              </div>
            </div>
          ) : !position ? (
            <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface-2)', font: '400 15px/22px var(--font)', color: 'var(--text-secondary)' }}>
              No tienes {asset.name} en tu portafolio. Para vender, primero necesitas comprar.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ font: '500 13px var(--font)' }}>Parte de tu posición</span>
                <span style={{ font: '600 28px var(--font)', fontVariantNumeric: 'tabular-nums' }}>{pct} %</span>
              </div>
              <input
                type="range" min={1} max={100} value={pct} onChange={e => setPct(+e.target.value)} aria-label="Porcentaje a vender"
                style={{ width: '100%', accentColor: 'var(--red)', height: 24, margin: 0 }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {PCTS.map(p => <button key={p} onClick={() => setPct(p)} style={pickBtn(pct === p)}>{p} %</button>)}
              </div>
              <div style={{ borderTop: '1px solid var(--border)' }}>
                {row('Vendes', `${fshares(sellShares)} de ${fshares(position.shares)}`)}
                {row('Recibirás aprox.', fe(receive), true)}
              </div>
            </div>
          )}

          {serverErr && <span role="alert" style={{ font: '400 13px/18px var(--font)', color: 'var(--red)' }}>{serverErr}</span>}
          <button
            onClick={() => canReview && setStep(1)}
            disabled={!canReview}
            style={canReview ? (isBuy ? btnPrimary : btnDanger) : btnDisabled}
          >
            {isBuy ? 'Revisar compra' : 'Revisar venta'}
          </button>
          <span style={{ font: '400 12px var(--font)', color: 'var(--text-tertiary)', textAlign: 'center' }}>Simulación educativa · No es asesoramiento financiero</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: -8 }}>
            <button onClick={() => setStep(0)} aria-label="Volver" style={{ width: 36, height: 36, border: 'none', background: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon d={ICONS.back} size={20} />
            </button>
            <span style={{ font: '600 22px/28px var(--font)' }}>{isBuy ? 'Confirma tu compra' : 'Confirma tu venta'}</span>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '0 16px' }}>
            {rows.map(([l, v], i) => row(l, v, i === rows.length - 1))}
          </div>
          <span style={{ font: '400 13px/18px var(--font)', color: 'var(--text-secondary)' }}>
            El precio final puede variar ligeramente al ejecutarse. Es dinero virtual.
          </span>
          {serverErr && <span role="alert" style={{ font: '400 13px/18px var(--font)', color: 'var(--red)' }}>{serverErr}</span>}
          <button onClick={confirm} disabled={sending} style={{ ...(isBuy ? btnPrimary : btnDanger), opacity: sending ? 0.6 : 1 }}>
            {sending ? 'Ejecutando…' : 'Confirmar'}
          </button>
        </div>
      )}
    </Sheet>
  )
}
