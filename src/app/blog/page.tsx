// Blog listing — server-rendered first page of posts for crawlers,
// Blog + BreadcrumbList JSON-LD, keyword title, unique description.
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import BlogView from '@/components/views/blog-view'
import { db } from '@/lib/db'
import { SITE } from '@/lib/constants'
import { getSettings, buildMetadata } from '@/lib/page-data'
import { PAGE_SEO, personJsonLd, breadcrumbJsonLd, jsonLdScript } from '@/lib/seo-metadata'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('blog', '/blog')

export default async function BlogPage() {
  const [settings, posts, allTagRows] = await Promise.all([
    getSettings(),
    db.post.findMany({ where: { published: true }, orderBy: { publishedAt: 'desc' }, take: 9 }).catch(() => []),
    db.post.findMany({ where: { published: true }, select: { tags: true } }).catch(() => []),
  ])

  const total = allTagRows.length
  const tagSet = new Set<string>()
  for (const row of allTagRows) {
    for (const t of (row.tags || '').split(',')) {
      const tt = t.trim()
      if (tt) tagSet.add(tt)
    }
  }

  const initial = {
    posts,
    total,
    pages: Math.max(1, Math.ceil(total / 9)),
    tags: [...tagSet].sort(),
  }

  return (
    <AppShell settings={settings}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Blog',
              '@id': `${SITE.url}/blog#blog`,
              name: 'MN.KP Blog',
              description: PAGE_SEO.blog.description,
              url: `${SITE.url}/blog`,
              inLanguage: 'en-IN',
              publisher: personJsonLd(),
              blogPost: posts.map((p) => ({
                '@type': 'BlogPosting',
                headline: p.title,
                url: `${SITE.url}/blog/${p.slug}`,
                datePublished: p.publishedAt?.toISOString(),
                description: p.excerpt || undefined,
              })),
            },
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Blog', path: '/blog' },
            ]),
          ],
        })}
      />
      <Suspense>
        <BlogView initial={initial as unknown as import('@/components/views/blog-view').PostsResponse} />
      </Suspense>
    </AppShell>
  )
}
