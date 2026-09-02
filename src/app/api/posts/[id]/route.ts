// /api/posts/[id] — GET one | PUT (admin) | DELETE (admin)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, slugify, readingMinutes } from '@/lib/auth'
import { ok, handleError, badRequest } from '@/lib/api-helpers'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    const post = await db.post.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, image: true } } },
    })
    if (!post) return badRequest('Post not found.')
    return ok({ post })
  } catch (err) {
    return handleError(err)
  }
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireAdmin()
    const { id } = await ctx.params
    const existing = await db.post.findUnique({ where: { id } })
    if (!existing) return badRequest('Post not found.')

    const body = await req.json()
    const title = String(body.title ?? existing.title).trim()
    if (!title) return badRequest('A title is required.')

    const content = body.content !== undefined ? String(body.content) : existing.content

    // Slug changes: keep unique
    let slug = existing.slug
    if (body.slug !== undefined && String(body.slug).trim()) {
      const base = slugify(String(body.slug))
      const clash = await db.post.findFirst({ where: { slug: base, NOT: { id } } })
      slug = clash ? existing.slug : base
    }

    const publishNow = body.published === true && !existing.published

    const post = await db.post.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt: body.excerpt !== undefined ? String(body.excerpt).trim() || null : existing.excerpt,
        content,
        coverImage: body.coverImage !== undefined ? String(body.coverImage).trim() || null : existing.coverImage,
        tags: body.tags !== undefined ? String(body.tags).trim().toLowerCase() : existing.tags,
        category: body.category !== undefined ? String(body.category).trim() || null : existing.category,
        published: body.published !== undefined ? Boolean(body.published) : existing.published,
        featured: body.featured !== undefined ? Boolean(body.featured) : existing.featured,
        readingMinutes: readingMinutes(content),
        seoTitle: body.seoTitle !== undefined ? String(body.seoTitle).trim() || null : existing.seoTitle,
        seoDescription: body.seoDescription !== undefined ? String(body.seoDescription).trim() || null : existing.seoDescription,
        publishedAt: publishNow ? new Date() : existing.publishedAt,
      },
    })

    await db.activity.create({
      data: { userId: admin.id, action: 'updated post', entity: 'post', entityId: id, meta: title },
    })

    return ok({ post })
  } catch (err) {
    return handleError(err)
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireAdmin()
    const { id } = await ctx.params
    const existing = await db.post.findUnique({ where: { id } })
    if (!existing) return badRequest('Post not found.')

    await db.post.delete({ where: { id } })
    await db.activity.create({
      data: { userId: admin.id, action: 'deleted post', entity: 'post', entityId: id, meta: existing.title },
    })

    return ok({ success: true })
  } catch (err) {
    return handleError(err)
  }
}
