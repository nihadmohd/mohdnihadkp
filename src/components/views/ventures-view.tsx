'use client'

// Ventures — KP Foundation ecosystem
import { ArrowUpRight, Network, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SectionHeading } from '@/components/shared/section-heading'
import { useSeo } from '@/hooks/use-seo'
import { navigate } from '@/hooks/use-hash-router'
import { VENTURES } from '@/lib/constants'

export default function VenturesView() {
  useSeo(
    {
      title: 'Ventures — KP Foundation Ecosystem',
      description: 'KP Foundation, Calicut Store, Chaliyam Connect, Calicut Gold and PolyStudy — one foundation, many ventures.',
      path: '/ventures',
    },
    ['ventures']
  )

  const flagship = VENTURES[0]
  const others = VENTURES.slice(1)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 sm:py-14 pb-24 lg:pb-14">
      <SectionHeading
        eyebrow="The ecosystem"
        title="One foundation, many ventures"
        description="KP Foundation is the parent platform — every business vertical lives under it. From commerce to community service, built from Calicut."
      />

      {/* Flagship: KP Foundation */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/12 via-card to-amber-500/8 p-7 sm:p-10">
        <div className="absolute inset-0 grid-bg opacity-25" aria-hidden />
        <div className="absolute -top-20 -right-20 size-64 rounded-full bg-primary/15 blur-3xl animate-aurora" aria-hidden />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <span className="grid place-items-center size-14 rounded-2xl bg-primary text-primary-foreground glow-md">
              <Network className="size-7" />
            </span>
            <Badge className="gap-1.5">
              <Sparkles className="size-3" aria-hidden /> Flagship
            </Badge>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mt-5">{flagship.name}</h2>
          <p className="text-primary font-medium mt-1">{flagship.tagline}</p>
          <p className="text-muted-foreground mt-4 leading-relaxed max-w-2xl">{flagship.description}</p>
          <p className="text-sm text-muted-foreground mt-4 italic">
            Malayalam note: <span className="not-italic">ithinte under ellaatharam business um undaavum —</span> this is the base; every kind of business will live under it.
          </p>
          <div className="mt-6 flex gap-3">
            <Button className="glow-sm" onClick={() => navigate('/contact')}>
              Partner with the foundation
            </Button>
            <Button variant="outline" onClick={() => navigate('/services')}>See services</Button>
          </div>
        </div>
      </div>

      {/* Other ventures */}
      <div className="grid md:grid-cols-2 gap-5 mt-8">
        {others.map((v, i) => (
          <article
            key={v.name}
            className="group rounded-3xl border border-border bg-card p-6 sm:p-7 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col"
            style={{ animation: `fadeIn 0.5s ${i * 0.07}s both` }}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="grid place-items-center size-12 rounded-2xl bg-primary/12 text-primary font-display font-bold">
                {v.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </span>
              <Badge variant="secondary">{v.badge}</Badge>
            </div>
            <h3 className="font-display font-bold text-xl mt-4">{v.name}</h3>
            <p className="text-primary text-sm font-medium mt-0.5">{v.tagline}</p>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed flex-1">{v.description}</p>
            {v.href && (
              <a
                href={v.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Visit {v.name.replace('Calicut ', '')} <ArrowUpRight className="size-4" />
              </a>
            )}
          </article>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-3xl border border-border bg-card p-7 sm:p-9 text-center">
        <h3 className="font-display text-xl sm:text-2xl font-bold">Want a venture of your own?</h3>
        <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto leading-relaxed">
          I build platforms like these in weeks, not months. Let&apos;s talk about yours.
        </p>
        <Button className="mt-5 glow-sm" onClick={() => navigate('/contact')}>Start the conversation</Button>
      </div>
    </div>
  )
}
