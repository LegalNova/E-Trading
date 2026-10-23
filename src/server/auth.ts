import 'server-only'
// Acceso (D-030): email + contraseña ya; Google en cuanto haya credenciales (GOOGLE_CLIENT_ID/SECRET).
// Sesiones en nuestra base de datos, cookie httpOnly. El rol ADMIN se asigna por ADMIN_EMAILS.
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { headers } from 'next/headers'
import { db } from './db'

const admins = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
const google = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } : null

const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? vercelUrl,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: 'postgresql' }),
  trustedOrigins: ['https://e-trading-app.vercel.app', 'https://e-trading-app-*-jvidalalmirall-5471s-projects.vercel.app', ...(vercelUrl ? [vercelUrl] : []), 'http://localhost:3100'],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Sin servicio de email todavía: la verificación llega con el dominio propio (D-035)
    requireEmailVerification: false,
  },
  socialProviders: google ? { google } : {},
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  rateLimit: { enabled: true, window: 60, max: 30, customRules: { '/sign-in/email': { window: 60, max: 5 }, '/sign-up/email': { window: 60, max: 5 } } },
  telemetry: { enabled: false },
  databaseHooks: {
    user: {
      create: {
        before: async user => ({ data: { ...user, role: admins.includes(user.email.toLowerCase()) ? 'ADMIN' : 'USER' } }),
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
