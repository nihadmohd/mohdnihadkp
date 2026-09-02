'use client'

// Admin subscribers — newsletter list with CSV export
import { useCallback, useEffect, useState } from 'react'
import { MailCheck, Download, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { EmptyView } from '@/components/views/states'

interface Sub {
  id: string
  email: string
  name: string | null
  source: string
  createdAt: string
}

export default function AdminSubscribers() {
  const [subs, setSubs] = useState<Sub[]>([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '30' })
      const res = await api<{ subscribers: Sub[]; pages: number; total: number }>(`/api/subscribers?${params}`)
      setSubs(res.subscribers)
      setPages(res.pages)
      setTotal(res.total)
    } catch (err) {
      toast({ title: 'Failed to load', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [page, toast])

  useEffect(() => { load() }, [load])

  const exportCsv = async () => {
    try {
      const res = await api<{ subscribers: Sub[] }>('/api/subscribers?limit=100&page=1')
      const rows = [['email', 'name', 'source', 'joined']]
      for (const s of res.subscribers) {
        rows.push([s.email, s.name || '', s.source, new Date(s.createdAt).toISOString()])
      }
      const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast({ title: 'Exported', description: `${res.subscribers.length} subscribers → CSV` })
    } catch (err) {
      toast({ title: 'Export failed', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const filtered = subs.filter((s) => !query || s.email.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">Newsletter subscribers</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{total} emails on the list</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" aria-hidden />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter…" className="pl-9 h-9 w-40" aria-label="Filter subscribers" />
          </div>
          <Button size="sm" variant="outline" onClick={exportCsv}>
            <Download className="size-4" /> Export CSV
          </Button>
        </div>
      </div>

      {loading && subs.length === 0 ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyView
          title="No subscribers yet"
          message="The newsletter form lives in the footer — subscribers collect here with a live alert on each signup."
          icon={<MailCheck className="size-7 text-muted-foreground" />}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <ul className="divide-y divide-border/40">
            {filtered.map((s) => (
              <li key={s.id} className="flex items-center gap-3 p-3.5 text-sm">
                <span className="grid place-items-center size-8 rounded-lg bg-primary/12 text-primary shrink-0">
                  <MailCheck className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium truncate">{s.email}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {s.name || 'anonymous'} · joined {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </span>
                <Badge variant="secondary" className="text-[10px] shrink-0">{s.source}</Badge>
              </li>
            ))}
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
