// POST /api/auth/reset-password — complete password reset with token
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, hashToken, setSessionCookie, signJwt } from '@/lib/auth'
import { ok, handleError, badRequest } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const token = String(body.token || '')
    const password = String(body.password || '')

    if (password.length < 8) return badRequest('New password must be at least 8 characters.')

    const record = await db.verificationToken.findUnique({
      where: { tokenHash: hashToken(token) },
    })
    if (!record || record.type !== 'PASSWORD_RESET') {
      return badRequest('This reset link is invalid.')
    }
    if (record.expiresAt < new Date()) {
      await db.verificationToken.delete({ where: { id: record.id } })
      return badRequest('This reset link has expired. Request a new one.')
    }

    const user = await db.user.update({
      where: { id: record.userId },
      data: { passwordHash: hashPassword(password) },
    })
    await db.verificationToken.delete({ where: { id: record.id } })
    await db.activity.create({
      data: { userId: user.id, action: 'reset password', entity: 'user', entityId: user.id },
    })

    // Sign the user in after a successful reset
    await setSessionCookie(signJwt({ sub: user.id, email: user.email, role: user.role }))

    return ok({ success: true, message: 'Password updated. You are signed in.' })
  } catch (err) {
    return handleError(err)
  }
}
