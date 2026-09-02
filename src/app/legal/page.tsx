// Legal index — redirect to the primary legal document.
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function LegalIndexPage() {
  redirect('/legal/privacy-policy')
}
