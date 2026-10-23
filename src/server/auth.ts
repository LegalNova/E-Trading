import 'server-only'
// Acceso (D-030): email + contraseña; Google en cuanto haya credenciales (GOOGLE_CLIENT_ID/SECRET).
// Sesiones en nuestra base de datos, cookie httpOnly y Secure en producción.
// Seguridad: el rol ADMIN solo se da a cuentas con email VERIFICADO (por Google) de ADMIN_EMAILS;
// con email y contraseña no basta, porque aún no verificamos emails (D-035) y alguien podría
// registrarse con el email de otra persona.
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import { headers } from 'next/headers'
import { LEGAL_VERSION } from '@/shared/legal'
import { db } from './db'

const admins = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
const google = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } : null

const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? vercelUrl,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: 'postgresql' }),
  trustedOrigins: ['https://e-trading-app.vercel.app', 'https://e-trading-app-*-jvidalalmirall-5471s-projects.vercel.app', ...(vercelUrl ? [vercelUrl] : []), ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:3100'] : [])],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Sin servicio de email todavía: la verificación llega con el dominio propio (D-035)
    requireEmailVerification: false,
  },
  socialProviders: google ? { google } : {},
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  // Guardado en BD: vale aunque Vercel reparta las peticiones entre instancias
  rateLimit: {
    enabled: true,
    storage: 'database',
    window: 60,
    max: 60,
    customRules: { '/sign-in/email': { window: 300, max: 10 }, '/sign-up/email': { window: 3600, max: 10 }, '/sign-in/social': { window: 60, max: 10 } },
  },
  advanced: { ipAddress: { ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'] }, useSecureCookies: process.env.NODE_ENV === 'production' },
  telemetry: { enabled: false },
  hooks: {
    before: createAuthMiddleware(async ctx => {
      if (ctx.path !== '/sign-up/email') return
      const pw = String((ctx.body as { password?: unknown })?.password ?? '')
      if (!/\d/.test(pw)) throw new APIError('BAD_REQUEST', { message: 'La contraseña necesita al menos un número', code: 'WEAK_PASSWORD' })
    }),
  },
  databaseHooks: {
    user: {
      create: {
        // Al crear la cuenta se acepta la versión vigente de los términos y la privacidad
        before: async user => ({ data: { ...user, role: user.emailVerified && admins.includes(user.email.toLowerCase()) ? 'ADMIN' : 'USER', legalVersion: LEGAL_VERSION, legalAcceptedAt: new Date() } }),
      },
      update: {
        // Si Google verifica más tarde el email de un admin, se le da el rol
        after: async user => {
          if (user.emailVerified && admins.includes(user.email.toLowerCase())) await db.user.updateMany({ where: { id: user.id, role: 'USER' }, data: { role: 'ADMIN' } })
        },
      },
    },
  },
  plugins: [nextCookies()],
})

export const googleEnabled = !!google

/** Usuario de la sesión actual (o null). Lee la cookie de la petición. */
export async function currentUser() {
  const s = await auth.api.getSession({ headers: await headers() })
  if (!s) return null
  const u = await db.user.findUnique({ where: { id: s.user.id } })
  return u && !u.blockedAt ? u : null
}
