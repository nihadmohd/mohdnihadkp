'use client'

// ─────────────────────────────────────────────────────────────
// Client-side SEO manager — per-route <head> updates
// Updates title, meta description, canonical, OG/Twitter, JSON-LD
// ─────────────────────────────────────────────────────────────
import { SITE } from '@/lib/constants'

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

  const fullTitle = data.title.includes(SITE.name) ? data.title : `${data.title} | ${SITE.name}`
  const url = `${SITE.url}/#${data.path || '/'}`

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

  // JSON-LD
  const existing = document.getElementById(JSONLD_ID) as HTMLScriptElement | null
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
}

// Baseline structured data (rendered once, merged with per-route data)
export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.name,
    alternateName: SITE.shortName,
    jobTitle: SITE.tagline,
    description: SITE.description,
    url: SITE.url,
    email: SITE.email,
    address: { '@type': 'PostalAddress', addressLocality: 'Calicut', addressRegion: 'Kerala', addressCountry: 'IN' },
    sameAs: [
      'https://www.instagram.com/mohdnihadkp',
      'https://www.linkedin.com/in/mohammed-nihad-kp-71b6b6339',
      'https://x.com/mohdnihadkp',
      'https://www.threads.com/@mohdnihadkp',
      'https://pin.it/4SKTJurgS',
      'https://www.facebook.com/profile.php?id=61589286702060',
    ],
    knowsAbout: ['AI Development', 'Web Development', 'Photography', 'Videography', 'Digital Marketing'],
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    author: { '@type': 'Person', name: SITE.name },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/#/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}
