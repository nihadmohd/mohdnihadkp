// Root page — server renders the SPA shell with initial data for instant first paint.
// All "pages" are client-side hash routes handled by <SiteRoot />.
import { Suspense } from 'react'
import SiteRoot from '@/components/site/site-root'
import { db } from '@/lib/db'

async function getInitialData() {
  const [
    settingsRows,
    services,
    featuredPosts,
    featuredProducts,
    latestPosts,
  ] = await Promise.all([
    db.setting.findMany().catch(() => []),
    db.service
      .findMany({ where: { active: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] })
      .catch(() => []),
    db.post
      .findMany({
        where: { published: true, featured: true },
        orderBy: { publishedAt: 'desc' },
        take: 3,
        select: {
          id: true, title: true, slug: true, excerpt: true, coverImage: true, tags: true,
          views: true, readingMinutes: true, publishedAt: true,
          author: { select: { name: true, image: true } },
        },
      })
      .catch(() => []),
    db.product
      .findMany({
        where: { active: true, featured: true },
        orderBy: { sortOrder: 'asc' },
        take: 4,
      })
      .catch(() => []),
    db.post
      .findMany({
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
        take: 3,
        select: {
          id: true, title: true, slug: true, excerpt: true, coverImage: true, tags: true,
          views: true, readingMinutes: true, publishedAt: true,
        },
      })
      .catch(() => []),
  ])

  const settings: Record<string, string> = {}
  for (const row of settingsRows) settings[row.key] = row.value

  return {
    settings,
    services,
    featuredPosts,
    latestPosts,
    featuredProducts,
  }
}

export default async function Page() {
  const initial = await getInitialData()
  return (
    <Suspense>
      <SiteRoot initial={initial} />
    </Suspense>
  )
}
