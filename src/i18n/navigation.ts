import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Link, useRouter, usePathname… que añaden el prefijo de idioma solos
export const { Link, useRouter, usePathname, redirect, getPathname } = createNavigation(routing)
