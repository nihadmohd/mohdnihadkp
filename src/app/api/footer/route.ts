// /api/footer — GET (public) | POST (admin) footer nav links
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError, badRequest } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    const adminView = req.nextUrl.searchParams.get('admin') === 'true'
    const links = await db.footerLink.findMany({
      where: adminView ? {} : { active: true },
      orderBy: { sortOrder: 'asc' },
      take: 80,
    })
    return ok({ links })
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()

    const label = String(body.label || '').trim()
    const section = String(body.section || 'main').trim()
    if (!label) return badRequest('Link label is required.')
    if (!['main', 'explore', 'ventures', 'legal'].includes(section)) return badRequest('Invalid section.')

    const link = await db.footerLink.create({
      data: {
        section,
        label,
        url: String(body.url || '').trim(),
        sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
        active: body.active !== undefined ? Boolean(body.active) : true,
      },
    })
    return ok({ link }, { status: 201 })
  } catch (err) {
    return handleError(err)
  }
}
