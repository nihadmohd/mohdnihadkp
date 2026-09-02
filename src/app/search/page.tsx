// Search — query-driven; result pages stay noindex (thin content)
// while the page itself is reachable from nav.
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import SearchView from '@/components/views/search-view'
import { getSettings, buildMetadata } from '@/lib/page-data'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('search', '/search', { noindex: true })

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const [{ q }, settings] = await Promise.all([searchParams, getSettings()])
  return (
    <AppShell settings={settings}>
      <Suspense>
        <SearchView query={q || ''} />
      </Suspense>
    </AppShell>
  )
}
