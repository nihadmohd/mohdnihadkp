'use client'

// Admin support — all tickets with reply + status management
import { useCallback, useEffect, useState } from 'react'
import {
  LifeBuoy, Loader2, Send, Clock3, CircleCheck, ChevronDown, MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { EmptyView } from '@/components/views/states'

interface Ticket {
  id: string
  subject: string
  category: string
  priority: string
  status: string
  updatedAt: string
  messages: string
  thread?: { from: string; body: string; at: string }[]
  user: { name: string | null; email: string } | null
}

const STATUS_STYLE: Record<string, string> = {
  OPEN: 'bg-primary/15 text-primary border-primary/30',
  PENDING: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  RESOLVED: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  CLOSED: 'bg-muted text-muted-foreground border-border',
}
const STATUSES = ['OPEN', 'PENDING', 'RESOLVED', 'CLOSED']

export default function AdminSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api<{ tickets: Ticket[] }>('/api/support/tickets?all=true&limit=30')
      setTickets(res.tickets)
    } catch (err) {
      toast({ title: 'Failed to load tickets', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const openTicket = async (t: Ticket) => {
    if (expanded === t.id) {
      setExpanded(null)
      return
    }
    try {
      const res = await api<{ ticket: Ticket }>(`/api/support/tickets/${t.id}`)
      setExpanded(t.id)
      setTickets((prev) => prev.map((x) => (x.id === t.id ? { ...x, thread: res.ticket.thread || [] } : x)))
    } catch (err) {
      toast({ title: 'Could not open', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const sendReply = async (t: Ticket) => {
    if (reply.trim().length < 2 || sending) return
    setSending(true)
    try {
      const res = await api<{ ticket: Ticket }>(`/api/support/tickets/${t.id}`, {
        method: 'POST',
        body: { message: reply.trim() },
      })
      setTickets((prev) => prev.map((x) => (x.id === t.id ? { ...x, ...res.ticket, thread: res.ticket.thread || [] } : x)))
      setReply('')
      toast({ title: 'Reply sent', description: `The user sees it in their ticket thread.` })
    } catch (err) {
      toast({ title: 'Could not send', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  const setStatus = async (t: Ticket, status: string) => {
    try {
      await api(`/api/support/tickets/${t.id}`, { method: 'PATCH', body: { status } })
      setTickets((prev) => prev.map((x) => (x.id === t.id ? { ...x, status } : x)))
    } catch (err) {
      toast({ title: 'Update failed', description: (err as Error).message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight">Support tickets</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {tickets.filter((t) => t.status === 'OPEN').length} open · {tickets.length} total
        </p>
      </div>

      {loading && tickets.length === 0 ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : tickets.length === 0 ? (
        <EmptyView
          title="No support tickets"
          message="Member tickets from the Support page appear here for you to reply and resolve."
          icon={<LifeBuoy className="size-7 text-muted-foreground" />}
        />
      ) : (
        <ul className="space-y-2.5">
          {tickets.map((t) => {
            const open = expanded === t.id
            return (
              <li key={t.id} className="rounded-2xl border border-border bg-card">
                <button className="w-full p-4 flex items-center gap-3 text-left" onClick={() => openTicket(t)} aria-expanded={open}>
                  <span className="grid place-items-center size-9 rounded-xl bg-muted text-muted-foreground shrink-0">
                    <MessageSquare className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm truncate">{t.subject}</span>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[t.status]}`}>{t.status}</span>
                      <Badge variant="secondary" className="text-[10px] capitalize">{t.priority}</Badge>
                    </span>
                    <span className="block text-[11px] text-muted-foreground mt-0.5 truncate">
                      {t.user?.name || t.user?.email || 'member'} · {new Date(t.updatedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                  <ChevronDown className={`size-4 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
                </button>

                {open && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border/40">
                    <div className="space-y-2.5 pt-3">
                      {(t.thread || []).map((m, i) => (
                        <div key={i} className={`rounded-xl p-3.5 text-sm ${m.from === 'admin' ? 'bg-primary/10 border border-primary/25' : 'bg-muted/60 border border-border'}`}>
                          <p className="text-xs font-semibold mb-1">
                            {m.from === 'admin' ? 'You (support)' : t.user?.name || 'Member'}
                            <time className="ml-2 font-normal text-muted-foreground">
                              {new Date(m.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </time>
                          </p>
                          <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {STATUSES.filter((s) => s !== t.status).map((s) => (
                        <Button key={s} size="sm" variant="outline" onClick={() => setStatus(t, s)}>
                          {s === 'RESOLVED' || s === 'CLOSED' ? <CircleCheck className="size-3.5" /> : <Clock3 className="size-3.5" />}
                          Mark {s.toLowerCase()}
                        </Button>
                      ))}
                    </div>

                    <div className="flex gap-2 items-end">
                      <Textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Reply to the member…"
                        rows={2}
                        aria-label="Reply"
                        className="flex-1"
                      />
                      <Button size="sm" onClick={() => sendReply(t)} disabled={sending || reply.trim().length < 2} className="h-10">
                        {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Reply
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
