// RSS 2.0 feed — latest 20 published articles. Helps aggregators,
// syndication and backlink discovery (MEO / off-page signals).
import { db } from '@/lib/db'
import { SITE } from '@/lib/constants'

export const dynamic = 'force-dynamic'

function xmlEsc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const posts = await db.post
    .findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 20,
      include: { author: { select: { name: true } } },
    })
    .catch(() => [])

  const items = posts
    .map((p) => {
      const url = `${SITE.url}/blog/${p.slug}`
      const description = (p.excerpt || p.content.slice(0, 300)).replace(/\s+/g, ' ').trim()
      return `    <item>
      <title>${xmlEsc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${xmlEsc(description)}</description>
      <pubDate>${(p.publishedAt || p.createdAt).toUTCString()}</pubDate>
      <author>${xmlEsc(p.author?.name || SITE.fullName)}</author>
${p.tags.split(',').map((t) => t.trim()).filter(Boolean).map((t) => `      <category>${xmlEsc(t)}</category>`).join('\n')}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEsc(`${SITE.name} — Blog`)}</title>
    <link>${SITE.url}/blog</link>
    <description>${xmlEsc('Practical articles on AI-powered development, freelancing, photography and one-person business — from Calicut, Kerala.')}</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    },
  })
}
