// Home — server-rendered landing page (SEO: Person + WebSite +
// ProfessionalService JSON-LD, keyword title, unique description).
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import HomeView from '@/components/views/home-view'
import { getSettings, getActiveServices, getActiveProducts, getPublishedPosts, buildMetadata } from '@/lib/page-data'
import {
  PAGE_SEO, personJsonLd, websiteJsonLd, professionalServiceJsonLd, jsonLdScript,
} from '@/lib/seo-metadata'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('home', '/')

async function getHomeData() {
  const [settings, services, featuredPosts, latestPosts, featuredProducts] = await Promise.all([
    getSettings(),
    getActiveServices(),
    getPublishedPosts({ featured: true, limit: 3, select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, tags: true, views: true, readingMinutes: true, publishedAt: true, author: { select: { name: true, image: true } } } }),
    getPublishedPosts({ limit: 3, select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, tags: true, views: true, readingMinutes: true, publishedAt: true } }),
    getActiveProducts({ featured: true, limit: 4 }),
  ])

  return { settings, services, featuredPosts, latestPosts, featuredProducts }
}

export default async function Page() {
  const initial = await getHomeData()
  return (
    <AppShell settings={initial.settings}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript({
          '@context': 'https://schema.org',
          '@graph': [
            personJsonLd(),
            websiteJsonLd(),
            professionalServiceJsonLd(),
          ],
        })}
      />
      <Suspense>
        <HomeView initial={initial} />
      </Suspense>
    </AppShell>
  )
}
