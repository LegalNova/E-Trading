'use client'
// Marco de la app: barra inferior en el móvil y columna lateral en pantallas grandes.
// También protege las rutas: sin sesión → /entrar; onboarding a medias → /onboarding.
import { useQueryClient } from '@tanstack/react-query'
import { Suspense, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { AdminLayer } from './admin-layer'
import { PendingLeagueJoin } from './screens/friends'
import { PendingGroupJoin } from './screens/groups'
import { TeamMessage } from './team-message'
import { MaxSide } from './upgrade'
import { ThemeToggle } from './theme-toggle'
import { api } from './api'
import { useMe, useSession } from './hooks'
import { Icon, Wordmark, type IconName } from './ui/icons'
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
  if (path.startsWith('/profesora')) return '/clases'
  if (path.startsWith('/regalar') || path.startsWith('/grupo') || path.startsWith('/estudiante')) return '/perfil'
  if (path.startsWith('/proyecto') || path.startsWith('/tesis')) return '/clases'
  return TABS.find(t => path.startsWith(t.href))?.href ?? '/inicio'
}

/** En el móvil, la barra de abajo se esconde al bajar y vuelve al subir, para no tapar contenido (auditoría APP-30) */
function useHideNavOnScroll() {
  useEffect(() => {
    let last = window.scrollY
    let hidden = false
    const root = document.documentElement
    const onScroll = () => {
      const y = window.scrollY
      const atEnd = y + window.innerHeight >= document.documentElement.scrollHeight - 4
      const next = y > 80 && y > last + 2 && !atEnd ? true : y < last - 2 || y <= 80 || atEnd ? false : hidden
      if (next !== hidden) {
        hidden = next
        if (hidden) root.dataset.navHidden = ''
        else delete root.dataset.navHidden
      }
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      delete root.dataset.navHidden
    }
  }, [])
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

/** Cuando la app ya está pintada, carga en segundo plano lo de las otras pestañas: cambiar de pestaña es instantáneo */
function usePrefetchTabs(ready: boolean) {
  const qc = useQueryClient()
  useEffect(() => {
    if (!ready) return
    const id = setTimeout(() => {
      qc.prefetchQuery({ queryKey: ['path'], queryFn: api.path })
      qc.prefetchQuery({ queryKey: ['me'], queryFn: api.me })
      qc.prefetchQuery({ queryKey: ['league'], queryFn: api.league })
      qc.prefetchQuery({ queryKey: ['portfolio'], queryFn: api.portfolio })
      qc.prefetchQuery({ queryKey: ['assets', 'WATCH'], queryFn: () => api.assets({ type: 'WATCH' }) })
    }, 900)
    return () => clearTimeout(id)
  }, [ready, qc])
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations('nav')
  const { ready } = useGuard('app')
  usePrefetchTabs(ready)
  useHideNavOnScroll()

  return (
    <div className="min-h-dvh md:flex">
      <aside className="sticky top-0 hidden h-dvh w-60 flex-none flex-col gap-1 border-r px-3 py-5 md:flex" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
        <Link href="/inicio" className="mb-4 flex items-center gap-2.5 px-3 text-lg font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>
          <Wordmark size={21} />
        </Link>
        {/* La ruta actual solo se conoce al pedir la página: el menú se resuelve aparte */}
        <Suspense>
          <SideLinks />
        </Suspense>
        <MaxSide />
        <div className="mt-auto">
          <ThemeToggle withLabel />
        </div>
        <p className="t-cap px-3">{t('footer')}</p>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        {/* Las pantallas del Mercado (marcadas con .wide) usan una columna más ancha */}
        <main className="mx-auto w-full max-w-[600px] flex-1 pb-[calc(100px+env(safe-area-inset-bottom))] has-[.wide]:max-w-[1120px] md:pt-6 md:pb-10" style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}>
          {/* Invitado: recordatorio para guardar su progreso */}
          <Suspense>
            <GuestBar />
          </Suspense>
          {/* La página se pinta siempre (navegación instantánea); se oculta hasta confirmar la sesión */}
          <div hidden={!ready}>
            <Suspense fallback={children}>
              <PageIn>{children}</PageIn>
            </Suspense>
          </div>
          {!ready && <PageSkeleton />}
        </main>
      </div>

      <Suspense>
        <AdminLayer />
      </Suspense>
      {/* Llegó por el enlace de una liga de amigos sin cuenta: al entrar, se une */}
      <PendingLeagueJoin />
      {/* Llegó por el enlace de un plan de grupo sin cuenta: al entrar, se une */}
      <PendingGroupJoin />
      <TeamMessage />
      {/* Barra inferior flotante de cristal (estilo «liquid glass») */}
      <nav aria-label={t('label')} className="glass bottom-nav fixed inset-x-3 z-30 rounded-[30px] p-1.5 md:hidden" style={{ bottom: 'max(10px, env(safe-area-inset-bottom))' }}>
        <Suspense>
          <BottomLinks />
        </Suspense>
      </nav>
    </div>
  )
}

