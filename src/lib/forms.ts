// Records every visitor-submitted form into FormSubmission so the admin
// sees all submissions with full contact details in one place.
import { db } from '@/lib/db'

export async function recordSubmission(entry: {
  formType: string
  name?: string | null
  email?: string | null
  phone?: string | null
  subject?: string | null
  message?: string | null
  data?: Record<string, unknown>
  page?: string | null
}): Promise<void> {
  try {
    await db.formSubmission.create({
      data: {
        formType: entry.formType,
        name: entry.name ?? null,
        email: entry.email ?? null,
        phone: entry.phone ?? null,
        subject: entry.subject ?? null,
        message: (entry.message ?? null)?.slice(0, 5000) ?? null,
        data: JSON.stringify(entry.data ?? {}),
        page: entry.page ?? null,
      },
    })
  } catch {
    // Never let submission recording break the user-facing flow
  }
}
