// /api/media/[id] — PATCH (admin) | DELETE (admin)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError, notFound } from '@/lib/api-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()

    const media = await db.media.update({
      where: { id },
      data: {
        ...(body.name != null ? { name: String(body.name).trim() } : {}),
        ...(body.alt != null ? { alt: String(body.alt).trim() || null } : {}),
        ...(body.type != null && ['image', 'gif', 'sticker'].includes(body.type) ? { type: body.type } : {}),
      },
    })
    return ok({ media })
  } catch (err) {
    return handleError(err)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const existing = await db.media.findUnique({ where: { id } })
    if (!existing) return notFound('Media not found.')
    await db.media.delete({ where: { id } })
    return ok({ success: true })
  } catch (err) {
    return handleError(err)
  }
}
