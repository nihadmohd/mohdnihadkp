'use client'

// Admin analytics — traffic charts (recharts), top content, referrers, devices
import { useCallback, useEffect, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { ChartLine, Eye, Users2, RefreshCw, MousePointerClick, Newspaper, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface Summary {
  stats: Record<string, number>
  series: { date: string; views: number; sessions: number }[]
  topPages: { path: string; count: number }[]
  devices: { device: string; count: number }[]
  topReferrers: { host: string; count: number }[]
  topProducts: { name: string; clicks: number; category: string }[]
  popularPosts: { title: string; views: number; slug: string }[]
}

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']

export default function AdminAnalytics() {
  const [data, setData] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api<Summary>('/api/analytics/summary')
      setData(res)
    } catch (err) {
      toast({ title: 'Failed to load analytics', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  if (loading && !data) {
    return (
      <div className="grid place-items-center py-24">
        <div className="text-center space-y-3">
          <Loader2 className="size-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Crunching your traffic data…</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { stats, series, topPages, devices, topReferrers, topProducts, popularPosts } = data
  const totalDevices = devices.reduce((s, d) => s + d.count, 0) || 1

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight flex items-center gap-2">
            <ChartLine className="size-5 text-primary" /> Analytics
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Traffic, content performance and affiliate clicks — all time.</p>
        </div>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { label: 'Total views', value: stats.totalViews, icon: Eye },
          { label: 'Unique visitors', value: stats.uniqueVisitors, icon: Users2 },
          { label: 'Published posts', value: stats.publishedCount, icon: Newspaper },
          { label: 'Newsletter subs', value: stats.subscriberCount, icon: MousePointerClick },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <s.icon className="size-4.5 text-muted-foreground" />
              <p className="font-display font-bold text-2xl mt-2 tabular-nums">
                {Intl.NumberFormat('en', { notation: 'compact' }).format(s.value)}
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Traffic chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Traffic — last 7 days</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <ReTooltip
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#viewGrad)" name="Views" />
                <Area type="monotone" dataKey="sessions" stroke="hsl(var(--chart-2))" strokeWidth={2} fillOpacity={0.08} fill="hsl(var(--chart-2))" name="Unique sessions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Top pages */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top pages (all time)</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 space-y-3">
            {topPages.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No page views recorded yet.</p>
            ) : (
              topPages.map((p) => {
                const max = topPages[0].count
                return (
                  <div key={p.path} className="flex items-center gap-3">
                    <code className="text-xs bg-muted rounded-lg px-2.5 py-1.5 min-w-0 truncate flex-1">{p.path}</code>
                    <div className="h-2 rounded-full bg-muted overflow-hidden w-20 sm:w-28 shrink-0" aria-hidden>
                      <div className="h-full rounded-full bg-primary" style={{ width: `${(p.count / max) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold tabular-nums w-10 text-right shrink-0">{p.count}</span>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Devices</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {totalDevices <= 1 && devices.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">Device data appears with traffic.</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={devices}
                      dataKey="count"
                      nameKey="device"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={4}
                      strokeWidth={0}
                    >
                      {devices.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <ReTooltip
                      contentStyle={{
                        background: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      formatter={(v) => <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>{v}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referrers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Where visitors come from</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {topReferrers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">Referrer data appears with traffic.</p>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topReferrers} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="host" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={90} axisLine={false} tickLine={false} />
                    <ReTooltip
                      contentStyle={{
                        background: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0, 6, 6, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular posts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Most-read articles</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 space-y-2.5">
            {popularPosts.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">Publish posts to see readership here.</p>
            ) : (
              popularPosts.map((p, i) => (
                <button
                  key={p.slug}
                  onClick={() => router.push(`/blog/${p.slug}`)}
                  className="w-full group flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-muted/60 text-left"
                >
                  <span className="font-display font-bold text-sm text-primary/50 w-5 shrink-0">{i + 1}</span>
                  <span className="text-sm truncate flex-1">{p.title}</span>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">{p.views} views</span>
                  <ArrowRight className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Affiliate clicks */}
      {topProducts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MousePointerClick className="size-4 text-primary" /> Affiliate clicks (top products)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <ReTooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
