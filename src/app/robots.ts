import type { MetadataRoute } from 'next'
import { OWNER } from '@/legal/owner'

// Solo se indexan las páginas públicas (inicio, ayuda y textos legales); la app y el panel no.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: ['/'], disallow: ['/api/', '/*/admin', '/*/inicio', '/*/clases', '/*/mercado', '/*/liga', '/*/perfil', '/*/ajustes', '/*/avisos', '/*/profesora', '/*/premium', '/*/insignias', '/*/leccion/', '/*/quiz/', '/*/onboarding', '/*/sin-vidas', '/*/recuperar', '/*/regalar', '/*/regalo/'] }],
    sitemap: `${OWNER.site}/sitemap.xml`,
  }
}
