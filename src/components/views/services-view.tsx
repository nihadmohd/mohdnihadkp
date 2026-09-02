'use client'

// Services — offerings grid + inquiry dialog (public form → Inquiry API)
import { useEffect, useState } from 'react'
import {
  Camera, Video, Code2, Brain, Megaphone, Palette, Check, ArrowRight, Loader2,
  Send, Briefcase, Clock3, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { SectionHeading } from '@/components/shared/section-heading'
import { AdSlot } from '@/components/shared/ad-slot'
import { InlineError } from '@/components/views/states'
import { useSeo } from '@/hooks/use-seo'
import { navigate } from '@/hooks/use-hash-router'
import { api } from '@/lib/api-client'
import { SERVICE_OFFERINGS, BUDGET_OPTIONS, SITE, WHAT_I_BRING } from '@/lib/constants'
import { useToast } from '@/hooks/use-toast'
import type { LucideIcon } from 'lucide-react'
import { Cpu, TrendingUp } from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  camera: Camera, video: Video, code: Code2, brain: Brain, megaphone: Megaphone,
  palette: Palette, sparkles: Brain, briefcase: Briefcase,
}

interface ServiceRow {
  id: string
  title: string
  slug: string
  description: string
  icon: string
  features: string
  priceFrom: string | null
  featured: boolean
}

