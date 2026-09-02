// /api/account/profile — GET | PATCH (name/bio/image/onboarded) | PUT (change password) | DELETE (account)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireUser, hashPassword, verifyPassword, clearSessionCookie } from '@/lib/auth'
import { ok, handleError, badRequest, validateEmail } from '@/lib/api-helpers'

export async function GET() {
  try {
    const session = await requireUser()
    const user = await db.user.findUnique({
      where: { id: session.id },
      select: {
        id: true, name: true, email: true, image: true, bio: true, role: true,
        plan: true, onboarded: true, emailVerified: true, createdAt: true, lastLoginAt: true,
      },
    })
    return ok({ user })
  } catch (err) {
    return handleError(err)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireUser()
    const body = await req.json()

    const data: Record<string, unknown> = {}
    if (body.name !== undefined) {
      const name = String(body.name).trim()
      if (name.length < 2) return badRequest('Name must be at least 2 characters.')
      data.name = name.slice(0, 80)
    }
    if (body.bio !== undefined) data.bio = String(body.bio).slice(0, 500)
    if (body.image !== undefined) data.image = String(body.image).trim() || null
    if (body.email !== undefined) {
      const email = String(body.email).trim().toLowerCase()
      if (!validateEmail(email)) return badRequest('Invalid email address.')
      const clash = await db.user.findFirst({ where: { email, NOT: { id: session.id } } })
      if (clash) return badRequest('That email is already in use by another account.')
      data.email = email
      data.emailVerified = null // requires re-verification
    }
    if (body.onboarded === true) data.onboarded = true

    const user = await db.user.update({
      where: { id: session.id },
      data,
      select: { id: true, name: true, email: true, image: true, bio: true, onboarded: true },
    })
    return ok({ user })
  } catch (err) {
    return handleError(err)
  }
}

// PUT — change password (current password required)
export async function PUT(req: NextRequest) {
  try {
    const session = await requireUser()
    const body = await req.json()
    const currentPassword = String(body.currentPassword || '')
    const newPassword = String(body.newPassword || '')

    if (newPassword.length < 8) return badRequest('New password must be at least 8 characters.')

    const user = await db.user.findUnique({ where: { id: session.id } })
    if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
      return badRequest('Current password is incorrect.')
    }

    await db.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(newPassword) } })
    await db.activity.create({
      data: { userId: user.id, action: 'changed password', entity: 'user', entityId: user.id },
    })
    return ok({ success: true, message: 'Password updated.' })
  } catch (err) {
    return handleError(err)
  }
}

// DELETE — delete own account
export async function DELETE() {
  try {
    const session = await requireUser()
    if (session.role === 'ADMIN') {
      return badRequest('Admin accounts cannot be self-deleted. Transfer ownership first.')
    }
    await db.user.delete({ where: { id: session.id } })
    await clearSessionCookie()
    return ok({ success: true, message: 'Your account has been deleted. Sorry to see you go.' })
  } catch (err) {
    return handleError(err)
  }
}
