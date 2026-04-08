import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = (req as NextRequest & { nextauth?: { token: unknown } }).nextauth?.token
    const { pathname } = req.nextUrl

    // Si usuario logueado visita /login o /register → redirigir a /dashboard
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        // Las rutas públicas siempre pasan
        const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password',
                             '/privacidad', '/terminos', '/cookies', '/aviso-legal', '/brokers']
        if (publicPaths.some(p => pathname.startsWith(p))) return true
        // El resto requiere sesión
        return !!token
      },
    },
    pages: { signIn: '/login' },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/mercado/:path*',
    '/portafolio/:path*',
    '/clases/:path*',
    '/retos/:path*',
    '/insignias/:path*',
    '/liga/:path*',
    '/ia/:path*',
    '/precios/:path*',
    '/onboarding/:path*',
    '/login',
    '/register',
  ],
}
