'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export interface Me {
  user: {
    id: string
    name: string
    email: string
    plan: 'free' | 'starter' | 'pro' | 'elite'
    planLabel: string
    isTrial: boolean
    trialDaysLeft: number | null
    xp: number
    racha: number
    onboarded: boolean
    createdAt: string
  }
  level: { n: number; nombre: string; xpMin: number; xpMax: number | null; progress: number; toNext: number | null }
  counts: { clases: number; retos: number; insignias: number; trades: number }
  limits: { clasesDia: number | null; opsSemana: number | null; iaMsgsDia: number | null }
  daily: { id: string; titulo: string; hecho: number; meta: number }[]
  nextClase: { id: string; numero: number; titulo: string; duracion: string | null; xp: number | null; modulo: number } | null
  alerta: { tipo: string; texto: string } | null
  liga: { nombre: string; pos: number; total: number; xp: number; zone: 'up' | 'down' | 'safe'; endsAt: string } | null
}

const Ctx = createContext<{ me: Me | null; refresh: () => Promise<void> }>({ me: null, refresh: async () => {} })

export function MeProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null)
  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/me', { cache: 'no-store' })
      if (res.ok) setMe(await res.json())
    } catch {
      // se reintenta en la siguiente navegación
    }
  }, [])
  useEffect(() => {
    refresh()
  }, [refresh])
  return <Ctx.Provider value={{ me, refresh }}>{children}</Ctx.Provider>
}

export const useMe = () => useContext(Ctx)
