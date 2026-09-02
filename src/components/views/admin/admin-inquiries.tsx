'use client'

// Admin inquiries — incoming client inquiries with status pipeline + reply shortcuts
import { useCallback, useEffect, useState } from 'react'
import {
  Inbox, Mail, MessageCircle, Trash2, Loader2, ChevronDown, Phone, Clock3,
  CheckCircle2, Reply, ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { EmptyView } from '@/components/views/states'

interface Inquiry {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  budget: string | null
  message: string
  status: string
  createdAt: string
  service: { title: string } | null
}

const STATUSES = ['ALL', 'NEW', 'READ', 'REPLIED', 'CLOSED']
const STATUS_STYLE: Record<string, string> = {
  NEW: 'bg-primary/15 text-primary border-primary/30',
  READ: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  REPLIED: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  CLOSED: 'bg-muted text-muted-foreground border-border',
}

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [status, setStatus] = useState('ALL')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (status !== 'ALL') params.set('status', status)
      const res = await api<{ inquiries: Inquiry[]; pages: number; counts: Record<string, number> }>(`/api/inquiries?${params}`)
      setInquiries(res.inquiries)
      setPages(res.pages)
      setCounts(res.counts)
    } catch (err) {
      toast({ title: 'Failed to load', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [status, page, toast])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const t = setInterval(load, 20000) // auto-refresh for new inquiries
    return () => clearInterval(t)
  }, [load])

  const mark = async (inquiry: Inquiry, newStatus: string) => {
    try {
      await api(`/api/inquiries/${inquiry.id}`, { method: 'PATCH', body: { status: newStatus } })
      setInquiries((prev) => prev.map((i) => (i.id === inquiry.id ? { ...i, status: newStatus } : i)))
      setCounts((c) => ({ ...c, [inquiry.status]: Math.max(0, (c[inquiry.status] || 0) - 1), [newStatus]: (c[newStatus] || 0) + 1 }))
    } catch (err) {
      toast({ title: 'Update failed', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const remove = async (inquiry: Inquiry) => {
    try {
      await api(`/api/inquiries/${inquiry.id}`, { method: 'DELETE' })
      setInquiries((prev) => prev.filter((i) => i.id !== inquiry.id))
      toast({ title: 'Inquiry deleted' })
    } catch (err) {
      toast({ title: 'Delete failed', description: (err as Error).message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">Client inquiries</h2>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <Clock3 className="size-3" /> auto-refreshes every 20s · live alerts on arrival
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1) }}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                status === s ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={status === s}
            >
              {s === 'ALL' ? `All (${Object.values(counts).reduce((a, b) => a + b, 0)})` : `${s} (${counts[s] || 0})`}
            </button>
          ))}
        </div>
      </div>

      {loading && inquiries.length === 0 ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : inquiries.length === 0 ? (
        <EmptyView
          title={status === 'ALL' ? 'No inquiries yet' : `No ${status.toLowerCase()} inquiries`}
          message="New inquiries from the services & contact forms land here instantly with a live alert."
          icon={<Inbox className="size-7 text-muted-foreground" />}
        />
      ) : (
        <ul className="space-y-2.5">
          {inquiries.map((iq) => {
            const open = expanded === iq.id
            return (
              <li key={iq.id} className={`rounded-2xl border bg-card transition-colors ${iq.status === 'NEW' ? 'border-primary/40' : 'border-border'}`}>
                <button
                  className="w-full p-4 flex items-center gap-3 text-left"
                  onClick={() => {
                    setExpanded(open ? null : iq.id)
                    if (!open && iq.status === 'NEW') mark(iq, 'READ')
                  }}
                  aria-expanded={open}
                >
                  <span className={`grid place-items-center size-10 rounded-xl shrink-0 font-semibold ${STATUS_STYLE[iq.status]}`}>
                    {iq.name[0].toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm truncate">{iq.name}</span>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[iq.status]}`}>{iq.status}</span>
                      {iq.service && <Badge variant="secondary" className="text-[10px]">{iq.service.title}</Badge>}
                    </span>
                    <span className="block text-[11px] text-muted-foreground mt-0.5 truncate">
                      {iq.subject || iq.message.slice(0, 60)}
                    </span>
                  </span>
                  <time className="text-[11px] text-muted-foreground shrink-0 hidden sm:block">
                    {new Date(iq.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </time>
                  <ChevronDown className={`size-4 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
                </button>

                {open && (
                  <div className="px-4 pb-4 pt-0 space-y-4 border-t border-border/40">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap pt-3">{iq.message}</p>
                    <div className="grid sm:grid-cols-3 gap-2 text-xs">
                      <a href={`mailto:${iq.email}?subject=${encodeURIComponent(`Re: ${iq.subject || 'your inquiry'}`)}`} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:border-primary/40 transition-colors">
                        <Mail className="size-3.5 text-primary shrink-0" /> <span className="truncate">{iq.email}</span>
                      </a>
                      {iq.phone && (
                        <a href={`https://api.whatsapp.com/send?phone=${iq.phone.replace(/\D/g, '')}&text=${encodeURIComponent(`Hello ${iq.name}, thanks for your inquiry!`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:border-primary/40 transition-colors">
                          <MessageCircle className="size-3.5 text-primary shrink-0" /> <span className="truncate">{iq.phone}</span>
                        </a>
                      )}
                      {iq.budget && (
                        <span className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                          <span className="font-semibold">Budget:</span> {iq.budget}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {iq.status !== 'REPLIED' && (
                        <Button size="sm" variant="outline" onClick={() => mark(iq, 'REPLIED')}>
                          <Reply className="size-3.5" /> Mark replied
                        </Button>
                      )}
                      {iq.status !== 'CLOSED' && (
                        <Button size="sm" variant="outline" onClick={() => mark(iq, 'CLOSED')}>
                          <CheckCircle2 className="size-3.5" /> Close
                        </Button>
                      )}
                      {iq.status !== 'NEW' && (
                        <Button size="sm" variant="ghost" onClick={() => mark(iq, 'NEW')}>Reopen as new</Button>
                      )}
                      <a href={`mailto:${iq.email}`} className="ml-auto">
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(iq)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </a>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span>Page {page} / {pages}</span>
          <Button variant="outline" size="sm" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
