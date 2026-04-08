import type { Metadata } from 'next'
import '@/styles/globals.css'
import Providers from '@/components/Providers'
import CookieBanner from '@/components/CookieBanner'

export const metadata: Metadata = {
  title: 'E-Trading — Aprende a invertir de verdad',
  description: 'La plataforma educativa que convierte a principiantes en inversores autónomos en 20 semanas.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          {children}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  )
}