export default function ServicesView({ initial }: { initial: Array<Record<string, unknown>> }) {
  const [services, setServices] = useState<ServiceRow[]>(() =>
    (initial.length
      ? initial
      : SERVICE_OFFERINGS.map((s, i) => ({ id: `seed-${i}`, ...s, features: (s.features || []).join('|') }))
    ) as unknown as ServiceRow[]
  )
  const [error, setError] = useState('')
  const [inquiryFor, setInquiryFor] = useState<ServiceRow | null>(null)

  useSeo(
    {
      title: 'Services — Photography, Video, AI Development',
      description: 'Photography, videography, AI-driven web/app development, marketing and creative media services by Mohammed Nihad KP.',
      path: '/services',
    },
    ['services']
  )

  useEffect(() => {
    api<{ services: ServiceRow[] }>('/api/services')
      .then((d) => d.services.length && setServices(d.services))
      .catch((e) => setError((e as Error).message))
  }, [])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 sm:py-14 pb-24 lg:pb-14">
      <SectionHeading
        eyebrow="Services"
        title="Everything, executed end-to-end"
        description="One person accountable from idea to delivery — powered by AI where it helps, human craft where it matters."
      />

      {error && <div className="mb-6"><InlineError message={error} /></div>}

      {/* Value props */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {[
          { icon: Clock3, title: 'Fast delivery', text: 'AI-accelerated workflows mean days, not months.' },
          { icon: ShieldCheck, title: 'One accountable person', text: 'No agency telephone game — you talk to me directly.' },
          { icon: Cpu, title: 'Modern stack', text: 'Latest tools and platforms, chosen for results.' },
        ].map((v) => (
          <div key={v.title} className="rounded-2xl border border-border bg-card p-5 flex items-start gap-3.5">
            <span className="grid place-items-center size-10 rounded-xl bg-primary/12 text-primary shrink-0">
              <v.icon className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-sm">{v.title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{v.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Service cards */}
      <div className="grid md:grid-cols-2 gap-5">
        {services.map((svc, i) => {
          const Icon = ICONS[svc.icon] || Briefcase
          const features = String(svc.features || '').split('|').filter(Boolean)
          return (
            <article
              key={svc.id}
              className="group rounded-3xl border border-border bg-card p-6 sm:p-7 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col"
              style={{ animation: `fadeIn 0.5s ${i * 0.06}s both` }}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid place-items-center size-12 rounded-2xl bg-primary/12 text-primary group-hover:scale-110 transition-transform">
                  <Icon className="size-6" />
                </span>
                {svc.priceFrom && (
                  <Badge variant="secondary" className="text-primary border-primary/30 shrink-0">
                    from {svc.priceFrom}
                  </Badge>
                )}
              </div>
              <h3 className="font-display font-bold text-xl mt-4">{svc.title}</h3>
              <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed">{svc.description}</p>
              {features.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="size-4 text-primary shrink-0 mt-0.5" aria-hidden />
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                <a
                  href={`https://api.whatsapp.com/send?phone=${SITE.whatsappNumber}&text=${encodeURIComponent(`Hello Nihad! I'm interested in: ${svc.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Quick WhatsApp →
                </a>
                <Button size="sm" onClick={() => setInquiryFor(svc)}>
                  Inquire <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </article>
          )
        })}
      </div>

      {/* How I work */}
      <section className="mt-16" aria-label="How I work">
        <SectionHeading eyebrow="Process" title="How a project runs" />
        <ol className="grid md:grid-cols-4 gap-4">
          {[
            ['01', 'You inquire', 'Tell me the idea, budget and timeline — the form takes 2 minutes.'],
            ['02', 'We align', 'I reply within 24h with scope, a fixed quote and a timeline.'],
            ['03', 'I execute', 'AI-accelerated build with check-in previews as milestones land.'],
            ['04', 'You launch', 'Delivery, handover and support — you own everything.'],
          ].map(([n, t, d]) => (
            <li key={n} className="rounded-2xl border border-border bg-card p-5">
              <span className="font-display font-bold text-2xl text-primary/40">{n}</span>
              <p className="font-semibold mt-2">{t}</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {inquiryFor && <InquiryDialog service={inquiryFor} onClose={() => setInquiryFor(null)} />}

      {/* Affiliate ad (admin-managed, services placement) */}
      <AdSlot placement="services" variant="banner" className="mt-14" />
    </div>
  )
}

export function InquiryDialog({
  service, onClose, presetSubject,
}: {
  service?: { id: string; title: string } | null
  onClose: () => void
  presetSubject?: string
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState(presetSubject || service?.title || '')
  const [budget, setBudget] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const { toast } = useToast()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return
    setSending(true)
    try {
      await api('/api/inquiries', {
        method: 'POST',
        body: {
          name, email, phone, subject, budget, message,
          serviceId: service?.id || null,
        },
      })
      setDone(true)
    } catch (err) {
      toast({ title: 'Could not send', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scrollbar-slim">
        {done ? (
          <div className="py-8 text-center space-y-4">
            <span className="mx-auto grid place-items-center size-16 rounded-2xl bg-primary/15 text-primary">
              <Check className="size-8" />
            </span>
            <DialogTitle className="text-xl">Inquiry sent!</DialogTitle>
            <p className="text-sm text-muted-foreground leading-relaxed px-4">
              Thanks {name.split(' ')[0]} — I&apos;ve got your message. Expect a personal reply
              within 24 hours (usually much faster). Meanwhile, feel free to browse the blog.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button onClick={onClose}>Done</Button>
              <Button variant="outline" onClick={() => { onClose(); navigate('/blog') }}>
                Read the blog
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="size-4.5 text-primary" />
                {service ? `Inquire — ${service.title}` : 'Start a conversation'}
              </DialogTitle>
              <DialogDescription>
                2 minutes now, a detailed reply within 24 hours. No spam, ever.
              </DialogDescription>
            </DialogHeader>

            <div className="grid sm:grid-cols-2 gap-4 mt-5">
              <div className="space-y-1.5">
                <Label htmlFor="iq-name">Name *</Label>
                <Input id="iq-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" autoComplete="name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="iq-email">Email *</Label>
                <Input id="iq-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="iq-phone">WhatsApp / Phone</Label>
                <Input id="iq-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" autoComplete="tel" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="iq-budget">Budget range</Label>
                <Select value={budget} onValueChange={setBudget}>
                  <SelectTrigger id="iq-budget"><SelectValue placeholder="Select a range" /></SelectTrigger>
                  <SelectContent>
                    {BUDGET_OPTIONS.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="iq-subject">Subject</Label>
                <Input id="iq-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Website for my store" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="iq-message">Tell me about the project *</Label>
                <Textarea
                  id="iq-message" required rows={4} minLength={10} maxLength={3000}
                  value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="What do you need, when do you need it, any references you like…"
                />
              </div>
            </div>

            <DialogFooter className="mt-6 flex-col sm:flex-col gap-2">
              <Button type="submit" className="w-full h-11 glow-sm" disabled={sending}>
                {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Send inquiry
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">
                By sending you agree to the Privacy Policy. Your details are used only to reply.
              </p>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
