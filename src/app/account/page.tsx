// account — account-area page (noindex: private page).
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import AccountView from '@/components/views/auth/account-view'
import { getSettings, buildMetadata } from '@/lib/page-data'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('home', '/account', {
  title: "Account Settings | MN.KP",
  description: "Manage your MN.KP profile, password and preferences.",
  noindex: true,
})

export default async function Page() {
  const settings = await getSettings()
  return (
    <AppShell settings={settings}>
      <Suspense>
        <AccountView />
      </Suspense>
    </AppShell>
  )
}
