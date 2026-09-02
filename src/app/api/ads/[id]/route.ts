// /api/ads/[id] — PATCH | DELETE (admin)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError, notFound } from '@/lib/api-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()

    const ad = await db.adUnit.update({
      where: { id },
      data: {
        ...(body.title != null ? { title: String(body.title).trim() } : {}),
        ...(body.description != null ? { description: String(body.description).trim() || null } : {}),
        ...(body.imageUrl != null ? { imageUrl: String(body.imageUrl).trim() || null } : {}),
        ...(body.linkUrl != null ? { linkUrl: /^https?:\/\//i.test(body.linkUrl) ? String(body.linkUrl).trim() : null } : {}),
        ...(body.productId !== undefined ? { productId: String(body.productId || '').trim() || null } : {}),
        ...(body.badge != null ? { badge: String(body.badge).trim() || null } : {}),
        ...(body.placement != null ? { placement: String(body.placement) } : {}),
        ...(body.active != null ? { active: Boolean(body.active) } : {}),
        ...(body.sortOrder != null ? { sortOrder: Number(body.sortOrder) || 0 } : {}),
      },
    })
    return ok({ ad })
  } catch (err) {
    return handleError(err)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const existing = await db.adUnit.findUnique({ where: { id } })
    if (!existing) return notFound('Ad unit not found.')
    await db.adUnit.delete({ where: { id } })
    return ok({ success: true })
  } catch (err) {
    return handleError(err)
  }
}
