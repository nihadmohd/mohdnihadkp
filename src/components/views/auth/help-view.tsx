'use client'

// Help Center — searchable FAQ + quick guides + escalation paths
import { useState, useMemo } from 'react'
import {
  CircleHelp, ChevronDown, MessageCircle, LifeBuoy, Search, BookOpen, CreditCard,
  UserRound, ShoppingBag, Newspaper,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSeo } from '@/hooks/use-seo'
import { navigate } from '@/hooks/use-hash-router'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { InquiryDialog } from '@/components/views/services-view'
import { HELP_FAQS as FAQS, HELP_CATEGORIES as CATEGORIES } from '@/lib/help-faqs'

export default function HelpView() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const { toast } = useToast()

  useSeo(
    { title: 'Help Center — FAQ, Account & Support', description: 'Frequently asked questions about MN.KP services, accounts, billing and the affiliate store — answered directly.', path: '/help' },
    ['help']
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return FAQS.filter(
      (f) =>
        (category === 'All' || f.category === category) &&
        (!q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
    )
  }, [query, category])

  const subscribe = async (e: React.FormEvent) => {
    const form = e.target as HTMLFormElement
    const email = (new FormData(form).get('email') as string) || ''
    e.preventDefault()
    try {
      await api('/api/subscribers', { method: 'POST', body: { email } })
      toast({ title: 'Subscribed', description: 'New articles land in your inbox first.' })
      form.reset()
    } catch (err) {
      toast({ title: 'Could not subscribe', description: (err as Error).message, variant: 'destructive' })
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-14 pb-24 lg:pb-14">
      <div className="text-center mb-9">
        <span className="mx-auto grid place-items-center size-14 rounded-2xl bg-primary/12 text-primary mb-4">
          <CircleHelp className="size-7" />
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-lg mx-auto">
          Answers about services, accounts, billing and the store — in plain language.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the help center…"
          className="pl-10 h-11 rounded-xl"
          aria-label="Search FAQs"
        />
      </div>

      {/* Category chips */}
      <div className="flex justify-center gap-1.5 mb-8 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              category === c ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
            }`}
            aria-pressed={category === c}
          >
            {c}
          </button>
        ))}
      </div>

      {/* FAQs */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-medium text-sm">No answers match &ldquo;{query}&rdquo;</p>
          <p className="text-xs text-muted-foreground mt-1.5">Try different words — or just ask me directly.</p>
          <Button size="sm" className="mt-4" onClick={() => setInquiryOpen(true)}>Ask a question</Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((f, i) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-border bg-card overflow-hidden"
              style={{ animation: `fadeIn 0.4s ${Math.min(i * 0.03, 0.3)}s both` }}
            >
              <summary className="flex items-center gap-3 p-4 sm:p-5 cursor-pointer list-none">
                <ChevronDown className="size-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" aria-hidden />
                <span className="font-medium text-sm sm:text-[15px] flex-1">{f.q}</span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground border rounded-full px-2 py-0.5 shrink-0 hidden sm:inline">{f.category}</span>
              </summary>
              <div className="px-4 sm:px-5 pb-5 pl-11 sm:pl-13 text-sm text-muted-foreground leading-relaxed">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      )}

      {/* Still stuck? */}
      <div className="mt-10 grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <LifeBuoy className="size-5 text-primary mb-3" />
          <p className="font-semibold text-sm">Still stuck?</p>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed mb-4">Open a support ticket — tracked, with a reply from me directly.</p>
          <Button size="sm" variant="outline" onClick={() => navigate('/support')}>Open a ticket</Button>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <MessageCircle className="size-5 text-primary mb-3" />
          <p className="font-semibold text-sm">Quick questions</p>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed mb-4">WhatsApp is fastest for quick pre-project questions.</p>
          <a href="https://api.whatsapp.com/send?phone=919846750898&text=Hello...!" target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline">WhatsApp me</Button>
          </a>
        </div>
      </div>

      {/* Newsletter */}
      <div className="mt-8 rounded-2xl border border-primary/25 bg-primary/5 p-6 text-center">
        <p className="font-semibold text-sm flex items-center justify-center gap-2">
          <BookOpen className="size-4 text-primary" /> Never miss a new article
        </p>
        <form onSubmit={subscribe} className="flex gap-2 max-w-sm mx-auto mt-4">
          <label htmlFor="help-email" className="sr-only">Email</label>
          <Input id="help-email" type="email" name="email" required placeholder="you@email.com" className="h-10" />
          <Button type="submit" className="h-10">Notify me</Button>
        </form>
      </div>

      {inquiryOpen && <InquiryDialog onClose={() => setInquiryOpen(false)} presetSubject="Question from Help Center" />}
    </div>
  )
}
