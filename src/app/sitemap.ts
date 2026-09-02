// Dynamic sitemap — every real URL (static pages + all published
// posts + all active products + legal docs) with lastModified
// dates from the database. Google Search Console ready.
import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { SITE } from '@/lib/constants'
import { LEGAL_DOCS } from '@/lib/legal-content'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, products] = await Promise.all([
    db.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      select: { slug: true, updatedAt: true, publishedAt: true },
    }).catch(() => []),
    db.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }).catch(() => []),
  ])

  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE.url}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE.url}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE.url}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE.url}/store`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE.url}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE.url}/ventures`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE.url}/help`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]

  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE.url}/blog/${p.slug}`,
    lastModified: p.updatedAt || p.publishedAt || now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE.url}/store/${p.slug}`,
    lastModified: p.updatedAt || now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const legalPages: MetadataRoute.Sitemap = LEGAL_DOCS.map((doc) => ({
    url: `${SITE.url}/legal/${doc.slug}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }))

  return [...staticPages, ...postPages, ...productPages, ...legalPages]
}
