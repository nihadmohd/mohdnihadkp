'use client'

// ─────────────────────────────────────────────────────────────
// AdSlot — admin-managed affiliate ad rendered across the site.
// Placements: home | blog-list | blog-inline | blog-sidebar |
//             store | services | footer
// Variants: card (grid tile) | banner (wide strip) |
//           inline (inside article flow) | sidebar (compact)
// Clicks are tracked server-side, then open the affiliate URL.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { ExternalLink, Star, Sparkles, BadgeCheck } from 'lucide-react'
import { api } from '@/lib/api-client'

function formatINR(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`
}

export type AdPlacement =
  | 'home' | 'blog-list' | 'blog-inline' | 'blog-sidebar'
  | 'store' | 'services' | 'footer'

interface AdProduct {
  id: string
  name: string
  slug: string
  image: string | null
  price: number | null
  listPrice: number | null
  rating: number | null
  merchant: string | null
  source: string
  badge: string | null
  category: string
}

export interface AdRow {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  linkUrl: string | null
  badge: string | null
  placement: string
  product: AdProduct | null
}

// Module-level cache — one fetch per placement per page load
const adCache = new Map<string, AdRow[]>()
const inFlight = new Map<string, Promise<AdRow[]>>()

async function loadAds(placement: AdPlacement): Promise<AdRow[]> {
  const cached = adCache.get(placement)
  if (cached) return cached
  let p = inFlight.get(placement)
  if (!p) {
    p = api<{ ads: AdRow[] }>(`/api/ads?placement=${placement}`)
      .then((d) => {
        const ads = (d.ads || []).filter((a) => a.product || a.linkUrl)
        adCache.set(placement, ads)
        inFlight.delete(placement)
        return ads
      })
      .catch(() => {
        inFlight.delete(placement)
        return [] as AdRow[]
      })
    inFlight.set(placement, p)
  }
  return p
}

export function invalidateAdCache() {
  adCache.clear()
}

async function openAd(ad: AdRow) {
  try {
    const res = await api<{ url: string }>(`/api/ads/${ad.id}/click`, { method: 'POST' })
    window.open(res.url, '_blank', 'noopener')
  } catch {
    window.open(ad.product?.slug ? `/store/${ad.product.slug}` : '/store', '_blank', 'noopener')
  }
}

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return null
  return (
    <span className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3 ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`}
          aria-hidden
        />
      ))}
    </span>
  )
}

function AdBadge({ label }: { label: string | null }) {
  if (!label) return null
  return (
    <span className="absolute top-2.5 left-2.5 z-10 rounded-full bg-amber-500/90 text-black text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
      {label}
    </span>
  )
}

