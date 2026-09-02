// GET /api/users — admin user management list
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError, parseIntParam } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const sp = req.nextUrl.searchParams
    const page = Math.max(1, parseIntParam(sp.get('page'), 1))
    const limit = Math.min(50, Math.max(1, parseIntParam(sp.get('limit'), 20)))
    const q = (sp.get('q') || '').trim()

    const where: Record<string, unknown> = {}
    if (q) {
      where.OR = [{ email: { contains: q } }, { name: { contains: q } }]
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, email: true, name: true, role: true, banned: true, plan: true,
          emailVerified: true, onboarded: true, lastLoginAt: true, createdAt: true,
          _count: { select: { posts: true, comments: true } },
        },
      }),
      db.user.count({ where }),
    ])

    return ok({ users, total, page, pages: Math.ceil(total / limit) || 1 })
  } catch (err) {
    return handleError(err)
  }
}
