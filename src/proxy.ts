import { NextResponse, type NextRequest } from 'next/server'
import { routing, isLocale } from '@/i18n/routing'

// Toda URL sin idioma se redirige a /<idioma>/… según la cookie o el navegador.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const first = pathname.split('/')[1] ?? ''
  if (isLocale(first)) return NextResponse.next()

  const cookie = request.cookies.get('NEXT_LOCALE')?.value
  const accepted = (request.headers.get('accept-language') ?? '')
    .split(',')
    .map(part => part.split(';')[0].trim().slice(0, 2).toLowerCase())
  const locale = cookie && isLocale(cookie) ? cookie : accepted.find(isLocale) ?? routing.defaultLocale

  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  url.search = search
  return NextResponse.redirect(url)
}

export const config = {
  // Todo excepto API, ficheros internos de Next y archivos estáticos
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
