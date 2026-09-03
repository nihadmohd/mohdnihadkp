'use client'

// Support — ticket list + new ticket + conversation thread
import { useCallback, useEffect, useState } from 'react'
import {
  LifeBuoy, Plus, Loader2, Send, MessageSquare, ChevronLeft, Clock3, CircleCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { useSession } from '@/components/site/site-context'
import { useSeo } from '@/hooks/use-seo'
import Link from 'next/link'
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
  createdAt: string
  messages: string
  thread?: { from: string; body: string; at: string }[]
  user?: { name: string | null; email: string }
}

const STATUS_VARIANT: Record<string, string> = {
  OPEN: 'bg-primary/15 text-primary border-primary/30',
  PENDING: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  RESOLVED: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  CLOSED: 'bg-muted text-muted-foreground border-border',
}

export default function SupportView() {
  const { user } = useSession()
  const { toast } = useToast()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [newOpen, setNewOpen] = useState(false)
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  useSeo({ title: 'Support', description: 'Get help — open a support ticket.', path: '/support', noindex: true }, ['support'])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api<{ tickets: Ticket[] }>('/api/support/tickets')
      setTickets(res.tickets)
    } catch { /* guard handles */ } finally {
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
          <p className="text-muted-foreground">Sign in to open and track support tickets.</p>
          <Button className="mt-4" asChild><Link href="/login">Sign in</Link></Button>
        </div>
      </div>
    )
  }

  const openTicket = async (t: Ticket) => {
    try {
      const res = await api<{ ticket: Ticket }>(`/api/support/tickets/${t.id}`)
      setSelected({ ...res.ticket, thread: res.ticket.thread || [] })
    } catch (err) {
      toast({ title: 'Could not open ticket', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const sendReply = async () => {
    if (!selected || reply.trim().length < 2 || sending) return
    setSending(true)
    try {
      const res = await api<{ ticket: Ticket }>(`/api/support/tickets/${selected.id}`, {
        method: 'POST',
        body: { message: reply.trim() },
      })
      setSelected({ ...res.ticket, thread: res.ticket.thread || [] })
      setReply('')
    } catch (err) {
      toast({ title: 'Could not send', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  const closeTicket = async () => {
    if (!selected) return
    try {
      await api(`/api/support/tickets/${selected.id}`, { method: 'PATCH', body: { status: 'CLOSED' } })
      const updated = { ...selected, status: 'CLOSED' }
      setSelected(updated)
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      toast({ title: 'Ticket closed', description: 'Reopen by replying again.' })
    } catch (err) {
      toast({ title: 'Could not close', description: (err as Error).message, variant: 'destructive' })
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-14 pb-24 lg:pb-14">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-3">
            <LifeBuoy className="size-7 text-primary" /> Support
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Real tickets, real replies — from me directly, usually within a day.</p>
        </div>
        <Button className="glow-sm shrink-0" onClick={() => setNewOpen(true)}>
          <Plus className="size-4" /> New ticket
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : tickets.length === 0 ? (
        <EmptyView
          title="No tickets yet"
          message="When something needs my attention, open a ticket and track the conversation here."
          icon={<MessageSquare className="size-7 text-muted-foreground" />}
          action={<Button onClick={() => setNewOpen(true)}><Plus className="size-4" /> Open your first ticket</Button>}
        />
      ) : (
        <ul className="space-y-3">
          {tickets.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => openTicket(t)}
                className="w-full text-left rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_VARIANT[t.status] || ''}`}>
                    {t.status === 'RESOLVED' || t.status === 'CLOSED' ? <CircleCheck className="size-3" /> : <Clock3 className="size-3" />}
                    {t.status}
                  </span>
                  <Badge variant="secondary" className="text-[11px] capitalize">{t.category}</Badge>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(t.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="font-semibold mt-2.5">{t.subject}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {(JSON.parse(t.messages || '[]')[0]?.body) || ''}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* New ticket dialog */}
      <NewTicketDialog open={newOpen} onClose={() => setNewOpen(false)} onCreated={load} />

      {/* Ticket thread dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto scrollbar-slim">
          {selected && (
            <>
              <DialogHeader>
                <button
                  onClick={() => setSelected(null)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-1"
                >
                  <ChevronLeft className="size-3.5" /> All tickets
                </button>
                <DialogTitle className="pr-8">{selected.subject}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_VARIANT[selected.status] || ''}`}>
                    {selected.status}
                  </span>
                  <Badge variant="secondary" className="text-[11px] capitalize">{selected.category}</Badge>
                  <span>priority: {selected.priority}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 my-2">
                {(selected.thread || []).map((m, i) => (
                  <div key={i} className={`rounded-2xl p-4 ${m.from === 'admin' ? 'bg-primary/10 border border-primary/25' : 'bg-muted/60 border border-border'}`}>
                    <p className="text-xs font-semibold mb-1.5 flex items-center gap-2">
                      {m.from === 'admin' ? 'Nihad (support)' : 'You'}
                      <time className="font-normal text-muted-foreground">
                        {new Date(m.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </time>
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.body}</p>
                  </div>
                ))}
              </div>

              {selected.status !== 'CLOSED' ? (
                <div className="space-y-2.5 pt-2 border-t border-border">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Write a reply…"
                    rows={3}
                    aria-label="Reply"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={closeTicket}>Close ticket</Button>
                    <Button size="sm" onClick={sendReply} disabled={sending || reply.trim().length < 2}>
                      {sending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />} Send reply
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  This ticket is closed. Reply below to reopen it.
                  <Textarea className="mt-3" value={reply} onChange={(e) => setReply(e.target.value)} rows={2} aria-label="Reopen reply" />
                  <Button size="sm" className="mt-2" onClick={sendReply} disabled={sending || reply.trim().length < 2}>
                    <Send className="size-3.5" /> Reopen with a reply
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function NewTicketDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('general')
  const [priority, setPriority] = useState('normal')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return
    setSending(true)
    try {
      await api('/api/support/tickets', {
        method: 'POST',
        body: { subject, category, priority, message },
      })
      toast({ title: 'Ticket created', description: 'I\u2019ll reply as soon as I see it — track it right here.' })
      onCreated()
      onClose()
      setSubject(''); setMessage('')
    } catch (err) {
      toast({ title: 'Could not create', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>New support ticket</DialogTitle>
            <DialogDescription>Describe the issue — the more detail, the faster the fix.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-5">
            <div className="space-y-1.5">
              <Label htmlFor="tk-subject">Subject *</Label>
              <Input id="tk-subject" required minLength={4} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Short summary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['general', 'account', 'billing', 'technical', 'content', 'legal'].map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['low', 'normal', 'high', 'urgent'].map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tk-message">Details *</Label>
              <Textarea id="tk-message" required minLength={10} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What happened? What did you expect? Any steps to reproduce…" />
            </div>
          </div>
          <DialogFooter className="mt-5">
            <Button type="submit" className="w-full h-11" disabled={sending}>
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Create ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