function GuestBar() {
  const t = useTranslations('guest')
  const { data } = useSession()
  const { data: me } = useMe()
  // Hasta que termina su primera clase no se le pide nada: primero que vea para qué sirve (auditoría APP-6)
  if (!data?.isGuest || !me || me.lessonsCompleted === 0) return null
  return (
    <Link href="/guardar" className="mx-4 mb-2 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] font-bold" style={{ background: 'color-mix(in srgb, var(--brand) 12%, transparent)', color: 'var(--ink)' }}>
      <Icon name="user" size={18} />
      <span className="flex-1">{t('bar')}</span>
      <span style={{ color: 'var(--brand-ink)' }}>{t('barCta')}</span>
    </Link>
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
        <Link key={tab.href} href={tab.href} aria-current={active === tab.href ? 'page' : undefined} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-bold" style={active === tab.href ? { background: 'color-mix(in srgb, var(--brand) 12%, transparent)', color: 'var(--brand-ink)' } : { color: 'var(--ink-2)' }}>
          <Icon name={tab.icon} size={22} />
          {t(tab.key)}
        </Link>
      ))}
      <Link href="/profesora" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-bold" style={{ color: path.startsWith('/profesora') ? 'var(--brand-ink)' : 'var(--ink-2)' }}>
        <Icon name="chat" size={22} />
        {t('tutor')}
      </Link>
      <Link href="/avisos" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-bold" style={{ color: path.startsWith('/avisos') ? 'var(--brand-ink)' : 'var(--ink-2)' }}>
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
  const i = TABS.findIndex(tab => tab.href === active)
  return (
    <div className="relative grid grid-cols-5">
      {/* Píldora que se desliza hasta la pestaña activa */}
      <span aria-hidden="true" className="tab-pill absolute inset-y-0 left-0 w-1/5 rounded-[24px]" style={{ transform: `translateX(${Math.max(0, i) * 100}%)`, opacity: i < 0 ? 0 : 1, background: 'color-mix(in srgb, var(--brand) 15%, transparent)' }} />
      {TABS.map(tab => (
        <Link key={tab.href} href={tab.href} aria-current={active === tab.href ? 'page' : undefined} className="relative flex flex-col items-center justify-center gap-[2px] rounded-[24px] py-1.5 text-[10px] font-bold transition-[color,transform] duration-200 active:scale-90" style={{ color: active === tab.href ? 'var(--brand-ink)' : 'var(--ink-2)' }}>
          <Icon name={tab.icon} size={23} />
          {t(tab.key)}
        </Link>
      ))}
    </div>
  )
}

/** Cada pantalla entra con un fundido corto */
function PageIn({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  return (
    <div key={path} className="page-in">
      {children}
    </div>
  )
}

/** Pantallas a pantalla completa (lección, quiz, onboarding): sin barra, columna centrada */
export function FocusShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[600px] flex-col" style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}>
      {children}
      <Suspense>
        <AdminLayer />
      </Suspense>
    </div>
  )
}
