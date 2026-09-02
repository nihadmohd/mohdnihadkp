// /api/billing/subscription — GET (mine) | POST (upgrade / downgrade / cancel / demo payments)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { ok, handleError, badRequest } from '@/lib/api-helpers'

const VALID_PLANS = ['FREE', 'PRO', 'BUSINESS']

export async function GET() {
  try {
    const user = await requireUser()
    const plan = await db.plan.findUnique({ where: { code: user.plan } })
    return ok({
      subscription: {
        plan: user.plan,
        planName: plan?.name || user.plan,
        renewsAt: user.planRenewsAt,
        features: (plan?.features || '').split('|').filter(Boolean),
        priceMonthly: plan?.priceMonthly ?? 0,
        currency: plan?.currency || 'INR',
      },
    })
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    const body = await req.json()
    const action = String(body.action || '')
    const planCode = String(body.plan || '').toUpperCase()

    // Demo payment outcome simulation (production: gateway webhook)
    if (action === 'simulate-payment') {
      const outcome = ['success', 'pending', 'failed'][Math.floor(Math.random() * 3)]
      return ok({
        action,
        outcome,
        message:
          outcome === 'success' ? 'Payment captured (demo).'
          : outcome === 'pending' ? 'Payment is processing at the bank (demo).'
          : 'Payment declined by the bank (demo). Try another method.',
      })
    }

    if (!['upgrade', 'downgrade', 'cancel', 'activate'].includes(action)) {
      return badRequest('Unknown billing action.')
    }
    if ((action === 'upgrade' || action === 'downgrade' || action === 'activate') && !VALID_PLANS.includes(planCode)) {
      return badRequest('Unknown plan.')
    }

    const target =
      action === 'cancel' ? 'FREE' : planCode

    // Simulated payment states for paid plans
    if (action === 'upgrade' && target !== 'FREE') {
      const outcome = String(body.outcome || 'success')
      if (outcome === 'failed') {
        return ok({ action, status: 'failed', message: 'Payment failed — no charge was made. Your current plan is unchanged.' })
      }
      if (outcome === 'pending') {
        return ok({ action, status: 'pending', message: 'Payment pending — your plan activates as soon as the bank confirms.' })
      }
    }

    const renewsAt = target === 'FREE' ? null : new Date(Date.now() + 30 * 24 * 3600 * 1000)
    await db.user.update({ where: { id: user.id }, data: { plan: target, planRenewsAt: renewsAt } })

    await db.activity.create({
      data: {
        userId: user.id,
        action: `${action} → ${target}`,
        entity: 'subscription',
        meta: target,
      },
    })

    return ok({
      action,
      status: 'success',
      plan: target,
      renewsAt,
      message:
        action === 'cancel'
          ? 'Subscription cancelled. You keep access until the end of the current period.'
          : `Plan updated to ${target}. Welcome to the new tier!`,
    })
  } catch (err) {
    return handleError(err)
  }
}
