'use client'

// Admin services — service offerings management
import { useCallback, useEffect, useState } from 'react'
import {
  Plus, Pencil, Trash2, Loader2, Save, X, Briefcase, Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { EmptyView } from '@/components/views/states'

interface ServiceRow {
  id: string
  title: string
  slug: string
  description: string
  icon: string
  features: string
  priceFrom: string | null
  active: boolean
  featured: boolean
  sortOrder: number
  inquiries: number
}

export default function AdminServices() {
  const [services, setServices] = useState<ServiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ServiceRow | null>(null)
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api<{ services: ServiceRow[] }>('/api/services?admin=true')
      setServices(res.services)
    } catch (err) {
      toast({ title: 'Failed to load', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const remove = async (s: ServiceRow) => {
    try {
      await api(`/api/services/${s.id}`, { method: 'DELETE' })
      setServices((prev) => prev.filter((x) => x.id !== s.id))
      toast({ title: 'Service removed', description: s.title })
    } catch (err) {
      toast({ title: 'Delete failed', description: (err as Error).message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">Services</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{services.length} offerings · {services.reduce((s, x) => s + x.inquiries, 0)} total inquiries</p>
        </div>
        <Button size="sm" className="glow-sm" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> Add service
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : services.length === 0 ? (
        <EmptyView
          title="No services yet"
          message="Add what you offer — each service gets its own inquiry button."
          icon={<Briefcase className="size-7 text-muted-foreground" />}
          action={<Button size="sm" onClick={() => setCreating(true)}><Plus className="size-4" /> Add first service</Button>}
        />
      ) : (
        <ul className="space-y-2.5">
          {services.map((s) => (
            <li key={s.id} className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{s.title}</p>
                  {s.featured && <Star className="size-3.5 text-amber-500 fill-current" />}
                  {!s.active && <Badge variant="secondary" className="text-[10px] text-amber-500 border-amber-500/30">hidden</Badge>}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 flex gap-2 flex-wrap">
                  <span>{s.priceFrom || 'no price set'}</span>
                  <span>· {s.inquiries} inquiries</span>
                  <span>· order {s.sortOrder}</span>
                </p>
              </div>
              <div className="flex gap-1.5">
                <Button size="icon" variant="ghost" className="size-8" aria-label="Edit" onClick={() => setEditing(s)}>
                  <Pencil className="size-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="size-8 text-destructive" aria-label="Delete">
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove “{s.title}”?</AlertDialogTitle>
                      <AlertDialogDescription>Related inquiries will be kept but unlinked.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep it</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove(s)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(creating || editing) && (
        <ServiceDialog
          service={editing}
          onClose={() => { setCreating(false); setEditing(null); load() }}
        />
      )}
    </div>
  )
}

function ServiceDialog({ service, onClose }: { service: ServiceRow | null; onClose: () => void }) {
  const [form, setForm] = useState({
    title: service?.title || '',
    description: service?.description || '',
    icon: service?.icon || 'sparkles',
    features: service?.features || '',
    priceFrom: service?.priceFrom || '',
    sortOrder: String(service?.sortOrder ?? 0),
    active: service?.active ?? true,
    featured: service?.featured ?? false,
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      const body = { ...form, sortOrder: Number(form.sortOrder) || 0 }
      if (service) await api(`/api/services/${service.id}`, { method: 'PUT', body })
      else await api('/api/services', { method: 'POST', body })
      toast({ title: service ? 'Service updated' : 'Service added', description: form.title })
      onClose()
    } catch (err) {
      toast({ title: 'Save failed', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scrollbar-slim">
        <DialogHeader>
          <DialogTitle>{service ? 'Edit service' : 'Add service'}</DialogTitle>
          <DialogDescription>Displayed on the homepage and services page with its own inquiry button.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sv-title">Title *</Label>
            <Input id="sv-title" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Cinematic Videography" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sv-desc">Description</Label>
            <Textarea id="sv-desc" value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sv-price">Price from</Label>
              <Input id="sv-price" value={form.priceFrom} onChange={(e) => set('priceFrom', e.target.value)} placeholder="₹2,999" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sv-order">Sort order</Label>
              <Input id="sv-order" type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sv-features">Features (one per line or | separated)</Label>
            <Textarea id="sv-features" value={form.features} onChange={(e) => set('features', e.target.value)} rows={3} placeholder={'Event films|Reels|Sound design'} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-xl border border-border p-3.5">
              <Label htmlFor="sv-active" className="text-sm">Visible</Label>
              <Switch id="sv-active" checked={form.active} onCheckedChange={(v) => set('active', v)} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-3.5">
              <Label htmlFor="sv-featured" className="text-sm">Featured</Label>
              <Switch id="sv-featured" checked={form.featured} onCheckedChange={(v) => set('featured', v)} />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}><X className="size-4" /> Cancel</Button>
          <Button onClick={save} disabled={saving || !form.title}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
