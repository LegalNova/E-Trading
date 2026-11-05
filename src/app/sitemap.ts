import type { MetadataRoute } from 'next'
import { LEGAL_SLUGS } from '@/legal'
import { OWNER } from '@/legal/owner'

const LOCALES = ['es', 'ca', 'en'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', '/ayuda', ...LEGAL_SLUGS.map(s => `/legal/${s}`)]
  return paths.flatMap(p => LOCALES.map(l => ({ url: `${OWNER.site}/${l}${p}`, changeFrequency: p ? ('monthly' as const) : ('weekly' as const), priority: p ? 0.5 : 1 })))
}
