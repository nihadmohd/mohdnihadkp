'use client'

// ─────────────────────────────────────────────────────────────
// Site contexts — session + settings shared across all views
// ─────────────────────────────────────────────────────────────
import { createContext, useContext } from 'react'

export interface SessionUser {
  id: string
  email: string
  name: string | null
  role: string
  image: string | null
  emailVerified: Date | string | null
  onboarded: boolean
  plan: string
  planRenewsAt?: Date | string | null
  banned?: boolean
}

export interface SiteSettings {
  siteName?: string
  tagline?: string
  announcement?: string
  maintenanceMode?: string
  maintenanceMessage?: string
  showLiveCounter?: string
  blogEnabled?: string
  storeEnabled?: string
  contactEmail?: string
  whatsappNumber?: string
  seoTitle?: string
  seoDescription?: string
  footerNote?: string
  [key: string]: string | undefined
}

interface SessionContextValue {
  user: SessionUser | null
  setUser: (u: SessionUser | null) => void
  refresh: () => Promise<void>
  /** true once /api/auth/me has resolved (user may still be null) */
  loaded: boolean
}

interface SettingsContextValue {
  settings: SiteSettings
  updateSettings: (s: SiteSettings) => void
}

export const SessionContext = createContext<SessionContextValue>({
  user: null,
  setUser: () => {},
  refresh: async () => {},
  loaded: false,
})

export const SettingsContext = createContext<SettingsContextValue>({
  settings: {},
  updateSettings: () => {},
})

export const useSession = () => useContext(SessionContext)
export const useSiteSettings = () => useContext(SettingsContext)

export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === 'ADMIN'
}
