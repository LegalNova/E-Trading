import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import Providers from '@/components/Providers'
import CookieBanner from '@/components/CookieBanner'
import { THEME_SCRIPT } from '@/components/theme/ThemeProvider'

export const metadata: Metadata = {
  title: 'E-Trading — Aprende a invertir sin arriesgar ni un euro',
  description: 'Simulador con precios reales y 10.000 € virtuales, clases de 10 minutos y una Profesora IA. Simulación educativa.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#07090A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <Providers>
          {children}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  )
}
