// More — mobile hub page (navigation utility, not a content page).
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import MoreView from '@/components/views/more-view'
import { getSettings, buildMetadata } from '@/lib/page-data'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('search', '/more', {
  title: 'More — Account, Ventures, Legal & Everything Else | MN.KP',
  description: 'Everything else on MN.KP: ventures, contact, search, account, support, help and legal pages.',
  noindex: true,
})

export default async function MorePage() {
  const settings = await getSettings()
  return (
    <AppShell settings={settings}>
      <Suspense>
        <MoreView />
      </Suspense>
    </AppShell>
  )
}
