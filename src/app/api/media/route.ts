// /api/media — GET (library, public read for rendering) | POST (admin add)
// Media = images, GIFs and stickers usable across the site.
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError, badRequest } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const type = (sp.get('type') || '').trim()
    const media = await db.media.findMany({
      where: type ? { type } : {},
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    return ok({ media })
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()

    const name = String(body.name || '').trim()
    const url = String(body.url || '').trim()
    if (!name) return badRequest('Give the media a name.')
    if (!/^(https?:\/\/|\/|data:image\/)/i.test(url)) return badRequest('Enter an image/GIF URL (https://…, /… or data:).')

    let type = String(body.type || '').trim()
    if (!['image', 'gif', 'sticker'].includes(type)) {
      type = /\.gif($|\?)/i.test(url) ? 'gif' : 'image'
    }

    const media = await db.media.create({
      data: {
        name,
        url,
        type,
        alt: String(body.alt || '').trim() || null,
        width: body.width != null && body.width !== '' ? Number(body.width) : null,
        height: body.height != null && body.height !== '' ? Number(body.height) : null,
      },
    })

    await db.activity.create({
      data: { userId: admin.id, action: 'added media', entity: 'media', entityId: media.id, meta: `${type}: ${name}` },
    })

    return ok({ media }, { status: 201 })
  } catch (err) {
    return handleError(err)
  }
}
