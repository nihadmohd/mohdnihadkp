// /api/services — GET (public) | POST (admin)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, slugify } from '@/lib/auth'
import { ok, handleError, badRequest } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    const adminView = req.nextUrl.searchParams.get('admin') === 'true'
    const services = await db.service.findMany({
      where: adminView ? {} : { active: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })
    return ok({ services })
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    const title = String(body.title || '').trim()
    if (!title) return badRequest('Service title is required.')

    const baseSlug = slugify(title)
    let slug = baseSlug
    let attempt = 1
    while (await db.service.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${attempt++}`
    }

    const service = await db.service.create({
      data: {
        title,
        slug,
        description: String(body.description || ''),
        icon: String(body.icon || 'sparkles'),
        features: String(body.features || ''),
        priceFrom: String(body.priceFrom || '').trim() || null,
        featured: Boolean(body.featured),
        active: body.active !== undefined ? Boolean(body.active) : true,
        sortOrder: Number(body.sortOrder) || 0,
      },
    })

    await db.activity.create({
      data: { userId: admin.id, action: 'created service', entity: 'service', entityId: service.id, meta: title },
    })

    return ok({ service }, { status: 201 })
  } catch (err) {
    return handleError(err)
  }
}
