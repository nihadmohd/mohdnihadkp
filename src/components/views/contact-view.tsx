'use client'

// Contact — direct channels + inquiry form + FAQ quick answers
import { useState } from 'react'
import { MessageCircle, Mail, MapPin, Radio, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/shared/section-heading'
import { InquiryDialog } from '@/components/views/services-view'
import { useSeo } from '@/hooks/use-seo'
import { SOCIALS, SITE, CV_URL } from '@/lib/constants'
import { SocialIcon } from '@/components/shared/social-icon'

export default function ContactView() {
  const [inquiryOpen, setInquiryOpen] = useState(false)

  useSeo(
    {
      title: 'Contact — Let\u2019s Build Something',
      description: 'Get in touch with Mohammed Nihad KP for projects, collaborations or just to say hello. WhatsApp, email or the inquiry form — replies within 24 hours.',
      path: '/contact',
    },
    ['contact']
  )

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-10 sm:py-14 pb-24 lg:pb-14">
      <SectionHeading
        eyebrow="Contact"
        title="Let's build something"
        description="Project inquiry, collaboration, or just want to talk AI and travel? I read everything personally and reply fast."
      />

      {/* Channel cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <a
          href={`https://api.whatsapp.com/send?phone=${SITE.whatsappNumber}&text=${encodeURIComponent('Hello Nihad! I saw your portfolio and want to discuss a project.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-all"
        >
          <span className="grid place-items-center size-11 rounded-xl bg-primary/12 text-primary mb-3.5">
            <MessageCircle className="size-5" />
          </span>
          <p className="font-semibold">WhatsApp (fastest)</p>
          <p className="text-sm text-muted-foreground mt-1">+91 98467 50898 · usually replies in minutes</p>
        </a>

        <button
          onClick={() => (window.location.href = `mailto:${SITE.email}?subject=Project%20inquiry`)}
          className="group text-left rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-all"
        >
          <span className="grid place-items-center size-11 rounded-xl bg-primary/12 text-primary mb-3.5">
            <Mail className="size-5" />
          </span>
          <p className="font-semibold">Email</p>
          <p className="text-sm text-muted-foreground mt-1">{SITE.email} · replies within 24h</p>
        </button>

        <a
          href={CV_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-all"
        >
          <span className="grid place-items-center size-11 rounded-xl bg-primary/12 text-primary mb-3.5">
            <Clock3 className="size-5" />
          </span>
          <p className="font-semibold">Prefer background first?</p>
          <p className="text-sm text-muted-foreground mt-1">View my CV before we talk</p>
        </a>
      </div>

      {/* Main CTA */}
      <div className="mt-8 relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-amber-500/8 p-7 sm:p-10">
        <div className="absolute inset-0 grid-bg mask-fade-b opacity-30" aria-hidden />
        <div className="relative grid lg:grid-cols-[auto_1fr] gap-6 items-center">
          <span className="grid place-items-center size-16 rounded-2xl bg-primary text-primary-foreground glow-md shrink-0">
            <Radio className="size-8" />
          </span>
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-balance">
              Have an idea? Let&apos;s execute it.
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl leading-relaxed">
              Fill the 2-minute inquiry form with your idea, budget and timeline —
              you&apos;ll get a personal reply with scope and a fixed quote.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button size="lg" className="glow-md" onClick={() => setInquiryOpen(true)}>
                <Radio className="size-4" /> Open inquiry form
              </Button>
              <a
                href={`https://api.whatsapp.com/send?phone=${SITE.whatsappNumber}&text=Hello...!`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline">Chat on WhatsApp</Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Location + socials */}
      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
          <span className="grid place-items-center size-11 rounded-xl bg-primary/12 text-primary shrink-0">
            <MapPin className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-sm">Based in Calicut (Kozhikode), Kerala</p>
            <p className="text-xs text-muted-foreground mt-1">
              Working with clients worldwide — remote-first, timezone-flexible (IST).
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-semibold text-sm mb-3">Everywhere else</p>
          <div className="flex flex-wrap gap-1.5">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className="grid place-items-center size-9 rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
              >
                <SocialIcon name={s.icon} className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {inquiryOpen && <InquiryDialog onClose={() => setInquiryOpen(false)} presetSubject="Project inquiry via contact page" />}
    </div>
  )
}
