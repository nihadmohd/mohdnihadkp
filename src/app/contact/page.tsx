// Contact — ContactPage + LocalBusiness-style JSON-LD with
// Calicut geo signals for local search.
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import ContactView from '@/components/views/contact-view'
import { getSettings, buildMetadata } from '@/lib/page-data'
import { SITE } from '@/lib/constants'
import { CITY, breadcrumbJsonLd, jsonLdScript, personJsonLd } from '@/lib/seo-metadata'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('contact', '/contact')

export default async function ContactPage() {
  const settings = await getSettings()
  return (
    <AppShell settings={settings}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript({
          '@context': 'https://schema.org',
          '@graph': [
            personJsonLd(),
            {
              '@type': 'ContactPage',
              name: 'Contact Mohammed Nihad KP',
              url: `${SITE.url}/contact`,
              inLanguage: 'en-IN',
              about: { '@id': `${SITE.url}/#person` },
              mainEntity: {
                '@type': 'Person',
                name: SITE.fullName,
                telephone: `+${SITE.whatsappNumber}`,
                email: SITE.email,
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: CITY.name,
                  addressRegion: CITY.region,
                  addressCountry: 'IN',
                },
                geo: { '@type': 'GeoCoordinates', latitude: CITY.geo.lat, longitude: CITY.geo.lng },
              },
            },
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Contact', path: '/contact' },
            ]),
          ],
        })}
      />
      <Suspense>
        <ContactView />
      </Suspense>
    </AppShell>
  )
}
