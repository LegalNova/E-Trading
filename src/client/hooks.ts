'use client'
// Consultas compartidas. Las claves agrupan lo que hay que refrescar tras cada acción.
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import { useCallback } from 'react'
import { api } from './api'

export const useSession = () => useQuery({ queryKey: ['session'], queryFn: api.session, staleTime: 60_000 })
export const useMe = () => useQuery({ queryKey: ['me'], queryFn: api.me })
export const useHome = () => useQuery({ queryKey: ['home'], queryFn: api.home, refetchInterval: 10_000 })
export const usePath = () => useQuery({ queryKey: ['path'], queryFn: api.path })
export const useLives = () => useQuery({ queryKey: ['lives'], queryFn: api.lives, refetchInterval: 60_000 })
export const usePortfolio = () => useQuery({ queryKey: ['portfolio'], queryFn: api.portfolio, refetchInterval: 5_000 })
export const useSettings = () => useQuery({ queryKey: ['settings'], queryFn: api.settings })

/** Tras una acción que da progreso, se refresca todo (en la simulación es barato) */
export function useRefreshAll() {
  const qc = useQueryClient()
  return useCallback(() => qc.invalidateQueries(), [qc])
}

/** Idioma activo para formatear cifras */
export const useLang = () => useLocale()
