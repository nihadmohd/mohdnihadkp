// /api/inquiries/[id] — PATCH (admin: status) | DELETE (admin)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError, badRequest } from '@/lib/api-helpers'

type Ctx = { params: Promise<{ id: string }> }

const STATUSES = ['NEW', 'READ', 'REPLIED', 'CLOSED']

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireAdmin()
    const { id } = await ctx.params
    const body = await req.json()
    const status = String(body.status || '').toUpperCase()
    if (!STATUSES.includes(status)) return badRequest('Invalid status.')

    const inquiry = await db.inquiry.update({ where: { id }, data: { status } })
    await db.activity.create({
      data: { userId: admin.id, action: `inquiry → ${status.toLowerCase()}`, entity: 'inquiry', entityId: id, meta: inquiry.name },
    })
    return ok({ inquiry })
  } catch (err) {
    return handleError(err)
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireAdmin()
    const { id } = await ctx.params
    const existing = await db.inquiry.findUnique({ where: { id } })
    if (!existing) return badRequest('Inquiry not found.')

    await db.inquiry.delete({ where: { id } })
    await db.activity.create({
      data: { userId: admin.id, action: 'deleted inquiry', entity: 'inquiry', entityId: id, meta: existing.name },
    })
    return ok({ success: true })
  } catch (err) {
    return handleError(err)
  }
}
