'use client'

// Admin shell — sidebar navigation + section routing. Owns realtime alerts & feed.
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Newspaper, ShoppingBag, Briefcase, Inbox, MessageSquare, Users,
  MailCheck, ChartLine, LifeBuoy, Settings, LogOut, Bell, Menu, ExternalLink,
  Radio, Megaphone, Images, Sticker, ClipboardList, PanelBottom, TerminalSquare,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { navigate } from '@/hooks/use-hash-router'
import { api } from '@/lib/api-client'
import { useSession } from '@/components/site/site-context'
import { useSeo } from '@/hooks/use-seo'
import { ADMIN_ROUTES } from '@/lib/constants'
import type { ActivityEntry, AdminAlert } from '@/hooks/use-realtime'
import AdminDashboard from '@/components/views/admin/admin-dashboard'
import AdminPosts from '@/components/views/admin/admin-posts'
import AdminProducts from '@/components/views/admin/admin-products'
import AdminAds from '@/components/views/admin/admin-ads'
import AdminMarquee from '@/components/views/admin/admin-marquee'
import AdminMedia from '@/components/views/admin/admin-media'
import AdminServices from '@/components/views/admin/admin-services'
import AdminInquiries from '@/components/views/admin/admin-inquiries'
import AdminSubmissions from '@/components/views/admin/admin-submissions'
import AdminComments from '@/components/views/admin/admin-comments'
import AdminUsers from '@/components/views/admin/admin-users'
import AdminSubscribers from '@/components/views/admin/admin-subscribers'
import AdminAnalytics from '@/components/views/admin/admin-analytics'
import AdminFooter from '@/components/views/admin/admin-footer'
import AdminSupport from '@/components/views/admin/admin-support'
import AdminSettings from '@/components/views/admin/admin-settings'

const SECTION_ICONS: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard, newspaper: Newspaper, 'shopping-bag': ShoppingBag,
  megaphone: Megaphone, images: Images, sticker: Sticker, 'clipboard-list': ClipboardList,
  'panel-bottom': PanelBottom,
  briefcase: Briefcase, inbox: Inbox, 'message-square': MessageSquare, users: Users,
  'mail-check': MailCheck, 'chart-line': ChartLine, 'life-buoy': LifeBuoy, settings: Settings,
}

export default function AdminView({
  section, sub, onAlerts, feed,
}: {
  section: string
  sub?: string
  onAlerts: AdminAlert[]
  feed: ActivityEntry[]
}) {
  const { user, setUser } = useSession()
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)

  useSeo({ title: `Admin & Developer — ${section}`, description: 'Admin & Developer control center', path: `/admin/${section}`, noindex: true }, [section])

  // Toast on new alerts (ref tracks previous count — no initial toast)
  const seenRef = useRef(0)
  useEffect(() => {
    const count = onAlerts.length
    if (count > seenRef.current && seenRef.current > 0) {
      const latest = onAlerts[0]
      toast({ title: 'Live update', description: latest.message })
    }
    seenRef.current = count
  }, [onAlerts, toast])

  const logout = async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
    navigate('/')
  }

  const go = (path: string) => {
    navigate(path)
    setSidebarOpen(false)
  }

  const renderSection = () => {
    switch (section) {
      case 'dashboard': return <AdminDashboard feed={feed} alerts={onAlerts} />
      case 'posts': return <AdminPosts editId={sub} />
      case 'products': return <AdminProducts />
      case 'ads': return <AdminAds />
      case 'marquee': return <AdminMarquee />
      case 'media': return <AdminMedia />
      case 'services': return <AdminServices />
      case 'inquiries': return <AdminInquiries />
      case 'submissions': return <AdminSubmissions />
      case 'comments': return <AdminComments />
      case 'users': return <AdminUsers />
      case 'subscribers': return <AdminSubscribers />
      case 'analytics': return <AdminAnalytics />
      case 'footer': return <AdminFooter />
      case 'support': return <AdminSupport />
      case 'settings': return <AdminSettings />
      default: return <AdminDashboard feed={feed} alerts={onAlerts} />
    }
  }

  const sidebar = (
    <nav className="flex flex-col h-full" aria-label="Admin sections">
      <div className="p-4 border-b border-border/60">
        <button onClick={() => go('/admin')} className="flex items-center gap-2.5 w-full text-left">
          <span className="grid place-items-center size-9 rounded-xl bg-primary text-primary-foreground font-display font-bold text-[11px] glow-sm">MN</span>
          <span>
            <span className="block font-display font-semibold text-sm leading-tight">Admin &amp; Developer</span>
            <span className="block text-[11px] text-muted-foreground">MN.KP control center</span>
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-slim p-3 space-y-0.5">
        {ADMIN_ROUTES.map((r) => {
          const Icon = SECTION_ICONS[r.icon] || LayoutDashboard
          const active = section === r.path.split('/')[2]
          return (
            <button
              key={r.path}
              onClick={() => go(r.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active ? 'bg-primary/12 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="size-4" aria-hidden />
              {r.label}
            </button>
          )
        })}
      </div>

      <div className="p-3 border-t border-border/60 space-y-1">
        <button
          onClick={() => go('/')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60"
        >
          <ExternalLink className="size-4" aria-hidden /> View live site
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive"
        >
          <LogOut className="size-4" aria-hidden /> Sign out
        </button>
      </div>
    </nav>
  )

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 shrink-0 border-r border-border/60 bg-sidebar sticky top-0 h-screen">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-border lg:hidden"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 glass border-b border-border/60 h-14 px-3 sm:px-5 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden grid place-items-center size-9 rounded-xl hover:bg-muted text-muted-foreground"
            aria-label="Open admin menu"
          >
            <Menu className="size-5" />
          </button>
          <h1 className="font-display font-semibold capitalize text-sm sm:text-base truncate flex items-center gap-2">
            <TerminalSquare className="size-4 text-primary hidden sm:block" aria-hidden />
            {section === 'dashboard' ? 'Admin & Developer' : section.replace('-', ' ')}
          </h1>
          <div className="flex-1" />

          {/* Alert bell */}
          <div className="relative">
            <button
              onClick={() => setBellOpen((o) => !o)}
              className="relative grid place-items-center size-9 rounded-xl hover:bg-muted text-muted-foreground"
              aria-label={`Notifications (${onAlerts.length})`}
            >
              <Bell className="size-4.5" />
              {onAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 grid place-items-center size-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                  {Math.min(onAlerts.length, 9)}
                </span>
              )}
            </button>
            <AnimatePresence>
              {bellOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border border-border bg-popover shadow-2xl z-40 overflow-hidden"
                >
                  <div className="p-3 border-b border-border/60 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live alerts</p>
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <Radio className="size-2.5 animate-pulse" /> realtime
                    </Badge>
                  </div>
                  <div className="max-h-72 overflow-y-auto scrollbar-slim divide-y divide-border/40">
                    {onAlerts.length === 0 ? (
                      <p className="p-4 text-xs text-muted-foreground text-center">No alerts yet — they appear here the moment something happens on the site.</p>
                    ) : (
                      onAlerts.slice(0, 12).map((a, i) => (
                        <div key={`${a.at}-${i}`} className="p-3.5">
                          <p className="text-sm">{a.message}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">{new Date(a.at).toLocaleTimeString('en-IN')}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border/60">
            <span className="grid place-items-center size-7 rounded-full bg-primary/15 text-primary text-xs font-bold">
              {(user?.name || 'A')[0].toUpperCase()}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-28">{user?.name}</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6 w-full max-w-6xl mx-auto">
          {renderSection()}
        </main>
      </div>
    </div>
  )
}
