// 404 — public not-found page with site chrome and a link home.
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AppShell } from '@/components/site/app-shell'
import { NotFoundView } from '@/components/views/states'
import { getSettings } from '@/lib/page-data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'Page Not Found | MN.KP' },
  description: 'The page you are looking for does not exist on MN.KP.',
  robots: { index: false, follow: true },
}

export default async function NotFound() {
  const settings = await getSettings()
  return (
    <AppShell settings={settings}>
      <Suspense>
        <NotFoundView />
      </Suspense>
    </AppShell>
  )
}
