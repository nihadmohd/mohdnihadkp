'use client'

// Admin submissions inbox — EVERY form a visitor fills, with full
// contact details (name / email / phone) so Nihad can reach out
// directly. Covers contact, service inquiries, newsletter signups,
// comments and more. Cross-table totals are shown per type.
import { useCallback, useEffect, useState } from 'react'
import {
  Inbox, Loader2, ChevronRight, ChevronDown, Mail, Phone, MapPin, FileText,
  CheckCircle2, Circle, CircleCheck, Download, ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { EmptyView } from '@/components/views/states'

interface SubmissionRow {
  id: string
  formType: string
  name: string | null
  email: string | null
  phone: string | null
  subject: string | null
  message: string | null
  data: string
  page: string | null
  status: string // NEW | READ | DONE
  createdAt: string
}

const TYPE_META: Record<string, { icon: typeof Inbox; label: string; cls: string }> = {
  contact: { icon: Mail, label: 'Contact', cls: 'bg-primary/12 text-primary' },
  'service-inquiry': { icon: FileText, label: 'Service inquiry', cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  inquiry: { icon: FileText, label: 'Inquiry', cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  newsletter: { icon: Inbox, label: 'Newsletter', cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  comment: { icon: FileText, label: 'Comment', cls: 'bg-purple-500/15 text-purple-600 dark:text-purple-400' },
  support: { icon: FileText, label: 'Support', cls: 'bg-red-500/15 text-red-600 dark:text-red-400' },
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  NEW: { label: 'New', cls: 'bg-primary/15 text-primary border-primary/30' },
  READ: { label: 'Read', cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  DONE: { label: 'Done', cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [byType, setByType] = useState<Array<{ type: string; count: number }>>([])
  const [newCount, setNewCount] = useState(0)
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '30' })
      if (type) params.set('type', type)
      if (status) params.set('status', status)
      const res = await api<{
        submissions: SubmissionRow[]
        total: number
        pages: number
        byType: Array<{ type: string; count: number }>
        byStatus: Array<{ status: string; count: number }>
      }>(`/api/submissions?${params}`)
      setSubmissions(res.submissions)
      setTotal(res.total)
      setPages(res.pages)
      setByType(Array.isArray(res.byType) ? res.byType : [])
      setNewCount(
        Array.isArray(res.byStatus)
          ? res.byStatus.find((s) => s.status === 'NEW')?.count ?? 0
          : 0
      )
    } catch (err) {
      toast({ title: 'Failed to load', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [page, type, status, toast])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [type, status])

  const setStatusFor = async (sub: SubmissionRow, next: string) => {
    try {
      await api(`/api/submissions/${sub.id}`, { method: 'PATCH', body: { status: next } })
      setSubmissions((prev) => prev.map((s) => (s.id === sub.id ? { ...s, status: next } : s)))
      toast({ title: `Marked as ${next.toLowerCase()}`, description: sub.subject || sub.formType })
    } catch (err) {
      toast({ title: 'Could not update', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const exportCsv = () => {
    const rows = [['type', 'name', 'email', 'phone', 'subject', 'message', 'page', 'status', 'date']]
    for (const s of submissions) {
      rows.push([
        s.formType, s.name || '', s.email || '', s.phone || '', s.subject || '',
        (s.message || '').replace(/\n/g, ' '), s.page || '', s.status,
        new Date(s.createdAt).toISOString(),
      ])
    }
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `form-submissions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalNew = newCount

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">Consultation inbox</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Every form visitors fill — contact, service inquiries, newsletter, comments — with their contact details in one place.
          </p>
        </div>
        <div className="flex gap-2">
          {totalNew > 0 && (
            <Badge className="bg-primary/15 text-primary border-primary/30 gap-1">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" /> {totalNew} new
            </Badge>
          )}
          <Button size="sm" variant="outline" onClick={exportCsv}>
            <Download className="size-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Type + status filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-slim pb-1" role="group" aria-label="Filter by form type">
          <button
            onClick={() => setType('')}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              type === '' ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
            }`}
            aria-pressed={type === ''}
          >
            All ({total})
          </button>
          {byType.map(({ type: t, count: c }) => (
            <button
              key={t}
              onClick={() => setType(type === t ? '' : t)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                type === t ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={type === t}
            >
              {(TYPE_META[t]?.label || t).toLowerCase()} ({c})
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1.5" role="group" aria-label="Filter by status">
          {['', 'NEW', 'READ', 'DONE'].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setStatus(s)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                status === s ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={status === s}
            >
              {s ? STATUS_META[s]?.label : 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading && submissions.length === 0 ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : submissions.length === 0 ? (
        <EmptyView
          title="Inbox zero"
          message="No submissions yet. Every contact form, service inquiry, newsletter signup and comment will land here with full contact details."
          icon={<Inbox className="size-7 text-muted-foreground" />}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <ul className="divide-y divide-border/40">
            {submissions.map((s) => {
              const meta = TYPE_META[s.formType] || TYPE_META.contact
              const statusMeta = STATUS_META[s.status] || STATUS_META.NEW
              const isOpen = expanded === s.id
              let extra: Record<string, unknown> = {}
              try { extra = JSON.parse(s.data || '{}') } catch { /* ignore */ }
              return (
                <li key={s.id} className={s.status === 'NEW' ? 'bg-primary/[0.03]' : ''}>
                  <button
                    onClick={() => {
                      setExpanded(isOpen ? null : s.id)
                      if (!isOpen && s.status === 'NEW') setStatusFor(s, 'READ')
                    }}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className={`grid place-items-center size-9 rounded-xl shrink-0 ${meta.cls}`}>
                      <meta.icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold truncate">{s.name || s.email || 'Anonymous'}</span>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusMeta.cls}`}>
                          {statusMeta.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground capitalize">{meta.label}</span>
                      </span>
                      <span className="block text-xs text-muted-foreground truncate mt-0.5">
                        {s.subject || (s.message ? s.message.slice(0, 90) : s.email || '—')}
                      </span>
                      <span className="block text-[10px] text-muted-foreground/70 mt-0.5">
                        {timeAgo(s.createdAt)}{s.page ? ` · from ${s.page}` : ''}
                      </span>
                    </span>
                    {isOpen ? <ChevronDown className="size-4 text-muted-foreground shrink-0" aria-hidden /> : <ChevronRight className="size-4 text-muted-foreground shrink-0" aria-hidden />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 space-y-3">
                      {/* Contact details — the point of the inbox */}
                      <div className="flex flex-wrap gap-2">
                        {s.email && (
                          <a
                            href={`mailto:${s.email}?subject=${encodeURIComponent(`Re: ${s.subject || 'your message'}`)}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                          >
                            <Mail className="size-3.5" aria-hidden /> {s.email}
                          </a>
                        )}
                        {s.phone && (
                          <a
                            href={`tel:${s.phone.replace(/\s+/g, '')}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          >
                            <Phone className="size-3.5" aria-hidden /> {s.phone}
                          </a>
                        )}
                        {s.phone && s.phone.replace(/\D+/g, '').length >= 10 && (
                          <a
                            href={`https://wa.me/${s.phone.replace(/\D+/g, '')}?text=${encodeURIComponent(`Hi ${s.name || ''}, thanks for reaching out to MN.KP!`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#25D366]/40 bg-[#25D366]/10 px-3 py-1.5 text-xs font-medium text-[#1a9c53] dark:text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                          >
                            <ExternalLink className="size-3.5" aria-hidden /> WhatsApp
                          </a>
                        )}
                      </div>

                      {s.subject && <p className="text-sm font-medium">{s.subject}</p>}
                      {s.message && (
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap rounded-xl bg-muted/50 p-3.5">
                          {s.message}
                        </p>
                      )}

                      {/* Extra structured data (budget, service, etc.) */}
                      {Object.keys(extra).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(extra).map(([k, v]) => (
                            v != null && v !== '' && typeof v !== 'object' && (
                              <span key={k} className="rounded-lg border border-border bg-card px-2.5 py-1 text-[11px]">
                                <span className="text-muted-foreground capitalize">{k}:</span> <span className="font-medium">{String(v)}</span>
                              </span>
                            )
                          ))}
                        </div>
                      )}

                      {/* Status actions */}
                      <div className="flex items-center gap-2 pt-1">
                        {s.status !== 'READ' && s.status !== 'DONE' && (
                          <Button size="sm" variant="outline" className="h-8" onClick={() => setStatusFor(s, 'READ')}>
                            <Circle className="size-3.5" /> Mark read
                          </Button>
                        )}
                        {s.status !== 'DONE' && (
                          <Button size="sm" variant="outline" className="h-8 hover:border-emerald-500/50 hover:text-emerald-600" onClick={() => setStatusFor(s, 'DONE')}>
                            <CheckCircle2 className="size-3.5" /> Mark done
                          </Button>
                        )}
                        {s.status === 'DONE' && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <CircleCheck className="size-4" aria-hidden /> Handled
                          </span>
                        )}
                        <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="size-3" aria-hidden /> {new Date(s.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
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
