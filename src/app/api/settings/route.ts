// /api/settings — GET (public-safe) | PUT (admin, full control)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, getSession } from '@/lib/auth'
import { ok, handleError, badRequest } from '@/lib/api-helpers'

const DEFAULTS: Record<string, string> = {
  siteName: 'Mohammed Nihad KP',
  tagline: 'AI-Powered Developer & Digital Creator',
  announcement: '',
  maintenanceMode: 'false',
  maintenanceMessage:
    'I am upgrading the platform right now. Everything will be back shortly — usually within a few minutes.',
  contactEmail: 'hello@nihadkp.com',
  whatsappNumber: '919846750898',
  showLiveCounter: 'true',
  blogEnabled: 'true',
  storeEnabled: 'true',
  seoTitle: 'Mohammed Nihad KP — AI-Powered Developer & Digital Creator',
  seoDescription:
    'Portfolio, blog, store and services of Mohammed Nihad KP — freelancer, businessman and AI-driven developer from Calicut, Kerala.',
  footerNote: 'Built with AI, from Calicut to the world.',
  defaultTheme: 'dark',
}

export async function GET() {
  try {
    const rows = await db.setting.findMany()
    const settings: Record<string, string> = { ...DEFAULTS }
    for (const row of rows) settings[row.key] = row.value

    // Non-admins get a reduced payload (no admin-only flags)
    const session = await getSession()
    if (session?.role !== 'ADMIN') {
      return ok({
        settings: {
          siteName: settings.siteName,
          tagline: settings.tagline,
          announcement: settings.announcement,
          maintenanceMode: settings.maintenanceMode,
          maintenanceMessage: settings.maintenanceMessage,
          showLiveCounter: settings.showLiveCounter,
          blogEnabled: settings.blogEnabled,
          storeEnabled: settings.storeEnabled,
          contactEmail: settings.contactEmail,
          whatsappNumber: settings.whatsappNumber,
          footerNote: settings.footerNote,
          defaultTheme: settings.defaultTheme,
        },
      })
    }

    return ok({ settings })
  } catch (err) {
    return handleError(err)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    const updates = body.settings || body
    if (typeof updates !== 'object' || Array.isArray(updates)) {
      return badRequest('Invalid settings payload.')
    }

    const allowed = new Set([...Object.keys(DEFAULTS)])
    const applied: Record<string, string> = {}
    for (const [key, value] of Object.entries(updates)) {
      if (!allowed.has(key)) continue
      const strValue = String(value)
      await db.setting.upsert({
        where: { key },
        update: { value: strValue },
        create: { key, value: strValue },
      })
      applied[key] = strValue
    }

    await db.activity.create({
      data: { userId: admin.id, action: 'updated site settings', entity: 'settings', meta: Object.keys(applied).join(', ') },
    })

    return ok({ success: true, updated: applied })
  } catch (err) {
    return handleError(err)
  }
}
