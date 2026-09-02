'use client'

// Admin dashboard — stat cards, live users (realtime), activity feed, quick actions
import { useCallback, useEffect, useState } from 'react'
import {
  Newspaper, Inbox, Users, Eye, MailCheck, MessageSquare, TrendingUp, ShoppingBag,
  Radio, Activity as ActivityIcon, PencilLine, Plus, LifeBuoy, FileEdit,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api-client'
import { navigate } from '@/hooks/use-hash-router'
import type { ActivityEntry, AdminAlert, LiveStats } from '@/hooks/use-realtime'
import { useLiveStats } from '@/components/site/live-badge'
import { StatsSkeleton } from '@/components/shared/section-heading'

interface Stats {
  newInquiries: number
  pendingComments: number
  drafts: number
  users: number
  posts: number
  products: number
  subscribers: number
  views: number
  openTickets: number
}

export default function AdminDashboard({ feed, alerts }: { feed: ActivityEntry[]; alerts: AdminAlert[] }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentActivity, setRecentActivity] = useState<Array<{ id: string; action: string; meta: string | null; createdAt: string; user: { name: string | null; email: string } | null }>>([])
  const live = useLiveStats()

  const load = useCallback(async () => {
    try {
      const [s, act] = await Promise.all([
        api<Stats>('/api/admin/stats'),
        api<{ activities: typeof recentActivity }>('/api/activity?limit=12'),
      ])
      setStats(s)
      setRecentActivity(act.activities)
    } catch { /* toast-less graceful */ }
  }, [])

  useEffect(() => {
    const raf = requestAnimationFrame(() => load())
    const t = setInterval(load, 30000)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(t)
    }
  }, [load])

  const cards = stats ? [
    { label: 'Live visitors', value: live?.liveUsers ?? 0, icon: Radio, accent: true, sub: `${live?.liveMobile ?? 0} mobile · ${live?.liveDesktop ?? 0} desktop`, live: true },
    { label: 'New inquiries', value: stats.newInquiries, icon: Inbox, sub: 'unread', link: '/admin/inquiries' },
    { label: 'Total views', value: stats.views, icon: Eye, sub: 'all time', link: '/admin/analytics' },
    { label: 'Published posts', value: stats.posts, icon: Newspaper, sub: `${stats.drafts} drafts`, link: '/admin/posts' },
    { label: 'Pending comments', value: stats.pendingComments, icon: MessageSquare, sub: 'awaiting approval', link: '/admin/comments' },
    { label: 'Members', value: stats.users, icon: Users, sub: 'registered accounts', link: '/admin/users' },
    { label: 'Subscribers', value: stats.subscribers, icon: MailCheck, sub: 'newsletter', link: '/admin/subscribers' },
    { label: 'Store products', value: stats.products, icon: ShoppingBag, sub: 'active', link: '/admin/products' },
    { label: 'Open tickets', value: stats.openTickets, icon: LifeBuoy, sub: 'support queue', link: '/admin/support' },
  ] : []

  return (
    <div className="space-y-6">
      {/* Greeting + quick actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Command center
            <span className="ml-3 inline-flex items-center gap-1.5 align-middle text-xs font-medium text-primary">
              <span className="size-1.5 rounded-full bg-primary animate-pulse-dot" aria-hidden />
              realtime
            </span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Everything on the site, live — refreshed the moment it happens.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate('/admin/posts?new=1')}>
            <Plus className="size-4" /> New post
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/admin/products')}>
            <Plus className="size-4" /> Product
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      {stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {cards.map((c) => {
            const Inner = (
              <Card className={`h-full transition-colors ${c.accent ? 'border-primary/40 bg-primary/8' : 'hover:border-primary/30'} ${c.link ? 'cursor-pointer' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <c.icon className={`size-4.5 ${c.accent ? 'text-primary' : 'text-muted-foreground'}`} />
                    {c.live && <Badge className="gap-1 text-[9px] h-4.5 px-1.5"><span className="size-1.5 rounded-full bg-primary-foreground animate-pulse" />LIVE</Badge>}
                  </div>
                  <p className={`font-display font-bold text-2xl sm:text-3xl mt-2.5 tabular-nums ${c.accent ? 'text-primary' : ''}`}>
                    {Intl.NumberFormat('en', { notation: 'compact' }).format(c.value)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">{c.sub}</p>
                </CardContent>
              </Card>
            )
            return c.link ? (
              <button key={c.label} onClick={() => navigate(c.link!)} className="text-left" aria-label={c.label}>{Inner}</button>
            ) : (
              <div key={c.label}>{Inner}</div>
            )
          })}
        </div>
      ) : (
        <StatsSkeleton />
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Live activity feed (socket) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ActivityIcon className="size-4 text-primary" /> Live activity
              <Badge variant="secondary" className="ml-auto text-[10px] gap-1">
                <span className="size-1.5 rounded-full bg-primary animate-pulse-dot" /> streaming
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="max-h-80 overflow-y-auto scrollbar-slim divide-y divide-border/40 text-sm">
              {feed.length === 0 ? (
                <li className="p-5 text-center text-muted-foreground text-xs">
                  Waiting for visitors… the feed fills as people browse (page views, devices, pages).
                </li>
              ) : (
                feed.slice(0, 18).map((e, i) => (
                  <li key={`${e.at}-${i}`} className="flex items-center gap-3 px-4 py-2.5">
                    <span className={`grid place-items-center size-7 rounded-lg shrink-0 ${e.type === 'visit' ? 'bg-primary/12 text-primary' : e.type === 'pageview' ? 'bg-muted text-muted-foreground' : 'bg-amber-500/12 text-amber-500'}`}>
                      <TrendingUp className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-xs">{e.page}</span>
                      <span className="block text-[11px] text-muted-foreground">{e.type} · {e.device}</span>
                    </span>
                    <time className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
                      {new Date(e.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </time>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Recent site activity (DB) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileEdit className="size-4 text-primary" /> Site log
              <button onClick={() => navigate('/admin/settings')} className="ml-auto text-xs text-muted-foreground hover:text-primary">
                full log →
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="max-h-80 overflow-y-auto scrollbar-slim divide-y divide-border/40 text-sm">
              {recentActivity.length === 0 ? (
                <li className="p-5 text-center text-muted-foreground text-xs">No recorded actions yet.</li>
              ) : (
                recentActivity.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="grid place-items-center size-7 rounded-lg bg-muted text-muted-foreground shrink-0">
                      <PencilLine className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium">{a.action}{a.meta ? ` — ${a.meta}` : ''}</span>
                      <span className="block text-[11px] text-muted-foreground truncate">{a.user?.name || a.user?.email || 'system'}</span>
                    </span>
                    <time className="text-[11px] text-muted-foreground shrink-0">
                      {new Date(a.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Live top pages (socket) */}
      {live && live.topPages.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="size-4 text-primary" /> Where live visitors are right now
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {live.topPages.map((p) => (
              <div key={p.page} className="flex items-center gap-3">
                <code className="text-xs bg-muted rounded-lg px-2.5 py-1.5 min-w-0 truncate flex-1">{p.page}</code>
                <div className="h-2 rounded-full bg-muted overflow-hidden w-24 sm:w-40 shrink-0" aria-hidden>
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${Math.min(100, (p.count / Math.max(...live.topPages.map((x) => x.count))) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold tabular-nums w-6 text-right shrink-0">{p.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
