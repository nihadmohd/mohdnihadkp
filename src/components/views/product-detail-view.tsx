'use client'

// ─────────────────────────────────────────────────────────────
// ProductDetailView — full affiliate product page with a unique
// shareable URL (#/store/item/<slug>): gallery carousel, price
// + list price, rating, pros/cons, specs, coupon, source badge,
// related picks, and click-tracked buy button.
// ─────────────────────────────────────────────────────────────
import { useCallback, useEffect, useState } from 'react'
import {
  Star, ExternalLink, ShieldCheck, ChevronLeft, ChevronRight, BadgeCheck,
  Share2, Check, X, ThumbsUp, ThumbsDown, Copy, ShoppingBag, Sparkles, Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CardSkeleton, SectionHeading } from '@/components/shared/section-heading'
import { EmptyView, InlineError } from '@/components/views/states'
import { useSeo } from '@/hooks/use-seo'
import { navigate } from '@/hooks/use-hash-router'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { AdSlot } from '@/components/shared/ad-slot'

export interface ProductRow {
  id: string
  name: string
  slug: string
  description: string
  image: string | null
  gallery: string
  price: number | null
  listPrice: number | null
  currency: string
  rating: number | null
  ratingCount: number | null
  merchant: string | null
  brand: string | null
  source: string
  category: string
  affiliateUrl: string
  badge: string | null
  coupon: string | null
  couponNote: string | null
  pros: string
  cons: string
  specs: string
  buyText: string
  disclosure: string | null
  featured: boolean
  clicks: number
}

const SOURCE_STYLES: Record<string, { label: string; cls: string }> = {
  AMAZON: { label: 'Amazon Associates', cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  FLIPKART: { label: 'Flipkart Affiliate', cls: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  EBAY: { label: 'eBay Partner', cls: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30' },
  ALIEXPRESS: { label: 'AliExpress Affiliate', cls: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30' },
  CUSTOM: { label: 'MN.KP Pick', cls: 'bg-primary/15 text-primary border-primary/30' },
}

function Stars({ rating, count }: { rating: number | null; count?: number | null }) {
  if (rating == null) return null
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`size-4 ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`}
            aria-hidden
          />
        ))}
      </span>
      <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
      {count != null && <span className="text-xs text-muted-foreground">({count.toLocaleString('en-IN')} ratings)</span>}
    </span>
  )
}

interface RelatedProduct {
  id: string
  name: string
  slug: string
  image: string | null
  price: number | null
  rating: number | null
  merchant: string | null
  badge: string | null
  source: string
}

