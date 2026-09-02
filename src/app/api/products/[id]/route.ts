// /api/products/[id] — PUT (admin) | DELETE (admin)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
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

    const product = await db.product.update({
      where: { id },
      data: {
        name: body.name !== undefined ? String(body.name).trim() : existing.name,
        description: body.description !== undefined ? String(body.description) : existing.description,
        image: body.image !== undefined ? String(body.image).trim() || null : existing.image,
        price: body.price !== undefined ? (body.price === '' || body.price == null ? null : Number(body.price)) : existing.price,
        rating: body.rating !== undefined ? (body.rating === '' || body.rating == null ? null : Number(body.rating)) : existing.rating,
        merchant: body.merchant !== undefined ? String(body.merchant).trim() || null : existing.merchant,
        category: body.category !== undefined ? String(body.category).trim() || 'General' : existing.category,
        affiliateUrl,
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
