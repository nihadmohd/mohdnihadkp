// admin-login — auth page (noindex: private page, not for search).
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import AuthViews from '@/components/views/auth/auth-views'
import { getSettings, buildMetadata } from '@/lib/page-data'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('home', '/admin-login', {
  title: "Admin & Developer Entrance | MN.KP",
  description: "Restricted access — administrator sign-in for the MN.KP control center.",
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
        <AuthViews view="admin-login" token={token} />
      </Suspense>
    </AppShell>
  )
}
