// PATCH /api/users/[id] — admin: change role / ban / plan
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError, badRequest } from '@/lib/api-helpers'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireAdmin()
    const { id } = await ctx.params
    const body = await req.json()

    const target = await db.user.findUnique({ where: { id } })
    if (!target) return badRequest('User not found.')

    // Safety: cannot demote or ban yourself
    if (id === admin.id && (body.role === 'USER' || body.banned === true)) {
      return badRequest('You cannot demote or ban your own admin account.')
    }

    const data: Record<string, unknown> = {}
    if (body.role !== undefined) {
      const role = String(body.role).toUpperCase()
      if (!['USER', 'ADMIN'].includes(role)) return badRequest('Invalid role.')
      data.role = role
    }
    if (body.banned !== undefined) data.banned = Boolean(body.banned)

    const user = await db.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, banned: true },
    })

    await db.activity.create({
      data: {
        userId: admin.id,
        action: 'updated user',
        entity: 'user',
        entityId: id,
        meta: `${user.email} → ${user.role}${user.banned ? ' (banned)' : ''}`,
      },
    })

    return ok({ user })
  } catch (err) {
    return handleError(err)
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireAdmin()
    const { id } = await ctx.params
    if (id === admin.id) return badRequest('You cannot delete your own account from here.')

    const target = await db.user.findUnique({ where: { id } })
    if (!target) return badRequest('User not found.')

    await db.user.delete({ where: { id } })
    await db.activity.create({
      data: { userId: admin.id, action: 'deleted user', entity: 'user', entityId: id, meta: target.email },
    })

    return ok({ success: true })
  } catch (err) {
    return handleError(err)
  }
}
