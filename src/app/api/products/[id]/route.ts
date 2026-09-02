// /api/products/[id] — PUT (admin) | DELETE (admin)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, slugify } from '@/lib/auth'
import { ok, handleError, badRequest } from '@/lib/api-helpers'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireAdmin()
    const { id } = await ctx.params
    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) return badRequest('Product not found.')

    const body = await req.json()
    const affiliateUrl = body.affiliateUrl !== undefined ? String(body.affiliateUrl).trim() : existing.affiliateUrl
    if (affiliateUrl && !/^https?:\/\//i.test(affiliateUrl)) {
      return badRequest('Affiliate URL must start with http:// or https://')
    }

    const num = (v: unknown) => (v == null || v === '' ? null : Number.isFinite(Number(v)) ? Number(v) : null)
    const pipe = (v: unknown) => String(v ?? '').split('\n').map((s) => s.trim()).filter(Boolean).join('|')

    const product = await db.product.update({
      where: { id },
      data: {
        name: body.name !== undefined ? String(body.name).trim() : existing.name,
        slug: body.slug !== undefined && String(body.slug).trim() ? slugify(body.slug) : existing.slug,
        description: body.description !== undefined ? String(body.description) : existing.description,
        image: body.image !== undefined ? String(body.image).trim() || null : existing.image,
        gallery: body.gallery !== undefined ? pipe(body.gallery) : existing.gallery,
        price: body.price !== undefined ? num(body.price) : existing.price,
        listPrice: body.listPrice !== undefined ? num(body.listPrice) : existing.listPrice,
        currency: body.currency !== undefined ? String(body.currency).trim() || 'INR' : existing.currency,
        rating: body.rating !== undefined ? num(body.rating) : existing.rating,
        ratingCount: body.ratingCount !== undefined ? num(body.ratingCount) : existing.ratingCount,
        merchant: body.merchant !== undefined ? String(body.merchant).trim() || null : existing.merchant,
        brand: body.brand !== undefined ? String(body.brand).trim() || null : existing.brand,
        source: body.source !== undefined && ['AMAZON', 'FLIPKART', 'EBAY', 'ALIEXPRESS', 'CUSTOM'].includes(String(body.source))
          ? String(body.source) : existing.source,
        category: body.category !== undefined ? String(body.category).trim() || 'General' : existing.category,
        affiliateUrl,
        badge: body.badge !== undefined ? String(body.badge).trim() || null : existing.badge,
        coupon: body.coupon !== undefined ? String(body.coupon).trim() || null : existing.coupon,
        couponNote: body.couponNote !== undefined ? String(body.couponNote).trim() || null : existing.couponNote,
        pros: body.pros !== undefined ? pipe(body.pros) : existing.pros,
        cons: body.cons !== undefined ? pipe(body.cons) : existing.cons,
        specs: body.specs !== undefined ? String(body.specs).trim() : existing.specs,
        buyText: body.buyText !== undefined ? String(body.buyText).trim() || 'Buy Now' : existing.buyText,
        disclosure: body.disclosure !== undefined ? String(body.disclosure).trim() || null : existing.disclosure,
        featured: body.featured !== undefined ? Boolean(body.featured) : existing.featured,
        active: body.active !== undefined ? Boolean(body.active) : existing.active,
        sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) || 0 : existing.sortOrder,
      },
    })

    await db.activity.create({
      data: { userId: admin.id, action: 'updated product', entity: 'product', entityId: id, meta: product.name },
    })

    return ok({ product })
  } catch (err) {
    return handleError(err)
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireAdmin()
    const { id } = await ctx.params
    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) return badRequest('Product not found.')

    await db.product.delete({ where: { id } })
    await db.activity.create({
      data: { userId: admin.id, action: 'removed product', entity: 'product', entityId: id, meta: existing.name },
    })

    return ok({ success: true })
  } catch (err) {
    return handleError(err)
  }
}
