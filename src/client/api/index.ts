// Punto único de acceso a datos: la API real del servidor (etapa 3)
import { httpApi } from './http'

export const api = httpApi
export * from './types'
