// reset-password — auth page (noindex: private page, not for search).
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import AuthViews from '@/components/views/auth/auth-views'
import { getSettings, buildMetadata } from '@/lib/page-data'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('home', '/reset-password', {
  title: "Choose a New Password | MN.KP",
  description: "Set a new password for your MN.KP account.",
  noindex: true,
})

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const [{ token }, settings] = await Promise.all([searchParams, getSettings()])
  return (
    <AppShell settings={settings}>
      <Suspense>
        <AuthViews view="reset-password" token={token} />
      </Suspense>
    </AppShell>
  )
}
