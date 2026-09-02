// forgot-password — auth page (noindex: private page, not for search).
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import AuthViews from '@/components/views/auth/auth-views'
import { getSettings, buildMetadata } from '@/lib/page-data'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('home', '/forgot-password', {
  title: "Reset Your Password | MN.KP",
  description: "Request a secure password reset link for your MN.KP account.",
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
        <AuthViews view="forgot-password" token={token} />
      </Suspense>
    </AppShell>
  )
}
