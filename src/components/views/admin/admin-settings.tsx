'use client'

// Admin settings — full site control: identity, announcement, maintenance, live counter, SEO
import { useCallback, useEffect, useState } from 'react'
import {
  Settings, Save, Loader2, Megaphone, Wrench, Radio, FileText, Search,
  ShieldCheck, Database, History, Paintbrush,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { useSiteSettings } from '@/components/site/site-context'

interface FullSettings {
  siteName: string
  tagline: string
  announcement: string
  maintenanceMode: string
  maintenanceMessage: string
  contactEmail: string
  whatsappNumber: string
  showLiveCounter: string
  blogEnabled: string
  storeEnabled: string
  seoTitle: string
  seoDescription: string
  footerNote: string
  defaultTheme: string
}

interface ActivityRow {
  id: string
  action: string
  meta: string | null
  createdAt: string
  user: { name: string | null; email: string } | null
}

export default function AdminSettings() {
  const [form, setForm] = useState<FullSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [activity, setActivity] = useState<ActivityRow[]>([])
  const { updateSettings } = useSiteSettings()
  const { toast } = useToast()

  const load = useCallback(async () => {
    try {
      const res = await api<{ settings: FullSettings }>('/api/settings')
      setForm(res.settings)
      const act = await api<{ activities: ActivityRow[] }>('/api/activity?limit=15')
      setActivity(act.activities)
    } catch (err) {
      toast({ title: 'Failed to load settings', description: (err as Error).message, variant: 'destructive' })
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  if (!form) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  const set = (k: keyof FullSettings, v: string) => setForm((f) => (f ? { ...f, [k]: v } : f))
  const flag = (k: keyof FullSettings) => form[k] === 'true'
  const toggle = (k: keyof FullSettings, v: boolean) => set(k, String(v))

  const save = async () => {
    setSaving(true)
    try {
      await api('/api/settings', { method: 'PUT', body: { settings: form } })
      updateSettings({ ...form } as Record<string, string | undefined>)
      toast({ title: 'Settings saved', description: 'Changes are live on the site right now.' })
    } catch (err) {
      toast({ title: 'Save failed', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="size-5 text-primary" /> Site settings
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Every change applies instantly across the whole site.</p>
        </div>
        <Button onClick={save} disabled={saving} className="glow-sm">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save all
        </Button>
      </div>

      {/* Danger zone first: maintenance */}
      <Card className="border-amber-500/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wrench className="size-4 text-amber-500" /> Maintenance mode
            <Badge variant="secondary" className="text-[10px] ml-auto">{flag('maintenanceMode') ? 'ON — visitors see the maintenance screen' : 'OFF'}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border p-3.5">
            <div>
              <Label htmlFor="st-maint" className="text-sm font-medium">Enable maintenance mode</Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">Takes the public site offline; you keep full access while logged in as admin.</p>
            </div>
            <Switch id="st-maint" checked={flag('maintenanceMode')} onCheckedChange={(v) => toggle('maintenanceMode', v)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="st-maint-msg">Maintenance message</Label>
            <Textarea id="st-maint-msg" value={form.maintenanceMessage} onChange={(e) => set('maintenanceMessage', e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* Announcement bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Megaphone className="size-4 text-primary" /> Announcement bar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="st-announce">Message (empty = hidden)</Label>
            <Input id="st-announce" value={form.announcement} onChange={(e) => set('announcement', e.target.value)} placeholder="e.g. New article: How I ship apps in days, not months" />
            <p className="text-[11px] text-muted-foreground">Shows as a highlighted strip on top of every page.</p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Paintbrush className="size-4 text-primary" /> Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="st-theme">Default Theme</Label>
            <select
              id="st-theme"
              value={form.defaultTheme || 'dark'}
              onChange={(e) => set('defaultTheme', e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="dark">Dark (Default)</option>
              <option value="light">Light</option>
              <option value="system">System (Auto)</option>
            </select>
            <p className="text-[11px] text-muted-foreground">The default color theme for new visitors.</p>
          </div>
        </CardContent>
      </Card>

      {/* Identity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="size-4 text-primary" /> Identity &amp; contact
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="st-name">Site name</Label>
            <Input id="st-name" value={form.siteName} onChange={(e) => set('siteName', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="st-tagline">Tagline</Label>
            <Input id="st-tagline" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="st-email">Contact email</Label>
            <Input id="st-email" type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="st-wa">WhatsApp number (with country code)</Label>
            <Input id="st-wa" value={form.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value)} placeholder="919846750898" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="st-footer">Footer note</Label>
            <Input id="st-footer" value={form.footerNote} onChange={(e) => set('footerNote', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Feature toggles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Radio className="size-4 text-primary" /> Features
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-3">
          <div className="flex items-center justify-between rounded-xl border border-border p-3.5">
            <div>
              <Label htmlFor="st-live" className="text-sm">Live visitor badge</Label>
              <p className="text-[11px] text-muted-foreground">Realtime counter in nav</p>
            </div>
            <Switch id="st-live" checked={flag('showLiveCounter')} onCheckedChange={(v) => toggle('showLiveCounter', v)} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3.5">
            <div>
              <Label htmlFor="st-blog" className="text-sm">Blog</Label>
              <p className="text-[11px] text-muted-foreground">Public listing</p>
            </div>
            <Switch id="st-blog" checked={flag('blogEnabled')} onCheckedChange={(v) => toggle('blogEnabled', v)} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3.5">
            <div>
              <Label htmlFor="st-store" className="text-sm">Store</Label>
              <p className="text-[11px] text-muted-foreground">Affiliate products</p>
            </div>
            <Switch id="st-store" checked={flag('storeEnabled')} onCheckedChange={(v) => toggle('storeEnabled', v)} />
          </div>
        </CardContent>
      </Card>

      {/* SEO defaults */}
      <Card className="border-primary/25">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Search className="size-4 text-primary" /> SEO defaults
            <Badge variant="secondary" className="text-[10px] ml-auto">homepage &amp; fallbacks</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="st-seo-title">Default meta title</Label>
            <Input id="st-seo-title" value={form.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} maxLength={70} />
            <p className="text-[11px] text-muted-foreground">{form.seoTitle.length}/70 — per-post SEO is set in the post editor.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="st-seo-desc">Default meta description</Label>
            <Textarea id="st-seo-desc" value={form.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} rows={3} maxLength={165} />
            <p className="text-[11px] text-muted-foreground">{form.seoDescription.length}/165 characters</p>
          </div>
        </CardContent>
      </Card>

      {/* Platform info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" /> Platform
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {[
            ['Framework', 'Next.js 16 (App Router) + React 19'],
            ['Styling', 'Tailwind CSS 4 + shadcn/ui'],
            ['Database', 'SQLite (dev) — swap DATABASE_URL to Neon/Supabase Postgres for production'],
            ['Realtime', 'socket.io service on port 3003 via gateway'],
            ['Auth', 'JWT httpOnly cookies + scrypt hashing'],
            ['SEO', 'Per-route meta, OG, JSON-LD, sitemap, robots'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-start gap-2.5">
              <Database className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-xs">{k}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{v}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Activity log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="size-4 text-primary" /> Recent activity log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="max-h-72 overflow-y-auto scrollbar-slim divide-y divide-border/40">
            {activity.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium truncate">{a.action}{a.meta ? ` — ${a.meta}` : ''}</span>
                  <span className="block text-[11px] text-muted-foreground truncate">{a.user?.name || a.user?.email || 'system'}</span>
                </span>
                <time className="text-[11px] text-muted-foreground shrink-0">
                  {new Date(a.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </time>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
