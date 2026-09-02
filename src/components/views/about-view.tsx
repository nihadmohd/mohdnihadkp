'use client'

// About — full story, skills, timeline, current explorations
import { Globe2, GraduationCap, Users2, Download, MapPin, Sparkles, Camera, Cpu, TrendingUp, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeading } from '@/components/shared/section-heading'
import { useSeo } from '@/hooks/use-seo'
import { navigate } from '@/hooks/use-hash-router'
import {
  ABOUT_LONG, SKILLS, WHAT_I_BRING, VISION_STATEMENTS, CURRENTLY_EXPLORING,
  CV_URL, SCHOLARSHIP_STATUS, SOCIALS, SITE,
} from '@/lib/constants'
import { SocialIcon } from '@/components/shared/social-icon'

export default function AboutView() {
  useSeo(
    {
      title: 'About — My Story & Vision',
      description: 'Freelancer, businessman and AI-driven developer from Calicut. My journey, skills, and the 195-country vision.',
      path: '/about',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        mainEntity: {
          '@type': 'Person',
          name: SITE.name,
          description: ABOUT_LONG.slice(0, 200),
        },
      },
    },
    ['about']
  )

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-10 sm:py-14 pb-24 lg:pb-14">
      {/* Header */}
      <div className="relative">
        <div className="absolute -top-6 -left-10 size-40 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          <span className="grid place-items-center size-24 rounded-3xl bg-primary text-primary-foreground font-display font-bold text-3xl glow-md shrink-0">
            MN
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-1.5">About me</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Mohammed Nihad KP</h1>
            <p className="text-muted-foreground mt-2">
              Freelancer · Businessman · Developer using AI —{' '}
              <span className="inline-flex items-center gap-1 text-primary">
                <MapPin className="size-3.5" aria-hidden /> Calicut, Kerala
              </span>
            </p>
          </div>
          <div className="sm:ml-auto flex gap-2 shrink-0">
            <a href={CV_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline"><Download className="size-4" /> CV</Button>
            </a>
            <Button className="glow-sm" onClick={() => navigate('/contact')}>Hire me</Button>
          </div>
        </div>
      </div>

      {/* Story */}
      <section className="mt-12" aria-label="My story">
        <SectionHeading eyebrow="The story" title="Outside the classroom, into the real world" />
        <div className="space-y-4 text-[15px] sm:text-base leading-[1.8] text-foreground/90">
          {ABOUT_LONG.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          <p>
            Today I run <span className="text-primary font-medium">KP Foundation</span> — the parent
            platform for my ventures — and work with clients on photography, video, web and AI
            projects. Tomorrow: the world, one country at a time.
          </p>
        </div>
      </section>

      {/* What I bring */}
      <section className="mt-14" aria-label="What I bring">
        <SectionHeading eyebrow="The edge" title="What I bring to the table" />
        <div className="grid sm:grid-cols-3 gap-4">
          {WHAT_I_BRING.map((item) => (
            <Card key={item.title} className="h-full">
              <CardContent className="p-5">
                <span className="grid place-items-center size-10 rounded-xl bg-primary/12 text-primary mb-3.5">
                  {item.icon === 'cpu' ? <Cpu className="size-5" /> : item.icon === 'camera' ? <Camera className="size-5" /> : <TrendingUp className="size-5" />}
                </span>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Toolbox */}
      <section className="mt-14" aria-label="Skills and tools">
        <SectionHeading eyebrow="The toolbox" title="Tools I run my work on" />
        <div className="grid sm:grid-cols-2 gap-4">
          {Object.entries(SKILLS).map(([group, tools]) => (
            <div key={group} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">{group}</p>
              <div className="flex flex-wrap gap-2">
                {tools.map((tool) => (
                  <Badge key={tool} variant="secondary" className="font-medium">{tool}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vision */}
      <section className="mt-14" aria-label="My vision">
        <SectionHeading eyebrow="The global vision" title="195 countries. One mission." />
        <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-amber-500/5 p-6 sm:p-8 space-y-5">
          {VISION_STATEMENTS.map((v) => (
            <div key={v.label} className="flex gap-4">
              <span className="grid place-items-center size-9 rounded-xl bg-amber-500/15 text-amber-500 shrink-0">
                <Globe2 className="size-4.5" />
              </span>
              <div>
                <p className="font-semibold">{v.label}</p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{v.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Currently exploring */}
      <section className="mt-14" aria-label="Currently exploring">
        <SectionHeading eyebrow="Right now" title="What I'm currently exploring" />
        <div className="grid sm:grid-cols-3 gap-4">
          {CURRENTLY_EXPLORING.map((c) => (
            <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
              <span className="grid place-items-center size-10 rounded-xl bg-primary/12 text-primary mb-3.5">
                {c.icon === 'globe' ? <Globe2 className="size-5" /> : c.icon === 'graduation' ? <GraduationCap className="size-5" /> : <Users2 className="size-5" />}
              </span>
              <p className="font-semibold text-sm">{c.label}</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
          <Sparkles className="size-4 text-primary shrink-0" aria-hidden />
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Status:</span> {SCHOLARSHIP_STATUS} — Europe, GCC or China, while working.
          </p>
        </div>
      </section>

      {/* Socials */}
      <section className="mt-14" aria-label="Find me online">
        <SectionHeading eyebrow="Connect" title="Find me everywhere" description="Same handle on every platform — @mohdnihadkp." />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SOCIALS.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 hover:border-primary/40 transition-colors"
            >
              <span className="grid place-items-center size-9 rounded-xl bg-muted text-foreground group-hover:bg-primary/15 group-hover:text-primary transition-colors shrink-0">
                <SocialIcon name={s.icon} className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium truncate">{s.name}</span>
                <span className="block text-[11px] text-muted-foreground truncate">{s.handle}</span>
              </span>
              <Link2 className="size-3.5 text-muted-foreground ml-auto shrink-0" aria-hidden />
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
