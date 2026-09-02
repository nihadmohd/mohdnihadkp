// Ventures — KP Foundation ecosystem page (now DB-driven and
// admin-editable) with Organization + Breadcrumb JSON-LD.
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import VenturesView from '@/components/views/ventures-view'
import { db } from '@/lib/db'
import { SITE } from '@/lib/constants'
import { getSettings, buildMetadata } from '@/lib/page-data'
import { breadcrumbJsonLd, jsonLdScript, personJsonLd } from '@/lib/seo-metadata'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('ventures', '/ventures')

async function getVentures() {
  try {
    return await db.venture.findMany({ where: { active: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] })
  } catch {
    return []
  }
}

export default async function VenturesPage() {
  const [settings, ventures] = await Promise.all([getSettings(), getVentures()])
  return (
    <AppShell settings={settings}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript({
          '@context': 'https://schema.org',
          '@graph': [
            personJsonLd(),
            {
              '@type': 'Organization',
              '@id': `${SITE.url}/#organization`,
              name: SITE.brand,
              url: SITE.url,
              description: 'One foundation, many ventures — built from Calicut, Kerala.',
              founder: { '@id': `${SITE.url}/#person` },
              subOrganization: ventures.map((v) => ({
                '@type': 'Organization',
                name: v.name,
                description: v.description,
                url: v.href || undefined,
              })),
            },
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Ventures', path: '/ventures' },
            ]),
          ],
        })}
      />
      <Suspense>
        <VenturesView initial={ventures as unknown as Array<Record<string, unknown>>} />
      </Suspense>
    </AppShell>
  )
}
