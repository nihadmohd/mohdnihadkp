// /api/posts — GET (public list with filters) | POST (admin create)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, slugify, readingMinutes } from '@/lib/auth'
import { ok, handleError, badRequest, parseIntParam } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const page = Math.max(1, parseIntParam(sp.get('page'), 1))
    const limit = Math.min(24, Math.max(1, parseIntParam(sp.get('limit'), 9)))
    const q = (sp.get('q') || '').trim()
    const tag = (sp.get('tag') || '').trim()
    const slug = (sp.get('slug') || '').trim()
    const featured = sp.get('featured')
    const adminView = sp.get('admin') === 'true'

    if (slug) {
      const post = await db.post.findUnique({
        where: { slug },
        include: {
          author: { select: { id: true, name: true, image: true } },
          comments: {
            where: { approved: true },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { id: true, name: true, image: true } } },
          },
        },
      })
      if (!post || (!post.published && !adminView)) {
        return badRequest('Post not found.')
      }
      // Note: view counting is handled by POST /api/posts/[id]/view
      // (de-duplicated per visitor session) — nothing to do here.
      return ok({ post })
    }

    const where: Record<string, unknown> = {}
    if (!adminView) where.published = true
    if (tag) where.tags = { contains: tag }
    if (featured === 'true') where.featured = true
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { excerpt: { contains: q } },
        { content: { contains: q } },
        { tags: { contains: q } },
      ]
    }

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        orderBy: adminView ? { updatedAt: 'desc' } : { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, title: true, slug: true, excerpt: true, coverImage: true, tags: true,
          published: true, featured: true, views: true, readingMinutes: true,
          publishedAt: true, createdAt: true, updatedAt: true,
          seoTitle: true, seoDescription: true,
          author: { select: { id: true, name: true, image: true } },
          _count: { select: { comments: { where: { approved: true } } } },
        },
      }),
      db.post.count({ where }),
    ])

    // Distinct tags for filter chips
    const tagRows = await db.post.findMany({
      where: { published: true },
      select: { tags: true },
    })
    const tagSet = new Set<string>()
    for (const row of tagRows) {
      for (const t of (row.tags || '').split(',')) {
        const clean = t.trim().toLowerCase()
        if (clean) tagSet.add(clean)
      }
    }

    return ok({ posts, total, page, pages: Math.ceil(total / limit) || 1, tags: Array.from(tagSet).sort() })
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()

    const title = String(body.title || '').trim()
    if (!title) return badRequest('A title is required.')

    const content = String(body.content || '')
    const baseSlug = String(body.slug || '').trim() || slugify(title)
    let slug = baseSlug
    let attempt = 1
    while (await db.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${attempt++}`
    }

    const post = await db.post.create({
      data: {
        title,
        slug,
        excerpt: String(body.excerpt || '').trim() || null,
        content,
        coverImage: String(body.coverImage || '').trim() || null,
        tags: String(body.tags || '').trim().toLowerCase(),
        category: String(body.category || '').trim() || null,
        published: Boolean(body.published),
        featured: Boolean(body.featured),
        readingMinutes: readingMinutes(content),
        seoTitle: String(body.seoTitle || '').trim() || null,
        seoDescription: String(body.seoDescription || '').trim() || null,
        publishedAt: body.published ? new Date() : null,
        authorId: admin.id,
      },
    })

    await db.activity.create({
      data: { userId: admin.id, action: 'created post', entity: 'post', entityId: post.id, meta: title },
    })

    return ok({ post }, { status: 201 })
  } catch (err) {
    return handleError(err)
  }
}
