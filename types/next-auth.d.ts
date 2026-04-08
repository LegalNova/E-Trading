import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id:            string
      email:         string
      name:          string
      plan:          'free' | 'starter' | 'pro' | 'elite' | 'pro_trial'
      xp:            number
      racha:         number
      trial_ends_at: string | null
      role:          'user' | 'admin'
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    plan?:          string
    xp?:            number
    racha?:         number
    trial_ends_at?: string | null
    role?:          string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:            string
    plan:          string
    xp:            number
    racha:         number
    trial_ends_at: string | null
    role:          string
  }
}
