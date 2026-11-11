'use client'
// Ayudas de un vistazo que salen la primera vez y, al cerrarlas, no vuelven (se recuerda en este navegador).
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Icon } from './icons'

const KEY = (id: string) => `et.help.${id}`

/** ¿Ya ha visto (y cerrado) esta ayuda? `null` mientras no se sabe (antes de montar: así no parpadea) */
export function useSeen(id: string): [boolean | null, () => void] {
  const [seen, setSeen] = useState<boolean | null>(null)
  useEffect(() => {
    let v = false
    try {
      v = localStorage.getItem(KEY(id)) === '1'
    } catch {
      v = false
    }
    // Se lee después de montar (en el servidor no hay localStorage): así el HTML coincide al hidratar
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeen(v)
  }, [id])
  const markSeen = () => {
    setSeen(true)
    try {
      localStorage.setItem(KEY(id), '1')
    } catch {
      // Sin almacenamiento (modo privado): se oculta solo hasta recargar
    }
  }
  return [seen, markSeen]
}

/** Tarjeta «¿Qué es esto?» que se cierra con «Entendido» y no vuelve a salir */
export function HelpTip({ id, title, children, className }: { id: string; title: string; children: React.ReactNode; className?: string }) {
  const t = useTranslations('help')
  const [seen, markSeen] = useSeen(id)
  if (seen !== false) return null
  return (
    <div className={`card animate-rise flex flex-col gap-2 ${className ?? ''}`} style={{ boxShadow: 'inset 0 0 0 2px var(--brand)' }} role="note" aria-label={title}>
      <span className="flex items-start gap-2">
        <span className="mt-0.5 flex-none" style={{ color: 'var(--brand-ink)' }}>
          <Icon name="info" size={20} />
        </span>
        <b className="t-head flex-1">{title}</b>
        <button className="icon-btn -mt-2 -mr-2 h-11 w-11 flex-none" onClick={markSeen} aria-label={t('close')}>
          <Icon name="close" size={18} />
        </button>
      </span>
      <div className="t-body flex flex-col gap-1.5" style={{ color: 'var(--ink)' }}>
        {children}
      </div>
      <button className="btn btn-secondary btn-sm self-start" onClick={markSeen}>
        {t('gotIt')}
      </button>
    </div>
  )
}

/** Lista numerada corta dentro de una ayuda */
export function HelpSteps({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
      {items.map((x, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="grid h-6 w-6 flex-none place-items-center rounded-full text-[13px] font-extrabold" style={{ background: 'var(--brand)', color: 'var(--on-brand)' }}>
            {i + 1}
          </span>
          <span className="flex-1 text-[15px] leading-[21px]">{x}</span>
        </li>
      ))}
    </ol>
  )
}
