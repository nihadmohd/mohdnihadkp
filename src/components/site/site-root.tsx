'use client'

// ─────────────────────────────────────────────────────────────
// SiteRoot — SPA orchestrator: hash router, SEO, realtime,
// overlays (maintenance / offline / session expiry), shell.
// ─────────────────────────────────────────────────────────────
import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { useHashRouter, navigate } from '@/hooks/use-hash-router'
import { useRealtime } from '@/hooks/use-realtime'
import { useSeo } from '@/hooks/use-seo'
import { api, SESSION_EXPIRED_EVENT } from '@/lib/api-client'
import { SITE } from '@/lib/constants'
import { personJsonLd, websiteJsonLd } from '@/lib/seo'
import { getLegalDoc } from '@/lib/legal-content'
import {
  SessionContext, SettingsContext, isAdmin,
  type SessionUser, type SiteSettings,
} from '@/components/site/site-context'
import { SiteNav } from '@/components/site/nav'
import { BottomNav } from '@/components/site/bottom-nav'
import { SiteFooter } from '@/components/site/footer'
import { LiveUsersProvider } from '@/components/site/live-badge'
import { CookieConsent } from '@/components/site/cookie-consent'
import { CommandPalette } from '@/components/site/command-palette'
import { SessionExpiredModal, OfflineBanner } from '@/components/site/overlays'
import {
  NotFoundView, ForbiddenView, MaintenanceView, ErrorView, EmptyView,
} from '@/components/views/states'

const HomeView = lazy(() => import('@/components/views/home-view'))
const BlogView = lazy(() => import('@/components/views/blog-view'))
const BlogPostView = lazy(() => import('@/components/views/blog-post-view'))
const StoreView = lazy(() => import('@/components/views/store-view'))
const ProductDetailView = lazy(() => import('@/components/views/product-detail-view'))
const ServicesView = lazy(() => import('@/components/views/services-view'))
const AboutView = lazy(() => import('@/components/views/about-view'))
const VenturesView = lazy(() => import('@/components/views/ventures-view'))
const ContactView = lazy(() => import('@/components/views/contact-view'))
const SearchView = lazy(() => import('@/components/views/search-view'))
const MoreView = lazy(() => import('@/components/views/more-view'))
const LegalView = lazy(() => import('@/components/views/legal-view'))
const AuthViews = lazy(() => import('@/components/views/auth/auth-views'))
const AccountView = lazy(() => import('@/components/views/auth/account-view'))
const BillingView = lazy(() => import('@/components/views/auth/billing-view'))
const SupportView = lazy(() => import('@/components/views/auth/support-view'))
const HelpView = lazy(() => import('@/components/views/auth/help-view'))
const OnboardingView = lazy(() => import('@/components/views/auth/onboarding-view'))
const AdminView = lazy(() => import('@/components/views/admin/admin-view'))

export interface InitialData {
  settings: Record<string, string>
  services: Array<Record<string, unknown>>
  featuredPosts: Array<Record<string, unknown>>
  latestPosts: Array<Record<string, unknown>>
  featuredProducts: Array<Record<string, unknown>>
}

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

