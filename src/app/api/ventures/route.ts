// /api/ventures — GET (public, active; admin=true for all) | POST (admin)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError, badRequest } from '@/lib/api-helpers'

const VALID_ICONS = ['foundation', 'store', 'connect', 'gold', 'study', 'globe']
const VALID_ACCENTS = ['emerald', 'amber', 'teal', 'yellow', 'lime']

export async function GET(req: NextRequest) {
  try {
    const adminView = req.nextUrl.searchParams.get('admin') === 'true'
    const ventures = await db.venture.findMany({
      where: adminView ? {} : { active: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })
    return ok({ ventures })
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()

    const name = String(body.name || '').trim()
    if (name.length < 2) return badRequest('Venture name is required.')

    const venture = await db.venture.create({
      data: {
        name,
        tagline: String(body.tagline || '').trim() || null,
        description: String(body.description || '').trim(),
        href: /^https?:\/\//i.test(String(body.href || '')) || String(body.href || '').startsWith('/')
          ? String(body.href).trim()
          : null,
        icon: VALID_ICONS.includes(body.icon) ? body.icon : 'globe',
        accent: VALID_ACCENTS.includes(body.accent) ? body.accent : 'emerald',
        badge: String(body.badge || '').trim() || null,
        active: body.active !== undefined ? Boolean(body.active) : true,
        sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
      },
    })

    await db.activity.create({
      data: { userId: admin.id, action: 'added venture', entity: 'venture', entityId: venture.id, meta: venture.name },
    })
    return ok({ venture }, { status: 201 })
  } catch (err) {
    return handleError(err)
  }
}
