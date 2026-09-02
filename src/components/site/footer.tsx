'use client'

// Footer — newsletter, socials, ventures, legal links. Sticky bottom on short pages.
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, MapPin, Check, Loader2, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api-client'
import { navigate } from '@/hooks/use-hash-router'
import { SOCIALS, VENTURES, CV_URL } from '@/lib/constants'
import { LEGAL_DOCS } from '@/lib/legal-content'
import { LiveBadge } from '@/components/site/live-badge'
import { useSession, isAdmin } from '@/components/site/site-context'
import { SocialIcon } from '@/components/shared/social-icon'

export function SiteFooter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const { toast } = useToast()
  const { user } = useSession()

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const res = await api<{ message: string }>('/api/subscribers', {
        method: 'POST',
        body: { email },
      })
      setDone(true)
      toast({ title: 'Subscribed', description: res.message })
    } catch (err) {
      toast({ title: 'Could not subscribe', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="mt-auto border-t border-border/60 bg-card/40 pb-20 lg:pb-0">
      {/* CTA strip */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg mask-fade-b opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                Have an idea? <span className="text-primary text-glow">Let&apos;s execute it.</span>
              </h2>
              <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
                Rapid, AI-powered delivery — from Calicut to the world.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="glow-sm" onClick={() => navigate('/contact')}>
                <Radio className="size-4" /> Start a Project
              </Button>
              <a
                href={CV_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center h-11 rounded-xl border border-border px-5 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
              >
                View CV
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pb-8 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
        {/* Brand + newsletter */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center size-9 rounded-xl bg-primary text-primary-foreground font-display font-bold text-xs glow-sm" aria-hidden>MN</span>
            <div>
              <p className="font-display font-semibold">Mohammed Nihad KP</p>
              <p className="text-xs text-muted-foreground">AI-Powered Developer &amp; Digital Creator</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Blog, store and services — one platform built with AI.
            <span className="inline-flex items-center gap-1 ml-1">
              <MapPin className="size-3" aria-hidden /> Calicut, Kerala
            </span>
          </p>

          {!done ? (
            <form onSubmit={subscribe} className="flex max-w-sm gap-2" aria-label="Newsletter signup">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <Input
                id="newsletter-email"
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10"
              />
              <Button type="submit" disabled={loading || !email} className="h-10 px-4">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                <span className="sr-only">Subscribe</span>
              </Button>
            </form>
          ) : (
            <p className="flex items-center gap-2 text-sm text-primary font-medium">
              <Check className="size-4" /> You&apos;re on the list — welcome aboard!
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <LiveBadge />
            <div className="flex items-center gap-1">
              {SOCIALS.slice(0, 6).map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.name} (opens in new tab)`}
                  className="grid place-items-center size-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <SocialIcon name={s.icon} className="size-[17px]" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Explore */}
        <nav aria-label="Footer explore">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Explore</p>
          <ul className="space-y-2.5 text-sm">
            {[
              ['Blog', '/blog'], ['Store', '/store'], ['Services', '/services'],
              ['About', '/about'], ['Ventures', '/ventures'], ['Contact', '/contact'],
              ['Search', '/search'], ['Help Center', '/help'],
              ...(user ? [['My Account', '/account'], ['Support', '/support']] : [['Sign In', '/login']]),
              ...(isAdmin(user) ? [['Admin Dashboard', '/admin']] : []),
            ].map(([label, path]) => (
              <li key={path}>
                <button onClick={() => navigate(path)} className="text-muted-foreground hover:text-primary transition-colors">
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Ventures */}
        <nav aria-label="Footer ventures">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Ventures</p>
          <ul className="space-y-2.5 text-sm">
            {VENTURES.map((v) => (
              <li key={v.name}>
                {v.href ? (
                  <a href={v.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    {v.name}
                  </a>
                ) : (
                  <button onClick={() => navigate('/ventures')} className="text-muted-foreground hover:text-primary transition-colors">
                    {v.name}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Legal */}
        <nav aria-label="Footer legal">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Legal</p>
          <ul className="space-y-2.5 text-sm max-h-64 overflow-y-auto scrollbar-slim pr-2">
            {LEGAL_DOCS.map((doc) => (
              <li key={doc.slug}>
                <button
                  onClick={() => navigate(`/legal/${doc.slug}`)}
                  className="text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  {doc.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Mohammed Nihad KP · KP Foundation · All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span className="inline-block size-1.5 rounded-full bg-primary" aria-hidden />
            Built with AI, from Calicut to the world.
          </p>
        </div>
      </div>
    </footer>
  )
}
