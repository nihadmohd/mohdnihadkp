'use client'

// Admin ventures — full CRUD for the KP Foundation ecosystem
// (create, re-EDIT, delete, reorder, toggle). Everything the
// admin adds can be re-edited at any time.
import { useCallback, useEffect, useState } from 'react'
import {
  Plus, Trash2, Loader2, Network, ArrowUp, ArrowDown, Power, Pencil,
  ExternalLink, Link2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { EmptyView } from '@/components/views/states'

interface VentureRow {
  id: string
  name: string
  tagline: string | null
  description: string
  href: string | null
  icon: string
  accent: string
  badge: string | null
  active: boolean
  sortOrder: number
}

const ICON_OPTIONS = [
  { value: 'foundation', label: 'Foundation (flagship)' },
  { value: 'store', label: 'Store' },
  { value: 'connect', label: 'Connect' },
  { value: 'gold', label: 'Gold' },
  { value: 'study', label: 'Study' },
  { value: 'globe', label: 'Globe' },
]
const ACCENT_OPTIONS = ['emerald', 'amber', 'teal', 'yellow', 'lime']

const EMPTY_FORM = {
  name: '', tagline: '', description: '', href: '', badge: '',
  icon: 'globe', accent: 'emerald',
}

export default function AdminVentures() {
  const [items, setItems] = useState<VentureRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<VentureRow | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api<{ ventures: VentureRow[] }>('/api/ventures?admin=true')
      setItems(res.ventures)
    } catch (err) {
      toast({ title: 'Failed to load', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  const openEdit = (v: VentureRow) => {
    setEditing(v)
    setForm({
      name: v.name,
      tagline: v.tagline || '',
      description: v.description || '',
      href: v.href || '',
      badge: v.badge || '',
      icon: v.icon,
      accent: v.accent,
    })
    setOpen(true)
  }

  const save = async () => {
    if (saving) return
    setSaving(true)
    try {
      if (editing) {
        await api(`/api/ventures/${editing.id}`, { method: 'PUT', body: form })
        toast({ title: 'Venture updated', description: `${form.name} is live with the new details.` })
      } else {
        await api('/api/ventures', { method: 'POST', body: { ...form, sortOrder: items.length + 1 } })
        toast({ title: 'Venture added', description: `${form.name} now appears on the Ventures page.` })
      }
      setOpen(false)
      setForm(EMPTY_FORM)
      setEditing(null)
      load()
    } catch (err) {
      toast({ title: 'Could not save', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (v: VentureRow) => {
    if (!confirm(`Delete "${v.name}"? This cannot be undone.`)) return
    try {
      await api(`/api/ventures/${v.id}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((x) => x.id !== v.id))
      toast({ title: 'Venture deleted', description: `${v.name} removed from the ecosystem.` })
    } catch (err) {
      toast({ title: 'Could not delete', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const toggleActive = async (v: VentureRow) => {
    const next = !v.active
    try {
      await api(`/api/ventures/${v.id}`, { method: 'PUT', body: { active: next } })
      setItems((prev) => prev.map((x) => (x.id === v.id ? { ...x, active: next } : x)))
    } catch (err) {
      toast({ title: 'Could not update', description: (err as Error).message, variant: 'destructive' })
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
        api(`/api/ventures/${a.id}`, { method: 'PUT', body: { sortOrder: next.sortOrder } }),
        api(`/api/ventures/${next.id}`, { method: 'PUT', body: { sortOrder: a.sortOrder } }),
      ])
      load()
    } catch { load() }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">Ventures</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            The KP Foundation ecosystem on the public Ventures page — add, re-edit, reorder or remove any venture. Changes are live instantly.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" /> Add venture
        </Button>
      </div>

      {loading && items.length === 0 ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <EmptyView
          title="No ventures yet"
          message="Add the first venture of the KP Foundation ecosystem — it shows up on the public Ventures page immediately."
          icon={<Network className="size-7 text-muted-foreground" />}
          action={<Button size="sm" onClick={openCreate}><Plus className="size-4" /> Add venture</Button>}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <ul className="divide-y divide-border/40">
            {items.map((v, i) => (
              <li key={v.id} className={`flex items-center gap-3.5 p-3.5 ${!v.active ? 'opacity-50' : ''}`}>
                <span className="grid place-items-center size-10 rounded-xl bg-primary/12 text-primary font-display font-bold shrink-0">
                  {v.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">{v.name}</p>
                    {v.badge && <Badge className="text-[9px] h-4">{v.badge}</Badge>}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{v.tagline || '—'}</p>
                  <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5 max-w-md hidden sm:block">{v.description}</p>
                  {v.href && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-primary truncate max-w-40 mt-0.5">
                      <Link2 className="size-3 shrink-0" aria-hidden /> {v.href}
                    </span>
                  )}
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
                  <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => openEdit(v)} aria-label={`Edit ${v.name}`}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Switch checked={v.active} onCheckedChange={() => toggleActive(v)} aria-label={`Toggle ${v.name}`} />
                  <Button size="sm" variant="outline" className="h-7 px-2 hover:border-destructive/50 hover:text-destructive" onClick={() => remove(v)} aria-label={`Delete ${v.name}`}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto scrollbar-slim">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit — ${editing.name}` : 'Add venture'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Re-edit anything: name, tagline, description, link, badge and styling.'
                : 'A new venture joins the KP Foundation ecosystem page immediately.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="v-name">Name *</Label>
              <Input id="v-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Calicut Store" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-tagline">Tagline</Label>
              <Input id="v-tagline" value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} placeholder="Local commerce, online" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-desc">Description</Label>
              <Textarea id="v-desc" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What this venture does — one or two sentences." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="v-badge">Badge</Label>
                <Input id="v-badge" value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} placeholder="Live / Flagship" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="v-link">Link</Label>
                <Input id="v-link" value={form.href} onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))} placeholder="https://… or /store" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Icon</Label>
                <Select value={form.icon} onValueChange={(v) => setForm((f) => ({ ...f, icon: v }))}>
                  <SelectTrigger aria-label="Icon"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Accent</Label>
                <Select value={form.accent} onValueChange={(v) => setForm((f) => ({ ...f, accent: v }))}>
                  <SelectTrigger aria-label="Accent"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACCENT_OPTIONS.map((a) => (
                      <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.href && /^https?:\/\//i.test(form.href) && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ExternalLink className="size-3" aria-hidden /> External links open in a new tab on the public page.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving || form.name.trim().length < 2}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : editing ? <Pencil className="size-4" /> : <Plus className="size-4" />}
              {editing ? 'Save changes' : 'Add venture'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
