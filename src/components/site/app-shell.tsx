'use client'

// ─────────────────────────────────────────────────────────────
// AppShell — shared app chrome for every real route:
// session + settings contexts, realtime, analytics tracking,
// nav / footer / bottom nav / cookie consent / command palette,
// maintenance gate and session-expired overlays.
//
// Replaces the old SPA SiteRoot route switch — routes now come
// from the Next.js App Router tree in src/app/**.
// ─────────────────────────────────────────────────────────────
import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useRealtime } from '@/hooks/use-realtime'
import { api, SESSION_EXPIRED_EVENT } from '@/lib/api-client'
import {
  SessionContext, SettingsContext, isAdmin,
  type SessionUser, type SiteSettings,
} from '@/components/site/site-context'
import { SiteNav } from '@/components/site/nav'
import { BottomNav } from '@/components/site/bottom-nav'
import { SiteFooter } from '@/components/site/footer'
import { LiveUsersProvider, RealtimeFeedProvider } from '@/components/site/live-badge'
import { CookieConsent } from '@/components/site/cookie-consent'
import { CommandPalette } from '@/components/site/command-palette'
import { SessionExpiredModal, OfflineBanner } from '@/components/site/overlays'
import { MaintenanceView } from '@/components/views/states'

const RouteFallback = () => (
  <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-24 space-y-6" aria-busy="true">
    <div className="h-10 w-2/3 rounded-xl bg-muted animate-pulse" />
    <div className="h-5 w-1/2 rounded-lg bg-muted animate-pulse" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-8">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-44 rounded-2xl bg-muted animate-pulse" style={{ animationDelay: `${i * 90}ms` }} />
      ))}
    </div>
  </div>
)

export interface AppShellProps {
  children: React.ReactNode
  /** DB settings fetched server-side for this route */
  settings: Record<string, string>
  /** Admin routes render their own chrome */
  chrome?: boolean
}

export function AppShell({ children, settings: initialSettings, chrome = true }: AppShellProps) {
  const pathname = usePathname()
  const route = { path: pathname || '/', segments: (pathname || '/').split('/').filter(Boolean) }
  const [user, setUser] = useState<SessionUser | null>(null)
  const [sessionLoaded, setSessionLoaded] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>({ ...initialSettings })
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)

  // ── Session bootstrap ──────────────────────────────────────
  const refresh = useCallback(async () => {
    try {
      const data = await api<{ user: SessionUser | null }>('/api/auth/me')
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setSessionLoaded(true)
    }
  }, [])

  useEffect(() => {
    refresh()
    // Re-sync settings shortly after load (maintenance flags etc.)
    const t = setTimeout(() => {
      api<{ settings: SiteSettings }>('/api/settings')
        .then((d) => setSettings((prev) => ({ ...prev, ...d.settings })))
        .catch(() => {})
    }, 1200)
    return () => clearTimeout(t)
  }, [refresh])

  // ── Session expiry listener ────────────────────────────────
  useEffect(() => {
    const onExpired = () => {
      setUser(null)
      setSessionExpiredOpen(true)
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [])

  // ── Realtime: live users + page tracking ───────────────────
  const admin = isAdmin(user)
  const { stats, feed, alerts } = useRealtime({ page: route.path, asAdmin: admin })
  const liveCount = stats?.liveUsers ?? 0

  // ── Analytics page-view tracking (respects consent) ────────
  useEffect(() => {
    if (!sessionLoaded) return
    try {
      const consent = JSON.parse(localStorage.getItem('cookie-consent') || '{}')
      if (consent.analytics === false) return
    } catch { /* default allowed */ }
    const sid = localStorage.getItem('nihad_sid') || 'anon'
    const device = window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop'
    api('/api/analytics/view', {
      method: 'POST',
      body: { path: route.path, referrer: document.referrer, sessionId: sid, device },
    }).catch(() => {})
  }, [route.path, sessionLoaded])

  // ── Service worker (offline fallback; network-first, no cache interference) ──
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  // ── Keyboard shortcut: Ctrl/Cmd+K command palette ──────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCmdOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Maintenance gate ───────────────────────────────────────
  const maintenance = settings.maintenanceMode === 'true' && !admin

  const sessionValue = {
    user,
    setUser,
    refresh,
    loaded: sessionLoaded,
  }
  const settingsValue = {
    settings,
    updateSettings: (s: SiteSettings) => setSettings((prev) => ({ ...prev, ...s })),
  }

  if (maintenance) {
    return (
      <SessionContext.Provider value={sessionValue}>
        <SettingsContext.Provider value={settingsValue}>
          <MaintenanceView message={settings.maintenanceMessage} />
        </SettingsContext.Provider>
      </SessionContext.Provider>
    )
  }

  return (
    <SessionContext.Provider value={sessionValue}>
      <SettingsContext.Provider value={settingsValue}>
        <LiveUsersProvider stats={stats}>
          <RealtimeFeedProvider feed={feed} alerts={alerts}>
          <div className="min-h-screen flex flex-col">
            {chrome && (
              <SiteNav
                route={route}
                announcement={settings.announcement}
                onCommand={() => setCmdOpen(true)}
              />
            )}
            <main id="main-content" className="flex-1 flex flex-col">
              <Suspense fallback={<RouteFallback />}>
                {children}
              </Suspense>
            </main>
            {chrome && <SiteFooter />}
            {chrome && <BottomNav route={route} />}
            {chrome && <CookieConsent />}
            <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />
            <SessionExpiredModal
              open={sessionExpiredOpen}
              onClose={() => setSessionExpiredOpen(false)}
              onLogin={() => {
                setSessionExpiredOpen(false)
                window.location.href = '/login'
              }}
            />
            <OfflineBanner />
          </div>
          </RealtimeFeedProvider>
        </LiveUsersProvider>
      </SettingsContext.Provider>
    </SessionContext.Provider>
  )
}

export { RouteFallback }
