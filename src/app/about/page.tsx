// About — server-rendered bio page with Person JSON-LD.
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import AboutView from '@/components/views/about-view'
import { getSettings, buildMetadata } from '@/lib/page-data'
import { breadcrumbJsonLd, jsonLdScript, personJsonLd } from '@/lib/seo-metadata'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('about', '/about')

export default async function AboutPage() {
  const settings = await getSettings()
  return (
    <AppShell settings={settings}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript({
          '@context': 'https://schema.org',
          '@graph': [
            personJsonLd(),
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'About', path: '/about' },
            ]),
          ],
        })}
      />
      <Suspense>
        <AboutView />
      </Suspense>
    </AppShell>
  )
}
