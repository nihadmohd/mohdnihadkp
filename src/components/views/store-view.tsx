'use client'

// Store — affiliate product grid, categories, search, sort, marquee + ads.
// Every card opens the product's own detail page (#/store/item/<slug>).
import { useCallback, useEffect, useState } from 'react'
import {
  Search, Star, ShoppingBag, ShieldCheck, ChevronRight,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CardSkeleton, SectionHeading } from '@/components/shared/section-heading'
import { EmptyView, NoSearchResultsView, InlineError } from '@/components/views/states'
import { useSeo } from '@/hooks/use-seo'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { AdSlot } from '@/components/shared/ad-slot'
import { MarqueeStrip } from '@/components/shared/marquee-strip'

interface ProductRow {
  id: string
  name: string
  slug: string
  description: string
  image: string | null
  price: number | null
  listPrice: number | null
  rating: number | null
  ratingCount: number | null
  merchant: string | null
  brand: string | null
  source: string
  category: string
  affiliateUrl: string
  badge: string | null
  featured: boolean
  clicks: number
}

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top rated' },
  { value: 'clicks', label: 'Popular' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
]

export default function StoreView({ initial }: { initial: Array<Record<string, unknown>> }) {
  const [products, setProducts] = useState<ProductRow[]>(() => initial as unknown as ProductRow[])
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([])
  const [query, setQuery] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [firstLoad, setFirstLoad] = useState(true)
  const [error, setError] = useState('')

  useSeo(
    {
      title: 'Store — Best AI Tools, Software & Gear I Actually Use',
      description: 'Honestly reviewed AI tools, software, hosting and creator gear — with prices for India, pros, cons and the best deals. Every pick is something I use in my own workflow.',
      path: '/store',
    },
    ['store']
  )

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 350)
    return () => clearTimeout(t)
  }, [query])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12', sort })
      if (debouncedQ) params.set('q', debouncedQ)
      if (category) params.set('category', category)
      const res = await api<{
        products: ProductRow[]
        pages: number
        total: number
        categories: { name: string; count: number }[]
      }>(`/api/products?${params}`)
      setProducts(res.products)
      setPages(res.pages)
      setTotal(res.total)
      setCategories(res.categories)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
      setFirstLoad(false)
    }
  }, [page, debouncedQ, category, sort])

  useEffect(() => {
    load()
  }, [load])
  useEffect(() => {
    setPage(1)
  }, [debouncedQ, category, sort])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 sm:py-14 pb-24 lg:pb-14">
      <SectionHeading
        eyebrow="The store"
        title="Tools I actually use"
        description="Hosting, AI subscriptions, gear and apps behind my workflow. Affiliate links — same price for you, small commission for me, zero influence on the picks."
      />

      {/* Scrolling highlights strip */}
      <MarqueeStrip className="mt-7 mb-7" />

      {/* Affiliate disclosure */}
      <div className="mb-7 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
        <ShieldCheck className="size-4.5 text-amber-500 shrink-0 mt-0.5" aria-hidden />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">Transparency note:</span> purchases through these links
          may earn me a commission at no extra cost to you. Only products I genuinely use get listed.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-3 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, gear, hosting…"
            className="pl-10 h-11 rounded-xl"
            aria-label="Search products"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-slim pb-1" role="group" aria-label="Categories">
          <CatChip label="All" active={category === ''} onClick={() => setCategory('')} />
          {categories.map((c) => (
            <CatChip key={c.name} label={`${c.name} (${c.count})`} active={category === c.name} onClick={() => setCategory(category === c.name ? '' : c.name)} />
          ))}
        </div>
        <div className="lg:ml-auto flex items-center gap-2 shrink-0">
          <label htmlFor="sort" className="text-xs text-muted-foreground">Sort</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-9 rounded-lg border border-border bg-card px-2.5 text-sm"
            aria-label="Sort products"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <InlineError message={error} onRetry={load} />
      ) : loading && firstLoad ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        debouncedQ || category ? <NoSearchResultsView query={debouncedQ || category} /> : (
          <EmptyView
            title="Shelves being stocked"
            message="The first curated picks are being added — tools worth your money only."
            icon={<ShoppingBag className="size-7 text-muted-foreground" />}
          />
        )
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-4" aria-live="polite">
            {total} pick{total === 1 ? '' : 's'}
            {loading && ' — loading…'}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/store/${p.slug}`}
                className="group block text-left rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col"
                aria-label={`View ${p.name}`}
              >
                <div className="aspect-square relative bg-gradient-to-br from-primary/15 via-muted to-amber-500/10 grid place-items-center overflow-hidden">
                  {p.image ? (
                     
                    <img src={p.image} alt={p.name} loading="lazy" className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="font-display font-bold text-3xl text-primary/50 group-hover:scale-110 transition-transform">
                      {p.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  {p.badge ? (
                    <Badge className="absolute top-2.5 left-2.5 text-[10px] h-5" variant="default">{p.badge}</Badge>
                  ) : p.featured && (
                    <Badge className="absolute top-2.5 left-2.5 text-[10px] h-5" variant="default">Featured</Badge>
                  )}
                  {p.source === 'AMAZON' && (
                    <span className="absolute top-2.5 right-2.5 rounded-md bg-amber-500/90 text-black text-[9px] font-bold px-1.5 py-0.5">AMAZON</span>
                  )}
                </div>
                <div className="p-3.5 sm:p-4 flex flex-col flex-1">
                  <p className="font-semibold text-sm line-clamp-2 leading-snug">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    {p.rating != null && (
                      <span className="flex items-center gap-1 text-amber-500 font-medium">
                        <Star className="size-3 fill-current" aria-hidden /> {p.rating.toFixed(1)}
                      </span>
                    )}
                    <span className="truncate">{p.merchant || p.category}</span>
                  </div>
                  <div className="mt-auto pt-2.5 flex items-center justify-between">
                    {p.price != null && p.price > 0 ? (
                      <span className="flex items-baseline gap-1.5">
                        {p.listPrice != null && p.listPrice > p.price && (
                          <span className="text-[11px] text-muted-foreground line-through">₹{p.listPrice.toLocaleString('en-IN')}</span>
                        )}
                        <span className="text-sm font-bold">₹{p.price.toLocaleString('en-IN')}</span>
                      </span>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] h-5">Free / varies</Badge>
                    )}
                    <ChevronRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {pages > 1 && (
            <nav className="mt-9 flex items-center justify-center gap-2" aria-label="Pagination">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
                Prev
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} / {pages}</span>
              <Button variant="outline" size="sm" disabled={page === pages} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
                Next
              </Button>
            </nav>
          )}

          {/* Affiliate ad after the grid */}
          <AdSlot placement="store" variant="banner" className="mt-10" />
        </>
      )}
    </div>
  )
}

function CatChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
        active ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}
