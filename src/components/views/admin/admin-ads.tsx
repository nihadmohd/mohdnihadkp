'use client'

// Admin ads — affiliate ad units placed across the site.
// Standalone banner ads or product-linked rich cards; click stats.
import { useCallback, useEffect, useState } from 'react'
import {
  Plus, Trash2, Loader2, Megaphone, ExternalLink, MousePointerClick, Link2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { EmptyView } from '@/components/views/states'
import { invalidateAdCache } from '@/components/shared/ad-slot'

interface AdRow {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  linkUrl: string | null
  productId: string | null
  badge: string | null
  placement: string
  active: boolean
  clicks: number
  sortOrder: number
  product: { id: string; name: string; image: string | null; price: number | null; merchant: string | null } | null
}

const PLACEMENTS = [
  { value: 'home', label: 'Home — after store picks' },
  { value: 'blog-list', label: 'Blog list — in the article grid' },
  { value: 'blog-inline', label: 'Blog article — inline after content' },
  { value: 'blog-sidebar', label: 'Blog article — sticky sidebar' },
  { value: 'store', label: 'Store — after the product grid' },
  { value: 'services', label: 'Services — bottom of page' },
  { value: 'footer', label: 'Footer — brand column' },
]

export default function AdminAds() {
  const [ads, setAds] = useState<AdRow[]>([])
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', imageUrl: '', linkUrl: '', badge: 'Sponsored', placement: 'blog-sidebar', productId: '',
  })
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [resAds, resProducts] = await Promise.all([
        api<{ ads: AdRow[] }>('/api/ads?admin=true'),
        api<{ products: Array<{ id: string; name: string }> }>('/api/products?admin=true&limit=48&sort=newest'),
      ])
      setAds(resAds.ads)
      setProducts(resProducts.products)
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
      await api('/api/ads', { method: 'POST', body: form })
      toast({ title: 'Ad unit created', description: `Live in the ${PLACEMENTS.find((p) => p.value === form.placement)?.label.toLowerCase()}.` })
      invalidateAdCache()
      setOpen(false)
      setForm({ title: '', description: '', imageUrl: '', linkUrl: '', badge: 'Sponsored', placement: 'blog-sidebar', productId: '' })
      load()
    } catch (err) {
      toast({ title: 'Could not save', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const patch = async (ad: AdRow, data: Partial<AdRow>) => {
    try {
      await api(`/api/ads/${ad.id}`, { method: 'PATCH', body: data })
      setAds((prev) => prev.map((x) => (x.id === ad.id ? { ...x, ...data } : x)))
      invalidateAdCache()
    } catch (err) {
      toast({ title: 'Could not update', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const remove = async (ad: AdRow) => {
    try {
      await api(`/api/ads/${ad.id}`, { method: 'DELETE' })
      setAds((prev) => prev.filter((x) => x.id !== ad.id))
      invalidateAdCache()
      toast({ title: 'Ad removed', description: 'It no longer shows on the site.' })
    } catch (err) {
      toast({ title: 'Could not delete', description: (err as Error).message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">Affiliate ads</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ad units shown across the site. Link an ad to a store product for a rich card with price + rating, or keep it standalone.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New ad
        </Button>
      </div>

      {loading && ads.length === 0 ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : ads.length === 0 ? (
        <EmptyView
          title="No ad units"
          message="Create affiliate ads that appear on the home page, blog articles, store, services and footer."
          icon={<Megaphone className="size-7 text-muted-foreground" />}
          action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="size-4" /> New ad</Button>}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <ul className="divide-y divide-border/40">
            {ads.map((ad) => (
              <li key={ad.id} className={`flex items-center gap-3.5 p-4 ${!ad.active ? 'opacity-50' : ''}`}>
                {(ad.imageUrl || ad.product?.image) ? (
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    { }
                    <img src={(ad.imageUrl || ad.product?.image) as string} alt="" loading="lazy" className="size-full object-cover" />
                  </div>
                ) : (
                  <span className="grid place-items-center w-20 h-14 rounded-lg bg-amber-500/15 text-amber-500 shrink-0">
                    <Megaphone className="size-5" aria-hidden />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{ad.title}</p>
                    {ad.badge && <Badge className="text-[9px] h-4 bg-amber-500/90 text-black hover:bg-amber-500/90">{ad.badge}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {ad.product ? (
                      <span className="inline-flex items-center gap-1"><Link2 className="size-3" aria-hidden /> Product: {ad.product.name}</span>
                    ) : ad.linkUrl ? (
                      <span className="inline-flex items-center gap-1 truncate"><ExternalLink className="size-3 shrink-0" aria-hidden /> {ad.linkUrl}</span>
                    ) : (
                      ad.description || 'No destination'
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Select value={ad.placement} onValueChange={(v) => patch(ad, { placement: v })}>
                      <SelectTrigger className="h-6 text-[11px] w-52" aria-label="Placement"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PLACEMENTS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MousePointerClick className="size-3" aria-hidden /> {ad.clicks} clicks
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={ad.active} onCheckedChange={(v) => patch(ad, { active: v })} aria-label={`Toggle ${ad.title}`} />
                  <Button size="sm" variant="outline" className="h-7 px-2 hover:border-destructive/50 hover:text-destructive" onClick={() => remove(ad)} aria-label="Delete">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scrollbar-slim">
          <DialogHeader>
            <DialogTitle>New affiliate ad</DialogTitle>
            <DialogDescription>Product-linked ads show image, price and rating automatically.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ad-title">Headline *</Label>
              <Input id="ad-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Reader Favourite" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ad-placement">Placement</Label>
              <Select value={form.placement} onValueChange={(v) => setForm((f) => ({ ...f, placement: v }))}>
                <SelectTrigger id="ad-placement"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLACEMENTS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ad-product">Link to store product (recommended)</Label>
              <Select value={form.productId || 'none'} onValueChange={(v) => setForm((f) => ({ ...f, productId: v === 'none' ? '' : v }))}>
                <SelectTrigger id="ad-product"><SelectValue placeholder="Pick a product…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None — standalone ad</SelectItem>
                  {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {!form.productId && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="ad-url">Destination URL</Label>
                  <Input id="ad-url" value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))} placeholder="https://affiliate-link… or /store" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ad-image">Image URL (optional)</Label>
                  <Input id="ad-image" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…/banner.png" />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="ad-desc">Short description</Label>
              <Textarea id="ad-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="The tool most blog readers end up buying." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ad-badge">Badge</Label>
              <Input id="ad-badge" value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} placeholder="Sponsored / Hot" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving || !form.title}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Create ad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
