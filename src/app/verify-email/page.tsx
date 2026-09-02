// verify-email — auth page (noindex: private page, not for search).
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import AuthViews from '@/components/views/auth/auth-views'
import { getSettings, buildMetadata } from '@/lib/page-data'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('home', '/verify-email', {
  title: "Verify Your Email | MN.KP",
  description: "Confirm your email address to activate your MN.KP account.",
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
        <AuthViews view="verify-email" token={token} />
      </Suspense>
    </AppShell>
  )
}
