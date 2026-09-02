// Admin — optional catch-all for /admin, /admin/posts,
// /admin/posts/{editId}, … Renders the AdminGate (client-side
// session guard) with the section derived from the URL. Always
// noindex — private area.
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AppShell } from '@/components/site/app-shell'
import { AdminGate } from '@/components/views/admin/admin-gate'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'Admin & Developer | MN.KP' },
  description: 'Admin & Developer control center — restricted access.',
  robots: { index: false, follow: false },
}

interface Props {
  params: Promise<{ rest?: string[] }>
}

export default async function AdminPage({ params }: Props) {
  const { rest } = await params
  const section = rest?.[0] || 'dashboard'
  const sub = rest?.[1]

  return (
    <AppShell settings={{}} chrome={false}>
      <Suspense>
        <AdminGate section={section} sub={sub} />
      </Suspense>
    </AppShell>
  )
}
