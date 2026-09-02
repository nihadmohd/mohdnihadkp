// /api/comments/[id] — PATCH (admin approve) | DELETE (admin or author)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { ok, handleError, badRequest } from '@/lib/api-helpers'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(_req: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireUser()
    if (admin.role !== 'ADMIN') return badRequest('Admin access required.')

    const { id } = await ctx.params
    const comment = await db.comment.update({
      where: { id },
      data: { approved: true },
    })
    await db.activity.create({
      data: { userId: admin.id, action: 'approved comment', entity: 'comment', entityId: id },
    })
    return ok({ comment })
  } catch (err) {
    return handleError(err)
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params
    const comment = await db.comment.findUnique({ where: { id } })
    if (!comment) return badRequest('Comment not found.')
    if (user.role !== 'ADMIN' && comment.userId !== user.id) {
      return badRequest('You can only delete your own comments.')
    }

    await db.comment.delete({ where: { id } })
    if (user.role === 'ADMIN') {
      await db.activity.create({
        data: { userId: user.id, action: 'deleted comment', entity: 'comment', entityId: id },
      })
    }
    return ok({ success: true })
  } catch (err) {
    return handleError(err)
  }
}
