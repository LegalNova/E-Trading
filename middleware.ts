import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token
    const { pathname } = req.nextUrl

    // Si usuario logueado visita /login o /register → redirigir a /dashboard
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: '/login' },
  }
)

export const config = {
  // Solo proteger rutas privadas — login/register/demo son públicas y NO pasan por aquí
  matcher: [
    '/dashboard/:path*',
    '/mercado/:path*',
    '/portafolio/:path*',
    '/clases/:path*',
    '/retos/:path*',
    '/insignias/:path*',
    '/liga/:path*',
    '/ia/:path*',
    '/onboarding/:path*',
  ],
}
