// POST /api/auth/register — create account (+ email verification token, dev mode returns link)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createToken, hashToken, rateLimit } from '@/lib/auth'
import { ok, handleError, badRequest, validateEmail } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local'
    if (!rateLimit(`register:${ip}`, 5, 60_000)) {
      return badRequest('Too many attempts. Please wait a minute and try again.')
    }

    const body = await req.json()
    const name = String(body.name || '').trim().slice(0, 80)
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')

    if (!name) return badRequest('Please tell me your name.')
    if (!validateEmail(email)) return badRequest('That email address does not look right.')
    if (password.length < 8) return badRequest('Password must be at least 8 characters.')

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) return badRequest('An account with this email already exists. Try signing in.')

    const user = await db.user.create({
      data: { name, email, passwordHash: hashPassword(password) },
    })

    // Email verification token (24h). No SMTP in this environment —
    // the link is returned so the UI can show it / auto-open it (dev mode).
    const token = createToken()
    await db.verificationToken.create({
      data: {
        tokenHash: hashToken(token),
        userId: user.id,
        type: 'EMAIL_VERIFY',
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
      },
    })

    await db.activity.create({
      data: { userId: user.id, action: 'registered', entity: 'user', entityId: user.id },
    })

    return ok({
      success: true,
      message: 'Account created. One step left — verify your email.',
      verifyToken: token, // dev-mode: UI displays the verification link
    })
  } catch (err) {
    return handleError(err)
  }
}