export default function SiteRoot({ initial }: { initial: InitialData }) {
  const route = useHashRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [sessionLoaded, setSessionLoaded] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>({ ...initial.settings })
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false)
  const [fatalError, setFatalError] = useState<Error | null>(null)
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

  // ── Route-level SEO defaults (views override with specifics) ─
  const seo = useMemo(() => {
    const [head, second] = route.segments
    switch (head) {
      case undefined:
        return {
          title: settings.seoTitle || `${SITE.name} — ${SITE.tagline}`,
          description: settings.seoDescription || SITE.description,
          path: '/',
          jsonLd: { '@context': 'https://schema.org', '@graph': [personJsonLd(), websiteJsonLd()] },
        }
      case 'blog':
        return second
          ? { title: 'Article', description: SITE.description, path: route.path, type: 'article' as const }
          : { title: 'Blog — AI, Building & Business', description: 'Articles on AI-powered development, freelancing, creative media and business from Calicut, Kerala.', path: '/blog' }
      case 'store':
        return { title: 'Store — Curated Tools & Gear', description: 'Affiliate picks: the tools, hosting, gear and apps I actually use in my AI-powered workflow.', path: '/store' }
      case 'services':
        return { title: 'Services — Photography, Video, AI Development', description: 'Photography, videography, AI-driven web/app development, marketing and creative media services by Mohammed Nihad KP.', path: '/services' }
      case 'about':
        return { title: 'About — My Story & Vision', description: 'Freelancer, businessman and AI-driven developer from Calicut. My journey, skills, and the 195-country vision.', path: '/about' }
      case 'ventures':
        return { title: 'Ventures — KP Foundation Ecosystem', description: 'KP Foundation, Calicut Store, Chaliyam Connect, Calicut Gold and PolyStudy — one foundation, many ventures.', path: '/ventures' }
      case 'contact':
        return { title: 'Contact — Let\u2019s Build Something', description: 'Get in touch for projects, collaborations or just to say hello.', path: '/contact' }
      default:
        return { title: SITE.name, description: SITE.description, path: route.path }
    }
  }, [route.path, route.segments, settings.seoTitle, settings.seoDescription])

  useSeo(seo, [seo.title, seo.description])

  // ── Error boundary ─────────────────────────────────────────
  useEffect(() => {
    setFatalError(null)
  }, [route.path])

  // ── Maintenance gate ───────────────────────────────────────
  const maintenance = settings.maintenanceMode === 'true' && !admin

  const sessionValue = useMemo(
    () => ({ user, setUser, refresh }),
    [user, refresh]
  )
  const settingsValue = useMemo(
    () => ({ settings, updateSettings: (s: SiteSettings) => setSettings((prev) => ({ ...prev, ...s })) }),
    [settings]
  )

  const hideChrome = route.segments[0] === 'admin' // admin has its own chrome

  // ── Route switch ───────────────────────────────────────────
  const content = useMemo(() => {
    const [head, second, third] = route.segments

    if (fatalError) return <ErrorView error={fatalError} reset={() => setFatalError(null)} />

    switch (head) {
      case undefined:
        return <HomeView initial={initial} />
      case 'blog':
        if (second) return <BlogPostView slug={second} />
        return <BlogView />
      case 'store':
        if (second === 'item' && third) return <ProductDetailView slug={third} />
        return <StoreView initial={initial.featuredProducts} />
      case 'services':
        return <ServicesView initial={initial.services} />
      case 'about':
        return <AboutView />
      case 'ventures':
        return <VenturesView />
      case 'contact':
        return <ContactView />
      case 'search':
        return <SearchView query={route.query.q || ''} />
      case 'more':
        return <MoreView />
      case 'legal': {
        if (second) {
          const doc = getLegalDoc(second)
          if (doc) return <LegalView slug={second} />
          return <NotFoundView />
        }
        return <LegalView slug="privacy-policy" />
      }
      case 'login':
      case 'register':
      case 'verify-email':
      case 'forgot-password':
      case 'reset-password':
        return <AuthViews view={head} token={route.query.token} />
      case 'onboarding':
        return <OnboardingView />
      case 'account':
        return <AccountView />
      case 'billing':
        return <BillingView />
      case 'support':
        return <SupportView />
      case 'help':
        return <HelpView />
      case 'admin':
        if (!sessionLoaded) return <RouteFallback />
        if (!user) return <ForbiddenView code={401} message="Sign in required" showLogin />
        if (!admin) return <ForbiddenView code={403} message="This area is for the site administrator." />
        return <AdminView section={second || 'dashboard'} sub={third} onAlerts={alerts} feed={feed} />
      default:
        return <NotFoundView />
    }
  }, [route, initial, fatalError, sessionLoaded, user, admin, alerts, feed])

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
          <div className="min-h-screen flex flex-col">
            {!hideChrome && (
              <SiteNav
                route={route}
                announcement={settings.announcement}
                onCommand={() => setCmdOpen(true)}
              />
            )}
            <main id="main-content" className="flex-1 flex flex-col">
              <Suspense fallback={<RouteFallback />}>
                {content}
              </Suspense>
            </main>
            {!hideChrome && <SiteFooter />}
            {!hideChrome && <BottomNav route={route} />}
            {!hideChrome && <CookieConsent />}
            <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />
            <SessionExpiredModal
              open={sessionExpiredOpen}
              onClose={() => setSessionExpiredOpen(false)}
              onLogin={() => {
                setSessionExpiredOpen(false)
                navigate('/login')
              }}
            />
            <OfflineBanner />
          </div>
        </LiveUsersProvider>
      </SettingsContext.Provider>
    </SessionContext.Provider>
  )
}

// EmptyView re-export so lazy views can import from one place
export { EmptyView }
