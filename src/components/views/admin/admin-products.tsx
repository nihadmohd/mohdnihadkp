'use client'

// Admin products — affiliate store management with click stats
import { useCallback, useEffect, useState } from 'react'
import {
  Plus, Pencil, Trash2, Loader2, Search, Star, ExternalLink, MousePointerClick,
  ShoppingBag, Save, X,
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

interface ProductRow {
  id: string
  name: string
  slug: string
  description: string
  image: string | null
  price: number | null
  rating: number | null
  merchant: string | null
  category: string
  affiliateUrl: string
  featured: boolean
  active: boolean
  clicks: number
}

const EMPTY = {
  name: '', description: '', image: '', price: '', rating: '', merchant: '',
  category: '', affiliateUrl: '', featured: false, active: true,
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<ProductRow | null>(null)
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api<{ products: ProductRow[] }>('/api/products?admin=true&limit=50')
      setProducts(res.products)
    } catch (err) {
      toast({ title: 'Failed to load', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const remove = async (p: ProductRow) => {
    try {
      await api(`/api/products/${p.id}`, { method: 'DELETE' })
      setProducts((prev) => prev.filter((x) => x.id !== p.id))
      toast({ title: 'Product removed', description: p.name })
    } catch (err) {
      toast({ title: 'Delete failed', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const toggleActive = async (p: ProductRow) => {
    try {
      const res = await api<{ product: ProductRow }>(`/api/products/${p.id}`, { method: 'PUT', body: { active: !p.active } })
      setProducts((prev) => prev.map((x) => (x.id === p.id ? res.product : x)))
    } catch (err) {
      toast({ title: 'Update failed', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const totalClicks = products.reduce((s, p) => s + p.clicks, 0)
  const filtered = products.filter((p) => !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">Store products</h2>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            {products.length} products · <MousePointerClick className="size-3" /> {totalClicks} affiliate clicks tracked
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" aria-hidden />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="pl-9 h-9 w-40" aria-label="Search products" />
          </div>
          <Button size="sm" className="glow-sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" /> Add product
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyView
          title={query ? 'No products match' : 'No products yet'}
          message={query ? 'Try a different search.' : 'Add your first affiliate product — click tracking starts immediately.'}
          icon={<ShoppingBag className="size-7 text-muted-foreground" />}
          action={<Button size="sm" onClick={() => setCreating(true)}><Plus className="size-4" /> Add first product</Button>}
        />
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((p) => (
            <li key={p.id} className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center gap-3">
              <span className="grid place-items-center size-11 rounded-xl bg-primary/10 text-primary font-display font-bold shrink-0 overflow-hidden">
                {p.image ? (
                   
                  <img src={p.image} alt="" className="size-full object-cover" />
                ) : (
                  p.name.slice(0, 2).toUpperCase()
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm truncate">{p.name}</p>
                  <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>
                  {!p.active && <Badge variant="secondary" className="text-[10px] text-amber-500 border-amber-500/30">hidden</Badge>}
                  {p.featured && <Star className="size-3 text-amber-500 fill-current shrink-0" />}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                  <span>{p.merchant || '—'}</span>
                  <span>· {p.price ? `₹${p.price.toLocaleString('en-IN')}` : 'free/varies'}</span>
                  <span>· {p.rating ? `★ ${p.rating}` : 'no rating'}</span>
                  <span className="flex items-center gap-1"><MousePointerClick className="size-3" /> {p.clicks} clicks</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button size="icon" variant="ghost" className="size-8" aria-label="Toggle visibility" title={p.active ? 'Hide' : 'Show'} onClick={() => toggleActive(p)}>
                  <ExternalLink className={`size-4 ${p.active ? 'text-primary' : ''}`} />
                </Button>
                <Button size="icon" variant="ghost" className="size-8" aria-label="Edit" onClick={() => setEditing(p)}>
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
                      <AlertDialogTitle>Remove “{p.name}”?</AlertDialogTitle>
                      <AlertDialogDescription>Click stats for this product will be lost.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep it</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove(p)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(creating || editing) && (
        <ProductDialog
          product={editing}
          onClose={() => { setCreating(false); setEditing(null); load() }}
        />
      )}
    </div>
  )
}

function ProductDialog({ product, onClose }: { product: ProductRow | null; onClose: () => void }) {
  const [form, setForm] = useState(
    product
      ? {
          name: product.name, description: product.description, image: product.image || '',
          price: product.price != null ? String(product.price) : '', rating: product.rating != null ? String(product.rating) : '',
          merchant: product.merchant || '', category: product.category, affiliateUrl: product.affiliateUrl,
          featured: product.featured, active: product.active,
        }
      : { ...EMPTY }
  )
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      const body = { ...form, price: form.price === '' ? null : Number(form.price), rating: form.rating === '' ? null : Number(form.rating) }
      if (product) {
        await api(`/api/products/${product.id}`, { method: 'PUT', body })
      } else {
        await api('/api/products', { method: 'POST', body })
      }
      toast({ title: product ? 'Product updated' : 'Product added', description: form.name })
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
          <DialogTitle>{product ? 'Edit product' : 'Add affiliate product'}</DialogTitle>
          <DialogDescription>Shown in the public store — clicks are tracked automatically.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="pr-name">Name *</Label>
            <Input id="pr-name" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="pr-url">Affiliate URL *</Label>
            <Input id="pr-url" value={form.affiliateUrl} onChange={(e) => set('affiliateUrl', e.target.value)} placeholder="https://amazon.in/…" />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="pr-desc">Description</Label>
            <Textarea id="pr-desc" value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="Why this tool? What do you use it for?" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pr-price">Price (₹)</Label>
            <Input id="pr-price" type="number" min="0" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="0 = free" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pr-rating">Rating (0–5)</Label>
            <Input id="pr-rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => set('rating', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pr-merchant">Merchant</Label>
            <Input id="pr-merchant" value={form.merchant} onChange={(e) => set('merchant', e.target.value)} placeholder="Amazon / Hostinger / …" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pr-category">Category</Label>
            <Input id="pr-category" value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="AI Tools / Hosting / Gear" />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="pr-image">Image URL</Label>
            <Input id="pr-image" value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="https://… (optional)" />
          </div>
          <div className="flex items-center justify-between col-span-2 rounded-xl border border-border p-3.5">
            <div>
              <Label htmlFor="pr-featured" className="text-sm">Featured</Label>
              <p className="text-[11px] text-muted-foreground">Pinned to homepage teaser</p>
            </div>
            <Switch id="pr-featured" checked={form.featured} onCheckedChange={(v) => set('featured', v)} />
          </div>
          <div className="flex items-center justify-between col-span-2 rounded-xl border border-border p-3.5">
            <div>
              <Label htmlFor="pr-active" className="text-sm">Visible in store</Label>
              <p className="text-[11px] text-muted-foreground">Hide without deleting</p>
            </div>
            <Switch id="pr-active" checked={form.active} onCheckedChange={(v) => set('active', v)} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}><X className="size-4" /> Cancel</Button>
          <Button onClick={save} disabled={saving || !form.name || !form.affiliateUrl}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