// ── Grid card variant (home / blog-list / store) ─────────────
function CardAd({ ad }: { ad: AdRow }) {
  const p = ad.product
  const image = ad.imageUrl || p?.image
  return (
    <button
      onClick={() => openAd(ad)}
      className="group relative text-left rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.06] to-primary/[0.06] hover:border-amber-500/50 transition-all overflow-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      aria-label={`Sponsored: ${p?.name || ad.title}. Opens affiliate link in a new tab.`}
    >
      <AdBadge label={ad.badge || 'Sponsored'} />
      <div className="flex gap-3 p-3.5">
        {image && (
          <div className="relative size-20 sm:size-24 shrink-0 rounded-xl overflow-hidden bg-muted">
            { }
            <img src={image} alt={p?.name || ad.title} loading="lazy" className="size-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
            <Sparkles className="size-3" aria-hidden /> {ad.title}
          </p>
          <p className="font-semibold text-sm leading-snug mt-1 line-clamp-2 group-hover:text-primary transition-colors">
            {p?.name || ad.description}
          </p>
          {p && (
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <Stars rating={p.rating} />
              {p.price != null && (
                <span className="text-sm font-bold text-primary">{formatINR(p.price)}</span>
              )}
            </div>
          )}
          <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
            {p?.source === 'AMAZON' && <BadgeCheck className="size-3 text-amber-500" aria-hidden />}
            {p?.merchant || 'View offer'} <ExternalLink className="size-3" aria-hidden />
          </p>
        </div>
      </div>
    </button>
  )
}

// ── Inline variant (inside blog article flow) ────────────────
function InlineAd({ ad }: { ad: AdRow }) {
  const p = ad.product
  const image = ad.imageUrl || p?.image
  return (
    <aside
      className="my-8 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/[0.08] via-transparent to-primary/[0.08] overflow-hidden"
      aria-label="Affiliate advertisement"
    >
      <div className="flex items-center gap-4 p-4 sm:p-5">
        {image && (
          <div className="hidden sm:block relative size-28 shrink-0 rounded-xl overflow-hidden bg-muted">
            { }
            <img src={image} alt={p?.name || ad.title} loading="lazy" className="size-full object-cover" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
            <Sparkles className="size-3" aria-hidden /> {ad.badge || 'Affiliate pick'} · {ad.title}
          </p>
          <p className="font-display font-semibold mt-1 line-clamp-1">{p?.name || ad.title}</p>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {ad.description || p?.name || 'A product I personally use and recommend.'}
          </p>
          {p?.price != null && (
            <p className="mt-1 text-base font-bold text-primary">{formatINR(p.price)}</p>
          )}
        </div>
        <button
          onClick={() => openAd(ad)}
          className="shrink-0 inline-flex items-center gap-1.5 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold px-4 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label={`Buy ${p?.name || ad.title} — opens affiliate link in a new tab`}
        >
          Buy <ExternalLink className="size-3.5" aria-hidden />
        </button>
      </div>
      <p className="px-4 sm:px-5 pb-3 text-[10px] text-muted-foreground/70">
        As an affiliate, MN.KP earns from qualifying purchases — at no extra cost to you.
      </p>
    </aside>
  )
}

// ── Sidebar compact variant ──────────────────────────────────
function SidebarAd({ ad }: { ad: AdRow }) {
  const p = ad.product
  const image = ad.imageUrl || p?.image
  return (
    <button
      onClick={() => openAd(ad)}
      className="group w-full text-left rounded-2xl border border-amber-500/25 bg-card p-3.5 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      aria-label={`Sponsored: ${p?.name || ad.title}. Opens affiliate link in a new tab.`}
    >
      <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
        <Sparkles className="size-3" aria-hidden /> {ad.badge || 'Sponsored'}
      </p>
      <div className="flex gap-3 mt-2.5">
        {image && (
          <div className="relative size-16 shrink-0 rounded-lg overflow-hidden bg-muted">
            { }
            <img src={image} alt={p?.name || ad.title} loading="lazy" className="size-full object-cover" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {p?.name || ad.title}
          </p>
          {p?.price != null && <p className="mt-1 text-sm font-bold text-primary">{formatINR(p.price)}</p>}
          {p?.rating != null && <div className="mt-1"><Stars rating={p.rating} /></div>}
        </div>
      </div>
      <p className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-primary">
        View on {p?.merchant || 'partner'} <ExternalLink className="size-3" aria-hidden />
      </p>
    </button>
  )
}

// ── Banner variant (footer / services) ───────────────────────
function BannerAd({ ad }: { ad: AdRow }) {
  const p = ad.product
  const image = ad.imageUrl || p?.image
  return (
    <button
      onClick={() => openAd(ad)}
      className="group w-full text-left rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/[0.07] to-primary/[0.05] p-4 sm:p-5 flex items-center gap-4 hover:border-amber-500/45 transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      aria-label={`Sponsored: ${p?.name || ad.title}. Opens affiliate link in a new tab.`}
    >
      {image && (
        <div className="relative size-14 sm:size-16 shrink-0 rounded-xl overflow-hidden bg-muted">
          { }
          <img src={image} alt={p?.name || ad.title} loading="lazy" className="size-full object-cover" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
          {ad.badge || 'Sponsored'} · {ad.title}
        </p>
        <p className="font-semibold text-sm sm:text-base mt-0.5 truncate group-hover:text-primary transition-colors">
          {p?.name || ad.description}
        </p>
        {p?.price != null && <p className="text-sm font-bold text-primary mt-0.5">{formatINR(p.price)}</p>}
      </div>
      <span className="shrink-0 inline-flex items-center gap-1.5 h-9 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-3.5 transition-colors">
        Shop <ExternalLink className="size-3" aria-hidden />
      </span>
    </button>
  )
}

// ── Public component ─────────────────────────────────────────
export function AdSlot({
  placement,
  variant = 'card',
  limit = 1,
  className = '',
}: {
  placement: AdPlacement
  variant?: 'card' | 'inline' | 'sidebar' | 'banner'
  limit?: number
  className?: string
}) {
  const [ads, setAds] = useState<AdRow[]>(() => adCache.get(placement) || [])
  const [loaded, setLoaded] = useState(adCache.has(placement))

  useEffect(() => {
    let alive = true
    loadAds(placement).then((list) => {
      if (alive) {
        setAds(list)
        setLoaded(true)
      }
    })
    return () => { alive = false }
  }, [placement])

  if (!loaded || ads.length === 0) return null
  const shown = ads.slice(0, limit)
  if (shown.length === 0) return null

  const AdComp =
    variant === 'inline' ? InlineAd :
    variant === 'sidebar' ? SidebarAd :
    variant === 'banner' ? BannerAd : CardAd

  return (
    <div
      className={`space-y-3 ${className}`}
      role="complementary"
      aria-label="Sponsored content"
    >
      {shown.map((ad) => <AdComp key={ad.id} ad={ad} />)}
    </div>
  )
}

export default AdSlot
