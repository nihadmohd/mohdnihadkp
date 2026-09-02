// POST /api/posts/[id]/view — accurate, de-duplicated view counting.
// One view per visitor session per post (PostView ledger). Also returns
// the live total so the article can display an exact count.
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, handleError, notFound } from '@/lib/api-helpers'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const sessionId = String(body.sessionId || 'anon').slice(0, 64)

    const post = await db.post.findUnique({ where: { id }, select: { id: true, views: true } })
    if (!post) return notFound('Post not found.')

    // Try to record a unique (postId, sessionId) pair — unique constraint
    // makes this idempotent: a second insert throws and means "not unique".
    let unique = false
    try {
      await db.postView.create({ data: { postId: id, sessionId } })
      unique = true
    } catch {
      unique = false // duplicate — same visitor session, not a new view
    }

    let views = post.views
    if (unique) {
      const updated = await db.post.update({
        where: { id },
        data: { views: { increment: 1 } },
        select: { views: true },
      })
      views = updated.views
    }

    const total = await db.postView.count({ where: { postId: id } })
    return ok({ views, uniqueViews: total, counted: unique })
  } catch (err) {
    return handleError(err)
  }
}
