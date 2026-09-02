// /api/services/[id] — PUT (admin) | DELETE (admin)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError, badRequest } from '@/lib/api-helpers'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireAdmin()
    const { id } = await ctx.params
    const existing = await db.service.findUnique({ where: { id } })
    if (!existing) return badRequest('Service not found.')

    const body = await req.json()
    const service = await db.service.update({
      where: { id },
      data: {
        title: body.title !== undefined ? String(body.title).trim() : existing.title,
        description: body.description !== undefined ? String(body.description) : existing.description,
        icon: body.icon !== undefined ? String(body.icon) : existing.icon,
        features: body.features !== undefined ? String(body.features) : existing.features,
        priceFrom: body.priceFrom !== undefined ? String(body.priceFrom).trim() || null : existing.priceFrom,
        featured: body.featured !== undefined ? Boolean(body.featured) : existing.featured,
        active: body.active !== undefined ? Boolean(body.active) : existing.active,
        sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) || 0 : existing.sortOrder,
      },
    })

    await db.activity.create({
      data: { userId: admin.id, action: 'updated service', entity: 'service', entityId: id, meta: service.title },
    })

    return ok({ service })
  } catch (err) {
    return handleError(err)
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireAdmin()
    const { id } = await ctx.params
    const existing = await db.service.findUnique({ where: { id } })
    if (!existing) return badRequest('Service not found.')

    await db.service.delete({ where: { id } })
    await db.activity.create({
      data: { userId: admin.id, action: 'removed service', entity: 'service', entityId: id, meta: existing.title },
    })

    return ok({ success: true })
  } catch (err) {
    return handleError(err)
  }
}
