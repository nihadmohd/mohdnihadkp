// Store listing — server-rendered featured products + Product
// collection JSON-LD, keyword title, unique description.
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import StoreView from '@/components/views/store-view'
import { SITE } from '@/lib/constants'
import { getSettings, getActiveProducts, buildMetadata } from '@/lib/page-data'
import { breadcrumbJsonLd, jsonLdScript, productJsonLd } from '@/lib/seo-metadata'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('store', '/store')

export default async function StorePage() {
  const [settings, products] = await Promise.all([
    getSettings(),
    getActiveProducts({ featured: true, limit: 8 }),
  ])

  return (
    <AppShell settings={settings}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              '@id': `${SITE.url}/store#collection`,
              name: 'MN.KP Store — Curated AI Tools, Software & Gear',
              description: 'Affiliate picks: the tools, hosting, gear and apps used in an AI-powered workflow.',
              url: `${SITE.url}/store`,
              inLanguage: 'en-IN',
              hasPart: products.map((p) => productJsonLd(p)),
            },
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Store', path: '/store' },
            ]),
          ],
        })}
      />
      <Suspense>
        <StoreView initial={products as unknown as Array<Record<string, unknown>>} />
      </Suspense>
    </AppShell>
  )
}
