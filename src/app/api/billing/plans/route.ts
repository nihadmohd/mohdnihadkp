// GET /api/billing/plans — public plan catalogue
import { db } from '@/lib/db'
import { ok, handleError } from '@/lib/api-helpers'

const FALLBACK = [
  {
    code: 'FREE', name: 'Free', priceMonthly: 0, currency: 'INR', sortOrder: 0,
    features: 'Read all blog posts|Browse the store|Submit service inquiries|Community comments',
  },
  {
    code: 'PRO', name: 'Pro', priceMonthly: 299, currency: 'INR', sortOrder: 1,
    features: 'Everything in Free|Monthly newsletter drops|Early access to articles|Priority inquiry queue|Downloadable resources',
  },
  {
    code: 'BUSINESS', name: 'Business', priceMonthly: 999, currency: 'INR', sortOrder: 2,
    features: 'Everything in Pro|Priority project slots|Free consultation calls|Custom content requests|WhatsApp direct line',
  },
]

export async function GET() {
  try {
    let plans = await db.plan.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    })
    if (plans.length === 0) {
      plans = await Promise.all(
        FALLBACK.map((p) =>
          db.plan.upsert({
            where: { code: p.code },
            update: {},
            create: p as never,
          })
        )
      )
    }
    return ok({ plans })
  } catch (err) {
    return handleError(err)
  }
}
