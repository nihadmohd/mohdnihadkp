// /api/inquiries — GET (admin) | POST (public service inquiry form)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError, badRequest, validateEmail, parseIntParam } from '@/lib/api-helpers'
import { emitAdminAlert } from '@/lib/realtime-emit'
import { recordSubmission } from '@/lib/forms'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const sp = req.nextUrl.searchParams
    const page = Math.max(1, parseIntParam(sp.get('page'), 1))
    const limit = Math.min(50, Math.max(1, parseIntParam(sp.get('limit'), 20)))
    const status = sp.get('status') || ''

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const [inquiries, total, counts] = await Promise.all([
      db.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { service: { select: { title: true } } },
      }),
      db.inquiry.count({ where }),
      db.inquiry.groupBy({ by: ['status'], _count: { status: true } }),
    ])

    return ok({
      inquiries,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      counts: Object.fromEntries(counts.map((c) => [c.status, c._count.status])),
    })
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const message = String(body.message || '').trim()
    const phone = String(body.phone || '').trim()
    const subject = String(body.subject || '').trim()
    const budget = String(body.budget || '').trim()
    const serviceId = String(body.serviceId || '').trim() || null

    if (!name) return badRequest('Please enter your name.')
    if (!validateEmail(email)) return badRequest('Please enter a valid email so I can reply.')
    if (message.length < 10) return badRequest('Tell me a little more about the project (at least 10 characters).')

    if (serviceId) {
      const svc = await db.service.findUnique({ where: { id: serviceId } })
      if (!svc) return badRequest('Selected service does not exist.')
    }

    const inquiry = await db.inquiry.create({
      data: { name, email, message, phone: phone || null, subject: subject || null, budget: budget || null, serviceId },
    })

    // Mirror into the unified submissions table so every form the
    // visitor fills is visible in the admin Submissions section.
    await recordSubmission({
      formType: serviceId ? 'service-inquiry' : 'contact',
      name, email, phone: phone || null,
      subject: subject || 'General inquiry',
      message,
      data: { budget: budget || null, serviceId, source: 'inquiry form' },
    })

    if (serviceId) {
      await db.service.update({ where: { id: serviceId }, data: { inquiries: { increment: 1 } } })
    }

    await db.activity.create({
      data: { action: 'new inquiry', entity: 'inquiry', entityId: inquiry.id, meta: `${name} — ${subject || 'general'}` },
    })

    // Instant admin alert via realtime service
    emitAdminAlert('inquiry', `New inquiry from ${name}${subject ? ` — ${subject}` : ''}`)

    return ok(
      { success: true, inquiry: { id: inquiry.id, createdAt: inquiry.createdAt } },
      { status: 201 }
    )
  } catch (err) {
    return handleError(err)
  }
}
