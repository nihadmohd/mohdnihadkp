// POST /api/auth/login — sign in and set httpOnly session cookie
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, signJwt, setSessionCookie, rateLimit } from '@/lib/auth'
import { ok, handleError, badRequest, validateEmail } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local'
    if (!rateLimit(`login:${ip}`, 8, 60_000)) {
      return badRequest('Too many sign-in attempts. Please wait a minute.')
    }

    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')

    if (!validateEmail(email) || !password) {
      return badRequest('Enter your email and password.')
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return badRequest('Incorrect email or password.')
    }
    if (user.banned) {
      return badRequest('This account has been suspended. Contact support.')
    }

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })
    await db.activity.create({
      data: { userId: user.id, action: 'signed in', entity: 'user', entityId: user.id },
    })

    await setSessionCookie(signJwt({ sub: user.id, email: user.email, role: user.role }))

    return ok({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        onboarded: user.onboarded,
        emailVerified: Boolean(user.emailVerified),
        plan: user.plan,
      },
    })
  } catch (err) {
    return handleError(err)
  }
}
