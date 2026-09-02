// /api/comments — GET (by post or admin queue) | POST (authed users)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { ok, handleError, badRequest, parseIntParam } from '@/lib/api-helpers'
import { emitAdminAlert } from '@/lib/realtime-emit'
import { recordSubmission } from '@/lib/forms'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const postId = sp.get('postId') || ''
    const adminQueue = sp.get('admin') === 'true'

    if (adminQueue) {
      const page = Math.max(1, parseIntParam(sp.get('page'), 1))
      const limit = Math.min(50, Math.max(1, parseIntParam(sp.get('limit'), 20)))
      const [comments, total, counts] = await Promise.all([
        db.comment.findMany({
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            user: { select: { id: true, name: true, image: true } },
            post: { select: { id: true, title: true, slug: true } },
          },
        }),
        db.comment.count(),
        db.comment.groupBy({ by: ['approved'], _count: { approved: true } }),
      ])
      return ok({
        comments,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        counts: Object.fromEntries(counts.map((c) => [c.approved ? 'approved' : 'pending', c._count.approved])),
      })
    }

    if (!postId) return badRequest('Missing post.')
    const comments = await db.comment.findMany({
      where: { postId, approved: true },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, image: true } } },
    })
    return ok({ comments })
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    const body = await req.json()
    const postId = String(body.postId || '')
    const content = String(body.content || '').trim()

    if (!postId) return badRequest('Missing post.')
    if (content.length < 2) return badRequest('Write a comment first.')
    if (content.length > 2000) return badRequest('Comment is too long (max 2000 characters).')

    const post = await db.post.findUnique({ where: { id: postId } })
    if (!post) return badRequest('Post not found.')

    const comment = await db.comment.create({
      data: { postId, userId: user.id, content, approved: false },
    })

    emitAdminAlert('comment', `New comment by ${user.name || user.email} on "${post.title}" (awaiting approval)`)
    await recordSubmission({
      formType: 'comment',
      name: user.name,
      email: user.email,
      subject: `Comment on "${post.title}"`,
      message: content,
      data: { postId, commentId: comment.id },
      page: `/blog/${post.slug}`,
    })

    return ok(
      { success: true, message: 'Comment submitted! It will appear once approved.', comment: { id: comment.id } },
      { status: 201 }
    )
  } catch (err) {
    return handleError(err)
  }
}