export default function ProductDetailView({ slug, initial }: { slug: string; initial?: ProductRow | null }) {
  const [product, setProduct] = useState<ProductRow | null>(initial || null)
  const [related, setRelated] = useState<RelatedProduct[]>([])
  const [posts, setPosts] = useState<Array<{ id: string; title: string; slug: string; excerpt: string | null; readingMinutes: number }>>([])
  const [loading, setLoading] = useState(!initial)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  useSeo(
    {
      title: product ? `${product.name} — Review, Price & Best Deal` : 'Product — Store',
      description: product?.description?.slice(0, 160) || 'A curated affiliate pick from the MN.KP store — honestly reviewed with prices, pros and cons.',
      path: `/store/${slug}`,
      type: 'article',
      image: product?.image || undefined,
    },
    [slug, product?.name]
  )

  const load = useCallback(async () => {
    if (!initial) setLoading(true)
    setError('')
    try {
      const res = await api<{ product: ProductRow; related: RelatedProduct[] }>(
        `/api/products?slug=${encodeURIComponent(slug)}`
      )
      setProduct(res.product)
      setRelated(res.related || [])
      setActiveImage(0)
    } catch (err) {
      if (!initial) setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { load() }, [load])

  // Internal links — product → relevant blog articles
  useEffect(() => {
    const cat = (product?.category || '').trim()
    const fetchPosts = async (q: string) => {
      const params = new URLSearchParams({ limit: '3' })
      if (q) params.set('q', q)
      const res = await api<{ posts: Array<{ id: string; title: string; slug: string; excerpt: string | null; readingMinutes: number }> }>(`/api/posts?${params}`)
      return res.posts
    }
    ;(async () => {
      try {
        let list = cat ? await fetchPosts(cat) : []
        if (list.length < 2) list = await fetchPosts('')
        setPosts(list.slice(0, 3))
      } catch { /* optional block */ }
    })()
  }, [product?.category])

  const buy = async () => {
    if (!product) return
    try {
      const res = await api<{ url: string }>(`/api/products/${product.id}/click`, { method: 'POST' })
      window.open(res.url, '_blank', 'noopener')
      setProduct((p) => (p ? { ...p, clicks: p.clicks + 1 } : p))
    } catch (err) {
      toast({ title: 'Could not open link', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const share = async () => {
    const url = `${window.location.origin}/store/${slug}`
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.name || 'MN.KP store pick', url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast({ title: 'Link copied', description: 'Share it anywhere.' })
      }
    } catch { /* dismissed */ }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="aspect-[4/3] rounded-3xl bg-muted animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded-xl bg-muted animate-pulse" />
            <div className="h-5 w-1/2 rounded-lg bg-muted animate-pulse" />
            <div className="h-24 rounded-xl bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-16 pb-24">
        {error ? <InlineError message={error} onRetry={load} /> : (
          <EmptyView
            title="Product not found"
            message="This pick may have been removed or the link is incorrect."
            icon={<ShoppingBag className="size-7 text-muted-foreground" />}
            action={<Button variant="outline" onClick={() => navigate('/store')}>Back to store</Button>}
          />
        )}
      </div>
    )
  }

  const gallery = [product.image, ...product.gallery.split('|').filter(Boolean)].filter(Boolean) as string[]
  const pros = product.pros.split('|').filter(Boolean)
  const cons = product.cons.split('|').filter(Boolean)
  const specs = product.specs.split('|').filter(Boolean).map((s) => {
    const idx = s.indexOf(':')
    return idx > 0 ? [s.slice(0, idx).trim(), s.slice(idx + 1).trim()] : [s, '']
  })
  const source = SOURCE_STYLES[product.source] || SOURCE_STYLES.CUSTOM
  const discount =
    product.listPrice && product.price && product.listPrice > product.price
      ? Math.round(((product.listPrice - product.price) / product.listPrice) * 100)
      : 0

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-12 pb-24 lg:pb-14">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <li><button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button></li>
          <li aria-hidden>/</li>
          <li><button onClick={() => navigate('/store')} className="hover:text-primary transition-colors">Store</button></li>
          <li aria-hidden>/</li>
          <li className="text-foreground truncate max-w-[50vw]">{product.name}</li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-border bg-gradient-to-br from-primary/15 via-muted to-amber-500/10 grid place-items-center">
            {gallery[activeImage] ? (
               
              <img
                key={activeImage}
                src={gallery[activeImage]}
                alt={product.name}
                className="size-full object-cover"
              />
            ) : (
              <span className="font-display font-bold text-6xl text-primary/40">
                {product.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            {product.badge && (
              <span className="absolute top-3 left-3 rounded-full bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1">
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="absolute top-3 right-3 rounded-full bg-red-500 text-white text-[11px] font-bold px-2.5 py-1">
                −{discount}%
              </span>
            )}
            {gallery.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((i) => (i - 1 + gallery.length) % gallery.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center size-9 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button
                  onClick={() => setActiveImage((i) => (i + 1) % gallery.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center size-9 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" aria-hidden />
                </button>
              </>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto scrollbar-slim pb-1" role="group" aria-label="Image gallery">
              {gallery.map((g, i) => (
                <button
                  key={g + i}
                  onClick={() => setActiveImage(i)}
                  className={`relative shrink-0 size-18 sm:size-20 rounded-xl overflow-hidden border-2 transition-colors ${
                    i === activeImage ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  { }
                  <img src={g} alt="" loading="lazy" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${source.cls}`}>
                {product.source === 'AMAZON' && <BadgeCheck className="size-3.5" aria-hidden />}
                {source.label}
              </span>
              <Badge variant="secondary" className="text-[11px]">{product.category}</Badge>
              {product.brand && <span className="text-xs text-muted-foreground">by {product.brand}</span>}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight leading-snug">{product.name}</h1>
            <Stars rating={product.rating} count={product.ratingCount} />
          </div>

          {/* Price block */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-end gap-3 flex-wrap">
              {product.price != null && product.price > 0 ? (
                <>
                  <span className="font-display text-3xl font-bold text-primary">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.listPrice != null && product.listPrice > product.price && (
                    <span className="text-lg text-muted-foreground line-through">
                      ₹{product.listPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </>
              ) : (
                <span className="font-display text-2xl font-bold text-primary">Free / varies</span>
              )}
              <button
                onClick={share}
                className="ml-auto inline-flex items-center gap-1.5 h-9 rounded-lg border border-border px-3 text-xs font-medium hover:border-primary/40 hover:text-primary transition-colors"
                aria-label="Share this product"
              >
                {copied ? <Check className="size-3.5" aria-hidden /> : <Share2 className="size-3.5" aria-hidden />}
                {copied ? 'Copied!' : 'Share'}
              </button>
            </div>

            {product.coupon && (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3.5 py-2.5">
                <Tag className="size-4 text-primary shrink-0" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-bold tracking-wide">{product.coupon}</p>
                  {product.couponNote && <p className="text-xs text-muted-foreground">{product.couponNote}</p>}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(product.coupon || '').catch(() => {})
                    toast({ title: 'Coupon copied', description: `${product.coupon} — apply it at checkout.` })
                  }}
                  className="ml-auto inline-flex items-center gap-1 h-8 rounded-lg bg-primary/10 text-primary text-xs font-semibold px-2.5 hover:bg-primary/20 transition-colors"
                >
                  <Copy className="size-3" aria-hidden /> Copy
                </button>
              </div>
            )}

            <Button className="w-full h-12 text-base glow-sm font-bold" onClick={buy}>
              <ExternalLink className="size-4.5" />
              {product.buyText || 'Buy Now'}
              <span className="sr-only">on {product.merchant || 'merchant site'} — opens in a new tab</span>
            </Button>
            <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
              <ShieldCheck className="size-3.5 shrink-0 mt-0.5 text-amber-500" aria-hidden />
              {product.disclosure || 'Affiliate link — same price for you, a small commission for MN.KP. Price set by the seller and may change.'}
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h2 className="font-display text-lg font-semibold mb-2.5">About this pick</h2>
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {/* Pros & cons */}
          {(pros.length > 0 || cons.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {pros.length > 0 && (
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-4">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2.5">
                    <ThumbsUp className="size-4" aria-hidden /> Pros
                  </p>
                  <ul className="space-y-2">
                    {pros.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm">
                        <Check className="size-3.5 mt-0.5 text-emerald-500 shrink-0" aria-hidden />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {cons.length > 0 && (
                <div className="rounded-2xl border border-red-500/25 bg-red-500/[0.04] p-4">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-red-600 dark:text-red-400 mb-2.5">
                    <ThumbsDown className="size-4" aria-hidden /> Cons
                  </p>
                  <ul className="space-y-2">
                    {cons.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm">
                        <X className="size-3.5 mt-0.5 text-red-500 shrink-0" aria-hidden />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Specs */}
          {specs.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-semibold mb-2.5">Specifications</h2>
              <dl className="rounded-2xl border border-border divide-y divide-border/60 overflow-hidden">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 px-4 py-2.5 text-sm bg-card">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium text-right">{v || '—'}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Related picks */}
      {related.length > 0 && (
        <section className="mt-14" aria-label="Related picks">
          <SectionHeading
            eyebrow="More like this"
            title="Related picks"
            description={`Other curated ${product.category.toLowerCase()} options worth a look.`}
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mt-6">
            {related.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/store/${p.slug}`)}
                className="group text-left rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all"
                aria-label={`View ${p.name}`}
              >
                <div className="aspect-square relative bg-gradient-to-br from-primary/15 via-muted to-amber-500/10 grid place-items-center overflow-hidden">
                  {p.image ? (
                     
                    <img src={p.image} alt={p.name} loading="lazy" className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="font-display font-bold text-3xl text-primary/50">{p.name.slice(0, 2).toUpperCase()}</span>
                  )}
                  {p.badge && (
                    <span className="absolute top-2.5 left-2.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5">{p.badge}</span>
                  )}
                </div>
                <div className="p-3.5">
                  <p className="font-semibold text-sm line-clamp-2 leading-snug">{p.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    {p.price != null && p.price > 0 ? (
                      <span className="text-sm font-bold">₹{p.price.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Free / varies</span>
                    )}
                    {p.rating != null && (
                      <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                        <Star className="size-3 fill-current" aria-hidden /> {p.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Internal links — product → blog + services */}
      {posts.length > 0 && (
        <section className="mt-14" aria-label="From the blog">
          <SectionHeading
            eyebrow="Reading material"
            title="From the blog"
            description="Articles that go deeper on this kind of tool."
          />
          <ul className="grid sm:grid-cols-3 gap-4 mt-6">
            {posts.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => navigate(`/blog/${p.slug}`)}
                  className="w-full text-left rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-colors"
                >
                  <p className="font-semibold text-sm leading-snug line-clamp-2">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.excerpt || ''}</p>
                  <p className="text-[11px] text-primary mt-3 font-medium">{p.readingMinutes} min read →</p>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-12 rounded-2xl border border-primary/25 bg-primary/5 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold">Want this set up for you?</p>
          <p className="text-sm text-muted-foreground mt-1">
            I build AI-powered websites, apps and media from Calicut, Kerala — end to end.
          </p>
        </div>
        <Button onClick={() => navigate('/services')} className="shrink-0">
          See my services
        </Button>
      </div>

      {/* Store ad below related */}
      <AdSlot placement="store" variant="banner" className="mt-12" />
    </div>
  )
}
