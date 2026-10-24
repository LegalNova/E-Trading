'use client'
// Marco de la app: barra inferior en el móvil y columna lateral en pantallas grandes.
// También protege las rutas: sin sesión → /entrar; onboarding a medias → /onboarding.
import { Suspense, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { useSession } from './hooks'
import { Icon, Logo, type IconName } from './ui/icons'
import { PageSkeleton } from './ui/kit'

const TABS: { href: string; key: string; icon: IconName }[] = [
  { href: '/inicio', key: 'home', icon: 'home' },
  { href: '/clases', key: 'learn', icon: 'learn' },
  { href: '/mercado', key: 'market', icon: 'market' },
  { href: '/liga', key: 'league', icon: 'league' },
  { href: '/perfil', key: 'profile', icon: 'user' },
]

/** Pestaña a la que pertenece cada ruta */
function tabOf(path: string) {
  if (path.startsWith('/avisos')) return '/inicio'
  if (path.startsWith('/ajustes') || path.startsWith('/premium')) return '/perfil'
  return TABS.find(t => path.startsWith(t.href))?.href ?? '/inicio'
}

export function useGuard(require: 'app' | 'onboarding' | 'admin' = 'app') {
  const { data, isLoading } = useSession()
  const router = useRouter()
  useEffect(() => {
    if (!data) return
    if (!data.signedIn) router.replace('/entrar')
    else if (require !== 'onboarding' && data.onboardingStep !== null) router.replace('/onboarding')
    else if (require === 'onboarding' && data.onboardingStep === null) router.replace('/inicio')
    else if (require === 'admin' && !data.isAdmin) router.replace('/inicio')
  }, [data, require, router])
  const ok = !!data?.signedIn && (require === 'onboarding' ? data.onboardingStep !== null : data.onboardingStep === null) && (require !== 'admin' || data.isAdmin)
  return { ready: !isLoading && ok, session: data }
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations('nav')
  const { ready } = useGuard('app')

  return (
    <div className="min-h-dvh md:flex">
      <aside className="sticky top-0 hidden h-dvh w-60 flex-none flex-col gap-1 border-r px-3 py-5 md:flex" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
        <Link href="/inicio" className="mb-4 flex items-center gap-2.5 px-3 text-lg font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>
          <Logo size={30} /> E-Trading
        </Link>
        {/* La ruta actual solo se conoce al pedir la página: el menú se resuelve aparte */}
        <Suspense>
          <SideLinks />
        </Suspense>
        <p className="t-cap mt-auto px-3">{t('footer')}</p>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        {/* Las pantallas del Mercado (marcadas con .wide) usan una columna más ancha */}
        <main className="mx-auto w-full max-w-[600px] flex-1 pb-[calc(76px+env(safe-area-inset-bottom))] has-[.wide]:max-w-[1120px] md:pt-6 md:pb-10" style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}>
          {/* La página se pinta siempre (navegación instantánea); se oculta hasta confirmar la sesión */}
          <div hidden={!ready}>{children}</div>
          {!ready && <PageSkeleton />}
        </main>
      </div>

      <nav aria-label={t('label')} className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t px-1.5 pt-1.5 md:hidden" style={{ borderColor: 'var(--line)', background: 'color-mix(in srgb, var(--surface) 92%, transparent)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        <Suspense>
          <BottomLinks />
        </Suspense>
      </nav>
    </div>
  )
}

function SideLinks() {
  const t = useTranslations('nav')
  const path = usePathname()
  const active = tabOf(path)
  const { data: session } = useSession()
  return (
    <>
      {TABS.map(tab => (
        <Link key={tab.href} href={tab.href} aria-current={active === tab.href ? 'page' : undefined} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-bold" style={active === tab.href ? { background: 'color-mix(in srgb, var(--brand) 12%, transparent)', color: 'var(--brand)' } : { color: 'var(--ink-2)' }}>
          <Icon name={tab.icon} size={22} />
          {t(tab.key)}
        </Link>
      ))}
      <Link href="/avisos" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-bold" style={{ color: path.startsWith('/avisos') ? 'var(--brand)' : 'var(--ink-2)' }}>
        <Icon name="bell" size={22} />
        {t('notifications')}
      </Link>
      {session?.isAdmin && (
        <Link href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-bold" style={{ color: 'var(--ink-2)' }}>
          <Icon name="admin" size={22} />
          {t('admin')}
        </Link>
      )}
    </>
  )
}

function BottomLinks() {
  const t = useTranslations('nav')
  const active = tabOf(usePathname())
  return (
    <>
      {TABS.map(tab => (
        <Link key={tab.href} href={tab.href} aria-current={active === tab.href ? 'page' : undefined} className="flex flex-col items-center justify-center gap-[3px] py-1 text-[10px] font-bold" style={{ color: active === tab.href ? 'var(--brand)' : 'var(--ink-3)' }}>
          <Icon name={tab.icon} size={24} />
          {t(tab.key)}
        </Link>
      ))}
    </>
  )
}

/** Pantallas a pantalla completa (lección, quiz, onboarding): sin barra, columna centrada */
export function FocusShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[600px] flex-col" style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}>
      {children}
    </div>
  )
}
