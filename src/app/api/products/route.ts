// /api/products — GET (public store list) | POST (admin create)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, slugify } from '@/lib/auth'
import { ok, handleError, badRequest, parseIntParam } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const page = Math.max(1, parseIntParam(sp.get('page'), 1))
    const limit = Math.min(48, Math.max(1, parseIntParam(sp.get('limit'), 12)))
    const q = (sp.get('q') || '').trim()
    const category = (sp.get('category') || '').trim()
    const sort = sp.get('sort') || 'featured'
    const featured = sp.get('featured')
    const adminView = sp.get('admin') === 'true'

    const where: Record<string, unknown> = {}
    if (!adminView) where.active = true
    if (category) where.category = category
    if (featured === 'true') where.featured = true
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { merchant: { contains: q } },
        { category: { contains: q } },
      ]
    }

    const orderBy: Record<string, string> =
      sort === 'price-asc' ? { price: 'asc' }
      : sort === 'price-desc' ? { price: 'desc' }
      : sort === 'rating' ? { rating: 'desc' }
      : sort === 'clicks' ? { clicks: 'desc' }
      : sort === 'newest' ? { createdAt: 'desc' }
      : { sortOrder: 'asc' }

    const [products, total, categories] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
      db.product.groupBy({
        by: ['category'],
        where: adminView ? {} : { active: true },
        _count: { category: true },
      }),
    ])

    return ok({
      products,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      categories: categories
        .map((c) => ({ name: c.category, count: c._count.category }))
        .sort((a, b) => b.count - a.count),
    })
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()

    const name = String(body.name || '').trim()
    const affiliateUrl = String(body.affiliateUrl || '').trim()
    if (!name) return badRequest('Product name is required.')
    if (!/^https?:\/\//i.test(affiliateUrl)) return badRequest('A valid affiliate URL (http/https) is required.')

    const baseSlug = slugify(name)
    let slug = baseSlug
    let attempt = 1
    while (await db.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${attempt++}`
    }

    const product = await db.product.create({
      data: {
        name,
        slug,
        description: String(body.description || ''),
        image: String(body.image || '').trim() || null,
        price: body.price != null && body.price !== '' ? Number(body.price) : null,
        rating: body.rating != null && body.rating !== '' ? Number(body.rating) : null,
        merchant: String(body.merchant || '').trim() || null,
        category: String(body.category || 'General').trim() || 'General',
        affiliateUrl,
        featured: Boolean(body.featured),
        active: body.active !== undefined ? Boolean(body.active) : true,
      },
    })

    await db.activity.create({
      data: { userId: admin.id, action: 'added product', entity: 'product', entityId: product.id, meta: name },
    })

    return ok({ product }, { status: 201 })
  } catch (err) {
    return handleError(err)
  }
}
