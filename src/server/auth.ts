import 'server-only'
// Acceso (D-030): email + contraseña; Google en cuanto haya credenciales (GOOGLE_CLIENT_ID/SECRET).
// Sesiones en nuestra base de datos, cookie httpOnly y Secure en producción.
// Seguridad: el rol ADMIN solo se da a cuentas con email VERIFICADO de ADMIN_EMAILS (por Google o
// con el enlace del email de confirmación); registrarse con el email de otra persona no basta.
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import { anonymous } from 'better-auth/plugins'
import { headers } from 'next/headers'
import { LEGAL_VERSION } from '@/shared/legal'
import { db } from './db'
import { langOf, mailEnabled, sendTemplate } from './mail'
import { memo } from './request'
import { viewAs } from './view'

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
    // Se puede entrar sin confirmar el email; el enlace sirve para recuperar la cuenta y para el rol ADMIN
    requireEmailVerification: false,
    resetPasswordTokenExpiresIn: 3600,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }, req) => sendTemplate('reset', langOf(req), user.email, url),
  },
  emailVerification: {
    sendOnSignUp: mailEnabled,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24 * 3,
    sendVerificationEmail: async ({ user, url }, req) => sendTemplate('verify', langOf(req), user.email, url),
  },
  socialProviders: google ? { google } : {},
  // La sesión se guarda firmada en una cookie 5 minutos: no hace falta consultar la base de datos en cada petición
  // (el usuario sí se lee siempre, así que un bloqueo o un cambio de plan se aplican al momento)
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24, cookieCache: { enabled: true, maxAge: 5 * 60 } },
  // Guardado en BD: vale aunque Vercel reparta las peticiones entre instancias
  rateLimit: {
    enabled: true,
    storage: 'database',
    window: 60,
    max: 60,
    customRules: { '/sign-in/anonymous': { window: 3600, max: 10 }, '/request-password-reset': { window: 3600, max: 5 }, '/send-verification-email': { window: 3600, max: 5 }, '/sign-in/email': { window: 300, max: 10 }, '/sign-up/email': { window: 3600, max: 10 }, '/sign-in/social': { window: 60, max: 10 } },
  },
  advanced: { ipAddress: { ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'] }, useSecureCookies: process.env.NODE_ENV === 'production' },
  telemetry: { enabled: false },
  hooks: {
    before: createAuthMiddleware(async ctx => {
      if (!['/sign-up/email', '/reset-password', '/change-password', '/set-password'].includes(ctx.path)) return
      const b = ctx.body as { password?: unknown; newPassword?: unknown }
      const pw = String(b?.password ?? b?.newPassword ?? '')
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
  plugins: [
    // «Probar sin registrarme»: cuenta de invitado al momento; guarda su progreso al poner email y contraseña
    anonymous({ generateName: () => '', emailDomainName: 'invitado.lumi.app' }),
    nextCookies(),
  ],
})

export const googleEnabled = !!google
export { mailEnabled }

/** Quien ha iniciado sesión de verdad (o null). Lee la cookie de la petición. */
export function realUser() {
  return memo('realUser', async () => {
    const s = await auth.api.getSession({ headers: await headers() })
    if (!s) return null
    const u = await db.user.findUnique({ where: { id: s.user.id } })
    return u && !u.blockedAt ? u : null
  })
}

/** Usuario de la sesión actual: el real o, si un admin está «viendo como», el usuario elegido */
export async function currentUser() {
  const v = viewAs()
  if (v) return memo('viewAsUser', () => db.user.findUnique({ where: { id: v.targetId } }))
  return realUser()
}
