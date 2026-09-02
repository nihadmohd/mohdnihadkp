// /api/footer/[id] — PATCH | DELETE (admin)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError, notFound } from '@/lib/api-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()

    const link = await db.footerLink.update({
      where: { id },
      data: {
        ...(body.label != null ? { label: String(body.label).trim() } : {}),
        ...(body.url != null ? { url: String(body.url).trim() } : {}),
        ...(body.section != null && ['main', 'explore', 'ventures', 'legal'].includes(body.section)
          ? { section: body.section }
          : {}),
        ...(body.active != null ? { active: Boolean(body.active) } : {}),
        ...(body.sortOrder != null ? { sortOrder: Number(body.sortOrder) || 0 } : {}),
      },
    })
    return ok({ link })
  } catch (err) {
    return handleError(err)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const existing = await db.footerLink.findUnique({ where: { id } })
    if (!existing) return notFound('Footer link not found.')
    await db.footerLink.delete({ where: { id } })
    return ok({ success: true })
  } catch (err) {
    return handleError(err)
  }
}
