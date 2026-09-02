// /api/ads/[id]/click — public click tracking, then returns the destination URL.
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, handleError, notFound } from '@/lib/api-helpers'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ad = await db.adUnit.findUnique({ where: { id } })
    if (!ad) return notFound('Ad not found.')

    await db.adUnit.update({ where: { id }, data: { clicks: { increment: 1 } } }).catch(() => {})

    // Destination priority: linked product affiliate URL → ad linkUrl → store
    if (ad.productId) {
      const p = await db.product.findUnique({ where: { id: ad.productId } })
      if (p) {
        await db.product.update({ where: { id: p.id }, data: { clicks: { increment: 1 } } }).catch(() => {})
        return ok({ url: p.affiliateUrl })
      }
    }
    return ok({ url: ad.linkUrl || '/#/store' })
  } catch (err) {
    return handleError(err)
  }
}
