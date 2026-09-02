// /api/submissions/[id] — PATCH status | DELETE (admin)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError, notFound } from '@/lib/api-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const status = String(body.status || '').trim()
    if (!['NEW', 'READ', 'DONE'].includes(status)) {
      return notFound('Status must be NEW, READ or DONE.')
    }
    const submission = await db.formSubmission.update({ where: { id }, data: { status } })
    return ok({ submission })
  } catch (err) {
    return handleError(err)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const existing = await db.formSubmission.findUnique({ where: { id } })
    if (!existing) return notFound('Submission not found.')
    await db.formSubmission.delete({ where: { id } })
    return ok({ success: true })
  } catch (err) {
    return handleError(err)
  }
}
