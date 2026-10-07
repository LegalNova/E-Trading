'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type ThemePref = 'light' | 'dark' | 'auto'
type Resolved = 'light' | 'dark'

interface ThemeCtx {
  pref: ThemePref
  resolved: Resolved
  setPref: (p: ThemePref) => void
}

const Ctx = createContext<ThemeCtx>({ pref: 'auto', resolved: 'dark', setPref: () => {} })
const KEY = 'et-theme'

/** Script inline para <head>: aplica el tema antes del primer pintado (sin parpadeo) */
export const THEME_SCRIPT = `(function(){try{var p=localStorage.getItem('${KEY}')||'auto';var d=p==='dark'||(p==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light')}catch(e){document.documentElement.setAttribute('data-theme','dark')}})()`

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'auto'
  } catch {
    return 'auto'
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>('auto')
  const [sysDark, setSysDark] = useState(true)

  useEffect(() => {
    setPrefState(readPref())
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setSysDark(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setSysDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolved: Resolved = pref === 'auto' ? (sysDark ? 'dark' : 'light') : pref

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', resolved === 'dark' ? '#07090A' : '#F5F6F7')
  }, [resolved])

  const setPref = useCallback((p: ThemePref) => {
    setPrefState(p)
    try {
      localStorage.setItem(KEY, p)
    } catch {
      // modo privado: el tema dura solo esta sesión
    }
  }, [])

  return <Ctx.Provider value={{ pref, resolved, setPref }}>{children}</Ctx.Provider>
}

export const useTheme = () => useContext(Ctx)
