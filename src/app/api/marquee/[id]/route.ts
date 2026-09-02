// /api/marquee/[id] — PATCH | DELETE (admin)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError, notFound } from '@/lib/api-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()

    const item = await db.marqueeItem.update({
      where: { id },
      data: {
        ...(body.title != null ? { title: String(body.title).trim() || null } : {}),
        ...(body.imageUrl != null ? { imageUrl: String(body.imageUrl).trim() } : {}),
        ...(body.linkUrl != null ? { linkUrl: /^https?:\/\//i.test(body.linkUrl) ? String(body.linkUrl).trim() : null } : {}),
        ...(body.badge != null ? { badge: String(body.badge).trim() || null } : {}),
        ...(body.active != null ? { active: Boolean(body.active) } : {}),
        ...(body.sortOrder != null ? { sortOrder: Number(body.sortOrder) || 0 } : {}),
      },
    })
    return ok({ item })
  } catch (err) {
    return handleError(err)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const existing = await db.marqueeItem.findUnique({ where: { id } })
    if (!existing) return notFound('Marquee item not found.')
    await db.marqueeItem.delete({ where: { id } })
    return ok({ success: true })
  } catch (err) {
    return handleError(err)
  }
}
