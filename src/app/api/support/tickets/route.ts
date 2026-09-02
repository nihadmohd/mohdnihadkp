// /api/support/tickets — GET (mine or all for admin) | POST (create)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { ok, handleError, badRequest, parseIntParam } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser()
    const sp = req.nextUrl.searchParams
    const page = Math.max(1, parseIntParam(sp.get('page'), 1))
    const limit = Math.min(30, Math.max(1, parseIntParam(sp.get('limit'), 15)))
    const status = sp.get('status') || ''
    const all = sp.get('all') === 'true' && user.role === 'ADMIN'

    const where: Record<string, unknown> = {}
    if (!all) where.userId = user.id
    if (status) where.status = status

    const [tickets, total] = await Promise.all([
      db.supportTicket.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: all ? { user: { select: { name: true, email: true } } } : undefined,
      }),
      db.supportTicket.count({ where }),
    ])

    return ok({ tickets, total, page, pages: Math.ceil(total / limit) || 1 })
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    const body = await req.json()
    const subject = String(body.subject || '').trim()
    const message = String(body.message || '').trim()
    const category = String(body.category || 'general').trim()
    const priority = String(body.priority || 'normal').trim()

    if (subject.length < 4) return badRequest('Give your ticket a clear subject.')
    if (message.length < 10) return badRequest('Describe the issue in a little more detail.')

    const messages = JSON.stringify([{ from: 'user', body: message, at: new Date().toISOString() }])

    const ticket = await db.supportTicket.create({
      data: { userId: user.id, subject, category, priority, messages },
    })

    return ok({ success: true, ticket }, { status: 201 })
  } catch (err) {
    return handleError(err)
  }
}
