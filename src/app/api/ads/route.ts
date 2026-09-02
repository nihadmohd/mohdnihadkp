// /api/ads — GET ?placement= (public, resolved with product data) | POST (admin)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError, badRequest } from '@/lib/api-helpers'

const PLACEMENTS = ['home', 'blog-list', 'blog-inline', 'blog-sidebar', 'store', 'services', 'footer']

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const placement = (sp.get('placement') || '').trim()
    const adminView = sp.get('admin') === 'true'

    const where: Record<string, unknown> = {}
    if (!adminView) where.active = true
    if (placement && PLACEMENTS.includes(placement)) where.placement = placement

    const ads = await db.adUnit.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: 24,
    })

    // Resolve linked products so the client can render rich ad cards
    const productIds = ads.map((a) => a.productId).filter(Boolean) as string[]
    const products = productIds.length
      ? await db.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true, name: true, slug: true, image: true, price: true, listPrice: true,
            rating: true, merchant: true, source: true, badge: true, category: true, affiliateUrl: true,
          },
        })
      : []
    const byId = new Map(products.map((p) => [p.id, p]))

    return ok({
      ads: ads.map((a) => ({ ...a, product: a.productId ? byId.get(a.productId) ?? null : null })),
    })
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()

    const title = String(body.title || '').trim()
    const placement = String(body.placement || 'sidebar').trim()
    if (!title) return badRequest('Give the ad a title.')
    if (!PLACEMENTS.includes(placement)) return badRequest('Invalid placement.')

    let productId: string | null = String(body.productId || '').trim() || null
    if (productId) {
      const p = await db.product.findUnique({ where: { id: productId } })
      if (!p) return badRequest('Linked product does not exist.')
    }

    const ad = await db.adUnit.create({
      data: {
        title,
        description: String(body.description || '').trim() || null,
        imageUrl: String(body.imageUrl || '').trim() || null,
        linkUrl: /^https?:\/\//i.test(String(body.linkUrl || '')) ? String(body.linkUrl).trim() : null,
        productId,
        badge: String(body.badge || '').trim() || null,
        placement,
        active: body.active !== undefined ? Boolean(body.active) : true,
        sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
      },
    })

    await db.activity.create({
      data: { userId: admin.id, action: 'created ad unit', entity: 'ad', entityId: ad.id, meta: `${placement}: ${title}` },
    })
    return ok({ ad }, { status: 201 })
  } catch (err) {
    return handleError(err)
  }
}
