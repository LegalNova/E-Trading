'use client'
import { useState } from 'react'
import { Sheet } from './Sheet'
import { btnSecondary } from './styles'

// Explicaciones de una frase para cada término financiero
export const HELP: Record<string, [string, string]> = {
  apertura: ['Apertura', 'El precio al que empezó a cotizar hoy.'],
  max: ['Máximo', 'El precio más alto que ha alcanzado hoy.'],
  min: ['Mínimo', 'El precio más bajo que ha alcanzado hoy.'],
  cierre: ['Cierre anterior', 'El precio al que terminó la sesión anterior. La variación de hoy se calcula desde aquí.'],
  vol: ['Volumen', 'Cuántas unidades se han comprado y vendido hoy.'],
  cap: ['Capitalización bursátil', 'Lo que vale la empresa entera en bolsa: precio por número de acciones.'],
  per: ['PER', 'Cuántos años de beneficios actuales pagas al comprar la acción. Más alto suele significar más expectativas.'],
  div: ['Dividendo', 'La parte de los beneficios que la empresa reparte cada año, en % del precio.'],
  sector: ['Sector', 'La actividad principal de la empresa. Repartir entre sectores reduce el riesgo.'],
  part: ['Participaciones', 'Cuántas unidades del activo tienes. Puedes tener fracciones, como 0,47.'],
  medio: ['Precio medio', 'Lo que pagaste de media por cada participación, sumando todas tus compras.'],
  efectivo: ['Efectivo disponible', 'Dinero virtual que aún no has invertido.'],
  rent: ['Rentabilidad total', 'Cuánto has ganado o perdido desde que empezaste con 10.000 €, en %.'],
  etf: ['ETF', 'Un fondo que cotiza como una acción y reúne muchas empresas a la vez.'],
  xp: ['XP', 'Puntos de experiencia. Los ganas con clases y retos, y suben tu nivel.'],
  fx: ['Tipo de cambio', 'Este activo cotiza en otra moneda. Convertimos a euros con el tipo de cambio actual.'],
  simulado: ['Precio simulado', 'Para este activo no hay datos en tiempo real gratuitos. Usamos un precio simulado estable, igual para todos.'],
  aversion: ['Aversión a la pérdida', 'Perder duele unas dos veces más que ganar alegra. Eso empuja a vender en pánico tras una bajada o a no vender nunca lo que pierde. Antes de vender, pregúntate: ¿lo compraría hoy a este precio?'],
  racha: ['Racha', 'Días seguidos en los que has entrado en E-Trading. Vuelve cada día para mantenerla.'],
}

export function HelpSheet({ k, onClose }: { k: string | null; onClose: () => void }) {
  const h = k ? HELP[k] : null
  return (
    <Sheet open={!!h} onClose={onClose} label={h?.[0]}>
      {h && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 8 }}>
          <span style={{ font: '600 22px/28px var(--font)' }}>{h[0]}</span>
          <p style={{ margin: 0, font: '400 17px/24px var(--font)', color: 'var(--text-secondary)' }}>{h[1]}</p>
          <button onClick={onClose} style={{ ...btnSecondary, marginTop: 8 }}>Entendido</button>
        </div>
      )}
    </Sheet>
  )
}

/** Botón "?" que abre la explicación del término */
export function Help({ k }: { k: string }) {
  const [open, setOpen] = useState(false)
  const label = HELP[k]?.[0] ?? k
  return (
    <>
      <button
        onClick={e => { e.stopPropagation(); setOpen(true) }}
        aria-label={`Qué significa ${label}`}
        style={{
          width: 18, height: 18, padding: 0, flex: 'none', border: '1px solid var(--border)', borderRadius: 2,
          background: 'none', color: 'var(--text-secondary)', font: '600 11px var(--font)', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        ?
      </button>
      <HelpSheet k={open ? k : null} onClose={() => setOpen(false)} />
    </>
  )
}
