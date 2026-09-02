// onboarding — account-area page (noindex: private page).
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import OnboardingView from '@/components/views/auth/onboarding-view'
import { getSettings, buildMetadata } from '@/lib/page-data'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('home', '/onboarding', {
  title: "Welcome — Set Up Your Profile | MN.KP",
  description: "A few quick questions to personalize your MN.KP account.",
  noindex: true,
})

export default async function Page() {
  const settings = await getSettings()
  return (
    <AppShell settings={settings}>
      <Suspense>
        <OnboardingView />
      </Suspense>
    </AppShell>
  )
}
