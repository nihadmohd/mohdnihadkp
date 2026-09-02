'use client'

// ─────────────────────────────────────────────────────────────
// MarqueeStrip — admin-managed scrolling image strip.
// Shown on home / blog / store. Pauses on hover/touch, each
// image links to its target URL. Pure CSS animation (cheap on
// low-end devices), respects prefers-reduced-motion.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'

export interface MarqueeRow {
  id: string
  title: string | null
  imageUrl: string
  linkUrl: string | null
  badge: string | null
}

let cached: MarqueeRow[] | null = null
let inflight: Promise<MarqueeRow[]> | null = null

function load(): Promise<MarqueeRow[]> {
  if (cached) return Promise.resolve(cached)
  if (!inflight) {
    inflight = import('@/lib/api-client')
      .then(({ api }) => api<{ items: MarqueeRow[] }>('/api/marquee'))
      .then((d) => {
        cached = (d.items || []).filter((m) => m.imageUrl)
        return cached
      })
      .catch(() => [] as MarqueeRow[])
  }
  return inflight
}

export function invalidateMarqueeCache() {
  cached = null
  inflight = null
}

export function MarqueeStrip({ className = '' }: { className?: string }) {
  const [items, setItems] = useState<MarqueeRow[]>(cached || [])

  useEffect(() => {
    let alive = true
    load().then((list) => { if (alive) setItems(list) })
    return () => { alive = false }
  }, [])

  if (items.length === 0) return null

  // Duplicate the list for a seamless loop
  const doubled = [...items, ...items]

  const renderItem = (m: MarqueeRow, key: string) => {
    const inner = (
      <>
        { }
        <img
          src={m.imageUrl}
          alt={m.title || 'Featured image'}
          loading="lazy"
          className="size-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
        />
        {m.badge && (
          <span className="absolute top-1.5 left-1.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
            {m.badge}
          </span>
        )}
        {m.title && (
          <span className="absolute inset-x-0 bottom-0 rounded-b-xl bg-gradient-to-t from-black/75 to-transparent pt-6 pb-1.5 px-2 text-[11px] font-medium text-white text-center truncate">
            {m.title}
          </span>
        )}
      </>
    )

    if (m.linkUrl) {
      const href = m.linkUrl.startsWith('http') ? m.linkUrl : m.linkUrl.startsWith('#') ? m.linkUrl : `#${m.linkUrl.startsWith('/') ? m.linkUrl : `/${m.linkUrl}`}`
      const external = m.linkUrl.startsWith('http')
      return (
        <a
          key={key}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="group relative shrink-0 w-36 sm:w-44 aspect-[16/10] rounded-xl overflow-hidden bg-muted border border-border/60 hover:border-primary/40 transition-colors"
          aria-label={m.title || 'View link'}
        >
          {inner}
        </a>
      )
    }
    return (
      <div key={key} className="relative shrink-0 w-36 sm:w-44 aspect-[16/10] rounded-xl overflow-hidden bg-muted border border-border/60">
        {inner}
      </div>
    )
  }

  return (
    <section
      aria-label="Featured highlights"
      className={`relative overflow-hidden ${className}`}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16 z-10 bg-gradient-to-r from-background to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 z-10 bg-gradient-to-l from-background to-transparent" aria-hidden />
      <div
        className="flex gap-3 w-max animate-marquee-items hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center"
        style={{ '--marquee-duration': `${Math.max(18, items.length * 5)}s` } as React.CSSProperties}
      >
        {doubled.map((m, i) => renderItem(m, `${m.id}-${i}`))}
      </div>
    </section>
  )
}

export default MarqueeStrip
