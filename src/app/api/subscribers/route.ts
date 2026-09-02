// /api/subscribers — POST (public newsletter signup) | GET (admin)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError, badRequest, validateEmail, parseIntParam } from '@/lib/api-helpers'
import { emitAdminAlert } from '@/lib/realtime-emit'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const sp = req.nextUrl.searchParams
    const page = Math.max(1, parseIntParam(sp.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntParam(sp.get('limit'), 30)))

    const [subscribers, total] = await Promise.all([
      db.subscriber.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.subscriber.count(),
    ])
    return ok({ subscribers, total, page, pages: Math.ceil(total / limit) || 1 })
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()
    if (!validateEmail(email)) return badRequest('Enter a valid email address.')

    const existing = await db.subscriber.findUnique({ where: { email } })
    if (existing) {
      return ok({ success: true, message: 'You are already on the list — see you in your inbox!' })
    }

    await db.subscriber.create({ data: { email, name: String(body.name || '').trim() || null } })
    emitAdminAlert('subscriber', `New newsletter subscriber: ${email}`)

    return ok({ success: true, message: 'Subscribed! Welcome aboard.' }, { status: 201 })
  } catch (err) {
    return handleError(err)
  }
}
