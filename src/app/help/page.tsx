// Help Center — FAQ page with FAQPage JSON-LD (AEO) so answer
// engines can lift the exact Q&A pairs.
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import HelpView from '@/components/views/auth/help-view'
import { getSettings, buildMetadata } from '@/lib/page-data'
import { faqJsonLd, breadcrumbJsonLd, jsonLdScript } from '@/lib/seo-metadata'
import { HELP_FAQS } from '@/lib/help-faqs'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('help', '/help')

export default async function HelpPage() {
  const settings = await getSettings()
  return (
    <AppShell settings={settings}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript({
          '@context': 'https://schema.org',
          '@graph': [
            faqJsonLd(HELP_FAQS.map(({ q, a }) => ({ q, a }))),
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Help', path: '/help' },
            ]),
          ],
        })}
      />
      <Suspense>
        <HelpView />
      </Suspense>
    </AppShell>
  )
}
