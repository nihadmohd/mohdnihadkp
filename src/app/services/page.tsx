// Services — city-keyword title (Freelance Services in Calicut),
// ProfessionalService + FAQPage (AEO) + Breadcrumb JSON-LD,
// server-rendered service list + related blog articles for
// internal linking (services → blog).
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import ServicesView from '@/components/views/services-view'
import { SITE } from '@/lib/constants'
import { getSettings, getActiveServices, getPublishedPosts, buildMetadata } from '@/lib/page-data'
import {
  professionalServiceJsonLd, faqJsonLd, breadcrumbJsonLd, jsonLdScript, SERVICES_FAQ,
} from '@/lib/seo-metadata'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('services', '/services')

export default async function ServicesPage() {
  const [settings, services, posts] = await Promise.all([
    getSettings(),
    getActiveServices(),
    getPublishedPosts({
      limit: 3,
      select: { id: true, title: true, slug: true, excerpt: true, readingMinutes: true },
    }),
  ])

  return (
    <AppShell settings={settings}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript({
          '@context': 'https://schema.org',
          '@graph': [
            professionalServiceJsonLd(),
            {
              '@context': 'https://schema.org',
              '@type': 'Service',
              name: 'Freelance Web & App Development, Photography and Videography',
              serviceType: 'AI-powered development, photography, videography, digital marketing',
              provider: { '@id': `${SITE.url}/services#service` },
              areaServed: [
                { '@type': 'City', name: 'Calicut' },
                { '@type': 'City', name: 'Kozhikode' },
                { '@type': 'State', name: 'Kerala' },
              ],
              url: `${SITE.url}/services`,
            },
            faqJsonLd(SERVICES_FAQ),
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Services', path: '/services' },
            ]),
          ],
        })}
      />
      <Suspense>
        <ServicesView
          initial={services as unknown as Array<Record<string, unknown>>}
          posts={posts}
        />
      </Suspense>
    </AppShell>
  )
}
