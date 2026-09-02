// Legacy store detail URLs (#/store/item/{slug} era) — permanent
// redirect to the canonical /store/{slug} path.
import { permanentRedirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function LegacyStoreItemPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  permanentRedirect(`/store/${slug}`)
}
