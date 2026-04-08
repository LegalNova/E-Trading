import { Plan } from '@/data/clases'

export interface PlanConfig {
  name: Plan
  label: string
  precio: number
  clasesDia: number | null // null = ilimitado
  opsSemana: number | null
  iaMsgsDia: number | null
  features: string[]
}

export const PLANES: Record<Plan, PlanConfig> = {
  free: {
    name: 'free',
    label: 'Free',
    precio: 0,
    clasesDia: 5,
    opsSemana: 5,
    iaMsgsDia: 10,
    features: ['5 clases al día', '5 operaciones por semana', '10 mensajes IA al día', 'Liga Novato', '15 retos gratuitos'],
  },
  starter: {
    name: 'starter',
    label: 'Starter',
    precio: 1,
    clasesDia: 10,
    opsSemana: 20,
    iaMsgsDia: 20,
    features: ['10 clases al día', '20 operaciones por semana', '20 mensajes IA al día', 'Acceso a ligas completas', '25 retos'],
  },
  pro: {
    name: 'pro',
    label: 'Pro',
    precio: 9,
    clasesDia: 20,
    opsSemana: null,
    iaMsgsDia: 100,
    features: ['20 clases al día', 'Operaciones ilimitadas', '100 mensajes IA al día', 'Escudo de racha', '45 retos'],
  },
  elite: {
    name: 'elite',
    label: 'Elite',
    precio: 16,
    clasesDia: null,
    opsSemana: null,
    iaMsgsDia: null,
    features: ['Todo ilimitado', 'Todos los 50 retos', 'Prioridad en IA', 'Certificado oficial', 'Badge Legendario'],
  },
}

export function canAccessClase(plan: Plan, clasePlan: Plan): boolean {
  const order: Plan[] = ['free', 'starter', 'pro', 'elite']
  return order.indexOf(plan) >= order.indexOf(clasePlan)
}

export function canAccessReto(plan: Plan, retoPlan: Plan): boolean {
  return canAccessClase(plan, retoPlan)
}

export function checkDailyClaseLimit(plan: Plan, clasesVistas: number): boolean {
  const config = PLANES[plan]
  if (config.clasesDia === null) return true
  return clasesVistas < config.clasesDia
}

export function checkWeeklyOpsLimit(plan: Plan, opsCount: number): boolean {
  const config = PLANES[plan]
  if (config.opsSemana === null) return true
  return opsCount < config.opsSemana
}

export function checkDailyIALimit(plan: Plan, iaMessages: number): boolean {
  const config = PLANES[plan]
  if (config.iaMsgsDia === null) return true
  return iaMessages < config.iaMsgsDia
}
