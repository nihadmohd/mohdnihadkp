// POST /api/analytics/view — record a page view (called on route change)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, handleError } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const path = String(body.path || '/').slice(0, 200)
    const referrer = String(body.referrer || '').slice(0, 300)
    const sessionId = String(body.sessionId || 'anon').slice(0, 40)
    const device = body.device === 'mobile' ? 'mobile' : body.device === 'desktop' ? 'desktop' : 'unknown'

    await db.pageView.create({ data: { path, referrer: referrer || null, sessionId, device } })

    return ok({ success: true }, { status: 201 })
  } catch (err) {
    return handleError(err)
  }
}
