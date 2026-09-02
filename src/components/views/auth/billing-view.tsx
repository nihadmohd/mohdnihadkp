'use client'

// Billing — plans, upgrade/downgrade/cancel + payment success/pending/failed states
import { useCallback, useEffect, useState } from 'react'
import {
  Check, Crown, Rocket, Zap, Loader2, ArrowUpRight, ArrowDownRight, Ban,
  CircleCheck, Clock3, XCircle, CreditCard, Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useSession } from '@/components/site/site-context'
import { useSeo } from '@/hooks/use-seo'
import { navigate } from '@/hooks/use-hash-router'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

interface Plan {
  code: string
  name: string
  priceMonthly: number
  currency: string
  features: string
}

interface Subscription {
  plan: string
  planName: string
  renewsAt: string | null
  features: string[]
  priceMonthly: number
  currency: string
}

const PLAN_ICONS: Record<string, typeof Zap> = { FREE: Zap, PRO: Rocket, BUSINESS: Crown }

function PlanIcon({ code }: { code: string }) {
  const Icon = PLAN_ICONS[code] || Zap
  return <Icon className="size-6" />
}

export default function BillingView() {
  const { user, refresh } = useSession()
  const { toast } = useToast()
  const [plans, setPlans] = useState<Plan[]>([])
  const [sub, setSub] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<Plan | null>(null)
  const [paymentState, setPaymentState] = useState<{ outcome: 'success' | 'pending' | 'failed'; plan?: string; message: string } | null>(null)
  const [busy, setBusy] = useState(false)

  useSeo({ title: 'Billing & Plans', description: 'Manage your subscription plan.', path: '/billing', noindex: true }, ['billing'])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, s] = await Promise.all([
        api<{ plans: Plan[] }>('/api/billing/plans'),
        api<{ subscription: Subscription }>('/api/billing/subscription'),
      ])
      setPlans(p.plans)
      setSub(s.subscription)
    } catch { /* guard below */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) load()
  }, [user, load])

  if (!user) {
    return (
      <div className="flex-1 grid place-items-center px-4 py-24 text-center">
        <div>
          <p className="text-muted-foreground">Sign in to manage your subscription.</p>
          <Button className="mt-4" onClick={() => navigate('/login')}>Sign in</Button>
        </div>
      </div>
    )
  }

  const currentPlan = sub?.plan || 'FREE'

  const doAction = async (plan: Plan) => {
    if (busy) return
    setBusy(true)
    setPending(null)
    try {
      // Demo flow: simulate a gateway result first
      const sim = await api<{ outcome: 'success' | 'pending' | 'failed'; message: string }>(
        '/api/billing/subscription',
        { method: 'POST', body: { action: 'simulate-payment' } }
      )
      const res = await api<{ status: string; message: string; plan?: string }>('/api/billing/subscription', {
        method: 'POST',
        body: { action: plan.code === 'FREE' ? 'downgrade' : 'upgrade', plan: plan.code, outcome: sim.outcome },
      })
      setPaymentState({ outcome: res.status === 'failed' || res.status === 'pending' ? res.status as 'pending' | 'failed' : 'success', plan: plan.code, message: res.message })
      if (res.status === 'success') await load()
      refresh()
    } catch (err) {
      toast({ title: 'Billing error', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  const cancel = async () => {
    setBusy(true)
    try {
      const res = await api<{ message: string }>('/api/billing/subscription', {
        method: 'POST',
        body: { action: 'cancel' },
      })
      toast({ title: 'Subscription cancelled', description: res.message })
      await load()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 sm:py-14 pb-24 lg:pb-14">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-2">Billing</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Choose your plan</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Membership plans currently run in demonstration mode — no real charges occur.
          Paid features activate when live billing switches on.
        </p>
      </div>

      {/* Current plan status */}
      {sub && !paymentState && (
        <Card className="mb-8 border-primary/25 bg-gradient-to-r from-primary/8 via-card to-transparent">
          <CardContent className="p-5 sm:p-6 flex flex-wrap items-center gap-5">
            <span className="grid place-items-center size-12 rounded-2xl bg-primary/12 text-primary">
              <PlanIcon code={sub.plan} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-uppercase tracking-wide text-muted-foreground uppercase text-[11px] font-semibold">Current plan</p>
              <p className="font-display font-bold text-xl">{sub.planName}</p>
              {sub.renewsAt && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Renews {new Date(sub.renewsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
            {currentPlan !== 'FREE' && (
              <Button variant="outline" onClick={cancel} disabled={busy}>
                <Ban className="size-4" /> Cancel subscription
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment outcome states */}
      {paymentState && (
        <Card className={`mb-8 ${paymentState.outcome === 'success' ? 'border-primary/40' : paymentState.outcome === 'pending' ? 'border-amber-500/40' : 'border-destructive/40'}`}>
          <CardContent className="p-6 sm:p-8 text-center">
            <span className={`mx-auto grid place-items-center size-16 rounded-2xl ${
              paymentState.outcome === 'success' ? 'bg-primary/15 text-primary'
              : paymentState.outcome === 'pending' ? 'bg-amber-500/15 text-amber-500'
              : 'bg-destructive/15 text-destructive'
            }`}>
              {paymentState.outcome === 'success' ? <CircleCheck className="size-8" />
              : paymentState.outcome === 'pending' ? <Clock3 className="size-8" />
              : <XCircle className="size-8" />}
            </span>
            <h2 className="font-display text-xl font-bold mt-4">
              {paymentState.outcome === 'success' ? 'Payment successful' : paymentState.outcome === 'pending' ? 'Payment pending' : 'Payment failed'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">{paymentState.message}</p>
            <div className="mt-5 flex justify-center gap-3">
              <Button variant="outline" onClick={() => setPaymentState(null)}>Close</Button>
              {paymentState.outcome !== 'success' && (
                <Button onClick={() => { setPaymentState(null) }}>Try again</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans grid */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <Card key={i}><CardContent className="p-6 h-56 animate-pulse bg-muted/30 rounded-2xl" /></Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const Icon = PLAN_ICONS[plan.code] || Zap
            const isCurrent = plan.code === currentPlan
            const isUpgrade = ['FREE', 'PRO', 'BUSINESS'].indexOf(plan.code) > ['FREE', 'PRO', 'BUSINESS'].indexOf(currentPlan)
            const features = plan.features.split('|').filter(Boolean)
            return (
              <Card
                key={plan.code}
                className={`relative flex flex-col ${plan.code === 'PRO' ? 'border-primary/40 shadow-lg shadow-primary/10' : ''} ${isCurrent ? 'ring-2 ring-primary/50' : ''}`}
              >
                {plan.code === 'PRO' && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 gap-1">
                    <Sparkles className="size-3" /> Most popular
                  </Badge>
                )}
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <span className="grid place-items-center size-11 rounded-xl bg-primary/12 text-primary">
                      <Icon className="size-5.5" />
                    </span>
                    {isCurrent && <Badge variant="secondary" className="text-primary">Current</Badge>}
                  </div>
                  <p className="font-display font-bold text-lg mt-4">{plan.name}</p>
                  <p className="mt-1">
                    <span className="font-display text-3xl font-bold">
                      {plan.priceMonthly === 0 ? 'Free' : `₹${plan.priceMonthly}`}
                    </span>
                    {plan.priceMonthly > 0 && <span className="text-sm text-muted-foreground"> /month</span>}
                  </p>
                  <ul className="mt-5 space-y-2.5 flex-1">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="size-4 text-primary shrink-0 mt-0.5" aria-hidden />
                        <span className="text-foreground/90">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`mt-6 w-full ${plan.code === 'PRO' ? 'glow-sm' : ''}`}
                    variant={plan.code === 'PRO' ? 'default' : 'outline'}
                    disabled={isCurrent || busy}
                    onClick={() => doAction(plan)}
                  >
                    {busy ? <Loader2 className="size-4 animate-spin" />
                    : isCurrent ? <Check className="size-4" />
                    : isUpgrade ? <ArrowUpRight className="size-4" />
                    : <ArrowDownRight className="size-4" />}
                    {isCurrent ? 'Your current plan' : isUpgrade ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Notes */}
      <div className="mt-10 rounded-2xl border border-border bg-card p-6 space-y-4">
        <p className="text-sm font-semibold flex items-center gap-2"><CreditCard className="size-4 text-primary" /> Payment &amp; billing notes</p>
        <ul className="text-sm text-muted-foreground space-y-2.5 leading-relaxed">
          <li>• <span className="text-foreground font-medium">Demo mode:</span> upgrade flows simulate a payment gateway — outcomes (success / pending / failed) are random so you can see each state.</li>
          <li>• <span className="text-foreground font-medium">Production:</span> connect Stripe or Razorpay (UPI for India) in the billing API route; the same states map to real webhook events.</li>
          <li>• Cancellations keep access until the end of the paid period — no surprise cut-offs. See the Refund Policy for money-back windows.</li>
          <li>• All plan features already work on the site today — membership is about extras (resources, priority queue, consultation calls).</li>
        </ul>
      </div>
    </div>
  )
}
