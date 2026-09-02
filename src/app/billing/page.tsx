// billing — account-area page (noindex: private page).
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import BillingView from '@/components/views/auth/billing-view'
import { getSettings, buildMetadata } from '@/lib/page-data'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('home', '/billing', {
  title: "Billing & Plans | MN.KP",
  description: "Manage your MN.KP plan, payments and subscription.",
  noindex: true,
})

export default async function Page() {
  const settings = await getSettings()
  return (
    <AppShell settings={settings}>
      <Suspense>
        <BillingView />
      </Suspense>
    </AppShell>
  )
}
