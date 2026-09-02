// Server-side data helpers shared by route pages (server components).
import { db } from '@/lib/db'
import { PAGE_SEO } from '@/lib/seo-metadata'
import type { Metadata } from 'next'
import { SITE } from '@/lib/constants'

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const rows = await db.setting.findMany()
    const settings: Record<string, string> = {}
    for (const row of rows) settings[row.key] = row.value
    return settings
  } catch {
    return {}
  }
}

export async function getPublishedPosts(opts: {
  limit?: number
  featured?: boolean
  select?: object
  tag?: string
} = {}) {
  try {
    return await db.post.findMany({
      where: {
        published: true,
        ...(opts.featured ? { featured: true } : {}),
        ...(opts.tag ? { tags: { contains: opts.tag } } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      ...(opts.limit ? { take: opts.limit } : {}),
      ...(opts.select ? { select: opts.select } : {}),
    })
  } catch {
    return []
  }
}

export async function getActiveProducts(opts: { limit?: number; featured?: boolean } = {}) {
  try {
    return await db.product.findMany({
      where: { active: true, ...(opts.featured ? { featured: true } : {}) },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      ...(opts.limit ? { take: opts.limit } : {}),
    })
  } catch {
    return []
  }
}

export async function getActiveServices() {
  try {
    return await db.service.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })
  } catch {
    return []
  }
}

export async function getPostBySlug(slug: string) {
  try {
    return await db.post.findFirst({ where: { slug, published: true } })
  } catch {
    return null
  }
}

export async function getProductBySlug(slug: string) {
  try {
    return await db.product.findFirst({ where: { slug, active: true } })
  } catch {
    return null
  }
}

// ── Standard metadata builder for static pages ───────────────
export function buildMetadata(
  page: keyof typeof PAGE_SEO,
  path: string,
  extra: {
    title?: string
    description?: string
    image?: string
    type?: 'website' | 'article' | 'profile'
    noindex?: boolean
    publishedTime?: string
  } = {}
): Metadata {
  const meta = PAGE_SEO[page]
  const title = extra.title || meta.title
  const description = extra.description || meta.description
  return {
    title: { absolute: title },
    description,
    keywords: meta.keywords,
    alternates: { canonical: path },
    robots: extra.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `${SITE.url}${path}`,
      siteName: SITE.name,
      locale: SITE.locale,
      type: extra.type || 'website',
      images: [{ url: extra.image || '/og-image.png', width: 1200, height: 630, alt: title }],
      ...(extra.publishedTime ? { publishedTime: extra.publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@mohdnihadkp',
      images: [extra.image || '/og-image.png'],
    },
  }
}
