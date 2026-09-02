// GET /api/admin/stats — dashboard overview + poller for new alerts
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError } from '@/lib/api-helpers'

export async function GET() {
  try {
    await requireAdmin()

    const [newInquiries, pendingComments, drafts, users, posts, products, subscribers, views] =
      await Promise.all([
        db.inquiry.count({ where: { status: 'NEW' } }),
        db.comment.count({ where: { approved: false } }),
        db.post.count({ where: { published: false } }),
        db.user.count(),
        db.post.count({ where: { published: true } }),
        db.product.count({ where: { active: true } }),
        db.subscriber.count(),
        db.pageView.count(),
      ])

    const [openTickets, resolvedTickets] = await Promise.all([
      db.supportTicket.count({ where: { status: { in: ['OPEN', 'PENDING'] } } }),
      db.supportTicket.count({ where: { status: { in: ['RESOLVED', 'CLOSED'] } } }),
    ])

    return ok({
      newInquiries,
      pendingComments,
      drafts,
      users,
      posts,
      products,
      subscribers,
      views,
      openTickets,
      resolvedTickets,
      ts: Date.now(),
    })
  } catch (err) {
    return handleError(err)
  }
}
