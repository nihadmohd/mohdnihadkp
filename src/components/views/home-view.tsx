'use client'

// ─────────────────────────────────────────────────────────────
// Home — hero, services, posts, ventures, store teaser, vision
// Mobile-first vertical flow; desktop gets split hero + grids.
// ─────────────────────────────────────────────────────────────
import { motion } from 'framer-motion'
import {
  ArrowRight, MapPin, Sparkles, Radio, Globe2, GraduationCap, Users2,
  Cpu, Camera, TrendingUp, ExternalLink, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeading, CardSkeleton } from '@/components/shared/section-heading'
import { LiveBadge } from '@/components/site/live-badge'
import { navigate } from '@/hooks/use-hash-router'
import {
  SITE, WHAT_I_BRING, VISION_STATEMENTS, SKILLS, VENTURES, SERVICE_OFFERINGS,
} from '@/lib/constants'
import type { InitialData } from '@/components/site/site-root'
import { useSeo } from '@/hooks/use-seo'
import { personJsonLd, websiteJsonLd } from '@/lib/seo'
import { SocialIcon } from '@/components/shared/social-icon'
import { SOCIALS } from '@/lib/constants'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] as const },
}

export default function HomeView({ initial }: { initial: InitialData }) {
  const services = (initial.services.length ? initial.services : SERVICE_OFFERINGS.map((s, i) => ({
    id: `seed-${i}`, ...s, features: (s.features || []).join('|'), active: true, featured: i < 3,
    priceFrom: s.priceFrom, sortOrder: i,
  }))) as Array<Record<string, unknown>>

  const posts = (initial.featuredPosts.length ? initial.featuredPosts : initial.latestPosts) as Array<Record<string, unknown>>
  const products = initial.featuredProducts as Array<Record<string, unknown>>

  useSeo(
    {
      title: `${SITE.name} — ${SITE.tagline}`,
      description: SITE.description,
      path: '/',
      jsonLd: { '@context': 'https://schema.org', '@graph': [personJsonLd(), websiteJsonLd()] },
    },
    ['home']
  )

  const skillMarquee = Object.values(SKILLS).flat()

  return (
    <div className="w-full">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden" aria-label="Introduction">
        <div className="absolute inset-0 grid-bg mask-fade-b opacity-40" aria-hidden />
        <div className="absolute -top-40 left-1/4 size-[30rem] rounded-full bg-primary/12 blur-3xl animate-aurora" aria-hidden />
        <div className="absolute top-20 -right-32 size-96 rounded-full bg-amber-500/8 blur-3xl animate-aurora" style={{ animationDelay: '-6s' }} aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-14 sm:pt-20 lg:pt-28 pb-12 sm:pb-16">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-center">
            {/* Left: identity */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-wrap items-center gap-2.5 mb-5"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold">
                  <Sparkles className="size-3.5" aria-hidden /> Available for projects
                </span>
                <LiveBadge />
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground px-2">
                  <MapPin className="size-3.5" aria-hidden /> Calicut, Kerala
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="font-display text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance"
              >
                MOHAMMED NIHAD{' '}
                <span className="relative inline-block text-primary text-glow">
                  KP
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 120 10" fill="none" aria-hidden>
                    <path d="M2 8Q60 -2 118 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary/60" />
                  </svg>
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.16 }}
                className="mt-5 sm:mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl text-balance"
              >
                I build apps, websites and digital solutions — not by writing every line of code
                from scratch, but by <span className="text-foreground font-medium">mastering the AI tools of tomorrow</span>.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.24 }}
                className="mt-7 flex flex-wrap gap-3"
              >
                <Button size="lg" className="glow-md h-12 px-6 text-[15px]" onClick={() => navigate('/contact')}>
                  <Radio className="size-4.5" /> Hire Me
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-6 text-[15px]" onClick={() => navigate('/services')}>
                  Explore Services <ArrowRight className="size-4" />
                </Button>
                <Button size="lg" variant="ghost" className="h-12 px-5 text-[15px]" onClick={() => navigate('/blog')}>
                  Read the Blog
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.34 }}
                className="mt-8 flex items-center gap-1"
              >
                {SOCIALS.slice(0, 5).map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.name} profile`}
                    className="grid place-items-center size-10 rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    <SocialIcon name={s.icon} className="size-[18px]" />
                  </a>
                ))}
                <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">
                  @{SOCIALS[1].handle} everywhere
                </span>
              </motion.div>
            </div>

            {/* Right: signature card (desktop) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/25 via-transparent to-amber-500/15 rounded-[2rem] blur-2xl" aria-hidden />
                <Card className="relative glass border-primary/20 rounded-[1.75rem] overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-amber-400 to-primary" aria-hidden />
                  <CardContent className="p-7 space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">profile.cfg</span>
                      <span className="flex gap-1.5" aria-hidden>
                        <i className="size-2.5 rounded-full bg-destructive/60" />
                        <i className="size-2.5 rounded-full bg-amber-500/60" />
                        <i className="size-2.5 rounded-full bg-primary/60" />
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      { }
                      <img src="/avatar.png" alt="Mohammed Nihad KP — portrait" className="size-16 rounded-2xl object-cover border border-primary/30" />
                      <div>
                        <p className="font-display font-bold text-lg leading-tight">Mohammed Nihad KP</p>
                        <p className="text-sm text-primary">{SITE.tagline}</p>
                        <p className="text-xs text-muted-foreground mt-1">Freelancer · Businessman · Developer</p>
                      </div>
                    </div>
                    <div className="space-y-2.5 text-sm">
                      {[
                        ['Stack', 'AI tools + modern web'],
                        ['Base', 'Calicut → the world'],
                        ['Ventures', 'KP Foundation + 4'],
                        ['Mission', '195 countries'],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground font-mono text-xs">{k}</span>
                          <span className="font-medium text-sm">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      {[
                        ['AI', Cpu], ['Media', Camera], ['Business', TrendingUp],
                      ].map(([label, Icon]: [string, unknown]) => {
                        const I = Icon as typeof Cpu
                        return (
                          <div key={label as string} className="rounded-xl border border-border bg-background/40 p-3 text-center">
                            <I className="size-4 mx-auto text-primary" aria-hidden />
                            <p className="text-[11px] font-medium mt-1.5">{label as string}</p>
                          </div>
                        )
                      })}
                    </div>
                    <Button className="w-full" onClick={() => navigate('/about')}>
                      The full story <ChevronRight className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Skills marquee */}
        <div className="relative border-y border-border/60 bg-card/30 py-3.5 overflow-hidden" aria-hidden>
          <div className="flex gap-2 w-max animate-marquee">
            {[...skillMarquee, ...skillMarquee].map((skill, i) => (
              <span key={`${skill}-${i}`} className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
                <span className="size-1.5 rounded-full bg-primary/70" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── What I bring ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20" aria-label="What I bring">
        <SectionHeading
          eyebrow="The edge"
          title="What I bring to the table"
          description="Three disciplines fused into one workflow — execution speed of AI, the eye of creative media, and the discipline of business."
        />
        <div className="grid md:grid-cols-3 gap-5">
          {WHAT_I_BRING.map((item, i) => (
            <motion.div key={item.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
              <Card className="group h-full hover:border-primary/40 transition-colors">
                <CardContent className="p-6">
                  <span className="grid place-items-center size-11 rounded-xl bg-primary/12 text-primary mb-4 group-hover:scale-110 transition-transform">
                    {item.icon === 'cpu' ? <Cpu className="size-5" /> : item.icon === 'camera' ? <Camera className="size-5" /> : <TrendingUp className="size-5" />}
                  </span>
                  <h3 className="font-display font-bold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────── */}
      <section className="relative border-y border-border/60 bg-card/20 py-14 sm:py-20" aria-label="Services">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Services"
            title="How I can help you"
            description="Every service is executed end-to-end — strategy, creation and delivery by one accountable person."
            action={
              <Button variant="outline" onClick={() => navigate('/services')}>
                All services <ArrowRight className="size-4" />
              </Button>
            }
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.slice(0, 6).map((svc, i) => (
              <motion.button
                key={String(svc.id)}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                onClick={() => navigate('/services')}
                className="text-left group rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-bold text-lg leading-snug">{String(svc.title)}</h3>
                  {svc.priceFrom && (
                    <Badge variant="secondary" className="shrink-0 text-primary border-primary/30">
                      {String(svc.priceFrom)}+
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed line-clamp-3">
                  {String(svc.description).slice(0, 140)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Inquire <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured posts ───────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20" aria-label="Latest articles">
        <SectionHeading
          eyebrow="The blog"
          title="Fresh from the workbench"
          description="Notes on building with AI, running a one-person business, and the tools that make it possible."
          action={
            <Button variant="outline" onClick={() => navigate('/blog')}>
              All articles <ArrowRight className="size-4" />
            </Button>
          }
        />
        {posts.length === 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.slice(0, 3).map((post, i) => (
              <PostCard key={String(post.id)} post={post} delay={i * 0.07} />
            ))}
          </div>
        )}
      </section>

      {/* ── Ventures ─────────────────────────────────────── */}
      <section className="relative border-y border-border/60 bg-card/20 py-14 sm:py-20" aria-label="Ventures">
        <div className="absolute inset-0 dots-bg opacity-30" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="KP Foundation"
            title="One foundation, many ventures"
            description="An ecosystem of platforms built from Calicut — commerce, community service, premium goods and education."
            action={
              <Button variant="outline" onClick={() => navigate('/ventures')}>
                Explore all <ArrowRight className="size-4" />
              </Button>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VENTURES.map((v, i) => (
              <motion.button
                key={v.name}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                onClick={() => (v.href ? window.open(v.href, '_blank') : navigate('/ventures'))}
                className="group text-left rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-all flex items-center gap-4"
              >
                <span className="grid place-items-center size-11 rounded-xl bg-primary/10 text-primary shrink-0 font-display font-bold">
                  {v.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-semibold text-sm">
                    {v.name}
                    {v.href && <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary" />}
                  </span>
                  <span className="block text-xs text-muted-foreground mt-0.5 truncate">{v.tagline}</span>
                </span>
                <Badge variant="secondary" className="shrink-0 text-[10px]">{v.badge}</Badge>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Store teaser ─────────────────────────────────── */}
      {products.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20" aria-label="Store picks">
          <SectionHeading
            eyebrow="The store"
            title="Tools I actually use"
            description="Affiliate picks — hosting, AI subscriptions, gear and apps that power my workflow. Curated, not catalogued."
            action={
              <Button variant="outline" onClick={() => navigate('/store')}>
                Visit store <ArrowRight className="size-4" />
              </Button>
            }
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.slice(0, 4).map((p, i) => (
              <motion.button
                key={String(p.id)}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                onClick={() => navigate('/store')}
                className="text-left rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 group"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/15 via-muted to-amber-500/10 grid place-items-center">
                  <span className="font-display font-bold text-2xl text-primary/70">
                    {String(p.name).slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-sm line-clamp-1">{String(p.name)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{String(p.category || 'Tool')}</p>
                  {p.rating != null && (
                    <p className="text-xs mt-2 text-amber-500 font-medium">★ {Number(p.rating).toFixed(1)}</p>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* ── Vision ───────────────────────────────────────── */}
      <section className="relative border-t border-border/60 overflow-hidden py-14 sm:py-20" aria-label="The vision">
        <div className="absolute inset-0 grid-bg opacity-25" aria-hidden />
        <div className="absolute -bottom-40 -left-24 size-96 rounded-full bg-primary/10 blur-3xl animate-aurora" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="The global vision"
            title="195 countries. One mission."
            description="Not a travel fantasy — a framework for building a business that travels with me."
          />
          <div className="grid md:grid-cols-3 gap-5">
            {VISION_STATEMENTS.map((v, i) => (
              <motion.div key={v.label} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
                <Card className="h-full bg-card/70 backdrop-blur">
                  <CardContent className="p-6">
                    <span className="grid place-items-center size-10 rounded-xl bg-amber-500/12 text-amber-500 mb-3.5">
                      {i === 0 ? <Globe2 className="size-5" /> : i === 1 ? <Users2 className="size-5" /> : <GraduationCap className="size-5" />}
                    </span>
                    <h3 className="font-display font-bold">{v.label}</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{v.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <motion.div {...fadeUp} className="mt-10 rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/10 via-card to-amber-500/10 p-7 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-balance">
                Want results over conventional methods?
              </h3>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-lg">
                If you value practical results and out-of-the-box thinking, we&apos;ll get along perfectly.
              </p>
            </div>
            <Button size="lg" className="glow-md shrink-0" onClick={() => navigate('/contact')}>
              Let&apos;s connect <ArrowRight className="size-4" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export function PostCard({ post, delay = 0 }: { post: Record<string, unknown>; delay?: number }) {
  const tags = String(post.tags || '').split(',').filter(Boolean).slice(0, 2)
  const date = post.publishedAt ? new Date(String(post.publishedAt)) : null
  return (
    <motion.button
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay }}
      onClick={() => navigate(`/blog/${post.slug}`)}
      className="text-left group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col"
    >
      <div className="aspect-[16/9] relative overflow-hidden bg-gradient-to-br from-primary/20 via-muted to-amber-500/10">
        {post.coverImage ? (
           
          <img
            src={String(post.coverImage)}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center font-display font-bold text-3xl text-primary/40">
            {String(post.title).slice(0, 1)}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" aria-hidden />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2.5">
          {date && <time dateTime={date.toISOString()}>{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</time>}
          <span aria-hidden>·</span>
          <span>{Number(post.readingMinutes || 3)} min read</span>
          {Number(post.views) > 0 && (
            <><span aria-hidden>·</span><span>{Intl.NumberFormat('en', { notation: 'compact' }).format(Number(post.views))} views</span></>
          )}
        </div>
        <h3 className="font-display font-bold text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {String(post.title)}
        </h3>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2 flex-1">
          {String(post.excerpt || 'Read the article')}
        </p>
        {tags.length > 0 && (
          <div className="flex gap-1.5 mt-4">
            {tags.map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px] font-medium">{t}</Badge>
            ))}
          </div>
        )}
      </div>
    </motion.button>
  )
}
