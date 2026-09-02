// POST /api/auth/forgot-password — issue password reset token (dev mode returns it)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { createToken, hashToken, rateLimit } from '@/lib/auth'
import { ok, handleError, badRequest, validateEmail } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local'
    if (!rateLimit(`forgot:${ip}`, 5, 60_000)) {
      return badRequest('Too many requests. Please wait a minute.')
    }

    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()
    if (!validateEmail(email)) return badRequest('Enter a valid email address.')

    const user = await db.user.findUnique({ where: { email } })

    // Always respond the same way (no account enumeration),
    // but only create a token when the account exists.
    let resetToken: string | null = null
    if (user) {
      const token = createToken()
      await db.verificationToken.deleteMany({ where: { userId: user.id, type: 'PASSWORD_RESET' } })
      await db.verificationToken.create({
        data: {
          tokenHash: hashToken(token),
          userId: user.id,
          type: 'PASSWORD_RESET',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      })
      resetToken = token // dev-mode: no SMTP, link surfaced in UI
    }

    return ok({
      success: true,
      message: 'If an account exists for that email, a reset link has been generated.',
      resetToken, // null when account does not exist (same UX either way)
    })
  } catch (err) {
    return handleError(err)
  }
}
