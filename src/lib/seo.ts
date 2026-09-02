'use client'

// ─────────────────────────────────────────────────────────────
// Client-side SEO manager — dynamic <head> updates for
// client-rendered states (post loaded via API, etc.).
// Server routes already emit static metadata + JSON-LD via
// generateMetadata; this keeps the SPA feel in sync.
// ─────────────────────────────────────────────────────────────
import { SITE } from '@/lib/constants'
import { personJsonLd, websiteJsonLd } from '@/lib/seo-metadata'

export { personJsonLd, websiteJsonLd }

export interface SeoData {
  title: string
  description: string
  path?: string
  type?: 'website' | 'article' | 'profile'
  image?: string
  publishedTime?: string
  tags?: string[]
  author?: string
  jsonLd?: Record<string, unknown>
  noindex?: boolean
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

const JSONLD_ID = 'dynamic-jsonld'

export function applySeo(data: SeoData) {
  if (typeof document === 'undefined') return

  const fullTitle = data.title.includes(SITE.name) || data.title.includes('MN.KP')
    ? data.title
    : `${data.title} | ${SITE.name}`
  const url = `${SITE.url}${data.path || '/'}`

  document.title = fullTitle

  upsertMeta('name', 'description', data.description)
  upsertMeta('name', 'robots', data.noindex ? 'noindex, nofollow' : 'index, follow')

  // OpenGraph
  upsertMeta('property', 'og:title', fullTitle)
  upsertMeta('property', 'og:description', data.description)
  upsertMeta('property', 'og:url', url)
  upsertMeta('property', 'og:type', data.type || 'website')
  upsertMeta('property', 'og:site_name', SITE.name)
  upsertMeta('property', 'og:image', data.image || `${SITE.url}/og-image.png`)
  upsertMeta('property', 'og:locale', SITE.locale)
  if (data.publishedTime) upsertMeta('property', 'article:published_time', data.publishedTime)

  // Twitter
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', fullTitle)
  upsertMeta('name', 'twitter:description', data.description)
  upsertMeta('name', 'twitter:image', data.image || `${SITE.url}/og-image.png`)

  // Canonical
  upsertLink('canonical', url)

  // JSON-LD (supplemental — server routes emit the full graph)
  const existing = document.getElementById(JSONLD_ID) as HTMLScriptElement | null
  if (data.jsonLd) {
    const script = existing || document.createElement('script')
    script.id = JSONLD_ID
    script.type = 'application/ld+json'
    const graph = [
      data.jsonLd,
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
          ...(data.path && data.path !== '/'
            ? [{ '@type': 'ListItem', position: 2, name: data.title, item: url }]
            : []),
        ],
      },
    ].filter(Boolean)
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
    if (!existing) document.head.appendChild(script)
  } else if (existing) {
    existing.remove()
  }
}
