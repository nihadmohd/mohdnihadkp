'use client'

// Admin marquee — manages the scrolling image strip shown on
// home / blog / store. Live preview of the actual strip.
import { useCallback, useEffect, useState } from 'react'
import {
  Plus, Trash2, Loader2, Images, ArrowUp, ArrowDown, Power, Link2, ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { EmptyView } from '@/components/views/states'
import { invalidateMarqueeCache } from '@/components/shared/marquee-strip'

interface MarqueeRow {
  id: string
  title: string | null
  imageUrl: string
  linkUrl: string | null
  badge: string | null
  active: boolean
  sortOrder: number
}

export default function AdminMarquee() {
  const [items, setItems] = useState<MarqueeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', imageUrl: '', linkUrl: '', badge: '' })
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api<{ items: MarqueeRow[] }>('/api/marquee?admin=true')
      setItems(res.items)
    } catch (err) {
      toast({ title: 'Failed to load', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const save = async () => {
    if (saving) return
    setSaving(true)
    try {
      await api('/api/marquee', { method: 'POST', body: { ...form, sortOrder: items.length + 1 } })
      toast({ title: 'Added to marquee', description: 'It scrolls on home, blog and store immediately.' })
      invalidateMarqueeCache()
      setOpen(false)
      setForm({ title: '', imageUrl: '', linkUrl: '', badge: '' })
      load()
    } catch (err) {
      toast({ title: 'Could not save', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const patch = async (item: MarqueeRow, data: Partial<MarqueeRow>) => {
    try {
      await api(`/api/marquee/${item.id}`, { method: 'PATCH', body: data })
      setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, ...data } : x)))
      invalidateMarqueeCache()
    } catch (err) {
      toast({ title: 'Could not update', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const remove = async (item: MarqueeRow) => {
    try {
      await api(`/api/marquee/${item.id}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((x) => x.id !== item.id))
      invalidateMarqueeCache()
      toast({ title: 'Removed', description: `${item.title || 'Item'} no longer scrolls.` })
    } catch (err) {
      toast({ title: 'Could not delete', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const move = async (index: number, dir: -1 | 1) => {
    const next = items[index + dir]
    if (!next) return
    const a = items[index]
    const updated = [...items]
    updated[index] = next
    updated[index + dir] = a
    setItems(updated)
    try {
      await Promise.all([
        api(`/api/marquee/${a.id}`, { method: 'PATCH', body: { sortOrder: next.sortOrder } }),
        api(`/api/marquee/${next.id}`, { method: 'PATCH', body: { sortOrder: a.sortOrder } }),
      ])
      invalidateMarqueeCache()
    } catch { load() }
  }

  const activeItems = items.filter((i) => i.active)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">Scrolling images</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            The auto-scrolling strip on home, blog and store — add images, badges and links. Changes are live instantly.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add image
        </Button>
      </div>

      {/* Live preview */}
      {activeItems.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3 flex items-center gap-1.5">
            <Images className="size-3" aria-hidden /> Live preview
          </p>
          <div className="overflow-hidden">
            <div className="flex gap-2 w-max animate-marquee-items" style={{ '--marquee-duration': '22s' } as React.CSSProperties}>
              {[...activeItems, ...activeItems].map((m, i) => (
                <div key={`${m.id}-p-${i}`} className="relative shrink-0 w-32 aspect-[16/10] rounded-lg overflow-hidden bg-muted">
                  { }
                  <img src={m.imageUrl} alt={m.title || ''} className="size-full object-cover" />
                  {m.badge && (
                    <span className="absolute top-1 left-1 rounded-full bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5">{m.badge}</span>
                  )}
                  {m.title && (
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent pt-4 pb-1 px-1.5 text-[10px] text-white text-center truncate">{m.title}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <EmptyView
          title="No scrolling images"
          message="Add images to the strip — they scroll across the home, blog and store pages."
          icon={<Images className="size-7 text-muted-foreground" />}
          action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="size-4" /> Add image</Button>}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <ul className="divide-y divide-border/40">
            {items.map((m, i) => (
              <li key={m.id} className={`flex items-center gap-3.5 p-3.5 ${!m.active ? 'opacity-50' : ''}`}>
                <div className="relative w-24 aspect-[16/10] rounded-lg overflow-hidden bg-muted shrink-0">
                  { }
                  <img src={m.imageUrl} alt={m.title || ''} loading="lazy" className="size-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{m.title || <span className="text-muted-foreground italic">Untitled image</span>}</p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{m.imageUrl}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {m.badge && <Badge className="text-[9px] h-4">{m.badge}</Badge>}
                    {m.linkUrl && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-primary truncate max-w-40">
                        <Link2 className="size-3 shrink-0" aria-hidden /> {m.linkUrl}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="flex flex-col">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="grid place-items-center size-6 rounded text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Move up">
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="grid place-items-center size-6 rounded text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Move down">
                      <ArrowDown className="size-3.5" />
                    </button>
                  </div>
                  <Switch checked={m.active} onCheckedChange={(v) => patch(m, { active: v })} aria-label={`Toggle ${m.title || 'item'}`} />
                  <Button size="sm" variant="outline" className="h-7 px-2 hover:border-destructive/50 hover:text-destructive" onClick={() => remove(m)} aria-label="Delete">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add scrolling image</DialogTitle>
            <DialogDescription>It joins the strip on home, blog and store immediately.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="mq-url">Image URL</Label>
              <Input id="mq-url" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://… or /marquee-new.png" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="mq-title">Title (optional)</Label>
                <Input id="mq-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="New venture" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mq-badge">Badge (optional)</Label>
                <Input id="mq-badge" value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} placeholder="New / Hot" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mq-link">Links to (optional)</Label>
              <Input id="mq-link" value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))} placeholder="/blog, /store or https://…" />
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ExternalLink className="size-3" aria-hidden /> Internal paths navigate in-page; https links open in a new tab.
              </p>
            </div>
            {form.imageUrl && (
              <div className="rounded-xl border border-border bg-muted aspect-[16/10] grid place-items-center overflow-hidden">
                { }
                <img src={form.imageUrl} alt="Preview" className="size-full object-cover" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving || !form.imageUrl}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add to strip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
