// /api/submissions — GET (admin): every form visitors filled, with contact
// details + counts per type. Optionally enriched cross-table totals.
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError, parseIntParam } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const sp = req.nextUrl.searchParams
    const page = Math.max(1, parseIntParam(sp.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntParam(sp.get('limit'), 30)))
    const type = (sp.get('type') || '').trim()
    const status = (sp.get('status') || '').trim()

    const where: Record<string, unknown> = {}
    if (type) where.formType = type
    if (status) where.status = status

    const [submissions, total, byType, byStatus, counts] = await Promise.all([
      db.formSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.formSubmission.count({ where }),
      db.formSubmission.groupBy({ by: ['formType'], _count: { _all: true } }),
      db.formSubmission.groupBy({ by: ['status'], _count: { _all: true } }),
      Promise.all([
        db.inquiry.count(),
        db.subscriber.count(),
        db.comment.count(),
        db.supportTicket.count(),
      ]),
    ])

    return ok({
      submissions,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      byType: byType.map((t) => ({ type: t.formType, count: t._count._all })),
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
      related: {
        inquiries: counts[0],
        subscribers: counts[1],
        comments: counts[2],
        support: counts[3],
      },
    })
  } catch (err) {
    return handleError(err)
  }
}
