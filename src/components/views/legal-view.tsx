'use client'

// Legal document view — renders policy content + cookie preferences panel when relevant
import { ArrowLeft, ShieldCheck, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Markdown } from '@/components/markdown'
import { useSeo } from '@/hooks/use-seo'
import Link from 'next/link'
import { getLegalDoc, LEGAL_DOCS } from '@/lib/legal-content'
import { CookiePreferencesPanel } from '@/components/site/cookie-consent'

export default function LegalView({ slug }: { slug: string }) {
  const doc = getLegalDoc(slug)

  useSeo(
    doc
      ? {
          title: doc.title,
          description: doc.description,
          path: `/legal/${doc.slug}`,
        }
      : { title: 'Legal', description: 'Legal documents', path: '/legal' },
    [slug]
  )

  if (!doc) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Document not found.</p>
        <Button className="mt-4" variant="outline" asChild><Link href="/legal/privacy-policy">
          Browse legal documents
        </Link></Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-12 pb-24 lg:pb-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-7" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span aria-hidden>/</span>
        <Link href={`/legal/${LEGAL_DOCS[0].slug}`} className="hover:text-primary transition-colors">Legal</Link>
        <span aria-hidden>/</span>
        <span className="text-foreground truncate">{doc.title}</span>
      </nav>

      <header className="mb-8">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="grid place-items-center size-9 rounded-xl bg-primary/12 text-primary">
            <ShieldCheck className="size-4.5" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Legal</p>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">{doc.title}</h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">{doc.description}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-4">
          <CalendarDays className="size-3.5" aria-hidden /> Last updated: {doc.updated}
        </p>
      </header>

      {/* Interactive panel for cookie preferences */}
      {slug === 'cookie-preferences' && (
        <section className="mb-10" aria-label="Cookie preferences controls">
          <h2 className="font-display text-xl font-bold mb-4">Manage your choices</h2>
          <CookiePreferencesPanel />
        </section>
      )}

      <article className="space-y-9">
        {doc.sections.map((section, i) => (
          <section key={section.heading} aria-label={section.heading} style={{ animation: `fadeIn 0.4s ${Math.min(i * 0.05, 0.3)}s both` }}>
            <h2 className="font-display text-lg sm:text-xl font-bold">{i + 1}. {section.heading}</h2>
            <div className="mt-2.5 text-[15px] leading-[1.75] text-foreground/90">
              <Markdown content={section.body.map((b) => (b.startsWith('**') || b.startsWith('If') || b.startsWith('This') || b.startsWith('By') ? b : b)).join('\n\n')} />
            </div>
          </section>
        ))}
      </article>

      <footer className="mt-12 pt-8 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
        <Button variant="outline" asChild><Link href="/">
          <ArrowLeft className="size-4" /> Back home
        </Link></Button>
        <nav className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs" aria-label="Other legal documents">
          {LEGAL_DOCS.filter((d) => d.slug !== slug).slice(0, 4).map((d) => (
            <Link
              key={d.slug}
              href={`/legal/${d.slug}`}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {d.title}
            </Link>
          ))}
          <Link href={`/legal/${LEGAL_DOCS[0].slug}`} className="text-primary font-medium">
            All {LEGAL_DOCS.length} documents →
          </Link>
        </nav>
      </footer>
    </div>
  )
}
