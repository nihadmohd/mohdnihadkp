// Product detail — server-rendered product content for crawlers,
// per-product metadata (name + "Review, Price & Best Deal") and
// Product + Offer + Breadcrumb JSON-LD.
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AppShell } from '@/components/site/app-shell'
import ProductDetailView from '@/components/views/product-detail-view'
import { getSettings, getProductBySlug, buildMetadata } from '@/lib/page-data'
import { productJsonLd, breadcrumbJsonLd, jsonLdScript } from '@/lib/seo-metadata'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) {
    return buildMetadata('store', `/store/${slug}`, { noindex: true })
  }
  const priceNote = product.price ? ` — ₹${product.price.toLocaleString('en-IN')}` : ''
  return buildMetadata('store', `/store/${slug}`, {
    title: `${product.name} Review, Price & Best Deal${priceNote} | MN.KP`,
    description:
      (product.description || '').slice(0, 158) ||
      `${product.name} — honestly reviewed with prices for India, pros, cons and the best deal. A curated MN.KP store pick.`,
    image: product.image || undefined,
    type: 'article',
  })
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSettings()])
  if (!product) notFound()

  return (
    <AppShell settings={settings}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript({
          '@context': 'https://schema.org',
          '@graph': [
            productJsonLd(product),
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Store', path: '/store' },
              { name: product.name, path: `/store/${product.slug}` },
            ]),
          ],
        })}
      />
      <Suspense>
        <ProductDetailView slug={slug} initial={product as unknown as import('@/components/views/product-detail-view').ProductRow} />
      </Suspense>
    </AppShell>
  )
}
