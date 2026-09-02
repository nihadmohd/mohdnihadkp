// /api/ventures/[id] — PUT (full edit) | DELETE (admin)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError, notFound, badRequest } from '@/lib/api-helpers'

const VALID_ICONS = ['foundation', 'store', 'connect', 'gold', 'study', 'globe']
const VALID_ACCENTS = ['emerald', 'amber', 'teal', 'yellow', 'lime']

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const body = await req.json()

    const existing = await db.venture.findUnique({ where: { id } })
    if (!existing) return notFound('Venture not found.')

    const name = String(body.name ?? existing.name).trim()
    if (name.length < 2) return badRequest('Venture name is required.')

    const venture = await db.venture.update({
      where: { id },
      data: {
        name,
        tagline: String(body.tagline ?? existing.tagline ?? '').trim() || null,
        description: String(body.description ?? existing.description).trim(),
        href: (() => {
          const raw = String(body.href ?? existing.href ?? '').trim()
          return /^https?:\/\//i.test(raw) || raw.startsWith('/') ? raw : null
        })(),
        icon: VALID_ICONS.includes(body.icon) ? body.icon : existing.icon,
        accent: VALID_ACCENTS.includes(body.accent) ? body.accent : existing.accent,
        badge: String(body.badge ?? existing.badge ?? '').trim() || null,
        ...(body.active != null ? { active: Boolean(body.active) } : {}),
        ...(body.sortOrder != null ? { sortOrder: Number(body.sortOrder) || 0 } : {}),
      },
    })

    await db.activity.create({
      data: { userId: admin.id, action: 'updated venture', entity: 'venture', entityId: venture.id, meta: venture.name },
    })
    return ok({ venture })
  } catch (err) {
    return handleError(err)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const existing = await db.venture.findUnique({ where: { id } })
    if (!existing) return notFound('Venture not found.')

    await db.venture.delete({ where: { id } })
    await db.activity.create({
      data: { userId: admin.id, action: 'deleted venture', entity: 'venture', entityId: id, meta: existing.name },
    })
    return ok({ deleted: true })
  } catch (err) {
    return handleError(err)
  }
}
