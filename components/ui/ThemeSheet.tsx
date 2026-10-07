'use client'
import { useTheme, ThemePref } from '@/components/theme/ThemeProvider'
import { Sheet } from './Sheet'
import { Seg } from './Seg'
import { Icon, ICONS } from './Icon'

const LABEL: Record<ThemePref, string> = { light: 'Claro', dark: 'Oscuro', auto: 'Automático' }
const ORDER: ThemePref[] = ['light', 'dark', 'auto']

/** Selector de tema en línea (Ajustes) */
export function ThemeSeg() {
  const { pref, setPref } = useTheme()
  return (
    <Seg
      label="Tema"
      options={ORDER.map(p => LABEL[p])}
      value={LABEL[pref]}
      onChange={l => setPref(ORDER.find(p => LABEL[p] === l) ?? 'auto')}
    />
  )
}

/** Hoja "Apariencia" */
export function ThemeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pref, setPref } = useTheme()
  return (
    <Sheet open={open} onClose={onClose} label="Apariencia">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ font: '600 22px/28px var(--font)' }}>Apariencia</span>
        <div style={{ border: '1px solid var(--border)', borderRadius: 6 }}>
          {ORDER.map((p, i) => (
            <button
              key={p}
              onClick={() => setPref(p)}
              aria-pressed={pref === p}
              style={{
                width: '100%', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
                border: 'none', borderBottom: i < ORDER.length - 1 ? '1px solid var(--border)' : 'none', background: 'none',
                color: 'var(--text-primary)', font: '400 17px var(--font)', cursor: 'pointer',
              }}
            >
              {LABEL[p]}
              {pref === p && <Icon d={ICONS.check} size={18} color="var(--green)" stroke={2} />}
            </button>
          ))}
        </div>
        <span style={{ font: '400 13px/18px var(--font)', color: 'var(--text-secondary)' }}>Automático sigue la configuración de tu dispositivo.</span>
      </div>
    </Sheet>
  )
}
