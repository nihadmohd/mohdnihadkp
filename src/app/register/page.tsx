// register — auth page (noindex: private page, not for search).
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import AuthViews from '@/components/views/auth/auth-views'
import { getSettings, buildMetadata } from '@/lib/page-data'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('home', '/register', {
  title: "Create Your Free Account | MN.KP",
  description: "Create a free MN.KP account in 30 seconds — comment on articles, track inquiries and get support.",
  noindex: true,
})

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const [, settings] = await Promise.all([searchParams, getSettings()])
  const token = undefined
  return (
    <AppShell settings={settings}>
      <Suspense>
        <AuthViews view="register" token={token} />
      </Suspense>
    </AppShell>
  )
}
