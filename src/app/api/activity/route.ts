// GET /api/activity — admin activity log
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError, parseIntParam } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const sp = req.nextUrl.searchParams
    const page = Math.max(1, parseIntParam(sp.get('page'), 1))
    const limit = Math.min(50, Math.max(1, parseIntParam(sp.get('limit'), 25)))

    const [activities, total] = await Promise.all([
      db.activity.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { name: true, email: true } } },
      }),
      db.activity.count(),
    ])

    return ok({ activities, total, page, pages: Math.ceil(total / limit) || 1 })
  } catch (err) {
    return handleError(err)
  }
}
