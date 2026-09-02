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
    const slug = (sp.get('slug') || '').trim()
    const sort = sp.get('sort') || 'featured'
    const featured = sp.get('featured')
    const adminView = sp.get('admin') === 'true'

    // Single product by slug — full detail page data + related picks
    if (slug) {
      const product = await db.product.findUnique({ where: { slug } })
      if (!product || (!product.active && !adminView)) {
        return badRequest('Product not found.')
      }
      const related = await db.product.findMany({
        where: { active: true, category: product.category, id: { not: product.id } },
        orderBy: { clicks: 'desc' },
        take: 4,
        select: {
          id: true, name: true, slug: true, image: true, price: true, rating: true,
          merchant: true, category: true, badge: true, source: true,
        },
      })
      return ok({ product, related })
    }

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

    const baseSlug = slugify(body.slug || name)
    let slug = baseSlug
    let attempt = 1
    while (await db.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${attempt++}`
    }

    const num = (v: unknown) => (v == null || v === '' ? null : Number.isFinite(Number(v)) ? Number(v) : null)
    const pipe = (v: unknown) => String(v ?? '').split('\n').map((s) => s.trim()).filter(Boolean).join('|')

    const product = await db.product.create({
      data: {
        name,
        slug,
        description: String(body.description || ''),
        image: String(body.image || '').trim() || null,
        gallery: pipe(body.gallery),
        price: num(body.price),
        listPrice: num(body.listPrice),
        currency: String(body.currency || 'INR').trim() || 'INR',
        rating: num(body.rating),
        ratingCount: num(body.ratingCount) ? Math.trunc(num(body.ratingCount) as number) : null,
        merchant: String(body.merchant || '').trim() || null,
        brand: String(body.brand || '').trim() || null,
        source: ['AMAZON', 'FLIPKART', 'EBAY', 'ALIEXPRESS', 'CUSTOM'].includes(String(body.source)) ? String(body.source) : 'CUSTOM',
        category: String(body.category || 'General').trim() || 'General',
        affiliateUrl,
        badge: String(body.badge || '').trim() || null,
        coupon: String(body.coupon || '').trim() || null,
        couponNote: String(body.couponNote || '').trim() || null,
        pros: pipe(body.pros),
        cons: pipe(body.cons),
        specs: String(body.specs || '').trim(),
        buyText: String(body.buyText || '').trim() || 'Buy Now',
        disclosure: String(body.disclosure || '').trim() || null,
        featured: Boolean(body.featured),
        active: body.active !== undefined ? Boolean(body.active) : true,
        sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
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
