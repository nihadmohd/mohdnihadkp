// Legal document — per-doc metadata (unique title/description for
// every page) + Breadcrumb JSON-LD.
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AppShell } from '@/components/site/app-shell'
import LegalView from '@/components/views/legal-view'
import { getLegalDoc } from '@/lib/legal-content'
import { getSettings, buildMetadata } from '@/lib/page-data'
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo-metadata'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const doc = getLegalDoc(slug)
  if (!doc) {
    return buildMetadata('legal', `/legal/${slug}`, { noindex: true })
  }
  return buildMetadata('legal', `/legal/${doc.slug}`, {
    title: `${doc.title} | MN.KP`,
    description: `${doc.title} for MN.KP (nihadkp.com) — the platform of Mohammed Nihad KP, Calicut, Kerala. Read the full policy.`,
  })
}

export default async function LegalDocPage({ params }: Props) {
  const { slug } = await params
  const doc = getLegalDoc(slug)
  if (!doc) notFound()
  const settings = await getSettings()

  return (
    <AppShell settings={settings}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript({
          '@context': 'https://schema.org',
          '@graph': [
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Legal', path: '/legal/privacy-policy' },
              { name: doc.title, path: `/legal/${doc.slug}` },
            ]),
          ],
        })}
      />
      <Suspense>
        <LegalView slug={slug} />
      </Suspense>
    </AppShell>
  )
}
