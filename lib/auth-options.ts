import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import {
  getUserByEmail,
  getUserByProviderId,
  createUser,
  touchLastActive,
} from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email:    { label: 'Email',      type: 'email'    },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await getUserByEmail(credentials.email)
        if (!user || !user.password_hash) return null

        const valid = await bcrypt.compare(credentials.password, user.password_hash)
        if (!valid) return null

        await touchLastActive(user.id)

        return {
          id:            user.id,
          email:         user.email,
          name:          user.name ?? user.email.split('@')[0],
          plan:          user.plan,
          xp:            user.xp,
          racha:         user.racha,
          trial_ends_at: user.trial_ends_at,
        } as Record<string, unknown> & { id: string; email: string; name: string }
      },
    }),

    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId:     process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
  ],

  // 30-day persistent session — survives browser/tab close
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // refresh JWT once per day
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Force the session cookie to be persistent (with maxAge), not a session
  // cookie that gets cleared on browser close.
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const providerId = account.providerAccountId
        let dbUser = await getUserByProviderId(providerId)
        if (!dbUser) dbUser = await getUserByEmail(user.email!)
        if (!dbUser) {
          dbUser = await createUser({
            email:       user.email!,
            name:        user.name ?? user.email!.split('@')[0],
            provider:    'google',
            provider_id: providerId,
            avatar_url:  user.image ?? undefined,
          })
        }
        if (!dbUser) return false
        user.id = dbUser.id
        const u = user as unknown as Record<string, unknown>
        u.plan          = dbUser.plan
        u.xp            = dbUser.xp
        u.racha         = dbUser.racha
        u.trial_ends_at = dbUser.trial_ends_at
        await touchLastActive(dbUser.id)
      }
      return true
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as unknown as Record<string, unknown>
        token.id           = (u.id as string) ?? token.sub ?? ''
        token.plan         = (u.plan         as string)  ?? 'pro_trial'
        token.xp           = (u.xp           as number)  ?? 0
        token.racha        = (u.racha         as number)  ?? 0
        token.trial_ends_at = (u.trial_ends_at as string | null) ?? null
      }
      if (trigger === 'update' && session) {
        Object.assign(token, session)
      }
      return token
    },

    async session({ session, token }) {
      const u = session.user as Record<string, unknown>
      u.id           = token.id
      u.plan         = token.plan
      u.xp           = token.xp
      u.racha        = token.racha
      u.trial_ends_at = token.trial_ends_at
      return session
    },
  },

  pages: {
    signIn:  '/login',
    newUser: '/onboarding',
    error:   '/login',
  },

  secret: process.env.NEXTAUTH_SECRET ?? 'dev-secret-change-in-production',
}
