// GET /api/analytics/summary — admin analytics dashboard
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError } from '@/lib/api-helpers'

export async function GET() {
  try {
    await requireAdmin()

    const now = new Date()
    const dayMs = 24 * 3600 * 1000

    // Total + last-7-day series
    const [totalViews, totalSessions, uniqueVisitors, postCount, publishedCount, productCount,
      inquiryCount, newInquiries, subscriberCount, userCount, commentCount, pendingComments] =
      await Promise.all([
        db.pageView.count(),
        db.pageView.groupBy({ by: ['sessionId'] }).then((g) => g.length),
        db.user.count(),
        db.post.count(),
        db.post.count({ where: { published: true } }),
        db.product.count(),
        db.inquiry.count(),
        db.inquiry.count({ where: { status: 'NEW' } }),
        db.subscriber.count(),
        db.user.count(),
        db.comment.count(),
        db.comment.count({ where: { approved: false } }),
      ])

    // 7-day traffic series
    const series: { date: string; views: number; sessions: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now.getTime() - i * dayMs)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start.getTime() + dayMs)
      const [views, sessionRows] = await Promise.all([
        db.pageView.count({ where: { createdAt: { gte: start, lt: end } } }),
        db.pageView.findMany({
          where: { createdAt: { gte: start, lt: end } },
          select: { sessionId: true },
          distinct: ['sessionId'],
        }),
      ])
      series.push({
        date: start.toLocaleDateString('en-IN', { weekday: 'short' }),
        views,
        sessions: sessionRows.length,
      })
    }

    // Top pages (all time, top 10)
    const topPages = await db.pageView.groupBy({
      by: ['path'],
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 10,
    })

    // Device split
    const devices = await db.pageView.groupBy({
      by: ['device'],
      _count: { device: true },
    })

    // Referrers (top 8, non-empty)
    const referrerRows = await db.pageView.findMany({
      where: { referrer: { not: null } },
      select: { referrer: true },
      take: 5000,
      orderBy: { createdAt: 'desc' },
    })
    const refMap = new Map<string, number>()
    for (const row of referrerRows) {
      let host = 'direct'
      try {
        host = new URL(row.referrer!).hostname.replace(/^www\./, '')
      } catch {
        host = 'direct'
      }
      refMap.set(host, (refMap.get(host) || 0) + 1)
    }
    const topReferrers = Array.from(refMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([host, count]) => ({ host, count }))

    // Affiliate clicks
    const topProducts = await db.product.findMany({
      where: { clicks: { gt: 0 } },
      orderBy: { clicks: 'desc' },
      take: 8,
      select: { name: true, clicks: true, category: true },
    })

    // Popular posts
    const popularPosts = await db.post.findMany({
      where: { published: true },
      orderBy: { views: 'desc' },
      take: 8,
      select: { title: true, views: true, slug: true },
    })

    return ok({
      stats: {
        totalViews,
        uniqueVisitors,
        postCount,
        publishedCount,
        productCount,
        inquiryCount,
        newInquiries,
        subscriberCount,
        userCount,
        commentCount,
        pendingComments,
      },
      series,
      topPages: topPages.map((p) => ({ path: p.path, count: p._count.path })),
      devices: devices.map((d) => ({ device: d.device, count: d._count.device })),
      topReferrers,
      topProducts,
      popularPosts,
    })
  } catch (err) {
    return handleError(err)
  }
}
