import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'E-Trading',
    short_name: 'E-Trading',
    description: 'Aprende a invertir sin arriesgar un euro. Simulación educativa.',
    start_url: '/es/inicio',
    display: 'standalone',
    background_color: '#F5F5F7',
    theme_color: '#0071E3',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  }
}
