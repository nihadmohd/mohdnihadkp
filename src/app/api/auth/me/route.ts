// GET /api/auth/me — current session user
import { getSession } from '@/lib/auth'
import { ok, handleError } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return ok({ user: null })
    return ok({ user: session })
  } catch (err) {
    return handleError(err)
  }
}
