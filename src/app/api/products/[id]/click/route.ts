// POST /api/products/[id]/click — track an affiliate click then return target URL
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, handleError, badRequest } from '@/lib/api-helpers'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    const product = await db.product.update({
      where: { id },
      data: { clicks: { increment: 1 } },
      select: { affiliateUrl: true, active: true },
    })
    if (!product.active) return badRequest('This product is no longer available.')
    return ok({ url: product.affiliateUrl })
  } catch (err) {
    return handleError(err)
  }
}
