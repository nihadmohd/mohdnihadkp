'use client'

// Onboarding — 3 quick steps after first sign-in (name check → interests → done)
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Loader2, Sparkles, Newspaper, Briefcase, ShoppingBag, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSeo } from '@/hooks/use-seo'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { useSession } from '@/components/site/site-context'
import { useToast } from '@/hooks/use-toast'

const INTERESTS = [
  { id: 'ai', label: 'AI & building with AI', icon: Sparkles },
  { id: 'blog', label: 'Articles & tutorials', icon: Newspaper },
  { id: 'services', label: 'Hiring for a project', icon: Briefcase },
  { id: 'store', label: 'Tools & deals', icon: ShoppingBag },
  { id: 'ventures', label: 'KP Foundation ventures', icon: UserRound },
]

export default function OnboardingView() {
  const { user, setUser } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [name, setName] = useState(user?.name || '')
  const [interests, setInterests] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  useSeo({ title: 'Welcome', description: 'Set up your account.', path: '/onboarding', noindex: true }, ['onboarding'])

  if (!user) {
    return (
      <div className="flex-1 grid place-items-center px-4 py-24 text-center">
        <div>
          <p className="text-muted-foreground">You need to be signed in first.</p>
          <Button className="mt-4" asChild><Link href="/login">Sign in</Link></Button>
        </div>
      </div>
    )
  }

  const finish = async (destination?: string) => {
    setSaving(true)
    try {
      await api('/api/account/profile', {
        method: 'PATCH',
        body: { name: name || user.name, onboarded: true },
      })
      setUser({ ...user, name: name || user.name, onboarded: true })
      toast({ title: `Welcome, ${name.split(' ')[0] || 'friend'}!`, description: 'Your account is ready.' })
      router.push(destination || '/')
    } catch (err) {
      toast({ title: 'Could not save', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    // Step 1 — name
    {
      title: `Welcome, ${user.name?.split(' ')[0] || 'friend'}!`,
      subtitle: 'Let\u2019s make this quick — 30 seconds and your account is fully set up. What should I call you?',
      body: (
        <div className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your preferred name"
            aria-label="Your name"
            className="h-12 text-base"
            autoFocus
          />
          <Button className="w-full h-11 glow-sm" onClick={() => setStep(1)} disabled={name.trim().length < 2}>
            Continue <ArrowRight className="size-4" />
          </Button>
        </div>
      ),
    },
    // Step 2 — interests
    {
      title: 'What brings you here?',
      subtitle: 'Pick anything you\u2019re interested in — I use this only to shape content. No spam, ever.',
      body: (
        <div className="space-y-5">
          <div className="grid gap-2">
            {INTERESTS.map((i) => {
              const active = interests.includes(i.id)
              return (
                <button
                  key={i.id}
                  onClick={() => setInterests((prev) => (active ? prev.filter((x) => x !== i.id) : [...prev, i.id]))}
                  className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                    active ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                  }`}
                  aria-pressed={active}
                >
                  <i.icon className={`size-4.5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium flex-1">{i.label}</span>
                  {active && <Check className="size-4 text-primary" />}
                </button>
              )
            })}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-11" onClick={() => setStep(0)}>Back</Button>
            <Button className="flex-1 h-11 glow-sm" onClick={() => setStep(2)}>
              {interests.length ? 'Finish' : 'Skip'} <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      ),
    },
    // Step 3 — done
    {
      title: 'You\u2019re all set! 🚀',
      subtitle: 'Your account is ready. Here are a few places to start:',
      body: (
        <div className="space-y-4">
          <div className="grid gap-2">
            {[
              ['/blog', 'Read the latest article', Newspaper],
              ['/services', 'Explore services', Briefcase],
              ['/', 'Back to home', Sparkles],
            ].map(([path, label, Icon]) => {
              const I = Icon as typeof Newspaper
              return (
                <button
                  key={path as string}
                  onClick={() => { finish(path as string); }}
                  className="flex items-center gap-3 rounded-xl border border-border p-3.5 text-left hover:border-primary/40 transition-colors"
                >
                  <I className="size-4.5 text-primary" />
                  <span className="text-sm font-medium flex-1">{label as string}</span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </button>
              )
            })}
          </div>
          <Button className="w-full h-11 glow-sm" onClick={() => finish()} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Complete setup
          </Button>
        </div>
      ),
    },
  ]

  const current = steps[step]

  return (
    <div className="relative flex-1 flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="absolute inset-0 grid-bg mask-fade-b opacity-25" aria-hidden />
      <div className="absolute -top-20 right-1/4 size-72 rounded-full bg-primary/10 blur-3xl animate-aurora" aria-hidden />
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-7 sm:p-8 shadow-xl shadow-black/5"
      >
        {/* Progress */}
        <div className="flex items-center gap-1.5 mb-6" aria-label={`Step ${step + 1} of 3`}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i <= step ? 'w-8 bg-primary' : 'w-4 bg-border'}`}
            />
          ))}
          <span className="ml-auto text-xs text-muted-foreground font-mono">{step + 1}/3</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{current.title}</h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{current.subtitle}</p>
        <div className="mt-6">{current.body}</div>
      </motion.div>
    </div>
  )
}
