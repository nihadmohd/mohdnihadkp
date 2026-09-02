// /api/marquee — GET (public, active items) | POST (admin)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError, badRequest } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    const adminView = req.nextUrl.searchParams.get('admin') === 'true'
    const items = await db.marqueeItem.findMany({
      where: adminView ? {} : { active: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: 60,
    })
    return ok({ items })
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()

    const imageUrl = String(body.imageUrl || '').trim()
    if (!/^(https?:\/\/|\/|data:image\/)/i.test(imageUrl)) {
      return badRequest('Enter an image URL (https://… or /…).')
    }

    const item = await db.marqueeItem.create({
      data: {
        title: String(body.title || '').trim() || null,
        imageUrl,
        linkUrl: /^https?:\/\//i.test(String(body.linkUrl || '')) ? String(body.linkUrl).trim() : null,
        badge: String(body.badge || '').trim() || null,
        active: body.active !== undefined ? Boolean(body.active) : true,
        sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
      },
    })

    await db.activity.create({
      data: { userId: admin.id, action: 'added marquee image', entity: 'marquee', entityId: item.id, meta: item.title || '' },
    })
    return ok({ item }, { status: 201 })
  } catch (err) {
    return handleError(err)
  }
}
