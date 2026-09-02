// login — auth page (noindex: private page, not for search).
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import AuthViews from '@/components/views/auth/auth-views'
import { getSettings, buildMetadata } from '@/lib/page-data'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('home', '/login', {
  title: "Sign In | MN.KP",
  description: "Sign in to your MN.KP account to comment, manage inquiries and access support.",
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
        <AuthViews view="login" token={token} />
      </Suspense>
    </AppShell>
  )
}
