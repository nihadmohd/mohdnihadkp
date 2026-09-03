// POST /api/auth/verify-email — verify email with token (or resend)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { hashToken, createToken, getSession, requireUser, signJwt, setSessionCookie } from '@/lib/auth'
import { ok, handleError, badRequest } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const token = String(body.token || '')

    if (token) {
      const record = await db.verificationToken.findUnique({
        where: { tokenHash: hashToken(token) },
      })
      if (!record || record.type !== 'EMAIL_VERIFY') {
        return badRequest('This verification link is invalid.')
      }
      if (record.expiresAt < new Date()) {
        await db.verificationToken.delete({ where: { id: record.id } })
        return badRequest('This verification link has expired. Request a new one.')
      }

      await db.user.update({
        where: { id: record.userId },
        data: { emailVerified: new Date() },
      })
      await db.verificationToken.delete({ where: { id: record.id } })
      await db.activity.create({
        data: { userId: record.userId, action: 'verified email', entity: 'user', entityId: record.userId },
      })

      const userToLogin = await db.user.findUnique({ where: { id: record.userId } })
      if (userToLogin) {
        const jwt = signJwt({ sub: userToLogin.id, email: userToLogin.email, role: userToLogin.role })
        await setSessionCookie(jwt)
      }

      return ok({ success: true, message: 'Email verified successfully.' })
    }

    // Resend: requires a session
    const user = await requireUser()
    if (user.emailVerified) return ok({ success: true, message: 'Email already verified.' })

    const newToken = createToken()
    await db.verificationToken.deleteMany({ where: { userId: user.id, type: 'EMAIL_VERIFY' } })
    await db.verificationToken.create({
      data: {
        tokenHash: hashToken(newToken),
        userId: user.id,
        type: 'EMAIL_VERIFY',
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
      },
    })
    return ok({ success: true, message: 'Verification link regenerated.', verifyToken: newToken })
  } catch (err) {
    return handleError(err)
  }
}

// GET — session-aware check used by the verify view
export async function GET() {
  try {
    const session = await getSession()
    return ok({ user: session })
  } catch (err) {
    return handleError(err)
  }
}
