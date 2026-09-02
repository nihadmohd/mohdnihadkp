// support — account-area page (noindex: private page).
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import SupportView from '@/components/views/auth/support-view'
import { getSettings, buildMetadata } from '@/lib/page-data'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('home', '/support', {
  title: "Support Tickets | MN.KP",
  description: "Open and track support tickets with the MN.KP team.",
  noindex: true,
})

export default async function Page() {
  const settings = await getSettings()
  return (
    <AppShell settings={settings}>
      <Suspense>
        <SupportView />
      </Suspense>
    </AppShell>
  )
}
